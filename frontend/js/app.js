/**
 * Road Safety & Hospital Notification System Client Application
 */

const API_BASE = 'http://localhost:8080/api';

// Global App State
let state = {
    userLat: 17.5621, // Default Hyderabad baseline
    userLng: 78.4485,
    locationAcquired: false,
    selectedHospitalId: null,
    currentSosAlertId: null,
    pollInterval: null,
    rules: [],
    currentFilter: 'ALL',
    activeView: 'user',
    currentUser: null,
    map: null,
    userMarker: null,
    hospitalMarkers: [],
    nearestHospital: null,
    hospitals: []
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    initGeolocation();
    checkExistingUserSession();
    loadHospitals();
    loadEmergencyContacts();
    loadSafetyRules();
});

// View Switcher Function
function switchView(viewName) {
    state.activeView = viewName;
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));

    if (viewName === 'user') {
        document.getElementById('viewUser').classList.add('active');
        document.getElementById('btnViewUser').classList.add('active');
        if (state.map) {
            setTimeout(() => { state.map.invalidateSize(); }, 300);
        }
    } else if (viewName === 'hospital') {
        document.getElementById('viewHospital').classList.add('active');
        document.getElementById('btnViewHospital').classList.add('active');
        loadHospitalAlerts();
    }
}

// USER AUTHENTICATION & SESSION MANAGEMENT
function checkExistingUserSession() {
    const savedUser = localStorage.getItem('safeRoadUser');
    if (savedUser) {
        try {
            state.currentUser = JSON.parse(savedUser);
            renderUserSessionUI();
        } catch (e) {
            localStorage.removeItem('safeRoadUser');
        }
    }
}

function renderUserSessionUI() {
    const authArea = document.getElementById('authArea');
    if (state.currentUser) {
        authArea.innerHTML = `
            <div class="user-session-badge">
                <i class="fa-solid fa-circle-user text-primary"></i>
                <span>${state.currentUser.fullName}</span>
                ${state.currentUser.bloodGroup ? `<small>(${state.currentUser.bloodGroup})</small>` : ''}
                <button class="btn-sm btn-outline" style="margin-left:6px; padding:2px 8px;" onclick="handleLogout()">Logout</button>
            </div>
        `;

        if (state.currentUser.role === 'HOSPITAL_STAFF' && state.activeView === 'user') {
            switchView('hospital');
        }
    } else {
        authArea.innerHTML = `
            <button class="btn-primary btn-sm" onclick="openAuthModal('login')">
                <i class="fa-solid fa-right-to-bracket"></i> Login / Register
            </button>
        `;
    }
}

function openAuthModal(tab = 'login') {
    document.getElementById('authModal').classList.add('active');
    toggleAuthTab(tab);
}

function closeAuthModal() {
    document.getElementById('authModal').classList.remove('active');
}

function toggleAuthTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabLoginBtn = document.getElementById('tabLoginBtn');
    const tabRegisterBtn = document.getElementById('tabRegisterBtn');
    const title = document.getElementById('authModalTitle');

    if (tab === 'login') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        tabLoginBtn.classList.add('active');
        tabRegisterBtn.classList.remove('active');
        title.innerHTML = `<i class="fa-solid fa-user-lock"></i> User Login`;
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        tabLoginBtn.classList.remove('active');
        tabRegisterBtn.classList.add('active');
        title.innerHTML = `<i class="fa-solid fa-user-plus"></i> Register Account`;
    }
}

async function handleLoginSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (data.success) {
            state.currentUser = data.user;
            localStorage.setItem('safeRoadUser', JSON.stringify(data.user));
            renderUserSessionUI();
            closeAuthModal();
            alert(`Welcome back, ${data.user.fullName}!`);
        } else {
            alert(data.message || "Invalid credentials.");
        }
    } catch (err) {
        console.error("Login error:", err);
        alert("Failed to connect to authentication server.");
    }
}

async function handleRegisterSubmit(e) {
    e.preventDefault();
    const fullName = document.getElementById('regFullName').value;
    const email = document.getElementById('regEmail').value;
    const phone = document.getElementById('regPhone').value;
    const password = document.getElementById('regPassword').value;
    const role = document.getElementById('regRole').value;
    const bloodGroup = document.getElementById('regBloodGroup').value;

    try {
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName, email, phone, password, role, bloodGroup })
        });
        const data = await res.json();

        if (data.success) {
            state.currentUser = data.user;
            localStorage.setItem('safeRoadUser', JSON.stringify(data.user));
            renderUserSessionUI();
            closeAuthModal();
            alert(`Account registered successfully! Welcome, ${data.user.fullName}.`);
        } else {
            alert(data.message || "Registration failed.");
        }
    } catch (err) {
        console.error("Register error:", err);
        alert("Failed to register account.");
    }
}

function handleLogout() {
    state.currentUser = null;
    localStorage.removeItem('safeRoadUser');
    renderUserSessionUI();
    alert("Logged out successfully.");
}

