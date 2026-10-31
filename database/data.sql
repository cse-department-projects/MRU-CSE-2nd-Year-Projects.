-- Comprehensive Seed Data for Road Safety & Hospital Notification System

INSERT INTO users (full_name, email, password, phone, role, blood_group, emergency_contact_name, emergency_contact_phone) VALUES
('Pranay Krishna (Citizen)', 'citizen@roadsafety.com', 'password123', '+919876543210', 'CITIZEN', 'O+', 'Primary Emergency Contact', '+919876543211'),
('Malla Reddy Hospital Desk', 'hospital@mallareddy.com', 'password123', '+919100910000', 'HOSPITAL_STAFF', 'N/A', 'Hospital Emergency Helpline', '108');

INSERT INTO hospitals (name, phone_number, emergency_contact, latitude, longitude, address, available_ambulances, is_active) VALUES
('Malla Reddy Narayana Multispeciality Hospital', '+919100910000', '108', 17.5621, 78.4485, 'Suraram X Road, Jeedimetla, Hyderabad, Telangana 500055', 8, true),
('KIMS Hospitals Secunderabad', '+914044885000', '108', 17.4357, 78.4984, '1-8-31/1, Minister Rd, Ramgopalpet, Secunderabad 500003', 6, true),
('Apollo Hospitals Jubilee Hills', '+914023607777', '1066', 17.4244, 78.4124, 'Road No 72, Jubilee Hills, Hyderabad, Telangana 500033', 10, true),
('Yashoda Hospitals Secunderabad', '+914045674567', '108', 17.4399, 78.4981, 'Alexander Rd, Clay Book, Secunderabad, Telangana 500003', 5, true),
('Sunshine Hospitals Gachibowli', '+914044550000', '108', 17.4435, 78.3653, 'Near Biodiversity Park, Gachibowli, Hyderabad 500032', 4, true),
('Care Hospitals Banjara Hills', '+914061656565', '108', 17.4156, 78.4482, 'Road No. 1, Banjara Hills, Hyderabad, Telangana 500034', 7, true);

INSERT INTO emergency_contacts (name, relationship, phone_number) VALUES
('National Emergency Helpline', 'Government Emergency', '112'),
('Ambulance Emergency Medical Response', 'Medical Emergency', '108'),
('National Highway Express Helpline', 'Highway Response', '1033'),
('Traffic Police Control Room', 'Police Helpline', '100'),
('Women Safety Helpline', 'Emergency Helpline', '1091');

INSERT INTO safety_rules (category, title, description, icon_name, penalty) VALUES
('MANDATORY_SIGN', 'Stop & Give Way', 'Vehicles must come to a complete stop before the stop line, observe all directions, and yield to cross traffic.', 'fa-hand', 'Rs 1,000 fine'),
('MANDATORY_SIGN', 'Compulsory ISI Helmet', 'Both rider and pillion passenger on two-wheelers must wear ISI certified helmet with chin strap securely fastened.', 'fa-helmet-safety', 'Rs 1,000 fine & 3 months license suspension'),
('MANDATORY_SIGN', 'Seat Belt Compliance', 'All vehicle occupants (front and rear seats) must wear seat belts while the vehicle is in motion.', 'fa-user-slash', 'Rs 1,000 fine'),
('MANDATORY_SIGN', 'No Overtaking Zone', 'Do not overtake where solid continuous white/yellow road lines or No Overtaking signs are present.', 'fa-ban-left', 'Rs 1,500 fine'),

('CAUTIONARY_SIGN', 'Pedestrian Crossing Ahead', 'Slow down and prepare to stop. Pedestrians have right-of-way at zebra crossings.', 'fa-person-walking', 'Caution Notice / Rs 500 fine'),
('CAUTIONARY_SIGN', 'Sharp Curve & Blind Spot', 'Reduce speed, stay strictly in your lane, and avoid overtaking or sudden braking on blind curves.', 'fa-route', 'Caution Notice'),
('CAUTIONARY_SIGN', 'Narrow Bridge / Road Narrows', 'Be prepared to yield to oncoming traffic on single-lane or narrow bridge structures.', 'fa-bridge', 'Caution Notice'),
('CAUTIONARY_SIGN', 'Slippery Road Surface', 'Drive with caution; reduce speed especially during rain, oil spills, or loose gravel conditions.', 'fa-car-burst', 'High Risk Warning'),

