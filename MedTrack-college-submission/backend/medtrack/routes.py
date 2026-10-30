import secrets
from datetime import datetime, time, timezone, timedelta
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
from pathlib import Path
from functools import wraps

from flask import Blueprint, current_app, request, send_file, session
from flask_login import current_user, login_required, login_user, logout_user
from pydantic import ValidationError
from sqlalchemy import func, or_, select
from sqlalchemy.exc import IntegrityError
from werkzeug.security import check_password_hash, generate_password_hash

from .extensions import db, limiter
from . import groq_service
from .models import (Caregiver, DoseLog, DoseSchedule, JobFailure, Medication,
                     MedicationAudit, Prescription, Reminder, User, iso, utcnow)
from .reminders import adherence, as_utc, classify, ensure_occurrence, patient_zone, process_reminders
from .responses import fail, ok
from .schemas import (ConfirmationRequest, PrescriptionDraft, PrescriptionMedicinesConfirmation,
                      PrescriptionMedicinesDraft, normalize_clock)
from .uploads import UploadError, store_image, validate_image
from .validation import validate_signup

api = Blueprint('api', __name__, url_prefix='/api')
DUMMY_HASH = generate_password_hash('dummy-password-for-timing-only')


def csrf_token():
    if 'csrf_token' not in session:
        session['csrf_token'] = secrets.token_urlsafe(32)
    return session['csrf_token']


def start_session(user):
    session.clear()
    login_user(user, remember=False)
    session.permanent = True
    return {'authenticated': True, 'user': user.to_dict(), 'csrf_token': csrf_token()}


def admin_required(view):
    @wraps(view)
    @login_required
    def wrapped(*args, **kwargs):
        if current_user.role != 'admin':
            return fail('forbidden', 'Administrator access required.', 403)
        return view(*args, **kwargs)
    return wrapped


@api.get('/auth/me')
def me():
    return ok({'authenticated': current_user.is_authenticated,
               'user': current_user.to_dict() if current_user.is_authenticated else None,
               'csrf_token': csrf_token()})


@api.post('/auth/signup')
@limiter.limit('5 per minute')
def signup():
    values, errors = validate_signup(request.get_json())
    if errors:
        return fail('validation_error', 'Please check your details.', 400, errors)
    user = User(username=values['username'], email=values['email'], phone=values['phone'])
    user.set_password(values['password'])
    db.session.add(user)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return fail('account_exists', 'An account with that username or email already exists.', 409)
    return ok(start_session(user), 201)


@api.post('/auth/login')
@limiter.limit('10 per minute')
def login():
    payload = request.get_json()
    identity = payload.get('username', '')
    password = payload.get('password', '')
    if not isinstance(identity, str) or not isinstance(password, str) or not identity.strip() or len(identity) > 254 or not 1 <= len(password) <= 128:
        return fail('validation_error', 'Enter your username or email and password.', 400)
    identity = identity.strip().lower()
    user = db.session.scalar(select(User).where(or_(User.username == identity, User.email == identity)))
    valid_password = check_password_hash(user.password_hash if user else DUMMY_HASH, password)
    if not user or not valid_password or not user.active:
        return fail('invalid_credentials', 'Invalid username/email or password.', 401)
    return ok(start_session(user))


@api.post('/auth/logout')
@login_required
def logout():
    logout_user()
    session.clear()
    return ok({'authenticated': False})


@api.get('/patient/dashboard')
@login_required
def dashboard():
    return ok({'user': current_user.to_dict(), 'phase': 3,
               'message': 'Review prescription drafts and track confirmed doses.'})


@api.get('/admin')
@admin_required
def admin():
    return ok({'user': current_user.to_dict(), 'phase': 3,
               'message': 'Administrator access verified.'})


def owned_prescription(prescription_id):
    return db.session.scalar(select(Prescription).where(
        Prescription.id == prescription_id, Prescription.user_id == current_user.id))