// GEOLOCATION & MAP INTERACTION
// GEOLOCATION & LOCATION SERVICES
function initGeolocation() {
    const locStatus = document.getElementById('locationText');
    locStatus.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Locating High-Accuracy GPS...';

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                state.userLat = position.coords.latitude;
                state.userLng = position.coords.longitude;
                state.locationAccuracy = position.coords.accuracy ? Math.round(position.coords.accuracy) : null;
                state.locationAcquired = true;
                const accText = state.locationAccuracy ? ` (±${state.locationAccuracy}m)` : '';
                locStatus.innerHTML = `<i class="fa-solid fa-location-crosshairs text-success"></i> GPS Active (${state.userLat.toFixed(4)}, ${state.userLng.toFixed(4)})${accText}`;
                reverseGeocodeUserLocation(state.userLat, state.userLng);
                loadHospitals();
                startContinuousGpsTracking();
            },
            (error) => {
                console.warn("Geolocation permission/timeout error:", error.message);
                locStatus.innerHTML = `<i class="fa-solid fa-network-wired text-warning"></i> IP Location Active`;
                fetchIpBasedLocation();
            },
            { enableHighAccuracy: true, timeout: 7000, maximumAge: 0 }
        );
    } else {
        fetchIpBasedLocation();
    }
}

async function fetchIpBasedLocation() {
    const locStatus = document.getElementById('locationText');
    try {
        const res = await fetch('https://ipapi.co/json/');
        if (res.ok) {
            const data = await res.json();
            if (data.latitude && data.longitude) {
                state.userLat = parseFloat(data.latitude);
                state.userLng = parseFloat(data.longitude);
                state.locationAcquired = true;
                locStatus.innerHTML = `<i class="fa-solid fa-city text-primary"></i> Area: ${data.city || 'Detected'}`;
                reverseGeocodeUserLocation(state.userLat, state.userLng);
                loadHospitals();
                return;
            }
        }
    } catch (e) {
        console.warn("IP Geolocation fallback warning:", e);
    }
    state.userLat = 17.5621;
    state.userLng = 78.4485;
    locStatus.innerHTML = `GPS Default (17.5621, 78.4485)`;
    reverseGeocodeUserLocation(state.userLat, state.userLng);
    loadHospitals();
}

function startContinuousGpsTracking() {
    if ("geolocation" in navigator && !state.watchPositionId) {
        state.watchPositionId = navigator.geolocation.watchPosition(
            (position) => {
                const newLat = position.coords.latitude;
                const newLng = position.coords.longitude;
                if (Math.abs(newLat - state.userLat) > 0.001 || Math.abs(newLng - state.userLng) > 0.001) {
                    state.userLat = newLat;
                    state.userLng = newLng;
                    reverseGeocodeUserLocation(state.userLat, state.userLng);
                    loadHospitals();
                }
            },
            (err) => console.warn("GPS watch notice:", err),
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
        );
    }
}

