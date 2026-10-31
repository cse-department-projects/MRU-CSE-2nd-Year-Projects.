let alerts = [];
let fleet = []; let currentPage = "dashboard";
const COLORS = { teal:"#2FD9C4", amber:"#F0A84B", red:"#F0605E", blue:"#5B8DEF", green:"#7FD98C" };
function statusColor(v){
  if (v.fuel<20 || v.health<60 || v.behavior<65) return COLORS.red;
  if (v.fuel<35 || v.health<75 || v.kmToService<400) return COLORS.amber;
  return COLORS.teal;
}
function statusLabel(v){
  if (v.fuel<20) return "fuel critical";
  if (v.health<60) return "health critical";
  if (v.behavior<65) return "behavior flag";
  if (v.kmToService<400) return "service due soon";
  if (v.fuel<35) return "fuel low";
  return "nominal";
}

/* ===================== Navigation ===================== */
const NAV_ITEMS = [
  { key:"dashboard", label:"Fleet Overview", icon:"▦" },
  { key:"drivers", label:"Driver Assignment", icon:"👤" },
  { key:"routes", label:"Route Optimization", icon:"⇢" },
  { key:"maintenance", label:"Predictive Maintenance", icon:"🔧" },
  { key:"alerts", label:"Auto Alerts", icon:"🚨" },
  { key:"map", label:"Live Map", icon:"🗺" },
  { key:"agent", label:"AI Agent", icon:"🤖" },
  { key:"manage", label:"Manage Fleet", icon:"➕" },
  { key:"db", label:"Database", icon:"🗄" },
];

function renderNav(){
  const nav = document.getElementById("nav");
  nav.innerHTML = "";
  NAV_ITEMS.forEach(item=>{
    const btn = document.createElement("button");
    btn.className = "nav-item" + (currentPage===item.key ? " active":"");
    btn.innerHTML = `<span class="ic">${item.icon}</span>${item.label}` + (item.key==="alerts" && alerts.length ? ` <b style="color:#F0605E">(${alerts.length})</b>` : "");
    btn.onclick = ()=> showPage(item.key);
    nav.appendChild(btn);
  });
}

function showPage(key){
  currentPage = key;
  document.querySelectorAll("#main .page").forEach(p=>p.classList.remove("visible"));
  document.getElementById("page-"+key).classList.add("visible");
  renderNav();
  renderCurrentPage();
}

function renderCurrentPage(){
  if (currentPage==="dashboard") renderDashboard();
  if (currentPage==="drivers") renderDrivers();
  if (currentPage==="routes") renderRoutes();
  if (currentPage==="maintenance") renderMaintenance();
  if (currentPage==="alerts") renderAlerts();
  if (currentPage==="map") renderMap();
  if (currentPage==="manage") renderManage();
  if (currentPage==="db") renderDb();
}

/* ===================== Dashboard ===================== */
function renderDashboard(){
  const avgHealth = Math.round(fleet.reduce((s,v)=>s+v.health,0)/fleet.length);
  const avgFuel = Math.round(fleet.reduce((s,v)=>s+v.fuel,0)/fleet.length);
  const flagged = fleet.filter(v=>v.fuel<20 || v.health<60).length;

  document.getElementById("kpi-strip").innerHTML = `
    <div class="kpi-card"><div class="kpi-label">🚚 Vehicles</div><div class="kpi-value">${fleet.length}</div></div>
    <div class="kpi-card"><div class="kpi-label">❤ Avg Health</div><div class="kpi-value mono" style="color:${avgHealth<65?COLORS.red:'var(--text)'}">${avgHealth}%</div></div>
    <div class="kpi-card"><div class="kpi-label">⛽ Avg Fuel</div><div class="kpi-value mono" style="color:${avgFuel<30?COLORS.amber:'var(--text)'}">${avgFuel}%</div></div>
    <div class="kpi-card"><div class="kpi-label">⚠ Flagged</div><div class="kpi-value mono" style="color:${flagged>0?COLORS.red:COLORS.green}">${flagged}</div></div>
  `;

  const rows = fleet.map(v=>{
    const sc = statusColor(v);
    return `
      <div class="t-row clickable" style="grid-template-columns: 1fr 1fr 90px 90px 100px 20px;" onclick="openVehicleFromDashboard('${v.id}')">
        <div class="mono"><span class="dot" style="background:${sc}"></span>${v.id}</div>
        <div class="dim">${v.driver}</div>
        <div class="mono" style="color:${v.health<60?COLORS.red:'var(--text)'}">${v.health}%</div>
        <div class="mono" style="color:${v.fuel<20?COLORS.red:(v.fuel<35?COLORS.amber:'var(--text)')}">${v.fuel}%</div>
        <div class="mono" style="font-size:11px;color:${sc};text-transform:uppercase;">${statusLabel(v)}</div>
        <div class="dim">›</div>
      </div>`;
  }).join("");
  document.getElementById("dashboard-table").innerHTML = rows;
}
function openVehicleFromDashboard(id){ showPage("maintenance"); }

