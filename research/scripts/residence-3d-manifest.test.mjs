import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs/promises";
import { residence3DModels, residence3DModelsForPlan } from "../../src/data/residence3DModels.ts";
import { reviewed3DFloorplanExpansion } from "../../src/data/reviewed3DFloorplanExpansion.ts";
import { buildFloorplanEntities, floorplanSchema, publishedFloorplanEntities, perPlanPageForEntity, entityRendererPages, renderFloorplanPage } from "../../src/lib/floorplanEntities.ts";
import { approved3DPlanEntities, residence3DDiscoverySchema, renderResidence3DDiscoveryPage } from "../../src/lib/residence3DDiscovery.ts";
import { add3DLlmsInventory, addSitemapEntities, render3DDiscoveryDocument } from "./prerender-floorplan-entities.mjs";

const keys = [
  "olara/residence-c", "olara/residence-d",
  "shorecrest/residence-0704", "shorecrest/residence-1602",
  "ritz-carlton-wpb/residence-02", "ritz-carlton-wpb/residence-06",
  "mr-c/residence-01a", "mr-c/residence-02a",
  "berkeley/residence-d", "berkeley/residence-g",
];

test("manifest contains all ten reviewed, public-safe, uniquely keyed model entries", () => {
  assert.deepEqual(residence3DModels.map((model) => `${model.projectId}/${model.residenceSlug}`), keys);
  assert.equal(new Set(residence3DModels.map((model) => model.modelId)).size, residence3DModels.length);
  for (const model of residence3DModels) {
    assert.ok(["pending", "approved"].includes(model.status));
    assert.equal(typeof model.furnished, "boolean");
    assert.equal(typeof model.cutaway, "boolean");
    assert.equal(model.modelUrl, `/assets/projects/${model.projectId}/3d/${model.residenceSlug}/model.glb`);
    assert.equal(model.posterUrl, `/assets/projects/${model.projectId}/3d/${model.residenceSlug}/poster.webp`);
    assert.equal(residence3DModelsForPlan(model.projectId, model.residenceSlug)[0], model);
    assert.match(model.accessibilityLabel, /Interactive 3D floor plan/);
  }
  assert.equal(residence3DModelsForPlan("shorecrest", "residence-1153").length, 0);
  assert.doesNotMatch(JSON.stringify(residence3DModels), /\/Users\/|\/Volumes\/|drive\.google|\.blend|sourceFilename|sha256|provenance|private/i);
});

test("new floorplan entities preserve exact approved sources and do not synthesize Shorecrest totals", async () => {
  const plans = buildFloorplanEntities();
  for (const review of reviewed3DFloorplanExpansion) {
    const plan = plans.find((item) => item.projectId === review.projectId && item.slug === review.slug);
    assert.ok(plan);
    assert.equal(plan.pdf, review.pdf);
    assert.equal(plan.preview, review.preview);
    assert.equal(plan.planName, review.displayName);
    assert.equal(plan.sourceUrl, review.sourceUrl);
    assert.equal(plan.models3D.length, 1);
    const sourceBytes = await fs.readFile(`public${review.pdf}`);
    if (/\.pdf$/i.test(review.pdf)) assert.equal(sourceBytes.subarray(0, 5).toString(), "%PDF-");
    else if (/\.jpe?g$/i.test(review.pdf)) {
      assert.equal(sourceBytes.subarray(0, 2).toString("hex"), "ffd8");
      const encoding = floorplanSchema(plan)["@graph"][0].mainEntity.encoding;
      assert.equal((Array.isArray(encoding) ? encoding[0] : encoding).encodingFormat, "image/jpeg");
      assert.doesNotMatch(renderFloorplanPage(plan), /Floor range on drawing/);
    } else assert.fail(`Unsupported source drawing type: ${review.pdf}`);
    assert.ok((await fs.stat(`public${review.preview}`)).size > 0);
    if (review.projectId === "shorecrest") {
      assert.equal(plan.totalSqFt, null);
      assert.doesNotMatch(renderFloorplanPage(plan), /Reported total including exterior/);
      assert.doesNotMatch(JSON.stringify(floorplanSchema(plan)), /2967|2207/);
    } else if (plan.totalSqFt !== null && !review.areaDifference) assert.equal(plan.interiorSqFt + plan.terraceSqFt, plan.totalSqFt);
  }
  assert.ok(publishedFloorplanEntities().length >= 10);
  assert.equal(publishedFloorplanEntities().some((plan) => plan.projectId === "alba-palm-beach"), false);
});