async function reverseGeocodeUserLocation(lat, lng) {
    const elMap = document.getElementById('mapAddressLandmark');
    const elCard = document.getElementById('currentLandmarkText');
    state.currentLandmark = `GPS Coordinates ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        if (res.ok) {
            const data = await res.json();
            const displayName = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            state.currentLandmark = displayName;
            if (elMap) elMap.innerHTML = `<i class="fa-solid fa-location-dot text-danger"></i> <strong>Current Landmark:</strong> ${displayName}`;
            if (elCard) elCard.innerHTML = `<i class="fa-solid fa-location-dot text-danger"></i> <strong>Location:</strong> ${displayName}`;
            return;
        }
    } catch (e) {
        console.warn("Reverse geocode warning:", e);
    }
    
    if (elMap) elMap.innerHTML = `<i class="fa-solid fa-location-dot text-danger"></i> <strong>Current Location:</strong> GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
    if (elCard) elCard.innerHTML = `<i class="fa-solid fa-location-dot text-danger"></i> <strong>Location:</strong> GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
}

async function searchCustomLocation() {
    const input = document.getElementById('manualLocInput');
    if (!input || !input.value.trim()) return;
    const query = input.value.trim();

    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data && data.length > 0) {
            state.userLat = parseFloat(data[0].lat);
            state.userLng = parseFloat(data[0].lon);
            state.locationAcquired = true;
            document.getElementById('locationText').innerHTML = `<i class="fa-solid fa-location-pin text-primary"></i> Set: ${query}`;
            reverseGeocodeUserLocation(state.userLat, state.userLng);
            loadHospitals();
        } else {
            alert("Location not found. Please try another landmark or city name.");
        }
    } catch (e) {
        alert("Search failed. Check network connection.");
    }
}

function initLeafletMap(hospitals) {
    const mapDiv = document.getElementById('hospitalMap');
    if (!mapDiv || typeof L === 'undefined') return;

    if (!state.map) {
        state.map = L.map('hospitalMap').setView([state.userLat, state.userLng], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }).addTo(state.map);
    }

    if (!state.mapClickListenerAdded) {
        state.map.on('click', function(e) {
            state.userLat = e.latlng.lat;
            state.userLng = e.latlng.lng;
            state.locationAcquired = true;
            document.getElementById('locationText').innerHTML = `GPS Pin (${state.userLat.toFixed(4)}, ${state.userLng.toFixed(4)})`;
            reverseGeocodeUserLocation(state.userLat, state.userLng);
            loadHospitals();
        });
        state.mapClickListenerAdded = true;
    }

    if (state.userMarker) {
        state.map.removeLayer(state.userMarker);
    }
    state.hospitalMarkers.forEach(m => state.map.removeLayer(m));
    state.hospitalMarkers = [];

    // User / Victim Marker (Draggable Pin)
    const userIcon = L.divIcon({
        className: 'custom-user-marker',
        html: '<div style="background:#ef4444; width:26px; height:26px; border-radius:50%; border:3px solid white; box-shadow: 0 0 16px rgba(239,68,68,1); animation: pulse 1.5s infinite; cursor:pointer;" title="Click map or drag to set accident location"></div>',
        iconSize: [26, 26],
        iconAnchor: [13, 13]
    });
    
    state.userMarker = L.marker([state.userLat, state.userLng], { icon: userIcon, draggable: true })
        .addTo(state.map)
        .bindPopup(`<b>🚨 Your Emergency Accident Location</b><br>GPS: ${state.userLat.toFixed(5)}, ${state.userLng.toFixed(5)}<br><small style="color:#2563eb;">(Drag marker or click map to change pin)</small>`);

    state.userMarker.on('dragend', function(e) {
        const newPos = e.target.getLatLng();
        state.userLat = newPos.lat;
        state.userLng = newPos.lng;
        state.locationAcquired = true;
        document.getElementById('locationText').innerHTML = `GPS Pin (${state.userLat.toFixed(4)}, ${state.userLng.toFixed(4)})`;
        reverseGeocodeUserLocation(state.userLat, state.userLng);
        loadHospitals();
    });

    const bounds = L.latLngBounds([[state.userLat, state.userLng]]);

    // Hospital Markers
    hospitals.forEach((h, idx) => {
        const isNearest = idx === 0;
        const color = isNearest ? '#16a34a' : '#2563eb';
        const hospIcon = L.divIcon({
            className: 'custom-hosp-marker',
            html: `<div style="background:${color}; color:white; font-size:11px; font-weight:bold; padding:4px 8px; border-radius:12px; border:2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.35); display:flex; align-items:center; gap:4px;"><i class="fa-solid fa-hospital"></i> ${h.distanceFromUserKm || '0'} km</div>`,
            iconSize: [75, 26],
            iconAnchor: [37, 13]
        });

        const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${state.userLat},${state.userLng}&destination=${h.latitude},${h.longitude}`;

        const marker = L.marker([h.latitude, h.longitude], { icon: hospIcon })
            .addTo(state.map)
            .bindPopup(`
                <div style="font-family: inherit; font-size: 13px; line-height: 1.4; max-width: 230px;">
                    <h4 style="margin: 0 0 4px 0; color: #1e293b;"><i class="fa-solid fa-hospital text-danger"></i> ${h.name}</h4>
                    <p style="margin:0 0 6px 0; font-size: 11px; color: #64748b;">${h.address}</p>
                    <div style="background: #f1f5f9; padding: 6px; border-radius: 6px; margin-bottom: 8px;">
                        <span style="color: #059669; font-weight: 700;">📍 ${h.distanceFromUserKm} km (Road Distance)</span><br>
                        <span style="color: #b91c1c; font-weight: 700;">⏱️ ~${h.estimatedEtaMinutes || 5} min Ambulance ETA</span>
                    </div>
                    <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                        <a href="tel:${h.phoneNumber}" class="btn-sm btn-primary" style="background:#dc2626; color:white; text-decoration:none; padding: 4px 8px;">
                            <i class="fa-solid fa-phone"></i> Call ${h.phoneNumber}
                        </a>
                        <button onclick="handleEmergencySOS(${h.id})" class="btn-sm btn-primary" style="padding: 4px 8px;">
                            <i class="fa-solid fa-truck-medical"></i> Select SOS
                        </button>
                        <a href="${directionsUrl}" target="_blank" class="btn-sm btn-outline" style="padding: 4px 8px; text-decoration:none;">
                            <i class="fa-solid fa-route"></i> Nav
                        </a>
                    </div>
                </div>
            `);

        bounds.extend([h.latitude, h.longitude]);
        state.hospitalMarkers.push(marker);
    });

    if (hospitals.length > 0) {
        state.map.fitBounds(bounds, { padding: [35, 35], maxZoom: 15 });
    }
}

