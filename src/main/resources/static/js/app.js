/**
 * Road Safety & Hospital Notification System Client Application
 */

const API_BASE = '/api';

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
    currentUser: null
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
    } else if (viewName === 'hospital') {
        document.getElementById('viewHospital').classList.add('active');
        document.getElementById('btnViewHospital').classList.add('active');
        loadHospitalAlerts();
    }
}

// -------------------------------------------------------------
// USER AUTHENTICATION & SESSION MANAGEMENT
// -------------------------------------------------------------
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

// -------------------------------------------------------------
// GEOLOCATION & SOS DISPATCH
// -------------------------------------------------------------
function initGeolocation() {
    const locStatus = document.getElementById('locationText');
    locStatus.innerHTML = 'Locating GPS...';

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                state.userLat = position.coords.latitude;
                state.userLng = position.coords.longitude;
                state.locationAcquired = true;
                locStatus.innerHTML = `GPS Active (${state.userLat.toFixed(4)}, ${state.userLng.toFixed(4)})`;
                loadHospitals();
            },
            (error) => {
                console.warn("Geolocation fallback active:", error.message);
                locStatus.innerHTML = `GPS Default (17.5621, 78.4485)`;
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    } else {
        locStatus.innerHTML = `GPS Unavailable (Using Default)`;
    }
}

async function handleEmergencySOS(targetHospId = null) {
    const btn = document.getElementById('sosMainBtn');
    btn.disabled = true;

    openSosModal();
    updateSosModalStatus('DISPATCHING', 'Sending Emergency Packet to Hospital & Preparing Mobile SMS...');

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

            const smsLaunchBtn = document.getElementById('btnSendMobileSms');
            smsLaunchBtn.setAttribute('href', data.smsUri);

            document.getElementById('btnOpenMaps').setAttribute('href', data.mapUrl);

            updateSosModalStatus('PENDING', `Hospital Notified (${data.assignedHospital}). Waiting for Ambulance Dispatch confirmation...`);

            startSosStatusPolling(data.alertId);
        } else {
            updateSosModalStatus('ERROR', 'Failed to dispatch SOS alert to server.');
        }

    } catch (err) {
        console.error("SOS Dispatch Error:", err);
        const fallbackSms = `sms:108?body=${encodeURIComponent(`ACCIDENT EMERGENCY SOS! GPS: https://maps.google.com/?q=${state.userLat},${state.userLng}`)}`;
        document.getElementById('btnSendMobileSms').setAttribute('href', fallbackSms);
        updateSosModalStatus('PENDING', 'Emergency SMS link ready! Click SMS button below to send.');
    } finally {
        btn.disabled = false;
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

        document.getElementById('hospCountBadge').innerText = hospitals.length;

        if (hospitals.length === 0) {
            container.innerHTML = `<p class="text-muted py-3 text-center">No hospitals found.</p>`;
            return;
        }

        container.innerHTML = hospitals.map(h => `
            <div class="hospital-card-item">
                <div class="hosp-details">
                    <h4><i class="fa-solid fa-hospital text-danger"></i> ${h.name}</h4>
                    <p><i class="fa-solid fa-location-dot"></i> ${h.address}</p>
                    <p style="font-size:0.75rem; margin-top:3px;"><i class="fa-solid fa-phone"></i> Emergency: <strong>${h.phoneNumber}</strong> | Ambulances: <strong>${h.availableAmbulances}</strong></p>
                </div>
                <div class="hosp-meta">
                    <span class="dist-badge"><i class="fa-solid fa-route"></i> ${h.distanceFromUserKm != null ? h.distanceFromUserKm + ' km' : 'Nearby'}</span>
                    <button class="btn-sm btn-primary" onclick="handleEmergencySOS(${h.id})">
                        <i class="fa-solid fa-truck-medical"></i> Select SOS
                    </button>
                </div>
            </div>
        `).join('');

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
                <a href="sms:${c.phoneNumber}?body=${encodeURIComponent(`ACCIDENT EMERGENCY! I need help. My live GPS location: https://maps.google.com/?q=${state.userLat},${state.userLng}`)}" class="btn-sm btn-outline">
                    <i class="fa-solid fa-comment-sms"></i> SMS
                </a>
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
    if (event && event.target) {
        event.target.closest('.filter-chip').classList.add('active');
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
                    <small class="text-muted">${a.victimPhone}</small>
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
