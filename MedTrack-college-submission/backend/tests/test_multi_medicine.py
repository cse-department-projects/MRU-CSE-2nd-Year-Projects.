from datetime import datetime, timedelta

from sqlalchemy import select

from medtrack.extensions import db
from medtrack.groq_service import frequency_slots
from medtrack.models import DoseSchedule, Medication, Reminder
from medtrack.reminders import process_reminders


def medicine(identifier, name, times, frequency='Once daily'):
    return {'medicine_id': identifier, 'medicine_name': name, 'strength': '10 mg', 'dosage': '1 tablet',
            'frequency': frequency, 'duration': '5 days', 'special_instructions': 'After food',
            'start_date': None, 'end_date': None,
            'dose_times': [{'period': period, 'time': value, 'enabled': True} for period, value in times],
            'needs_review': True}


def auth(client, post, account):
    assert post('/api/auth/signup', account).status_code == 201


def create_draft(post, medicines):
    response = post('/api/prescriptions/manual', {'medicines': medicines, 'raw_prescription_text': None,
                    'unclear_fields': [], 'needs_review': True})
    assert response.status_code == 201
    return response.json['data']['prescription']['id']


def test_three_medicines_keep_independent_times_and_survive_refresh(app, client, post, account):
    auth(client, post, account)
    medicines = [medicine('amox', 'Amoxicillin', [('morning', '08:00'), ('night', '21:00')], '1 morning, 1 night'),
                 medicine('vitd', 'Vitamin D', [('morning', '09:30')]),
                 medicine('zinc', 'Zinc', [('custom', '14:15')])]
    prescription_id = create_draft(post, medicines)
    confirmed = post(f'/api/prescriptions/{prescription_id}/confirm', {
        'medicines': medicines, 'raw_prescription_text': None, 'unclear_fields': [],
        'needs_review': True, 'confirmed': True})
    assert confirmed.status_code == 200
    assert confirmed.json['data']['medication_count'] == 3 and confirmed.json['data']['schedule_count'] == 4
    first = client.get('/api/schedule').json['data']['schedules']
    second = client.get('/api/schedule').json['data']['schedules']
    assert [(x['medicine_name'], x['time']) for x in first] == [(x['medicine_name'], x['time']) for x in second]
    assert {('Amoxicillin', '08:00'), ('Amoxicillin', '21:00'), ('Vitamin D', '09:30'), ('Zinc', '14:15')} == {
        (x['medicine_name'], x['time']) for x in first}


def test_changing_one_schedule_does_not_change_another(client, post, account):
    auth(client, post, account)
    meds = [medicine('one', 'One', [('morning', '08:00')]), medicine('two', 'Two', [('morning', '08:00')])]
    prescription_id = create_draft(post, meds)
    post(f'/api/prescriptions/{prescription_id}/confirm', {'medicines': meds, 'raw_prescription_text': None,
        'unclear_fields': [], 'needs_review': True, 'confirmed': True})
    schedules = client.get('/api/schedule').json['data']['schedules']; target = next(x for x in schedules if x['medicine_name'] == 'One')
    token = client.get('/api/auth/me').json['data']['csrf_token']
    changed = client.put(f"/api/schedules/{target['id']}", json={'time': '10:45', 'period': 'custom'}, headers={'X-CSRF-Token': token})
    assert changed.status_code == 200
    updated = client.get('/api/schedule').json['data']['schedules']
    assert next(x for x in updated if x['medicine_name'] == 'One')['time'] == '10:45'
    assert next(x for x in updated if x['medicine_name'] == 'Two')['time'] == '08:00'
    taken = post(f"/api/schedules/{target['id']}/taken", {'status': 'Taken'})
    assert taken.status_code == 200 and taken.json['data']['schedule']['completed'] is True


def test_frequency_mapping_and_unclear_frequency():
    assert [x['period'] for x in frequency_slots('1-0-1')] == ['morning', 'night']
    assert [x['period'] for x in frequency_slots('1-1-1')] == ['morning', 'afternoon', 'night']
    assert all(not x['enabled'] for x in frequency_slots('twice daily'))
    assert frequency_slots('as directed') == []


def test_each_dose_creates_only_one_reminder(app, client, post, account):
    auth(client, post, account)
    due = (datetime.now() - timedelta(minutes=1)).strftime('%H:%M')
    meds = [medicine('one', 'One', [('custom', due)]), medicine('two', 'Two', [('custom', due)])]
    prescription_id = create_draft(post, meds)
    post(f'/api/prescriptions/{prescription_id}/confirm', {'medicines': meds, 'raw_prescription_text': None,
        'unclear_fields': [], 'needs_review': True, 'confirmed': True})
    with app.app_context():
        process_reminders(); process_reminders()
        reminders = db.session.scalars(select(Reminder)).all()
        assert len(reminders) == 2
        assert {item.schedule.medication.medicine_name for item in reminders} == {'One', 'Two'}
