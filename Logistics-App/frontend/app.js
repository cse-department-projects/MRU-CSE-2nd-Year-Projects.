// Base URL of the Spring Boot backend. Change this if you deploy the API elsewhere.
const API_BASE = ["localhost", "127.0.0.1"].includes(location.hostname)
  ? "http://localhost:8080/api"
  : "https://logitrack-app.onrender.com/api";;

function checkLogin() {
  const token = localStorage.getItem("token");
  if (token) {
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("mainApp").style.display = "flex";
    const username = localStorage.getItem("username");
    const role = localStorage.getItem("role");
    document.getElementById("userInfo").textContent = username + " (" + role + ")";
  } else {
    document.getElementById("loginScreen").style.display = "flex";
    document.getElementById("mainApp").style.display = "none";
  }
}

async function doLogin() {
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  const errorEl = document.getElementById("loginError");

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    if (!res.ok) throw new Error("Invalid login");

    const data = await res.json();
    localStorage.setItem("token", data.token);
    localStorage.setItem("username", data.username);
    localStorage.setItem("role", data.role);

    errorEl.style.display = "none";
    checkLogin();
    location.reload();
  } catch (err) {
    errorEl.style.display = "block";
  }
}
async function doRegister() {
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  const errorEl = document.getElementById("loginError");

  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, role: "ADMIN" })
    });

    const data = await res.json();

    if (!res.ok) {
      errorEl.textContent = data.message || "Registration failed";
      errorEl.style.display = "block";
      return;
    }

    errorEl.style.color = "green";
    errorEl.textContent = "Registered! You can now log in.";
    errorEl.style.display = "block";
  } catch (err) {
    errorEl.textContent = "Error connecting to server";
    errorEl.style.display = "block";
  }
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  localStorage.removeItem("role");
  location.reload();
}

checkLogin();

function showToast(message, type = "success") {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast ${type === "error" ? "error" : ""}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
function toggleDarkMode() {
  document.body.classList.toggle("dark");
  localStorage.setItem("darkMode", document.body.classList.contains("dark") ? "on" : "off");
}

// Restore dark mode preference on page load
if (localStorage.getItem("darkMode") === "on") {
  document.body.classList.add("dark");
}

let vehiclesCache = [];
let driversCache = [];

// ---------- Navigation ----------
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("view-" + btn.dataset.view).classList.add("active");
    if (btn.dataset.view === "dashboard") loadDashboard();
    if (btn.dataset.view === "shipments") loadShipments();
    if (btn.dataset.view === "vehicles") loadVehicles();
    if (btn.dataset.view === "drivers") loadDrivers();
    if (btn.dataset.view === "map") loadMap();
    if (btn.dataset.view === "reports") loadReports();
    if (btn.dataset.view === "feedback") loadFeedback();
  });
});

// ---------- API helper ----------
async function api(path, options = {}) {
  const defaultHeaders = {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + (localStorage.getItem("token") || "")
  };

  const mergedOptions = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {})
    }
  };

  const res = await fetch(`${API_BASE}${path}`, mergedOptions);

  if (!res.ok && res.status !== 204) throw new Error(`API error ${res.status}`);
  if (res.status === 204) return null;
  return res.json();
}

async function checkApiStatus() {
  const el = document.getElementById("apiStatus");
  if (!el) return;

  try {
    await api("/vehicles");
    el.textContent = "● API connected";
    el.style.color = "#4caf7d";
  } catch (e) {
    el.textContent = "● API offline (start backend on :8080)";
    el.style.color = "#e37b5b";
  }
}

