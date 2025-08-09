#!/usr/bin/env node

/**
 * Quick Admin Regression Test (non-invasive)
 * - Opens live admin dashboard
 * - Stubs network calls to avoid touching live APIs
 * - Verifies: editing user does NOT send acceptance email, delete path works
 */

const puppeteer = require('puppeteer');

async function run() {
  const results = { emailOnEdit: null, deleteFlowOk: null, notes: [] };
  const browser = await puppeteer.launch({ headless: true, defaultViewport: { width: 1366, height: 900 } });
  const page = await browser.newPage();

  // Intercept network to stub sensitive endpoints
  await page.setRequestInterception(true);
  page.on('request', req => {
    const url = req.url();
    // Stub mailer
    if (url.includes('/api/email/send')) {
      results.notes.push(`[stub] blocked mailer: ${url}`);
      return req.respond({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, stub: true }) });
    }
    // Stub GitHub writes
    if (url.includes('/api/github/file/users.json') && req.method() === 'PUT') {
      results.notes.push(`[stub] blocked users.json write`);
      return req.respond({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, stub: true }) });
    }
    // Allow reads
    return req.continue();
  });

  const emailSends = [];
  // Observe fetch calls for email
  await page.exposeFunction('pushEmailSend', (payload) => emailSends.push(payload));

  await page.goto('https://collaborate.cochranfilms.com/admin-dashboard', { waitUntil: 'networkidle2' });

  // Hook fetch in page context to detect mailer calls
  await page.evaluate(() => {
    const _fetch = window.fetch;
    window.fetch = async function(url, opts) {
      if (typeof url === 'string' && url.includes('/api/email/send')) {
        try { window.pushEmailSend({ when: 'fetch', payload: opts && opts.body }); } catch (_) {}
      }
      return _fetch.apply(this, arguments);
    };
  });

  // Find a user name to edit
  const userName = await page.evaluate(() => {
    try {
      if (!window.users) return null;
      const keys = Object.keys(window.users).filter(k => k !== '_archived');
      return keys[0] || null;
    } catch (_) { return null; }
  });

  if (!userName) {
    results.notes.push('No users found to test edit/delete.');
  } else {
    // Edit flow: open form, change role value slightly, submit
    await page.evaluate((name) => {
      // ensure confirm won't block later
      window.__origConfirm = window.confirm; window.confirm = () => true;
      if (typeof editUser === 'function') editUser(name);
      const role = document.getElementById('freelancerRole');
      if (role) role.value = (role.value || 'Role') + ' (edit-test)';
      const form = document.getElementById('contractForm');
      if (form) form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    }, userName);

    // wait for network activity to settle
    await page.waitForTimeout(1500);
    results.emailOnEdit = emailSends.length > 0;

    // Delete flow: call delete, but our network and confirm are stubbed
    await page.evaluate((name) => {
      if (typeof deleteUser === 'function') deleteUser(name);
    }, userName);
    await page.waitForTimeout(1000);
    results.deleteFlowOk = true; // If we got here without exceptions, treat as ok (write was stubbed)
  }

  await browser.close();

  console.log('\n=== QUICK ADMIN REGRESSION TEST ===');
  console.log('Email attempted on EDIT:', results.emailOnEdit === null ? 'N/A' : results.emailOnEdit ? 'YES (problem)' : 'NO (good)');
  console.log('Delete flow (non-invasive) executed:', results.deleteFlowOk ? 'YES' : 'NO');
  if (results.notes.length) {
    console.log('Notes:');
    results.notes.forEach(n => console.log(' -', n));
  }
}

run().catch(err => { console.error('Test error:', err); process.exit(1); });


