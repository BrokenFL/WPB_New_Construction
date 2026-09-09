import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const origin = "http://127.0.0.1:4173";
const productionOrigin = "https://www.wpbnewconstruction.com";
const artifactDir = path.join(root, ".runtime/authorship-trust");
const registry = JSON.parse(await fs.readFile(path.join(root, "public/data/contributors.json"), "utf8"));
await fs.mkdir(artifactDir, { recursive: true });
const brookeId = registry.contributors.find((person) => person.id === "brooke-snader").schemaId;
const assigned = [
  { path: "/about/", wording: "Written by", relationship: "author" },
  { path: "/methodology/", wording: "Written by", relationship: "author" },
  { path: "/projects/rosewood-residences-west-palm-beach/", wording: "Reviewed by", relationship: "reviewedBy" },
  { path: "/projects/maison-dor/", wording: "Reviewed by", relationship: "reviewedBy" },
];
const batch4Routes = ["/projects/rosewood-residences-west-palm-beach/", "/projects/maison-dor/"];
const unassigned = ["/corridors/south-flagler/", "/answers/closest-new-condos-to-palm-beach/", "/updates/rosewood-north-flagler-planning-board-2026-06-05/", "/market-notes/are-branded-residences-worth-it-west-palm-beach/"];
const headingRegressionRoutes = ["/projects/olara/", "/corridors/south-flagler/", "/answers/olara-vs-ritz-carlton-vs-shorecrest/", "/floorplans/olara/residence-f/"];
const server = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "preview", "--host", "127.0.0.1", "--port", "4173", "--strictPort"], { cwd: root, stdio: "ignore" });

function routeFile(route) { return path.join(root, "dist", route.replace(/^\/|\/$/g, ""), "index.html"); }
function jsonLdInventory(html) {
  return [...html.matchAll(/<script\b([^>]*)type="application\/ld\+json"([^>]*)>([\s\S]*?)<\/script>/gi)].map((match, index) => {
    const attrs = `${match[1]} ${match[2]}`;
    return { index, id: attrs.match(/\bid="([^"]+)"/)?.[1] ?? null, staticPath: attrs.match(/\bdata-static-path="([^"]+)"/)?.[1] ?? null, length: match[3].length };
  });
}
async function assertStaticSchema(route) {
  const html = await fs.readFile(routeFile(route), "utf8");
  const inventory = jsonLdInventory(html);
  assert.deepEqual(inventory.map((item) => item.id), ["wpb-static-structured-data"], `${route}: final dist contains one canonical JSON-LD script; ${JSON.stringify(inventory)}`);
  assert.doesNotMatch(html, /wpb-project-seo-batch4-schema|wpb-authorship-schema/, `${route}: no obsolete schema injection in dist`);
  const raw = await fetch(`${origin}${route}`).then((response) => response.text());
  const rawInventory = jsonLdInventory(raw);
  assert.deepEqual(rawInventory.map((item) => item.id), ["wpb-static-structured-data"], `${route}: pre-hydration response contains one canonical JSON-LD script`);
  return inventory;
}
async function headingDiagnostics(page) { const totalH1 = await page.locator("h1").count(); const visibleH1 = await page.locator("h1:visible").count(); const accessibleH1 = await page.getByRole("heading", { level: 1 }).count(); return { totalH1, visibleH1, accessibleH1, hiddenOrInactiveH1: Math.max(0, totalH1 - visibleH1) }; }
async function assertNoJsDocumentHeading(page, route, diagnostics = null) { const h = diagnostics ?? await headingDiagnostics(page); const main = page.locator("main"); assert.equal(await main.count(), 1); assert.equal(await main.locator("h1").count(), 1); assert.ok((await main.locator("h1").innerText()).trim()); assert.equal(h.totalH1, 1, `${route}: one no-JS H1`); assert.equal(h.visibleH1, 1); assert.equal(h.accessibleH1, 1); return h; }
async function assertActiveHeadingContract(page, route, js) { const h = await headingDiagnostics(page); assert.equal(h.visibleH1, 1, `${route}: one visible H1`); assert.equal(h.accessibleH1, 1, `${route}: one accessible H1`); const main = page.locator("main:visible"); assert.equal(await main.count(), 1); assert.equal(await main.locator("h1:visible").count(), 1); if (!js) await assertNoJsDocumentHeading(page, route, h); return h; }
async function schemaGraph(page, route) {
  const scripts = page.locator('script[type="application/ld+json"]');
  const inventory = await scripts.evaluateAll((nodes) => nodes.map((node, index) => ({ index, id: node.id || null, staticPath: node.getAttribute("data-static-path"), length: node.textContent?.length ?? 0 })));
  assert.equal(inventory.length, 1, `${route}: exactly one JSON-LD script; ${JSON.stringify(inventory)}`);
  assert.equal(inventory[0].id, "wpb-static-structured-data", `${route}: canonical static schema script`);
  assert.equal(await page.locator("#wpb-project-seo-batch4-schema, #wpb-authorship-schema").count(), 0, `${route}: no obsolete standalone schema`);
  const script = page.locator('#wpb-static-structured-data[type="application/ld+json"]');
  const schema = JSON.parse(await script.textContent()); assert.ok(Array.isArray(schema["@graph"]), `${route}: one @graph`); return schema["@graph"];
}
function pageNode(graph, route) { return graph.find((node) => node["@id"] === `${productionOrigin}${route}#webpage`); }
async function assertBatch4Graph(page, route) {
  const graph = await schemaGraph(page, route);
  const pageRecord = pageNode(graph, route); assert.ok(pageRecord, `${route}: active canonical WebPage present`); assert.equal(pageRecord.reviewedBy?.["@id"], brookeId, `${route}: Brooke reviewer relationship`);
  assert.equal(graph.filter((node) => node["@id"] === brookeId).length, 1, `${route}: one Brooke stable Person`);
  assert.ok(graph.some((node) => node["@type"] === "BreadcrumbList"), `${route}: Breadcrumb preserved`);
  assert.ok(graph.some((node) => node["@type"] === "Organization"), `${route}: Organization preserved`);
  assert.ok(graph.some((node) => node["@id"] === `${productionOrigin}${route}#project`), `${route}: project entity preserved`);
  return graph;
}
async function navigateSpa(page, route) {
  await page.evaluate((target) => { history.pushState({}, "", target); window.dispatchEvent(new PopStateEvent("popstate")); }, route);
  await page.waitForURL(`${origin}${route}`);
  await page.waitForFunction(({ route, productionOrigin, brookeId }) => {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]'); if (scripts.length !== 1) return false;
    const script = document.querySelector('#wpb-static-structured-data'); if (!script?.textContent) return false;
    try { const graph = JSON.parse(script.textContent)["@graph"]; const pageNode = graph?.find((node) => node["@id"] === `${productionOrigin}${route}#webpage`); return pageNode?.reviewedBy?.["@id"] === brookeId; } catch { return false; }
  }, { route, productionOrigin, brookeId });
  await page.locator("#wpb-project-seo-batch4").waitFor({ state: "visible" });
}

