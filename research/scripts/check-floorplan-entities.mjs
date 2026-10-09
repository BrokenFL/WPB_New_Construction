import { floorplanSchemaDescription } from "../../shared/project-schema-facts.mjs";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import http from "node:http";
import { buildFloorplanEntities, publishedFloorplanEntities, entityRendererPages, perPlanPageForEntity, floorplanForPath, floorplanSiteUrl, floorplanTitle, floorplanDescription, floorplanModifiedOn, escapeFloorplanHtml } from "../../src/lib/floorplanEntities.ts";
import { resolveInquiryContext } from "../../src/lib/inquiryContext.ts";

const root = process.cwd();
const dist = path.join(root, "dist");
const plans = publishedFloorplanEntities();
const browserPlans = entityRendererPages();
const htmlAt = (route) => fs.readFile(path.join(dist, route.slice(1), "index.html"), "utf8");
const count = (html, pattern) => [...html.matchAll(pattern)].length;

async function checkStatic() {
  const sitemap = await fs.readFile(path.join(dist, "sitemap.xml"), "utf8");
  for (const plan of plans) {
    const owner = perPlanPageForEntity(plan);
    const html = await htmlAt(plan.path);
    assert.ok(html.includes(`<title>${escapeFloorplanHtml(owner?.seoTitle ?? floorplanTitle(plan))}</title>`));
    assert.ok(html.includes(`name="description" content="${escapeFloorplanHtml(owner ? floorplanSchemaDescription(owner.planTitle, owner.projectName) : floorplanDescription(plan))}"`));
    assert.equal(count(html, /<h1(?:\s[^>]*)?>/g), 1, `${plan.path}: H1`);
    assert.equal(count(html, /rel="canonical"/g), 1, `${plan.path}: canonical count`);
    assert.ok(html.includes(`rel="canonical" href="${plan.canonical}"`));
    assert.match(html, /name="robots" content="index,follow/);
    assert.equal(count(html, /type="application\/ld\+json"/g), 1, `${plan.path}: one graph`);
    const schemaId = owner ? 'wpb-static-structured-data' : 'wpb-floorplan-schema';
    assert.equal(count(html, new RegExp(`id="${schemaId}"`, 'g')), 1);
    const schemaText = html.match(new RegExp(`id="${schemaId}"[^>]*>([\\s\\S]*?)<\\/script>`))?.[1];
    assert.ok(schemaText, `${plan.path}: schema`);
    const schema = JSON.parse(schemaText);
    const pageNode = schema['@graph'].find((node) => node['@type'] === 'WebPage' && node.url === plan.canonical);
    assert.ok(pageNode, `${plan.path}: canonical WebPage`);
    assert.equal(pageNode.dateModified, floorplanModifiedOn(plan));
    assert.equal(pageNode.lastReviewed, plan.reviewedOn);
    const creative = owner ? schema['@graph'].find((node) => node['@id'] === `${plan.canonical}#plan`) : pageNode.mainEntity;
    assert.ok(creative, `${plan.path}: reviewed CreativeWork`);
    if (owner) assert.equal(pageNode.mainEntity['@id'], creative['@id']);
    assert.equal(creative['@type'], 'CreativeWork');
    assert.equal(creative.isBasedOn, plan.sourceUrl);
    const encodings = [creative.encoding].flat();
    assert.equal(encodings[0].contentUrl, `${floorplanSiteUrl}${plan.pdf}`);
    assert.equal(encodings[0].encodingFormat, /\.pdf$/i.test(plan.pdf) ? 'application/pdf' : 'image/jpeg');
    assert.equal(encodings.filter((item) => item.encodingFormat === 'model/gltf-binary').length, plan.models3D.filter((model) => model.status === 'approved').length);
    for (const model of plan.models3D.filter((item) => item.status === 'approved')) {
      assert.ok(encodings.some((item) => item.contentUrl === `${floorplanSiteUrl}${model.modelUrl}`));
      const modelBytes = await fs.readFile(path.join(dist, model.modelUrl.slice(1)));
      assert.equal(modelBytes.subarray(0, 4).toString(), 'glTF');
      assert.ok((await fs.stat(path.join(dist, model.posterUrl.slice(1)))).size > 0);
    }
    assert.ok(schema['@graph'].some((node) => node['@type'] === 'BreadcrumbList'));
    assert.ok(JSON.stringify(schema).includes(`${floorplanSiteUrl}${plan.preview}`));
    for (const expected of [plan.reviewedOn, '/compare/', '/inquire/', `/projects/${plan.projectId}/`]) assert.ok(html.includes(expected), `${plan.path}: ${expected}`);
    for (const fact of [plan.bedrooms, plan.interiorSqFt.toLocaleString('en-US'), plan.terraceSqFt.toLocaleString('en-US')]) assert.ok(html.includes(escapeFloorplanHtml(fact)), `${plan.path}: missing reviewed fact ${fact}`);
    assert.ok(html.includes(escapeFloorplanHtml(plan.sourceNote)));
    const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/)?.[1] ?? '';
    const queryLinks = [...body.matchAll(/href="([^"\s]*\?[^"\s]*)"/g)].map((match) => match[1].replaceAll('&amp;', '&'));
    assert.deepEqual(queryLinks, [], `${plan.path}: no query parameters may be rendered as crawlable links`);
    const availabilityHrefs = [...body.matchAll(owner ? /<a\b(?=[^>]*data-per-plan-availability)[^>]*href="([^"]+)"/g : /<a\b(?=[^>]*data-fp-action="availability")[^>]*href="([^"]+)"/g)].map((match) => match[1]);
    assert.equal(availabilityHrefs.length, 2, `${plan.path}: two clean availability links`);
    assert.ok(availabilityHrefs.every((href) => href === '/inquire/'), `${plan.path}: availability links must be clean /inquire/ paths`);
    assert.doesNotMatch(body, /\/Users\/|\/Volumes\/|research\/|PRIVATE_SENTINEL|reviewedPlans|sourcePriority/);
    assert.equal(sitemap.split(`<loc>${plan.canonical}</loc>`).length - 1, 1);
    if (!owner) assert.ok(sitemap.includes(`<lastmod>${floorplanModifiedOn(plan)}</lastmod>`));
    const source = await fs.readFile(path.join(dist, plan.pdf.slice(1)));
    if (/\.pdf$/i.test(plan.pdf)) assert.equal(source.subarray(0, 5).toString(), '%PDF-');
    else assert.equal(source.subarray(0, 2).toString('hex'), 'ffd8');
    const preview = await fs.stat(path.join(dist, plan.preview.slice(1)));
    assert.ok(preview.size > 0 && preview.size < 1280 * 1024);
    for (const route of ['/floorplans/', `/projects/${plan.projectId}/`]) {
      const inbound = await htmlAt(route);
      assert.ok(inbound.includes(`${owner ? '' : 'data-floorplan-entity-link '}href="${plan.path}"`), `${route}: missing link`);
      if (owner) assert.ok(!inbound.includes(`data-floorplan-entity-link href="${plan.path}"`), `${route}: per-plan link must use the existing router`);
      assert.equal(count(inbound, /id="wpb-floorplan-guides"/g), 1);
      assert.equal(count(inbound, /type="application\/ld\+json"/g), 1, `${route}: one graph`);
      const graph = JSON.parse(inbound.match(/id="wpb-static-structured-data"[^>]*>([\s\S]*?)<\/script>/)[1]);
      assert.equal(graph['@graph'].filter((node) => node['@id']?.endsWith('#wpb-floorplan-guides')).length, 1);
    }
  }
  const pending = buildFloorplanEntities().find((plan) => plan.projectId === 'alba-palm-beach');
  assert.ok(pending, 'Preserve the Alba source-reviewed implementation');
  assert.equal(floorplanForPath(pending.path), undefined, 'Alba must not resolve as a public entity');
  // Alba per-plan pages are now published via the dedicated per-plan page system
  // (src/data/floorplanPlanPages.ts, keyword-map SEO), not the legacy entity renderer.
  // The entity system still suppresses its own Alba rendering; the new system owns the route.
  assert.ok(perPlanPageForEntity(pending), 'Alba remains owned by its existing per-plan page');
  await fs.access(path.join(dist, pending.path.slice(1), 'index.html'));
  assert.equal(sitemap.split(`<loc>${pending.canonical}</loc>`).length - 1, 1, 'Alba per-plan page must have one sitemap entry');
  for (const route of ['/floorplans/', '/projects/alba-palm-beach/']) {
    const html = await htmlAt(route);
    // The legacy entity system must not discover Alba; the per-plan page system may link it.
    assert.ok(!html.includes(`data-floorplan-entity-link href="${pending.path}"`), 'No pending entity discovery link');
  }
  assert.equal((await fs.readFile(path.join(dist, pending.pdf.slice(1)))).subarray(0, 5).toString(), '%PDF-');
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
        const submissions = [];
        await context.route('**/*', async (route) => {
          const url = new URL(route.request().url());
          if (url.origin === origin && url.pathname === '/api/leads' && route.request().method() === 'POST') {
            submissions.push(route.request().postDataJSON());
            return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, leadId: 'intercepted-p2-only' }) });
          }
          if (url.origin === origin && !url.pathname.startsWith('/api/')) return route.continue();
          if (/googletagmanager|google-analytics/.test(url.hostname)) googleRequests++;
          return route.fulfill({ status: 200, contentType: 'text/javascript', body: '' });
        });
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', (error) => errors.push(error.message));
        for (const plan of browserPlans) {
          await page.goto(`${origin}${plan.path}?utm_source=test%40example.com#drawing`, { waitUntil: 'networkidle' });
          await page.locator('[data-floorplan-id]').waitFor();
          assert.equal(await page.title(), floorplanTitle(plan));
          assert.equal(await page.locator('h1').count(), 1);
          assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), plan.canonical);
          assert.equal(await page.locator('.fp-drawing img').evaluate((image) => image.complete && image.naturalWidth > 0), true);
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), true, `${plan.path}: overflow`);
          const introCta = await page.locator('[data-fp-placement="intro"]').boundingBox();
          const drawing = await page.locator('.fp-drawing').boundingBox();
          assert.ok(introCta && drawing && introCta.y + introCta.height < drawing.y, 'CTA must precede, never cover, the drawing');
          assert.ok(introCta.height >= 44, 'Availability CTA has a usable touch target');
          if (javaScriptEnabled) {
            await page.waitForFunction(() => Boolean(window.wpbAnalyticsQueue?.some((event) => event.eventName === 'page_view')));
            const events = await page.evaluate(() => window.wpbAnalyticsQueue);
            assert.doesNotMatch(JSON.stringify(events), /test@example\.com|utm_source|\?utm/);
            assert.equal(await page.locator('script[data-wpb-ga4]').count(), 0);
          }
          if (javaScriptEnabled) await page.evaluate(() => window.wpbSetAnalyticsConsent?.('denied'));
          await page.screenshot({ path: path.join(artifactDir, `${plan.projectId}-${plan.slug}-${viewport.width}-${javaScriptEnabled ? 'js' : 'nojs'}.png`), fullPage: true });
          results.push({ path: plan.path, width: viewport.width, javaScriptEnabled, status: 'pass' });
        }
        assert.equal(googleRequests, 0, 'Analytics request before consent');
        if (javaScriptEnabled) {
          const plan = browserPlans[0];
          await page.goto(`${origin}${plan.path}`, { waitUntil: 'networkidle' });
          await page.waitForFunction(() => typeof window.wpbSetAnalyticsConsent === 'function');
          await page.evaluate(() => window.wpbSetAnalyticsConsent('denied'));
          assert.equal(await page.locator('script[data-wpb-ga4]').count(), 0);
          assert.equal(googleRequests, 0);
          // Exercise a real native source drawing download and the existing event wrapper.
          const [download] = await Promise.all([page.waitForEvent('download'), page.locator('a[download][data-fp-action="pdf"]').click()]);
          assert.equal(await download.failure(), null);
          assert.ok((await page.evaluate(() => window.wpbAnalyticsQueue)).some((event) => event.eventName === 'floor_plan_click'));
          await page.locator('a[data-fp-action="availability"][data-fp-placement="intro"]').click();
          await page.waitForURL(`${origin}/inquire/`);
          const attribution = await page.evaluate(() => JSON.parse(sessionStorage.getItem('wpbLeadAttribution') ?? '{}'));
          assert.equal(attribution.cta_context, `floorplan:${plan.projectId}:${plan.slug}`);
          assert.equal(new URL(page.url()).search, '');
          // Both crawlable and hydrated inbound navigation must survive the legacy router.
          for (const route of ['/floorplans/', `/projects/${plan.projectId}/`]) {
            await page.goto(`${origin}${route}`, { waitUntil: 'networkidle' });
            await page.locator(`a[data-floorplan-entity-link][href="${plan.path}"]`).waitFor();
            assert.equal(await page.locator('script[type="application/ld+json"]').count(), 1);
            const graph = await page.locator('script[type="application/ld+json"]').evaluate((script) => JSON.parse(script.textContent));
            assert.equal(graph['@graph'].filter((node) => node['@id']?.endsWith('#wpb-floorplan-guides')).length, 1);
            await page.locator(`a[data-floorplan-entity-link][href="${plan.path}"]`).click();
            await page.waitForURL(`${origin}${plan.path}`);
            await page.locator('[data-floorplan-id]').waitFor();
          }
          for (const discovered of browserPlans.slice(1)) {
            await page.goto(`${origin}/projects/${discovered.projectId}/`, { waitUntil: 'networkidle' });
            const link = page.locator(`.site-shell a[data-floorplan-entity-link][href="${discovered.path}"]`);
            await link.waitFor(); await link.click();
            await page.waitForURL(`${origin}${discovered.path}`);
            await page.waitForFunction(() => window.wpbAnalyticsQueue?.some((event) => event.eventName === 'page_view'));
            assert.equal(await page.locator('[data-floorplan-id]').getAttribute('data-floorplan-id'), discovered.planId);
            results.push({check:'native-plan-discovery',path:discovered.path,width:viewport.width,status:'pass'});
          }
          // Exercise actual browser form validation, handler and JSON POST payload,
          // not just sessionStorage. The endpoint and all external traffic are intercepted.
          for (const plan of browserPlans) {
            for (const placement of ['intro', 'facts']) {
              await page.evaluate(() => sessionStorage.removeItem('wpbLeadAttribution'));
              await page.goto(`${origin}${plan.path}`, { waitUntil: 'networkidle' });
              await page.waitForFunction(() => typeof window.wpbSetAnalyticsConsent === 'function');
              await page.evaluate(() => window.wpbSetAnalyticsConsent('granted'));
              await page.locator(`[data-fp-action="availability"][data-fp-placement="${placement}"]`).click();
              await page.waitForURL(`${origin}/inquire/`);
              const form = page.locator('.inquiry-form');
              await form.waitFor({ state: 'visible' });
              assert.equal(await form.locator('[name="project"]').inputValue(), plan.projectId);
              if (placement === 'intro') await page.screenshot({path:path.join(artifactDir, `${plan.projectId}-${plan.slug}-inquiry-${viewport.width}.png`),fullPage:true});
              await form.locator('[name="name"]').fill('P2 QA Example');
              await form.locator('[name="email"]').fill('p2-qa@example.invalid');
              await form.locator('[name="phone"]').fill('202-555-0143');
              await form.locator('[name="message"]').fill('P2_TEST_MESSAGE_DO_NOT_SEND');
              await form.locator('[name="consent"]').check();
              // Test-only token injected into the existing hidden control. Production
              // Turnstile and endpoint verification are unchanged; endpoint is intercepted.
              await form.locator('[name="turnstile_token"]').evaluate((input) => { input.value = 'P2_INTERCEPTED_TOKEN'; });
              const before = submissions.length;
              const response = page.waitForResponse((r) => r.url() === `${origin}/api/leads` && r.request().method() === 'POST');
              await form.locator('button[type="submit"]').click();
              await response;
              await page.waitForFunction(() => window.wpbAnalyticsQueue?.some((event) => event.eventName === 'lead_form_submit_success'));
              assert.equal(submissions.length, before + 1);
              const payload = submissions.at(-1);
              assert.equal(payload.project, plan.projectId);
              assert.equal(payload.interest, 'Request current availability');
              assert.equal(payload.cta_context, `floorplan:${plan.projectId}:${plan.slug}`);
              assert.equal(payload.lead_capture_context, payload.cta_context);
              assert.equal(payload.landing_page, `${origin}${plan.path}`);
              assert.equal(payload.submission_page, `${origin}/inquire/`);
              assert.equal(payload.cta_location, placement === 'intro' ? 'floorplan-entity-intro' : 'floorplan-entity');
              const analytics = await page.evaluate(() => JSON.stringify([window.wpbAnalyticsQueue, window.dataLayer]));
              assert.doesNotMatch(analytics, /P2 QA Example|p2-qa@|202-555-0143|P2_TEST_MESSAGE_DO_NOT_SEND|P2_INTERCEPTED_TOKEN/);
              results.push({ path: plan.path, width: viewport.width, placement, interceptedSubmission: 'pass', project: payload.project, planContext: payload.cta_context, analyticsPii: false });
              submissions.length = 0; // Never write test contact values into evidence.
            }
          }
          // Same-session cross-plan requests: intentionally retain the first touch.
          // Neither this sequence nor fresh requests send a lead to production.
          await page.evaluate(() => sessionStorage.removeItem('wpbLeadAttribution'));
          await page.goto(`${origin}${browserPlans[0].path}`, {waitUntil:'networkidle'});
          for (const current of [...browserPlans.slice(1), browserPlans[0]]) {
            await page.goto(`${origin}${current.path}`, {waitUntil:'networkidle'});
            await page.waitForFunction(() => window.wpbAnalyticsQueue?.some(e=>e.eventName==='page_view'));
            await page.locator('[data-fp-action="availability"][data-fp-placement="intro"]').click();
            await page.waitForURL(`${origin}/inquire/`);
            const form=page.locator('.inquiry-form'); await form.waitFor();
            await page.waitForFunction(expected=>document.querySelector('.inquiry-form [name="lead_capture_context"]')?.value===expected,`floorplan:${current.projectId}:${current.slug}`);
            assert.equal(await form.locator('[name="project"]').inputValue(),current.projectId);
            await form.locator('[name="name"]').fill('P2 QA Example');
            await form.locator('[name="email"]').fill('p2-qa@example.invalid');
            await form.locator('[name="phone"]').fill('202-555-0143');
            await form.locator('[name="message"]').fill('P2_TEST_MESSAGE_DO_NOT_SEND');
            await form.locator('[name="consent"]').check();
            await form.locator('[name="turnstile_token"]').evaluate(input=>{input.value='P2_INTERCEPTED_TOKEN';});
            const before=submissions.length;
            const response=page.waitForResponse(r=>r.url()===`${origin}/api/leads`&&r.request().method()==='POST');
            await form.locator('button[type="submit"]').click(); await response;
            await page.waitForFunction(()=>window.wpbAnalyticsQueue?.some(e=>e.eventName==='lead_form_submit_success'));
            assert.equal(submissions.length,before+1);
            const payload=submissions.at(-1);
            assert.equal(payload.project,current.projectId);assert.equal(payload.corridor,resolveInquiryContext(`floorplan:${current.projectId}:${current.slug}`).corridor);
            assert.equal(payload.interest,'Request current availability');
            assert.equal(payload.cta_context,`floorplan:${current.projectId}:${current.slug}`);
            assert.equal(payload.lead_capture_context,payload.cta_context);
            assert.equal(payload.landing_page,`${origin}${browserPlans[0].path}`);
            assert.equal(payload.submission_page,`${origin}/inquire/`);
            const events=await page.evaluate(()=>window.wpbAnalyticsQueue||[]);
            for(const name of ['contact_form_submit','lead_form_submit_success'])assert.equal(events.filter(e=>e.eventName===name).length,1);
            assert.doesNotMatch(await page.evaluate(()=>JSON.stringify([window.wpbAnalyticsQueue,window.dataLayer])),/P2 QA Example|p2-qa@|202-555-0143|P2_TEST_MESSAGE_DO_NOT_SEND|P2_INTERCEPTED_TOKEN/);
            results.push({check:'same-session-plan-switch',path:current.path,width:viewport.width,interceptedSubmission:'pass',project:payload.project,planContext:payload.cta_context,firstTouchPreserved:true,analyticsPii:false});
            submissions.length=0;
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
    console.log(JSON.stringify({ floorplanBrowserQA: 'pass', views: results.filter((r) => 'javaScriptEnabled' in r).length, interceptedSubmissions: results.filter((r) => r.interceptedSubmission).length, artifacts: '.runtime/phase-2-qa' }));
  } catch(error) {
    results.push({check:'failure',status:'fail',type:error.name,message:String(error.message).slice(0,500)});
    await fs.writeFile(path.join(artifactDir,'results.json'),JSON.stringify(results,null,2));
    throw error;
  } finally {
    await browser?.close();
    await new Promise((resolve) => server.close(resolve));
  }
}

await checkStatic();
if (process.argv.includes('--browser')) await checkBrowser();
