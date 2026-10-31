document.addEventListener('DOMContentLoaded', () => {

    // --- MOBILE MENU HAMBURGER DRAWER ---
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    function toggleMobileMenu() {
        const isOpen = mobileDrawer.classList.contains('open');
        hamburgerBtn.classList.toggle('active', !isOpen);
        mobileDrawer.classList.toggle('open', !isOpen);
        hamburgerBtn.setAttribute('aria-expanded', !isOpen);
        // Lock body scroll when menu open
        document.body.style.overflow = !isOpen ? 'hidden' : '';
    }

    if (hamburgerBtn && mobileDrawer) {
        hamburgerBtn.addEventListener('click', toggleMobileMenu);
    }

    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileDrawer.classList.contains('open')) {
                toggleMobileMenu();
            }
        });
    });

    // --- STICKY NAV BACKGROUND TOGGLE ---
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // --- ACTIVE NAVIGATION STATE SCROLL-SPY ---
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop - 120) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    });

    // --- SCROLL REVEAL INTERSECTION OBSERVER ---
    const scrollElements = document.querySelectorAll('.scroll-trigger');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                // Trigger stats count up if it's the stats section
                if (entry.target.id === 'stats') {
                    triggerCounters();
                }
                observer.unobserve(entry.target); // Reveal animation occurs once
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    });

    scrollElements.forEach(el => revealObserver.observe(el));

    // --- STATISTICAL COUNTER ENGINE ---
    let countersActive = false;
    function triggerCounters() {
        if (countersActive) return;
        countersActive = true;
        
        const counterElements = document.querySelectorAll('.stat-number');
        counterElements.forEach(counter => {
            const targetVal = parseFloat(counter.getAttribute('data-target'));
            const decimals = parseInt(counter.getAttribute('data-decimals')) || 0;
            const duration = 2200; // Total count up milliseconds
            const startTime = performance.now();

            function updateCount(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                // Ease out cubic logic
                const easeProgress = 1 - Math.pow(1 - progress, 3);
                const currentVal = easeProgress * targetVal;

                if (decimals > 0) {
                    counter.textContent = currentVal.toFixed(decimals);
                } else {
                    counter.textContent = Math.floor(currentVal).toLocaleString();
                }

                if (progress < 1) {
                    requestAnimationFrame(updateCount);
                } else {
                    if (decimals > 0) {
                        counter.textContent = targetVal.toFixed(decimals);
                    } else {
                        counter.textContent = targetVal.toLocaleString();
                    }
                }
            }
            requestAnimationFrame(updateCount);
        });
    }

    // --- ENVIRONMENTAL ISSUES POPUP DATA SYSTEM ---
    const issuesData = {
        1: {
            title: "Climate Change Details",
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="modal-svg-inner"><path d="M12 10V3M12 3L9 6M12 3L15 6M18 10A6 6 0 1 1 6 10C6 7.6 9 3 12 3C15 3 18 7.6 18 10Z"/><circle cx="12" cy="18" r="3"/></svg>`,
            stats: "Global temperature has surged 1.15°C since pre-industrial times.",
            details: "Rising greenhouse gases (CO2, Methane, etc.) trap solar heat, driving severe weather events, changing agricultural zones, and rising sea levels. Melting glaciers threaten fresh water storage. Limiting warming to 1.5°C requires immediate grid electrification and decarbonization.",
            actions: "Switch to clean electricity providers, practice thermal insulation, and vote for regional net-zero pathways."
        },
        2: {
            title: "Air Pollution Details",
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="modal-svg-inner"><path d="M9.59 4.59A2 2 0 1 1 11 8H2M10.59 11.59A2 2 0 1 0 12 15H2M15 19H2"/></svg>`,
            stats: "World Health Organization states 99% of global population breathes sub-standard air.",
            details: "Suspended atmospheric fine particles (PM2.5) sourced from internal combustion engines, factories, and burning fossil fuels bypass lung sieves. This induces chronic pulmonary strains, lowers cardiac resilience, and contributes directly to ozone depletion.",
            actions: "Opt for public transport, support local congestion pricing, and utilize HEPA standards at home."
        },
        3: {
            title: "Water Pollution Details",
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="modal-svg-inner"><path d="M12 2A9.9 9.9 0 0 0 3 12c0 2.22.73 4.25 1.94 5.92L12 22l7.06-4.08C20.27 16.25 21 14.22 21 12A9.9 9.9 0 0 0 12 2Zm-4 12V8l8 4-8 2Z"/></svg>`,
            stats: "Over 80% of waste water returns unfiltered back into the environment.",
            details: "Pesticide runoffs, chemical wastes, and untreated domestic sewers flow into oceans and aquifers. This triggers immense algal blooms that starve marine life of dissolved oxygen, rendering regions lifeless (hypoxia) and poisoning water reserves.",
            actions: "Never dump oils or paints down drains, purchase organic produce to cut pesticides, and adopt eco-safe soaps."
        },
        4: {
            title: "Deforestation Details",
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="modal-svg-inner"><path d="M12 2L3 9h9v13h2V9h9L12 2Z"/></svg>`,
            stats: "An area of forest matching the size of Switzerland is lost annually.",
            details: "Industrial timber harvesting and clearing forest space for monoculture crop farms (like soy, palm oil, or cattle pasture) removes planetary carbon filters. Soil root retention collapses, leading to landslides, desertification, and microclimate changes.",
            actions: "Support FSC-certified wood goods, cut down animal meat diets, and support land trust reforestation projects."
        },
        5: {
            title: "Plastic Pollution Details",
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="modal-svg-inner"><path d="M12 2L6 5v6a6 6 0 0 0 12 0V5l-6-3Z"/><path d="M8 12a4 4 0 0 0 8 0"/></svg>`,
            stats: "Oceans are projected to contain more plastic than fish by mass by 2050.",
            details: "Synthetic polymers do not biodegrade. They fragment into micro-scale particles under solar UV rays. These plastics absorb toxins, poison aquatic feeding filters, and climb bio-food webs directly into humans, threatening global health systems.",
            actions: "Eliminate disposable cups, carry steel or bamboo straws, and purchase bulk groceries with refillable glass jars."
        },
        6: {
            title: "Loss of Biodiversity Details",
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="modal-svg-inner"><path d="M12 2a5 5 0 0 0-5 5v3a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5Z"/><path d="M4 14a8 8 0 0 0 16 0"/><path d="M12 14v8"/></svg>`,
            stats: "Current wildlife extinction rates are up to 1,000 times historical base levels.",
            details: "Farms expanding, chemical spreads, and rising heat split landscapes into pockets. Native species fail to migrate or find food, triggering rapid collapses in plant fertilization, fresh water soil filters, and natural pest-controls.",
            actions: "Plant native wild flowers, construct urban insect hotels, and vote for regional wilderness reservation spaces."
        }
    };

    const detailsModal = document.getElementById('details-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalBodyContent = document.getElementById('modal-body-content');
    const issueCards = document.querySelectorAll('.issue-card');

    function openModal(index) {
        const data = issuesData[index];
        if (!data) return;

        modalBodyContent.innerHTML = `
            <div class="modal-header-icon">${data.icon}</div>
            <h3>${data.title}</h3>
            <p><strong>Impact Metric:</strong> <span style="color:var(--primary); font-weight:600;">${data.stats}</span></p>
            <p style="margin-top:14px; line-height:1.7;">${data.details}</p>
            <h4 style="font-family:var(--font-heading); margin-top:20px; font-weight:700;">Suggested Action:</h4>
            <p style="font-style:italic; color:var(--text-light); margin-top:4px;">${data.actions}</p>
        `;

        detailsModal.classList.add('open');
        detailsModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden'; // Stop window scrolling
    }

    function closeModal() {
        detailsModal.classList.remove('open');
        detailsModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = ''; // Resume window scrolling
    }

    issueCards.forEach(card => {
        card.addEventListener('click', () => {
            const index = card.getAttribute('data-issue-index');
            openModal(index);
        });
    });

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeModal);
    }

    if (detailsModal) {
        detailsModal.addEventListener('click', (e) => {
            if (e.target === detailsModal) {
                closeModal();
            }
        });
    }

    // Escape Key close support for Accessibility
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && detailsModal.classList.contains('open')) {
            closeModal();
        }
    });

    // --- DAILY ECO TIP ENGINE ---
    const ecoTipsDatabase = [
        "Carry a reusable water bottle instead of buying single-use plastic bottles.",
        "Unplug electronic devices when not in use to eliminate vampire power draw.",
        "Buy local, seasonal produce to minimize the carbon cost of long-distance food transport.",
        "Compost organic kitchen scraps to reduce landfill methane emissions and build rich soil.",
        "Shorten your showers by just 2 minutes to conserve thousands of gallons of water annually.",
        "Bring your own reusable canvas bag when shopping to prevent plastic bag usage.",
        "Swap traditional light bulbs for energy-efficient LEDs, which use up to 80% less energy.",
        "Wash your clothes in cold water to reduce energy consumption by up to 90% per load.",
        "Choose walking or cycling for trips under two miles to reduce vehicle emissions.",
        "Try a meat-free day once a week to significantly lower your personal global warming footprint.",
        "Avoid buying packaged items, opting instead for loose goods with minimal cardboard footprint.",
        "Fix leaky home faucets immediately, saving up to 3,000 gallons of clean water every year."
    ];

    const nextTipBtn = document.getElementById('next-tip-btn');
    const ecoTipText = document.getElementById('eco-tip-text');
    let lastTipIndex = 0; // Prevent repeating immediately

    if (nextTipBtn && ecoTipText) {
        nextTipBtn.addEventListener('click', () => {
            nextTipBtn.disabled = true;
            ecoTipText.style.opacity = '0'; // Fade out transition

            setTimeout(() => {
                let randomIndex;
                do {
                    randomIndex = Math.floor(Math.random() * ecoTipsDatabase.length);
                } while (randomIndex === lastTipIndex);
                
                lastTipIndex = randomIndex;
                ecoTipText.textContent = ecoTipsDatabase[randomIndex];
                ecoTipText.style.opacity = '1'; // Fade back in
                nextTipBtn.disabled = false;
            }, 300);
        });
    }

    // --- CONTACT FORM MOCK TRANSMISSION INLINE ALERT ---
    const contactForm = document.getElementById('contact-form');
    const formSubmitBtn = document.getElementById('form-submit-btn');
    const formSuccessBox = document.getElementById('form-success-box');

    if (contactForm && formSubmitBtn && formSuccessBox) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Simple validation confirmation
            const name = document.getElementById('form-name').value.trim();
            const email = document.getElementById('form-email').value.trim();
            const message = document.getElementById('form-message').value.trim();

            if (!name || !email || !message) return;

            // Loading state trigger
            formSubmitBtn.classList.add('disabled');
            formSubmitBtn.disabled = true;
            const originalBtnHTML = formSubmitBtn.innerHTML;
            formSubmitBtn.innerHTML = `
                <span>Sending Securely...</span>
                <span class="btn-spinner animate-spin"></span>
            `;

            // Mock latency
            setTimeout(() => {
                formSuccessBox.style.display = 'flex';
                // Reset fields
                contactForm.reset();
                formSubmitBtn.innerHTML = originalBtnHTML;
                formSubmitBtn.classList.remove('disabled');
                formSubmitBtn.disabled = false;

                // Dismiss success banner after 5.5 seconds
                setTimeout(() => {
                    formSuccessBox.style.display = 'none';
                }, 5500);
            }, 1600);
        });
    }

    // --- FLOATING ECO LEAF DRIFTER GENERATOR (PERFORMANCE MINIMAL) ---
    const leafContainer = document.getElementById('leaf-container');
    const leafSymbols = ['🍃', '🌿', '🍂', '🌱'];
    const maxLeaves = 8; // Restrict active count to protect thread performance
    let currentLeafCount = 0;

    function createLeaf() {
        if (currentLeafCount >= maxLeaves || document.hidden) return;
        currentLeafCount++;

        const leaf = document.createElement('span');
        leaf.className = 'leaf-particle';
        leaf.textContent = leafSymbols[Math.floor(Math.random() * leafSymbols.length)];
        
        // Random placement parameters
        const startX = Math.random() * window.innerWidth;
        const scaleVal = 0.5 + Math.random() * 0.9;
        const durationVal = 10 + Math.random() * 8; // duration between 10 to 18 seconds
        const opacityVal = 0.15 + Math.random() * 0.35;
        
        leaf.style.left = `${startX}px`;
        leaf.style.fontSize = `${scaleVal * 1.5}rem`;
        leaf.style.animationDuration = `${durationVal}s`;
        leaf.style.opacity = opacityVal;

        // Custom path curves
        leafContainer.appendChild(leaf);

        // Remove element post animation cycle
        setTimeout(() => {
            leaf.remove();
            currentLeafCount--;
        }, durationVal * 1000);
    }

    // Initial fill
    for (let i = 0; i < 4; i++) {
        setTimeout(createLeaf, i * 2500);
    }

    // Continuous spawn cycle loop
    setInterval(createLeaf, 4000);
});