// ---------- Dashboard ----------
async function loadDashboard() {
  try {
    const stats = await api("/shipments/stats/summary");
    document.getElementById("statGrid").innerHTML = `
      <div class="stat-card"><div class="num">${stats.totalShipments}</div><div class="label">Total Shipments</div></div>
      <div class="stat-card"><div class="num">${stats.pending}</div><div class="label">Pending</div></div>
      <div class="stat-card"><div class="num">${stats.inTransit}</div><div class="label">In Transit</div></div>
      <div class="stat-card"><div class="num">${stats.delivered}</div><div class="label">Delivered</div></div>
      <div class="stat-card"><div class="num">${stats.totalVehicles}</div><div class="label">Vehicles</div></div>
      <div class="stat-card"><div class="num">${stats.totalDrivers}</div><div class="label">Drivers</div></div>
    `;
    const shipments = await api("/shipments");
    renderStatusChart(shipments);
    const tbody = document.querySelector("#recentShipmentsTable tbody");
    tbody.innerHTML = shipments.slice(0, 5).map(s => `
      <tr>
        <td class="mono">${s.trackingId}</td>
        <td>${s.origin} → ${s.destination}</td>
        <td>${s.customerName}</td>
        <td><span class="pill pill-${s.status}">${s.status.replace('_',' ')}</span></td>
      </tr>`).join("") || `<tr><td colspan="4">No shipments yet.</td></tr>`;
  } catch (e) { console.error(e); }
}

// ---------- Shipments ----------
let currentShipments = [];

async function loadShipments() {
  try {
    const [shipments, vehicles, drivers] = await Promise.all([api("/shipments"), api("/vehicles"), api("/drivers")]);
    vehiclesCache = vehicles; driversCache = drivers; currentShipments = shipments;
    renderShipmentsTable(shipments);
  } catch (e) { console.error(e); }
}

function renderShipmentsTable(shipments) {
    const tbody = document.querySelector("#shipmentsTable tbody");
    tbody.innerHTML = shipments.map(s => `
      <tr>
        <td class="mono">${s.trackingId}</td>
        <td>${s.origin}</td>
        <td>${s.destination}</td>
        <td>${s.customerName}</td>
        <td>${s.weightKg}</td>
        <td>${s.vehicle ? s.vehicle.vehicleNumber : '—'}</td>
        <td>${s.driver ? s.driver.name : '—'}</td>
        <td><span class="pill pill-${s.status}">${s.status.replace('_',' ')}</span></td>
        <td>
          <button class="btn-sm" onclick="openShipmentForm(${s.id})">Edit</button>
          <button class="btn-sm danger" onclick="deleteShipment(${s.id})">Delete</button>
        </td>
      </tr>`).join("") || `<tr><td colspan="9">No shipments yet.</td></tr>`;
}
function filterShipments() {
  const q = document.getElementById("shipmentSearch").value.toLowerCase();
  const filtered = currentShipments.filter(s =>
    s.trackingId.toLowerCase().includes(q) ||
    s.customerName.toLowerCase().includes(q) ||
    s.origin.toLowerCase().includes(q) ||
    s.destination.toLowerCase().includes(q)
  );
  renderShipmentsTable(filtered);
}
  


async function deleteShipment(id) {
  if (!confirm("Delete this shipment?")) return;
  await api(`/shipments/${id}`, { method: "DELETE" });
  loadShipments();
  loadDashboard();
  showToast("Shipment deleted", "error");
}

