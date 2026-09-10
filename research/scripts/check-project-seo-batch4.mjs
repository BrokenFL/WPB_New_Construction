import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import http from "node:http";
import { normalizeRequestIntent } from "../../shared/request-intents.js";

const root = process.cwd();
const dist = path.join(root, "dist");
const records = JSON.parse(await fs.readFile(path.join(root, "public/data/project-seo-batch4.json"), "utf8"));
const artifactDir = path.join(root, ".runtime/phase-2-project-seo");
await fs.mkdir(artifactDir, { recursive: true });

const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".svg": "image/svg+xml", ".pdf": "application/pdf", ".woff2": "font/woff2", ".xml": "application/xml" };
const actions = {
  availability: "Request current availability",
  "pricing-packet": "Pricing + floor-plan packet",
};
const normalizeHeadingText = (value) => String(value ?? "").replace(/[‘’]/g, "'").replace(/\s+/g, " ").trim();

async function htmlAt(record) {
  return fs.readFile(path.join(dist, record.path.slice(1), "index.html"), "utf8");
}

async function staticChecks() {
  const sitemap = await fs.readFile(path.join(dist, "sitemap.xml"), "utf8");
  for (const record of records) {
    const html = await htmlAt(record);
    assert.ok(html.includes(`<title>${record.title.replace(/&/g, "&amp;")}</title>`) || html.includes(`<title>${record.title}</title>`));
    assert.ok(html.includes(`rel="canonical" href="${record.canonical}"`));
    assert.equal((html.match(/<h1(?:\s[^>]*)?>/g) ?? []).length, 1);
    assert.ok(html.includes(record.h1.replace(/&/g, "&amp;")) || html.includes(record.h1));
    assert.ok(html.includes('id="wpb-project-seo-batch4"'));
    assert.ok(html.includes('data-project-growth-action="availability"'));
    assert.ok(html.includes('data-project-growth-action="pricing-packet"'));
    assert.ok(html.includes("Marketing status") && html.includes("Construction status") && html.includes("Residence availability"));
    assert.ok(html.includes(record.reviewedOn));
    const schemaMatch = html.match(/id="wpb-static-structured-data"[^>]*>([\s\S]*?)<\/script>/);
    assert.ok(schemaMatch, `${record.path}: schema missing`);
    const schema = JSON.parse(schemaMatch[1]);
    const graph = schema["@graph"] ?? [];
    const page = graph.find((node) => node["@type"] === "WebPage" || node["@type"] === "CollectionPage");
    assert.equal(page?.name, record.h1);
    assert.equal(page?.dateModified, record.reviewedOn);
    const locIndex = sitemap.indexOf(`<loc>${record.canonical}</loc>`);
    assert.ok(locIndex >= 0, `${record.path}: sitemap missing`);
    const block = sitemap.slice(locIndex, sitemap.indexOf("</url>", locIndex));
    assert.ok(block.includes(`<lastmod>${record.reviewedOn}</lastmod>`), `${record.path}: lastmod`);
  }
}

