from datetime import datetime, time, timedelta, timezone

from sqlalchemy import select

from medtrack.extensions import db
from medtrack.models import (Caregiver, DoseLog, DoseSchedule, Medication,
                             MedicationAudit, Prescription, Reminder, User)
from medtrack.reminders import adherence, process_reminders


def signup(post, account):
    assert post('/api/auth/signup', account).status_code == 201


def seed_schedule(app, account, scheduled_time=None):
    with app.app_context():
        user = db.session.scalar(select(User).where(User.email == account['email']))
        prescription = Prescription(user_id=user.id, extraction_status='confirmed', source='manual', confirmed_data={})
        medication = Medication(user_id=user.id, prescription=prescription, medicine_name='Test medicine', dosage='1 tablet', frequency='daily')
        schedule = DoseSchedule(medication=medication, scheduled_time=scheduled_time or datetime.now().time().replace(second=0, microsecond=0))
        db.session.add(schedule); db.session.commit(); return schedule.id


def test_timezone_schedule_states_and_adherence(app, client, post, account):
    signup(post, account); schedule_id = seed_schedule(app, account)
    response = client.get('/api/schedule'); assert response.status_code == 200
    item = response.json['data']['schedules'][0]
    assert item['timezone'] == 'Asia/Kolkata' and item['status'] == 'Upcoming'
    assert post('/api/profile/timezone', {'timezone': 'America/New_York'}).status_code == 200
    assert post(f'/api/schedules/{schedule_id}/push', {'minutes': 15}).json['data']['dose']['status'] == 'Delayed'
    taken = post(f'/api/take/{schedule_id}', {'status': 'Taken'})
    assert taken.status_code == 200 and taken.json['data']['dose']['status'] in ('Taken', 'Delayed')
    report = client.get('/api/reports').json['data']
    assert 'definition' in report['adherence'] and report['adherence']['completed'] == 1


def test_skip_update_delete_and_notifications(app, client, post, account):
    signup(post, account); schedule_id = seed_schedule(app, account)
    assert post(f'/api/schedules/{schedule_id}', {'time': '08:30'}).status_code == 200
    assert post(f'/api/take/{schedule_id}', {'status': 'Skipped'}).json['data']['dose']['status'] == 'Skipped'
    assert client.get('/api/notifications').status_code == 200
    token = client.get('/api/auth/me').json['data']['csrf_token']
    deleted = client.delete(f'/api/schedules/{schedule_id}', headers={'X-CSRF-Token': token})
    assert deleted.status_code == 200


def test_caregiver_requires_explicit_consent(client, post, account):
    signup(post, account)
    created = post('/api/caregivers', {'name': 'Care Person', 'email': 'care@example.com',
        'relationship': 'Sibling', 'patient_consent': False, 'notification_preference': 'email'})
    caregiver_id = created.json['data']['caregiver']['id']
    assert client.get('/api/caregivers').json['data']['caregivers'][0]['patient_consent'] is False
    assert post(f'/api/caregivers/{caregiver_id}/consent', {'consent': True}).status_code == 200


def test_reminder_delivery_failure_is_logged(app, client, post, account):
    signup(post, account)
    schedule_id = seed_schedule(app, account, (datetime.now() - timedelta(minutes=1)).time().replace(second=0, microsecond=0))
    with app.app_context():
        process_reminders()
        reminder = db.session.scalar(select(Reminder).where(Reminder.schedule_id == schedule_id))
        assert reminder and reminder.delivery_status == 'failed' and reminder.sent_at is not None


def test_adherence_formula(app):
    now = datetime.now(timezone.utc)
    logs = [DoseLog(schedule_id=1, scheduled_at=now - timedelta(hours=1), status=status,
                    taken_at=now if status in ('Taken', 'Delayed') else None)
            for status in ('Taken', 'Delayed', 'Missed', 'Skipped')]
    with app.app_context():
        result = adherence(logs, now)
    assert result['percentage'] == 25.0 and result['completed'] == 4 and result['on_time'] == 1


def test_admin_apis_and_dosage_audit(app, client, post, account):
    signup(post, account); seed_schedule(app, account)
    with app.app_context():
        user = db.session.scalar(select(User).where(User.email == account['email'])); user.role = 'admin'; db.session.commit()
        medication_id = db.session.scalar(select(Medication.id))
    assert client.get('/api/admin/overview').status_code == 200
    changed = post(f'/api/admin/medications/{medication_id}', {'changes': {'dosage': '2 tablets'}, 'reason': 'Corrected from signed prescription'})
    assert changed.status_code == 200 and changed.json['data']['audit_records'] == 1
    with app.app_context():
        audit = db.session.scalar(select(MedicationAudit)); assert audit.previous_value == '1 tablet' and audit.new_value == '2 tablets'


def test_phase3_admin_and_patient_routes_require_auth(client, csrf):
    for path in ('/api/notifications', '/api/caregivers', '/api/admin/overview', '/api/admin/users',
                 '/api/admin/medications', '/api/admin/schedules', '/api/admin/notifications',
                 '/api/admin/prescriptions', '/api/admin/failed-jobs'):
        assert client.get(path).status_code == 401
    assert client.post('/api/schedules/1/push', json={}, headers={'X-CSRF-Token': csrf}).status_code == 401