@api.post('/scan')
@login_required
@limiter.limit('10 per hour')
def scan():
    try:
        content, mime_type, extension = validate_image(
            request.files.get('file'), current_app.config['MAX_UPLOAD_MB'] * 1024 * 1024)
    except UploadError as error:
        return fail(error.code, str(error), error.status)
    filename = store_image(content, extension, current_app.config['UPLOAD_FOLDER'])
    prescription = Prescription(user_id=current_user.id, image_path=filename, mime_type=mime_type,
                                extraction_status='processing', source='image')
    db.session.add(prescription)
    db.session.commit()
    try:
        extraction = groq_service.extract_prescription(content, mime_type)
        prescription.ai_result = extraction
        prescription.extraction_status = 'draft'
        db.session.commit()
    except groq_service.ExtractionError as error:
        # Keep the uploaded prescription usable when the external AI provider is
        # unavailable. The user can safely complete this blank, unverified draft
        # by reading the original image and entering the medicine details.
        prescription.ai_result = {
            'medicines': [{
                'medicine_id': 'medicine-1', 'medicine_name': None, 'strength': None,
                'dosage': None, 'frequency': None, 'duration': None,
                'special_instructions': None, 'start_date': None, 'end_date': None,
                'dose_times': [{'period': 'custom', 'time': '08:00', 'enabled': True}],
                'needs_review': True,
            }],
            'raw_prescription_text': None,
            'unclear_fields': ['AI extraction unavailable; enter all fields manually.'],
            'needs_review': True,
        }
        prescription.extraction_status = 'draft'
        prescription.extraction_error = str(error)[:255]
        db.session.commit()
        return ok({'prescription': prescription.to_dict(), 'warning': {
            'code': error.code,
            'message': 'Automatic extraction is temporarily unavailable. Enter the medicine details manually from the uploaded prescription.',
        }}, 201)
    return ok({'prescription': prescription.to_dict()}, 201)


@api.post('/prescriptions/manual')
@login_required
def manual_prescription():
    payload = request.get_json()
    if 'medicines' not in payload:
        payload = {'medicines': [{'medicine_id': 'medicine-1', 'medicine_name': payload.get('medicine_name'),
            'strength': payload.get('strength'), 'dosage': payload.get('dosage'), 'frequency': payload.get('frequency'),
            'duration': payload.get('duration'), 'special_instructions': payload.get('special_instructions'),
            'start_date': None, 'end_date': None, 'dose_times': [], 'needs_review': True}],
            'raw_prescription_text': payload.get('raw_prescription_text'), 'unclear_fields': [], 'needs_review': True}
    try: draft = PrescriptionMedicinesDraft.model_validate(payload)
    except ValidationError as error:
        return fail('validation_error', 'Check the manual medicine fields.', 400,
                    {'.'.join(map(str, item['loc'])): item['msg'] for item in error.errors()})
    prescription = Prescription(user_id=current_user.id, ai_result=draft.model_dump(mode='json'),
                                extraction_status='draft', source='manual')
    db.session.add(prescription)
    db.session.commit()
    return ok({'prescription': prescription.to_dict()}, 201)


@api.get('/prescriptions/<int:prescription_id>')
@login_required
def get_prescription(prescription_id):
    prescription = owned_prescription(prescription_id)
    if not prescription: return fail('not_found', 'Prescription not found.', 404)
    return ok({'prescription': prescription.to_dict()})


@api.put('/prescriptions/<int:prescription_id>/medications')
@login_required
def update_prescription_medications(prescription_id):
    prescription = owned_prescription(prescription_id)
    if not prescription: return fail('not_found', 'Prescription draft not found.', 404)
    if prescription.extraction_status != 'draft': return fail('invalid_status', 'Only a draft can be edited.', 409)
    try: draft = PrescriptionMedicinesDraft.model_validate(request.get_json())
    except ValidationError as error:
        return fail('validation_error', 'Check each medicine and dose time.', 400,
                    {'.'.join(map(str, item['loc'])): item['msg'] for item in error.errors()})
    prescription.ai_result = draft.model_dump(mode='json'); db.session.commit()
    return ok({'prescription': prescription.to_dict()})


