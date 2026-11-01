document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#loginForm, #signupForm');
    const signup = form.id === 'signupForm';
    const message = document.getElementById('errorMessage');
    const submit = form.querySelector('button[type="submit"]');
    const originalLabel = submit.textContent;
    form.addEventListener('submit', async event => {
        event.preventDefault();
        if (submit.disabled || !form.reportValidity()) return;
        message.style.display = 'none';
        form.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));
        submit.disabled = true;
        submit.textContent = signup ? 'Creating account…' : 'Signing in…';
        form.setAttribute('aria-busy', 'true');
        try {
            const body = {
                username: document.getElementById('username').value.trim(),
                password: document.getElementById('password').value
            };
            if (signup) {
                body.email = document.getElementById('email').value.trim();
                body.phone = document.getElementById('phone').value.trim();
            }
            const data = await MedTrackAPI.request(`/api/auth/${signup ? 'signup' : 'login'}`, { method: 'POST', body });
            window.location.href = data.user.role === 'admin' ? 'admin.html' : 'index.html#dashboard';
        } catch (error) {
            const readable = value => {
                if (typeof value === 'string') return [value];
                if (Array.isArray(value)) return value.flatMap(readable);
                if (value && typeof value === 'object') return Object.values(value).flatMap(readable);
                return [];
            };
            const details = readable(error.fields || {});
            message.textContent = [...new Set([error.message, ...details].filter(Boolean))].join(' ');
            message.style.display = 'block';
            for (const field of Object.keys(error.fields || {})) {
                document.getElementById(field)?.setAttribute('aria-invalid', 'true');
            }
            message.focus();
        } finally {
            submit.disabled = false;
            submit.textContent = originalLabel;
            form.removeAttribute('aria-busy');
        }
    });
});
