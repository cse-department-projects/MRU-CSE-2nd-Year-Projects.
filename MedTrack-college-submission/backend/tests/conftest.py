import pytest

from medtrack import create_app
from medtrack.extensions import db


@pytest.fixture
def app(tmp_path):
    app = create_app({
        'TESTING': True,
        'SECRET_KEY': 'testing-only-secret-key-with-more-than-32-characters',
        'SQLALCHEMY_DATABASE_URI': f'sqlite:///{(tmp_path / "test.db").as_posix()}',
        'FRONTEND_URL': 'http://127.0.0.1:8000',
        'SESSION_COOKIE_SECURE': False,
        'SESSION_COOKIE_SAMESITE': 'Lax',
        'PRODUCTION': False,
        'UPLOAD_FOLDER': str(tmp_path / 'uploads'),
        'GROQ_API_KEY': '',
        'GROQ_VISION_MODEL': 'qwen/qwen3.6-27b',
        'MAX_UPLOAD_MB': 10,
        'MAX_CONTENT_LENGTH': (10 * 1024 * 1024) + (512 * 1024),
    })
    with app.app_context():
        db.create_all()
    yield app
    with app.app_context():
        db.session.remove()
        db.engine.dispose()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def account():
    return {'username': 'Patient_One', 'email': 'patient@example.com',
            'phone': '+919876543210', 'password': 'a long patient passphrase'}


@pytest.fixture
def post(client):
    def send(path, payload, **kwargs):
        token = client.get('/api/auth/me').json['data']['csrf_token']
        headers = {'X-CSRF-Token': token, **kwargs.pop('headers', {})}
        return client.post(path, json=payload, headers=headers, **kwargs)
    return send


@pytest.fixture
def csrf(client):
    return client.get('/api/auth/me').json['data']['csrf_token']
