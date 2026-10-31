/**
 * ENVIORA — Authentication System Logic (auth.js)
 * Handles client-side validation, password toggling, simulated authentication,
 * error handling, success states, and particle animations.
 */

document.addEventListener('DOMContentLoaded', () => {

    // =========================================================================
    // 1. Password Visibility Toggle Engine
    // =========================================================================
    const passwordToggles = document.querySelectorAll('.password-toggle-btn');

    passwordToggles.forEach(toggleBtn => {
        toggleBtn.addEventListener('click', () => {
            const targetInputId = toggleBtn.getAttribute('data-target');
            const targetInput = document.getElementById(targetInputId);
            if (!targetInput) return;

            const isPassword = targetInput.type === 'password';
            targetInput.type = isPassword ? 'text' : 'password';

            // Toggle icon state
            if (isPassword) {
                // Eye Off (Visible state -> click to hide)
                toggleBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                `;
                toggleBtn.setAttribute('aria-label', 'Hide password');
            } else {
                // Eye (Hidden state -> click to show)
                toggleBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                `;
                toggleBtn.setAttribute('aria-label', 'Show password');
            }
        });
    });

    // =========================================================================
    // 2. Validation Utilities & Error Handlers
    // =========================================================================
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function showError(inputId, errorId, message) {
        const inputEl = document.getElementById(inputId);
        const errorEl = document.getElementById(errorId);
        
        if (inputEl) {
            inputEl.classList.add('input-error');
        }
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.classList.add('visible');
        }
    }

    function clearError(inputId, errorId) {
        const inputEl = document.getElementById(inputId);
        const errorEl = document.getElementById(errorId);

        if (inputEl) {
            inputEl.classList.remove('input-error');
        }
        if (errorEl) {
            errorEl.textContent = '';
            errorEl.classList.remove('visible');
        }
    }

    // Attach real-time input listeners to clear errors on typing
    const allAuthInputs = document.querySelectorAll('.form-control-input');
    allAuthInputs.forEach(input => {
        input.addEventListener('input', () => {
            const errorId = `${input.id}-error`;
            clearError(input.id, errorId);
        });
    });

    // =========================================================================
    // 3. Login Form Handler
    // =========================================================================
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const emailInput = document.getElementById('login-email');
            const passwordInput = document.getElementById('login-password');
            const submitBtn = document.getElementById('login-submit-btn');
            const successAlert = document.getElementById('auth-success-alert');
            const errorAlert = document.getElementById('auth-error-alert');

            let isValid = true;

            // Reset alerts
            if (successAlert) successAlert.classList.remove('visible');
            if (errorAlert) errorAlert.classList.remove('visible');

            // Email validation
            const emailVal = emailInput.value.trim();
            if (!emailVal) {
                showError('login-email', 'login-email-error', 'Please enter your email address.');
                isValid = false;
            } else if (!isValidEmail(emailVal)) {
                showError('login-email', 'login-email-error', 'Please enter a valid email format (e.g. name@domain.com).');
                isValid = false;
            } else {
                clearError('login-email', 'login-email-error');
            }

            // Password validation
            const passwordVal = passwordInput.value.trim();
            if (!passwordVal) {
                showError('login-password', 'login-password-error', 'Please enter your password.');
                isValid = false;
            } else {
                clearError('login-password', 'login-password-error');
            }

            if (!isValid) return;

            // Start submission loading state
            submitBtn.disabled = true;
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = `
                <span class="btn-spinner"></span>
                <span>Signing In...</span>
            `;

            // Simulate authentication processing
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;

                // Show success message
                if (successAlert) {
                    successAlert.innerHTML = `
                        <div class="auth-alert-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                        </div>
                        <div>
                            <strong>Welcome back!</strong> Authentication successful. Entering ENVIORA...
                        </div>
                    `;
                    successAlert.classList.add('visible');
                }

                // Redirect to Home / Dashboard
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1300);

            }, 1200);
        });
    }

    // =========================================================================
    // 4. Sign Up / Registration Form Handler
    // =========================================================================
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const nameInput = document.getElementById('signup-name');
            const emailInput = document.getElementById('signup-email');
            const passwordInput = document.getElementById('signup-password');
            const confirmInput = document.getElementById('signup-confirm-password');
            const termsCheckbox = document.getElementById('signup-terms');
            const submitBtn = document.getElementById('signup-submit-btn');
            const successAlert = document.getElementById('auth-success-alert');

            let isValid = true;

            if (successAlert) successAlert.classList.remove('visible');

            // Name validation
            const nameVal = nameInput.value.trim();
            if (!nameVal || nameVal.length < 2) {
                showError('signup-name', 'signup-name-error', 'Please enter your full name (minimum 2 characters).');
                isValid = false;
            } else {
                clearError('signup-name', 'signup-name-error');
            }

            // Email validation
            const emailVal = emailInput.value.trim();
            if (!emailVal) {
                showError('signup-email', 'signup-email-error', 'Please enter your email address.');
                isValid = false;
            } else if (!isValidEmail(emailVal)) {
                showError('signup-email', 'signup-email-error', 'Please enter a valid email format.');
                isValid = false;
            } else {
                clearError('signup-email', 'signup-email-error');
            }

            // Password validation
            const passwordVal = passwordInput.value;
            if (!passwordVal || passwordVal.length < 6) {
                showError('signup-password', 'signup-password-error', 'Password must be at least 6 characters long.');
                isValid = false;
            } else {
                clearError('signup-password', 'signup-password-error');
            }

            // Confirm password validation
            const confirmVal = confirmInput.value;
            if (!confirmVal) {
                showError('signup-confirm-password', 'signup-confirm-error', 'Please confirm your password.');
                isValid = false;
            } else if (confirmVal !== passwordVal) {
                showError('signup-confirm-password', 'signup-confirm-error', 'Passwords do not match. Please re-enter.');
                isValid = false;
            } else {
                clearError('signup-confirm-password', 'signup-confirm-error');
            }

            // Terms checkbox validation
            const termsError = document.getElementById('signup-terms-error');
            if (termsCheckbox && !termsCheckbox.checked) {
                if (termsError) {
                    termsError.textContent = 'Please accept the Terms & Conditions to proceed.';
                    termsError.classList.add('visible');
                }
                isValid = false;
            } else if (termsError) {
                termsError.classList.remove('visible');
            }

            if (!isValid) return;

            // Submit loading state
            submitBtn.disabled = true;
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = `
                <span class="btn-spinner"></span>
                <span>Creating Account...</span>
            `;

            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;

                if (successAlert) {
                    successAlert.innerHTML = `
                        <div class="auth-alert-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                        </div>
                        <div>
                            <strong>Account Created!</strong> Welcome to ENVIORA. Redirecting to home...
                        </div>
                    `;
                    successAlert.classList.add('visible');
                }

                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1400);

            }, 1300);
        });
    }

    // =========================================================================
    // 5. Forgot Password Form Handler
    // =========================================================================
    const forgotForm = document.getElementById('forgot-form');
    if (forgotForm) {
        forgotForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const emailInput = document.getElementById('forgot-email');
            const submitBtn = document.getElementById('forgot-submit-btn');
            const successAlert = document.getElementById('auth-success-alert');

            let isValid = true;

            const emailVal = emailInput.value.trim();
            if (!emailVal) {
                showError('forgot-email', 'forgot-email-error', 'Please enter your email address.');
                isValid = false;
            } else if (!isValidEmail(emailVal)) {
                showError('forgot-email', 'forgot-email-error', 'Please enter a valid email format.');
                isValid = false;
            } else {
                clearError('forgot-email', 'forgot-email-error');
            }

            if (!isValid) return;

            submitBtn.disabled = true;
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = `
                <span class="btn-spinner"></span>
                <span>Sending Recovery Link...</span>
            `;

            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;

                if (successAlert) {
                    successAlert.innerHTML = `
                        <div class="auth-alert-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                        </div>
                        <div>
                            <strong>Recovery Email Sent!</strong> If an account exists for <em>${emailVal}</em>, a reset link has been delivered.
                        </div>
                    `;
                    successAlert.classList.add('visible');
                }

                forgotForm.reset();
            }, 1200);
        });
    }

    // =========================================================================
    // 6. Social Sign-In Simulated Triggers
    // =========================================================================
    const socialButtons = document.querySelectorAll('.btn-social');
    socialButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const provider = btn.getAttribute('data-provider') || 'Social Account';
            const successAlert = document.getElementById('auth-success-alert');

            btn.style.opacity = '0.7';
            btn.style.pointerEvents = 'none';

            setTimeout(() => {
                btn.style.opacity = '1';
                btn.style.pointerEvents = 'auto';

                if (successAlert) {
                    successAlert.innerHTML = `
                        <div class="auth-alert-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                        </div>
                        <div>
                            <strong>Connected with ${provider}!</strong> Redirecting to your dashboard...
                        </div>
                    `;
                    successAlert.classList.add('visible');
                }

                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1200);
            }, 800);
        });
    });

    // =========================================================================
    // 7. Floating Leaf Particles Generator for Auth Pages
    // =========================================================================
    const leafContainer = document.querySelector('.auth-leaf-container') || document.getElementById('leaf-container');
    if (leafContainer) {
        const leafSymbols = ['🍃', '🌿', '🍂', '🌱'];
        const maxLeaves = 6;
        let currentLeaves = 0;

        function createAuthLeaf() {
            if (currentLeaves >= maxLeaves || document.hidden) return;
            currentLeaves++;

            const leaf = document.createElement('span');
            leaf.className = 'leaf-particle';
            leaf.textContent = leafSymbols[Math.floor(Math.random() * leafSymbols.length)];

            const startX = Math.random() * window.innerWidth;
            const scaleVal = 0.5 + Math.random() * 0.8;
            const durationVal = 10 + Math.random() * 8;
            const opacityVal = 0.12 + Math.random() * 0.25;

            leaf.style.left = `${startX}px`;
            leaf.style.fontSize = `${scaleVal * 1.4}rem`;
            leaf.style.animationDuration = `${durationVal}s`;
            leaf.style.opacity = opacityVal;

            leafContainer.appendChild(leaf);

            setTimeout(() => {
                leaf.remove();
                currentLeaves--;
            }, durationVal * 1000);
        }

        for (let i = 0; i < 3; i++) {
            setTimeout(createAuthLeaf, i * 2000);
        }
        setInterval(createAuthLeaf, 4500);
    }
});
