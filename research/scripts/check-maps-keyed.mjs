// Real Maps release verification: no fallback, mocked Google responses, keys or URLs in evidence.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import { chromium } from 'playwright';
import { verifyProductionMapBundle } from './production-map-preflight.mjs';
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
  for (const width of [1366, 390]) for (const route of ['/', '/map/']) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    await context.route('**/*', (request) => {
      const url = new URL(request.request().url());
      if (url.pathname.startsWith('/api/') || /googletagmanager\.com|google-analytics\.com/.test(url.hostname)) return request.abort();
      return request.continue();
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
      if (code) errors.push(code);
    });
    page.on('pageerror', () => errors.push('UncaughtBrowserError'));
    try {
      assert.equal((await page.goto(origin + route, { waitUntil: 'domcontentloaded' })).status(), 200);
      const deny = page.getByRole('button', { name: 'No thanks', exact: true });
      if (await deny.isVisible()) await deny.click();
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
      const dimensions = await card.evaluate((el) => ({ cardWidth: el.getBoundingClientRect().width, canvasWidth: el.querySelector('[data-hero-google-map]').getBoundingClientRect().width }));
      if (route === '/map/') assert.ok(dimensions.canvasWidth >= dimensions.cardWidth - 4, 'Standalone map must fill its card; no empty inherited second column.');
      const previousTiles = await card.locator('.gm-style img').evaluateAll((imgs) => imgs.filter(i => i.complete && i.naturalWidth >= 128).map(i => i.currentSrc || i.src));
      await card.getByRole('button', { name: 'Zoom in', exact: true }).click();
      await page.waitForFunction((old) => [...document.querySelectorAll('.home-hero-map-card')].filter(c => !c.closest('[data-route-view]')?.hidden).flatMap(c => [...c.querySelectorAll('.gm-style img')]).some(i => i.complete && i.naturalWidth >= 128 && !old.includes(i.currentSrc || i.src)), previousTiles, { timeout: 15000 });
      await page.waitForTimeout(1000);
      assert.equal(await card.getAttribute('data-map-state'), 'ready');
      assert.deepEqual(errors, [], 'Errors after interacting with the actual map');
      const label = `${route === '/' ? 'home' : 'map'}-${width}`;
      await page.screenshot({ path: `${artifactDir}/${label}-working-map.png`, fullPage: true });
      await card.screenshot({ path: `${artifactDir}/${label}-map-card.png` });
      results.push({ route, width, status: 'pass', realLoaderResponse: true, loadedMapTileImages: true, zoomChangedTiles: true, dimensions, fallbackAccepted: false });
    } catch {
      results.push({ route, width, status: 'fail', errorCodes: [...new Set(errors)], reason: 'Real loader, rendered tile imagery, map-card layout or zoom verification did not complete.' });
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
