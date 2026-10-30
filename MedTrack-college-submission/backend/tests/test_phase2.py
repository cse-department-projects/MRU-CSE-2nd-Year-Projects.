import io
import json
from types import SimpleNamespace

import pytest
from PIL import Image
from sqlalchemy import select

from medtrack import groq_service
from medtrack.extensions import db
from medtrack.models import DoseSchedule, Medication, Prescription


DRAFT = {
    'medicine_name': 'Amoxicillin', 'dosage': 'One capsule', 'strength': '500 mg',
    'frequency': 'Twice daily', 'duration': '5 days', 'special_instructions': 'After food',
    'suggested_times': ['08:00', '20:00'], 'raw_prescription_text': 'Amoxicillin 500 mg',
    'unclear_fields': [], 'needs_review': True,
}


def image_bytes(fmt='PNG'):
    output = io.BytesIO()
    Image.new('RGB', (16, 16), 'white').save(output, format=fmt)
    return output.getvalue()


@pytest.fixture
def signed_in(post, account):
    assert post('/api/auth/signup', account).status_code == 201


def scan(client, csrf, content, filename='prescription.png'):
    return client.post('/api/scan', data={'file': (io.BytesIO(content), filename)},
                       content_type='multipart/form-data', headers={'X-CSRF-Token': csrf})


def test_scan_requires_authentication(client, csrf):
    response = scan(client, csrf, image_bytes())
    assert response.status_code == 401


@pytest.mark.parametrize('content,filename,code', [
    (b'not an image', 'prescription.jpg', 'invalid_image'),
    (image_bytes('BMP'), 'prescription.jpg', 'unsupported_image'),
    (b'', 'prescription.png', 'empty_file'),
])
def test_invalid_files(client, post, account, content, filename, code):
    post('/api/auth/signup', account)
    token = client.get('/api/auth/me').json['data']['csrf_token']
    response = scan(client, token, content, filename)
    assert response.status_code == 400
    assert response.json['error']['code'] == code


def test_oversized_file(client, post, account):
    post('/api/auth/signup', account)
    token = client.get('/api/auth/me').json['data']['csrf_token']
    response = scan(client, token, b'x' * ((10 * 1024 * 1024) + 1))
    assert response.status_code == 413


def test_missing_api_key_returns_editable_manual_fallback(client, post, account, app):
    post('/api/auth/signup', account)
    token = client.get('/api/auth/me').json['data']['csrf_token']
    response = scan(client, token, image_bytes())
    assert response.status_code == 201
    assert response.json['data']['warning']['code'] == 'groq_not_configured'
    assert response.json['data']['prescription']['status'] == 'draft'
    assert response.json['data']['prescription']['extraction']['medicines'][0]['medicine_name'] is None
    with app.app_context():
        record = db.session.scalar(select(Prescription))
        assert record.extraction_status == 'draft'
        assert record.image_path != 'prescription.png'


def test_groq_timeout(client, post, account, app, monkeypatch):
    post('/api/auth/signup', account)
    token = client.get('/api/auth/me').json['data']['csrf_token']
    app.config['GROQ_API_KEY'] = 'test-key'
    monkeypatch.setattr(groq_service, 'extract_prescription',
                        lambda *_: (_ for _ in ()).throw(groq_service.ExtractionTimeout('Timed out.')))
    response = scan(client, token, image_bytes())
    assert response.status_code == 201
    assert response.json['data']['warning']['code'] == 'groq_timeout'
    assert response.json['data']['prescription']['status'] == 'draft'


def test_suggested_times_are_normalized_without_manual_edit(app):
    from medtrack.schemas import PrescriptionDraft
    values = {**DRAFT, 'suggested_times': ['5:00', '5:00 PM', '08:30']}
    with app.app_context():
        draft = PrescriptionDraft.model_validate(values)
    assert draft.suggested_times == ['05:00', '17:00', '08:30']


@pytest.mark.parametrize('content', ['not-json', '', json.dumps({})])
def test_invalid_or_empty_ai_json(app, monkeypatch, content):
    app.config['GROQ_API_KEY'] = 'test-key'
    completion = SimpleNamespace(choices=[] if content == '' else [SimpleNamespace(
        message=SimpleNamespace(content=content))])
    fake_client = SimpleNamespace(chat=SimpleNamespace(completions=SimpleNamespace(create=lambda **_: completion)))
    monkeypatch.setattr(groq_service, 'Groq', lambda **_: fake_client)
    with app.app_context(), pytest.raises(groq_service.InvalidExtraction):
        groq_service.extract_prescription(image_bytes(), 'image/png')


