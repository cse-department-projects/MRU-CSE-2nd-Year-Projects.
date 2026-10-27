-- ================================================================
-- DISASTER MANAGEMENT AND EMERGENCY RESPONSE SYSTEM
-- Complete MySQL Database Schema and Demo Seed Data
-- ================================================================

CREATE DATABASE IF NOT EXISTS disaster_management;
USE disaster_management;

-- Disable Foreign Key checks temporarily for clean initialization
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS emergency_alerts;
DROP TABLE IF EXISTS missing_persons;
DROP TABLE IF EXISTS shelters;
DROP TABLE IF EXISTS volunteer_tasks;
DROP TABLE IF EXISTS volunteers;
DROP TABLE IF EXISTS rescue_teams;
DROP TABLE IF EXISTS rescue_requests;
DROP TABLE IF EXISTS disaster_reports;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- ----------------------------------------------------------------
-- 1. USERS TABLE
-- ----------------------------------------------------------------
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(256) NOT NULL,
    salt VARCHAR(64) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    role ENUM('ADMIN', 'CITIZEN', 'RESCUE_TEAM', 'VOLUNTEER') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------
-- 2. DISASTER REPORTS TABLE
-- ----------------------------------------------------------------
CREATE TABLE disaster_reports (
    report_id INT AUTO_INCREMENT PRIMARY KEY,
    citizen_id INT NOT NULL,
    disaster_type ENUM('FLOOD', 'EARTHQUAKE', 'CYCLONE', 'FIRE', 'LANDSLIDE', 'COLLAPSE', 'OTHER') NOT NULL,
    location VARCHAR(255) NOT NULL,
    severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL,
    description TEXT NOT NULL,
    report_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('REPORTED', 'VERIFIED', 'IN_ACTION', 'RESOLVED', 'REJECTED') DEFAULT 'REPORTED',
    image_path VARCHAR(255),
    FOREIGN KEY (citizen_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------------
-- 3. RESCUE TEAMS TABLE
-- ----------------------------------------------------------------
CREATE TABLE rescue_teams (
    team_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    team_name VARCHAR(100) NOT NULL,
    leader_name VARCHAR(100) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    active_status ENUM('AVAILABLE', 'DEPLOYED', 'OFF_DUTY') DEFAULT 'AVAILABLE',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------------
-- 4. RESCUE REQUESTS TABLE
-- ----------------------------------------------------------------
CREATE TABLE rescue_requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    citizen_id INT NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    location VARCHAR(255) NOT NULL,
    emergency_type VARCHAR(100) NOT NULL,
    num_people INT DEFAULT 1,
    description TEXT NOT NULL,
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
    status ENUM('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
    assigned_team_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (citizen_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_team_id) REFERENCES rescue_teams(team_id) ON DELETE SET NULL
);

-- ----------------------------------------------------------------
-- 5. VOLUNTEERS TABLE
-- ----------------------------------------------------------------
CREATE TABLE volunteers (
    volunteer_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    skill ENUM('FIRST_AID', 'MEDICAL_ASSISTANCE', 'FOOD_DISTRIBUTION', 'RESCUE_SUPPORT', 'TRANSPORTATION', 'COMMUNICATION') NOT NULL,
    availability ENUM('AVAILABLE', 'BUSY', 'UNAVAILABLE') DEFAULT 'AVAILABLE',
    location VARCHAR(255) NOT NULL,
    active_tasks_count INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------------
-- 6. VOLUNTEER TASKS TABLE
-- ----------------------------------------------------------------
CREATE TABLE volunteer_tasks (
    task_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    required_skill ENUM('FIRST_AID', 'MEDICAL_ASSISTANCE', 'FOOD_DISTRIBUTION', 'RESCUE_SUPPORT', 'TRANSPORTATION', 'COMMUNICATION') NOT NULL,
    disaster_report_id INT NULL,
    assigned_volunteer_id INT NULL,
    status ENUM('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (disaster_report_id) REFERENCES disaster_reports(report_id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_volunteer_id) REFERENCES volunteers(volunteer_id) ON DELETE SET NULL
);

-- ----------------------------------------------------------------
-- 7. SHELTERS TABLE
-- ----------------------------------------------------------------
CREATE TABLE shelters (
    shelter_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    location VARCHAR(255) NOT NULL,
    capacity INT NOT NULL,
    current_occupancy INT DEFAULT 0,
    food_available BOOLEAN DEFAULT TRUE,
    water_available BOOLEAN DEFAULT TRUE,
    medical_facility BOOLEAN DEFAULT TRUE,
    contact_number VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------
-- 8. MISSING PERSONS TABLE
-- ----------------------------------------------------------------
CREATE TABLE missing_persons (
    person_id INT AUTO_INCREMENT PRIMARY KEY,
    reporter_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    age INT NOT NULL,
    gender ENUM('MALE', 'FEMALE', 'OTHER') NOT NULL,
    last_seen_location VARCHAR(255) NOT NULL,
    date_last_seen DATE NOT NULL,
    description TEXT NOT NULL,
    contact_info VARCHAR(100) NOT NULL,
    photo_path VARCHAR(255),
    status ENUM('MISSING', 'FOUND') DEFAULT 'MISSING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------------
-- 9. EMERGENCY ALERTS TABLE
-- ----------------------------------------------------------------
CREATE TABLE emergency_alerts (
    alert_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    disaster_type ENUM('FLOOD', 'EARTHQUAKE', 'CYCLONE', 'FIRE', 'LANDSLIDE', 'COLLAPSE', 'OTHER') NOT NULL,
    severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------
-- 10. AUDIT LOGS TABLE
-- ----------------------------------------------------------------
CREATE TABLE audit_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    action VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ================================================================
-- SAMPLE DEMO DATA
-- Password for all accounts is their standard password (e.g. admin123)
-- SHA-256 Hashed password for demo setup: 
-- Hash calculation: SHA256("password" + salt)
-- We pre-seed working credentials for:
-- 1. admin     / admin123
-- 2. citizen   / citizen123
-- 3. rescue    / rescue123
-- 4. volunteer / volunteer123
-- ================================================================

-- Default Salt: "DMES_SALT_2026"
-- SHA256("admin123" + "DMES_SALT_2026") = 5f042e391307dd7b26c6e7a2b97c0c1694aa2b2203716d0046b8be90dd28003f
-- SHA256("citizen123" + "DMES_SALT_2026") = a57cb36dcbe90fb8fa4eeecdcbc1a9b2b5edcbe5d5b78ca9094778103c62ebc2
-- SHA256("rescue123" + "DMES_SALT_2026") = fdcbdbe90234a9ef1c9b3e34b9d03328e18378d3876e5d8366472251a37c95e1
-- SHA256("volunteer123" + "DMES_SALT_2026") = d37633cb8e678bfd8b8eb306631ad02e9cf76f9dcdbc01a61c37b78997c276ee

INSERT INTO users (id, username, password_hash, salt, full_name, email, phone, role) VALUES
(1, 'admin', '5f042e391307dd7b26c6e7a2b97c0c1694aa2b2203716d0046b8be90dd28003f', 'DMES_SALT_2026', 'System Administrator', 'admin@disaster.gov', '9876543210', 'ADMIN'),
(2, 'citizen', 'a57cb36dcbe90fb8fa4eeecdcbc1a9b2b5edcbe5d5b78ca9094778103c62ebc2', 'DMES_SALT_2026', 'John Doe (Citizen)', 'citizen@gmail.com', '9876543211', 'CITIZEN'),
(3, 'rescue', 'fdcbdbe90234a9ef1c9b3e34b9d03328e18378d3876e5d8366472251a37c95e1', 'DMES_SALT_2026', 'Captain Alex Mercer', 'rescue@ndrf.gov', '9876543212', 'RESCUE_TEAM'),
(4, 'volunteer', 'd37633cb8e678bfd8b8eb306631ad02e9cf76f9dcdbc01a61c37b78997c276ee', 'DMES_SALT_2026', 'Sarah Jenkins', 'volunteer@redcross.org', '9876543213', 'VOLUNTEER');

-- Rescue Team Profile
INSERT INTO rescue_teams (team_id, user_id, team_name, leader_name, contact_number, specialization, active_status) VALUES
(1, 3, 'Alpha Rapid Response Unit', 'Captain Alex Mercer', '9876543212', 'Flood & Structural Rescue', 'AVAILABLE');

-- Volunteer Profile
INSERT INTO volunteers (volunteer_id, user_id, phone, email, skill, availability, location, active_tasks_count) VALUES
(1, 4, '9876543213', 'volunteer@redcross.org', 'FIRST_AID', 'AVAILABLE', 'Central City Sector 4', 1);

-- Sample Disaster Reports
INSERT INTO disaster_reports (report_id, citizen_id, disaster_type, location, severity, description, status) VALUES
(101, 2, 'FLOOD', 'Riverbank Colony Sector 5', 'CRITICAL', 'Water level crossed danger line. 15 families stranded on rooftop.', 'IN_ACTION'),
(102, 2, 'FIRE', 'Industrial Area Warehouse 12', 'HIGH', 'Electrical short circuit causing fire outbreak near fuel depot.', 'REPORTED'),
(103, 2, 'CYCLONE', 'Coastal Highway Mile 14', 'MEDIUM', 'Fallen trees blocking main evacuation route.', 'VERIFIED');

-- Sample Rescue Requests
INSERT INTO rescue_requests (request_id, citizen_id, contact_number, location, emergency_type, num_people, description, priority, status, assigned_team_id) VALUES
(501, 2, '9876543211', 'Riverbank Colony House #42', 'Flood Water Trapped', 4, 'Elderly couple and children trapped on top floor as water rises.', 'CRITICAL', 'ASSIGNED', 1),
(502, 2, '9876543211', 'Greenwood Park Apartments', 'Medical Emergency', 2, 'Diabetic patient needs emergency insulin transport due to road block.', 'HIGH', 'PENDING', NULL);

-- Sample Volunteer Tasks
INSERT INTO volunteer_tasks (task_id, title, description, location, required_skill, disaster_report_id, assigned_volunteer_id, status) VALUES
(701, 'First Aid Kit Distribution', 'Distribute clean water, bandages and basic antibiotics at Relief Camp A', 'Relief Center Zone 1', 'FIRST_AID', 101, 1, 'IN_PROGRESS'),
(702, 'Food Packet Packing & Transport', 'Organize 500 dry food packets for flood victims', 'Central Stadium Supply Depot', 'FOOD_DISTRIBUTION', 101, NULL, 'OPEN');

-- Sample Shelters
INSERT INTO shelters (shelter_id, name, location, capacity, current_occupancy, food_available, water_available, medical_facility, contact_number) VALUES
(1, 'St. Mary High School Relief Center', 'North Sector, Hill Road', 200, 140, TRUE, TRUE, TRUE, '040-23456789'),
(2, 'Community Sports Complex Emergency Camp', 'East Zone, Stadium Road', 500, 480, TRUE, TRUE, TRUE, '040-23456790'),
(3, 'City Convention Hall Shelter', 'Downtown Avenue, Plot 10', 300, 50, TRUE, TRUE, FALSE, '040-23456791');

-- Sample Missing Persons
INSERT INTO missing_persons (person_id, reporter_id, name, age, gender, last_seen_location, date_last_seen, description, contact_info, status) VALUES
(1, 2, 'Robert Doe', 68, 'MALE', 'Riverbank Market Area', '2026-08-10', 'Height 5ft 9in, wearing grey shirt and glasses. Struggles with memory.', '9876543211', 'MISSING');

-- Sample Emergency Alerts
INSERT INTO emergency_alerts (alert_id, title, message, disaster_type, severity, is_active) VALUES
(1, 'CRITICAL FLOOD WARNING - ZONE A', 'Severe inundation reported in Riverbank Colony. All citizens in low-lying areas must move to St. Mary High School Shelter immediately.', 'FLOOD', 'CRITICAL', TRUE),
(2, 'CYLINDRICAL STORM APPROACHING COAST', 'High speed wind gusts up to 90km/h expected between 6 PM and midnight. Avoid unnecessary travel.', 'CYCLONE', 'HIGH', TRUE);

-- Sample Audit Logs
INSERT INTO audit_logs (user_id, action) VALUES
(1, 'Database Initialized and Demo Data Seeded'),
(2, 'Reported Disaster #101 (FLOOD)'),
(1, 'Published Emergency Alert #1');