function openShipmentForm(id) {
  const editing = id !== undefined;
  const existing = editing ? currentShipments.find(s => s.id === id) : null;

  const vehicleOptions = `<option value="">— none —</option>` +
    vehiclesCache.map(v => `<option value="${v.id}" ${existing?.vehicle?.id === v.id ? 'selected' : ''}>${v.vehicleNumber}</option>`).join("");
  const driverOptions = `<option value="">— none —</option>` +
    driversCache.map(d => `<option value="${d.id}" ${existing?.driver?.id === d.id ? 'selected' : ''}>${d.name}</option>`).join("");
  const statuses = ["PENDING","PICKED_UP","IN_TRANSIT","DELIVERED","CANCELLED"];

  document.getElementById("modalTitle").textContent = editing ? "Edit Shipment" : "New Shipment";
  document.getElementById("modalForm").innerHTML = `
    <label>Origin</label><input name="origin" required value="${existing?.origin ?? ''}">
    <label>Destination</label><input name="destination" required value="${existing?.destination ?? ''}">
    <label>Customer Name</label><input name="customerName" required value="${existing?.customerName ?? ''}">
    <label>Weight (kg)</label><input name="weightKg" type="number" step="0.1" required value="${existing?.weightKg ?? ''}">
    <label>Status</label>
    <select name="status">${statuses.map(s => `<option value="${s}" ${existing?.status === s ? 'selected' : ''}>${s.replace('_',' ')}</option>`).join("")}</select>
    <label>Assign Vehicle</label><select name="vehicleId">${vehicleOptions}</select>
    <label>Assign Driver</label><select name="driverId">${driverOptions}</select>
    <div class="form-actions">
      <button type="button" class="btn-cancel" onclick="closeModal()">Cancel</button>
      <button type="submit" class="btn-primary">${editing ? 'Save Changes' : 'Create Shipment'}</button>
    </div>
  `;
  document.getElementById("modalForm").onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const body = {
      origin: fd.get("origin"),
      destination: fd.get("destination"),
      customerName: fd.get("customerName"),
      weightKg: parseFloat(fd.get("weightKg")),
      status: fd.get("status"),
      vehicleId: fd.get("vehicleId") ? parseInt(fd.get("vehicleId")) : null,
      driverId: fd.get("driverId") ? parseInt(fd.get("driverId")) : null
    };
    if (editing) await api(`/shipments/${id}`, { method: "PUT", body: JSON.stringify(body) });
    else await api("/shipments", { method: "POST", body: JSON.stringify(body) });
    closeModal();
    loadShipments();
    loadDashboard();
    showToast(editing ? "Shipment updated successfully" : "Shipment created successfully");
  };
  openModal();
}

// ---------- Vehicles ----------
async function loadVehicles() {
  const vehicles = await api("/vehicles");
  vehiclesCache = vehicles;
  const tbody = document.querySelector("#vehiclesTable tbody");
  tbody.innerHTML = vehicles.map(v => `
    <tr>
      <td class="mono">${v.vehicleNumber}</td>
      <td>${v.type}</td>
      <td>${v.capacityKg}</td>
      <td><span class="pill pill-${v.status}">${v.status.replace('_',' ')}</span></td>
      <td>
        <button class="btn-sm" onclick="openVehicleForm(${v.id})">Edit</button>
        <button class="btn-sm danger" onclick="deleteVehicle(${v.id})">Delete</button>
      </td>
    </tr>`).join("") || `<tr><td colspan="5">No vehicles yet.</td></tr>`;
}

async function deleteVehicle(id) {
  if (!confirm("Delete this vehicle?")) return;
  await api(`/vehicles/${id}`, { method: "DELETE" });
  loadVehicles();
  showToast("Shipment deleted", "error");
}

function openVehicleForm(id) {
  const editing = id !== undefined;
  const existing = editing ? vehiclesCache.find(v => v.id === id) : null;
  const types = ["TRUCK","VAN","BIKE","CONTAINER"];
  const statuses = ["AVAILABLE","IN_USE","MAINTENANCE"];

  document.getElementById("modalTitle").textContent = editing ? "Edit Vehicle" : "Add Vehicle";
  document.getElementById("modalForm").innerHTML = `
    <label>Vehicle Number</label><input name="vehicleNumber" required value="${existing?.vehicleNumber ?? ''}">
    <label>Type</label>
    <select name="type">${types.map(t => `<option value="${t}" ${existing?.type === t ? 'selected' : ''}>${t}</option>`).join("")}</select>
    <label>Capacity (kg)</label><input name="capacityKg" type="number" step="1" required value="${existing?.capacityKg ?? ''}">
    <label>Status</label>
    <select name="status">${statuses.map(s => `<option value="${s}" ${existing?.status === s ? 'selected' : ''}>${s.replace('_',' ')}</option>`).join("")}</select>
    <div class="form-actions">
      <button type="button" class="btn-cancel" onclick="closeModal()">Cancel</button>
      <button type="submit" class="btn-primary">${editing ? 'Save Changes' : 'Add Vehicle'}</button>
    </div>
  `;
  document.getElementById("modalForm").onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const body = {
      vehicleNumber: fd.get("vehicleNumber"),
      type: fd.get("type"),
      capacityKg: parseFloat(fd.get("capacityKg")),
      status: fd.get("status")
    };
    if (editing) await api(`/vehicles/${id}`, { method: "PUT", body: JSON.stringify(body) });
    else await api("/vehicles", { method: "POST", body: JSON.stringify(body) });
    closeModal();
    loadVehicles();
    showToast(editing ? "Vehicle updated successfully" : "Vehicle added successfully");
  };
  openModal();
}

