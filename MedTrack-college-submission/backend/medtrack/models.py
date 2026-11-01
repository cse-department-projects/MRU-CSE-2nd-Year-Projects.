from datetime import datetime, timezone

from flask_login import UserMixin
from werkzeug.security import check_password_hash, generate_password_hash

from .extensions import db


def utcnow():
    return datetime.now(timezone.utc)


def iso(value):
    if value is None:
        return None
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc).isoformat()


class User(UserMixin, db.Model):
    __tablename__ = 'users'
    __table_args__ = (db.CheckConstraint("role IN ('patient', 'admin')", name='valid_user_role'),)
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(32), unique=True, nullable=False)
    email = db.Column(db.String(254), unique=True, nullable=False)
    phone = db.Column(db.String(16))
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(16), nullable=False, default='patient')
    timezone = db.Column(db.String(64), nullable=False, default='Asia/Kolkata')
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utcnow)
    active = db.Column(db.Boolean, nullable=False, default=True)
    prescriptions = db.relationship('Prescription', back_populates='user', cascade='all, delete-orphan')
    medications = db.relationship('Medication', back_populates='user', cascade='all, delete-orphan')
    caregivers = db.relationship('Caregiver', back_populates='patient', cascade='all, delete-orphan')

    @property
    def is_active(self): return self.active
    def set_password(self, password): self.password_hash = generate_password_hash(password)
    def check_password(self, password): return check_password_hash(self.password_hash, password)
    def to_dict(self):
        return {'id': self.id, 'username': self.username, 'email': self.email, 'phone': self.phone,
                'role': self.role, 'timezone': self.timezone, 'active': self.active,
                'created_at': iso(self.created_at)}


class Prescription(db.Model):
    __tablename__ = 'prescriptions'
    __table_args__ = (db.CheckConstraint("extraction_status IN ('processing','draft','failed','confirmed')", name='valid_extraction_status'),)
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    image_path = db.Column(db.String(255)); mime_type = db.Column(db.String(32))
    ai_result = db.Column(db.JSON); confirmed_data = db.Column(db.JSON)
    extraction_status = db.Column(db.String(16), nullable=False, default='processing')
    extraction_error = db.Column(db.String(255)); source = db.Column(db.String(16), nullable=False, default='image')
    uploaded_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utcnow)
    confirmed_at = db.Column(db.DateTime(timezone=True))
    user = db.relationship('User', back_populates='prescriptions')
    medications = db.relationship('Medication', back_populates='prescription', cascade='all, delete-orphan')
    def to_dict(self, include_result=True):
        data = {'id': self.id, 'status': self.extraction_status, 'source': self.source,
                'uploaded_at': iso(self.uploaded_at), 'image_url': f'/api/prescriptions/{self.id}/image' if self.image_path else None}
        if include_result: data['extraction'] = self.confirmed_data or self.ai_result
        return data


class Medication(db.Model):
    __tablename__ = 'medications'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    prescription_id = db.Column(db.Integer, db.ForeignKey('prescriptions.id', ondelete='CASCADE'), nullable=False, index=True)
    medicine_name = db.Column(db.String(160), nullable=False); dosage = db.Column(db.String(160), nullable=False)
    strength = db.Column(db.String(160)); frequency = db.Column(db.String(160), nullable=False)
    duration = db.Column(db.String(160)); special_instructions = db.Column(db.Text)
    start_date = db.Column(db.Date); end_date = db.Column(db.Date)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utcnow)
    user = db.relationship('User', back_populates='medications'); prescription = db.relationship('Prescription', back_populates='medications')
    schedules = db.relationship('DoseSchedule', back_populates='medication', cascade='all, delete-orphan')


