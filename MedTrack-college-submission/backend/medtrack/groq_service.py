import base64
import json
import logging
import re
from uuid import uuid4

from flask import current_app
from groq import APIConnectionError, APIStatusError, APITimeoutError, Groq, RateLimitError
from pydantic import ValidationError

from .schemas import PrescriptionMedicinesDraft

log = logging.getLogger('medtrack.groq')

EXTRACTION_PROMPT = """You extract written prescription information only. Do not diagnose, recommend treatment,
change or calculate a dosage, infer a missing medicine, or create a new prescription. Transcribe what is visible.
Return exactly one JSON object with: medicines, raw_prescription_text, unclear_fields, needs_review.
medicines must be an array containing every visible medicine separately. Each medicine must contain exactly:
medicine_id, medicine_name, strength, dosage, frequency, duration, special_instructions, start_date, end_date,
dose_times, needs_review. Use a short stable label such as medicine-1 for medicine_id. dose_times is an array;
each item contains period (morning, afternoon, evening, night, or custom), time (24-hour HH:MM or null), and
enabled. Never share dose_times between medicines. Use null for unclear or absent scalar fields and never guess.
Only include a time when it is visible or unambiguous in the prescription; otherwise keep it null and enabled
false. needs_review must always be true at prescription and medicine level. Preserve visible text in
raw_prescription_text. Do not omit a visible medicine."""


class ExtractionError(Exception):
    code = 'extraction_failed'
    status = 502


class MissingAPIKey(ExtractionError):
    code = 'groq_not_configured'
    status = 503


class ExtractionTimeout(ExtractionError):
    code = 'groq_timeout'
    status = 504


class InvalidExtraction(ExtractionError):
    code = 'invalid_ai_response'


class GroqRateLimited(ExtractionError):
    code = 'groq_rate_limited'
    status = 429


class GroqAuthenticationError(ExtractionError):
    code = 'groq_authentication_failed'
    status = 503


def extract_prescription(image_bytes, mime_type):
    api_key = current_app.config['GROQ_API_KEY']
    if not api_key:
        raise MissingAPIKey('Prescription scanning is not configured. Add GROQ_API_KEY to the backend environment.')
    encoded = base64.b64encode(image_bytes).decode('ascii')
    try:
        response = Groq(api_key=api_key, timeout=25, max_retries=2).chat.completions.create(
            model=current_app.config['GROQ_VISION_MODEL'],
            messages=[{'role': 'user', 'content': [
                {'type': 'text', 'text': EXTRACTION_PROMPT},
                {'type': 'image_url', 'image_url': {'url': f'data:{mime_type};base64,{encoded}'}},
            ]}],
            response_format={'type': 'json_object'},
            temperature=0,
            max_completion_tokens=1600,
            stream=False,
        )
    except APITimeoutError as error:
        log.warning('groq_timeout model=%s', current_app.config['GROQ_VISION_MODEL'])
        raise ExtractionTimeout('Groq did not respond in time. Please try the scan again.') from error
    except TimeoutError as error:
        raise ExtractionTimeout('Groq did not respond in time. Please try the scan again.') from error
    except RateLimitError as error:
        log.warning('groq_rate_limited model=%s', current_app.config['GROQ_VISION_MODEL'])
        raise GroqRateLimited('Groq is temporarily rate limited. Wait a moment and try again.') from error
    except APIStatusError as error:
        log.error('groq_api_error status=%s model=%s request_id=%s', error.status_code,
                  current_app.config['GROQ_VISION_MODEL'], getattr(error, 'request_id', None))
        if error.status_code in (401, 403):
            raise GroqAuthenticationError('The Groq key or model permission is not valid. Check the backend Groq settings.') from error
        if error.status_code == 404:
            raise MissingAPIKey('The configured Groq vision model is unavailable. Check GROQ_VISION_MODEL.') from error
        raise ExtractionError(f'Groq returned a temporary service error ({error.status_code}). Please try again.') from error
    except APIConnectionError as error:
        log.warning('groq_connection_error model=%s', current_app.config['GROQ_VISION_MODEL'])
        raise ExtractionError('The server could not reach Groq. Check the connection and try again.') from error
    except Exception as error:
        log.exception('unexpected_groq_error model=%s', current_app.config['GROQ_VISION_MODEL'])
        raise ExtractionError('Groq could not process this image. Please try again or enter it manually.') from error
    content = response.choices[0].message.content if response.choices else None
    if not content:
        raise InvalidExtraction('Groq returned an empty extraction. Enter the medicine manually or try another image.')
    try:
        data = json.loads(content)
        data = normalize_extraction(data)
        draft = PrescriptionMedicinesDraft.model_validate(data)
    except (json.JSONDecodeError, ValidationError, TypeError) as error:
        raise InvalidExtraction('Groq returned an invalid extraction. Enter the medicine manually or try again.') from error
    return draft.model_copy(update={'needs_review': True}).model_dump(mode='json')


DEFAULT_TIMES = {'morning': '08:00', 'afternoon': '13:00', 'evening': '18:00', 'night': '21:00'}


def frequency_slots(frequency):
    text = (frequency or '').lower().strip()
    periods = []
    if re.search(r'\b1\s*-\s*1\s*-\s*1\b', text): periods = ['morning', 'afternoon', 'night']
    elif re.search(r'\b1\s*-\s*0\s*-\s*1\b', text): periods = ['morning', 'night']
    else: periods = [name for name in ('morning', 'afternoon', 'evening', 'night') if name in text]
    if periods: return [{'period': p, 'time': DEFAULT_TIMES[p], 'enabled': True} for p in periods]
    if 'twice daily' in text or 'two times' in text:
        return [{'period': p, 'time': DEFAULT_TIMES[p], 'enabled': False} for p in ('morning', 'night')]
    if 'once daily' in text or 'once a day' in text:
        return [{'period': 'morning', 'time': DEFAULT_TIMES['morning'], 'enabled': False}]
    if re.search(r'every\s+\d+\s*hours?', text):
        return [{'period': 'custom', 'time': None, 'enabled': False}]
    return []


def normalize_extraction(data):
    if not isinstance(data, dict): return data
    if 'medicines' not in data and 'medicine_name' in data:
        old_times = data.get('suggested_times') or []
        dose_times = [{'period': 'custom', 'time': value, 'enabled': True} for value in old_times]
        data = {'medicines': [{
            'medicine_id': 'medicine-1', 'medicine_name': data.get('medicine_name'),
            'strength': data.get('strength'), 'dosage': data.get('dosage'),
            'frequency': data.get('frequency'), 'duration': data.get('duration'),
            'special_instructions': data.get('special_instructions'), 'start_date': None, 'end_date': None,
            'dose_times': dose_times, 'needs_review': True,
        }], 'raw_prescription_text': data.get('raw_prescription_text'),
            'unclear_fields': data.get('unclear_fields') or [], 'needs_review': True}
    if not isinstance(data.get('medicines'), list): return data
    for index, medicine in enumerate(data['medicines']):
        if not isinstance(medicine, dict): continue
        medicine['medicine_id'] = str(medicine.get('medicine_id') or f'medicine-{index + 1}')[:64]
        medicine['needs_review'] = True
        medicine.setdefault('start_date', None); medicine.setdefault('end_date', None)
        slots = medicine.get('dose_times')
        if not isinstance(slots, list) or not slots:
            medicine['dose_times'] = frequency_slots(medicine.get('frequency'))
    data['needs_review'] = True
    data.setdefault('raw_prescription_text', None); data.setdefault('unclear_fields', [])
    return data
