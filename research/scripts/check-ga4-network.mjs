// Real gtag.js regression. Candidate collection is intercepted; --live transmits
// only validated page views to Google. Synthetic inquiry conversions and all lead
// POSTs remain intercepted in BOTH modes. No raw URLs, client IDs, keys or PII logs.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { spawn, execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { chromium } from 'playwright';
import { publishedFloorplanEntities } from '../../src/lib/floorplanEntities.ts';

const live = process.argv.includes('--live');
const origin = live ? 'https://www.wpbnewconstruction.com' : 'http://127.0.0.1:4173';
const production = 'https://www.wpbnewconstruction.com';
const measurement = 'G-0LGBH6MDVX';
const plan = publishedFloorplanEntities()[0];
const output = `.runtime/ga4-correction/${live ? 'live' : 'candidate'}`;
const testedSha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const report = { testedSha, mode: live ? 'live-real-collection' : 'candidate-intercepted-collection', checkedAt: new Date().toISOString(), results: [] };
await fs.mkdir(output, { recursive: true });
let server, browser;
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(check, label, timeout = 20000) {
  const start = Date.now();
  while (!check()) { assert.ok(Date.now() - start < timeout, label); await pause(100); }
}
function isCollection(url) {
  return /(^|\.)(google-analytics\.com|analytics\.google\.com)$/.test(url.hostname) && /\/collect$/.test(url.pathname);
}
function decodeFields(request) {
  const url = new URL(request.url());
  return (request.postData() || '').split('\n').map(line => {
    const fields = new URLSearchParams(url.search);
    for (const [key, value] of new URLSearchParams(line)) fields.set(key, value);
    return fields;
  });
}
const forbidden = /QA_PRIVATE_NAME|qa\.person@|202-555-0184|QA_PRIVATE_MESSAGE|QA_PRIVATE_HASH|GA4_INTERCEPTED_TOKEN|email=|phone=|message=|name=/i;
const piiQuery = '?email=qa.person%40example.invalid&phone=202-555-0184&name=QA_PRIVATE_NAME&message=QA_PRIVATE_MESSAGE#QA_PRIVATE_HASH';
const cors = { 'access-control-allow-origin': origin, 'access-control-allow-credentials': 'true', 'access-control-allow-methods': 'GET, POST, OPTIONS', 'access-control-allow-headers': 'content-type' };
async function ready(page, route) {
  await page.waitForFunction(path => location.pathname === path && window.wpbAnalyticsQueue?.some(e => e.eventName === 'page_view'), route);
  if (route === '/' || route === '/buildings/') await page.locator(`[data-commercial-guide="${route === '/' ? 'home' : 'buildings'}"]`).waitFor({ state: 'attached' });
  if (route === '/projects/olara/' || route === '/floorplans/') await page.locator('#wpb-floorplan-guides').waitFor({ state: 'attached' });
  assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), production + route);
  assert.equal(await page.getByRole('heading', { level: 1 }).count(), 1);
}
async function widthTest(width) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, serviceWorkers: 'block' });
  const evidence = { width, status: 'running', records: [], blockedUnsafeRequests: 0, blockedChecks: [], interceptedLeads: 0, checks: [] };
  report.results.push(evidence);
  let approved = false, transmit = live, tags = 0, tagResponses = 0, stage = 'fresh context', payload;
  const requests = new WeakMap();
  const violations = [];
  await context.addInitScript(() => {
    window.__ga4QaDocument = crypto.randomUUID();
    // Browser-only fixture; the real lead endpoint is intercepted unconditionally.
    window.turnstile = { render: (_slot, options) => { queueMicrotask(() => options.callback('GA4_INTERCEPTED_TOKEN')); return 'intercepted'; }, reset: () => {} };
  });
  context.on('response', response => {
    const url = new URL(response.url());
    if (url.hostname === 'www.googletagmanager.com' && url.pathname === '/gtag/js' && response.ok()) tagResponses++;
    for (const record of requests.get(response.request()) || []) record.responseStatus = response.status();
  });
  context.on('requestfailed', request => {
    for (const record of requests.get(request) || []) record.networkFailure = true;
  });
  await context.route('**/*', async route => {
    const request = route.request(), url = new URL(request.url());
    if (isCollection(url)) {
      try {
        assert.ok(approved, 'Collection before consent');
        if (request.method() === 'OPTIONS' && !transmit) return route.fulfill({ status: 204, headers: cors, body: '' });
        const records = [];
        for (const fields of decodeFields(request)) {
          assert.ok(!forbidden.test([...fields.values()].join('\n')), 'PII entered Google transport');
          assert.equal(fields.get('tid'), measurement, 'Unexpected collection destination');
          const location = new URL(fields.get('dl'));
          assert.equal(location.origin, origin, 'Unexpected page origin');
          assert.equal(location.search + location.hash, '', 'Query or fragment entered page location');
          const referrer = fields.get('dr');
          if (referrer) { const parsed = new URL(referrer); assert.equal(parsed.search + parsed.hash, '', 'Referrer query leaked'); }
          if (fields.get('en')) records.push({ event: fields.get('en'), sequence: fields.get('_s'), measurementId: measurement, pageLocation: location.origin + location.pathname, endpointHost: url.hostname, endpointPath: url.pathname, transport: transmit ? 'real-google-network' : 'intercepted', queryAndContactPiiExcluded: true });
        }
        requests.set(request, records); evidence.records.push(...records);
        if (transmit) return route.continue();
        return route.fulfill({ status: 204, headers: cors, body: '' });
      } catch (error) {
        evidence.blockedUnsafeRequests++; violations.push('Unsafe collection blocked before network');
        const piiFields = [...new Set(decodeFields(request).flatMap(fields => [...fields].filter(([, value]) => forbidden.test(value)).map(([key]) => key)))];
        evidence.blockedChecks.push({ reason: String(error.message).split('\n')[0].slice(0,100), method: request.method(), piiFieldNames: piiFields });
        return route.abort();
      }
    }
    if (/googletagmanager\.com$/.test(url.hostname) && url.pathname === '/gtag/js') {
      tags++;
      if (!approved || url.searchParams.get('id') !== measurement) { violations.push('Unexpected Google tag load'); return route.abort(); }
      return route.continue(); // The actual Google tag is NEVER mocked or replaced.
    }
    if (url.origin === origin && url.pathname === '/api/leads' && request.method() === 'POST') {
      payload = request.postDataJSON(); evidence.interceptedLeads++;
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true,"leadId":"ga4-intercepted"}' });
    }
    if (url.pathname.startsWith('/api/')) return route.abort();
    if (/challenges\.cloudflare\.com$/.test(url.hostname)) return route.fulfill({ status: 200, contentType: 'text/javascript', body: '' });
    if (/googleadservices\.com$|doubleclick\.net$/.test(url.hostname)) { violations.push('Unexpected advertising request'); return route.abort(); }
    return route.continue();
  });
  const page = await context.newPage();
  const pageViews = path => evidence.records.filter(e => e.event === 'page_view' && e.pageLocation === origin + path);
  async function onePageView(path) {
    await until(() => pageViews(path).some(e => e.responseStatus >= 200 && e.responseStatus < 300 && !e.networkFailure), 'Google page_view response missing');
    await pause(2200);
    assert.equal(pageViews(path).length, 1, 'Duplicate page_view collection');
    const queue = await page.evaluate(() => {
      const commands = (window.dataLayer || []).filter(e => ['config', 'event', 'consent', 'js'].includes(e?.[0]));
      return { nativeArguments: commands.every(e => Object.prototype.toString.call(e) === '[object Arguments]'), configs: commands.filter(e => e[0] === 'config').length, consent: commands.find(e => e[0] === 'consent' && e[1] === 'default')?.[2], scripts: document.querySelectorAll('script[data-wpb-ga4]').length };
    });
    assert.equal(queue.nativeArguments, true, 'Actual application commands must be Arguments objects');
    assert.equal(queue.configs, 1); assert.equal(queue.scripts, 1);
    assert.deepEqual(queue.consent, { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
  }
  async function clickPath(path) {
    if (path === '/buildings/' && !(await page.locator('a[href="/buildings/"]:visible').count())) {
      await page.getByRole('link', { name: 'WPB New Construction home', exact: true }).click(); await ready(page, '/');
    }
    await page.locator(`a[href="${path}"]:visible`).first().click(); await ready(page, path);
  }
  try {
    await page.goto(origin + '/' + piiQuery, { waitUntil: 'domcontentloaded' }); await ready(page, '/');
    await page.getByRole('button', { name: 'Allow analytics', exact: true }).waitFor();
    await pause(1800);
    assert.equal(tags, 0); assert.equal(evidence.records.length, 0); assert.equal(violations.length, 0);
    assert.equal(await page.locator('script[data-wpb-ga4]').count(), 0);
    assert.equal(await page.evaluate(() => window.wpbAnalyticsConsent), 'unset');
    evidence.checks.push({ check: 'before-consent', tagLoads: 0, collectionRequests: 0 });
    stage = 'consent and initial real page view'; approved = true;
    await page.getByRole('button', { name: 'Allow analytics', exact: true }).click();
    await onePageView('/'); assert.equal(tags, 1); assert.equal(tagResponses, 1);
    evidence.checks.push({ check: 'consent', primaryTagLoads: 1, nativeArguments: true, adStorage: 'denied', adUserData: 'denied', adPersonalization: 'denied' });
    const documents = new Set([await page.evaluate(() => window.__ga4QaDocument)]);
    await page.screenshot({ path: `${output}/home-${width}.png` });
    for (const path of ['/buildings/', '/projects/olara/', plan.path]) {
      stage = 'navigation ' + path;
      await clickPath(path); await onePageView(path);
      documents.add(await page.evaluate(() => window.__ga4QaDocument));
      assert.equal(tags, documents.size, 'Only one primary Google tag load per document');
      assert.equal(tagResponses, documents.size);
      if (path === '/buildings/') assert.ok(await page.evaluate(() => { const d = document.querySelector('.buildings-directory'), g = document.querySelector('[data-commercial-guide="buildings"]'); return !!(d && g && (d.compareDocumentPosition(g) & Node.DOCUMENT_POSITION_FOLLOWING)); }));
      if (path === plan.path) { await page.locator('.fp-drawing img').evaluate(img => img.decode()); assert.equal(await page.locator('.fp-drawing img').getAttribute('src'), plan.preview); }
      await page.screenshot({ path: `${output}/${path.replaceAll('/', '-').replace(/^-|-$/g, '')}-${width}.png` });
    }
    await pause(2000);
    for (const path of ['/', '/buildings/', '/projects/olara/', plan.path]) assert.equal(pageViews(path).length, 1);
    evidence.checks.push({ check: 'tracked-navigation', pageViews: 4, duplicatePageViews: false, nativeDocumentCount: documents.size, tagLoads: tags });

    // Actual-tag serialization with contact fields present; synthetic conversions
    // and lead requests never reach Google or the real lead endpoint.
    transmit = false;
    async function submit(expected, project) {
      const form = page.locator('.inquiry-form'); await form.waitFor();
      await page.waitForFunction(value => document.querySelector('.inquiry-form [name="lead_capture_context"]')?.value === value, expected);
      assert.equal(await form.locator('[name="project"]').inputValue(), expected.startsWith('floorplan:') ? 'olara' : '');
      const interest = expected.endsWith('pricing-packet') ? 'Request private floor-plan packet' : 'Request current availability';
      assert.equal(await form.locator('[name="interest"]').inputValue(), interest);
      await form.locator('[name="project"]').selectOption(project);
      await form.locator('[name="name"]').fill('QA_PRIVATE_NAME');
      await form.locator('[name="email"]').fill('qa.person@example.invalid');
      await form.locator('[name="phone"]').fill('202-555-0184');
      await form.locator('[name="message"]').fill('QA_PRIVATE_MESSAGE');
      await form.locator('[name="consent"]').check();
      await form.locator('[name="turnstile_token"]').evaluate(input => input.value = 'GA4_INTERCEPTED_TOKEN');
      const before = evidence.records.length; payload = undefined;
      await form.locator('button[type="submit"]').click();
      await until(() => Boolean(payload), 'Intercepted lead POST missing');
      assert.equal(payload.cta_context, expected); assert.equal(payload.lead_capture_context, expected);
      assert.equal(payload.project, project); assert.equal(payload.interest, interest);
      assert.equal(payload.landing_page, origin + '/');
      if (!expected.startsWith('floorplan:')) { assert.notEqual(payload.project_name, 'Olara'); assert.ok(!payload.corridor); }
      for (const event of ['contact_form_submit', 'lead_form_submit_success']) {
        await until(() => evidence.records.slice(before).some(e => e.event === event), 'Actual Google tag did not serialize inquiry event');
        await pause(1200);
        assert.equal(evidence.records.slice(before).filter(e => e.event === event).length, 1, 'Duplicate inquiry analytics event');
      }
      assert.equal(await page.evaluate(() => /QA_PRIVATE_NAME|qa\.person@|202-555-0184|QA_PRIVATE_MESSAGE|GA4_INTERCEPTED_TOKEN/.test(JSON.stringify([window.wpbAnalyticsQueue, window.dataLayer]))), false);
      evidence.checks.push({ check: 'inquiry', context: expected, project, actualTagEvents: true, collectionIntercepted: true, payloadVerified: true, contactPiiExcluded: true });
      payload = undefined;
    }
    stage = 'floorplan inquiry';
    await page.locator('[data-fp-action="availability"][data-fp-placement="intro"]').click(); await ready(page, '/inquire/');
    await submit('floorplan:olara:residence-d', 'olara');
    for (const [source, intent] of [['home', 'availability'], ['buildings', 'pricing-packet'], ['home', 'pricing-packet'], ['buildings', 'availability']]) {
      stage = 'commercial inquiry ' + source + ' ' + intent;
      await clickPath(source === 'home' ? '/' : '/buildings/');
      await page.locator(`[data-commercial-origin="${source}"][data-commercial-intent="${intent}"]:visible`).click(); await ready(page, '/inquire/');
      await submit(`commercial:${source}:${intent}`, 'south-flagler-house');
    }
    assert.equal(evidence.interceptedLeads, 5); assert.equal(violations.length, 0);
    assert.equal(evidence.blockedUnsafeRequests, 0);
    evidence.status = 'pass';
  } catch (error) {
    evidence.status = 'fail'; evidence.stage = stage; evidence.errorType = error.name;
    evidence.sourceLine = error.stack?.match(/check-ga4-network.mjs:(\d+)/)?.[1];
    evidence.safeCounts = { tags, tagResponses, violations: violations.length };
    evidence.localPageViews = await page.evaluate(() => (window.wpbAnalyticsQueue || []).filter(e => e.eventName === 'page_view').map(e => ({ path: e.payload.path })));
    process.exitCode = 1;
  } finally { await context.close(); }

  const rejected = await browser.newContext({ viewport: { width, height: 900 }, serviceWorkers: 'block' });
  let rejectTags = 0, rejectCollections = 0;
  await rejected.route('**/*', route => {
    const url = new URL(route.request().url());
    if (isCollection(url)) { rejectCollections++; return route.abort(); }
    if (/googletagmanager\.com$/.test(url.hostname)) { rejectTags++; return route.abort(); }
    if (url.pathname.startsWith('/api/')) return route.abort();
    return route.continue();
  });
  try {
    const page = await rejected.newPage(); await page.goto(origin + '/'); await ready(page, '/');
    await page.getByRole('button', { name: 'No thanks', exact: true }).click();
    for (const path of ['/buildings/', '/projects/olara/', plan.path]) { await page.goto(origin + path); await ready(page, path); await pause(1200); }
    assert.equal(rejectTags, 0); assert.equal(rejectCollections, 0);
    assert.equal(await page.evaluate(() => window.wpbAnalyticsConsent), 'denied');
    report.results.push({ width, check: 'fresh-rejection-persists', status: 'pass', tagLoads: rejectTags, collectionRequests: rejectCollections });
  } catch (error) { report.results.push({ width, check: 'fresh-rejection-persists', status: 'fail', errorType: error.name, tagLoads: rejectTags, collectionRequests: rejectCollections }); process.exitCode = 1; }
  finally { await rejected.close(); }
}
async function liveHealth() {
  const paths = ['/', '/buildings/', '/floorplans/', plan.path, '/projects/olara/', '/inquire/', '/map/'];
  for (const path of paths) {
    const response = await fetch(production + path); assert.equal(response.status, 200);
    const text = await response.text();
    assert.ok(text.includes(`href="${production + path}"`));
    assert.match(text, /<title>[^<]{10,}<\/title>/); assert.match(text, /name="description"/); assert.match(text, /<h1\b/);
    if (['/floorplans/', '/projects/olara/'].includes(path)) assert.ok(text.includes(`href="${plan.path}"`));
  }
  const sitemap = await (await fetch(production + '/sitemap.xml')).text();
  assert.equal(sitemap.split(`<loc>${plan.canonical}</loc>`).length - 1, 1);
  assert.ok(!sitemap.includes('/floorplans/alba-palm-beach/residence-d/'));
  assert.equal((await fetch(production + '/floorplans/alba-palm-beach/residence-d/')).status, 404);
  for (const resource of [plan.pdf, plan.preview]) {
    const response = await fetch(production + resource); assert.equal(response.status, 200);
    const hash = bytes => createHash('sha256').update(bytes).digest('hex');
    assert.equal(hash(Buffer.from(await response.arrayBuffer())), hash(await fs.readFile('public' + resource)));
  }
  report.results.push({ check: 'live-pages-assets-sitemap', status: 'pass', paths, albaStatus: 404, approvedAssetBytesMatch: true });
  for (const width of [1440, 390]) for (const path of ['/', '/map/']) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    await context.route('**/*', route => { const u = new URL(route.request().url()); return /google-analytics\.com$|googletagmanager\.com$/.test(u.hostname) || u.pathname.startsWith('/api/') ? route.abort() : route.continue(); });
    try {
      const page = await context.newPage(); let loaders = 0;
      page.on('response', r => { const u = new URL(r.url()); if (u.hostname === 'maps.googleapis.com' && u.pathname === '/maps/api/js' && r.ok()) loaders++; });
      await page.goto(production + path); await ready(page, path);
      await page.getByRole('button', { name: 'No thanks', exact: true }).click();
      const card = page.locator('.home-hero-map-card:visible').first(); await card.scrollIntoViewIfNeeded();
      await page.waitForFunction(() => [...document.querySelectorAll('.home-hero-map-card')].some(c => !c.closest('[data-route-view]')?.hidden && c.getAttribute('data-map-state') === 'ready' && !c.querySelector('.gm-err-container') && [...c.querySelectorAll('.gm-style img')].some(i => { try { const u = new URL(i.currentSrc || i.src); return /(^|\.)(googleapis\.com|google\.com|gstatic\.com)$/.test(u.hostname) && /\/vt(?:\/|$)|\/maps\/vt|\/kh\/|\/maps\/tiles/.test(u.pathname) && i.complete && i.naturalWidth >= 128; } catch { return false; } })), null, { timeout: 30000 });
      assert.ok(loaders > 0);
      const before = await card.locator('.gm-style img').evaluateAll(images => images.filter(i => i.complete && i.naturalWidth >= 128).map(i => i.currentSrc || i.src));
      await card.getByRole('button', { name: 'Zoom in', exact: true }).click();
      await page.waitForFunction(old => [...document.querySelectorAll('.home-hero-map-card')].filter(c => !c.closest('[data-route-view]')?.hidden).flatMap(c => [...c.querySelectorAll('.gm-style img')]).some(i => i.complete && i.naturalWidth >= 128 && !old.includes(i.currentSrc || i.src)), before);
      if (path === '/map/') { const button = page.locator('[data-map-filter="corridor"][data-map-filter-value="north-flagler"]'); await button.click(); assert.equal(await button.getAttribute('aria-pressed'), 'true'); }
      await card.screenshot({ path: `${output}/maps-${path === '/' ? 'home' : 'map'}-${width}.png` });
      report.results.push({ check: 'live-real-maps', width, path, status: 'pass', actualTiles: true, zoomChangedTiles: true });
    } finally { await context.close(); }
  }
}
try {
  if (!live) {
    server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '4173', '--strictPort'], { stdio: 'ignore' });
    let available = false;
    for (let n = 0; n < 120; n++) { try { if ((await fetch(origin)).ok) { available = true; break; } } catch {} await pause(250); }
    assert.ok(available, 'Candidate server unavailable');
  }
  browser = await chromium.launch({ headless: true });
  for (const width of [1440, 390]) await widthTest(width);
  if (live) await liveHealth();
} catch (error) {
  report.results.push({ status: 'fail', check: 'harness-or-health', errorType: error.name, sourceLine: error.stack?.match(/check-ga4-network.mjs:(\d+)/)?.[1] }); process.exitCode = 1;
} finally {
  await browser?.close(); server?.kill('SIGTERM');
  report.status = report.results.length && report.results.every(r => r.status === 'pass') ? 'pass' : 'fail';
  await fs.writeFile(`${output}/results.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
  if (report.status !== 'pass') process.exitCode = 1;
}
