const puppeteer = require('puppeteer');

(async () => {
  const FRONTEND = 'http://localhost:4200/login';
  const VALIDATE_URL = 'http://localhost:5137/api/auth/validate';
  const EMAIL = 'admin@localhost';
  const PASSWORD = 'Admin123!';

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(FRONTEND, { waitUntil: 'networkidle2', timeout: 30000 });

    // Fill form
    await page.type('input[name=email]', EMAIL);
    await page.type('input[name=password]', PASSWORD);

    // Submit form
    await Promise.all([
      page.click('button[type=submit]'),
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {})
    ]);

    // Check sessionStorage
    const tokens = await page.evaluate(() => {
      return {
        access: sessionStorage.getItem('access_token'),
        refresh: sessionStorage.getItem('refresh_token')
      };
    });

    console.log('Session tokens:', !!tokens.access, !!tokens.refresh);
    if (!tokens.access) throw new Error('access_token not found in sessionStorage');

    // Validate token with backend from page context (uses fetch)
    const validateResult = await page.evaluate(async (validateUrl) => {
      const token = sessionStorage.getItem('access_token');
      if (!token) return { ok: false, status: 0, body: null };
      try {
        const res = await fetch(validateUrl, { method: 'GET', headers: { 'Authorization': 'Bearer ' + token } });
        const body = await res.json().catch(() => null);
        return { ok: res.ok, status: res.status, body };
      } catch (e) {
        return { ok: false, status: 0, error: e.message };
      }
    }, VALIDATE_URL);

    console.log('Validate result:', validateResult);

    if (!validateResult.ok) throw new Error('Token validation failed: ' + JSON.stringify(validateResult));

    console.log('E2E login test passed: token stored and valid.');
    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error('E2E login test failed:', err);
    await browser.close();
    process.exit(2);
  }
})();