// SOS DISPATCH & EMERGENCY CALL
async function handleEmergencySOS(targetHospId = null) {
    const btn = document.getElementById('sosMainBtn');
    if (btn) btn.disabled = true;

    openSosModal();
    updateSosModalStatus('DISPATCHING', 'Sending Emergency Packet to Hospital & Preparing Mobile Call / SMS...');

    try {
        const victimName = state.currentUser ? state.currentUser.fullName : "Accident Victim / Citizen SOS";
        const victimPhone = state.currentUser ? state.currentUser.phone : "+919876543210";
        const bloodInfo = state.currentUser && state.currentUser.bloodGroup ? ` [Blood Group: ${state.currentUser.bloodGroup}]` : "";

        const payload = {
            latitude: state.userLat,
            longitude: state.userLng,
            victimName: victimName,
            victimPhone: victimPhone,
            addressDetails: `GPS Coordinates: ${state.userLat.toFixed(5)}, ${state.userLng.toFixed(5)}`,
            medicalNotes: `ACCIDENT EMERGENCY - URGENT MEDICAL DISPATCH REQUIRED${bloodInfo}`,
            hospitalId: targetHospId || state.selectedHospitalId
        };

        const response = await fetch(`${API_BASE}/emergency/trigger`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.success) {
            state.currentSosAlertId = data.alertId;

            document.getElementById('modalGpsCoords').innerText = `${state.userLat.toFixed(5)}, ${state.userLng.toFixed(5)}`;
            document.getElementById('modalHospName').innerText = data.assignedHospital;
            document.getElementById('modalHospPhone').innerText = data.hospitalPhone;

            const callHospBtn = document.getElementById('btnCallNearestHosp');
            if (callHospBtn) {
                callHospBtn.setAttribute('href', data.telUri || `tel:${data.hospitalPhone}`);
                callHospBtn.innerHTML = `<i class="fa-solid fa-phone-volume fa-shake"></i> 📞 CALL ${data.assignedHospital.toUpperCase()} NOW (${data.hospitalPhone})`;
            }

            const smsLaunchBtn = document.getElementById('btnSendMobileSms');
            smsLaunchBtn.setAttribute('href', data.smsUri);

            document.getElementById('btnOpenMaps').setAttribute('href', data.mapUrl);

            updateSosModalStatus('PENDING', `Hospital Notified (${data.assignedHospital}). Tap Call button below or wait for Ambulance Dispatch confirmation...`);

            startSosStatusPolling(data.alertId);
        } else {
            updateSosModalStatus('ERROR', 'Failed to dispatch SOS alert to server.');
        }

    } catch (err) {
        console.error("SOS Dispatch Error:", err);
        const fallbackSms = `sms:108?body=${encodeURIComponent(`ACCIDENT EMERGENCY SOS! GPS: https://maps.google.com/?q=${state.userLat},${state.userLng}`)}`;
        document.getElementById('btnSendMobileSms').setAttribute('href', fallbackSms);
        const callHospBtn = document.getElementById('btnCallNearestHosp');
        if (callHospBtn) callHospBtn.setAttribute('href', 'tel:108');
        updateSosModalStatus('PENDING', 'Emergency ready! Click Call button or SMS button below to notify emergency services.');
    } finally {
        if (btn) btn.disabled = false;
    }
}

function openSosModal() {
    document.getElementById('sosModal').classList.add('active');
}

function closeSosModal() {
    document.getElementById('sosModal').classList.remove('active');
    if (state.pollInterval) {
        clearInterval(state.pollInterval);
        state.pollInterval = null;
    }
}

function updateSosModalStatus(status, message) {
    const title = document.getElementById('hospAssignedTitle');
    const subtext = document.getElementById('hospStatusSubtext');

    if (status === 'DISPATCHING') {
        title.innerText = "Dispatching SOS Alert...";
    } else if (status === 'PENDING') {
        title.innerText = "Hospital Notified! SOS Active";
    } else if (status === 'ACCEPTED') {
        title.innerText = "Hospital Accepted Emergency! 🏥";
    } else if (status === 'AMBULANCE_DISPATCHED') {
        title.innerText = "Ambulance Dispatched & En Route! 🚑";
    } else if (status === 'RESOLVED') {
        title.innerText = "Medical Rescue Completed ✅";
    }
    subtext.innerText = message;
}

function startSosStatusPolling(alertId) {
    if (state.pollInterval) clearInterval(state.pollInterval);

    state.pollInterval = setInterval(async () => {
        try {
            const res = await fetch(`${API_BASE}/emergency/alerts/${alertId}`);
            if (res.ok) {
                const alertData = await res.json();
                if (alertData.status === 'ACCEPTED') {
                    updateSosModalStatus('ACCEPTED', `Hospital (${alertData.assignedHospitalName}) has received your SOS alert.`);
                } else if (alertData.status === 'AMBULANCE_DISPATCHED') {
                    updateSosModalStatus('AMBULANCE_DISPATCHED', `Ambulance dispatched from ${alertData.assignedHospitalName}! Help is on the way.`);
                } else if (alertData.status === 'RESOLVED') {
                    updateSosModalStatus('RESOLVED', `Rescue completed successfully.`);
                    clearInterval(state.pollInterval);
                }
            }
        } catch (e) {
            console.warn("Status poll warning:", e);
        }
    }, 3000);
}

