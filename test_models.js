import puppeteer from 'puppeteer';
import * as fs from 'fs';

async function runTest() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  const logs = [];
  page.on('console', msg => {
    const text = msg.text();
    console.log(`[Browser ${msg.type().toUpperCase()}] ${text}`);
    logs.push(`[${msg.type().toUpperCase()}] ${text}`);
  });
  
  page.on('pageerror', err => {
    console.log(`[Browser ERROR] ${err.toString()}`);
    logs.push(`[ERROR] ${err.toString()}`);
  });

  console.log("Navigating to http://localhost:5173/dashboard...");
  await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle0', timeout: 30000 });
  
  console.log("Waiting 5s for initial load...");
  await new Promise(r => setTimeout(r, 5000));
  
  fs.writeFileSync('browser_logs.txt', logs.join('\n'));
  await browser.close();
}

runTest().catch(console.error);