test("only approved models enter HTML, schema, discovery and crawl inventory", () => {
  const approved = publishedFloorplanEntities().filter((plan) => plan.models3D.some((model) => model.status === "approved"));
  for (const plan of publishedFloorplanEntities()) {
    const html = renderFloorplanPage(plan);
    const schema = JSON.stringify(floorplanSchema(plan));
    if (plan.models3D.some((model) => model.status === "approved")) {
      assert.match(html, /model\.glb/);
      assert.match(schema, /model\.glb/);
    } else assert.doesNotMatch(html + schema, /model\.glb|poster\.webp/);
  }
  assert.deepEqual(approved3DPlanEntities(), approved);
  for (const plan of approved) {
    const perPlan = perPlanPageForEntity(plan);
    assert.equal(entityRendererPages().some((item) => item.planId === plan.planId), !perPlan);
    if (perPlan) assert.equal(plan.path, `/floorplans/${perPlan.projectId}/${perPlan.planSlug}/`);
  }
  assert.equal(residence3DDiscoverySchema()["@graph"][1].numberOfItems, approved.length);
  assert.equal((renderResidence3DDiscoveryPage().match(/Explore in 3D/g) ?? []).length, approved.length);
  assert.equal(add3DLlmsInventory("# Test\n").includes("/3d-floorplans/"), approved.length > 0);
  const sitemap = addSitemapEntities("<urlset></urlset>", publishedFloorplanEntities());
  assert.equal(sitemap.includes("/3d-floorplans/"), approved.length > 0);
});

test("approving a reviewed model enables its viewer, 3D encoding and discoverability", () => {
  const model = residence3DModels[0];
  const previous = model.status;
  const otherApproved = approved3DPlanEntities().filter((plan) => plan.projectId !== model.projectId || plan.slug !== model.residenceSlug).length;
  model.status = "approved";
  try {
    const plan = publishedFloorplanEntities().find((item) => item.projectId === model.projectId && item.slug === model.residenceSlug);
    assert.ok(plan);
    const html = renderFloorplanPage(plan);
    assert.ok(html.indexOf('data-residence-3d') < html.indexOf('class="fp-layout"'));
    assert.match(html, /Furnished cutaway interactive floor-plan visualization/);
    assert.match(html, /Model updated/);
    const schema = floorplanSchema(plan);
    assert.equal(schema["@graph"][0].dateModified, model.updatedOn);
    assert.equal(schema["@graph"][0].mainEntity.encoding[0].contentUrl, `https://www.wpbnewconstruction.com${plan.pdf}`);
    assert.equal(schema["@graph"][0].mainEntity.encoding[1].contentUrl, `https://www.wpbnewconstruction.com${model.modelUrl}`);
    assert.equal(approved3DPlanEntities().length, otherApproved + 1);
    assert.match(renderResidence3DDiscoveryPage(), /Explore in 3D/);
    const inventory = add3DLlmsInventory("# Test\n");
    assert.match(inventory, /3d-floorplans/);
    assert.equal(add3DLlmsInventory(inventory), inventory);
    assert.match(addSitemapEntities("<urlset></urlset>", publishedFloorplanEntities()), /3d-floorplans/);
  } finally { model.status = previous; }
});

test("3D document renderer installs canonical, accessible body and one schema graph", async () => {
  const fixture = '<!doctype html><html><head><title>Old</title>' +
    [["name","description"],["property","og:title"],["property","og:description"],["property","og:url"],["property","og:image"],["name","twitter:title"],["name","twitter:description"],["name","twitter:image"]]
      .map(([key,name]) => `<meta ${key}="${name}" content="Old" />`).join("") +
    '<link rel="canonical" href="https://www.wpbnewconstruction.com/" /><script id="wpb-static-structured-data" type="application/ld+json">{}</script></head><body><div id="app"><main>Old</main></div><script>window.__WPB_PRERENDER_PATH__="/";</script></body></html>';
  const html = render3DDiscoveryDocument(fixture);
  assert.match(html, /West Palm Beach residences in/);
  assert.match(html, /href="https:\/\/www\.wpbnewconstruction\.com\/3d-floorplans\/"/);
  assert.equal((html.match(/id="wpb-residence-3d-schema"/g) ?? []).length, 1);
  assert.equal((html.match(/<h1>/g) ?? []).length, 1);
  assert.doesNotMatch(html, /<main>Old|id="wpb-static-structured-data"/);
});

test("drawing revisions keep approved facts distinct from a visualization's source", () => {
  for (const slug of ["residence-d", "residence-g"]) {
    const plan = buildFloorplanEntities().find((item) => item.projectId === "berkeley" && item.slug === slug);
    assert.ok(plan);
    const model = plan.models3D[0];
    const previous = model.status;
    model.status = "approved";
    try {
      const work = floorplanSchema(plan)["@graph"][0].mainEntity;
      assert.equal(work.isBasedOn, plan.sourceUrl);
      assert.equal(work.encoding[1].isBasedOn, model.sourceDrawingUrl);
      assert.notEqual(model.sourceDrawingUrl, plan.sourceUrl);
      assert.match(renderFloorplanPage(plan), /different drawing versions/);
      if (slug === "residence-d") {
        assert.match(renderResidence3DDiscoveryPage(), /2 bedrooms \+ flex/);
        assert.doesNotMatch(renderResidence3DDiscoveryPage(), /flex bedrooms/);
      }
      assert.ok(renderFloorplanPage(plan).includes(model.sourceDrawingUrl));
      assert.equal(plan.floors, "");
    } finally { model.status = previous; }
  }
});