// HOSPITALS & RULES
async function loadHospitals() {
    const container = document.getElementById('hospitalList');
    try {
        const res = await fetch(`${API_BASE}/hospitals?lat=${state.userLat}&lng=${state.userLng}`);
        const hospitals = await res.json();
        state.hospitals = hospitals;

        document.getElementById('hospCountBadge').innerText = hospitals.length;

        if (hospitals.length === 0) {
            container.innerHTML = `<p class="text-muted py-3 text-center">No hospitals found.</p>`;
            return;
        }

        // Set nearest hospital
        state.nearestHospital = hospitals[0];
        state.selectedHospitalId = state.nearestHospital.id;

        // Update hero quick call button
        const heroCallBtn = document.getElementById('heroQuickCallBtn');
        if (heroCallBtn && state.nearestHospital) {
            heroCallBtn.setAttribute('href', `tel:${state.nearestHospital.phoneNumber}`);
            heroCallBtn.innerHTML = `<i class="fa-solid fa-phone-volume fa-shake"></i> CALL NEAREST HOSPITAL NOW (${state.nearestHospital.phoneNumber})`;
        }

        // Initialize / update Leaflet map
        initLeafletMap(hospitals);

        container.innerHTML = hospitals.map((h, idx) => {
            const isNearest = idx === 0;
            const mapPinUrl = `https://maps.google.com/?q=${h.latitude},${h.longitude}`;
            const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${state.userLat},${state.userLng}&destination=${h.latitude},${h.longitude}`;

            const distDisplay = h.distanceFromUserKm != null
                ? (h.distanceFromUserKm < 1.0 ? Math.round(h.distanceFromUserKm * 1000) + ' meters' : h.distanceFromUserKm + ' km')
                : 'Nearby';

            return `
            <div class="hospital-card-item ${isNearest ? 'nearest-highlight' : ''}">
                ${isNearest ? `<div class="nearest-badge"><i class="fa-solid fa-star"></i> CLOSEST EMERGENCY TRAUMA CENTER</div>` : ''}
                <div class="hosp-details">
                    <h4><i class="fa-solid fa-hospital text-danger"></i> ${h.name}</h4>
                    <p style="margin-top: 3px;"><i class="fa-solid fa-location-dot text-danger"></i> <strong>Address:</strong> ${h.address}</p>
                    <p style="font-size:0.75rem; color:#475569; margin-top:2px;">
                        <i class="fa-solid fa-map-pin text-primary"></i> <strong>Exact GPS:</strong> <code>${h.latitude.toFixed(4)}° N, ${h.longitude.toFixed(4)}° E</code>
                    </p>
                    <p style="font-size:0.78rem; margin-top:5px;">
                        <i class="fa-solid fa-phone text-danger"></i> Helpline: <strong><a href="tel:${h.phoneNumber}" style="color:#dc2626; text-decoration:underline;">${h.phoneNumber}</a></strong> | 
                        <i class="fa-solid fa-truck-medical text-primary"></i> Ambulances: <strong>${h.availableAmbulances}</strong> | 
                        <i class="fa-solid fa-clock text-warning"></i> ETA: <strong>~${h.estimatedEtaMinutes || 5} mins</strong>
                    </p>
                </div>
                <div class="hosp-meta">
                    <span class="dist-badge ${isNearest ? 'dist-nearest' : ''}"><i class="fa-solid fa-route"></i> ${distDisplay}</span>
                    <div style="display: flex; gap: 5px; flex-wrap: wrap; margin-top: 8px;">
                        <a href="tel:${h.phoneNumber}" class="btn-sm btn-call-direct">
                            <i class="fa-solid fa-phone"></i> Call
                        </a>
                        <button class="btn-sm btn-primary" onclick="handleEmergencySOS(${h.id})">
                            <i class="fa-solid fa-truck-medical"></i> Select SOS
                        </button>
                        <a href="${mapPinUrl}" target="_blank" class="btn-sm btn-outline" style="text-decoration:none;" title="View Exact Pin on Google Maps">
                            <i class="fa-solid fa-map-pin text-danger"></i> Maps Pin
                        </a>
                        <a href="${directionsUrl}" target="_blank" class="btn-sm btn-outline" style="text-decoration:none;" title="Get Turn-by-Turn Driving Directions">
                            <i class="fa-solid fa-location-arrow text-primary"></i> Nav
                        </a>
                    </div>
                </div>
            </div>
            `;
        }).join('');

    } catch (err) {
        console.error("Error loading hospitals:", err);
        container.innerHTML = `<p class="text-danger py-2">Error connecting to server. Ensure Spring Boot backend is running.</p>`;
    }
}

async function loadEmergencyContacts() {
    const container = document.getElementById('contactsList');
    try {
        const res = await fetch(`${API_BASE}/emergency-contacts`);
        const contacts = await res.json();

        container.innerHTML = contacts.map(c => `
            <div class="contact-item">
                <div class="contact-info">
                    <h5><i class="fa-solid fa-user-shield text-warning"></i> ${c.name} (${c.relationship})</h5>
                    <p><i class="fa-solid fa-phone"></i> ${c.phoneNumber}</p>
                </div>
                <div style="display:flex; gap:4px;">
                    <a href="tel:${c.phoneNumber}" class="btn-sm btn-call-direct">
                        <i class="fa-solid fa-phone"></i> Call
                    </a>
                    <a href="sms:${c.phoneNumber}?body=${encodeURIComponent(`ACCIDENT EMERGENCY! I need help. My live GPS location: https://maps.google.com/?q=${state.userLat},${state.userLng}`)}" class="btn-sm btn-outline">
                        <i class="fa-solid fa-comment-sms"></i> SMS
                    </a>
                </div>
            </div>
        `).join('');
    } catch (err) {
        container.innerHTML = `<p class="text-muted text-center py-2">No custom contacts added.</p>`;
    }
}

function openAddContactModal() {
    document.getElementById('addContactModal').classList.add('active');
}

function closeAddContactModal() {
    document.getElementById('addContactModal').classList.remove('active');
}

async function saveEmergencyContact(e) {
    e.preventDefault();
    const name = document.getElementById('contactName').value;
    const relationship = document.getElementById('contactRelation').value;
    const phoneNumber = document.getElementById('contactPhone').value;

    try {
        await fetch(`${API_BASE}/emergency-contacts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, relationship, phoneNumber })
        });
        closeAddContactModal();
        loadEmergencyContacts();
    } catch (err) {
        alert("Failed to save contact.");
    }
}