/* ===================== Driver Assignment ===================== */
function renderDrivers(){
  const rows = fleet.map(v=>{
    const behColor = v.behavior<65 ? COLORS.red : (v.behavior<80 ? COLORS.amber : COLORS.teal);
    return `
      <div class="t-row" style="grid-template-columns: 90px 1fr 1fr 100px 140px;">
        <div class="mono">${v.id}</div>
        <div>${v.driver}</div>
        <div class="dim" style="font-size:12px;">${v.from} → ${v.to}</div>
        <div class="mono" style="color:${behColor}">${v.behavior}%</div>
        <div>
          ${v.behavior<65
            ? `<button class="chip active" style="margin:0;" onclick="reassignDriver('${v.id}')">Reassign</button>`
            : `<span class="dim mono" style="font-size:11px;">OK</span>`}
        </div>
      </div>`;
  }).join("");
  document.getElementById("drivers-table").innerHTML = rows;
}
/* ===================== Route Optimization ===================== */
function renderRoutes(){
  const html = fleet.map(v=>{
    return `
      <div class="route-map">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
          <div class="mono" style="font-weight:600;">${v.id} <span class="dim" style="font-weight:400;">— ${v.driver}</span></div>
          <div class="mono dim" style="font-size:11px;">${v.progress}% complete</div>
        </div>
        <div class="route-line">
          <div class="route-point" style="background:${COLORS.blue}"></div>
          <div class="route-track"><div class="route-progress" style="width:${v.progress}%"></div></div>
          <div class="route-point" style="background:${COLORS.teal}"></div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-dim);">
          <span>${v.from}</span><span>${v.to}</span>
        </div>
      </div>`;
  }).join("");
  document.getElementById("route-list").innerHTML = html;
}
/* ===================== Predictive Maintenance ===================== */
function renderMaintenance(){
  const sorted = [...fleet].sort((a,b)=>a.kmToService-b.kmToService);
  const rows = sorted.map(v=>{
    let urgLabel="Scheduled", urgColor="var(--text-dim)";
    if (v.kmToService<400){ urgLabel="Due now"; urgColor=COLORS.red; }
    else if (v.kmToService<1500){ urgLabel="Due soon"; urgColor=COLORS.amber; }
    return `
      <div class="t-row" style="grid-template-columns: 90px 1fr 130px 130px 120px;">
        <div class="mono">${v.id}</div>
        <div class="dim">${v.driver}</div>
        <div class="mono" style="color:${urgColor}">${v.kmToService} km</div>
        <div class="mono" style="color:${v.health<60?COLORS.red:'var(--text)'}">${v.health}%</div>
        <div class="mono" style="font-size:11px;color:${urgColor};text-transform:uppercase;">${urgLabel}</div>
      </div>`;
  }).join("");
  document.getElementById("maintenance-table").innerHTML = rows;
}

/* ===================== Talk to the Java backend ===================== */
async function api(path, opts){ const r = await fetch(path, opts); if(!r.ok) throw new Error(r.status); return r.json(); }
async function refresh(){ try { fleet = await api("/api/vehicles"); alerts = await api("/api/alerts"); const st = await api("/api/status"); window.dbSt = st; document.getElementById("db-badge").textContent = st.db ? "🟢 MySQL connected" : "🟡 In-memory mode"; renderNav(); renderCurrentPage(); } catch(e){} }
async function reassignDriver(id){ await api("/api/reassign?id="+encodeURIComponent(id), {method:"POST"}); refresh(); }
document.getElementById("optimize-btn").addEventListener("click", async ()=>{ await api("/api/optimize", {method:"POST"}); refresh(); });

