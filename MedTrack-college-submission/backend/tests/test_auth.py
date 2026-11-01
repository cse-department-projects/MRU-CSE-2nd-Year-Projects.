from datetime import timedelta

import pytest
from sqlalchemy import select

from medtrack import create_app
from medtrack.extensions import db
from medtrack.models import User


def test_signup_session_logout_and_login(client, post, account, app):
    anonymous = client.get('/api/auth/me')
    assert anonymous.json['data']['authenticated'] is False
    old_csrf = anonymous.json['data']['csrf_token']
    response = post('/api/auth/signup', account)
    assert response.status_code == 201
    data = response.json['data']
    assert set(response.json) == {'success', 'data', 'error'}
    assert response.json['error'] is None
    assert data['user']['username'] == 'patient_one'
    assert data['user']['role'] == 'patient'
    assert 'password_hash' not in data['user'] and 'password' not in data['user']
    assert data['csrf_token'] != old_csrf
    cookie = response.headers['Set-Cookie']
    assert 'HttpOnly' in cookie and 'SameSite=Lax' in cookie
    with app.app_context():
        user = db.session.scalar(select(User))
        assert user.password_hash != account['password']
        assert user.check_password(account['password'])
        assert user.active and user.created_at
    for _ in range(2):
        assert client.get('/api/auth/me').json['data']['user']['id'] == data['user']['id']
        assert client.get('/api/patient/dashboard').status_code == 200
    assert client.get('/dashboard').status_code == 200
    assert client.get('/api/admin').status_code == 403
    assert client.get('/admin').status_code == 403
    assert post('/api/auth/logout', {}).status_code == 200
    assert client.get('/api/auth/me').json['data']['authenticated'] is False
    assert client.get('/api/patient/dashboard').status_code == 401
    assert post('/api/auth/login', {'username': account['email'].upper(), 'password': account['password']}).status_code == 200
    post('/api/auth/logout', {})
    assert post('/api/auth/login', {'username': account['username'], 'password': account['password']}).status_code == 200


@pytest.mark.parametrize('field,value', [
    ('username', 'ab'), ('username', '<script>'), ('username', 'x' * 33),
    ('username', 12), ('email', ''), ('email', 'bad@'), ('email', []),
    ('phone', '12345'), ('phone', '+0123456789'), ('phone', {}),
    ('password', 'short'), ('password', ' ' * 12), ('password', 'x' * 129),
    ('password', None), ('role', 'admin'), ('active', True),
])
def test_signup_validation(post, account, field, value):
    account[field] = value
    response = post('/api/auth/signup', account)
    assert response.status_code == 400
    assert response.json['success'] is False
    assert response.json['error']['code'] == 'validation_error'


def test_optional_phone(post, account):
    account.pop('phone')
    assert post('/api/auth/signup', account).json['data']['user']['phone'] is None


@pytest.mark.parametrize('duplicate', ['username', 'email'])
def test_duplicate_case_normalization(post, account, duplicate):
    assert post('/api/auth/signup', account).status_code == 201
    second = {**account, 'username': 'another_patient', 'email': 'another@example.com'}
    second[duplicate] = account[duplicate].upper()
    response = post('/api/auth/signup', second)
    assert response.status_code == 409


def test_invalid_and_inactive_login(client, post, account, app):
    post('/api/auth/signup', account)
    post('/api/auth/logout', {})
    wrong = post('/api/auth/login', {'username': account['username'], 'password': 'incorrect password'})
    missing = post('/api/auth/login', {'username': 'missing', 'password': 'incorrect password'})
    assert wrong.status_code == missing.status_code == 401
    assert wrong.json == missing.json
    assert post('/api/auth/login', {'username': [], 'password': 5}).status_code == 400
    post('/api/auth/login', {'username': account['username'], 'password': account['password']})
    with app.app_context():
        user = db.session.scalar(select(User))
        user.active = False
        db.session.commit()
    assert client.get('/api/patient/dashboard').status_code == 401
    assert post('/api/auth/login', {'username': account['username'], 'password': account['password']}).status_code == 401


