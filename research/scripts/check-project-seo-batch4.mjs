import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import http from "node:http";

const root = process.cwd();
const dist = path.join(root, "dist");
const records = JSON.parse(await fs.readFile(path.join(root, "public/data/project-seo-batch4.json"), "utf8"));
const artifactDir = path.join(root, ".runtime/phase-2-project-seo");
await fs.mkdir(artifactDir, { recursive: true });

const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".svg": "image/svg+xml", ".pdf": "application/pdf", ".woff2": "font/woff2", ".xml": "application/xml" };

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

        for (const record of records) {
          await page.goto(`${origin}${record.path}`, { waitUntil: "networkidle" });
          await page.locator("#wpb-project-seo-batch4").waitFor();
          // The crawlable prerender above is required to contain exactly one H1.
          // With JavaScript enabled, the legacy single-page shell keeps multiple
          // route headings in its DOM, so verify the one canonical buyer-guide H1
          // by exact accessible name and require that exact heading to be visible.
          const canonicalH1 = page.getByRole("heading", { level: 1, name: record.h1, exact: true });
          assert.equal(await canonicalH1.count(), 1);
          assert.equal(await canonicalH1.isVisible(), true);
          assert.equal(await page.locator('link[rel="canonical"]').getAttribute("href"), record.canonical);
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), true, `${record.path}: overflow`);
          const actions = page.locator(".p2-project-guide__actions a");
          assert.equal(await actions.count(), 2);
          for (let index = 0; index < 2; index += 1) assert.ok((await actions.nth(index).boundingBox())?.height >= 44);
          await page.screenshot({ path: path.join(artifactDir, `${record.projectId}-${viewport.width}-${javaScriptEnabled ? "js" : "nojs"}.png`), fullPage: true });
          results.push({ path: record.path, width: viewport.width, javaScriptEnabled, presentation: "pass" });

          if (!javaScriptEnabled) continue;
          await page.waitForFunction(() => typeof window.wpbSetAnalyticsConsent === "function");
          await page.evaluate(() => window.wpbSetAnalyticsConsent?.("denied"));
          for (const [action, interest] of [["availability", "Request current availability"], ["pricing-packet", "Pricing + floor-plan packet"]]) {
            await page.goto(`${origin}${record.path}`, { waitUntil: "networkidle" });
            await page.locator(`#wpb-project-seo-batch4 [data-project-growth-action="${action}"]`).waitFor();
            await page.locator(`#wpb-project-seo-batch4 [data-project-growth-action="${action}"]`).click();
            await page.waitForURL(`${origin}/inquire/`);
            const form = page.locator(".inquiry-form");
            await form.waitFor({ state: "visible" });
            assert.equal(await form.locator('[name="project"]').inputValue(), record.projectId);
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
            assert.equal(submissions.length, before + 1);
            const payload = submissions.at(-1);
            assert.equal(payload.project, record.projectId);
            assert.equal(payload.interest, interest);
            assert.match(payload.cta_context ?? payload.lead_capture_context ?? "", new RegExp(record.projectId));
            const analytics = await page.evaluate(() => JSON.stringify([window.wpbAnalyticsQueue, window.dataLayer]));
            assert.doesNotMatch(analytics, /Batch 4 QA Example|batch4-qa@|202-555-0188|BATCH4_TEST_MESSAGE_DO_NOT_SEND|BATCH4_INTERCEPTED_TOKEN/);
            results.push({ project: record.projectId, width: viewport.width, action, interceptedSubmission: "pass", interest });
          }
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