class DoseSchedule(db.Model):
    __tablename__ = 'dose_schedules'
    id = db.Column(db.Integer, primary_key=True)
    medication_id = db.Column(db.Integer, db.ForeignKey('medications.id', ondelete='CASCADE'), nullable=False, index=True)
    scheduled_time = db.Column(db.Time, nullable=False)
    period = db.Column(db.String(16), nullable=False, default='custom')
    timezone = db.Column(db.String(64), nullable=False, default='UTC')
    enabled = db.Column(db.Boolean, nullable=False, default=True)
    next_reminder_at = db.Column(db.DateTime(timezone=True))
    active = db.Column(db.Boolean, nullable=False, default=True)
    last_taken_date = db.Column(db.Date)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utcnow)
    medication = db.relationship('Medication', back_populates='schedules')
    dose_logs = db.relationship('DoseLog', back_populates='schedule', cascade='all, delete-orphan')
    reminders = db.relationship('Reminder', back_populates='schedule', cascade='all, delete-orphan')


class DoseLog(db.Model):
    __tablename__ = 'dose_logs'
    __table_args__ = (db.UniqueConstraint('schedule_id', 'scheduled_at', name='uq_dose_occurrence'),)
    id = db.Column(db.Integer, primary_key=True)
    schedule_id = db.Column(db.Integer, db.ForeignKey('dose_schedules.id', ondelete='CASCADE'), nullable=False, index=True)
    scheduled_at = db.Column(db.DateTime(timezone=True), nullable=False, index=True)
    status = db.Column(db.String(16), nullable=False, default='Upcoming')
    taken_at = db.Column(db.DateTime(timezone=True)); sent_at = db.Column(db.DateTime(timezone=True))
    delivery_status = db.Column(db.String(16), nullable=False, default='pending'); error_message = db.Column(db.Text)
    schedule = db.relationship('DoseSchedule', back_populates='dose_logs')


class Reminder(db.Model):
    __tablename__ = 'reminders'
    id = db.Column(db.Integer, primary_key=True)
    schedule_id = db.Column(db.Integer, db.ForeignKey('dose_schedules.id', ondelete='CASCADE'), nullable=False, index=True)
    scheduled_at = db.Column(db.DateTime(timezone=True), nullable=False, index=True)
    status = db.Column(db.String(16), nullable=False, default='Upcoming')
    taken_at = db.Column(db.DateTime(timezone=True)); sent_at = db.Column(db.DateTime(timezone=True))
    delivery_status = db.Column(db.String(16), nullable=False, default='pending'); error_message = db.Column(db.Text)
    recipient = db.Column(db.String(254)); kind = db.Column(db.String(16), nullable=False, default='patient')
    schedule = db.relationship('DoseSchedule', back_populates='reminders')


class Caregiver(db.Model):
    __tablename__ = 'caregivers'
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    name = db.Column(db.String(100), nullable=False); email = db.Column(db.String(254), nullable=False)
    phone = db.Column(db.String(16)); relationship = db.Column(db.String(80), nullable=False)
    patient_consent = db.Column(db.Boolean, nullable=False, default=False)
    notification_preference = db.Column(db.String(16), nullable=False, default='email')
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utcnow)
    patient = db.relationship('User', back_populates='caregivers')


class MedicationAudit(db.Model):
    __tablename__ = 'medication_audits'
    id = db.Column(db.Integer, primary_key=True)
    medication_id = db.Column(db.Integer, db.ForeignKey('medications.id', ondelete='CASCADE'), nullable=False, index=True)
    admin_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    field_name = db.Column(db.String(64), nullable=False); previous_value = db.Column(db.Text)
    new_value = db.Column(db.Text, nullable=False); reason = db.Column(db.String(500), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utcnow)


class JobFailure(db.Model):
    __tablename__ = 'job_failures'
    id = db.Column(db.Integer, primary_key=True); job_name = db.Column(db.String(100), nullable=False)
    error_message = db.Column(db.Text, nullable=False); occurred_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utcnow)
    resolved = db.Column(db.Boolean, nullable=False, default=False)
