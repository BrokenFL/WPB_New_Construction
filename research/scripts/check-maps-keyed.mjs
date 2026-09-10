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
const scenarios = [
  { route: '/', width: 1366, direction: 'in' },
  { route: '/map/', width: 1366, direction: 'in' },
  { route: '/', width: 390, direction: 'in' },
  { route: '/', width: 390, direction: 'out' },
  { route: '/map/', width: 390, direction: 'in' },
  { route: '/map/', width: 390, direction: 'out' },
];

function safeErrorMessage(error) {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(/https?:\/\/\S+/g, '[URL omitted]').replace(/AIza[0-9A-Za-z_-]{20,}/g, '[key omitted]');
}

async function assertMobileMapControls(page, card, route) {
  const geometry = await card.evaluate((card) => {
    const visible = (element) => {
      if (!element) return false;
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    };
    const rectOf = (element) => {
      const rect = element.getBoundingClientRect();
      return { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height };
    };
    const overlapArea = (a, b) => Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left))
      * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
    const launcher = document.querySelector('.buyer-concierge-launcher');
    const count = card.querySelector('.home-map-count');
    const controls = {};
    for (const label of ['Zoom in', 'Zoom out']) {
      const button = [...card.querySelectorAll(`button[aria-label="${label}"]`)].find(visible);
      if (!button) return { error: `Visible ${label} control was not found.` };
      const rect = rectOf(button);
      const center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      const hit = document.elementFromPoint(center.x, center.y);
      controls[label] = {
        rect,
        center,
        centerContainsHit: Boolean(hit && button.contains(hit)),
        hit: { tag: hit?.tagName ?? null, className: hit?.getAttribute('class') ?? null, ariaLabel: hit?.getAttribute('aria-label') ?? null },
        overlapAreaWithLauncher: overlapArea(rect, rectOf(launcher)),
        overlapAreaWithCount: count && visible(count) ? overlapArea(rect, rectOf(count)) : 0,
      };
    }
    return {
      controls,
      launcher: { rect: rectOf(launcher), expanded: launcher.getAttribute('aria-expanded') },
      count: count && visible(count) ? { rect: rectOf(count), pointerEvents: getComputedStyle(count).pointerEvents } : null,
    };
  });
  try {
    assert.equal(geometry.error, undefined, `${route} mobile Maps controls`);
    for (const label of ['Zoom in', 'Zoom out']) {
      const control = geometry.controls[label];
      assert.equal(control.centerContainsHit, true, `${route} mobile ${label} center must hit its native Google control`);
      assert.equal(control.overlapAreaWithLauncher, 0, `${route} mobile ${label} must clear the concierge launcher`);
      assert.equal(control.overlapAreaWithCount, 0, `${route} mobile ${label} must clear the map count panel`);
    }
    assert.equal(geometry.launcher.expanded, 'false', `${route} mobile launcher should start closed`);
  } catch (error) {
    if (error && typeof error === 'object') error.mobileControlGeometry = geometry;
    throw error;
  }
  return geometry;
}