def test_admin_promotion_and_guards(client, post, account, app):
    for url in ['/api/patient/dashboard', '/api/admin']:
        assert client.get(url).status_code == 401
    for url in ['/dashboard', '/admin', '/admin.html']:
        assert client.get(url).status_code == 302
    post('/api/auth/signup', account)
    assert client.get('/admin.html').status_code == 403
    runner = app.test_cli_runner()
    assert runner.invoke(args=['promote-admin', account['username']]).exit_code == 0
    assert client.get('/api/admin').status_code == 200
    assert client.get('/admin.html').status_code == 200
    assert runner.invoke(args=['promote-admin', 'missing']).exit_code != 0
    # Initialization is repeatable and does not erase users.
    assert runner.invoke(args=['init-db']).exit_code == 0
    assert client.get('/api/auth/me').json['data']['user']['role'] == 'admin'


def test_csrf_origin_and_json(client, post, account):
    assert client.post('/api/auth/signup', json=account).status_code == 403
    assert client.post('/api/auth/signup', data='not-json').status_code == 415
    for value in [[], None, 'text', 123]:
        assert client.post('/api/auth/signup', data=__import__('json').dumps(value), content_type='application/json').status_code == 400
    assert client.post('/api/auth/signup', data='{', content_type='application/json').status_code == 400
    assert post('/api/auth/signup', account, headers={'Origin': 'https://evil.example'}).status_code == 403
    assert post('/api/auth/signup', account, headers={'Origin': 'http://127.0.0.1:8000'}).status_code == 201
    assert client.post('/api/auth/logout', json={}).status_code == 403
    assert client.post('/api/auth/logout', json={}, headers={'X-CSRF-Token': 'é'}).status_code == 403
    assert client.get('/api/auth/me').json['data']['authenticated'] is True
    assert client.post('/api/auth/signup', data=b'x' * 20000, content_type='application/json').status_code == 413


def test_cors(client):
    good = client.options('/api/auth/login', headers={
        'Origin': 'http://127.0.0.1:8000', 'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type,X-CSRF-Token',
    })
    assert good.headers['Access-Control-Allow-Origin'] == 'http://127.0.0.1:8000'
    assert good.headers['Access-Control-Allow-Credentials'] == 'true'
    bad = client.get('/api/auth/me', headers={'Origin': 'https://evil.example'})
    assert 'Access-Control-Allow-Origin' not in bad.headers


def test_secure_cookie_and_expired_session(app, client, post, account):
    app.config['SESSION_COOKIE_SECURE'] = True
    response = post('/api/auth/signup', account)
    assert 'Secure;' in response.headers['Set-Cookie']
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(seconds=-1)
    assert client.get('/api/patient/dashboard').status_code == 401


def test_no_secret_or_backend_files_served(client):
    for path in ['/backend/.env', '/.env', '/backend/app.py', '/README.md', '/css/../../backend/app.py']:
        assert client.get(path).status_code == 404
    response = client.get('/api/notifications')
    assert response.status_code == 401
    assert set(response.json) == {'success', 'data', 'error'}


def test_configuration_rejects_insecure_settings(app):
    for changes in [{'SECRET_KEY': 'short'}, {'FRONTEND_URL': '*'},
                    {'SESSION_COOKIE_SAMESITE': 'None', 'SESSION_COOKIE_SECURE': False},
                    {'PRODUCTION': True, 'SESSION_COOKIE_SECURE': False}]:
        with pytest.raises(ValueError):
            create_app({**app.config, **changes})


def test_session_survives_app_restart(app, client, post, account):
    post('/api/auth/signup', account)
    cookie = client.get_cookie('medtrack_session')
    restarted = create_app(dict(app.config))
    next_client = restarted.test_client()
    next_client.set_cookie('medtrack_session', cookie.value)
    assert next_client.get('/api/auth/me').json['data']['user']['username'] == 'patient_one'
    assert next_client.get('/api/patient/dashboard').status_code == 200
    with restarted.app_context():
        db.session.remove()
        db.engine.dispose()
