# AthleteHub

AthleteHub is an enterprise-grade sports management platform for sports organizations, coaches, recruiters, and athletes. It provides comprehensive tools for athlete tracking, tournament and match organization, training and attendance management, and talent recruitment.

Built with **Java Spring Boot 3** on the backend and **React 19 + Vite** on the frontend, AthleteHub utilizes **MySQL** with automatic schema synchronization and includes built-in Role-Based Access Control (RBAC).

---

## Table of Contents

- [Quick Start Guide for New Users](#quick-start-guide-for-new-users)
- [Prerequisites](#prerequisites)
- [Default Login Credentials](#default-login-credentials)
- [Project Architecture](#project-architecture)
- [Backend Setup (Spring Boot)](#backend-setup-spring-boot)
- [Frontend Setup (React + Vite)](#frontend-setup-react--vite)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Troubleshooting & FAQ](#troubleshooting--faq)
- [Contributing & Git Workflow](#contributing--git-workflow)

---

## Quick Start Guide for New Users

Follow these steps to run AthleteHub on your machine after cloning this repository.

### Step 1: Clone the Repository
```bash
git clone <YOUR_GIT_REPOSITORY_URL>
cd Athlete-hub
```

### Step 2: Set Up MySQL Database
1. Make sure **MySQL Server** is running on your machine (default port `3306`).
2. Log in to your MySQL terminal or Workbench:
   ```bash
   mysql -u root -p
   ```
3. Create the database:
   ```sql
   CREATE DATABASE IF NOT EXISTS athletehub;
   ```
4. Configure database credentials in `backend/src/main/resources/application.yml`:
   ```yaml
   spring:
     datasource:
       url: jdbc:mysql://localhost:3306/athletehub?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
       username: root
       password: your_mysql_password   # Default is 'connect'
   ```

### Step 3: Configure Frontend Environment
In the `frontend` folder, create your `.env` file from the provided example template:
- **Windows (Command Prompt):**
  ```cmd
  copy frontend\.env.example frontend\.env
  ```
- **macOS / Linux / PowerShell:**
  ```bash
  cp frontend/.env.example frontend/.env
  ```
Confirm that `frontend/.env` contains:
```ini
VITE_API_URL=http://localhost:8080/api/v1
```

### Step 4: Run the Application

#### Option A: 1-Click Launch (Windows)
Double-click `start_all.bat` or run:
```cmd
start_all.bat
```
This automatically frees port 8080 if previously occupied, launches the Spring Boot backend, and starts the Vite frontend dev server in separate windows.

#### Option B: Manual Launch (Cross-Platform)

**1. Launch Backend:**
```bash
cd backend
mvn spring-boot:run
```
*(Windows users without Maven installed can use the bundled Maven distribution: `..\maven\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run`)*

Backend will start at: **`http://localhost:8080`**

**2. Launch Frontend:**
```bash
cd frontend
npm install
npm run dev
```
Frontend will start at: **`http://localhost:5173`**

---

## Prerequisites

| Requirement | Supported Versions | Notes |
|---|---|---|
| **Java JDK** | Java 21, Java 25 | Verify with `java -version` |
| **Node.js & npm** | Node 18+ (Node 20+ LTS recommended) | Verify with `node -v` & `npm -v` |
| **MySQL Server** | MySQL 8.0+ | Port `3306` |
| **Apache Maven** | Maven 3.9+ | Bundled Maven included in `maven/` for Windows |
| **Git** | Git 2.x+ | Verify with `git --version` |

---

## Default Login Credentials

On initial startup, `DataInitializer` automatically configures the database tables and provisions the following pre-seeded test accounts:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Super Admin** | `super_admin@athletehub.com` | `Password123!` | Full system administration and organization oversight |
| **Super Admin** | `admin@athletehub.local` | `Password123!` | Alternate local super admin |
| **Org Admin** | `super_org@athletehub.com` | `Password123!` | Organization and coach management |
| **New User** | *(Register via UI)* | *(User defined)* | Sign up at `http://localhost:5173/register` |

---

## Project Architecture

```text
Athlete-hub/
├── backend/                              # Spring Boot REST API
│   ├── src/main/java/com/athletehub/api/
│   │   ├── config/                       # Security, CORS, and Data Initializer
│   │   ├── controller/                   # REST API controllers
│   │   ├── dto/                          # Data Transfer Objects & Mappers
│   │   ├── entity/                       # JPA Database Entities
│   │   ├── repository/                   # Spring Data JPA Repositories
│   │   ├── security/                     # JWT tokens & UserDetailsService
│   │   └── service/                      # Business logic layer
│   ├── src/main/resources/
│   │   └── application.yml               # Database, server, and JWT settings
│   └── pom.xml                           # Maven dependencies
├── frontend/                             # React + Vite Client
│   ├── src/
│   │   ├── api/                          # Axios API clients & interceptors
│   │   ├── components/                   # Reusable UI components & layouts
│   │   ├── contexts/                     # React Contexts (Auth, Theme)
│   │   ├── pages/                        # Views (Dashboards, Tournaments, etc.)
│   │   └── utils/                        # Formatting and helper utilities
│   ├── .env.example                      # Template for frontend environment
│   ├── package.json                      # Dependencies and npm scripts
│   └── vite.config.js                    # Vite bundler configuration
├── maven/                                # Bundled portable Apache Maven
├── data/                                 # Datasets (e.g. athletes.csv)
├── start_all.bat                         # Launches backend + frontend concurrently
├── start_backend.bat                     # Windows backend launcher
├── start_frontend.bat                    # Windows frontend launcher
└── README.md                             # Project documentation
```

---

## Backend Setup (Spring Boot)

1. **Verify Database:**
   Ensure MySQL is running and the database `athletehub` exists.
2. **Navigate and Compile:**
   ```bash
   cd backend
   mvn clean compile
   ```
3. **Run the Application:**
   ```bash
   mvn spring-boot:run
   ```
4. **Package for Production:**
   ```bash
   mvn clean package -DskipTests
   ```
   The runnable JAR file will be generated in `backend/target/athletehub-api-0.0.1-SNAPSHOT.jar`.

---

## Frontend Setup (React + Vite)

1. **Navigate to Frontend:**
   ```bash
   cd frontend
   ```
2. **Install Dependencies:**
   ```bash
   npm install
   ```
3. **Start Development Server:**
   ```bash
   npm run dev
   ```
4. **Production Build:**
   ```bash
   npm run build
   ```
5. **Linting:**
   ```bash
   npm run lint
   ```

---

## Environment Variables

### Backend Configuration (`backend/src/main/resources/application.yml`)
- `spring.datasource.url`: MySQL JDBC connection string (default: `jdbc:mysql://localhost:3306/athletehub`).
- `spring.datasource.username`: Database user (default: `root`).
- `spring.datasource.password`: Database password (default: `connect`).
- `jwt.secret`: Minimum 32-byte secret key for HMAC-SHA256 signature verification.
- `jwt.expiration`: Access token lifetime in milliseconds (default: `3600000` = 1 hour).
- `server.port`: HTTP server port (default: `8080`).

### Frontend Configuration (`frontend/.env`)
```ini
# Base URL for Backend REST API
VITE_API_URL=http://localhost:8080/api/v1
```

---

## API Reference

The backend uses standard RESTful routes with JSON payloads and Bearer token JWT authentication:

### 1. Authentication (`/api/auth`)
- `POST /api/auth/register` - Create a new user account
- `POST /api/auth/login` - Authenticate with email/password and obtain JWT token
- `GET /api/auth/me` - Fetch profile of the currently logged-in user
- `PUT /api/auth/me` - Update profile of current user

### 2. Athletes (`/api/v1/athletes`)
- `GET /api/v1/athletes` - List athletes with pagination, search, and filters
- `GET /api/v1/athletes/{id}` - Retrieve athlete profile and sports details
- `POST /api/v1/athletes` - Create new athlete profile
- `PUT /api/v1/athletes/{id}` - Update athlete record
- `DELETE /api/v1/athletes/{id}` - Delete athlete record

### 3. Organizations (`/api/v1/organizations`)
- `GET /api/v1/organizations` - List all registered sports organizations
- `GET /api/v1/organizations/{id}` - Retrieve organization details
- `POST /api/v1/organizations` - Register an organization
- `PUT /api/v1/organizations/{id}` - Update organization details
- `GET /api/v1/organizations/{id}/athletes` - List athletes registered under the organization

### 4. Events & Tournaments (`/api/v1/events` & `/api/v1/tournaments`)
- `GET /api/v1/events` - Retrieve calendar events and fixtures
- `POST /api/v1/tournaments` - Create tournaments and initialize brackets
- `GET /api/v1/tournaments/{id}` - View tournament standings and match outcomes

---

## Troubleshooting & FAQ

### 1. `Port 8080 is already in use`
A previously terminated Spring Boot instance may still be holding the port.
- **Windows Solution:** Run `start_backend.bat` (it automatically terminates any process on port 8080) or execute in PowerShell:
  ```powershell
  Get-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess | Stop-Process -Force
  ```
- **macOS / Linux Solution:**
  ```bash
  lsof -ti :8080 | xargs kill -9
  ```

### 2. `Access denied for user 'root'@'localhost'`
Ensure that the credentials in `backend/src/main/resources/application.yml` match your local MySQL server's root user password.

### 3. `Unknown database 'athletehub'`
Create the database before starting the backend:
```sql
CREATE DATABASE athletehub;
```

### 4. `npm error: ERESOLVE unable to resolve dependency tree`
Run the install command with legacy peer dependencies:
```bash
npm install --legacy-peer-deps
```

### 5. `Java version incompatibility`
Make sure you have JDK 21 or newer installed and that `JAVA_HOME` points to your JDK directory:
```bash
java -version
```

---

## Contributing & Git Workflow

When contributing changes to this project:

1. **Create a Feature Branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Commit Changes with Clear Messages:**
   ```bash
   git commit -m "feat: implement athlete fitness score widget"
   ```
3. **Verify Build & Tests Before Pushing:**
   ```bash
   # In backend
   mvn test
   # In frontend
   npm run build
   ```
4. **Push to Remote:**
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a **Pull Request (PR)** against the `main` branch.
