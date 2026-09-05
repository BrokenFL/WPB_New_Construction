import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import http from "node:http";
import { buildFloorplanEntities, floorplanSiteUrl } from "../../src/lib/floorplanEntities.ts";

const root = process.cwd();
const dist = path.join(root, "dist");
const plans = buildFloorplanEntities();
const htmlAt = (route) => fs.readFile(path.join(dist, route.slice(1), "index.html"), "utf8");
const count = (html, pattern) => [...html.matchAll(pattern)].length;

async function checkStatic() {
  const sitemap = await fs.readFile(path.join(dist, "sitemap.xml"), "utf8");
  for (const plan of plans) {
    const html = await htmlAt(plan.path);
    assert.equal(count(html, /<h1(?:\s[^>]*)?>/g), 1, `${plan.path}: H1`);
    assert.equal(count(html, /rel="canonical"/g), 1, `${plan.path}: canonical count`);
    assert.ok(html.includes(`rel="canonical" href="${plan.canonical}"`));
    assert.match(html, /name="robots" content="index,follow/);
    assert.equal(count(html, /id="wpb-floorplan-schema"/g), 1);
    assert.doesNotMatch(html, /wpb-static-structured-data/);
    const schema = JSON.parse(html.match(/id="wpb-floorplan-schema"[^>]*>([\s\S]*?)<\/script>/)[1]);
    assert.equal(schema['@graph'][0].url, plan.canonical);
    assert.equal(schema['@graph'][0].mainEntity.encoding.contentUrl, `${floorplanSiteUrl}${plan.pdf}`);
    assert.equal(schema['@graph'][1]['@type'], 'BreadcrumbList');
    for (const expected of [plan.sourceUrl, plan.reviewedOn, plan.preview, '/compare/', '/inquire/', `/projects/${plan.projectId}/`]) assert.ok(html.includes(expected), `${plan.path}: ${expected}`);
    const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/)?.[1] ?? '';
    assert.doesNotMatch(body, /href="[^"\s]*\?(?:[^"\s]*)"/);
    assert.doesNotMatch(body, /\/Users\/|\/Volumes\/|research\/|PRIVATE_SENTINEL|reviewedPlans|sourcePriority/);
    assert.equal(sitemap.split(`<loc>${plan.canonical}</loc>`).length - 1, 1);
    assert.ok(sitemap.includes(`<lastmod>${plan.updatedOn}</lastmod>`));
    const pdf = await fs.readFile(path.join(dist, plan.pdf.slice(1)));
    assert.equal(pdf.subarray(0, 5).toString(), '%PDF-');
    const preview = await fs.stat(path.join(dist, plan.preview.slice(1)));
    assert.ok(preview.size > 0 && preview.size < 1280 * 1024);
    for (const route of ['/floorplans/', `/projects/${plan.projectId}/`]) {
      const inbound = await htmlAt(route);
      assert.ok(inbound.includes(`data-floorplan-entity-link href="${plan.path}"`), `${route}: missing link`);
      assert.equal(count(inbound, /id="wpb-floorplan-guides"/g), 1);
    }
  }
  // Keep the already indexed document URL; no redirect/noindex migration here.
  assert.equal((await fs.readFile(path.join(dist, 'projects/olara/docs/floorplans/olara-residence-plan-d.pdf'))).subarray(0, 5).toString(), '%PDF-');
  console.log(JSON.stringify({ floorplanStaticQA: 'pass', entities: plans.length }));
}

async function serveDist() {
  const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.pdf': 'application/pdf', '.woff2': 'font/woff2', '.xml': 'application/xml' };
  const server = http.createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      let file = path.resolve(dist, `.${pathname}`);
      if (file !== dist && !file.startsWith(`${dist}${path.sep}`)) throw new Error('Invalid path');
      if ((await fs.stat(file)).isDirectory()) file = path.join(file, 'index.html');
      res.setHeader('Content-Type', mime[path.extname(file)] ?? 'application/octet-stream');
      res.end(await fs.readFile(file));
    } catch { res.writeHead(404); res.end('Not found'); }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  return { server, origin: `http://127.0.0.1:${server.address().port}` };
}

