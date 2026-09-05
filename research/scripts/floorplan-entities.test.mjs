import assert from "node:assert/strict";
import test from "node:test";
import { approvedFloorplanLibrary } from "../../src/data/floorplanApprovedLibrary.ts";
import {
  buildFloorplanEntities, mergeFloorplanDiscoverySchema, floorplanForPath, floorplanSchema, floorplanJson,
  floorplanTitle, floorplanDescription, renderFloorplanDiscovery, renderFloorplanPage,
} from "../../src/lib/floorplanEntities.ts";
import { addDiscovery, addSitemapEntities, renderEntityDocument } from "./prerender-floorplan-entities.mjs";

const plans = buildFloorplanEntities();
const clone = () => JSON.parse(JSON.stringify(approvedFloorplanLibrary));
const fixture = '<!doctype html><html lang="en"><head><title>Old</title>' +
  [['name','description'],['property','og:title'],['property','og:description'],['property','og:url'],['property','og:image'],['name','twitter:title'],['name','twitter:description'],['name','twitter:image']].map(([key, name]) => `<meta ${key}="${name}" content="Old" />`).join('') +
  '<meta name="robots" content="index,follow" /><link rel="canonical" href="https://www.wpbnewconstruction.com/" /><script id="wpb-static-structured-data" type="application/ld+json">{"old":true}</script></head><body><div id="app"><main><h1>Old</h1><div><div>nested</div></div></main></div><script>window.__WPB_PRERENDER_PATH__="/";</script><script type="module" src="/assets/index.js"></script></body></html>';

test("pilot has exactly one entity per project/plan, not one per source", () => {
  assert.equal(plans.length, 2);
  assert.equal(new Set(plans.map((plan) => plan.planId)).size, 2);
  assert.equal(new Set(plans.map((plan) => plan.canonical)).size, 2);
  for (const plan of plans) assert.equal(plan.path, `/floorplans/${plan.projectId}/residence-d/`);
});
test("clean canonical lookup strips tracking, fragments and index filename", () => {
  for (const plan of plans) {
    for (const suffix of ["?utm_source=test#details", "index.html", ""]) assert.equal(floorplanForPath(plan.path + suffix)?.canonical, plan.canonical);
    assert.equal(floorplanForPath(plan.path.slice(0, -1))?.canonical, plan.canonical);
  }
  for (const value of ["/floorplans/olara/collection/", "/floorplans/", "https://elsewhere.test/floorplans/olara/residence-d/", "//elsewhere.test/", "/floorplans/no-such-project/residence-d/"]) assert.equal(floorplanForPath(value), undefined);
});
test("source changes and duplicate approved records require explicit review", () => {
  const changed = clone();
  const source = changed.find((project) => project.projectId === plans[0].projectId);
  const plan = source.plans.find((item) => item.href === plans[0].pdf);
  plan.interiorSqFt = "9999";
  assert.throws(() => buildFloorplanEntities(changed), /Source review required/);
  const duplicated = clone();
  const project = duplicated.find((item) => item.projectId === plans[0].projectId);
  project.plans.push(project.plans.find((item) => item.href === plans[0].pdf));
  assert.throws(() => buildFloorplanEntities(duplicated), /Expected one approved plan/);
});
test("collections, indexes, and fact sheets cannot become individual pages", () => {
  for (const type of ["collection", "index", "fact-sheet"]) {
    const data = clone();
    data.find((item) => item.projectId === plans[0].projectId).plans.find((item) => item.href === plans[0].pdf).planType = type;
    assert.throws(() => buildFloorplanEntities(data), /Not an individual plan/);
  }
});
test("preserves rather than silently fixes the Alba source area discrepancy", () => {
  const alba = plans.find((plan) => plan.projectId === "alba-palm-beach");
  assert.equal(alba.interiorSqFt + alba.terraceSqFt, 2364);
  assert.equal(alba.totalSqFt, 2374);
  assert.match(renderFloorplanPage(alba), /Area clarification/);
  assert.match(renderFloorplanPage(alba), /2,364/);
  assert.match(renderFloorplanPage(alba), /REV\. 8\/2022/);
});
test("public projection cannot leak arbitrary research properties", () => {
  const data = clone();
  for (const project of data) for (const plan of project.plans) plan.privateNotes = "PRIVATE_SENTINEL";
  assert.doesNotMatch(JSON.stringify(buildFloorplanEntities(data)), /PRIVATE_SENTINEL|privateNotes|expected/);
});
test("entity HTML is useful without JavaScript and has clean buyer actions", () => {
  for (const plan of plans) {
    const html = renderFloorplanPage(plan);
    assert.equal((html.match(/<h1>/g) ?? []).length, 1);
    for (const content of [plan.pdf, plan.preview, '/inquire/', '/compare/', `/projects/${plan.projectId}/`, plan.reviewedOn]) assert.ok(html.includes(content));
    assert.doesNotMatch(html, /href="[^"\s]*[?]/);
    assert.ok(floorplanTitle(plan).length < 80);
    assert.ok(floorplanDescription(plan).length <= 165);
  }
});
test("schema describes documents, not invented inventory or prices", () => {
  for (const plan of plans) {
    const schema = floorplanSchema(plan);
    assert.equal(schema['@graph'][0]['@type'], 'WebPage');
    assert.equal(schema['@graph'][1]['@type'], 'BreadcrumbList');
    assert.equal(schema['@graph'][0].mainEntity.encoding.contentUrl, `https://www.wpbnewconstruction.com${plan.pdf}`);
    assert.doesNotMatch(JSON.stringify(schema), /"(?:Offer|price|availability|Person)"/);
  }
});
test("HTML and JSON-LD escape malicious text without script breakout", () => {
  const malicious = { ...plans[0], projectName: '</h1><script>alert(1)</script>', summary: '</script><script>bad</script>' };
  assert.doesNotMatch(renderFloorplanPage(malicious), /<script>/);
  const json = floorplanJson(floorplanSchema(malicious));
  assert.doesNotMatch(json, /<\/script>/);
  assert.equal(JSON.parse(json)['@graph'][0].mainEntity.description, malicious.summary);
});
test("static template preserves assets, replaces nested app safely, and is idempotent", () => {
  const result = renderEntityDocument(fixture, plans[0]);
  assert.equal((result.match(/rel="canonical"/g) ?? []).length, 1);
  assert.equal((result.match(/id="wpb-floorplan-schema"/g) ?? []).length, 1);
  assert.ok(result.includes('/assets/index.js'));
  assert.doesNotMatch(result, /"old":true|<h1>Old|nested/);
  assert.equal(renderEntityDocument(result, plans[0]), result);
  assert.throws(() => renderEntityDocument(fixture.replace('id="app"', 'id="different"'), plans[0]), /Unexpected template/);
});
test("only the library and matching project expose discovery links", () => {
  assert.equal((renderFloorplanDiscovery('/floorplans/').match(/data-floorplan-entity-link/g) ?? []).length, 2);
  for (const plan of plans) assert.equal((renderFloorplanDiscovery(`/projects/${plan.projectId}/`).match(/data-floorplan-entity-link/g) ?? []).length, 1);
  assert.equal(renderFloorplanDiscovery('/'), '');
  const result = addDiscovery(fixture, '/floorplans/');
  assert.equal(addDiscovery(result, '/floorplans/'), result);
});
test("sitemap keeps existing URLs, stable dates, and no duplicate/parameter routes", () => {
  const original = '<?xml version="1.0"?><urlset><url><loc>https://www.wpbnewconstruction.com/</loc></url></urlset>';
  const output = addSitemapEntities(original, plans);
  assert.equal(addSitemapEntities(output, plans), output);
  assert.ok(output.includes('<loc>https://www.wpbnewconstruction.com/</loc>'));
  for (const plan of plans) assert.equal(output.split(`<loc>${plan.canonical}</loc>`).length - 1, 1);
  assert.doesNotMatch(output, /utm_|lead_capture_context/);
  assert.throws(() => addSitemapEntities(original, [...plans, plans[0]]), /Duplicate/);
  assert.throws(() => addSitemapEntities(original, [{ ...plans[0], updatedOn: '2999-01-01' }]), /Invalid/);
});

