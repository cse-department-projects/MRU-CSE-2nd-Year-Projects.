import logging
from html import escape
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from flask import current_app
from flask_mail import Message
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from .extensions import db, mail
from .models import Caregiver, DoseLog, DoseSchedule, JobFailure, Reminder, utcnow

log = logging.getLogger('medtrack.reminders')


def as_utc(value):
    return value.replace(tzinfo=timezone.utc) if value.tzinfo is None else value.astimezone(timezone.utc)


def patient_zone(user):
    try: return ZoneInfo(user.timezone)
    except ZoneInfoNotFoundError: return timezone.utc


def occurrence_at(schedule, local_date):
    local = datetime.combine(local_date, schedule.scheduled_time, tzinfo=patient_zone(schedule.medication.user))
    return local.astimezone(timezone.utc)


def ensure_occurrence(schedule, local_date):
    scheduled_at = occurrence_at(schedule, local_date)
    schedule.next_reminder_at = scheduled_at
    item = db.session.scalar(select(DoseLog).where(DoseLog.schedule_id == schedule.id, DoseLog.scheduled_at == scheduled_at))
    if item: return item
    item = DoseLog(schedule=schedule, scheduled_at=scheduled_at)
    db.session.add(item)
    try: db.session.flush()
    except IntegrityError:
        db.session.rollback()
        return db.session.scalar(select(DoseLog).where(DoseLog.schedule_id == schedule.id, DoseLog.scheduled_at == scheduled_at))
    return item


def classify(item, now=None):
    now = as_utc(now or utcnow()); scheduled = as_utc(item.scheduled_at)
    if item.status in ('Skipped', 'Taken', 'Delayed', 'Missed'): return item.status
    if now > scheduled + timedelta(minutes=current_app.config['MISSED_DOSE_AFTER_MINUTES']): return 'Missed'
    return 'Upcoming'


def adherence(logs, now=None):
    now = as_utc(now or utcnow()); completed = []
    for item in logs:
        status = classify(item, now)
        if status != 'Upcoming': completed.append(status)
    on_time = sum(status == 'Taken' for status in completed)
    return {'percentage': round(on_time / len(completed) * 100, 1) if completed else None,
            'on_time': on_time, 'completed': len(completed),
            'taken': sum(s == 'Taken' for s in completed), 'delayed': sum(s == 'Delayed' for s in completed),
            'missed': sum(s == 'Missed' for s in completed), 'skipped': sum(s == 'Skipped' for s in completed),
            'definition': 'On-time Taken doses / completed doses × 100. Delayed, Missed, and Skipped doses are completed but do not count as on-time.'}


def send_email(reminder, subject, body, html=None):
    reminder.sent_at = utcnow()
    if not current_app.config.get('MAIL_SERVER') or not current_app.config.get('MAIL_DEFAULT_SENDER'):
        reminder.delivery_status = 'failed'; reminder.error_message = 'Email service is not configured.'
        return False
    try:
        mail.send(Message(subject=subject, recipients=[reminder.recipient], body=body, html=html))
        reminder.delivery_status = 'sent'; reminder.error_message = None
        return True
    except Exception as error:  # provider failures are recorded, not allowed to stop processing
        log.exception('reminder_delivery_failed', extra={'reminder_id': reminder.id})
        reminder.delivery_status = 'failed'; reminder.error_message = str(error)[:1000]
        return False


