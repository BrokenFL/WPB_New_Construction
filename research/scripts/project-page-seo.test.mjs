import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { projectPageHeading, projectPageSeo } from "../../shared/project-page-seo.mjs";

const root = process.cwd();
const model = JSON.parse(await fs.readFile("src/generated/projectModelPublic.json", "utf8")).projects;
const copies = JSON.parse(await fs.readFile("content/project-copy-package.json", "utf8"));
const decode = text => text.replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");

test("every published project builds valid JSON-LD and authoritative metadata", async () => {
  assert.ok(model.length, "published projects are available");
  for (const project of model) {
    const copy = copies.find(c => c.repoProjectId === project.publicSlug || c.slug === project.publicSlug);
    const seo = projectPageSeo({ id: project.publicSlug, name: project.displayName, corridorKey: project.corridorKey, summary: project.presentation?.summary }, copy);
    const html = await fs.readFile(path.join("dist", project.publicRoute, "index.html"), "utf8");
    assert.equal(decode(html.match(/<title>([\s\S]*?)<\/title>/)[1]), seo.title, project.publicSlug);
    assert.equal(decode(html.match(/<meta name="description" content="([^"]*)"/)[1]), seo.description, project.publicSlug);
    assert.equal(html.match(/<link rel="canonical" href="([^"]*)"/)[1], `https://www.wpbnewconstruction.com${project.publicRoute}`, project.publicSlug);
    for (const platform of ["og", "twitter"]) {
      assert.equal(decode(html.match(new RegExp(`<meta (?:property|name)="${platform}:title" content="([^"]*)"`))[1]), seo.title, project.publicSlug);
      assert.equal(decode(html.match(new RegExp(`<meta (?:property|name)="${platform}:description" content="([^"]*)"`))[1]), seo.description, project.publicSlug);
    }
    assert.equal((html.match(/<h1\b/g) || []).length, 1, project.publicSlug);
    assert.equal(decode(html.match(/<h1[^>]*>([^<]*)<\/h1>/)[1]), projectPageHeading(project.displayName, project.corridorKey), project.publicSlug);
    const blocks = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
    assert.ok(blocks.length, `${project.publicSlug}: schema is present`);
    const graph = blocks.flatMap(block => JSON.parse(block[1])["@graph"] || []);
    const page = graph.find(node => node["@id"] === `https://www.wpbnewconstruction.com${project.publicRoute}#webpage`);
    assert.equal(page?.description, seo.description, `${project.publicSlug}: exact schema description`);
    if (["nora-house", "alba-palm-beach"].includes(project.publicSlug)) assert.equal(graph.some(node => node.offers), false);
    assert.ok(seo.title.includes(project.corridorKey === "palm-beach" ? "Palm Beach" : "West Palm Beach"), project.publicSlug);
  }
});

test("real postbuild transformations preserve dollar prices and literal replacement tokens", async () => {
  const fixture = await fs.mkdtemp(path.join(os.tmpdir(), "wpb-schema-literals-"));
  try {
    const description = "$1.7M; $2.5M; $20M; $40M; $&; $`; $'; $1; $2";
    const canonical = "https://www.wpbnewconstruction.com/projects/nora-house/";
    const schema = { "@context": "https://schema.org", "@graph": [{ "@type": "WebPage", "@id": `${canonical}#webpage`, description }] };
    const html = `<html><head><title>Test</title><meta name="description" content="Test" /><meta property="og:title" content="Test" /><meta property="og:description" content="Test" /><meta property="og:url" content="${canonical}" /><meta name="twitter:title" content="Test" /><meta name="twitter:description" content="Test" /><link rel="canonical" href="${canonical}" /></head><body><main><h1>NORA House West Palm Beach</h1><script id="wpb-static-structured-data" type="application/ld+json">${JSON.stringify(schema)}</script></main></body></html>`;
    await fs.mkdir(path.join(fixture, "dist/projects/nora-house"), { recursive: true });
    await fs.mkdir(path.join(fixture, "public/data"), { recursive: true });
    await fs.writeFile(path.join(fixture, "dist/projects/nora-house/index.html"), html);
    await fs.writeFile(path.join(fixture, "dist/sitemap.xml"), `<url><loc>${canonical}</loc></url>`);
    const record = { projectId: "nora-house", path: "/projects/nora-house/", canonical, title: "NORA House West Palm Beach", description, h1: "NORA House West Palm Beach", reviewedOn: "2026-10-08", status: {}, residences: [], amenities: [], verifiedFacts: [], links: [], sources: [] };
    await fs.writeFile(path.join(fixture, "public/data/project-seo-batch4.json"), JSON.stringify([record]));
    await fs.writeFile(path.join(fixture, "public/data/project-copy-package.json"), "[]");
    const contributor = { id: "reviewer", schemaId: "https://www.wpbnewconstruction.com/#reviewer", profileUrl: "/about/", name: "Fixture Reviewer", expertise: [], geographicFocus: [] };
    await fs.writeFile(path.join(fixture, "public/data/contributors.json"), JSON.stringify({ contributors: [contributor], organization: { id: "https://www.wpbnewconstruction.com/#advisor" }, assignmentPolicy: { project: { reviewer: "reviewer" } } }));
    execFileSync(process.execPath, [path.join(root, "research/scripts/apply-project-seo-batch4.mjs")], { cwd: fixture, stdio: "pipe" });
    const result = await fs.readFile(path.join(fixture, "dist/projects/nora-house/index.html"), "utf8");
    const graph = JSON.parse(result.match(/<script id="wpb-static-structured-data"[^>]*>([\s\S]*?)<\/script>/)[1])["@graph"];
    assert.equal(graph.find(node => node["@type"] === "WebPage").description, description);
    assert.equal(decode(result.match(/<meta name="description" content="([^"]*)"/)[1]), description);
  } finally {
    await fs.rm(fixture, { recursive: true, force: true });
  }
});
