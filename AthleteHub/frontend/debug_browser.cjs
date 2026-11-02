const puppeteer = require('puppeteer');

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER ERROR:', msg.text());
    } else {
      console.log('BROWSER LOG:', msg.text());
    }
  });

  page.on('pageerror', err => {
    console.log('BROWSER PAGE ERROR:', err.toString());
  });

  console.log('Navigating to http://localhost:5173/dashboard...');
  try {
    await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle0' });
    console.log('Navigation complete. Waiting 2s...');
    await new Promise(r => setTimeout(r, 2000));
  } catch (e) {
    console.error('Navigation failed:', e);
  }

  await browser.close();
})();
