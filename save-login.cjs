
const { chromium } = require('@playwright/test');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: false });

  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('http://localhost:3000/');

  console.log('Sign in using Google in the opened browser.');
  console.log('After returning to TeamUp, press Enter in the terminal.');

  process.stdin.resume();
  process.stdin.once('data', async () => {
    fs.mkdirSync('playwright/.auth', { recursive: true });

    await context.storageState({
      path: 'playwright/.auth/user.json'
    });

    console.log('Login session saved.');
    await browser.close();
    process.exit(0);
  });
})();