def process_reminders():
    now = utcnow()
    for schedule in db.session.scalars(select(DoseSchedule).where(
            DoseSchedule.active.is_(True), DoseSchedule.enabled.is_(True))).all():
        user = schedule.medication.user; local_today = now.astimezone(patient_zone(user)).date()
        if schedule.medication.start_date and local_today < schedule.medication.start_date: continue
        if schedule.medication.end_date and local_today > schedule.medication.end_date: continue
        item = ensure_occurrence(schedule, local_today)
        item.status = classify(item, now)
        due = as_utc(item.scheduled_at) - timedelta(minutes=current_app.config['REMINDER_LEAD_MINUTES'])
        if now >= due and not db.session.scalar(select(Reminder).where(Reminder.schedule_id == schedule.id,
                Reminder.scheduled_at == item.scheduled_at, Reminder.kind == 'patient')):
            reminder = Reminder(schedule=schedule, scheduled_at=item.scheduled_at, status=item.status,
                                recipient=user.email, kind='patient')
            db.session.add(reminder); db.session.flush()
            instruction = f' – {schedule.medication.special_instructions}' if schedule.medication.special_instructions else ''
            local_time = as_utc(item.scheduled_at).astimezone(patient_zone(user)).strftime('%H:%M')
            medicine = schedule.medication
            subject = f'⏰ MedTrack: Time to take {medicine.medicine_name}'
            body = f'Time to take {medicine.medicine_name} – {medicine.dosage} at {local_time}{instruction}.'
            login_url = current_app.config['FRONTEND_URL'] + '/#dashboard'
            html = f'''<!doctype html><html><body style="margin:0;background:#f3f7f6;font-family:Arial,sans-serif;color:#1f2937">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:28px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #dfe9e6">
<tr><td style="padding:26px;text-align:center;background:linear-gradient(135deg,#10b981,#34d399);color:#fff;font-size:28px;font-weight:700">💊 MedTrack</td></tr>
<tr><td style="padding:30px"><p style="font-size:17px;margin:0 0 22px">Hi <strong>{escape(user.username)}</strong>,</p>
<p style="margin:0 0 16px">⏰ It’s time to take your medication:</p>
<div style="background:#ecfdf5;border-left:5px solid #10b981;border-radius:10px;padding:20px;margin-bottom:22px">
<div style="font-size:21px;font-weight:700;color:#047857;margin-bottom:10px">{escape(medicine.medicine_name)}</div>
<div style="line-height:1.8">💊 {escape(medicine.strength or medicine.dosage or 'Follow prescription')}<br>📝 {escape(medicine.dosage or '')}{' · ' + escape(medicine.frequency) if medicine.frequency else ''}<br>🕘 Scheduled at {escape(local_time)}</div>
{f'<div style="margin-top:8px">ℹ️ {escape(medicine.special_instructions)}</div>' if medicine.special_instructions else ''}</div>
<a href="{escape(login_url)}" style="display:inline-block;background:#10b981;color:#fff;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:9px">Open MedTrack</a>
<p style="margin:22px 0 0;color:#64748b;font-size:13px">Please verify the prescription and follow your clinician’s instructions. MedTrack does not provide medical advice.</p></td></tr>
<tr><td style="padding:18px;text-align:center;background:#f8fafc;color:#94a3b8;font-size:12px">MedTrack — Your Smart Health Companion</td></tr>
</table></td></tr></table></body></html>'''
            send_email(reminder, subject, body, html)
        escalation_at = as_utc(item.scheduled_at) + timedelta(minutes=current_app.config['CAREGIVER_ESCALATION_MINUTES'])
        if item.status == 'Missed' and now >= escalation_at:
            caregivers = db.session.scalars(select(Caregiver).where(Caregiver.patient_id == user.id,
                Caregiver.patient_consent.is_(True), Caregiver.notification_preference.in_(['email', 'all']))).all()
            for caregiver in caregivers:
                if db.session.scalar(select(Reminder).where(Reminder.schedule_id == schedule.id,
                        Reminder.scheduled_at == item.scheduled_at, Reminder.kind == f'caregiver:{caregiver.id}')): continue
                reminder = Reminder(schedule=schedule, scheduled_at=item.scheduled_at, status='Missed',
                                    recipient=caregiver.email, kind=f'caregiver:{caregiver.id}')
                db.session.add(reminder); db.session.flush()
                send_email(reminder, 'MedTrack missed-dose alert',
                           f'{user.username} has a missed {schedule.medication.medicine_name} dose. Contact the patient directly if needed.')
    db.session.commit()


def safe_process(app):
    with app.app_context():
        try: process_reminders()
        except Exception as error:
            db.session.rollback(); log.exception('reminder_job_failed')
            db.session.add(JobFailure(job_name='process_reminders', error_message=str(error)[:2000])); db.session.commit()