async function serveDist() {
  const server = http.createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
      let file = path.resolve(dist, `.${pathname}`);
      if (file !== dist && !file.startsWith(`${dist}${path.sep}`)) throw new Error("Invalid path");
      const stat = await fs.stat(file);
      if (stat.isDirectory()) file = path.join(file, "index.html");
      res.setHeader("Content-Type", mime[path.extname(file)] ?? "application/octet-stream");
      res.end(await fs.readFile(file));
    } catch {
      res.writeHead(404); res.end("Not found");
    }
  });
  await new Promise((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
  return { server, origin: `http://127.0.0.1:${server.address().port}` };
}

async function browserChecks() {
  const { chromium } = await import("playwright");
  const { server, origin } = await serveDist();
  const results = [];
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    for (const javaScriptEnabled of [false, true]) {
      for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
        const context = await browser.newContext({ javaScriptEnabled, viewport });
        const submissions = [];
        let googleRequests = 0;
        let firstTouchLanding;
        await context.route("**/*", async (route) => {
          const request = route.request();
          const url = new URL(request.url());
          if (url.origin === origin && url.pathname === "/api/leads" && request.method() === "POST") {
            submissions.push(request.postDataJSON());
            return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, leadId: "intercepted-batch4" }) });
          }
          if (url.origin === origin && !url.pathname.startsWith("/api/")) return route.continue();
          if (/googletagmanager|google-analytics/.test(url.hostname)) googleRequests += 1;
          return route.fulfill({ status: 200, contentType: "text/javascript", body: "" });
        });
        const page = await context.newPage();
        const errors = [];
        page.on("pageerror", (error) => errors.push(error.message));

        const submitBatch4Request = async (record, action, transition) => {
          const interest = actions[action];
          const requestIntent = normalizeRequestIntent(interest);
          assert.ok(requestIntent, `${transition}: unknown request intent`);
          await page.goto(`${origin}${record.path}`, { waitUntil: "networkidle" });
          const actionLink = page.locator(`#wpb-project-seo-batch4 [data-project-growth-action="${action}"]`);
          await actionLink.waitFor();
          const href = await actionLink.getAttribute("href");
          assert.ok(href, `${transition}: inquiry href missing`);
          const expected = new URL(href, origin);
          assert.equal(expected.pathname, "/inquire/", `${transition}: CTA path`);
          assert.equal(expected.searchParams.get("project"), record.projectId, `${transition}: CTA project alias`);
          assert.equal(expected.searchParams.get("interest"), interest, `${transition}: CTA interest`);
          await actionLink.click();
          await page.waitForURL((url) => url.origin === origin && url.pathname === "/inquire/");
          const inquiryUrl = new URL(page.url());
          assert.equal(inquiryUrl.searchParams.get("project"), record.projectId, `${transition}: request project alias`);
          assert.equal(inquiryUrl.searchParams.get("interest"), interest, `${transition}: request interest`);
          const form = page.locator('.inquiry-form[data-batch6-intent-wired="true"]');
          await form.waitFor({ state: "visible" });
          assert.equal(await form.locator('[name="project"]').inputValue(), record.slug, `${transition}: canonical form project`);
          assert.equal(await form.locator('[name="interest"]').inputValue(), requestIntent.interest, `${transition}: current form interest`);
          await form.locator('[name="name"]').fill("Batch 4 QA Example");
          await form.locator('[name="email"]').fill("batch4-qa@example.invalid");
          await form.locator('[name="phone"]').fill("202-555-0188");
          await form.locator('[name="message"]').fill("BATCH4_TEST_MESSAGE_DO_NOT_SEND");
          await form.locator('[name="consent"]').check();
          await form.locator('[name="turnstile_token"]').evaluate((input) => { input.value = "BATCH4_INTERCEPTED_TOKEN"; });
          const before = submissions.length;
          const response = page.waitForResponse((response) => response.url() === `${origin}/api/leads` && response.request().method() === "POST");
          await form.locator('button[type="submit"]').click();
          await response;
          assert.equal(submissions.length, before + 1, `${transition}: exactly one intercepted submission`);
          const payload = submissions.at(-1);
          assert.equal(payload.project, record.slug, `${transition}: canonical payload project`);
          assert.equal(payload.interest, requestIntent.interest, `${transition}: current payload interest`);
          assert.equal(payload.request_intent, requestIntent.id, `${transition}: current payload intent`);
          const sourcePage = new URL(payload.source_page);
          assert.equal(sourcePage.pathname, "/inquire/", `${transition}: source page path`);
          assert.equal(sourcePage.searchParams.get("project"), record.projectId, `${transition}: source page alias`);
          assert.equal(sourcePage.searchParams.get("interest"), interest, `${transition}: source page interest`);
          if (firstTouchLanding === undefined) firstTouchLanding = payload.landing_page;
          assert.equal(payload.landing_page, firstTouchLanding, `${transition}: first-touch landing page changed`);
          const analytics = await page.evaluate(() => JSON.stringify([window.wpbAnalyticsQueue, window.dataLayer]));
          assert.doesNotMatch(analytics, /Batch 4 QA Example|batch4-qa@|202-555-0188|BATCH4_TEST_MESSAGE_DO_NOT_SEND|BATCH4_INTERCEPTED_TOKEN/, `${transition}: contact PII leaked to analytics`);
          results.push({ project: record.slug, requestAlias: record.projectId, width: viewport.width, action, transition, interceptedSubmission: "pass", legacyUrlInterest: interest, interest: requestIntent.interest });
        };

        for (const record of records) {
          await page.goto(`${origin}${record.path}`, { waitUntil: "networkidle" });
          await page.locator("#wpb-project-seo-batch4").waitFor();

          // Batch 5 corrected project heading semantics by demoting the compact
          // duplicate heading and keeping the canonical hero/project identity as
          // the single H1. Validate the active semantic structure rather than the
          // old Batch 4 heading-slot selector so this regression cannot reintroduce
          // the duplicate-H1 architecture.
          const activeMain = page.locator("main:visible");
          assert.equal(await activeMain.count(), 1, `${record.path}: one active main`);
          const activeH1 = activeMain.locator("h1:visible");
          assert.equal(await activeH1.count(), 1, `${record.path}: one active visible H1`);
          const accessibleH1 = page.getByRole("heading", { level: 1 });
          assert.equal(await accessibleH1.count(), 1, `${record.path}: one accessibility-tree H1`);
          assert.equal(await activeH1.isVisible(), true, `${record.path}: active H1 visible`);

          const schemaScript = page.locator('#wpb-static-structured-data[type="application/ld+json"]');
          assert.equal(await schemaScript.count(), 1, `${record.path}: canonical schema available for project identity`);
          const schema = JSON.parse(await schemaScript.textContent());
          const graph = schema["@graph"] ?? [];
          const projectEntity = graph.find((node) => node["@id"] === `${record.canonical}#project`);
          assert.ok(projectEntity?.name, `${record.path}: canonical project identity missing from schema`);
          const expectedProjectIdentity = normalizeHeadingText(projectEntity.name);
          const activeH1Text = normalizeHeadingText(await activeH1.innerText());
          const accessibleH1Text = normalizeHeadingText(await accessibleH1.innerText());
          assert.ok(activeH1Text.startsWith(expectedProjectIdentity), `${record.path}: H1 must preserve canonical project identity (${expectedProjectIdentity}); got ${activeH1Text}`);
          assert.equal(accessibleH1Text, activeH1Text, `${record.path}: visible and accessibility-tree H1 must agree`);

          assert.equal(await page.locator('link[rel="canonical"]').getAttribute("href"), record.canonical);
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), true, `${record.path}: overflow`);
          const pageActions = page.locator(".p2-project-guide__actions a");
          assert.equal(await pageActions.count(), 2);
          for (let index = 0; index < 2; index += 1) assert.ok((await pageActions.nth(index).boundingBox())?.height >= 44);
          await page.screenshot({ path: path.join(artifactDir, `${record.projectId}-${viewport.width}-${javaScriptEnabled ? "js" : "nojs"}.png`), fullPage: true });
          results.push({ path: record.path, width: viewport.width, javaScriptEnabled, presentation: "pass", activeH1: activeH1Text, projectIdentity: expectedProjectIdentity });

          if (!javaScriptEnabled) continue;
          await page.waitForFunction(() => typeof window.wpbSetAnalyticsConsent === "function");
          await page.evaluate(() => window.wpbSetAnalyticsConsent?.("denied"));
          await submitBatch4Request(record, "availability", `${record.projectId}:availability->pricing setup`);
          await submitBatch4Request(record, "pricing-packet", `${record.projectId}:availability->pricing`);
        }

        if (javaScriptEnabled && viewport.width === 1440) {
          const rosewood = records.find((record) => record.projectId === "rosewood");
          const maison = records.find((record) => record.projectId === "maison-dor");
          assert.ok(rosewood && maison);

          // At this point the same browser session ends on Maison pricing. These
          // additional transitions exercise the reverse directions and project
          // switching without resetting storage or creating a fresh context.
          await submitBatch4Request(maison, "availability", "D maison pricing->availability");
          await submitBatch4Request(rosewood, "pricing-packet", "F maison->rosewood");
          await submitBatch4Request(rosewood, "availability", "B rosewood pricing->availability");

          // Existing explicit Olara query flow -> Batch 4. This intentionally
          // reuses the same context and first-touch storage.
          await page.goto(`${origin}/inquire/?project=olara&interest=availability`, { waitUntil: "networkidle" });
          const legacyForm = page.locator(".inquiry-form");
          await legacyForm.waitFor({ state: "visible" });
          assert.equal(await legacyForm.locator('[name="project"]').inputValue(), "olara", "G legacy Olara canonical project");
          assert.equal(await legacyForm.locator('[name="interest"]').inputValue(), "Request current availability", "G legacy Olara interest");
          await submitBatch4Request(maison, "pricing-packet", "G Olara->Batch4");

          // Batch 4 -> existing clean-URL corridor request. Corridor attribution
          // intentionally lives in the shared request store rather than query
          // parameters; verify it replaces Batch 4 state without stale project or
          // packet intent, while retaining the first-touch session.
          await page.goto(`${origin}/corridors/south-flagler/`, { waitUntil: "networkidle" });
          const corridorLink = page.locator('a[data-corridor-origin="south-flagler"][data-corridor-intent="availability"]').first();
          await corridorLink.waitFor();
          assert.equal(new URL(await corridorLink.getAttribute("href"), origin).pathname, "/inquire/", "H corridor clean inquiry URL");
          await corridorLink.click();
          await page.waitForURL((url) => url.origin === origin && url.pathname === "/inquire/");
          const corridorForm = page.locator(".inquiry-form");
          await corridorForm.waitFor({ state: "visible" });
          assert.equal(await corridorForm.locator('[name="project"]').inputValue(), "", "H stale Batch 4 project cleared");
          assert.equal(await corridorForm.locator('[name="interest"]').inputValue(), "Request current availability", "H corridor interest replaces Batch 4 intent");
          assert.equal(await corridorForm.locator('[name="lead_capture_context"]').inputValue(), "corridor:south-flagler:availability", "H corridor context replaces Batch 4 context");
          results.push({ transition: "H Batch4->corridor", width: viewport.width, requestFamilySwitch: "pass" });
        }

        assert.equal(errors.length, 0, errors.join("\n"));
        assert.equal(googleRequests, 0, "No third-party analytics should leave the QA browser without consent");
        await context.close();
      }
    }
  } finally {
    await browser?.close();
    await new Promise((resolve) => server.close(resolve));
  }
  await fs.writeFile(path.join(artifactDir, "results.json"), JSON.stringify({ results }, null, 2));
  console.log(JSON.stringify({ projectSeoBatch4BrowserQA: "pass", checks: results.length }, null, 2));
}

await staticChecks();
await browserChecks();
