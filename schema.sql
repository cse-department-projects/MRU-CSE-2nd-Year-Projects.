-- ============================================================
-- Smart Village Management System - MySQL Database Schema
-- Database: smart_village_db
-- ============================================================

CREATE DATABASE IF NOT EXISTS smart_village_db;
USE smart_village_db;

-- 1. Users Table (Citizens and Admins)
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(15),
    role VARCHAR(20) NOT NULL DEFAULT 'CITIZEN', -- 'CITIZEN' or 'ADMIN'
    aadhaar VARCHAR(16),
    ration_card VARCHAR(20),
    ward_number VARCHAR(10),
    address TEXT,
    occupation VARCHAR(50),
    household_members INT DEFAULT 1,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Complaints Table
CREATE TABLE IF NOT EXISTS complaints (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticket_no VARCHAR(30) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL, -- Water, Electricity, Roads, Sanitation, Drainage, Streetlights
    description TEXT NOT NULL,
    location VARCHAR(150),
    ward_number VARCHAR(10),
    priority VARCHAR(20) DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, URGENT
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, IN_PROGRESS, RESOLVED, REJECTED
    admin_remarks TEXT,
    assigned_officer VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Government / Rural Service Applications
CREATE TABLE IF NOT EXISTS service_applications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    app_number VARCHAR(30) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    service_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL, -- Pension, Housing, Agriculture Subsidy, Certificate, Water Connection
    description TEXT,
    status VARCHAR(20) DEFAULT 'SUBMITTED', -- SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED
    submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    remarks TEXT,
    document_ref VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Agriculture Mandi Crop Prices
CREATE TABLE IF NOT EXISTS crop_prices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    crop_name VARCHAR(50) NOT NULL,
    category VARCHAR(30) DEFAULT 'CEREAL', -- CEREAL, VEGETABLE, PULSE, FRUIT, CASH_CROP
    price_per_quintal DECIMAL(10,2) NOT NULL,
    min_price DECIMAL(10,2),
    max_price DECIMAL(10,2),
    market_location VARCHAR(100) DEFAULT 'Central Village Mandi',
    trend VARCHAR(10) DEFAULT 'STABLE', -- UP, DOWN, STABLE
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 5. Soil Testing Requests
CREATE TABLE IF NOT EXISTS soil_test_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    req_number VARCHAR(30) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    farmer_name VARCHAR(100) NOT NULL,
    land_area_acres DECIMAL(5,2) NOT NULL,
    survey_number VARCHAR(30),
    sample_location VARCHAR(100),
    status VARCHAR(20) DEFAULT 'REQUESTED', -- REQUESTED, SAMPLE_COLLECTED, IN_LAB, REPORT_READY
    result_summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. Utilities & Service Schedules (Water, Power, Waste)
CREATE TABLE IF NOT EXISTS utility_schedules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    utility_type VARCHAR(30) NOT NULL, -- WATER_SUPPLY, POWER_OUTAGE, WASTE_COLLECTION, STREET_MAINTENANCE
    title VARCHAR(150) NOT NULL,
    area_affected VARCHAR(150),
    schedule_date VARCHAR(50),
    status VARCHAR(30) DEFAULT 'SCHEDULED', -- SCHEDULED, IN_PROGRESS, COMPLETED, DELAYED
    details TEXT,
    contact_person VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Village News & Announcements
CREATE TABLE IF NOT EXISTS announcements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(50) DEFAULT 'GENERAL', -- GRAM_SABHA, HEALTH, SCHEME, FESTIVAL, WEATHER
    priority VARCHAR(20) DEFAULT 'NORMAL', -- NORMAL, HIGH, URGENT
    content TEXT NOT NULL,
    target_audience VARCHAR(50) DEFAULT 'ALL', -- ALL, FARMERS, SENIOR_CITIZENS, YOUTH
    posted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN DEFAULT TRUE
);

-- 8. Emergency Contacts Directory
CREATE TABLE IF NOT EXISTS emergency_contacts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(50) NOT NULL, -- PANCHAYAT, POLICE, HEALTHCARE, ELECTRICITY, WATER_BOARD
    name VARCHAR(100) NOT NULL,
    designation VARCHAR(100),
    phone VARCHAR(20) NOT NULL,
    alt_phone VARCHAR(20),
    email VARCHAR(100),
    location VARCHAR(100)
);

-- 9. Emergency Urgent Alerts
CREATE TABLE IF NOT EXISTS emergency_alerts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    alert_title VARCHAR(150) NOT NULL,
    severity VARCHAR(20) DEFAULT 'HIGH', -- MODERATE, HIGH, CRITICAL
    message TEXT NOT NULL,
    broadcast_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN DEFAULT TRUE
);

-- 10. Audit & Activity Logs (Records every action/step taken by citizen, student, or admin)
CREATE TABLE IF NOT EXISTS activity_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50),
    user_role VARCHAR(20),
    action VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(50),
    status VARCHAR(20) DEFAULT 'SUCCESS',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

