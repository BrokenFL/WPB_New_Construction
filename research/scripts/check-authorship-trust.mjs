import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const origin = "http://127.0.0.1:4173";
const artifactDir = path.join(root, ".runtime/authorship-trust");
const registry = JSON.parse(await fs.readFile(path.join(root, "public/data/contributors.json"), "utf8"));
await fs.mkdir(artifactDir, { recursive: true });

const assigned = [
  { path: "/about/", person: "Brooke Snader", wording: "Written by", date: "Updated" },
  { path: "/methodology/", person: "Brooke Snader", wording: "Written by", date: "Updated" },
  { path: "/projects/rosewood-residences-west-palm-beach/", person: "Brooke Snader", wording: "Reviewed by", date: "Reviewed" },
  { path: "/projects/maison-dor/", person: "Brooke Snader", wording: "Reviewed by", date: "Reviewed" },
];

const unassigned = [
  "/corridors/south-flagler/",
  "/answers/closest-new-condos-to-palm-beach/",
  "/updates/rosewood-north-flagler-planning-board-2026-06-05/",
  "/market-notes/are-branded-residences-worth-it-west-palm-beach/",
];

const headingRegressionRoutes = [
  "/projects/olara/",
  "/corridors/south-flagler/",
  "/answers/olara-vs-ritz-carlton-vs-shorecrest/",
  "/floorplans/olara/residence-f/",
];

const server = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "preview", "--host", "127.0.0.1", "--port", "4173", "--strictPort"], {
  cwd: root,
  stdio: "ignore",
});

async function headingDiagnostics(page) {
  const totalH1 = await page.locator("h1").count();
  const visibleH1 = await page.locator("h1:visible").count();
  const accessibleH1 = await page.getByRole("heading", { level: 1 }).count();
  return {
    totalH1,
    visibleH1,
    accessibleH1,
    hiddenOrInactiveH1: Math.max(0, totalH1 - visibleH1),
  };
}

async function assertActiveHeadingContract(page, route, javaScriptEnabled) {
  const diagnostics = await headingDiagnostics(page);
  assert.equal(diagnostics.visibleH1, 1, `${route}: one visible active H1`);
  assert.equal(diagnostics.accessibleH1, 1, `${route}: one accessibility-tree H1`);

  const activeMain = page.locator("main:visible");
  assert.equal(await activeMain.count(), 1, `${route}: one active main`);
  assert.equal(await activeMain.locator("h1:visible").count(), 1, `${route}: active main owns one H1`);
  assert.ok((await activeMain.locator("h1:visible").innerText()).trim().length > 0, `${route}: active H1 has text`);

  if (!javaScriptEnabled) {
    const staticMain = page.locator("main.static-prerender");
    assert.equal(await staticMain.count(), 1, `${route}: one canonical no-JavaScript prerender main`);
    assert.equal(await staticMain.locator("h1").count(), 1, `${route}: canonical no-JavaScript prerender has one H1`);
    assert.equal(diagnostics.totalH1, 1, `${route}: no-JavaScript document contains one H1 total`);
  }
  return diagnostics;
}

async function assertCanonicalNoJsHeading(page, route) {
  const diagnostics = await headingDiagnostics(page);
  const staticMain = page.locator("main.static-prerender");
  assert.equal(await staticMain.count(), 1, `${route}: one canonical no-JavaScript prerender main`);
  assert.equal(await staticMain.locator("h1").count(), 1, `${route}: canonical no-JavaScript prerender has one H1`);
  assert.ok((await staticMain.locator("h1").innerText()).trim().length > 0, `${route}: canonical no-JavaScript H1 has text`);
  assert.equal(diagnostics.totalH1, 1, `${route}: no-JavaScript document contains one H1 total`);
  assert.equal(diagnostics.visibleH1, 1, `${route}: no-JavaScript H1 is visible`);
  assert.equal(diagnostics.accessibleH1, 1, `${route}: no-JavaScript H1 is exposed to assistive technology`);
  return diagnostics;
}