@api.get('/prescriptions/<int:prescription_id>/image')
@login_required
def prescription_image(prescription_id):
    prescription = owned_prescription(prescription_id)
    if not prescription or not prescription.image_path:
        return fail('not_found', 'Prescription image not found.', 404)
    path = Path(current_app.config['UPLOAD_FOLDER']) / Path(prescription.image_path).name
    if not path.is_file():
        return fail('not_found', 'Prescription image not found.', 404)
    return send_file(path, mimetype=prescription.mime_type, conditional=True, max_age=0)


@api.post('/prescriptions/<int:prescription_id>/confirm')
@login_required
def confirm_prescription(prescription_id):
    prescription = owned_prescription(prescription_id)
    if not prescription:
        return fail('not_found', 'Prescription draft not found.', 404)
    if prescription.extraction_status != 'draft':
        return fail('invalid_status', 'Only an unconfirmed draft can be confirmed.', 409)
    payload = request.get_json()
    if 'medicines' in payload:
        try: confirmation = PrescriptionMedicinesConfirmation.model_validate(payload)
        except ValidationError as error:
            return fail('validation_error', 'Check each medicine and dose time.', 400,
                        {'.'.join(map(str, item['loc'])): item['msg'] for item in error.errors()})
        errors = confirmation.required_errors()
        if errors: return fail('validation_error', 'Complete every medicine and confirm the draft.', 400, errors)
        data = confirmation.model_dump(mode='json', exclude={'confirmed'})
        schedule_count = 0; medication_ids = []
        for medicine_data in data['medicines']:
            medication = Medication(user_id=current_user.id, prescription=prescription,
                medicine_name=medicine_data['medicine_name'], dosage=medicine_data['dosage'],
                strength=medicine_data['strength'], frequency=medicine_data['frequency'],
                duration=medicine_data['duration'], special_instructions=medicine_data['special_instructions'],
                start_date=datetime.strptime(medicine_data['start_date'], '%Y-%m-%d').date() if medicine_data['start_date'] else None,
                end_date=datetime.strptime(medicine_data['end_date'], '%Y-%m-%d').date() if medicine_data['end_date'] else None)
            db.session.add(medication)
            for slot in medicine_data['dose_times']:
                if not slot['enabled']: continue
                db.session.add(DoseSchedule(medication=medication, scheduled_time=time.fromisoformat(slot['time']),
                    period=slot['period'], timezone=current_user.timezone, enabled=True))
                schedule_count += 1
            medication_ids.append(medication)
        prescription.confirmed_data = data; prescription.extraction_status = 'confirmed'; prescription.confirmed_at = utcnow()
        db.session.commit()
        return ok({'prescription': prescription.to_dict(), 'medication_ids': [x.id for x in medication_ids],
                   'medication_count': len(medication_ids), 'schedule_count': schedule_count})
    try:
        confirmation = ConfirmationRequest.model_validate(request.get_json())
    except ValidationError as error:
        return fail('validation_error', 'Check the prescription fields.', 400,
                    {'.'.join(map(str, item['loc'])): item['msg'] for item in error.errors()})
    errors = confirmation.required_errors()
    if errors:
        return fail('validation_error', 'Complete the required fields and confirm the draft.', 400, errors)
    data = confirmation.model_dump(mode='json', exclude={'confirmed'})
    medication = Medication(
        user_id=current_user.id, prescription=prescription,
        medicine_name=data['medicine_name'], dosage=data['dosage'], strength=data['strength'],
        frequency=data['frequency'], duration=data['duration'],
        special_instructions=data['special_instructions'])
    db.session.add(medication)
    for value in data['suggested_times']:
        db.session.add(DoseSchedule(medication=medication, scheduled_time=time.fromisoformat(value)))
    prescription.confirmed_data = data
    prescription.extraction_status = 'confirmed'
    prescription.confirmed_at = datetime.now(timezone.utc)
    db.session.commit()
    return ok({'prescription': prescription.to_dict(), 'medication_id': medication.id,
               'schedule_count': len(medication.schedules)})


