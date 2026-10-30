# MedTrack — Smart Medication Management System

MedTrack is a full-stack healthcare prototype that helps patients scan prescriptions, confirm extracted medicines, create dose schedules, track adherence, and receive medicine reminders by email. It also provides a protected administrator portal for reviewing users, medications, reminder delivery records, and prescription reports.

> MedTrack is an academic prototype and is not a replacement for medical advice. AI-extracted prescription information remains an unverified draft until the user confirms it.

## Live demonstration

- Patient application: <https://medtrack-nitya.witty-mink-1617.chatgpt.site>
- Admin portal: <https://medtrack-nitya.witty-mink-1617.chatgpt.site/admin>
- Backend health endpoint: <https://medtrack-customer-production-13a3.up.railway.app/api/health>

## Main features

- User registration, login, logout, and cookie-based sessions
- Prescription image validation and AI-assisted medicine extraction
- Manual prescription entry when AI extraction is unavailable
- User confirmation before extracted medicines are saved
- Multiple medicines and independent dose schedules
- Taken, delayed, missed, skipped, and upcoming dose states
- Adherence reports and medication history
- Email medicine reminders with patient-time-zone support
- Caregiver escalation records
- Role-protected administration portal
- Administrator audit records for medication changes
- PostgreSQL production database with Alembic migrations

## Technology stack

### Frontend

- HTML5
- CSS3
- Vanilla JavaScript
- Fetch API and XMLHttpRequest
- Font Awesome

### Backend

- Python 3
- Flask
- Flask-SQLAlchemy
- Flask-Login
- Flask-CORS
- Flask-Mail
- Flask-Limiter
- Pydantic
- APScheduler
- Gunicorn

### Data and integrations

- PostgreSQL on Railway for production
- SQLite for local development
- SQLAlchemy ORM and Alembic/Flask-Migrate
- Groq multimodal API for prescription extraction
- Gmail-compatible SMTP for reminder emails

### Deployment

- Frontend: OpenAI Sites
- Backend: Railway
- Database: Railway PostgreSQL
- Source control: GitHub

## Architecture

```text
Patient or Administrator Browser
              |
              v
Static HTML/CSS/JavaScript Frontend
              |
      HTTPS + JSON + Cookies
              |
              v
       Flask REST API on Railway
       |        |          |
       |        |          +--> APScheduler + SMTP reminders
       |        +-------------> Groq prescription extraction
       +----------------------> PostgreSQL database
```

The frontend never contains database credentials, mail passwords, session secrets, or the Groq API key. Those values are configured only as backend environment variables.

## Repository structure

```text
MedTrack/
├── README.md
├── .gitignore
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── signup.html
│   ├── admin.html
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── config.js
│       ├── api.js
│       ├── auth.js
│       ├── script.js
│       └── admin.js
└── backend/
    ├── app.py
    ├── requirements.txt
    ├── railway.json
    ├── .env.example
    ├── medtrack/
    │   ├── __init__.py
    │   ├── config.py
    │   ├── extensions.py
    │   ├── models.py
    │   ├── routes.py
    │   ├── schemas.py
    │   ├── validation.py
    │   ├── groq_service.py
    │   ├── reminders.py
    │   ├── scheduler.py
    │   ├── uploads.py
    │   └── responses.py
    ├── migrations/
    └── tests/
```

## Local setup

### 1. Prerequisites

- Python 3.11 or newer
- A modern web browser
- Optional Groq API key for AI prescription scanning
- Optional SMTP account for email reminders

### 2. Create the backend environment

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Update `.env` with your own development values. Never commit `.env`.

Generate a strong Flask secret:

```powershell
python -c "import secrets; print(secrets.token_hex(32))"
```

Place the generated value in `SECRET_KEY` inside `.env`.

### 3. Initialize the database

```powershell
python -m flask --app app db upgrade
```

For local development, the default `DATABASE_URL=sqlite:///medtrack.db` creates a local SQLite database.

### 4. Start the backend

```powershell
python -m flask --app app run --host 127.0.0.1 --port 5000
```

### 5. Start the frontend

Open another terminal from the repository root:

```powershell
cd frontend
python -m http.server 8000
```

Open <http://127.0.0.1:8000>.

For local cross-origin sessions, set these backend values:

```dotenv
FRONTEND_URL=http://127.0.0.1:8000
SESSION_COOKIE_SECURE=false
SESSION_COOKIE_SAMESITE=Lax
```

## Environment variables

The complete safe template is provided in `backend/.env.example`.

| Variable | Purpose |
| --- | --- |
| `SECRET_KEY` | Signs Flask sessions and must be random and private |
| `APP_ENV` | `development` or `production` |
| `DATABASE_URL` | SQLite or PostgreSQL connection string |
| `FRONTEND_URL` | Exact allowed frontend origin |
| `GROQ_API_KEY` | Groq API credential used only by the backend |
| `GROQ_VISION_MODEL` | Configured multimodal model |
| `MAX_UPLOAD_MB` | Maximum prescription-image size |
| `MAIL_SERVER` | SMTP host |
| `MAIL_PORT` | SMTP port |
| `MAIL_USERNAME` | SMTP login username |
| `MAIL_PASSWORD` | SMTP password or app password |
| `MAIL_DEFAULT_SENDER` | Sender displayed in reminder emails |
| `SCHEDULER_ENABLED` | Enables scheduled reminder processing |

## Authentication and security

- Passwords are stored as hashes rather than plaintext.
- Authentication uses Secure and HttpOnly cookies in production.
- State-changing API requests require a CSRF token.
- CORS is limited to the configured frontend origin.
- Public signup cannot select an administrator role.
- Every `/api/admin/*` endpoint checks the administrator role on the server.
- Prescription uploads are checked for file type, size, and valid image content.
- Rate limits protect authentication and high-cost endpoints.
- Sensitive values are read from backend environment variables.

## Creating an administrator

Create a normal user account first. From the backend environment, run:

```powershell
python -m flask --app app promote-admin USERNAME
```

Do not add an administrator option to public signup.

## Running tests

```powershell
cd backend
pytest -q
```

The test suite covers authentication, frontend delivery, prescription workflows, multiple medicines, schedules, reminders, administration behavior, and data ownership.

## API overview

| Area | Example endpoints |
| --- | --- |
| Authentication | `/api/auth/signup`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me` |
| Prescriptions | `/api/scan`, `/api/prescriptions`, draft confirmation routes |
| Medication tracking | `/api/schedule`, `/api/take/<id>`, medication and schedule routes |
| Reports | `/api/reports` |
| Reminders | Reminder and caregiver routes |
| Administration | `/api/admin/overview`, `/api/admin/users`, `/api/admin/medications` |
| Operations | `/api/health` |

## Production deployment

### Backend and database

The included `backend/railway.json` configures Railway to:

- install dependencies using Railpack,
- run database migrations before deployment,
- start Gunicorn with `gunicorn app:app`, and
- check `/api/health`.

Set production environment variables in Railway. Use PostgreSQL for `DATABASE_URL` and set `FRONTEND_URL` to the exact deployed frontend origin.

### Frontend

Deploy the contents of `frontend/` as a static website. Update `frontend/js/config.js` if the backend URL changes.

## Privacy notice

This repository intentionally excludes:

- `.env` files
- Groq and SMTP credentials
- production database contents
- prescription uploads
- session cookies
- patient runtime data

Use only synthetic or properly authorized data during demonstrations.

## Academic context

This project was developed as a second-year Computer Science and Engineering academic project. It demonstrates full-stack web development, authentication, relational data modelling, AI-assisted extraction, scheduled background work, email integration, deployment, and secure role-based administration.