async function checkBrowser() {
  const { chromium } = await import('playwright');
  const artifactDir = path.join(root, '.runtime/phase-2-qa');
  await fs.mkdir(artifactDir, { recursive: true });
  const { server, origin } = await serveDist();
  let browser;
  const results = [];
  try {
    browser = await chromium.launch({ headless: true });
    for (const javaScriptEnabled of [false, true]) {
      for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
        const context = await browser.newContext({ javaScriptEnabled, viewport });
        // Never send test analytics or lead submissions to a production endpoint.
        let googleRequests = 0;
        await context.route('**/*', async (route) => {
          const url = new URL(route.request().url());
          if (url.origin === origin && !url.pathname.startsWith('/api/')) return route.continue();
          if (/googletagmanager|google-analytics/.test(url.hostname)) googleRequests++;
          return route.fulfill({ status: 200, contentType: 'text/javascript', body: '' });
        });
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', (error) => errors.push(error.message));
        for (const plan of plans) {
          await page.goto(`${origin}${plan.path}?utm_source=test%40example.com#drawing`, { waitUntil: 'networkidle' });
          await page.locator('[data-floorplan-id]').waitFor();
          assert.equal(await page.locator('h1').count(), 1);
          assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), plan.canonical);
          assert.equal(await page.locator('.fp-drawing img').evaluate((image) => image.complete && image.naturalWidth > 0), true);
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), true, `${plan.path}: overflow`);
          if (javaScriptEnabled) {
            await page.waitForFunction(() => Boolean(window.wpbAnalyticsQueue?.some((event) => event.eventName === 'page_view')));
            const events = await page.evaluate(() => window.wpbAnalyticsQueue);
            assert.doesNotMatch(JSON.stringify(events), /test@example\.com|utm_source|\?utm/);
            assert.equal(await page.locator('script[data-wpb-ga4]').count(), 0);
          }
          await page.screenshot({ path: path.join(artifactDir, `${plan.projectId}-${viewport.width}-${javaScriptEnabled ? 'js' : 'nojs'}.png`), fullPage: true });
          results.push({ path: plan.path, width: viewport.width, javaScriptEnabled, status: 'pass' });
        }
        assert.equal(googleRequests, 0, 'Analytics request before consent');
        if (javaScriptEnabled) {
          const plan = plans[0];
          await page.goto(`${origin}${plan.path}`, { waitUntil: 'networkidle' });
          await page.waitForFunction(() => typeof window.wpbSetAnalyticsConsent === 'function');
          await page.evaluate(() => window.wpbSetAnalyticsConsent('denied'));
          assert.equal(await page.locator('script[data-wpb-ga4]').count(), 0);
          assert.equal(googleRequests, 0);
          // Exercise a real native PDF download and the existing event wrapper.
          const [download] = await Promise.all([page.waitForEvent('download'), page.locator('a[download][data-fp-action="pdf"]').click()]);
          assert.equal(await download.failure(), null);
          assert.ok((await page.evaluate(() => window.wpbAnalyticsQueue)).some((event) => event.eventName === 'floor_plan_click'));
          await page.locator('a[data-fp-action="availability"]').click();
          await page.waitForURL(`${origin}/inquire/`);
          const attribution = await page.evaluate(() => JSON.parse(sessionStorage.getItem('wpbLeadAttribution') ?? '{}'));
          assert.equal(attribution.cta_context, `floorplan:${plan.projectId}:${plan.slug}`);
          assert.equal(new URL(page.url()).search, '');
          // Both crawlable and hydrated inbound navigation must survive the legacy router.
          for (const route of ['/floorplans/', `/projects/${plan.projectId}/`]) {
            await page.goto(`${origin}${route}`, { waitUntil: 'networkidle' });
            await page.locator(`a[data-floorplan-entity-link][href="${plan.path}"]`).click();
            await page.waitForURL(`${origin}${plan.path}`);
            await page.locator('[data-floorplan-id]').waitFor();
          }
          await page.evaluate(() => window.wpbSetAnalyticsConsent('granted'));
          if (process.env.FLOORPLAN_EXPECT_GA4 === '1') {
            await page.waitForFunction(() => document.querySelectorAll('script[data-wpb-ga4]').length === 1);
            assert.equal(await page.locator('script[data-wpb-ga4]').count(), 1);
          }
        }
        assert.deepEqual(errors, [], 'Browser JavaScript errors');
        await context.close();
      }
    }
    await fs.writeFile(path.join(artifactDir, 'results.json'), JSON.stringify(results, null, 2));
    console.log(JSON.stringify({ floorplanBrowserQA: 'pass', views: results.length, artifacts: '.runtime/phase-2-qa' }));
  } finally {
    await browser?.close();
    await new Promise((resolve) => server.close(resolve));
  }
}

await checkStatic();
if (process.argv.includes('--browser')) await checkBrowser();