@api.get('/reports')
@login_required
def reports():
    prescriptions = db.session.scalars(select(Prescription).where(
        Prescription.user_id == current_user.id).order_by(Prescription.uploaded_at.desc())).all()
    logs = db.session.scalars(select(DoseLog).join(DoseSchedule).join(Medication).where(
        Medication.user_id == current_user.id).order_by(DoseLog.scheduled_at.desc())).all()
    for item in logs:
        item.status = classify(item)
    db.session.commit()
    return ok({'prescriptions': [item.to_dict() for item in prescriptions],
               'adherence': adherence(logs), 'dose_history': [dose_dict(item) for item in logs[:100]]})


def owned_schedule(schedule_id):
    return db.session.scalar(select(DoseSchedule).join(Medication).where(
        DoseSchedule.id == schedule_id, Medication.user_id == current_user.id))


def current_occurrence(item):
    return ensure_occurrence(item, utcnow().astimezone(patient_zone(current_user)).date())


def dose_dict(item):
    return {'id': item.id, 'schedule_id': item.schedule_id, 'scheduled_at': iso(item.scheduled_at),
            'status': item.status, 'taken_at': iso(item.taken_at), 'sent_at': iso(item.sent_at),
            'delivery_status': item.delivery_status, 'error_message': item.error_message}


def schedule_dict(item):
    occurrence = current_occurrence(item); occurrence.status = classify(occurrence)
    local_at = as_utc(occurrence.scheduled_at).astimezone(patient_zone(current_user))
    return {'id': item.id, 'medication_id': item.medication_id,
            'medicine_name': item.medication.medicine_name, 'dosage': item.medication.dosage,
            'strength': item.medication.strength, 'frequency': item.medication.frequency,
            'special_instructions': item.medication.special_instructions,
            'time': item.scheduled_time.strftime('%H:%M'), 'timezone': current_user.timezone,
            'period': item.period, 'enabled': item.enabled,
            'start_date': item.medication.start_date.isoformat() if item.medication.start_date else None,
            'end_date': item.medication.end_date.isoformat() if item.medication.end_date else None,
            'scheduled_at': iso(occurrence.scheduled_at), 'local_scheduled_at': local_at.isoformat(),
            'status': occurrence.status, 'completed': occurrence.status in ('Taken', 'Delayed', 'Skipped'),
            'active': item.active}


@api.get('/schedule')
@login_required
def schedule():
    schedules = db.session.scalars(select(DoseSchedule).join(Medication).where(
        Medication.user_id == current_user.id, DoseSchedule.active.is_(True), DoseSchedule.enabled.is_(True)).order_by(DoseSchedule.scheduled_time)).all()
    result = [schedule_dict(item) for item in schedules]; db.session.commit()
    logs = [current_occurrence(item) for item in schedules]
    return ok({'schedules': result, 'adherence': adherence(logs), 'timezone': current_user.timezone})


@api.post('/schedule/<int:schedule_id>/time')
@login_required
def update_schedule_time(schedule_id):
    item = owned_schedule(schedule_id)
    if not item:
        return fail('not_found', 'Dose schedule not found.', 404)
    value = request.get_json().get('time')
    if not isinstance(value, str):
        return fail('validation_error', 'Enter a time in HH:MM format.', 400, {'time': 'Required.'})
    try:
        item.scheduled_time = time.fromisoformat(normalize_clock(value))
    except ValueError:
        return fail('validation_error', 'Enter a recognizable time such as 05:00 or 5:00 PM.', 400,
                    {'time': 'Use a clock time such as 05:00 or 5:00 PM.'})
    db.session.commit()
    return ok({'schedule': {'id': item.id, 'time': item.scheduled_time.strftime('%H:%M'), 'timezone': current_user.timezone}})