async function loadSafetyRules() {
    const grid = document.getElementById('rulesGrid');
    try {
        const res = await fetch(`${API_BASE}/safety-rules`);
        state.rules = await res.json();
        renderRulesGrid(state.rules);
    } catch (err) {
        console.error("Error loading rules:", err);
        grid.innerHTML = `<p class="text-muted">Unable to load safety rules.</p>`;
    }
}

function renderRulesGrid(rulesList) {
    const grid = document.getElementById('rulesGrid');

    if (rulesList.length === 0) {
        grid.innerHTML = `<div class="py-4 text-center text-muted" style="grid-column: 1/-1;">No safety guidelines match your criteria.</div>`;
        return;
    }

    grid.innerHTML = rulesList.map(r => {
        const categoryClass = r.category.toLowerCase();
        let categoryLabel = r.category.replace(/_/g, ' ');
        let iconClass = r.iconName || 'fa-shield-halved';

        return `
            <div class="rule-card">
                <div>
                    <div class="rule-top">
                        <div class="rule-icon-box ${categoryClass}">
                            <i class="fa-solid ${iconClass}"></i>
                        </div>
                        <div class="rule-info">
                            <h4>${r.title}</h4>
                            <span class="badge-status" style="font-size:0.68rem; background:#f1f5f9; color:#475569;">${categoryLabel}</span>
                        </div>
                    </div>
                    <p class="rule-desc">${r.description}</p>
                </div>
                ${r.penalty ? `<span class="rule-penalty"><i class="fa-solid fa-triangle-exclamation"></i> ${r.penalty}</span>` : ''}
            </div>
        `;
    }).join('');
}

function filterRules(category) {
    state.currentFilter = category;
    document.querySelectorAll('.filter-chip').forEach(btn => btn.classList.remove('active'));
    if (window.event && window.event.target) {
        window.event.target.closest('.filter-chip').classList.add('active');
    }

    if (category === 'ALL') {
        renderRulesGrid(state.rules);
    } else {
        const filtered = state.rules.filter(r => r.category === category);
        renderRulesGrid(filtered);
    }
}

function searchRules() {
    const query = document.getElementById('ruleSearchInput').value.toLowerCase();
    const filtered = state.rules.filter(r => 
        (state.currentFilter === 'ALL' || r.category === state.currentFilter) &&
        (r.title.toLowerCase().includes(query) || r.description.toLowerCase().includes(query) || (r.penalty && r.penalty.toLowerCase().includes(query)))
    );
    renderRulesGrid(filtered);
}

