-- ================================================================
-- DISASTER MANAGEMENT AND EMERGENCY RESPONSE SYSTEM (D-MERS)
-- DEMO SEED DATA (AUTHENTICATION & INITIAL RECORDS)
-- ================================================================

-- Default Password Hashes:
-- admin@demo.com / admin123 -> 5f042e391307dd7b26c6e7a2b97c0c1694aa2b2203716d0046b8be90dd28003f
-- citizen@demo.com / citizen123 -> a57cb36dcbe90fb8fa4eeecdcbc1a9b2b5edcbe5d5b78ca9094778103c62ebc2
-- rescue@demo.com / rescue123 -> fdcbdbe90234a9ef1c9b3e34b9d03328e18378d3876e5d8366472251a37c95e1
-- volunteer@demo.com / volunteer123 -> d37633cb8e678bfd8b8eb306631ad02e9cf76f9dcdbc01a61c37b78997c276ee

INSERT INTO users (id, username, password_hash, salt, full_name, email, phone, location, role, profile_complete) VALUES
(1, 'admin', '5f042e391307dd7b26c6e7a2b97c0c1694aa2b2203716d0046b8be90dd28003f', 'DMES_SALT_2026', 'System Administrator', 'admin@demo.com', '9876543210', 'Emergency HQ', 'ADMIN', true),
(2, 'citizen', 'a57cb36dcbe90fb8fa4eeecdcbc1a9b2b5edcbe5d5b78ca9094778103c62ebc2', 'DMES_SALT_2026', 'John Doe (Citizen)', 'citizen@demo.com', '9876543211', 'Riverbank Sector 4', 'CITIZEN', true),
(3, 'rescue', 'fdcbdbe90234a9ef1c9b3e34b9d03328e18378d3876e5d8366472251a37c95e1', 'DMES_SALT_2026', 'Captain Alex Mercer', 'rescue@demo.com', '9876543212', 'NDRF Base Station', 'RESCUE_TEAM', true),
(4, 'volunteer', 'd37633cb8e678bfd8b8eb306631ad02e9cf76f9dcdbc01a61c37b78997c276ee', 'DMES_SALT_2026', 'Sarah Jenkins', 'volunteer@demo.com', '9876543213', 'Community Relief Center', 'VOLUNTEER', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO rescue_teams (team_id, user_id, team_name, leader_name, contact_number, specialization, active_status) VALUES
(1, 3, 'Alpha Rapid Response Unit', 'Captain Alex Mercer', '9876543212', 'Flood & Structural Rescue', 'AVAILABLE')
ON CONFLICT (team_id) DO NOTHING;

INSERT INTO volunteers (volunteer_id, user_id, phone, email, skill, availability, location, active_tasks_count) VALUES
(1, 4, '9876543213', 'volunteer@demo.com', 'FIRST_AID', 'AVAILABLE', 'Central City Sector 4', 1)
ON CONFLICT (volunteer_id) DO NOTHING;

INSERT INTO disaster_reports (report_id, citizen_id, disaster_type, location, severity, description, affected_people, people_needing_help, priority_score, contact_number, status) VALUES
(101, 2, 'FLOOD', 'Riverbank Colony Sector 5', 'CRITICAL', 'Water level crossed danger line. 15 families stranded on rooftop.', 15, 8, 92, '9876543211', 'IN_ACTION'),
(102, 2, 'FIRE', 'Industrial Area Warehouse 12', 'HIGH', 'Electrical short circuit causing fire outbreak near fuel depot.', 25, 4, 78, '9876543211', 'REPORTED'),
(103, 2, 'CYCLONE', 'Coastal Highway Mile 14', 'MEDIUM', 'Fallen trees blocking main evacuation route.', 50, 2, 60, '9876543211', 'VERIFIED')
ON CONFLICT (report_id) DO NOTHING;

INSERT INTO rescue_requests (request_id, citizen_id, disaster_report_id, contact_number, location, emergency_type, num_people, description, medical_required, priority_score, priority, status, assigned_team_id) VALUES
(501, 2, 101, '9876543211', 'Riverbank Colony House #42', 'Flood Water Trapped', 4, 'Elderly couple and children trapped on top floor as water rises.', true, 92, 'CRITICAL', 'ASSIGNED', 1),
(502, 2, 102, '9876543211', 'Greenwood Park Apartments', 'Medical Emergency', 2, 'Diabetic patient needs emergency insulin transport due to road block.', true, 75, 'HIGH', 'PENDING', NULL)
ON CONFLICT (request_id) DO NOTHING;

INSERT INTO volunteer_tasks (task_id, title, description, location, required_skill, disaster_report_id, assigned_volunteer_id, status) VALUES
(701, 'First Aid Kit Distribution', 'Distribute clean water, bandages and basic antibiotics at Relief Camp A', 'Relief Center Zone 1', 'FIRST_AID', 101, 1, 'IN_PROGRESS'),
(702, 'Food Packet Packing & Transport', 'Organize 500 dry food packets for flood victims', 'Central Stadium Supply Depot', 'FOOD_DISTRIBUTION', 101, NULL, 'OPEN')
ON CONFLICT (task_id) DO NOTHING;

INSERT INTO shelters (shelter_id, name, location, capacity, current_occupancy, food_available, water_available, medical_facility, contact_number) VALUES
(1, 'St. Mary High School Relief Center', 'North Sector, Hill Road', 200, 140, true, true, true, '040-23456789'),
(2, 'Community Sports Complex Emergency Camp', 'East Zone, Stadium Road', 500, 480, true, true, true, '040-23456790'),
(3, 'City Convention Hall Shelter', 'Downtown Avenue, Plot 10', 300, 50, true, true, false, '040-23456791')
ON CONFLICT (shelter_id) DO NOTHING;

INSERT INTO missing_persons (person_id, reporter_id, name, age, gender, last_seen_location, date_last_seen, description, contact_info, status) VALUES
(1, 2, 'Robert Doe', 68, 'MALE', 'Riverbank Market Area', '2026-08-10', 'Height 5ft 9in, wearing grey shirt and glasses. Struggles with memory.', '9876543211', 'MISSING')
ON CONFLICT (person_id) DO NOTHING;

INSERT INTO emergency_alerts (alert_id, title, message, disaster_type, severity, is_active) VALUES
(1, 'CRITICAL FLOOD WARNING - ZONE A', 'Severe inundation reported in Riverbank Colony. All citizens in low-lying areas must move to St. Mary High School Shelter immediately.', 'FLOOD', 'CRITICAL', true),
(2, 'CYCLONIC STORM APPROACHING COAST', 'High speed wind gusts up to 90km/h expected between 6 PM and midnight. Avoid unnecessary travel.', 'CYCLONE', 'HIGH', true)
ON CONFLICT (alert_id) DO NOTHING;

INSERT INTO emergency_contacts (id, category, title, phone_number, location, notes, is_official) VALUES
(1, 'Police', 'State Emergency Control Room', '112 / 100', 'Central Command', '24x7 Emergency Police Helpline', true),
(2, 'Fire & Rescue', 'Fire Services Headquarters', '101', 'City Headquarters', 'Fire and hazardous rescue operations', true),
(3, 'Ambulance', 'National Ambulance Service', '108 / 102', 'Medical Dispatch', 'Emergency trauma care and medical transport', true),
(4, 'Disaster Mgmt', 'NDRF Response Force Cell', '011-24363260', 'National Disaster HQ', 'Specialized search & rescue force', true)
ON CONFLICT (id) DO NOTHING;
