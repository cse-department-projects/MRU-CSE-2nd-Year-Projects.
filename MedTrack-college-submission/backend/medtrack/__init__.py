import hmac
import json
import logging
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path

import click
from dotenv import load_dotenv
from flask import Flask, redirect, request, send_from_directory, session
from flask_cors import CORS
from flask_login import login_required
from sqlalchemy import inspect, select, text
from werkzeug.exceptions import HTTPException

from .config import environment_config, validate_config
from .extensions import db, limiter, login_manager, mail, migrate
from .models import Prescription, User
from .responses import fail
from .routes import admin_required, api

BACKEND = Path(__file__).resolve().parents[1]
FRONTEND = BACKEND.parent / 'TRACK FRONT'


class JsonFormatter(logging.Formatter):
    def format(self, record):
        return json.dumps({'timestamp': datetime.now(timezone.utc).isoformat(), 'level': record.levelname,
                           'logger': record.name, 'message': record.getMessage()})


def create_app(test_config=None):
    load_dotenv(BACKEND / '.env')
    app = Flask(__name__, static_folder=None, instance_path=str(BACKEND / 'instance'))
    app.config.from_mapping(environment_config())
    if test_config:
        app.config.update(test_config)
    validate_config(app.config)
    Path(app.instance_path).mkdir(exist_ok=True)
    app.config.setdefault('UPLOAD_FOLDER', str(Path(app.instance_path) / 'uploads'))
    db.init_app(app)
    login_manager.init_app(app)
    mail.init_app(app)
    limiter.init_app(app)
    migrate.init_app(app, db)
    CORS(app, resources={r'/api/*': {'origins': [app.config['FRONTEND_URL']]}},
         supports_credentials=True, methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
         allow_headers=['Content-Type', 'X-CSRF-Token'])
    app.register_blueprint(api)
    if not app.testing:
        handler = logging.StreamHandler(); handler.setFormatter(JsonFormatter())
        app.logger.handlers.clear(); app.logger.addHandler(handler); app.logger.setLevel(logging.INFO)

    @login_manager.user_loader
    def load_user(user_id):
        try:
            user = db.session.get(User, int(user_id))
            return user if user and user.active else None
        except (ValueError, TypeError):
            return None

    @login_manager.unauthorized_handler
    def unauthorized():
        if request.path.startswith('/api/'):
            return fail('unauthenticated', 'Please sign in to continue.', 401)
        return redirect('/login.html')

    @app.before_request
    def protect_mutations():
        if not request.path.startswith('/api/') or request.method in ('GET', 'HEAD', 'OPTIONS'):
            return None
        origin = request.headers.get('Origin')
        if origin and origin not in (app.config['FRONTEND_URL'], request.host_url.rstrip('/')):
            return fail('invalid_origin', 'Request origin is not allowed.', 403)
        if request.path == '/api/scan' and request.mimetype == 'multipart/form-data':
            payload = None
        elif request.method == 'DELETE' and not request.data:
            payload = {}
        elif not request.is_json:
            return fail('invalid_json', 'Send a JSON object with Content-Type application/json.', 415)
        else:
            if request.content_length and request.content_length > 16 * 1024:
                return fail('request_too_large', 'JSON request body is too large.', 413)
            payload = request.get_json(silent=True)
        if request.path != '/api/scan' and not isinstance(payload, dict):
            return fail('invalid_json', 'Request body must be a valid JSON object.', 400)
        expected = session.get('csrf_token')
        supplied = request.headers.get('X-CSRF-Token', '')
        if not expected or not hmac.compare_digest(expected.encode('utf-8'), supplied.encode('utf-8')):
            return fail('csrf_failed', 'Your session changed. Refresh the page and try again.', 403)

    @app.after_request
    def security_headers(response):
        if request.path.startswith('/api/') or request.path in ('/dashboard', '/admin', '/admin.html'):
            response.headers['Cache-Control'] = 'no-store'
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['Referrer-Policy'] = 'same-origin'
        return response

    @app.errorhandler(HTTPException)
    def http_error(error):
        return fail(error.name.lower().replace(' ', '_'), error.description, error.code)

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return fail('server_error', 'The server could not complete your request.', 500)

    @app.get('/api/health')
    def health():
        try:
            db.session.execute(select(1))
            return {'success': True, 'data': {'status': 'healthy', 'database': 'reachable'}, 'error': None}
        except Exception:
            db.session.rollback()
            return fail('unhealthy', 'Database health check failed.', 503)

    @app.get('/')
    @app.get('/index.html')
    def home():
        return send_from_directory(FRONTEND, 'index.html')

    @app.get('/dashboard')
    @login_required
    def dashboard_page():
        return send_from_directory(FRONTEND, 'index.html')

    @app.get('/admin')
    @app.get('/admin.html')
    @admin_required
    def admin_page():
        return send_from_directory(FRONTEND, 'admin.html')

    @app.get('/<page>.html')
    def auth_page(page):
        if page not in ('login', 'signup'):
            return fail('not_found', 'Page not found.', 404)
        return send_from_directory(FRONTEND, f'{page}.html')

    @app.get('/<asset_type>/<path:filename>')
    def assets(asset_type, filename):
        if asset_type not in ('css', 'js'):
            return fail('not_found', 'Asset not found.', 404)
        return send_from_directory(FRONTEND / asset_type, filename)

    @app.cli.command('init-db')
    def init_db():
        """Create missing tables; never drop existing data."""
        db.create_all()
        click.echo('Database initialized.')

    @app.cli.command('promote-admin')
    @click.argument('username')
    def promote_admin(username):
        """Explicit local-only promotion of an existing account."""
        user = db.session.scalar(select(User).where(User.username == username.lower()))
        if not user or not user.active:
            raise click.ClickException('Active user not found. Create a patient account first.')
        user.role = 'admin'
        db.session.commit()
        click.echo(f'{user.username} is now an administrator.')

    @app.cli.command('cleanup-uploads')
    @click.option('--older-than-days', default=30, type=click.IntRange(1, 3650))
    def cleanup_uploads(older_than_days):
        """Delete old files that are not attached to an active draft or confirmed prescription."""
        cutoff = datetime.now(timezone.utc) - timedelta(days=older_than_days)
        rows = db.session.scalars(select(Prescription).where(Prescription.uploaded_at < cutoff,
            Prescription.extraction_status.in_(['failed', 'draft']))).all()
        removed = 0
        for row in rows:
            if row.image_path:
                path = Path(app.config['UPLOAD_FOLDER']) / Path(row.image_path).name
                if path.is_file(): path.unlink(); removed += 1
                row.image_path = None
        db.session.commit(); click.echo(f'Removed {removed} upload(s).')

    @app.cli.command('upgrade-phase3-local')
    def upgrade_phase3_local():
        """Preserve a Phase 2 SQLite database while adding Phase 3 tables and columns."""
        if db.engine.dialect.name != 'sqlite':
            raise click.ClickException('Use `flask db upgrade` for PostgreSQL and other production databases.')
        tables = inspect(db.engine).get_table_names()
        if 'users' in tables:
            columns = {column['name'] for column in inspect(db.engine).get_columns('users')}
            if 'timezone' not in columns:
                db.session.execute(text("ALTER TABLE users ADD COLUMN timezone VARCHAR(64) NOT NULL DEFAULT 'Asia/Kolkata'"))
        if 'dose_schedules' in tables:
            columns = {column['name'] for column in inspect(db.engine).get_columns('dose_schedules')}
            if 'active' not in columns:
                db.session.execute(text('ALTER TABLE dose_schedules ADD COLUMN active BOOLEAN NOT NULL DEFAULT 1'))
            additions = {
                'period': "VARCHAR(16) NOT NULL DEFAULT 'custom'",
                'timezone': "VARCHAR(64) NOT NULL DEFAULT 'UTC'",
                'enabled': 'BOOLEAN NOT NULL DEFAULT 1',
                'next_reminder_at': 'DATETIME',
            }
            for name, definition in additions.items():
                if name not in columns: db.session.execute(text(f'ALTER TABLE dose_schedules ADD COLUMN {name} {definition}'))
        if 'medications' in tables:
            columns = {column['name'] for column in inspect(db.engine).get_columns('medications')}
            if 'start_date' not in columns: db.session.execute(text('ALTER TABLE medications ADD COLUMN start_date DATE'))
            if 'end_date' not in columns: db.session.execute(text('ALTER TABLE medications ADD COLUMN end_date DATE'))
        db.session.commit(); db.create_all(); click.echo('Local Phase 2 database upgraded to Phase 3.')

    from .scheduler import start_scheduler
    start_scheduler(app)

    return app