// HOSPITAL DASHBOARD
async function loadHospitalAlerts() {
    const tbody = document.getElementById('alertsTableBody');
    const badge = document.getElementById('activeAlertCount');

    try {
        const res = await fetch(`${API_BASE}/emergency/alerts`);
        const alerts = await res.json();

        badge.innerText = `${alerts.filter(a => a.status !== 'RESOLVED').length} Active Emergencies`;

        if (alerts.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No emergency alerts registered.</td></tr>`;
            return;
        }

        tbody.innerHTML = alerts.map(a => `
            <tr>
                <td><strong>#SOS-${a.id}</strong></td>
                <td>
                    <strong>${a.victimName}</strong><br>
                    <small class="text-muted"><a href="tel:${a.victimPhone}" style="color:#2563eb;"><i class="fa-solid fa-phone"></i> ${a.victimPhone}</a></small>
                </td>
                <td><small>${new Date(a.createdAt).toLocaleTimeString()}</small></td>
                <td>
                    <a href="https://maps.google.com/?q=${a.latitude},${a.longitude}" target="_blank" class="btn-sm btn-outline">
                        <i class="fa-solid fa-map-pin text-danger"></i> Pin (${a.latitude.toFixed(4)}, ${a.longitude.toFixed(4)})
                    </a>
                </td>
                <td>${a.assignedHospitalName || 'General Emergency'}</td>
                <td><span class="badge-status ${a.status}">${a.status}</span></td>
                <td>
                    <div style="display:flex; gap:4px;">
                        ${a.status === 'PENDING' ? `
                            <button class="btn-sm btn-primary" onclick="updateAlertStatus(${a.id}, 'ACCEPTED')">
                                <i class="fa-solid fa-check"></i> Accept
                            </button>
                        ` : ''}
                        ${a.status === 'ACCEPTED' ? `
                            <button class="btn-sm btn-primary" style="background:#16a34a;" onclick="updateAlertStatus(${a.id}, 'AMBULANCE_DISPATCHED')">
                                <i class="fa-solid fa-truck-medical"></i> Dispatch
                            </button>
                        ` : ''}
                        ${a.status !== 'RESOLVED' ? `
                            <button class="btn-sm btn-secondary" onclick="updateAlertStatus(${a.id}, 'RESOLVED')">
                                <i class="fa-solid fa-circle-check"></i> Resolve
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');

    } catch (err) {
        console.error("Error loading hospital alerts:", err);
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-danger">Error retrieving emergency alerts.</td></tr>`;
    }
}

async function updateAlertStatus(alertId, newStatus) {
    try {
        await fetch(`${API_BASE}/emergency/alerts/${alertId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        loadHospitalAlerts();
    } catch (err) {
        alert("Failed to update alert status.");
    }
}

// ==========================================
// SIMULATED EMERGENCY VOICE CALL SYSTEM
// ==========================================
let simulatedCallState = {
    timerInterval: null,
    seconds: 0,
    speakerOn: true
};

function startSimulatedCall() {
    const hosp = state.nearestHospital || { name: 'Malla Reddy Emergency Desk', phoneNumber: '+919100910000' };
    
    document.getElementById('fakeCallHospName').innerText = hosp.name;
    document.getElementById('fakeCallHospPhone').innerText = hosp.phoneNumber;
    document.getElementById('fakeCallModal').classList.add('active');
    
    simulatedCallState.seconds = 0;
    document.getElementById('fakeCallTimer').innerText = 'Calling...';
    
    if (simulatedCallState.timerInterval) clearInterval(simulatedCallState.timerInterval);
    
    // Connect call after 1.5 seconds
    setTimeout(() => {
        document.getElementById('fakeCallTimer').innerText = '00:01';
        document.getElementById('fakeCallStatus').innerHTML = '<i class="fa-solid fa-circle text-success fa-beat"></i> Call Connected (00:01)';
        
        simulatedCallState.timerInterval = setInterval(() => {
            simulatedCallState.seconds++;
            const mins = String(Math.floor(simulatedCallState.seconds / 60)).padStart(2, '0');
            const secs = String(simulatedCallState.seconds % 60).padStart(2, '0');
            document.getElementById('fakeCallTimer').innerText = `${mins}:${secs}`;
            document.getElementById('fakeCallStatus').innerHTML = `<i class="fa-solid fa-circle text-success fa-beat"></i> Call Connected (${mins}:${secs})`;
        }, 1000);

        speakSimulatedCallResponse();
    }, 1500);
}

function speakSimulatedCallResponse() {
    const hospName = state.nearestHospital ? state.nearestHospital.name : 'Emergency Trauma Desk';
    const landmark = state.currentLandmark || 'your current location';
    const responseText = `Emergency Trauma Desk connected! We have received your road accident SOS at ${landmark}. Ambulance unit 108 is dispatched and en route to your location. Driver contact number is +91 98765 00108. Please stay calm and keep the victim still.`;

    const transcriptBox = document.getElementById('fakeCallTranscript');
    if (transcriptBox) {
        transcriptBox.innerHTML = `
            <p><i class="fa-solid fa-headset text-success"></i> <strong>${hospName}:</strong></p>
            <p>"${responseText}"</p>
        `;
    }

    // TTS Web Speech API Audio Simulation
    if ('speechSynthesis' in window && simulatedCallState.speakerOn) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(responseText);
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
    }
}

function toggleCallSpeaker() {
    simulatedCallState.speakerOn = !simulatedCallState.speakerOn;
    const btn = document.getElementById('btnSpeaker');
    if (simulatedCallState.speakerOn) {
        btn.classList.add('active');
        btn.innerHTML = `<i class="fa-solid fa-volume-high"></i> Speaker ON`;
    } else {
        btn.classList.remove('active');
        btn.innerHTML = `<i class="fa-solid fa-volume-xmark"></i> Speaker OFF`;
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    }
}

function closeFakeCallModal() {
    document.getElementById('fakeCallModal').classList.remove('active');
    if (simulatedCallState.timerInterval) {
        clearInterval(simulatedCallState.timerInterval);
        simulatedCallState.timerInterval = null;
    }
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
}

// ==========================================
// SIMULATED FAKE SMS DISPATCH CHAT
// ==========================================
function openFakeSmsModal() {
    const hosp = state.nearestHospital || { name: 'Malla Reddy Hospital Desk', phoneNumber: '+919100910000' };
    document.getElementById('fakeSmsHospTitle').innerHTML = `<i class="fa-solid fa-hospital text-danger"></i> ${hosp.name}`;
    document.getElementById('fakeSmsHospSub').innerText = `Direct SMS Line: ${hosp.phoneNumber}`;
    
    document.getElementById('fakeSmsModal').classList.add('active');

    // Populate initial SOS message stream if empty
    const chatBody = document.getElementById('fakeSmsChatBody');
    if (chatBody.children.length <= 1) {
        const victimName = state.currentUser ? state.currentUser.fullName : "Accident Victim";
        const landmark = state.currentLandmark || `GPS: ${state.userLat.toFixed(4)}, ${state.userLng.toFixed(4)}`;
        const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        chatBody.innerHTML = `
            <div class="chat-bubble chat-bubble-user">
                🚨 <strong>ACCIDENT EMERGENCY SOS!</strong><br>
                Victim: ${victimName}<br>
                Location: ${landmark}<br>
                Google Maps Pin: https://maps.google.com/?q=${state.userLat},${state.userLng}<br>
                <em>URGENT MEDICAL AMBULANCE DISPATCH REQUIRED!</em>
                <span class="chat-time">${nowTime}</span>
            </div>
            <div class="chat-bubble chat-bubble-hosp">
                🏥 <strong>[${hosp.name} Desk]:</strong><br>
                Emergency SOS Alert Received! Ambulance Unit AMB-04 has been dispatched.<br>
                <strong>Driver Contact:</strong> +91 98765 00108<br>
                <strong>ETA:</strong> ~4 minutes.
                <span class="chat-time">${nowTime}</span>
            </div>
        `;
    }
}

function closeFakeSmsModal() {
    document.getElementById('fakeSmsModal').classList.remove('active');
}

function sendFakeSmsMessage(e) {
    e.preventDefault();
    const input = document.getElementById('fakeSmsInput');
    const msgText = input.value.trim();
    if (!msgText) return;

    const chatBody = document.getElementById('fakeSmsChatBody');
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Append User Message
    const userBubble = document.createElement('div');
    userBubble.className = 'chat-bubble chat-bubble-user';
    userBubble.innerHTML = `${msgText} <span class="chat-time">${nowTime}</span>`;
    chatBody.appendChild(userBubble);
    input.value = '';
    chatBody.scrollTop = chatBody.scrollHeight;

    // Simulate Automated Hospital Reply after 1 second
    setTimeout(() => {
        const replyBubble = document.createElement('div');
        replyBubble.className = 'chat-bubble chat-bubble-hosp';
        const hospName = state.nearestHospital ? state.nearestHospital.name : 'Hospital SOS Desk';
        
        replyBubble.innerHTML = `
            🏥 <strong>[${hospName} Responder]:</strong><br>
            Message acknowledged ("${msgText}"). Our trauma team and driver have been updated in real-time.
            <span class="chat-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        `;
        chatBody.appendChild(replyBubble);
        chatBody.scrollTop = chatBody.scrollHeight;
    }, 1000);
}

// ==========================================
// LOCATION MODAL & PRESETS
// ==========================================
function openLocationModal() {
    document.getElementById('locationModal').classList.add('active');
    document.getElementById('modalLat').value = state.userLat.toFixed(5);
    document.getElementById('modalLng').value = state.userLng.toFixed(5);
}

function closeLocationModal() {
    document.getElementById('locationModal').classList.remove('active');
}

function setLocationPreset(lat, lng, label) {
    state.userLat = lat;
    state.userLng = lng;
    state.locationAcquired = true;
    document.getElementById('locationText').innerHTML = `<i class="fa-solid fa-location-pin text-primary"></i> Preset: ${label}`;
    reverseGeocodeUserLocation(lat, lng);
    loadHospitals();
}

async function searchModalCustomLocation() {
    const input = document.getElementById('modalLocSearch');
    if (!input || !input.value.trim()) return;
    const query = input.value.trim();

    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data && data.length > 0) {
            state.userLat = parseFloat(data[0].lat);
            state.userLng = parseFloat(data[0].lon);
            state.locationAcquired = true;
            document.getElementById('locationText').innerHTML = `<i class="fa-solid fa-location-pin text-primary"></i> Set: ${query}`;
            reverseGeocodeUserLocation(state.userLat, state.userLng);
            loadHospitals();
            closeLocationModal();
        } else {
            alert("Location not found. Please try another landmark or city name.");
        }
    } catch (e) {
        alert("Search failed. Check network connection.");
    }
}

function applyManualCoords() {
    const latInput = document.getElementById('modalLat').value;
    const lngInput = document.getElementById('modalLng').value;

    if (!latInput || !lngInput) {
        alert("Please enter valid Latitude and Longitude.");
        return;
    }

    state.userLat = parseFloat(latInput);
    state.userLng = parseFloat(lngInput);
    state.locationAcquired = true;
    document.getElementById('locationText').innerHTML = `<i class="fa-solid fa-location-crosshairs text-success"></i> Manual (${state.userLat.toFixed(4)}, ${state.userLng.toFixed(4)})`;
    reverseGeocodeUserLocation(state.userLat, state.userLng);
    loadHospitals();
    closeLocationModal();
}