let browser;
const results = [];
try {
  let ready = false;
  for (let attempt = 0; attempt < 120; attempt += 1) {
    if (server.exitCode !== null) throw new Error("Vite preview exited before becoming ready");
    try {
      const response = await fetch(origin);
      if (response.ok) { ready = true; break; }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  assert.ok(ready, "Vite preview must become ready");
  browser = await chromium.launch({ headless: true });

  for (const javaScriptEnabled of [true, false]) {
    for (const width of [1440, 390]) {
      const context = await browser.newContext({
        viewport: { width, height: width < 600 ? 844 : 1000 },
        javaScriptEnabled,
      });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));

      for (const expected of assigned) {
        const response = await page.goto(`${origin}${expected.path}`, { waitUntil: javaScriptEnabled ? "networkidle" : "domcontentloaded" });
        assert.equal(response?.status(), 200, `${expected.path}: status`);
        const headings = await assertActiveHeadingContract(page, expected.path, javaScriptEnabled);

        const trust = page.locator("#wpb-authorship-trust");
        assert.equal(await trust.count(), 1, `${expected.path}: one trust strip in document`);
        const activeTrust = page.locator("main:visible #wpb-authorship-trust:visible");
        await activeTrust.waitFor({ state: "visible" });
        assert.equal(await activeTrust.count(), 1, `${expected.path}: one active trust strip`);
        assert.equal(await activeTrust.getAttribute("aria-label"), "Editorial responsibility");
        assert.equal(await activeTrust.locator("h1").count(), 0, `${expected.path}: authorship UI does not introduce an H1`);
        const trustText = await activeTrust.innerText();
        assert.ok(trustText.includes(expected.wording), `${expected.path}: ${expected.wording}`);
        assert.ok(trustText.includes(expected.person), `${expected.path}: person`);
        assert.ok(trustText.includes(expected.date), `${expected.path}: human date label`);
        assert.equal(await activeTrust.locator('a[href="/methodology/"]').count(), 1, `${expected.path}: methodology link`);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), true, `${expected.path}: no horizontal overflow`);
        assert.doesNotMatch(await page.locator("body").innerText(), /WPB New Construction Review Desk/i);
        assert.doesNotMatch(trustText, /@[a-z0-9.-]+\.[a-z]{2,}|\b\d{3}[-.)\s]+\d{3}[-.\s]+\d{4}\b/i, `${expected.path}: no contact PII in trust strip`);

        const schema = page.locator('#wpb-authorship-schema[type="application/ld+json"]');
        assert.equal(await schema.count(), 1, `${expected.path}: one authorship schema`);
        const graph = JSON.parse(await schema.textContent());
        const pageNode = graph["@graph"].find((node) => /Page$/.test(String(node["@type"])));
        assert.ok(pageNode, `${expected.path}: page node`);
        assert.ok(pageNode.author || pageNode.reviewedBy, `${expected.path}: assigned person relationship`);
        assert.match(pageNode["@id"], /#authorship-webpage$/);

        if (expected.path === "/about/") {
          assert.equal(await page.locator("main:visible #wpb-contributor-profiles").count(), 1, "about: profile section on active page");
          assert.equal(await page.locator("main:visible #brooke-snader").count(), 1, "about: Brooke profile");
          assert.equal(await page.locator("main:visible #scott-gordon").count(), 1, "about: Scott profile");
          const personNodes = graph["@graph"].filter((node) => node["@type"] === "Person");
          assert.deepEqual(personNodes.map((node) => node["@id"]).sort(), registry.contributors.map((person) => person.schemaId).sort(), "about: stable Person IDs");
          assert.equal(new Set(personNodes.map((node) => node["@id"])).size, 2, "about: no duplicate Person IDs");
        }

        await page.screenshot({ path: path.join(artifactDir, `${expected.path.split("/").filter(Boolean).join("-") || "home"}-${width}-${javaScriptEnabled ? "js" : "nojs"}.png`), fullPage: true });
        results.push({ path: expected.path, width, javaScriptEnabled, attributed: true, status: "pass", headings });
      }

      for (const route of unassigned) {
        const response = await page.goto(`${origin}${route}`, { waitUntil: javaScriptEnabled ? "networkidle" : "domcontentloaded" });
        assert.equal(response?.status(), 200, `${route}: status`);
        const headings = javaScriptEnabled ? await headingDiagnostics(page) : await assertCanonicalNoJsHeading(page, route);
        assert.equal(await page.locator("#wpb-authorship-trust").count(), 0, `${route}: no invented visible attribution`);
        assert.equal(await page.locator("#wpb-authorship-schema").count(), 0, `${route}: no invented attribution schema`);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), true, `${route}: no horizontal overflow`);
        results.push({ path: route, width, javaScriptEnabled, attributed: false, status: "pass", headings });
      }

      for (const route of headingRegressionRoutes) {
        const response = await page.goto(`${origin}${route}`, { waitUntil: javaScriptEnabled ? "networkidle" : "domcontentloaded" });
        assert.equal(response?.status(), 200, `${route}: heading regression status`);
        const headings = await assertActiveHeadingContract(page, route, javaScriptEnabled);
        results.push({ path: route, width, javaScriptEnabled, headingRegression: true, status: "pass", headings });
      }

      if (javaScriptEnabled) assert.deepEqual(errors, [], `browser errors at width ${width}`);
      await context.close();
    }
  }

  const indexHtml = await fs.readFile(path.join(root, "dist/about/index.html"), "utf8");
  assert.match(indexHtml, /<main class="static-prerender"[^>]*>[\s\S]*?<h1>[^<]+<\/h1>/, "about: prerendered canonical main exposes a meaningful H1");
  assert.match(indexHtml, /id="wpb-authorship-trust"/);
  assert.match(indexHtml, /id="wpb-contributor-profiles"/);
  assert.match(indexHtml, /id="wpb-authorship-schema"/);
  assert.doesNotMatch(indexHtml, /Review Desk/i);
  await fs.writeFile(path.join(artifactDir, "results.json"), JSON.stringify({ results, contributors: registry.contributors.map(({ id, schemaId, name }) => ({ id, schemaId, name })) }, null, 2));
  console.log(JSON.stringify({ authorshipTrustQA: "pass", checks: results.length }, null, 2));
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
