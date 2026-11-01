const MedTrackAPI = (() => {
    let csrfToken = null;
    async function request(path, { method = 'GET', body } = {}, retriedCsrf = false) {
        if (method !== 'GET' && !csrfToken) await request('/api/auth/me');
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        let response, payload;
        try {
            response = await fetch(`${CONFIG.API_BASE_URL}${path}`, {
                method, credentials: 'include', signal: controller.signal,
                headers: method === 'GET' ? {} : {
                    'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken
                },
                ...(method !== 'GET' ? { body: JSON.stringify(body || {}) } : {})
            });
            payload = await response.json();
        } catch (cause) {
            throw new Error(cause.name === 'AbortError'
                ? 'The server took too long to respond. Please try again.'
                : 'Cannot connect to MedTrack. Check that the backend is running and try again.');
        } finally {
            clearTimeout(timeout);
        }
        if (!response.ok || !payload.success) {
            if (payload.error?.code === 'csrf_failed' && method !== 'GET' && !retriedCsrf) {
                csrfToken = null;
                await request('/api/auth/me');
                return request(path, { method, body }, true);
            }
            const error = new Error(payload.error?.message || 'The request could not be completed.');
            error.status = response.status;
            error.code = payload.error?.code;
            error.fields = payload.error?.fields || {};
            if (payload.error?.code === 'csrf_failed') csrfToken = null;
            throw error;
        }
        if (payload.data.csrf_token) csrfToken = payload.data.csrf_token;
        if (path === '/api/auth/logout') csrfToken = null;
        return payload.data;
    }

    async function upload(path, formData, onProgress, retriedCsrf = false) {
        if (!csrfToken) await request('/api/auth/me');
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', `${CONFIG.API_BASE_URL}${path}`);
            xhr.withCredentials = true;
            xhr.timeout = 45000;
            xhr.setRequestHeader('X-CSRF-Token', csrfToken);
            xhr.upload.onprogress = event => {
                if (event.lengthComputable && onProgress) onProgress(Math.round((event.loaded / event.total) * 100));
            };
            xhr.onload = async () => {
                let payload;
                try { payload = JSON.parse(xhr.responseText); }
                catch { reject(new Error('The server returned an unreadable response.')); return; }
                if (xhr.status < 200 || xhr.status >= 300 || !payload.success) {
                    if (payload.error?.code === 'csrf_failed' && !retriedCsrf) {
                        try {
                            csrfToken = null;
                            await request('/api/auth/me');
                            resolve(await upload(path, formData, onProgress, true));
                        } catch (error) {
                            reject(error);
                        }
                        return;
                    }
                    const error = new Error(payload.error?.message || 'The upload could not be completed.');
                    error.status = xhr.status;
                    error.code = payload.error?.code;
                    error.fields = payload.error?.fields || {};
                    reject(error);
                    return;
                }
                resolve(payload.data);
            };
            xhr.onerror = () => reject(new Error('Cannot connect to MedTrack. Check that the backend is running.'));
            xhr.ontimeout = () => reject(new Error('The scan took too long. Please try again.'));
            xhr.send(formData);
        });
    }
    return { request, upload };
})();