@api.route('/schedules/<int:schedule_id>', methods=['POST', 'PUT'])
@login_required
def update_schedule(schedule_id):
    item = owned_schedule(schedule_id)
    if not item: return fail('not_found', 'Dose schedule not found.', 404)
    payload = request.get_json(); value = payload.get('time')
    if not isinstance(value, str): return fail('validation_error', 'Enter a time in HH:MM format.', 400, {'time': 'Required.'})
    try: item.scheduled_time = time.fromisoformat(normalize_clock(value))
    except ValueError: return fail('validation_error', 'Use a recognizable time such as 05:00 or 5:00 PM.', 400, {'time': 'Invalid time.'})
    period = payload.get('period', item.period)
    if period not in ('morning', 'afternoon', 'evening', 'night', 'custom'):
        return fail('validation_error', 'Invalid dose period.', 400, {'period': 'Invalid period.'})
    item.period = period; item.timezone = current_user.timezone; item.next_reminder_at = None
    db.session.commit(); return ok({'schedule': schedule_dict(item)})


@api.delete('/schedules/<int:schedule_id>')
@login_required
def delete_schedule(schedule_id):
    item = owned_schedule(schedule_id)
    if not item: return fail('not_found', 'Dose schedule not found.', 404)
    item.active = False; db.session.commit(); return ok({'id': item.id, 'deleted': True})


@api.post('/schedules/<int:schedule_id>/push')
@login_required
def push_schedule(schedule_id):
    item = owned_schedule(schedule_id)
    if not item: return fail('not_found', 'Dose schedule not found.', 404)
    payload = request.get_json(); minutes = payload.get('minutes', 15)
    if not isinstance(minutes, int) or not 5 <= minutes <= 240:
        return fail('validation_error', 'Delay must be between 5 and 240 minutes.', 400, {'minutes': 'Invalid delay.'})
    occurrence = current_occurrence(item)
    if occurrence.status in ('Taken', 'Skipped'): return fail('invalid_status', 'Completed doses cannot be delayed.', 409)
    occurrence.status = 'Delayed'
    occurrence.error_message = f'Reminder pushed by {minutes} minutes.'
    db.session.commit()
    return ok({'dose': dose_dict(occurrence)})


@api.post('/take/<int:schedule_id>')
@login_required
def take_dose(schedule_id):
    item = owned_schedule(schedule_id)
    if not item:
        return fail('not_found', 'Dose schedule not found.', 404)
    payload = request.get_json(); requested = payload.get('status', 'Taken')
    if requested not in ('Taken', 'Skipped'):
        return fail('validation_error', 'Status must be Taken or Skipped.', 400, {'status': 'Invalid state.'})
    occurrence = current_occurrence(item); now = utcnow()
    if requested == 'Skipped': occurrence.status = 'Skipped'; occurrence.taken_at = None
    else:
        window = timedelta(minutes=current_app.config['ON_TIME_WINDOW_MINUTES'])
        occurrence.status = 'Taken' if abs(now - as_utc(occurrence.scheduled_at)) <= window else 'Delayed'
        occurrence.taken_at = now
    item.last_taken_date = now.astimezone(patient_zone(current_user)).date()
    db.session.commit()
    return ok({'schedule': {'id': item.id, 'completed': True, 'taken_on': item.last_taken_date.isoformat(),
                            'status': occurrence.status}, 'dose': dose_dict(occurrence)})


@api.post('/schedules/<int:schedule_id>/taken')
@login_required
def take_schedule_dose(schedule_id):
    return take_dose.__wrapped__(schedule_id) if hasattr(take_dose, '__wrapped__') else take_dose(schedule_id)


@api.get('/notifications')
@login_required
def notifications():
    items = db.session.scalars(select(Reminder).join(DoseSchedule).join(Medication).where(
        Medication.user_id == current_user.id).order_by(Reminder.scheduled_at.desc()).limit(100)).all()
    return ok({'notifications': [{'id': x.id, 'schedule_id': x.schedule_id, 'scheduled_at': iso(x.scheduled_at),
        'status': x.status, 'sent_at': iso(x.sent_at), 'delivery_status': x.delivery_status,
        'error_message': x.error_message, 'recipient': x.recipient, 'kind': x.kind} for x in items]})


