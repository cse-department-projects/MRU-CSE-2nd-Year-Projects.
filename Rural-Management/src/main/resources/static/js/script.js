document.addEventListener('DOMContentLoaded', () => {
  // Top nav mobile
  const menuBtn = document.querySelector('.menu-btn');
  const navMenu = document.querySelector('.nav-menu');
  if (menuBtn && navMenu) {
    menuBtn.addEventListener('click', () => navMenu.classList.toggle('open'));
  }

  // Sidebar mobile toggle
  const sidebar = document.getElementById('appSidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const overlay = document.getElementById('sidebarOverlay');
  const closeSidebar = () => {
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('show');
  };
  const openSidebar = () => {
    if (sidebar) sidebar.classList.add('open');
    if (overlay) overlay.classList.add('show');
  };
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
      if (sidebar && sidebar.classList.contains('open')) closeSidebar();
      else openSidebar();
    });
  }
  if (overlay) overlay.addEventListener('click', closeSidebar);

  // Demo forms - in-page notifications instead of popups/alerts
  document.querySelectorAll('form[data-demo]').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const msg = form.dataset.success || 'Submitted successfully!';
      let alertBox = form.querySelector('.form-inline-alert');
      if (!alertBox) {
        alertBox = document.createElement('div');
        alertBox.className = 'form-inline-alert badge badge-success';
        alertBox.style.display = 'block';
        alertBox.style.padding = '0.75rem 1rem';
        alertBox.style.marginTop = '1rem';
        alertBox.style.fontSize = '0.9rem';
        alertBox.style.borderRadius = '8px';
        form.appendChild(alertBox);
      }
      alertBox.innerHTML = `<i class="bi bi-check-circle-fill"></i> ${msg}`;
      alertBox.style.display = 'block';
      form.reset();
      setTimeout(() => { if (alertBox) alertBox.style.display = 'none'; }, 4000);
    });
  });

  // Login role tabs
  document.querySelectorAll('.role-tabs button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.role-tabs button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const role = document.getElementById('loginRole');
      if (role) role.value = btn.dataset.role || 'Admin';
    });
  });

  // Status filter
  const statusFilter = document.getElementById('statusFilter');
  if (statusFilter) {
    statusFilter.addEventListener('change', () => {
      const v = statusFilter.value;
      document.querySelectorAll('[data-status]').forEach(row => {
        row.style.display = (!v || row.dataset.status === v) ? '' : 'none';
      });
    });
  }

  // Search
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase();
      document.querySelectorAll('[data-search]').forEach(el => {
        el.style.display = el.dataset.search.toLowerCase().includes(q) ? '' : 'none';
      });
    });
  }

  // Category filter
  document.querySelectorAll('[data-cat-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-cat-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.catFilter;
      document.querySelectorAll('[data-category]').forEach(el => {
        el.style.display = (!cat || el.dataset.category === cat) ? '' : 'none';
      });
    });
  });
});

/* Dashboard charts */
function initCharts() {
  if (typeof Chart === 'undefined') return;
  const c1 = document.getElementById('chartComplaints');
  if (c1) {
    new Chart(c1, {
      type: 'doughnut',
      data: {
        labels: ['Resolved', 'In Progress', 'Pending'],
        datasets: [{ data: [48, 15, 9], backgroundColor: ['#1B5E20', '#66BB6A', '#F9A825'], borderWidth: 0 }]
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });
  }
  const c2 = document.getElementById('chartCrops');
  if (c2) {
    new Chart(c2, {
      type: 'bar',
      data: {
        labels: ['Wheat', 'Rice', 'Cotton', 'Sugarcane', 'Onion', 'Soybean'],
        datasets: [{ label: 'Farmers', data: [125, 98, 72, 88, 54, 41], backgroundColor: '#66BB6A', borderRadius: 6 }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, grid: { color: '#eef2ef' } }, x: { grid: { display: false } } }
      }
    });
  }
}
setTimeout(initCharts, 150);
