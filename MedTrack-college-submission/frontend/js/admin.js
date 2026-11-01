function cell(row, value) {
    const td = document.createElement('td'); td.textContent = value ?? '—'; row.append(td); return td;
}

function emptyRow(body, message, columns = 6) {
    body.replaceChildren(); const row = document.createElement('tr'); const td = cell(row, message);
    td.colSpan = columns; td.style.cssText = 'text-align:center;color:var(--text-gray);padding:40px'; body.append(row);
}

async function loadAdminData() {
    const [stats, users, medications, notifications, reports] = await Promise.all([
        MedTrackAPI.request('/api/admin/overview'), MedTrackAPI.request('/api/admin/users'),
        MedTrackAPI.request('/api/admin/medications'), MedTrackAPI.request('/api/admin/notifications'),
        MedTrackAPI.request('/api/admin/prescriptions')
    ]);
    document.getElementById('stat-users').textContent = stats.users;
    document.getElementById('stat-meds').textContent = stats.medications;
    document.getElementById('stat-notifs').textContent = stats.notifications;
    document.getElementById('stat-reports').textContent = stats.prescriptions;

    const usersBody = document.getElementById('adminUsersBody'); usersBody.replaceChildren();
    for (const user of users.users) {
        const row = document.createElement('tr'); cell(row, user.id); cell(row, user.username); cell(row, user.email); cell(row, user.phone);
        const actions = cell(row, '');
        const toggle = document.createElement('button'); toggle.className = user.active ? 'btn btn-danger' : 'btn btn-save';
        toggle.textContent = user.active ? 'Disable' : 'Enable';
        toggle.addEventListener('click', async () => { toggle.disabled = true; await MedTrackAPI.request(`/api/admin/users/${user.id}`, { method: 'POST', body: { active: !user.active } }); await loadAdminData(); });
        const role = document.createElement('button'); role.className = 'btn btn-edit'; role.textContent = user.role === 'admin' ? 'Make patient' : 'Make admin';
        role.addEventListener('click', async () => { role.disabled = true; await MedTrackAPI.request(`/api/admin/users/${user.id}`, { method: 'POST', body: { role: user.role === 'admin' ? 'patient' : 'admin' } }); await loadAdminData(); });
        actions.append(toggle, role); usersBody.append(row);
    }
    if (!users.users.length) emptyRow(usersBody, 'No users.');

    const medsBody = document.getElementById('adminMedicationsBody'); medsBody.replaceChildren();
    for (const med of medications.medications) {
        const row = document.createElement('tr'); cell(row, med.patient); cell(row, med.medicine_name); cell(row, med.dosage); cell(row, med.frequency);
        const actions = cell(row, ''); const edit = document.createElement('button'); edit.className = 'btn btn-edit'; edit.textContent = 'Edit dosage with audit';
        edit.addEventListener('click', async () => {
            const dosage = window.prompt('New confirmed dosage:', med.dosage); if (dosage === null) return;
            const reason = window.prompt('Reason for this change:'); if (!reason) return;
            try { await MedTrackAPI.request(`/api/admin/medications/${med.id}`, { method: 'POST', body: { changes: { dosage }, reason } }); await loadAdminData(); }
            catch (error) { document.getElementById('adminStatus').textContent = error.message; }
        }); actions.append(edit); medsBody.append(row);
    }
    if (!medications.medications.length) emptyRow(medsBody, 'No confirmed medications.');

    const notifBody = document.getElementById('adminNotificationsBody'); notifBody.replaceChildren();
    for (const item of notifications.notifications) {
        const row = document.createElement('tr'); cell(row, item.patient); cell(row, item.medication); cell(row, new Date(item.scheduled_at).toLocaleDateString());
        cell(row, new Date(item.scheduled_at).toLocaleTimeString()); cell(row, item.delivery_status); cell(row, item.error_message || item.kind); notifBody.append(row);
    }
    if (!notifications.notifications.length) emptyRow(notifBody, 'No notification attempts.');

    const reportsBody = document.getElementById('adminReportsBody'); reportsBody.replaceChildren();
    for (const item of reports.prescriptions) {
        const row = document.createElement('tr'); cell(row, item.patient); cell(row, new Date(item.uploaded_at).toLocaleString());
        cell(row, item.medicine_name || item.status); cell(row, item.source === 'image' ? 'Private patient image' : 'Manual entry'); cell(row, item.status); reportsBody.append(row);
    }
    if (!reports.prescriptions.length) emptyRow(reportsBody, 'No prescription reports.', 5);

}

document.addEventListener('DOMContentLoaded', async () => {
    window.addEventListener('pageshow', event => { if (event.persisted) window.location.reload(); });
    const status = document.getElementById('adminStatus');
    try {
        const data = await MedTrackAPI.request('/api/admin');
        status.textContent = `Signed in as ${data.user.username}. ${data.message}`; await loadAdminData();
    } catch (error) {
        if (error.status === 401) return window.location.replace('login.html');
        if (error.status === 403 || error.status === 404) return window.location.replace('index.html');
        status.textContent = error.message;
    }
    document.querySelectorAll('[data-admin-page]').forEach(link => link.addEventListener('click', event => {
        event.preventDefault(); document.querySelectorAll('.page').forEach(page => page.classList.toggle('active', page.id === `${link.dataset.adminPage}-page`));
        document.querySelectorAll('[data-admin-page]').forEach(item => item.classList.toggle('active', item === link));
    }));
    document.getElementById('adminLogout').addEventListener('click', async event => {
        event.target.disabled = true; try { await MedTrackAPI.request('/api/auth/logout', { method: 'POST' }); window.location.replace('login.html'); }
        catch (error) { status.textContent = error.message; event.target.disabled = false; }
    });
});