@api.post('/profile/timezone')
@login_required
def set_timezone():
    value = request.get_json().get('timezone')
    try: ZoneInfo(value)
    except (TypeError, ZoneInfoNotFoundError): return fail('validation_error', 'Choose a valid IANA timezone.', 400, {'timezone': 'Invalid timezone.'})
    # Rebuild only unfinished occurrences so a timezone change cannot duplicate today's dose.
    unfinished = db.session.scalars(select(DoseLog).join(DoseSchedule).join(Medication).where(
        Medication.user_id == current_user.id, DoseLog.status == 'Upcoming')).all()
    for occurrence in unfinished: db.session.delete(occurrence)
    current_user.timezone = value; db.session.commit(); return ok({'user': current_user.to_dict()})


@api.get('/caregivers')
@login_required
def caregivers():
    return ok({'caregivers': [{'id': x.id, 'name': x.name, 'email': x.email, 'phone': x.phone,
        'relationship': x.relationship, 'patient_consent': x.patient_consent,
        'notification_preference': x.notification_preference} for x in current_user.caregivers]})


@api.post('/caregivers')
@login_required
def create_caregiver():
    p = request.get_json(); required = ('name', 'email', 'relationship')
    errors = {key: 'Required.' for key in required if not isinstance(p.get(key), str) or not p[key].strip()}
    if '@' not in str(p.get('email', '')): errors['email'] = 'Enter a valid email address.'
    pref = p.get('notification_preference', 'email')
    if pref not in ('email', 'none', 'all'): errors['notification_preference'] = 'Choose email, all, or none.'
    if errors: return fail('validation_error', 'Check the caregiver details.', 400, errors)
    caregiver = Caregiver(patient_id=current_user.id, name=p['name'].strip()[:100], email=p['email'].strip().lower()[:254],
        phone=(p.get('phone') or '').strip()[:16] or None, relationship=p['relationship'].strip()[:80],
        patient_consent=p.get('patient_consent') is True, notification_preference=pref)
    db.session.add(caregiver); db.session.commit(); return ok({'caregiver': {'id': caregiver.id}}, 201)


@api.post('/caregivers/<int:caregiver_id>/consent')
@login_required
def caregiver_consent(caregiver_id):
    item = db.session.scalar(select(Caregiver).where(Caregiver.id == caregiver_id, Caregiver.patient_id == current_user.id))
    if not item: return fail('not_found', 'Caregiver not found.', 404)
    consent = request.get_json().get('consent')
    if not isinstance(consent, bool): return fail('validation_error', 'Consent must be true or false.', 400)
    item.patient_consent = consent; db.session.commit(); return ok({'id': item.id, 'patient_consent': consent})


@api.get('/admin/overview')
@admin_required
def admin_overview():
    counts = {name: db.session.scalar(select(func.count()).select_from(model)) for name, model in (
        ('users', User), ('medications', Medication), ('schedules', DoseSchedule),
        ('notifications', Reminder), ('prescriptions', Prescription), ('failed_jobs', JobFailure))}
    return ok(counts)


@api.get('/admin/users')
@admin_required
def admin_users():
    users = db.session.scalars(select(User).order_by(User.created_at.desc()).limit(250)).all()
    return ok({'users': [x.to_dict() for x in users]})


@api.post('/admin/users/<int:user_id>')
@admin_required
def admin_update_user(user_id):
    user = db.session.get(User, user_id)
    if not user: return fail('not_found', 'User not found.', 404)
    p = request.get_json()
    if 'active' in p:
        if not isinstance(p['active'], bool): return fail('validation_error', 'Active must be true or false.', 400)
        if user.id == current_user.id and not p['active']: return fail('invalid_operation', 'You cannot disable your own account.', 409)
        user.active = p['active']
    if 'role' in p:
        if p['role'] not in ('patient', 'admin'): return fail('validation_error', 'Invalid role.', 400)
        if user.id == current_user.id and p['role'] != 'admin': return fail('invalid_operation', 'You cannot remove your own admin role.', 409)
        user.role = p['role']
    db.session.commit(); return ok({'user': user.to_dict()})


