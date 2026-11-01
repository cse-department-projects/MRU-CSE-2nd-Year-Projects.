from datetime import datetime, time
import re

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


def normalize_clock(value):
    """Normalize explicit clock representations without inferring an unspecified time."""
    if not isinstance(value, str):
        raise ValueError('Each suggested time must be text in HH:MM format.')
    cleaned = re.sub(r'\s+', ' ', value.strip().upper()).replace('.', '')
    if re.fullmatch(r'\d{1,2}:\d{2}', cleaned):
        hour_text, minute_text = cleaned.split(':')
        hour, minute = int(hour_text), int(minute_text)
        if 0 <= hour <= 23 and 0 <= minute <= 59:
            return f'{hour:02d}:{minute:02d}'
    for pattern in ('%I:%M %p', '%I %p'):
        try:
            return datetime.strptime(cleaned, pattern).strftime('%H:%M')
        except ValueError:
            pass
    raise ValueError('Suggested times must use a recognizable clock time such as 05:00 or 5:00 PM.')


class PrescriptionDraft(BaseModel):
    model_config = ConfigDict(extra='forbid', strict=True, str_strip_whitespace=True)

    medicine_name: str | None = Field(max_length=160)
    dosage: str | None = Field(max_length=160)
    strength: str | None = Field(max_length=160)
    frequency: str | None = Field(max_length=160)
    duration: str | None = Field(max_length=160)
    special_instructions: str | None = Field(max_length=1000)
    suggested_times: list[str] = Field(max_length=12)
    raw_prescription_text: str | None = Field(max_length=5000)
    unclear_fields: list[str] = Field(max_length=9)
    needs_review: bool

    @field_validator('medicine_name', 'dosage', 'strength', 'frequency', 'duration',
                     'special_instructions', 'raw_prescription_text')
    @classmethod
    def blank_is_none(cls, value):
        return value or None

    @field_validator('suggested_times')
    @classmethod
    def valid_times(cls, values):
        result = []
        for value in values:
            try:
                normalized = normalize_clock(value)
            except ValueError as error:
                raise ValueError(str(error)) from error
            if normalized not in result:
                result.append(normalized)
        return result

    @field_validator('unclear_fields')
    @classmethod
    def valid_unclear_fields(cls, values):
        allowed = {
            'medicine_name', 'dosage', 'strength', 'frequency', 'duration',
            'special_instructions', 'suggested_times', 'raw_prescription_text',
        }
        if any(not isinstance(value, str) or value not in allowed for value in values):
            raise ValueError('unclear_fields contains an unknown field name.')
        return list(dict.fromkeys(values))


class ConfirmationRequest(PrescriptionDraft):
    confirmed: bool

    def required_errors(self):
        errors = {}
        for field in ('medicine_name', 'dosage', 'frequency'):
            if not getattr(self, field):
                errors[field] = 'This field is required before creating a schedule.'
        if not self.suggested_times:
            errors['suggested_times'] = 'Add at least one dose time.'
        if not self.confirmed:
            errors['confirmed'] = 'Review the draft and confirm it before saving.'
        return errors


class DoseTimeDraft(BaseModel):
    model_config = ConfigDict(extra='forbid', strict=True, str_strip_whitespace=True)
    period: str
    time: str | None = None
    enabled: bool = False

    @field_validator('period')
    @classmethod
    def valid_period(cls, value):
        if value not in ('morning', 'afternoon', 'evening', 'night', 'custom'):
            raise ValueError('Choose morning, afternoon, evening, night, or custom.')
        return value

    @field_validator('time')
    @classmethod
    def valid_time(cls, value):
        return normalize_clock(value) if value else None

    @model_validator(mode='after')
    def enabled_needs_time(self):
        if self.enabled and not self.time:
            raise ValueError('An enabled dose needs a time.')
        return self


class MedicineDraft(BaseModel):
    model_config = ConfigDict(extra='forbid', strict=True, str_strip_whitespace=True)
    medicine_id: str = Field(min_length=1, max_length=64)
    medicine_name: str | None = Field(default=None, max_length=160)
    strength: str | None = Field(default=None, max_length=160)
    dosage: str | None = Field(default=None, max_length=160)
    frequency: str | None = Field(default=None, max_length=160)
    duration: str | None = Field(default=None, max_length=160)
    special_instructions: str | None = Field(default=None, max_length=1000)
    start_date: str | None = None
    end_date: str | None = None
    dose_times: list[DoseTimeDraft] = Field(default_factory=list, max_length=12)
    needs_review: bool = True

    @field_validator('medicine_name', 'strength', 'dosage', 'frequency', 'duration', 'special_instructions')
    @classmethod
    def blank_text_is_none(cls, value): return value or None

    @field_validator('start_date', 'end_date')
    @classmethod
    def valid_date(cls, value):
        if not value: return None
        try: return datetime.strptime(value, '%Y-%m-%d').date().isoformat()
        except ValueError as error: raise ValueError('Use YYYY-MM-DD.') from error


class PrescriptionMedicinesDraft(BaseModel):
    model_config = ConfigDict(extra='forbid', strict=True, str_strip_whitespace=True)
    medicines: list[MedicineDraft] = Field(min_length=1, max_length=30)
    raw_prescription_text: str | None = Field(default=None, max_length=10000)
    unclear_fields: list[str] = Field(default_factory=list, max_length=100)
    needs_review: bool = True


class PrescriptionMedicinesConfirmation(PrescriptionMedicinesDraft):
    confirmed: bool

    def required_errors(self):
        errors = {}
        for index, medicine in enumerate(self.medicines):
            prefix = f'medicines.{index}'
            for field in ('medicine_name', 'dosage', 'frequency'):
                if not getattr(medicine, field): errors[f'{prefix}.{field}'] = 'Required before saving.'
            if not any(slot.enabled and slot.time for slot in medicine.dose_times):
                errors[f'{prefix}.dose_times'] = 'Select and confirm at least one dose time.'
            if medicine.start_date and medicine.end_date and medicine.end_date < medicine.start_date:
                errors[f'{prefix}.end_date'] = 'End date cannot be before start date.'
        if not self.confirmed: errors['confirmed'] = 'Review every medicine and confirm before saving.'
        return errors
