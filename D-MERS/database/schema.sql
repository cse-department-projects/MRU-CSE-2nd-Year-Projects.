-- ================================================================
-- DISASTER MANAGEMENT AND EMERGENCY RESPONSE SYSTEM (D-MERS)
-- SUPABASE / POSTGRESQL DATABASE SCHEMA WITH ROW-LEVEL SECURITY (RLS)
-- ================================================================

-- 1. USERS & PROFILES TABLE
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(256) NOT NULL,
    salt VARCHAR(64) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    location VARCHAR(255),
    profile_image VARCHAR(255),
    role VARCHAR(30) NOT NULL DEFAULT 'CITIZEN',
    profile_complete BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. DISASTER REPORTS TABLE
CREATE TABLE IF NOT EXISTS disaster_reports (
    report_id SERIAL PRIMARY KEY,
    citizen_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    disaster_type VARCHAR(50) NOT NULL,
    location VARCHAR(255) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    affected_people INT DEFAULT 1,
    people_needing_help INT DEFAULT 1,
    priority_score INT DEFAULT 50,
    contact_number VARCHAR(20),
    report_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(30) DEFAULT 'REPORTED',
    image_path VARCHAR(255)
);

-- 3. RESCUE TEAMS TABLE
CREATE TABLE IF NOT EXISTS rescue_teams (
    team_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    team_name VARCHAR(100) NOT NULL,
    leader_name VARCHAR(100) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    active_status VARCHAR(30) DEFAULT 'AVAILABLE'
);

-- 4. RESCUE REQUESTS TABLE
CREATE TABLE IF NOT EXISTS rescue_requests (
    request_id SERIAL PRIMARY KEY,
    citizen_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    disaster_report_id INT REFERENCES disaster_reports(report_id) ON DELETE SET NULL,
    contact_number VARCHAR(20) NOT NULL,
    location VARCHAR(255) NOT NULL,
    emergency_type VARCHAR(100) NOT NULL,
    num_people INT DEFAULT 1,
    description TEXT NOT NULL,
    medical_required BOOLEAN DEFAULT FALSE,
    priority_score INT DEFAULT 50,
    priority VARCHAR(20) DEFAULT 'MEDIUM',
    status VARCHAR(30) DEFAULT 'PENDING',
    assigned_team_id INT REFERENCES rescue_teams(team_id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. VOLUNTEERS TABLE
CREATE TABLE IF NOT EXISTS volunteers (
    volunteer_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    skill VARCHAR(50) NOT NULL,
    availability VARCHAR(30) DEFAULT 'AVAILABLE',
    location VARCHAR(255) NOT NULL,
    active_tasks_count INT DEFAULT 0
);

-- 6. VOLUNTEER TASKS TABLE
CREATE TABLE IF NOT EXISTS volunteer_tasks (
    task_id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    required_skill VARCHAR(50) NOT NULL,
    disaster_report_id INT REFERENCES disaster_reports(report_id) ON DELETE SET NULL,
    assigned_volunteer_id INT REFERENCES volunteers(volunteer_id) ON DELETE SET NULL,
    status VARCHAR(30) DEFAULT 'OPEN',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. SHELTERS TABLE
CREATE TABLE IF NOT EXISTS shelters (
    shelter_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    location VARCHAR(255) NOT NULL,
    capacity INT NOT NULL,
    current_occupancy INT DEFAULT 0,
    food_available BOOLEAN DEFAULT TRUE,
    water_available BOOLEAN DEFAULT TRUE,
    medical_facility BOOLEAN DEFAULT TRUE,
    contact_number VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. MISSING PERSONS TABLE
CREATE TABLE IF NOT EXISTS missing_persons (
    person_id SERIAL PRIMARY KEY,
    reporter_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    age INT NOT NULL,
    gender VARCHAR(20) NOT NULL,
    last_seen_location VARCHAR(255) NOT NULL,
    date_last_seen DATE NOT NULL,
    description TEXT NOT NULL,
    contact_info VARCHAR(100) NOT NULL,
    photo_path VARCHAR(255),
    status VARCHAR(20) DEFAULT 'MISSING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. EMERGENCY ALERTS TABLE
CREATE TABLE IF NOT EXISTS emergency_alerts (
    alert_id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    disaster_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. EMERGENCY TIMELINE TABLE
CREATE TABLE IF NOT EXISTS emergency_timeline (
    id SERIAL PRIMARY KEY,
    rescue_request_id INT NOT NULL REFERENCES rescue_requests(request_id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    created_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    read_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. EMERGENCY HELPLINE CONTACTS TABLE
CREATE TABLE IF NOT EXISTS emergency_contacts (
    id SERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    title VARCHAR(100) NOT NULL,
    phone_number VARCHAR(30) NOT NULL,
    location VARCHAR(100),
    notes TEXT,
    is_official BOOLEAN DEFAULT TRUE
);

-- 13. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    log_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- SUPABASE ROW-LEVEL SECURITY (RLS) POLICIES
-- ================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE disaster_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE rescue_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE shelters ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_tasks ENABLE ROW LEVEL SECURITY;

-- Public read access policies for shelters and alerts
CREATE POLICY "Public read shelters" ON shelters FOR SELECT USING (true);
CREATE POLICY "Public read emergency alerts" ON emergency_alerts FOR SELECT USING (true);
