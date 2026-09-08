import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const checker = path.join(path.dirname(fileURLToPath(import.meta.url)), "check-internal-links.mjs");

async function fixture({ includeCss = true, routeHref = "/about/", externalHref = "https://example.com/reference" } = {}) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "wpb-internal-links-"));
  await fs.mkdir(path.join(root, "dist", "about"), { recursive: true });
  await fs.mkdir(path.join(root, "src", "generated"), { recursive: true });
  await fs.writeFile(path.join(root, "dist", "index.html"), `<!doctype html><html><head><link rel="stylesheet" href="/project-seo-batch4.css"></head><body><a href="${routeHref}">About</a><a href="/manual.pdf">PDF</a><a href="${externalHref}">External</a></body></html>`);
  await fs.writeFile(path.join(root, "dist", "about", "index.html"), "<!doctype html><html><body>About</body></html>");
  await fs.writeFile(path.join(root, "dist", "manual.pdf"), "%PDF-fixture");
  if (includeCss) await fs.writeFile(path.join(root, "dist", "project-seo-batch4.css"), ".fixture{display:block}");
  await fs.writeFile(path.join(root, "src", "generated", "siteData.ts"), 'export const prerenderRoutes = [{"path":"/"},{"path":"/about/"}] as const;');
  await fs.writeFile(path.join(root, "src", "main.ts"), `const links = '<a href="/about/">About</a><a href="/manual.pdf">PDF</a><a href="${externalHref}">External</a>';`);
  return root;
}

function run(root) {
  return spawnSync(process.execPath, [checker], { cwd: root, encoding: "utf8" });
}

test("existing stylesheet href is validated as a static file and passes", async (t) => {
  const root = await fixture();
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const result = run(root);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Internal link QA passed/);
});

test("missing stylesheet href fails as a missing static file", async (t) => {
  const root = await fixture({ includeCss: false });
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const result = run(root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /links to missing file \/project-seo-batch4\.css/);
  assert.doesNotMatch(result.stderr, /missing route \/project-seo-batch4\.css/);
});

test("normal internal HTML route validation remains unchanged", async (t) => {
  const root = await fixture({ routeHref: "/missing-route/" });
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const result = run(root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /links to missing route \/missing-route\//);
});

test("external links and existing non-CSS static assets retain current handling", async (t) => {
  const root = await fixture({ externalHref: "https://invalid.example/not-checked" });
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const result = run(root);
  assert.equal(result.status, 0, result.stderr);
});
