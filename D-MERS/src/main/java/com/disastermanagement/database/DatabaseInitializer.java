package com.disastermanagement.database;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;

public class DatabaseInitializer {

    public static boolean checkAndInitialize() {
        try (Connection conn = DatabaseUtil.getConnection()) {
            if (isDatabaseInitialized(conn)) {
                return true;
            }
            System.out.println("[INFO] Initializing database tables and demo seed data...");
            if (DatabaseUtil.isUsingSQLite()) {
                initializeSQLiteSchema(conn);
            } else {
                runSqlScript(conn);
            }
            return true;
        } catch (Exception e) {
            System.err.println("[ERROR] Database auto-initialization error: " + e.getMessage());
            return false;
        }
    }

    private static boolean isDatabaseInitialized(Connection conn) {
        try (Statement stmt = conn.createStatement()) {
            if (DatabaseUtil.isUsingSQLite()) {
                try (ResultSet rs = stmt.executeQuery("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")) {
                    return rs.next();
                }
            } else {
                try (ResultSet rs = stmt.executeQuery("SELECT table_name FROM information_schema.tables WHERE table_name='users' OR table_name='USERS'")) {
                    return rs.next();
                }
            }
        } catch (Exception e) {
            return false;
        }
    }

    private static void initializeSQLiteSchema(Connection conn) throws Exception {
        String[] sqliteDdl = new String[]{
            "CREATE TABLE IF NOT EXISTS users (" +
            "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
            "username TEXT NOT NULL UNIQUE, " +
            "password_hash TEXT NOT NULL, " +
            "salt TEXT NOT NULL, " +
            "full_name TEXT NOT NULL, " +
            "email TEXT NOT NULL UNIQUE, " +
            "phone TEXT NOT NULL, " +
            "location TEXT, " +
            "profile_image TEXT, " +
            "role TEXT NOT NULL, " +
            "profile_complete INTEGER DEFAULT 1, " +
            "created_at DATETIME DEFAULT CURRENT_TIMESTAMP)",

            "CREATE TABLE IF NOT EXISTS disaster_reports (" +
            "report_id INTEGER PRIMARY KEY AUTOINCREMENT, " +
            "citizen_id INTEGER NOT NULL, " +
            "disaster_type TEXT NOT NULL, " +
            "location TEXT NOT NULL, " +
            "severity TEXT NOT NULL, " +
            "description TEXT NOT NULL, " +
            "affected_people INTEGER DEFAULT 1, " +
            "people_needing_help INTEGER DEFAULT 1, " +
            "priority_score INTEGER DEFAULT 50, " +
            "contact_number TEXT, " +
            "report_date DATETIME DEFAULT CURRENT_TIMESTAMP, " +
            "status TEXT DEFAULT 'REPORTED', " +
            "image_path TEXT)",

            "CREATE TABLE IF NOT EXISTS rescue_teams (" +
            "team_id INTEGER PRIMARY KEY AUTOINCREMENT, " +
            "user_id INTEGER NOT NULL UNIQUE, " +
            "team_name TEXT NOT NULL, " +
            "leader_name TEXT NOT NULL, " +
            "contact_number TEXT NOT NULL, " +
            "specialization TEXT NOT NULL, " +
            "active_status TEXT DEFAULT 'AVAILABLE')",

            "CREATE TABLE IF NOT EXISTS rescue_requests (" +
            "request_id INTEGER PRIMARY KEY AUTOINCREMENT, " +
            "citizen_id INTEGER NOT NULL, " +
            "disaster_report_id INTEGER, " +
            "contact_number TEXT NOT NULL, " +
            "location TEXT NOT NULL, " +
            "emergency_type TEXT NOT NULL, " +
            "num_people INTEGER DEFAULT 1, " +
            "description TEXT NOT NULL, " +
            "medical_required INTEGER DEFAULT 0, " +
            "priority_score INTEGER DEFAULT 50, " +
            "priority TEXT DEFAULT 'MEDIUM', " +
            "status TEXT DEFAULT 'PENDING', " +
            "assigned_team_id INTEGER, " +
            "created_at DATETIME DEFAULT CURRENT_TIMESTAMP, " +
            "updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)",

            "CREATE TABLE IF NOT EXISTS volunteers (" +
            "volunteer_id INTEGER PRIMARY KEY AUTOINCREMENT, " +
            "user_id INTEGER NOT NULL UNIQUE, " +
            "phone TEXT NOT NULL, " +
            "email TEXT NOT NULL, " +
            "skill TEXT NOT NULL, " +
            "availability TEXT DEFAULT 'AVAILABLE', " +
            "location TEXT NOT NULL, " +
            "active_tasks_count INTEGER DEFAULT 0)",

            "CREATE TABLE IF NOT EXISTS volunteer_tasks (" +
            "task_id INTEGER PRIMARY KEY AUTOINCREMENT, " +
            "title TEXT NOT NULL, " +
            "description TEXT NOT NULL, " +
            "location TEXT NOT NULL, " +
            "required_skill TEXT NOT NULL, " +
            "disaster_report_id INTEGER, " +
            "assigned_volunteer_id INTEGER, " +
            "status TEXT DEFAULT 'OPEN', " +
            "created_at DATETIME DEFAULT CURRENT_TIMESTAMP)",

            "CREATE TABLE IF NOT EXISTS shelters (" +
            "shelter_id INTEGER PRIMARY KEY AUTOINCREMENT, " +
            "name TEXT NOT NULL, " +
            "location TEXT NOT NULL, " +
            "capacity INTEGER NOT NULL, " +
            "current_occupancy INTEGER DEFAULT 0, " +
            "food_available INTEGER DEFAULT 1, " +
            "water_available INTEGER DEFAULT 1, " +
            "medical_facility INTEGER DEFAULT 1, " +
            "contact_number TEXT NOT NULL, " +
            "created_at DATETIME DEFAULT CURRENT_TIMESTAMP)",

            "CREATE TABLE IF NOT EXISTS missing_persons (" +
            "person_id INTEGER PRIMARY KEY AUTOINCREMENT, " +
            "reporter_id INTEGER NOT NULL, " +
            "name TEXT NOT NULL, " +
            "age INTEGER NOT NULL, " +
            "gender TEXT NOT NULL, " +
            "last_seen_location TEXT NOT NULL, " +
            "date_last_seen TEXT NOT NULL, " +
            "description TEXT NOT NULL, " +
            "contact_info TEXT NOT NULL, " +
            "photo_path TEXT, " +
            "status TEXT DEFAULT 'MISSING', " +
            "created_at DATETIME DEFAULT CURRENT_TIMESTAMP)",

            "CREATE TABLE IF NOT EXISTS emergency_alerts (" +
            "alert_id INTEGER PRIMARY KEY AUTOINCREMENT, " +
            "title TEXT NOT NULL, " +
            "message TEXT NOT NULL, " +
            "disaster_type TEXT NOT NULL, " +
            "severity TEXT NOT NULL, " +
            "is_active INTEGER DEFAULT 1, " +
            "created_at DATETIME DEFAULT CURRENT_TIMESTAMP)",

            "CREATE TABLE IF NOT EXISTS emergency_timeline (" +
            "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
            "rescue_request_id INTEGER NOT NULL, " +
            "event_type TEXT NOT NULL, " +
            "description TEXT NOT NULL, " +
            "created_by TEXT NOT NULL, " +
            "created_at DATETIME DEFAULT CURRENT_TIMESTAMP)",

            "CREATE TABLE IF NOT EXISTS notifications (" +
            "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
            "user_id INTEGER NOT NULL, " +
            "title TEXT NOT NULL, " +
            "message TEXT NOT NULL, " +
            "read_status INTEGER DEFAULT 0, " +
            "created_at DATETIME DEFAULT CURRENT_TIMESTAMP)",

            "CREATE TABLE IF NOT EXISTS emergency_contacts (" +
            "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
            "category TEXT NOT NULL, " +
            "title TEXT NOT NULL, " +
            "phone_number TEXT NOT NULL, " +
            "location TEXT, " +
            "notes TEXT, " +
            "is_official INTEGER DEFAULT 1)",

            "CREATE TABLE IF NOT EXISTS audit_logs (" +
            "log_id INTEGER PRIMARY KEY AUTOINCREMENT, " +
            "user_id INTEGER, " +
            "action TEXT NOT NULL, " +
            "timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)",

            // Demo Users Seeding
            "INSERT OR IGNORE INTO users (id, username, password_hash, salt, full_name, email, phone, location, role, profile_complete) VALUES " +
            "(1, 'admin', '5f042e391307dd7b26c6e7a2b97c0c1694aa2b2203716d0046b8be90dd28003f', 'DMES_SALT_2026', 'System Administrator', 'admin@demo.com', '9876543210', 'Emergency HQ', 'ADMIN', 1), " +
            "(2, 'citizen', 'a57cb36dcbe90fb8fa4eeecdcbc1a9b2b5edcbe5d5b78ca9094778103c62ebc2', 'DMES_SALT_2026', 'John Doe (Citizen)', 'citizen@demo.com', '9876543211', 'Riverbank Sector 4', 'CITIZEN', 1), " +
            "(3, 'rescue', 'fdcbdbe90234a9ef1c9b3e34b9d03328e18378d3876e5d8366472251a37c95e1', 'DMES_SALT_2026', 'Captain Alex Mercer', 'rescue@demo.com', '9876543212', 'NDRF Base Station', 'RESCUE_TEAM', 1), " +
            "(4, 'volunteer', 'd37633cb8e678bfd8b8eb306631ad02e9cf76f9dcdbc01a61c37b78997c276ee', 'DMES_SALT_2026', 'Sarah Jenkins', 'volunteer@demo.com', '9876543213', 'Community Relief Center', 'VOLUNTEER', 1)",

            "INSERT OR IGNORE INTO rescue_teams (team_id, user_id, team_name, leader_name, contact_number, specialization, active_status) VALUES " +
            "(1, 3, 'Alpha Rapid Response Unit', 'Captain Alex Mercer', '9876543212', 'Flood & Structural Rescue', 'AVAILABLE')",

            "INSERT OR IGNORE INTO volunteers (volunteer_id, user_id, phone, email, skill, availability, location, active_tasks_count) VALUES " +
            "(1, 4, '9876543213', 'volunteer@demo.com', 'FIRST_AID', 'AVAILABLE', 'Central City Sector 4', 1)",

            "INSERT OR IGNORE INTO disaster_reports (report_id, citizen_id, disaster_type, location, severity, description, affected_people, people_needing_help, priority_score, contact_number, status) VALUES " +
            "(101, 2, 'FLOOD', 'Riverbank Colony Sector 5', 'CRITICAL', 'Water level crossed danger line. 15 families stranded on rooftop.', 15, 8, 92, '9876543211', 'IN_ACTION'), " +
            "(102, 2, 'FIRE', 'Industrial Area Warehouse 12', 'HIGH', 'Electrical short circuit causing fire outbreak near fuel depot.', 25, 4, 78, '9876543211', 'REPORTED'), " +
            "(103, 2, 'CYCLONE', 'Coastal Highway Mile 14', 'MEDIUM', 'Fallen trees blocking main evacuation route.', 50, 2, 60, '9876543211', 'VERIFIED')",

            "INSERT OR IGNORE INTO rescue_requests (request_id, citizen_id, disaster_report_id, contact_number, location, emergency_type, num_people, description, medical_required, priority_score, priority, status, assigned_team_id) VALUES " +
            "(501, 2, 101, '9876543211', 'Riverbank Colony House #42', 'Flood Water Trapped', 4, 'Elderly couple and children trapped on top floor as water rises.', 1, 92, 'CRITICAL', 'ASSIGNED', 1), " +
            "(502, 2, 102, '9876543211', 'Greenwood Park Apartments', 'Medical Emergency', 2, 'Diabetic patient needs emergency insulin transport due to road block.', 1, 75, 'HIGH', 'PENDING', NULL)",

            "INSERT OR IGNORE INTO volunteer_tasks (task_id, title, description, location, required_skill, disaster_report_id, assigned_volunteer_id, status) VALUES " +
            "(701, 'First Aid Kit Distribution', 'Distribute clean water, bandages and basic antibiotics at Relief Camp A', 'Relief Center Zone 1', 'FIRST_AID', 101, 1, 'IN_PROGRESS'), " +
            "(702, 'Food Packet Packing & Transport', 'Organize 500 dry food packets for flood victims', 'Central Stadium Supply Depot', 'FOOD_DISTRIBUTION', 101, NULL, 'OPEN')",

            "INSERT OR IGNORE INTO shelters (shelter_id, name, location, capacity, current_occupancy, food_available, water_available, medical_facility, contact_number) VALUES " +
            "(1, 'St. Mary High School Relief Center', 'North Sector, Hill Road', 200, 140, 1, 1, 1, '040-23456789'), " +
            "(2, 'Community Sports Complex Emergency Camp', 'East Zone, Stadium Road', 500, 480, 1, 1, 1, '040-23456790'), " +
            "(3, 'City Convention Hall Shelter', 'Downtown Avenue, Plot 10', 300, 50, 1, 1, 0, '040-23456791')",

            "INSERT OR IGNORE INTO missing_persons (person_id, reporter_id, name, age, gender, last_seen_location, date_last_seen, description, contact_info, status) VALUES " +
            "(1, 2, 'Robert Doe', 68, 'MALE', 'Riverbank Market Area', '2026-08-10', 'Height 5ft 9in, wearing grey shirt and glasses. Struggles with memory.', '9876543211', 'MISSING')",

            "INSERT OR IGNORE INTO emergency_alerts (alert_id, title, message, disaster_type, severity, is_active) VALUES " +
            "(1, 'CRITICAL FLOOD WARNING - ZONE A', 'Severe inundation reported in Riverbank Colony. All citizens in low-lying areas must move to St. Mary High School Shelter immediately.', 'FLOOD', 'CRITICAL', 1), " +
            "(2, 'CYCLONIC STORM APPROACHING COAST', 'High speed wind gusts up to 90km/h expected between 6 PM and midnight. Avoid unnecessary travel.', 'CYCLONE', 'HIGH', 1)",

            "INSERT OR IGNORE INTO emergency_timeline (id, rescue_request_id, event_type, description, created_by) VALUES " +
            "(1, 501, 'CREATED', 'Rescue request submitted by John Doe', 'Citizen'), " +
            "(2, 501, 'PRIORITY_CALCULATED', 'Smart Rescue Priority Engine computed score 92/100 (CRITICAL)', 'System Priority Engine'), " +
            "(3, 501, 'TEAM_ASSIGNED', 'Assigned to Alpha Rapid Response Unit', 'Admin Headquarters'), " +
            "(4, 501, 'ACCEPTED', 'Alpha Rapid Response Unit accepted assignment and dispatched boats', 'Captain Alex Mercer')",

            "INSERT OR IGNORE INTO emergency_contacts (id, category, title, phone_number, location, notes, is_official) VALUES " +
            "(1, 'Police', 'State Emergency Control Room', '112 / 100', 'Central Command', '24x7 Emergency Police Helpline', 1), " +
            "(2, 'Fire & Rescue', 'Fire Services Headquarters', '101', 'City Headquarters', 'Fire and hazardous rescue operations', 1), " +
            "(3, 'Ambulance', 'National Ambulance Service', '108 / 102', 'Medical Dispatch', 'Emergency trauma care and medical transport', 1), " +
            "(4, 'Disaster Mgmt', 'NDRF Response Force Cell', '011-24363260', 'National Disaster HQ', 'Specialized search & rescue force', 1)"
        };

        try (Statement stmt = conn.createStatement()) {
            for (String sql : sqliteDdl) {
                stmt.execute(sql);
            }
        }
    }

    private static void runSqlScript(Connection conn) throws Exception {
        StringBuilder script = new StringBuilder();
        File sqlFile = new File("database.sql");
        if (sqlFile.exists()) {
            try (BufferedReader reader = new BufferedReader(new FileReader(sqlFile))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    script.append(line).append("\n");
                }
            }
        }

        if (script.length() == 0) return;

        String[] statements = script.toString().split(";");
        try (Statement stmt = conn.createStatement()) {
            for (String sql : statements) {
                String trimmed = sql.trim();
                if (!trimmed.isEmpty() && !trimmed.startsWith("--")) {
                    try {
                        stmt.execute(trimmed);
                    } catch (Exception ignored) {}
                }
            }
        }
    }
}