test("discovery merges into one existing graph without losing page identity", () => {
  const original = { "@context": "https://schema.org", "@graph": [
    { "@type": "WebSite", "@id": "https://www.wpbnewconstruction.com/#website" },
    { "@type": "WebPage", "@id": "https://www.wpbnewconstruction.com/floorplans/" },
  ] };
  const merged = mergeFloorplanDiscoverySchema(original, '/floorplans/');
  assert.equal(merged['@graph'].length, 3);
  assert.deepEqual(merged['@graph'].slice(0, 2), original['@graph']);
  assert.deepEqual(mergeFloorplanDiscoverySchema(merged, '/floorplans/'), merged);
  const moved = mergeFloorplanDiscoverySchema(merged, '/projects/olara/');
  assert.equal(moved['@graph'].length, 3);
  assert.equal(moved['@graph'][2].itemListElement.length, 1);
  assert.deepEqual(mergeFloorplanDiscoverySchema(moved, '/about/'), original);
  const html = addDiscovery(fixture, '/floorplans/');
  assert.equal((html.match(/type="application\/ld\+json"/g) ?? []).length, 1);
  assert.match(html, /"old":true/);
  assert.doesNotMatch(html, /id="wpb-floorplan-index-schema"/);
  assert.throws(() => mergeFloorplanDiscoverySchema(null, '/floorplans/'), /Expected/);
});

test("public source actions stay on the approved archive while schema retains provenance", () => {
  for (const plan of plans) {
    const html = renderFloorplanPage(plan);
    const sourceLinks = [...html.matchAll(/href="([^"]+)" data-fp-action="source"/g)].map((match) => match[1]);
    assert.deepEqual(sourceLinks, [plan.pdf, plan.pdf]);
    assert.doesNotMatch(html, /href="https?:\/\//);
    assert.equal(floorplanSchema(plan)['@graph'][0].mainEntity.isBasedOn, plan.sourceUrl);
  }
});