// ---------- Drivers ----------
async function loadDrivers() {
  const drivers = await api("/drivers");
  driversCache = drivers;
  const tbody = document.querySelector("#driversTable tbody");
  tbody.innerHTML = drivers.map(d => `
    <tr>
      <td>${d.name}</td>
      <td class="mono">${d.licenseNumber}</td>
      <td>${d.phone ?? '—'}</td>
      <td><span class="pill pill-${d.status}">${d.status.replace('_',' ')}</span></td>
      <td>
        <button class="btn-sm" onclick="openDriverForm(${d.id})">Edit</button>
        <button class="btn-sm danger" onclick="deleteDriver(${d.id})">Delete</button>
      </td>
    </tr>`).join("") || `<tr><td colspan="5">No drivers yet.</td></tr>`;
}

async function deleteDriver(id) {
  if (!confirm("Delete this driver?")) return;
  await api(`/drivers/${id}`, { method: "DELETE" });
  loadDrivers();
  showToast("Driver deleted", "error");
}

function openDriverForm(id) {
  const editing = id !== undefined;
  const existing = editing ? driversCache.find(d => d.id === id) : null;
  const statuses = ["AVAILABLE","ON_TRIP","OFF_DUTY"];

  document.getElementById("modalTitle").textContent = editing ? "Edit Driver" : "Add Driver";
  document.getElementById("modalForm").innerHTML = `
    <label>Name</label><input name="name" required value="${existing?.name ?? ''}">
    <label>License Number</label><input name="licenseNumber" required value="${existing?.licenseNumber ?? ''}">
    <label>Phone</label><input name="phone" value="${existing?.phone ?? ''}">
    <label>Status</label>
    <select name="status">${statuses.map(s => `<option value="${s}" ${existing?.status === s ? 'selected' : ''}>${s.replace('_',' ')}</option>`).join("")}</select>
    <div class="form-actions">
      <button type="button" class="btn-cancel" onclick="closeModal()">Cancel</button>
      <button type="submit" class="btn-primary">${editing ? 'Save Changes' : 'Add Driver'}</button>
    </div>
  `;
  document.getElementById("modalForm").onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const body = {
      name: fd.get("name"),
      licenseNumber: fd.get("licenseNumber"),
      phone: fd.get("phone"),
      status: fd.get("status")
    };
    if (editing) await api(`/drivers/${id}`, { method: "PUT", body: JSON.stringify(body) });
    else await api("/drivers", { method: "POST", body: JSON.stringify(body) });
    closeModal();
    loadDrivers();
    showToast(editing ? "Driver updated successfully" : "Driver added successfully");
  };
  openModal();
}

// ---------- Track ----------
async function trackShipment() {
  const id = document.getElementById("trackInput").value.trim();
  const resultEl = document.getElementById("trackResult");
  const qrEl = document.getElementById("qrCodeContainer");
  qrEl.innerHTML = "";
  if (!id) return;
  try {
    const s = await api(`/shipments/track/${encodeURIComponent(id)}`);
    resultEl.innerHTML = `
      <div class="track-card">
        <p><strong>Tracking ID:</strong> <span class="mono">${s.trackingId}</span></p>
        <p><strong>Route:</strong> ${s.origin} → ${s.destination}</p>
        <p><strong>Customer:</strong> ${s.customerName}</p>
        <p><strong>Status:</strong> <span class="pill pill-${s.status}">${s.status.replace('_',' ')}</span></p>
        <p><strong>Vehicle:</strong> ${s.vehicle ? s.vehicle.vehicleNumber : 'Not assigned'}</p>
        <p><strong>Driver:</strong> ${s.driver ? s.driver.name : 'Not assigned'}</p>
        <p><strong>Last Updated:</strong> ${new Date(s.updatedAt).toLocaleString()}</p>
      </div>`;
    new QRCode(qrEl, {
      text: s.trackingId,
      width: 120,
      height: 120
    });
  } catch (e) {
    resultEl.innerHTML = `<p class="not-found">No shipment found with that tracking ID.</p>`;
  }
}

