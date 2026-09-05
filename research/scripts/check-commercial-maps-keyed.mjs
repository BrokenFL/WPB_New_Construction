// Real Google Maps verification of the candidate build. No fallback acceptance,
// no mocked Maps responses, no deployment, no raw request URLs or credentials.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import { chromium } from 'playwright';
import { verifyProductionMapBundle } from './commercial-preflight.mjs';

await verifyProductionMapBundle();
const origin = 'http://127.0.0.1:4173';
const artifactDir = '.runtime/p2-keyed-maps';
await fs.mkdir(artifactDir, { recursive: true });
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '4173', '--strictPort'], { stdio: 'ignore' });
let browser;
const results = [];
try {
  let ready = false;
  for (let attempt = 0; attempt < 120; attempt++) {
    if (server.exitCode !== null) throw new Error('Dedicated review server failed to start on port 4173.');
    try { if ((await fetch(origin)).ok) { ready = true; break; } } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  assert.ok(ready, 'Dedicated review server did not become ready.');
  browser = await chromium.launch({ headless: true });
  for (const route of ['/', '/map/']) {
    const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
    await context.route('**/*', (request) => {
      const url = new URL(request.request().url());
      if (url.pathname.startsWith('/api/') || /googletagmanager\.com|google-analytics\.com/.test(url.hostname)) return request.abort();
      return request.continue(); // Google Maps loader and tiles are NEVER stubbed.
    });
    const page = await context.newPage();
    const errors = [];
    let loaderResponses = 0;
    page.on('response', (response) => {
      const url = new URL(response.url());
      if (url.hostname === 'maps.googleapis.com' && url.pathname === '/maps/api/js' && response.ok()) loaderResponses++;
    });
    page.on('console', (message) => {
      const code = message.text().match(/Google Maps JavaScript API (?:error|warning):\s*([A-Za-z0-9]+)/)?.[1];
      if (code) errors.push(code); // Record only the error code, never URLs/keys.
    });
    page.on('pageerror', () => errors.push('UncaughtBrowserError'));
    try {
      assert.equal((await page.goto(origin + route, { waitUntil: 'domcontentloaded' })).status(), 200);
      const card = page.locator('.home-hero-map-card:visible').first();
      await card.scrollIntoViewIfNeeded();
      await page.waitForFunction(() => {
        const card = [...document.querySelectorAll('.home-hero-map-card')].find((el) => !el.closest('[data-route-view]')?.hidden);
        if (card?.getAttribute('data-map-state') !== 'ready' || card.querySelector('.gm-err-container')) return false;
        return [...card.querySelectorAll('.gm-style img')].some((img) => {
          try {
            const url = new URL(img.currentSrc || img.src);
            return /(^|\.)(googleapis\.com|google\.com|gstatic\.com)$/.test(url.hostname)
              && /\/vt(?:\/|$)|\/maps\/vt|\/kh\/|\/maps\/tiles/.test(url.pathname)
              && img.complete && img.naturalWidth >= 128 && img.naturalHeight >= 128;
          } catch { return false; }
        });
      }, null, { timeout: 30000 });
      assert.ok(loaderResponses > 0, 'A real Maps loader response is required.');
      assert.deepEqual(errors, [], 'Google Maps/browser error codes');
      assert.equal(await card.locator('.gm-err-container').count(), 0);
      await card.getByRole('button', { name: 'Zoom in', exact: true }).click();
      await page.waitForTimeout(1500);
      assert.equal(await card.getAttribute('data-map-state'), 'ready');
      assert.deepEqual(errors, [], 'Errors after interacting with the actual map');
      await page.screenshot({ path: `${artifactDir}/${route === '/' ? 'home' : 'map'}-working-map.png`, fullPage: true });
      results.push({ route, status: 'pass', realLoaderResponse: true, loadedMapTileImages: true, zoomControl: 'exercised', fallbackAccepted: false });
    } catch {
      results.push({ route, status: 'fail', errorCodes: [...new Set(errors)], reason: 'Real Google loader, tile imagery, or interactive map verification did not complete.' });
    }
    await context.close();
  }
  await fs.writeFile(`${artifactDir}/results.json`, JSON.stringify(results, null, 2));
  console.log(JSON.stringify({ keyedMapsVerification: results.every((r) => r.status === 'pass') ? 'pass' : 'fail', results }));
  if (results.some((r) => r.status !== 'pass')) process.exitCode = 1;
} finally {
  await browser?.close();
  server.kill('SIGTERM');
}
