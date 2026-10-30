// Optional real-browser check. Run only against the disposable browser-test.db.
// Set PLAYWRIGHT_MODULE to an installed Playwright module path if not on NODE_PATH.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const python = process.env.MEDTRACK_PYTHON || path.join(root, '.venv', 'Scripts', 'python.exe');

async function main() {
    assert.equal(process.env.DATABASE_URL, 'sqlite:///browser-test.db', 'Use the disposable browser-test.db for both Flask and this test.');
    fs.mkdirSync(path.join(root, 'artifacts'), { recursive: true });
    const browser = await chromium.launch({ channel: 'chrome', headless: true });
    try {
        for (const port of [5000, 8000]) {
            const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
            const page = await context.newPage();
            const errors = [], apiRequests = [];
            page.on('pageerror', error => errors.push(error.message));
            page.on('request', request => {
                if (request.url().includes('/api/')) apiRequests.push(new URL(request.url()).pathname);
            });
            const base = `http://127.0.0.1:${port}`;
            const username = `browser_${port}_${Date.now()}`;
            const email = `${username}@example.com`;
            const password = 'browser test passphrase 2026';
            const fillLogin = async (identity, secret) => {
                await page.locator('#username').fill(identity);
                await page.locator('#password').fill(secret);
                await page.getByRole('button', { name: 'Sign In', exact: true }).click();
            };
            const apiStatus = endpoint => page.evaluate(async endpoint => {
                const response = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, { credentials: 'include' });
                return response.status;
            }, endpoint);

            await page.goto(`${base}/index.html#dashboard`);
            await page.waitForURL('**/login.html');
            await page.getByRole('link', { name: 'Sign up', exact: true }).click();
            await page.locator('#username').fill(username);
            await page.locator('#email').fill(email);
            await page.locator('#phone').fill('+919876543210');
            await page.locator('#password').fill(password);
            await page.getByRole('button', { name: 'Create Account', exact: true }).click();
            await page.waitForURL('**/index.html#dashboard');
            await page.waitForFunction(name => document.getElementById('patientName')?.textContent === name, username);
            await page.waitForFunction(() => scrollY === 0);
            await page.screenshot({ path: path.join(root, 'artifacts', `dashboard-${port}.png`), fullPage: true, animations: 'disabled' });
            await page.reload();
            await page.waitForFunction(name => document.getElementById('patientName')?.textContent === name, username);
            assert.equal(await apiStatus('/api/patient/dashboard'), 200);
            assert.equal(await apiStatus('/api/admin'), 403);

            await page.locator('.nav-links [data-page="scanner"]').click();
            await page.locator('#scanner.active').waitFor();
            await page.locator('#manualEntryButton').click();
            await page.locator('#verificationForm').waitFor({state:'visible'});
            await page.locator('#draft-medicine_name').fill('Browser Test Medicine');
            await page.locator('#draft-dosage').fill('One tablet');
            await page.locator('#draft-frequency').fill('Once daily');
            await page.locator('#draft-suggested_times').fill('08:00');
            await page.locator('#confirmDraft').check();
            await page.locator('#confirmDraftButton').click();
            await page.locator('#dashboard.active').waitFor();
            assert.match(await page.locator('.dose-title').innerText(), /Browser Test Medicine/);
            await page.locator('.nav-links [data-page="reports"]').click();
            await page.locator('#reports.active').waitFor();
            assert.match(await page.locator('#reportsContainer').innerText(), /Browser Test Medicine/);

            await page.setViewportSize({ width: 390, height: 844 });
            await page.locator('.mobile-nav [data-page="dashboard"]').first().click();
            await page.locator('#dashboard.active').waitFor();
            await page.waitForFunction(() => scrollY === 0);
            await page.screenshot({ path: path.join(root, 'artifacts', `mobile-${port}.png`), fullPage: true, animations: 'disabled' });
            assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'Mobile dashboard must not overflow horizontally.');
            assert.equal(await page.getByRole('button', { name: 'Log Out', exact: true }).isVisible(), true);
            await page.getByRole('button', { name: 'Log Out', exact: true }).click();
            await page.waitForURL('**/login.html');
            assert.equal(await apiStatus('/api/patient/dashboard'), 401);
            await fillLogin(email, 'incorrect password');
            await page.locator('#errorMessage').waitFor({ state: 'visible' });
            assert.match(await page.locator('#errorMessage').innerText(), /Invalid username/);
            assert.equal(await page.getByRole('button', { name: 'Sign In', exact: true }).isEnabled(), true);
            await fillLogin(email.toUpperCase(), password);
            await page.waitForURL('**/index.html#dashboard');
            await page.waitForFunction(name => document.getElementById('patientName')?.textContent === name, username);

            execFileSync(python, ['-m', 'flask', '--app', 'app', 'promote-admin', username], {
                cwd: path.join(root, 'backend'), env: process.env, windowsHide: true, stdio: 'pipe'
            });
            await page.getByRole('button', { name: 'Log Out', exact: true }).click();
            await page.waitForURL('**/login.html');
            await fillLogin(username, password);
            await page.waitForURL('**/admin.html');
            await page.locator('#adminContent').waitFor({ state: 'visible' });
            assert.match(await page.locator('#adminStatus').innerText(), /Administrator access verified/);
            assert.equal(await apiStatus('/api/admin'), 200);
            await page.locator('#adminLogout').click();
            await page.waitForURL('**/login.html');
            assert.equal(await apiStatus('/api/admin'), 401);

            // Duplicate-account error is presented inline; button is restored.
            await page.goto(`${base}/signup.html`);
            await page.locator('#username').fill(username);
            await page.locator('#email').fill(email);
            await page.locator('#password').fill(password);
            await page.getByRole('button', { name: 'Create Account', exact: true }).click();
            await page.locator('#errorMessage').waitFor({ state: 'visible' });
            assert.match(await page.locator('#errorMessage').innerText(), /already exists/);

            await page.goto(`${base}/login.html`);
            await page.route('**/api/**', route => route.abort());
            await fillLogin(username, password);
            await page.locator('#errorMessage').waitFor({ state: 'visible' });
            assert.match(await page.locator('#errorMessage').innerText(), /Cannot connect/);
            assert.equal(await page.getByRole('button', { name: 'Sign In', exact: true }).isEnabled(), true);
            await page.unroute('**/api/**');
            assert.deepEqual(errors, []);
            assert.equal(apiRequests.some(url => /notifications/.test(url)), false);
            console.log(`PASS port ${port}: guest guard, signup, reload, manual draft confirmation, schedule, reports, patient/admin permissions, mobile logout, invalid login, email login, admin promotion/login/logout, duplicate signup, and network error; no JS errors.`);
            await context.close();
        }
    } finally {
        await browser.close();
    }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