@api.get('/admin/medications')
@admin_required
def admin_medications():
    items = db.session.scalars(select(Medication).order_by(Medication.created_at.desc()).limit(500)).all()
    return ok({'medications': [{'id': x.id, 'patient_id': x.user_id, 'patient': x.user.username,
        'medicine_name': x.medicine_name, 'dosage': x.dosage, 'strength': x.strength,
        'frequency': x.frequency, 'schedule_count': len(x.schedules)} for x in items]})


@api.post('/admin/medications/<int:medication_id>')
@admin_required
def admin_update_medication(medication_id):
    item = db.session.get(Medication, medication_id)
    if not item: return fail('not_found', 'Medication not found.', 404)
    p = request.get_json(); reason = p.get('reason'); changes = p.get('changes')
    if not isinstance(reason, str) or not reason.strip(): return fail('validation_error', 'A reason is required.', 400, {'reason': 'Required.'})
    if not isinstance(changes, dict): return fail('validation_error', 'Changes must be an object.', 400)
    allowed = ('medicine_name', 'dosage', 'strength', 'frequency', 'duration', 'special_instructions')
    audits = []
    for field, value in changes.items():
        if field not in allowed or value is not None and not isinstance(value, str):
            return fail('validation_error', f'Invalid field: {field}.', 400)
        value = value.strip()[:500] if isinstance(value, str) else None
        if field in ('medicine_name', 'dosage', 'frequency') and not value:
            return fail('validation_error', f'{field} cannot be empty.', 400)
        previous = getattr(item, field)
        if previous != value:
            audits.append(MedicationAudit(medication_id=item.id, admin_id=current_user.id, field_name=field,
                previous_value=previous, new_value=value or '', reason=reason.strip()[:500])); setattr(item, field, value)
    db.session.add_all(audits); db.session.commit()
    return ok({'medication_id': item.id, 'audit_records': len(audits)})


@api.get('/admin/schedules')
@admin_required
def admin_schedules():
    items = db.session.scalars(select(DoseSchedule).join(Medication).order_by(DoseSchedule.created_at.desc()).limit(500)).all()
    return ok({'schedules': [{'id': x.id, 'patient': x.medication.user.username,
        'medication': x.medication.medicine_name, 'time': x.scheduled_time.strftime('%H:%M'),
        'timezone': x.medication.user.timezone, 'active': x.active} for x in items]})


@api.get('/admin/notifications')
@admin_required
def admin_notifications():
    items = db.session.scalars(select(Reminder).order_by(Reminder.scheduled_at.desc()).limit(500)).all()
    return ok({'notifications': [{'id': x.id, 'patient': x.schedule.medication.user.username,
        'medication': x.schedule.medication.medicine_name, 'scheduled_at': iso(x.scheduled_at),
        'sent_at': iso(x.sent_at), 'delivery_status': x.delivery_status,
        'error_message': x.error_message, 'kind': x.kind} for x in items]})


@api.get('/admin/prescriptions')
@admin_required
def admin_prescriptions():
    items = db.session.scalars(select(Prescription).order_by(Prescription.uploaded_at.desc()).limit(500)).all()
    return ok({'prescriptions': [{'id': x.id, 'patient': x.user.username, 'status': x.extraction_status,
        'source': x.source, 'uploaded_at': iso(x.uploaded_at),
        'medicine_name': (x.confirmed_data or x.ai_result or {}).get('medicine_name')} for x in items]})


@api.get('/admin/failed-jobs')
@admin_required
def admin_failed_jobs():
    items = db.session.scalars(select(JobFailure).order_by(JobFailure.occurred_at.desc()).limit(250)).all()
    return ok({'failed_jobs': [{'id': x.id, 'job_name': x.job_name, 'error_message': x.error_message,
        'occurred_at': iso(x.occurred_at), 'resolved': x.resolved} for x in items]})


@api.post('/admin/run-reminders')
@admin_required
@limiter.limit('5 per minute')
def admin_run_reminders():
    process_reminders(); return ok({'processed_at': iso(utcnow())})