document.getElementById("login-form").addEventListener("submit", async (e)=>{
  e.preventDefault();
  const u = document.getElementById("login-user").value.trim();
  const p = document.getElementById("login-pass").value.trim();
  const err = document.getElementById("login-error");
  try {
    const r = await fetch("/api/login", {method:"POST", body:new URLSearchParams({user:u, pass:p})});
    if(!r.ok){ err.style.display="block"; err.textContent="Wrong username or password."; return; }
  } catch(ex){ err.style.display="block"; err.textContent="Cannot reach server. Is the Java program running?"; return; }
  err.style.display="none";
  document.getElementById("login-page").classList.remove("visible");
  document.getElementById("app").style.display = "flex";
  document.getElementById("who-name").textContent = u;
  await refresh(); renderNav(); showPage("dashboard");
});
document.getElementById("logout-btn").addEventListener("click", ()=>{
  document.getElementById("app").style.display = "none";
  document.getElementById("login-page").classList.add("visible");
  document.getElementById("login-user").value = ""; document.getElementById("login-pass").value = "";
});
setInterval(()=>{ if(document.getElementById("app").style.display !== "none") refresh(); }, 2000);


/* ===================== Auto Alerts ===================== */
function renderAlerts(){
  const el = document.getElementById("alerts-list");
  if(!alerts.length){ el.innerHTML = `<div class="alert-card" style="border-color:var(--teal);">✅ All clear — no active alerts.</div>`; return; }
  el.innerHTML = alerts.map(a=>`
    <div class="alert-card" style="border-left:4px solid ${a.severity==="critical"?COLORS.red:COLORS.amber}">
      <div><div class="mono" style="font-weight:600">${a.vehicle} · ${a.type.toUpperCase()}</div>
      <div>${a.message}</div>
      <div class="dim" style="font-size:12px;margin-top:4px">🤖 Agent suggests: ${a.suggestion}</div></div>
      <button class="chip active" style="margin:0" onclick="fixAlert('${a.vehicle}','${a.type}')">Fix with agent</button>
    </div>`).join("");
}
async function fixAlert(id,type){ await api(`/api/fix?id=${id}&type=${type}`, {method:"POST"}); refresh(); }
async function fixAll(){ await api("/api/fixall", {method:"POST"}); refresh(); }

/* ===================== Live Map (SVG, works offline) ===================== */
const MAP = {w:560, h:560, lat0:19.9, lat1:14.3, lon0:77.9, lon1:80.9};
function mxy(lat,lon){ return [(lon-MAP.lon0)/(MAP.lon1-MAP.lon0)*MAP.w, (lat-MAP.lat0)/(MAP.lat1-MAP.lat0)*MAP.h]; }
function vpos(v){ const t=v.progress/100; return mxy(v.fLat+(v.tLat-v.fLat)*t, v.fLon+(v.tLon-v.fLon)*t); }
function inHyd(lat,lon){ return Math.abs(lat-17.4)<0.6 && Math.abs(lon-78.5)<0.6; }
function renderMap(){
  if(!fleet.length) return;
  const sv = document.getElementById("mapsvg"), key = fleet.map(v=>v.id).join(",");
  if(!sv || sv.dataset.k !== key){
    let s = `<svg id="mapsvg" data-k="${key}" viewBox="0 0 ${MAP.w} ${MAP.h}" style="width:100%;max-height:68vh">`;
    const seen = {};
    fleet.forEach(v=>{
      const a=mxy(v.fLat,v.fLon), b=mxy(v.tLat,v.tLon);
      s += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#2c4157" stroke-width="2" stroke-dasharray="5 4"/>`;
      [[v.from,v.fLat,v.fLon,a],[v.to,v.tLat,v.tLon,b]].forEach(c=>{
        if(inHyd(c[1],c[2]) || seen[c[0]]) return;
        seen[c[0]] = 1;
        s += `<circle cx="${c[3][0]}" cy="${c[3][1]}" r="4" fill="#56677A"/><text x="${c[3][0]+8}" y="${c[3][1]+4}" fill="#8B9AA8" font-size="11">${c[0]}</text>`;
      });
    });
    const h = mxy(17.4,78.5);
    s += `<circle cx="${h[0]}" cy="${h[1]}" r="5" fill="#56677A"/><text x="${h[0]-70}" y="${h[1]+32}" fill="#8B9AA8" font-size="11">Hyderabad hub</text>`;
    fleet.forEach(v=>{ s += `<g id="mk-${v.id}" style="transition:transform 2s linear"><circle r="7" fill="#2FD9C4"/><text x="10" y="4" font-size="10" fill="#E7ECEE" font-family="monospace">${v.id}</text></g>`; });
    document.getElementById("map-box").innerHTML = s + "</svg>";
  }
  fleet.forEach(v=>{
    const g = document.getElementById("mk-"+v.id); if(!g) return;
    const p = vpos(v);
    g.style.transform = `translate(${p[0]}px,${p[1]}px)`;
    g.firstChild.setAttribute("fill", statusColor(v));
  });
}

