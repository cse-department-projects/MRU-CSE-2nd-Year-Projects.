<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Road Safety & Hospital Notification System</title>
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <!-- FontAwesome Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- Leaflet CSS for Interactive Hospital Map -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>
    <!-- Main CSS -->
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>

    <!-- Header Navigation Bar -->
    <header class="app-header">
        <div class="header-container">
            <div class="brand">
                <div class="brand-icon">
                    <i class="fa-solid fa-heart-pulse"></i>
                </div>
                <div class="brand-text">
                    <h1>SafeRoad <span>SOS</span></h1>
                    <p>Road Safety & Hospital Notification System</p>
                </div>
            </div>

            <!-- View Switcher Tabs -->
            <nav class="view-nav">
                <button class="nav-btn active" id="btnViewUser" onclick="switchView('user')">
                    <i class="fa-solid fa-user-shield"></i> Citizen Safety & SOS Portal
                </button>
                <button class="nav-btn" id="btnViewHospital" onclick="switchView('hospital')">
                    <i class="fa-solid fa-hospital-user"></i> Hospital Responder Desk
                </button>
            </nav>

            <div class="header-right">
                <!-- User Auth Area -->
                <div id="authArea">
                    <button class="btn-primary btn-sm" onclick="openAuthModal('login')">
                        <i class="fa-solid fa-right-to-bracket"></i> Login / Register
                    </button>
                </div>

                <div class="location-badge" id="locationStatus" onclick="openLocationModal()" style="cursor:pointer;" title="Click to change or refine your exact emergency location">
                    <span class="pulse-dot green"></span>
                    <i class="fa-solid fa-location-crosshairs"></i> <span id="locationText">Fetching Location...</span>
                    <i class="fa-solid fa-pen-to-square" style="margin-left: 5px; font-size: 0.75rem; opacity: 0.8;"></i>
                </div>
            </div>
        </div>
    </header>

    <!-- KPI Quick Emergency Numbers Bar -->
    <div class="kpi-banner">
        <div class="kpi-container">
            <div class="kpi-item emergency-hotline">
                <i class="fa-solid fa-truck-medical"></i>
                <div>
                    <span class="kpi-num">108</span>
                    <span class="kpi-label">Ambulance Emergency</span>
                </div>
            </div>
            <div class="kpi-item">
                <i class="fa-solid fa-phone-flip"></i>
                <div>
                    <span class="kpi-num">112</span>
                    <span class="kpi-label">National Emergency</span>
                </div>
            </div>
            <div class="kpi-item">
                <i class="fa-solid fa-road"></i>
                <div>
                    <span class="kpi-num">1033</span>
                    <span class="kpi-label">Highway Helpline</span>
                </div>
            </div>
            <div class="kpi-item">
                <i class="fa-solid fa-hospital"></i>
                <div>
                    <span class="kpi-num" id="hospCountBadge">6</span>
                    <span class="kpi-label">Active Hospitals Nearby</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Main Content Area -->
    <main class="main-content">

        <!-- ========================================== -->
        <!-- CITIZEN / USER VIEW                        -->
        <!-- ========================================== -->
        <section id="viewUser" class="view-section active">
            
            <!-- Hero Emergency SOS Trigger Banner -->
            <div class="sos-hero-card">
                <div class="sos-content">
                    <span class="emergency-tag"><i class="fa-solid fa-triangle-exclamation"></i> Instant Accident Rescue</span>
                    <h2>Emergency SOS & Live Location Broadcast</h2>
                    <p>Single-click trigger sends your live GPS map coordinates to nearby hospitals, enables instant direct phone call to nearest trauma center, and dispatches emergency SMS.</p>

                    <div class="quick-sms-info">
                        <i class="fa-solid fa-circle-check text-success"></i> Real-time GPS Tracking
                        <i class="fa-solid fa-circle-check text-success" style="margin-left: 12px;"></i> Direct Hospital Calling
                        <i class="fa-solid fa-circle-check text-success" style="margin-left: 12px;"></i> Mobile SMS Dispatch
                    </div>

                    <!-- Direct Call Nearest Hospital Quick Button -->
                    <div style="margin-top: 18px; display: flex; gap: 10px; flex-wrap: wrap;">
                        <a id="heroQuickCallBtn" href="tel:108" class="btn-call-hero">
                            <i class="fa-solid fa-phone-volume fa-shake"></i> CALL NEAREST HOSPITAL NOW
                        </a>
                        <a href="tel:108" class="btn-call-hero-secondary">
                            <i class="fa-solid fa-truck-medical"></i> Call 108 Ambulance
                        </a>
                    </div>
                </div>

                <div class="sos-button-wrapper">
                    <button class="sos-trigger-btn" id="sosMainBtn" onclick="handleEmergencySOS()">
                        <div class="sos-pulse-ring"></div>
                        <div class="sos-pulse-ring-outer"></div>
                        <div class="sos-inner-btn">
                            <i class="fa-solid fa-power-off"></i>
                            <span class="sos-text">EMERGENCY SOS</span>
                            <span class="sos-subtext">CLICK TO SEND HELP</span>
                        </div>
                    </button>
                </div>
            </div>

            <!-- Dashboard Quick Grid -->
            <div class="dashboard-grid">
                
                <!-- Quick Hospital Selector & Nearby List -->
                <div class="glass-card nearby-hospitals-card">
                    <div class="card-header" style="flex-wrap: wrap; gap: 10px; border-bottom: 1px solid var(--card-border); padding-bottom: 12px; margin-bottom: 12px;">
                        <div>
                            <h3 style="margin: 0;"><i class="fa-solid fa-square-h text-danger"></i> Nearest Emergency Hospitals</h3>
                            <p style="margin: 3px 0 0 0; font-size: 0.8rem; color: #64748b;" id="currentLandmarkText"><i class="fa-solid fa-location-dot text-danger"></i> <strong>Location:</strong> Detecting street landmark...</p>
                        </div>
                        <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
                            <input type="text" id="manualLocInput" placeholder="Enter landmark / area..." style="padding: 6px 10px; font-size: 0.82rem; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; min-width: 170px;" onkeypress="if(event.key==='Enter') searchCustomLocation()">
                            <button class="btn-sm btn-secondary" onclick="searchCustomLocation()"><i class="fa-solid fa-magnifying-glass-location"></i> Search</button>
                            <button class="btn-sm btn-outline" onclick="openLocationModal()"><i class="fa-solid fa-sliders"></i> Change Location</button>
                        </div>

                        <!-- Quick Area Presets Bar -->
                        <div style="width: 100%; margin-top: 8px; display: flex; gap: 5px; flex-wrap: wrap; align-items: center;">
                            <span style="font-size: 0.75rem; font-weight: 700; color: #64748b;"><i class="fa-solid fa-bolt text-warning"></i> Quick Area Presets:</span>
                            <button class="btn-sm btn-outline" style="padding: 2px 8px; font-size: 0.72rem;" onclick="setLocationPreset(17.5610, 78.4370, 'Suraram / Jeedimetla')">📍 Suraram</button>
                            <button class="btn-sm btn-outline" style="padding: 2px 8px; font-size: 0.72rem;" onclick="setLocationPreset(17.4363, 78.4947, 'Secunderabad Station')">📍 Secunderabad</button>
                            <button class="btn-sm btn-outline" style="padding: 2px 8px; font-size: 0.72rem;" onclick="setLocationPreset(17.4257, 78.4116, 'Jubilee Hills')">📍 Jubilee Hills</button>
                            <button class="btn-sm btn-outline" style="padding: 2px 8px; font-size: 0.72rem;" onclick="setLocationPreset(17.4428, 78.3644, 'Gachibowli')">📍 Gachibowli</button>
                            <button class="btn-sm btn-outline" style="padding: 2px 8px; font-size: 0.72rem;" onclick="setLocationPreset(17.4162, 78.4480, 'Banjara Hills')">📍 Banjara Hills</button>
                            <button class="btn-sm btn-outline" style="padding: 2px 8px; font-size: 0.72rem;" onclick="setLocationPreset(17.4489, 78.3804, 'Hitec City')">📍 Hitec City</button>
                        </div>
                    </div>
                    <div class="hospital-list-container" id="hospitalList">
                        <div class="loading-spinner"><i class="fa-solid fa-circle-notch fa-spin"></i> Locating nearest trauma hospitals...</div>
                    </div>
                </div>

                <!-- Emergency Contacts Card -->
                <div class="glass-card emergency-contacts-card">
                    <div class="card-header">
                        <h3><i class="fa-solid fa-phone-volume text-warning"></i> Emergency Contacts</h3>
                        <button class="btn-sm btn-primary" onclick="openAddContactModal()"><i class="fa-solid fa-user-plus"></i> Add</button>
                    </div>
                    <div class="contacts-list" id="contactsList">
                        <div class="loading-spinner"><i class="fa-solid fa-circle-notch fa-spin"></i> Loading contacts...</div>
                    </div>
                </div>
            </div>

            <!-- Safety Precautions & Categories Section -->
            <div class="safety-section">
                <div class="section-title-bar">
                    <div>
                        <h2><i class="fa-solid fa-shield-halved text-success"></i> Comprehensive Road Safety & Precautions Guide</h2>
                        <p>Browse official traffic rules, mandatory signs, night driving precautions, and emergency guidelines across 8 categories.</p>
                    </div>

                    <!-- Category Filters Chips -->
                    <div class="rule-filter-tabs" id="filterTabsContainer">
                        <button class="filter-chip active" onclick="filterRules('ALL')">All Guidelines (25)</button>
                        <button class="filter-chip" onclick="filterRules('MANDATORY_SIGN')"><i class="fa-solid fa-hand"></i> Mandatory Signs</button>
                        <button class="filter-chip" onclick="filterRules('CAUTIONARY_SIGN')"><i class="fa-solid fa-triangle-exclamation"></i> Cautionary Signs</button>
                        <button class="filter-chip" onclick="filterRules('INFORMATIONAL_SIGN')"><i class="fa-solid fa-circle-info"></i> Info Signs</button>
                        <button class="filter-chip" onclick="filterRules('NIGHT_DRIVING')"><i class="fa-solid fa-moon"></i> Night & Weather</button>
                        <button class="filter-chip" onclick="filterRules('SPEED_LIMIT')"><i class="fa-solid fa-gauge-high"></i> Speed Limits</button>
                        <button class="filter-chip" onclick="filterRules('VEHICLE_MAINTENANCE')"><i class="fa-solid fa-screwdriver-wrench"></i> Vehicle Safety</button>
                        <button class="filter-chip" onclick="filterRules('PEDESTRIAN_CYCLIST')"><i class="fa-solid fa-person-walking"></i> Pedestrian Safety</button>
                        <button class="filter-chip" onclick="filterRules('FIRST_AID')"><i class="fa-solid fa-kit-medical"></i> First Aid</button>
                    </div>
                </div>

                <!-- Search Input -->
                <div class="search-box-wrapper">
                    <i class="fa-solid fa-magnifying-glass"></i>
                    <input type="text" id="ruleSearchInput" placeholder="Search safety rules, traffic signs, penalties, night precautions..." onkeyup="searchRules()">
                </div>

                <!-- Rules Grid -->
                <div class="rules-grid" id="rulesGrid">
                    <div class="loading-spinner"><i class="fa-solid fa-circle-notch fa-spin"></i> Loading safety guidelines...</div>
                </div>
            </div>
        </section>

        <!-- ========================================== -->
        <!-- HOSPITAL EMERGENCY DASHBOARD VIEW          -->
        <!-- ========================================== -->
        <section id="viewHospital" class="view-section">
            <div class="hospital-dashboard-header">
                <div class="hosp-info">
                    <h2><i class="fa-solid fa-hospital-user text-danger"></i> Hospital Emergency Response Desk</h2>
                    <p>Live incoming road accident SOS alerts, location dispatch, and ambulance coordination.</p>
                </div>
                <div class="hosp-actions">
                    <span class="live-counter-badge" id="activeAlertCount">0 Active Emergencies</span>
                    <button class="btn-primary" onclick="loadHospitalAlerts()"><i class="fa-solid fa-rotate"></i> Poll Alerts</button>
                </div>
            </div>

            <!-- Incoming Alerts Container -->
            <div class="alerts-table-wrapper glass-card">
                <table class="alerts-table">
                    <thead>
                        <tr>
                            <th>Alert ID</th>
                            <th>Victim / User</th>
                            <th>Time</th>
                            <th>GPS Coordinates</th>
                            <th>Assigned Hospital</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="alertsTableBody">
                        <tr>
                            <td colspan="7" class="text-center py-4">No active emergency alerts recorded.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    </main>

    <!-- LOGIN & REGISTER MODAL -->
    <div class="modal-overlay" id="authModal">
        <div class="modal-card">
            <div class="modal-header">
                <h3 id="authModalTitle"><i class="fa-solid fa-user-lock"></i> User Login</h3>
                <button class="close-modal-btn" onclick="closeAuthModal()">&times;</button>
            </div>
            <div class="modal-body">
                
                <div class="auth-tab-buttons">
                    <button class="auth-tab-btn active" id="tabLoginBtn" onclick="toggleAuthTab('login')">Login</button>
                    <button class="auth-tab-btn" id="tabRegisterBtn" onclick="toggleAuthTab('register')">Register Account</button>
                </div>

                <!-- LOGIN FORM -->
                <form id="loginForm" onsubmit="handleLoginSubmit(event)">
                    <div class="form-group">
                        <label>Email Address</label>
                        <input type="email" id="loginEmail" required placeholder="e.g. citizen@roadsafety.com">
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" id="loginPassword" required placeholder="Enter password">
                    </div>
                    <div class="demo-account-box">
                        <p><strong>Demo Accounts (Pre-seeded):</strong></p>
                        <p>👤 Citizen: <code>citizen@roadsafety.com</code> | <code>password123</code></p>
                        <p>🏥 Hospital Staff: <code>hospital@mallareddy.com</code> | <code>password123</code></p>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn-secondary" onclick="closeAuthModal()">Cancel</button>
                        <button type="submit" class="btn-primary"><i class="fa-solid fa-right-to-bracket"></i> Login Now</button>
                    </div>
                </form>

                <!-- REGISTER FORM -->
                <form id="registerForm" style="display: none;" onsubmit="handleRegisterSubmit(event)">
                    <div class="form-group">
                        <label>Full Name</label>
                        <input type="text" id="regFullName" required placeholder="e.g. Pranay Krishna">
                    </div>
                    <div class="form-group">
                        <label>Email Address</label>
                        <input type="email" id="regEmail" required placeholder="e.g. user@example.com">
                    </div>
                    <div class="form-group">
                        <label>Phone Number</label>
                        <input type="tel" id="regPhone" required placeholder="e.g. +91 9876543210">
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" id="regPassword" required placeholder="Create password">
                    </div>
                    <div class="form-group">
                        <label>Account Role</label>
                        <select id="regRole" class="form-select">
                            <option value="CITIZEN">Citizen / Road User</option>
                            <option value="HOSPITAL_STAFF">Hospital Emergency Staff Desk</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Blood Group</label>
                        <input type="text" id="regBloodGroup" placeholder="e.g. O+, A+, B+, AB-">
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn-secondary" onclick="closeAuthModal()">Cancel</button>
                        <button type="submit" class="btn-primary"><i class="fa-solid fa-user-plus"></i> Create Account</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- EMERGENCY SOS ACTION MODAL -->
    <div class="modal-overlay" id="sosModal">
        <div class="modal-card emergency-modal">
            <div class="modal-header bg-danger text-white">
                <h3><i class="fa-solid fa-bell-concierge"></i> Emergency SOS Dispatched!</h3>
                <button class="close-modal-btn" onclick="closeSosModal()">&times;</button>
            </div>
            <div class="modal-body">
                
                <div class="sos-status-banner" id="sosStatusBanner">
                    <div class="status-icon pulse-red">
                        <i class="fa-solid fa-truck-medical"></i>
                    </div>
                    <div>
                        <h4 id="hospAssignedTitle">Notifying Hospital...</h4>
                        <p id="hospStatusSubtext">Establishing connection & sending location packet</p>
                    </div>
                </div>

                <div class="sos-details-box">
                    <div class="detail-item">
                        <span class="label"><i class="fa-solid fa-location-dot"></i> Live GPS Location:</span>
                        <span class="value" id="modalGpsCoords">Fetching...</span>
                    </div>
                    <div class="detail-item">
                        <span class="label"><i class="fa-solid fa-hospital"></i> Target Hospital:</span>
                        <span class="value" id="modalHospName">Calculating nearest...</span>
                    </div>
                    <div class="detail-item">
                        <span class="label"><i class="fa-solid fa-phone"></i> Emergency Number:</span>
                        <span class="valueHighlight" id="modalHospPhone">108</span>
                    </div>
                </div>

                <!-- 1-Click Mobile Call & SMS Launch Buttons -->
                <div class="sms-trigger-box">
                    <p class="sms-notice">Click below for immediate direct emergency call & SMS dispatch:</p>
                    <a id="btnCallNearestHosp" href="tel:108" class="btn-call-emergency mb-2">
                        <i class="fa-solid fa-phone-volume fa-shake"></i> 📞 CALL NEAREST HOSPITAL NOW
                    </a>
                    <a id="btnSendMobileSms" href="#" class="btn-sms-launch" target="_blank">
                        <i class="fa-solid fa-comment-sms"></i> OPEN PHONE SMS APP (1-CLICK SEND)
                    </a>
                </div>

                <div class="action-buttons">
                    <a id="btnOpenMaps" href="#" target="_blank" class="btn-secondary">
                        <i class="fa-solid fa-map-location-dot"></i> Open Google Maps Pin
                    </a>
                    <button class="btn-outline" onclick="closeSosModal()">Close Window</button>
                </div>
            </div>
        </div>
    </div>

    <!-- ADD CONTACT MODAL -->
    <div class="modal-overlay" id="addContactModal">
        <div class="modal-card">
            <div class="modal-header">
                <h3><i class="fa-solid fa-user-plus"></i> Add Emergency Contact</h3>
                <button class="close-modal-btn" onclick="closeAddContactModal()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="addContactForm" onsubmit="saveEmergencyContact(event)">
                    <div class="form-group">
                        <label>Contact Name</label>
                        <input type="text" id="contactName" required placeholder="e.g. Family Member / Friend">
                    </div>
                    <div class="form-group">
                        <label>Relationship</label>
                        <input type="text" id="contactRelation" required placeholder="e.g. Father, Spouse, Friend">
                    </div>
                    <div class="form-group">
                        <label>Phone Number</label>
                        <input type="tel" id="contactPhone" required placeholder="e.g. +91 9876543210">
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn-secondary" onclick="closeAddContactModal()">Cancel</button>
                        <button type="submit" class="btn-primary">Save Contact</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Leaflet JS for Interactive Maps -->
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
    <!-- Main Client Application -->
    <script src="js/app.js"></script>
</body>
</html>