let browser; const results = [];
try {
  let ready = false; for (let attempt = 0; attempt < 120; attempt += 1) { if (server.exitCode !== null) throw new Error("Vite preview exited"); try { const response = await fetch(origin); if (response.ok) { ready = true; break; } } catch {} await new Promise((resolve) => setTimeout(resolve, 250)); } assert.ok(ready);
  for (const route of assigned.map((item) => item.path)) await assertStaticSchema(route);
  browser = await chromium.launch({ headless: true });
  for (const javaScriptEnabled of [true, false]) for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: width < 600 ? 844 : 1000 }, javaScriptEnabled }); const page = await context.newPage(); const errors = []; page.on("pageerror", (error) => errors.push(error.message));
    for (const expected of assigned) {
      const response = await page.goto(`${origin}${expected.path}`, { waitUntil: javaScriptEnabled ? "networkidle" : "domcontentloaded" }); assert.equal(response?.status(), 200); const headings = await assertActiveHeadingContract(page, expected.path, javaScriptEnabled);
      const trust = page.locator("main:visible #wpb-authorship-trust:visible"); await trust.waitFor({ state: "visible" }); assert.equal(await trust.count(), 1); assert.equal(await trust.locator("h1").count(), 0); const text = await trust.innerText(); assert.ok(text.includes(expected.wording)); assert.ok(text.includes("Brooke Snader")); assert.doesNotMatch(text, /@[a-z0-9.-]+\.[a-z]{2,}|\b\d{3}[-.)\s]+\d{3}[-.\s]+\d{4}\b/i);
      const graph = await schemaGraph(page, expected.path); const pageRecord = pageNode(graph, expected.path); assert.ok(pageRecord, `${expected.path}: preserve canonical WebPage`); assert.equal(pageRecord[expected.relationship]?.["@id"], brookeId, `${expected.path}: correct responsibility`); assert.equal(graph.filter((node) => node["@id"] === brookeId).length, 1, `${expected.path}: one Brooke stable ID`); assert.ok(graph.some((node) => node["@type"] === "BreadcrumbList"), `${expected.path}: breadcrumb preserved`); assert.ok(graph.some((node) => node["@type"] === "Organization"), `${expected.path}: organization preserved`); if (expected.path.startsWith("/projects/")) assert.ok(graph.some((node) => node["@id"] === `${productionOrigin}${expected.path}#project`), `${expected.path}: project entity preserved`);
      if (expected.path === "/about/") { assert.equal(await page.locator("main:visible #wpb-contributor-profiles").count(), 1); const ids = graph.filter((node) => node["@type"] === "Person").map((node) => node["@id"]); for (const person of registry.contributors) assert.equal(ids.filter((id) => id === person.schemaId).length, 1, `about: one ${person.id} stable ID`); }
      await page.screenshot({ path: path.join(artifactDir, `${expected.path.split("/").filter(Boolean).join("-")}-${width}-${javaScriptEnabled ? "js" : "nojs"}.png`), fullPage: true }); results.push({ path: expected.path, width, javaScriptEnabled, attributed: true, status: "pass", headings });
    }
    for (const route of unassigned) { const response = await page.goto(`${origin}${route}`, { waitUntil: javaScriptEnabled ? "networkidle" : "domcontentloaded" }); assert.equal(response?.status(), 200); const headings = javaScriptEnabled ? await headingDiagnostics(page) : await assertNoJsDocumentHeading(page, route); assert.equal(await page.locator("#wpb-authorship-trust").count(), 0); const graph = await schemaGraph(page, route); const node = pageNode(graph, route); if (node) { assert.notEqual(node.author?.["@id"], brookeId, `${route}: no invented Brooke author`); assert.notEqual(node.reviewedBy?.["@id"], brookeId, `${route}: no invented Brooke reviewer`); } results.push({ path: route, width, javaScriptEnabled, attributed: false, status: "pass", headings }); }
    for (const route of headingRegressionRoutes) { const response = await page.goto(`${origin}${route}`, { waitUntil: javaScriptEnabled ? "networkidle" : "domcontentloaded" }); assert.equal(response?.status(), 200); const headings = await assertActiveHeadingContract(page, route, javaScriptEnabled); results.push({ path: route, width, javaScriptEnabled, headingRegression: true, status: "pass", headings }); }
    if (javaScriptEnabled) assert.deepEqual(errors, []); await context.close();
  }

  const spa = await browser.newContext({ viewport: { width: 1440, height: 1000 }, javaScriptEnabled: true }); const page = await spa.newPage();
  await page.goto(`${origin}${batch4Routes[0]}`, { waitUntil: "networkidle" }); await assertBatch4Graph(page, batch4Routes[0]);
  await navigateSpa(page, batch4Routes[1]); await assertBatch4Graph(page, batch4Routes[1]);
  await navigateSpa(page, batch4Routes[0]); await assertBatch4Graph(page, batch4Routes[0]);
  assert.equal(await page.locator('script[type="application/ld+json"]').count(), 1, "Rosewood → Maison → Rosewood never accumulates schema scripts"); await spa.close();

  const aboutHtml = await fs.readFile(path.join(root, "dist/about/index.html"), "utf8"); assert.match(aboutHtml, /id="wpb-authorship-trust"/); assert.match(aboutHtml, /id="wpb-contributor-profiles"/); assert.doesNotMatch(aboutHtml, /id="wpb-authorship-schema"/); assert.equal((aboutHtml.match(/type="application\/ld\+json"/g) || []).length, 1, "about: one static JSON-LD script");
  await fs.writeFile(path.join(artifactDir, "results.json"), JSON.stringify({ results, staticRoutes: assigned.map((item) => item.path), spaSequence: [batch4Routes[0], batch4Routes[1], batch4Routes[0]], contributors: registry.contributors.map(({ id, schemaId, name }) => ({ id, schemaId, name })) }, null, 2)); console.log(JSON.stringify({ authorshipTrustQA: "pass", checks: results.length, schemaContract: "single canonical graph", spaSequence: "pass" }, null, 2));
} finally { await browser?.close(); server.kill("SIGTERM"); }