('INFORMATIONAL_SIGN', 'Nearest Hospital & Trauma Center', 'Blue square sign indicating a 24/7 medical emergency facility or hospital within 1-2 km.', 'fa-hospital', 'Info Guide'),
('INFORMATIONAL_SIGN', 'First Aid Post Ahead', 'Indicates availability of immediate basic medical first aid kit and trained medical assistance.', 'fa-kit-medical', 'Info Guide'),
('INFORMATIONAL_SIGN', 'Fuel Station & Service Bay', 'Indicates availability of petrol/diesel/EV charging station ahead on highways.', 'fa-gas-pump', 'Info Guide'),

('NIGHT_DRIVING', 'Use Low-Beam In City & High-Beam Mindfully', 'Switch to low-beam headlights when following or approaching oncoming traffic to avoid blinding drivers.', 'fa-lightbulb', 'Rs 500 fine for illegal LED lights'),
('NIGHT_DRIVING', 'Fog Light & Hazard Flasher Protocol', 'Use yellow fog lights during heavy fog or rain. Never keep hazard flashers on while driving normally.', 'fa-cloud-bolt', 'Safety Standard'),
('NIGHT_DRIVING', 'Combating Night Fatigue & Drowsiness', 'Take a 15-minute rest break every 2 hours during long night drives. Never drive when exhausted.', 'fa-bed', 'Life Saver'),

('SPEED_LIMIT', 'Urban City Speed Limit (50 km/h)', 'Maximum allowed speed inside city municipal limits, residential streets, and commercial areas.', 'fa-gauge-high', 'Rs 1,000 - Rs 2,000 fine'),
('SPEED_LIMIT', 'Highway & Expressway Limit (80-100 km/h)', 'Maintain posted speed limits on National Highways. Keep to left lane except when overtaking.', 'fa-gauge-max', 'Rs 2,000 - Rs 4,000 fine'),
('SPEED_LIMIT', 'School & Hospital Silent Zone (25 km/h)', 'Strict speed limit around schools, colleges, and hospitals. Honking is strictly prohibited.', 'fa-school', 'Rs 2,000 fine & License points'),

('VEHICLE_MAINTENANCE', 'Tire Pressure & Tread Inspection', 'Maintain recommended PSI and ensure tread depth is above 1.6mm to prevent high-speed blowouts and hydroplaning.', 'fa-circle-notch', 'Pre-Trip Inspection'),
('VEHICLE_MAINTENANCE', 'Brake Fluid & Brake Pad Health', 'Check brake responsiveness, fluid levels, and replace worn brake pads before long trips.', 'fa-triangle-exclamation', 'Pre-Trip Inspection'),
('VEHICLE_MAINTENANCE', 'Airbag System & Fluid Levels', 'Ensure SRS Airbag warning light is off and engine oil, coolant, and wiper fluids are topped up.', 'fa-car-side', 'Critical Safety'),

('PEDESTRIAN_CYCLIST', 'Pedestrian Walk On Facing Traffic Side', 'If no footpath is available, walk on the right side of the road facing oncoming traffic.', 'fa-person-walking-luggage', 'Pedestrian Safety'),
('PEDESTRIAN_CYCLIST', 'Cyclist Reflective Vests & Helmet', 'Cyclists must wear bright/reflective clothing at night and stay on designated cycle tracks.', 'fa-bicycle', 'Cyclist Safety'),

('FIRST_AID', 'Golden Hour Trauma Response', 'The first 60 minutes after an accident are crucial. Call 108/112 immediately, keep victim stationary, and control severe bleeding.', 'fa-heart-pulse', 'Golden Hour Protocol'),
('FIRST_AID', 'CPR Emergency Administration', 'Perform 30 rapid chest compressions followed by 2 rescue breaths at center of chest if victim is unresponsive.', 'fa-notes-medical', 'Life Saving Action'),
('FIRST_AID', 'Good Samaritan Legal Immunity', 'Indian Good Samaritan Law protects bystanders who assist accident victims from police harassment or legal liability.', 'fa-user-shield', 'Legal Protection');