def test_scan_confirm_schedule_reports_and_take(client, post, account, app, monkeypatch):
    post('/api/auth/signup', account)
    token = client.get('/api/auth/me').json['data']['csrf_token']
    app.config['GROQ_API_KEY'] = 'test-key'
    monkeypatch.setattr(groq_service, 'extract_prescription', lambda *_: DRAFT.copy())
    scanned = scan(client, token, image_bytes(), '../../unsafe-name.png')
    assert scanned.status_code == 201
    prescription = scanned.json['data']['prescription']
    assert prescription['status'] == 'draft'
    assert client.get('/api/schedule').json['data']['schedules'] == []
    assert client.get(prescription['image_url']).status_code == 200

    payload = {**DRAFT, 'medicine_name': '<img src=x onerror=alert(1)>', 'confirmed': False}
    refused = post(f"/api/prescriptions/{prescription['id']}/confirm", payload)
    assert refused.status_code == 400
    payload['confirmed'] = True
    confirmed = post(f"/api/prescriptions/{prescription['id']}/confirm", payload)
    assert confirmed.status_code == 200
    assert confirmed.json['data']['schedule_count'] == 2
    assert post(f"/api/prescriptions/{prescription['id']}/confirm", payload).status_code == 409

    schedule = client.get('/api/schedule').json['data']['schedules']
    assert len(schedule) == 2
    assert schedule[0]['medicine_name'] == '<img src=x onerror=alert(1)>'
    schedule_id = schedule[0]['id']
    assert post(f'/api/schedule/{schedule_id}/time', {'time': '09:15'}).status_code == 200
    assert post(f'/api/take/{schedule_id}', {}).json['data']['schedule']['completed'] is True
    assert client.get('/api/schedule').json['data']['schedules'][0]['completed'] is True
    reports = client.get('/api/reports').json['data']['prescriptions']
    assert reports[0]['status'] == 'confirmed'
    with app.app_context():
        assert db.session.scalar(select(Medication)).medicine_name.startswith('<img')
        assert len(db.session.scalars(select(DoseSchedule)).all()) == 2


def test_confirmation_required_fields_and_ownership(client, post, account, app):
    post('/api/auth/signup', account)
    manual = post('/api/prescriptions/manual', {
        'medicine_name': None, 'dosage': None, 'strength': None, 'frequency': None,
        'duration': None, 'special_instructions': None, 'suggested_times': [],
        'raw_prescription_text': None, 'unclear_fields': [], 'needs_review': True,
    })
    prescription_id = manual.json['data']['prescription']['id']
    response = post(f'/api/prescriptions/{prescription_id}/confirm', {
        'medicine_name': None, 'dosage': None, 'strength': None, 'frequency': None,
        'duration': None, 'special_instructions': None, 'suggested_times': [],
        'raw_prescription_text': None, 'unclear_fields': [], 'needs_review': True, 'confirmed': True,
    })
    assert response.status_code == 400
    assert {'medicine_name', 'dosage', 'frequency', 'suggested_times'} <= set(response.json['error']['fields'])
    post('/api/auth/logout', {})
    other = {**account, 'username': 'other_user', 'email': 'other@example.com'}
    post('/api/auth/signup', other)
    assert client.get(f'/api/prescriptions/{prescription_id}/image').status_code == 404
    assert post(f'/api/prescriptions/{prescription_id}/confirm', {**DRAFT, 'confirmed': True}).status_code == 404


@pytest.mark.parametrize('method,path', [
    ('get', '/api/reports'), ('get', '/api/schedule'), ('post', '/api/prescriptions/manual'),
    ('post', '/api/prescriptions/1/confirm'), ('post', '/api/schedule/1/time'), ('post', '/api/take/1'),
])
def test_phase2_endpoints_require_authentication(client, csrf, method, path):
    response = getattr(client, method)(path, json={}, headers={'X-CSRF-Token': csrf})
    assert response.status_code == 401
