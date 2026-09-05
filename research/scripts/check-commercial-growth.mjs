import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { commercialPages, commercialOrigin, commercialEscape, renderCommercialGuide } from '../../src/lib/commercialContent.ts';

const dist = path.resolve('dist');
const output = '.runtime/p2-commercial';
const results = [];
await fs.mkdir(output, { recursive: true });
for (const [page, copy] of Object.entries(commercialPages)) {
  const html = await fs.readFile(path.join(dist, copy.path.slice(1), 'index.html'), 'utf8');
  assert.ok(html.includes(`<title>${commercialEscape(copy.title)}</title>`));
  assert.ok(html.includes(`<h1>${copy.heading}</h1>`));
  assert.equal((html.match(/rel="canonical"/g) ?? []).length, 1);
  assert.ok(html.includes(`rel="canonical" href="${commercialOrigin}${copy.path}"`));
  assert.equal((html.match(/type="application\/ld\+json"/g) ?? []).length, 1);
  assert.ok(html.includes(renderCommercialGuide(page)));
  assert.doesNotMatch(html, /href="[^"\s]*floorplans\/(?:olara|alba-palm-beach)\//);
  const schema = JSON.parse(html.match(/id="wpb-static-structured-data"[^>]*>([\s\S]*?)<\/script>/)[1]);
  assert.ok(schema['@graph'].some((node) => node.url === commercialOrigin + copy.path && node.name === copy.heading));
  for (const match of renderCommercialGuide(page).matchAll(/href="(\/[^"?#]*)"/g)) await fs.access(path.join(dist, match[1].slice(1), 'index.html'));
  results.push({ page, static: 'pass', canonical: commercialOrigin + copy.path, newRoutes: 0 });
}
console.log(JSON.stringify({ commercialStatic: 'pass', pages: 2 }));
if (process.argv.includes('--browser')) {
  const mime = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.png':'image/png', '.jpg':'image/jpeg', '.webp':'image/webp', '.svg':'image/svg+xml', '.woff2':'font/woff2', '.pdf':'application/pdf' };
  const server = http.createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      let file = path.resolve(dist, '.' + pathname);
      if (file !== dist && !file.startsWith(dist + path.sep)) throw new Error('Invalid path');
      if ((await fs.stat(file)).isDirectory()) file = path.join(file, 'index.html');
      res.setHeader('Content-Type', mime[path.extname(file)] ?? 'application/octet-stream');
      res.end(await fs.readFile(file));
    } catch { res.writeHead(404); res.end('Not found'); }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const { chromium } = await import('playwright');
  let browser;
  try {
    browser = await chromium.launch({ headless:true });
    for (const javaScriptEnabled of [false, true]) for (const width of [1440, 390]) {
      for (const [pageName, copy] of Object.entries(commercialPages)) {
        const context = await browser.newContext({ javaScriptEnabled, viewport:{ width, height:900 } });
        let payload;
        let analyticsRequests = 0;
        const errors = [];
        await context.route('**/*', async (route) => {
          const req = route.request();
          const url = new URL(req.url());
          if (url.origin === origin && url.pathname === '/api/leads' && req.method() === 'POST') {
            payload = req.postDataJSON();
            return route.fulfill({ status:200, contentType:'application/json', body:'{"ok":true,"leadId":"intercepted-commercial"}' });
          }
          if (/google-analytics|googletagmanager/.test(url.hostname)) analyticsRequests++;
          if (url.origin === origin && !url.pathname.startsWith('/api/')) return route.continue();
          return route.fulfill({ status:200, contentType:'text/javascript', body:'' });
        });
        const page = await context.newPage();
        page.on('pageerror', (error) => errors.push(error.message));
        await page.goto(origin + copy.path, { waitUntil:'networkidle' });
        const guide = page.locator(`[data-commercial-guide="${pageName}"]:visible`);
        await guide.waitFor();
        assert.equal(await page.title(), copy.title);
        assert.equal(await page.getByRole('heading', { level:1 }).count(), 1);
        assert.equal(await page.getByRole('heading', { level:1 }).innerText(), copy.heading);
        assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), commercialOrigin + copy.path);
        assert.equal(await page.locator('meta[name="description"]').getAttribute('content'), copy.description);
        assert.equal(await page.locator('script[type="application/ld+json"]').count(), 1);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, `${pageName} overflow`);
        const buttons = page.locator(`[data-commercial-actions="${pageName}"]:visible a`);
        assert.equal(await buttons.count(), 2);
        for (const button of await buttons.all()) assert.ok((await button.boundingBox()).height >= 44);
        assert.equal(analyticsRequests, 0, 'No analytics without consent');
        if (javaScriptEnabled) {
          // Existing photos remain part of the real CI build, never a fixture replacement.
          const broken = await page.locator(`[data-route-view="${pageName}"] img:visible`).evaluateAll((images) => images.filter((img) => img.complete && !img.naturalWidth).length);
          assert.equal(broken, 0, 'Visible image failed to load');
        }
        await page.screenshot({ path:`${output}/${pageName}-${width}-${javaScriptEnabled ? 'js' : 'nojs'}.png`, fullPage:true });
        await guide.screenshot({ path:`${output}/${pageName}-guide-${width}-${javaScriptEnabled ? 'js' : 'nojs'}.png` });
        results.push({ page:pageName, width, javaScriptEnabled, browser:'pass' });
        if (javaScriptEnabled) {
          if (pageName === 'buildings') {
            const select = page.locator('[data-project-filter-group="corridor"]');
            await select.selectOption('north-flagler');
            const cards = page.locator('[data-project-card]:visible');
            assert.ok(await cards.count() > 0);
            assert.equal(await page.locator('[data-directory-title]').innerText(), copy.heading);
            await select.selectOption('all');
            await page.locator('[data-project-filter-group="status"]').selectOption('announced-planned');
            assert.ok(await cards.count() > 0);
            await page.locator('[data-project-filter-group="status"]').selectOption('all');
          }
          for (const intent of ['availability','pricing-packet']) {
            await page.evaluate(() => { sessionStorage.removeItem('wpbLeadAttribution'); window.wpbSetAnalyticsConsent?.('granted'); });
            await page.goto(origin + copy.path, { waitUntil:'networkidle' });
            await page.locator(`[data-commercial-origin="${pageName}"][data-commercial-intent="${intent}"]:visible`).click();
            await page.waitForURL(origin + '/inquire/');
            assert.equal(new URL(page.url()).search, '');
            const form = page.locator('.inquiry-form');
            await form.waitFor({ state:'visible' });
            assert.equal(await form.locator('[name="interest"]').inputValue(), intent === 'availability' ? 'Request current availability' : 'Request private floor-plan packet');
            await form.locator('[name="project"]').selectOption('olara');
            await form.locator('[name="name"]').fill('Commercial QA Example');
            await form.locator('[name="email"]').fill('commercial-qa@example.invalid');
            await form.locator('[name="phone"]').fill('202-555-0143');
            await form.locator('[name="message"]').fill('COMMERCIAL_TEST_DO_NOT_SEND');
            await form.locator('[name="consent"]').check();
            await form.locator('[name="turnstile_token"]').evaluate((input) => { input.value = 'COMMERCIAL_INTERCEPTED_TOKEN'; });
            const response = page.waitForResponse((r) => r.url() === origin + '/api/leads' && r.request().method() === 'POST');
            await form.locator('button[type="submit"]').click();
            await response;
            await page.waitForFunction(() => window.wpbAnalyticsQueue?.some((event) => event.eventName === 'lead_form_submit_success'));
            assert.equal(payload.cta_context, `commercial:${pageName}:${intent}`);
            assert.equal(payload.lead_capture_context, payload.cta_context);
            assert.equal(payload.project, 'olara');
            assert.equal(payload.cta_location, `commercial-${pageName}-intro`);
            assert.equal(payload.landing_page, origin + copy.path);
            const analytics = await page.evaluate(() => JSON.stringify([window.wpbAnalyticsQueue, window.dataLayer]));
            assert.doesNotMatch(analytics, /Commercial QA Example|commercial-qa@|202-555-0143|COMMERCIAL_TEST_DO_NOT_SEND|COMMERCIAL_INTERCEPTED_TOKEN/);
            results.push({ page:pageName, width, intent, interceptedSubmission:'pass', analyticsPii:false });
            payload = undefined;
          }
          // Target page -> another legacy route -> target page: metadata must not leak.
          await page.goto(origin + copy.path, { waitUntil:'networkidle' });
          await page.locator('[data-commercial-guide]:visible a[href="/corridors/north-flagler/"]').click();
          await page.waitForURL(origin + '/corridors/north-flagler/');
          assert.notEqual(await page.title(), copy.title);
          await page.goBack({ waitUntil:'networkidle' });
          await page.waitForFunction((title) => document.title === title, copy.title);
        }
        assert.deepEqual(errors, [], 'Uncaught browser error');
        await context.close();
      }
    }
  } finally {
    await browser?.close();
    await new Promise((resolve) => server.close(resolve));
  }
}
await fs.writeFile(`${output}/results.json`, JSON.stringify(results, null, 2));
console.log(JSON.stringify({ commercialQA:'pass', browserViews:results.filter((r) => r.browser).length, interceptedSubmissions:results.filter((r) => r.interceptedSubmission).length }));