try {
  let ready = false;
  for (let attempt = 0; attempt < 120; attempt++) {
    if (server.exitCode !== null) throw new Error('Dedicated review server failed to start on port 4173.');
    try { if ((await fetch(origin)).ok) { ready = true; break; } } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  assert.ok(ready, 'Dedicated review server did not become ready.');
  browser = await chromium.launch({ headless: true });
  for (const { route, width, direction } of scenarios) {
    const context = await browser.newContext({
      viewport: { width, height: width === 390 ? 844 : 900 },
      // This audit is about the real keyed Maps surface. Keep the unrelated
      // optional analytics prompt out of the page, as the concierge capture
      // audit does, so consent timing cannot intercept map controls.
      storageState: { cookies: [], origins: [{ origin, localStorage: [{ name: 'wpbAnalyticsConsentV1', value: 'denied' }] }] },
    });
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
    let failurePhase = 'navigation';
    let mobileControlGeometry;
    try {
      assert.equal((await page.goto(origin + route, { waitUntil: 'domcontentloaded' })).status(), 200);
      failurePhase = 'consent';
      const deny = page.getByRole('button', { name: 'No thanks', exact: true });
      if (await deny.isVisible()) await deny.click();
      failurePhase = 'map-card';
      const card = page.locator('.home-hero-map-card:visible').first();
      await card.scrollIntoViewIfNeeded();
      failurePhase = 'map-readiness-and-tiles';
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
      failurePhase = 'real-loader-response';
      assert.ok(loaderResponses > 0, 'A real Maps loader response is required.');
      failurePhase = 'pre-zoom-errors';
      assert.deepEqual(errors, [], 'Google Maps/browser error codes');
      failurePhase = 'map-layout';
      const dimensions = await card.evaluate((el) => ({ cardWidth: el.getBoundingClientRect().width, canvasWidth: el.querySelector('[data-hero-google-map]').getBoundingClientRect().width }));
      if (route === '/map/') assert.ok(dimensions.canvasWidth >= dimensions.cardWidth - 4, 'Standalone map must fill its card; no empty inherited second column.');
      if (width === 390) {
        failurePhase = 'mobile-control-readiness';
        await page.waitForFunction(() => {
          const card = [...document.querySelectorAll('.home-hero-map-card')].find((element) => !element.closest('[data-route-view]')?.hidden);
          return card && ['Zoom in', 'Zoom out'].every((label) => [...card.querySelectorAll(`button[aria-label="${label}"]`)].some((button) => {
            const rect = button.getBoundingClientRect();
            const style = getComputedStyle(button);
            return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
          }));
        }, null, { timeout: 10000 });
        failurePhase = 'mobile-control-layout';
        await page.locator('.buyer-concierge-launcher').waitFor({ state: 'visible', timeout: 10000 });
        mobileControlGeometry = await assertMobileMapControls(page, card, route);
      }
      const previousTiles = await card.locator('.gm-style img').evaluateAll((imgs) => imgs.filter(i => i.complete && i.naturalWidth >= 128).map(i => i.currentSrc || i.src));
      const label = direction === 'in' ? 'Zoom in' : 'Zoom out';
      failurePhase = `zoom-${direction}-control`;
      if (width === 390) {
        const control = mobileControlGeometry.controls[label].center;
        await page.mouse.click(control.x, control.y);
        assert.equal(await page.locator('.buyer-concierge-launcher').getAttribute('aria-expanded'), 'false', `${route} mobile ${label} must not open concierge`);
      } else {
        assert.equal(direction, 'in', 'Desktop Maps scenario must exercise Zoom in.');
        await card.getByRole('button', { name: label, exact: true }).click();
      }
      failurePhase = `zoom-${direction}-tiles`;
      await page.waitForFunction((old) => [...document.querySelectorAll('.home-hero-map-card')].filter(c => !c.closest('[data-route-view]')?.hidden).flatMap(c => [...c.querySelectorAll('.gm-style img')]).some(i => i.complete && i.naturalWidth >= 128 && !old.includes(i.currentSrc || i.src)), previousTiles, { timeout: 15000 });
      await page.waitForTimeout(1000);
      failurePhase = 'post-zoom-map-state';
      assert.equal(await card.getAttribute('data-map-state'), 'ready');
      failurePhase = 'post-zoom-errors';
      assert.deepEqual(errors, [], 'Errors after interacting with the actual map');
      if (width === 390) {
        failurePhase = 'mobile-launcher-hit-test';
        const launcher = page.locator('.buyer-concierge-launcher');
        const launcherBox = await launcher.boundingBox();
        assert.ok(launcherBox, `${route} mobile concierge launcher must be visible`);
        await page.mouse.click(launcherBox.x + launcherBox.width / 2, launcherBox.y + launcherBox.height / 2);
        await page.waitForFunction(() => document.querySelector('.buyer-concierge-launcher')?.getAttribute('aria-expanded') === 'true', null, { timeout: 5000 });
        await page.keyboard.press('Escape');
        await page.waitForFunction(() => document.querySelector('.buyer-concierge-launcher')?.getAttribute('aria-expanded') === 'false', null, { timeout: 5000 });
      }
      const scenarioLabel = `${route === '/' ? 'home' : 'map'}-${width}-zoom-${direction}`;
      failurePhase = 'screenshots';
      await page.screenshot({ path: `${artifactDir}/${scenarioLabel}-working-map.png`, fullPage: true });
      await card.screenshot({ path: `${artifactDir}/${scenarioLabel}-map-card.png` });
      results.push({ route, width, direction, status: 'pass', realLoaderResponse: true, loadedMapTileImages: true, zoomChangedTiles: true, dimensions, mobileControlGeometry, fallbackAccepted: false });
    } catch (error) {
      const diagnostics = error && typeof error === 'object' && 'mobileControlGeometry' in error ? error.mobileControlGeometry : mobileControlGeometry;
      results.push({ route, width, direction, status: 'fail', failurePhase, errorCodes: [...new Set(errors)], assertion: safeErrorMessage(error), ...(diagnostics ? { mobileControlGeometry: diagnostics } : {}), reason: `Keyed Maps verification failed during ${failurePhase}.` });
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