// ---------- Modal helpers ----------
function openModal() { document.getElementById("modalOverlay").classList.add("active"); }
function closeModal() { document.getElementById("modalOverlay").classList.remove("active"); }
document.getElementById("modalOverlay").addEventListener("click", (e) => {
  if (e.target.id === "modalOverlay") closeModal();
});

// ---------- Map ----------
const cityCoords = {
  "Chennai": [13.0827, 80.2707],
  "Bengaluru": [12.9716, 77.5946],
  "Bangalore": [12.9716, 77.5946],
  "Coimbatore": [11.0168, 76.9558],
  "Madurai": [9.9252, 78.1198],
  "Hyderabad": [17.3850, 78.4867],
  "Mumbai": [19.0760, 72.8777],
  "Delhi": [28.7041, 77.1025],
  "New Delhi": [28.6139, 77.2090],
  "Kolkata": [22.5726, 88.3639],
  "Pune": [18.5204, 73.8567],
  "Ahmedabad": [23.0225, 72.5714],
  "Jaipur": [26.9124, 75.7873],
  "Lucknow": [26.8467, 80.9462],
  "Kanpur": [26.4499, 80.3319],
  "Nagpur": [21.1458, 79.0882],
  "Indore": [22.7196, 75.8577],
  "Bhopal": [23.2599, 77.4126],
  "Visakhapatnam": [17.6868, 83.2185],
  "Vijayawada": [16.5062, 80.6480],
  "Patna": [25.5941, 85.1376],
  "Surat": [21.1702, 72.8311],
  "Kochi": [9.9312, 76.2673],
  "Thiruvananthapuram": [8.5241, 76.9366],
  "Chandigarh": [30.7333, 76.7794],
  "Guwahati": [26.1445, 91.7362],
  "Bhubaneswar": [20.2961, 85.8245],
  "Ranchi": [23.3441, 85.3096],
  "Raipur": [21.2514, 81.6296],
  "Amritsar": [31.6340, 74.8723],
  "Varanasi": [25.3176, 82.9739],
  "Mysuru": [12.2958, 76.6394],
  "Nashik": [19.9975, 73.7898],
  "Vadodara": [22.3072, 73.1812]
};
// Calculates straight-line distance in km between two [lat, lng] points
function calcDistanceKm(coord1, coord2) {
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) ** 2 +
            Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
            Math.sin(dLon/2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c);
}
const geocodeCache = {};

