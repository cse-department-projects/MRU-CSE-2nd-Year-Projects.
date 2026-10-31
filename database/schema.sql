-- SQL Schema for Road Safety & Hospital Notification System

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role VARCHAR(30) DEFAULT 'CITIZEN',
    blood_group VARCHAR(10),
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS hospitals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    emergency_contact VARCHAR(20) NOT NULL,
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    address VARCHAR(255) NOT NULL,
    available_ambulances INT DEFAULT 5,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS emergency_alerts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    victim_name VARCHAR(100) DEFAULT 'Accident Victim / Anonymous User',
    victim_phone VARCHAR(20) NOT NULL,
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    address_details VARCHAR(500),
    medical_notes VARCHAR(500),
    status VARCHAR(30) DEFAULT 'PENDING',
    assigned_hospital_id BIGINT,
    assigned_hospital_name VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS emergency_contacts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    phone_number VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS safety_rules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    title VARCHAR(150) NOT NULL,
    description VARCHAR(1000) NOT NULL,
    icon_name VARCHAR(50),
    penalty VARCHAR(100)
);