/* ===================== AI Agent chat ===================== */
function addMsg(who,text){
  const l = document.getElementById("chat-log"), d = document.createElement("div");
  d.className = "msg "+who; d.textContent = text; l.appendChild(d); l.scrollTop = l.scrollHeight;
}
async function sendChat(text){
  const inp = document.getElementById("chat-input");
  text = (text || inp.value).trim(); if(!text) return;
  inp.value = ""; addMsg("me", text);
  try { const r = await api("/api/agent", {method:"POST", body:new URLSearchParams({msg:text})}); addMsg("bot", r.reply); }
  catch(e){ addMsg("bot", "Cannot reach the server."); }
  refresh();
}
document.getElementById("chat-input").addEventListener("keydown", e=>{ if(e.key==="Enter") sendChat(); });
document.getElementById("chat-send").addEventListener("click", ()=>sendChat());
addMsg("bot", "Hi! I'm the FleetPilot agent. I watch the fleet, spot problems and fix them for you.\nTry: \"show alerts\", \"fix all alerts\", \"refuel FL-102\" or \"where is FL-103\".");


/* ===================== Manage Fleet + Database ===================== */
function renderManage(){
  document.getElementById("manage-table").innerHTML = fleet.map(v=>`
    <div class="t-row" style="grid-template-columns: 90px 1fr 1.5fr 90px;"><div class="mono">${v.id}</div><div>${v.driver}</div>
    <div class="dim" style="font-size:12px">${v.from} → ${v.to}</div>
    <div><button class="chip" style="margin:0" onclick="delVehicle('${v.id}')">Delete</button></div></div>`).join("");
}
async function addVehicle(){
  const q = new URLSearchParams({driver:document.getElementById("nv-driver").value, from:document.getElementById("nv-from").value, to:document.getElementById("nv-to").value});
  const r = await api("/api/addvehicle?"+q, {method:"POST"});
  document.getElementById("nv-msg").textContent = r.msg;
  document.getElementById("nv-driver").value = ""; refresh();
}
async function delVehicle(id){ if(!confirm("Remove "+id+"?")) return; await api("/api/delvehicle?id="+id, {method:"POST"}); refresh(); }
async function resetDemo(){ if(!confirm("Reset all vehicles to demo data?")) return; await api("/api/reset", {method:"POST"}); refresh(); }
async function renderDb(){
  try {
    const st = window.dbSt || {db:false};
    document.getElementById("db-info").innerHTML = st.db
      ? `<div class="alert-card" style="border-color:var(--teal)">🟢 Connected to MySQL. Tables: vehicle, fuel_log, maintenance_log, alert_log</div>`
      : `<div class="alert-card" style="border-color:var(--amber)">🟡 MySQL not connected, running in memory mode.<span class="dim" style="font-size:12px">${st.error||""}</span></div>`;
    const logs = await api("/api/logs");
    document.getElementById("db-logs").innerHTML = logs.length ? logs.map(l=>`
      <div class="t-row" style="grid-template-columns: 150px 80px 1fr 150px;font-size:12px"><div class="mono">${l.table}</div><div class="mono">${l.vehicle}</div><div>${l.message}</div><div class="dim mono">${l.time}</div></div>`).join("")
      : `<div class="t-row dim">No records yet. Use the AI Agent or Auto Alerts to fix something.</div>`;
  } catch(e){}
}
fetch("/api/cities").then(r=>r.json()).then(cs=>{
  ["nv-from","nv-to"].forEach((id,i)=>{ const el=document.getElementById(id); el.innerHTML = cs.map(c=>`<option>${c}</option>`).join(""); if(i) el.selectedIndex = 1; });
});