async function getCoordinates(placeName) {
  if (cityCoords[placeName]) return cityCoords[placeName];
  if (geocodeCache[placeName]) return geocodeCache[placeName];

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(placeName)}&format=json&limit=1`;
  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'LogisticsApp' } });
    const data = await response.json();
    if (data.length === 0) return null;
    const coords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    geocodeCache[placeName] = coords;
    return coords;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

let mapInstance = null;

async function loadMap() {
  const shipments = await api("/shipments");


  if (!mapInstance) {
    mapInstance = L.map('mapContainer').setView([21.0, 78.5], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstance);
  } else {
    mapInstance.eachLayer(layer => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        mapInstance.removeLayer(layer);
      }
  });
  }

  
    for (const s of shipments) {
    const o = await getCoordinates(s.origin);
    const d = await getCoordinates(s.destination);
    const distance = (o && d) ? calcDistanceKm(o, d) : null;
    if (o) L.marker(o).addTo(mapInstance).bindPopup(`<b>${s.trackingId}</b><br>Origin: ${s.origin}<br>Status: ${s.status}${distance ? `<br>Distance: ${distance} km` : ''}`);
    if (d) L.marker(d).addTo(mapInstance).bindPopup(`<b>${s.trackingId}</b><br>Destination: ${s.destination}<br>Status: ${s.status}${distance ? `<br>Distance: ${distance} km` : ''}`);
    if (o && d) L.polyline([o, d], { color: '#e8963e', weight: 3 }).addTo(mapInstance).bindPopup(`${s.origin} → ${s.destination}: ${distance} km`);
}
}
// ---------- Reports ----------
let reportStatusChartInstance = null;
let reportVehicleChartInstance = null;

async function loadReports() {
  const shipments = await api("/shipments");
  const vehicles = await api("/vehicles");

  const statusCounts = { PENDING: 0, PICKED_UP: 0, IN_TRANSIT: 0, DELIVERED: 0, CANCELLED: 0 };
  shipments.forEach(s => statusCounts[s.status] = (statusCounts[s.status] || 0) + 1);

  const ctx1 = document.getElementById('reportStatusChart');
  if (reportStatusChartInstance) reportStatusChartInstance.destroy();
  reportStatusChartInstance = new Chart(ctx1, {
    type: 'bar',
    data: {
      labels: Object.keys(statusCounts),
      datasets: [{ label: 'Shipments', data: Object.values(statusCounts), backgroundColor: '#e8963e' }]
    },
    options: { plugins: { legend: { display: false } } }
  });

  const typeCounts = {};
  vehicles.forEach(v => typeCounts[v.type] = (typeCounts[v.type] || 0) + 1);

  const ctx2 = document.getElementById('reportVehicleChart');
  if (reportVehicleChartInstance) reportVehicleChartInstance.destroy();
  reportVehicleChartInstance = new Chart(ctx2, {
    type: 'pie',
    data: {
      labels: Object.keys(typeCounts),
      datasets: [{ data: Object.values(typeCounts), backgroundColor: ['#3d5a73', '#e8963e', '#3f8f5f', '#a63333'] }]
    },
    options: { plugins: { legend: { position: 'bottom' } } }
  });
}
let statusChartInstance = null;
function renderStatusChart(shipments) {
  const counts = { PENDING: 0, PICKED_UP: 0, IN_TRANSIT: 0, DELIVERED: 0, CANCELLED: 0 };
  shipments.forEach(s => counts[s.status] = (counts[s.status] || 0) + 1);

  const ctx = document.getElementById('statusChart');
  if (statusChartInstance) statusChartInstance.destroy();
  statusChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(counts),
      datasets: [{
        data: Object.values(counts),
        backgroundColor: ['#e8963e', '#3d5a73', '#c9622a', '#3f8f5f', '#a63333']
      }]
    },
    options: { plugins: { legend: { position: 'bottom' } } }
  });
}
// ---------- Feedback ----------
async function loadFeedback() {
  const feedbackList = await api("/feedback");
  const tbody = document.querySelector("#feedbackTable tbody");
  tbody.innerHTML = "";
  feedbackList.forEach(fb => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${fb.customerName}</td>
      <td>${fb.email}</td>
      <td>${fb.rating}</td>
      <td>${fb.comments || ""}</td>
      <td>${new Date(fb.submittedAt).toLocaleString()}</td>
    `;
    tbody.appendChild(row);
  });
}

async function submitFeedback() {
  const name = document.getElementById("feedbackName").value.trim();
  const email = document.getElementById("feedbackEmail").value.trim();
  const rating = document.getElementById("feedbackRating").value;
  const comments = document.getElementById("feedbackComments").value.trim();

  if (!name || !email) {
    alert("Please enter your name and email.");
    return;
  }

  await api("/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customerName: name,
      email: email,
      rating: parseInt(rating),
      comments: comments
    })
  });

  document.getElementById("feedbackName").value = "";
  document.getElementById("feedbackEmail").value = "";
  document.getElementById("feedbackComments").value = "";

  loadFeedback();
}

// ---------- Init ----------
if (localStorage.getItem("token")) {
  checkApiStatus();
  loadDashboard();
}
