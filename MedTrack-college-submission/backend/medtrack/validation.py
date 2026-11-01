import re

from email_validator import EmailNotValidError, validate_email


def validate_signup(payload):
    errors = {}
    values = {}
    for name in ('username', 'email', 'phone', 'password'):
        value = payload.get(name, '')
        if not isinstance(value, str):
            errors[name] = 'Must be text.'
            value = ''
        values[name] = value if name == 'password' else value.strip()
    values['username'] = values['username'].lower()
    if not re.fullmatch(r'[a-z0-9_]{3,32}', values['username']):
        errors['username'] = 'Use 3–32 letters, numbers or underscores.'
    try:
        values['email'] = validate_email(values['email'], check_deliverability=False).normalized.lower()
        if len(values['email']) > 254:
            errors['email'] = 'Email must be at most 254 characters.'
    except EmailNotValidError:
        errors['email'] = 'Enter a valid email address.'
    phone = values['phone']
    if phone and not re.fullmatch(r'\+[1-9][0-9]{7,14}', phone):
        errors['phone'] = 'Use international format: + followed by 8–15 digits.'
    values['phone'] = phone or None
    if not 12 <= len(values['password']) <= 128 or not values['password'].strip():
        errors['password'] = 'Use a password or passphrase of 12–128 characters.'
    if 'role' in payload or 'active' in payload:
        errors['role'] = 'Account privileges cannot be set during signup.'
    return values, errors
