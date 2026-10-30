import os
from datetime import timedelta
from urllib.parse import urlsplit


def environment_config():
    production = os.getenv('APP_ENV', 'development') == 'production'
    database = os.getenv('DATABASE_URL', 'sqlite:///medtrack.db')
    for prefix in ('postgres://', 'postgresql://'):
        if database.startswith(prefix):
            database = database.replace(prefix, 'postgresql+psycopg://', 1)
    max_upload_mb = int(os.getenv('MAX_UPLOAD_MB', '10'))
    return {
        'SECRET_KEY': os.getenv('SECRET_KEY'),
        'SQLALCHEMY_DATABASE_URI': database,
        'SQLALCHEMY_TRACK_MODIFICATIONS': False,
        'FRONTEND_URL': os.getenv('FRONTEND_URL', 'http://127.0.0.1:8000'),
        'SESSION_COOKIE_NAME': 'medtrack_session',
        'SESSION_COOKIE_HTTPONLY': True,
        'SESSION_COOKIE_SECURE': os.getenv('SESSION_COOKIE_SECURE', str(production)).lower() == 'true',
        'SESSION_COOKIE_SAMESITE': os.getenv('SESSION_COOKIE_SAMESITE', 'Lax'),
        'PERMANENT_SESSION_LIFETIME': timedelta(hours=int(os.getenv('SESSION_HOURS', '8'))),
        'SESSION_REFRESH_EACH_REQUEST': False,
        'MAX_UPLOAD_MB': max_upload_mb,
        # Allow multipart framing while enforcing the exact file limit in /api/scan.
        'MAX_CONTENT_LENGTH': (max_upload_mb * 1024 * 1024) + (512 * 1024),
        'GROQ_API_KEY': os.getenv('GROQ_API_KEY', ''),
        'GROQ_VISION_MODEL': os.getenv('GROQ_VISION_MODEL', 'qwen/qwen3.6-27b'),
        'MAIL_SERVER': os.getenv('MAIL_SERVER', ''),
        'MAIL_PORT': int(os.getenv('MAIL_PORT', '587')),
        'MAIL_USERNAME': os.getenv('MAIL_USERNAME', ''),
        'MAIL_PASSWORD': os.getenv('MAIL_PASSWORD', ''),
        'MAIL_DEFAULT_SENDER': os.getenv('MAIL_DEFAULT_SENDER', ''),
        'MAIL_USE_TLS': os.getenv('MAIL_USE_TLS', 'true').lower() == 'true',
        'MAIL_USE_SSL': os.getenv('MAIL_USE_SSL', 'false').lower() == 'true',
        'REMINDER_LEAD_MINUTES': int(os.getenv('REMINDER_LEAD_MINUTES', '0')),
        'MISSED_DOSE_AFTER_MINUTES': int(os.getenv('MISSED_DOSE_AFTER_MINUTES', '120')),
        'CAREGIVER_ESCALATION_MINUTES': int(os.getenv('CAREGIVER_ESCALATION_MINUTES', '180')),
        'ON_TIME_WINDOW_MINUTES': int(os.getenv('ON_TIME_WINDOW_MINUTES', '30')),
        'SCHEDULER_ENABLED': os.getenv('SCHEDULER_ENABLED', str(not production)).lower() == 'true',
        'RATELIMIT_STORAGE_URI': os.getenv('RATELIMIT_STORAGE_URI', 'memory://'),
        'PRODUCTION': production,
    }


def validate_config(config):
    secret = config['SECRET_KEY']
    if not secret or len(secret) < 32 or secret.startswith('replace-with'):
        raise ValueError('Set SECRET_KEY to a random value of at least 32 characters in backend/.env.')
    origin = urlsplit(config['FRONTEND_URL'])
    if origin.scheme not in ('http', 'https') or not origin.netloc or origin.path or origin.query or origin.fragment or origin.username or '*' in config['FRONTEND_URL']:
        raise ValueError('FRONTEND_URL must be one explicit origin without a trailing slash or wildcard.')
    same_site = config['SESSION_COOKIE_SAMESITE']
    if same_site not in ('Lax', 'Strict', 'None'):
        raise ValueError('SESSION_COOKIE_SAMESITE must be Lax, Strict or None.')
    if (config['PRODUCTION'] or same_site == 'None') and not config['SESSION_COOKIE_SECURE']:
        raise ValueError('Production and SameSite=None require SESSION_COOKIE_SECURE=true.')
    if config['PRODUCTION'] and origin.scheme != 'https':
        raise ValueError('Production requires an HTTPS FRONTEND_URL.')
    if config['PRODUCTION'] and config['SQLALCHEMY_DATABASE_URI'].startswith('sqlite:'):
        raise ValueError('Production requires PostgreSQL; SQLite is for local development only.')
    if not 1 <= int(config['MAX_UPLOAD_MB']) <= 20:
        raise ValueError('MAX_UPLOAD_MB must be between 1 and 20.')
    for name in ('MISSED_DOSE_AFTER_MINUTES', 'CAREGIVER_ESCALATION_MINUTES', 'ON_TIME_WINDOW_MINUTES'):
        if int(config[name]) < 1:
            raise ValueError(f'{name} must be a positive integer.')
