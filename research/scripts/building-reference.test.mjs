import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { parse } from "csv-parse/sync";
import { projectSchemaFactProperties } from "../../shared/project-schema-facts.mjs";
import { projectBuyerGuide } from "../../shared/project-buyer-guide.mjs";

const slugs = ["mr-c", "olara", "south-flagler-house", "ritz-carlton-wpb", "maison-dor", "shorecrest", "banyan-tree", "edgeworth", "mandarin-oriental"];
const readJson = async path => JSON.parse(await fs.readFile(path, "utf8"));
const model = (await readJson("src/generated/projectModelPublic.json")).projects;
const overrides = (await readJson("content/overrides/project-fact-overrides.json")).projects;
const copies = await readJson("content/project-copy-package.json");
const safeProjects = (await readJson("src/generated/projectSchemaSafe.json")).projects;
const rows = parse(await fs.readFile("content/wpb_new_construction_building_database_cleaned.csv", "utf8"), { columns: true });
const privateReference = /referenceFacts|dated-reference|Sep 21 reference|year unspecified|supplied reference|Brooke supplied a table|\$175M presold|85%\+ sold|16 of 27 floors|\$200M loan/i;

test("operator leasing correction separates the residential address and program total from occupancy and availability", async () => {
  const sound = model.find(p => p.publicSlug === "the-sound-west-palm-beach");
  assert.match(sound.status, /Open \/ Leasing.*operator-reported/);
  assert.match(sound.facts.projectAddress, /^520 Gregory Road/);
  assert.match(sound.facts.planningParcelAddress, /8111.*older construction\/retail/);
  assert.ok(sound.facts.residenceFeatures.some(value => /Studios through 3 bedrooms/.test(value)));
  assert.equal(sound.residences, "358");
  const html = await fs.readFile(`dist${sound.publicRoute}index.html`, "utf8");
  const graph = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap(b => JSON.parse(b[1])["@graph"] || []);
  const entity = graph.find(n => n["@id"]?.endsWith("#project"));
  assert.equal(entity.address.streetAddress, "520 Gregory Road");
  assert.equal(entity.numberOfAccommodationUnits.value, 358);
  assert.match(JSON.stringify(entity.additionalProperty), /operator-reported/);
  assert.doesNotMatch(JSON.stringify(entity), /8111|Under Construction|"(?:offers|availability|completionDate|numberOfAvailableAccommodationUnits)"/);
});

test("inquiry choices and completion reports cannot become price bands or available inventory", () => {
  const olin = copies.find(p => p.repoProjectId === "olin-palm-beach");
  for (const value of [olin.localTake, olin.brookeTake, olin.buyerComparisonNotes, olin.confidenceNote]) {
    assert.doesNotMatch(value, /Pricing bands|under \$20M to over \$40M|bands under \$20M/i);
  }
  assert.equal(safeProjects.find(p => p.identity.slug === "olin-palm-beach").safeFields.price, undefined);
  for (const slug of ["alba-palm-beach", "forte-on-flagler"]) {
    const copy = copies.find(p => p.repoProjectId === slug);
    assert.doesNotMatch(copy.localTake, /resale-driven|removes the timing risk|95%.*sold/i);
    assert.match(copy.localTake, /developer.*resale|developer offerings or resales/i);
    assert.match(copy.localTake, /occupancy/i);
  }
});

test("partial municipal decisions and conflicting design or brand records retain their scopes", () => {
  const rybovich = copies.find(p => p.repoProjectId === "rybovich-marina-redevelopment");
  assert.match(rybovich.overview, /November 10.*259-unit.*4, 8, 9 and 10/);
  assert.match(rybovich.overview, /does not confirm approval of the full 660.*291/i);
  for (const field of ["status", "residenceCount"]) assert.equal(overrides["rybovich-marina-redevelopment"][field].schemaSafe, false);
  const banyan = model.find(p => p.publicSlug === "banyan-tree");
  assert.match(banyan.facts.stories, /26 marketed.*municipal.*25/);
  const apogee = model.find(p => p.publicSlug === "apogee-residences-wpb");
  assert.match(apogee.facts.stories, /Sep 29, 2025.*current plan to confirm/);
  assert.match(apogee.facts.projectTeam.join(" "), /unresolved.*Sieger Suarez.*Arquitectonica/);
  const rosewood = model.find(p => p.publicSlug === "rosewood-residences-west-palm-beach");
  assert.match(rosewood.displayName, /reported Rosewood association unconfirmed/);
  assert.match(rows.find(r => r.project_id === rosewood.compareDatabaseId).display_name, /unconfirmed/);
  assert.equal(safeProjects.find(p => p.identity.slug === rosewood.publicSlug).safeFields.status, undefined);
});

test("schema uses total QuantitativeValue and qualified PropertyValues without availability or exact dates", () => {
  const fields = projectSchemaFactProperties({ residenceCount: "184", status: "Priority List Open / Preconstruction", delivery: "2029 projected; confirm current schedule" });
  assert.deepEqual(fields.numberOfAccommodationUnits, { "@type": "QuantitativeValue", value: 184, unitText: "residences" });
  assert.equal(fields.additionalProperty[1].value, "2029 projected; confirm current schedule");
  assert.doesNotMatch(JSON.stringify(fields), /"(?:offers|availability|numberOfAvailableAccommodationUnits|status|dateCreated|completionDate)"/);
  for (const residenceCount of ["", "0", "105 on project site; 108 on Related Ross", "98 in earlier sources; 100 on Related Ross", "about 190"]) {
    assert.equal(projectSchemaFactProperties({ residenceCount }).numberOfAccommodationUnits, undefined);
  }
  assert.equal(projectSchemaFactProperties({ residenceCount: "146" }, [], "Place").numberOfAccommodationUnits, undefined);
  const held = projectSchemaFactProperties({}, [{name:"Proposed layouts",value:"194 residences with two- to four-bedroom plans"},{name:"Site area",value:"2.64 acres"}]);
  assert.deepEqual(held.additionalProperty, [{"@type":"PropertyValue",name:"Site area",value:"2.64 acres"}]);
  assert.equal(projectSchemaFactProperties({residenceCount:"193"},[{name:"Older layouts",value:"194 residences"}]).additionalProperty, undefined);
});

test("private reference comparisons are excluded from public data projections", async () => {
  for (const path of ["public/data/project-copy-package.json", "src/generated/projectModelPublic.json", "src/generated/projectSchemaSafe.json", "src/generated/buildingDatabasePublic.ts", "src/generated/siteData.ts"]) {
    assert.doesNotMatch(await fs.readFile(path, "utf8"), privateReference, path);
  }
  const report = await fs.readFile("docs/BUILDING_REFERENCE_2026_10_08.md", "utf8");
  assert.match(report, /Status \(Sep 21\)/);
  assert.match(report, /85%\+ sold/);
  assert.match(report, /\$175M presold/);
});

test("qualified facts agree across generated model, authored quick facts and compare source", () => {
  const fields = { status: ["status", "Status", "status_badge"], deliveryTiming: ["delivery", "Delivery", "completion_or_delivery"], residenceCount: ["residences", "Residences", "residence_count"], priceDisplay: ["price", "Price Range", "price_display"] };
  for (const slug of [...slugs, "berkeley", "forte-on-flagler", "la-clara"]) {
    const project = model.find(p => p.publicSlug === slug);
    const copy = copies.find(p => p.repoProjectId === slug);
    const row = rows.find(p => p.project_id === project.compareDatabaseId);
    assert.equal(copy.referenceFacts, undefined, slug);
    for (const [field, [modelField, label, csvField]] of Object.entries(fields)) {
      const expected = overrides[slug]?.[field]?.value || project[modelField];
      assert.equal(project[modelField], expected, `${slug}: model ${field}`);
      assert.equal(copy.quickFacts.find(f => f.label === label).value, expected, `${slug}: copy ${field}`);
      assert.equal(row[csvField], expected, `${slug}: compare ${field}`);
      const feature = copy.signatureFeatures?.find(f => f.startsWith(`${label}: `));
      if (feature) assert.equal(feature, `${label}: ${expected}`, `${slug}: secondary copy ${field}`);
    }
  }
});

test("built pages omit private comparisons while retaining safe JSON-LD and SEO behavior", async () => {
  for (const slug of slugs) {
    const html = await fs.readFile(`dist/projects/${slug}/index.html`, "utf8");
    assert.doesNotMatch(html, privateReference, slug);
    const graph = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap(block => JSON.parse(block[1])["@graph"] || []);
    const entity = graph.find(p => p["@id"] === `https://www.wpbnewconstruction.com/projects/${slug}/#project`);
    assert.ok(entity, slug);
    assert.equal(graph.some(p => p.offers || p["@type"] === "Offer"), false, slug);
    assert.equal(entity.status, undefined, slug);
    assert.equal(entity.numberOfAvailableAccommodationUnits, undefined, slug);
    const safeCount = safeProjects.find(p => p.identity.slug === slug).safeFields.residenceCount;
    if (safeCount && /^\d+$/.test(safeCount)) assert.equal(entity.numberOfAccommodationUnits.value, Number(safeCount), slug);
    else assert.equal(entity.numberOfAccommodationUnits, undefined, slug);
    if (["mr-c", "south-flagler-house", "banyan-tree", "mandarin-oriental", "edgeworth"].includes(slug)) {
      assert.equal(entity.additionalProperty?.some(p => p.name === "Delivery guidance") || false, Boolean(safeProjects.find(p => p.identity.slug === slug).safeFields.delivery), `${slug}: delivery follows supported schema decision`);
    }
  }
});

test("official Edgeworth facts replace stale data and table-only mutable fields remain held", () => {
  const p = slug => model.find(p => p.publicSlug === slug);
  assert.equal(p("edgeworth").residences, "184 marketed residences");
  assert.match(p("edgeworth").price, /From \$5\.5M/);
  assert.equal(p("edgeworth").status, "Priority List Open / Preconstruction");
  const points = rows.find(r => r.project_id === "edgeworth-wpb").strongest_compare_points;
  assert.match(points, /184 marketed residences/);
  assert.doesNotMatch(points, /168|one.to.five|\$2\.5M|\$35\.5M/i);
  assert.match(p("shorecrest").residences, /98.*Apr 2026.*100.*municipal/);
  assert.match(p("shorecrest").price, /From \$3\.5M.*Apr 2026.*request current pricing/);
  assert.match(p("south-flagler-house").residences, /105 marketed.*municipal count differs/);
  assert.match(p("olara").delivery, /^2028 scheduled completion.*confirm current schedule$/);
  assert.equal(p("mr-c").price, "Request current pricing");
  assert.equal(p("banyan-tree").delivery, "Request current delivery guidance");
  assert.doesNotMatch(p("mandarin-oriental").delivery, /2030/);
  assert.equal(p("mandarin-oriental").price, "Request current pricing");
});

test("broader source review excludes marketing Offers and disputed numeric totals across every project", async () => {
  assert.equal(model.length, 24);
  for (const project of model) {
    const html = await fs.readFile(`dist${project.publicRoute}index.html`, "utf8");
    const graphs = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(block => JSON.parse(block[1]));
    assert.doesNotMatch(JSON.stringify(graphs), /"(?:offers|availability|numberOfAvailableAccommodationUnits)"|"@type":"Offer"/, project.publicSlug);
    const entity = graphs.flatMap(g => g["@graph"] || []).find(p => p["@id"] === `https://www.wpbnewconstruction.com${project.publicRoute}#project`);
    if (["alba-reserve", "forte-on-flagler", "olara", "mr-c", "shorecrest", "south-flagler-house", "edgeworth", "nora-house", "banyan-tree", "la-clara", "mandarin-oriental", "fern-and-gardenia-related-ross-fern-street", "rosewood-residences-west-palm-beach", "apogee-residences-wpb", "201-arkona-court", "2085-north-flagler"].includes(project.publicSlug)) assert.equal(entity.numberOfAccommodationUnits, undefined, project.publicSlug);
  }
  assert.match(model.find(p => p.publicSlug === "mandarin-oriental").delivery, /^2031 anticipated opening.*confirm current schedule$/);
  assert.match(model.find(p => p.publicSlug === "ritz-carlton-wpb").price, /^From \$3M.*request current pricing$/);
  for (const slug of ["rosewood-residences-west-palm-beach", "3031-s-ocean-palm-beach"]) {
    assert.equal(safeProjects.find(p => p.identity.slug === slug).safeFields.delivery, undefined, `${slug}: alignment is not schema authorization`);
  }
  assert.equal(safeProjects.find(p => p.identity.slug === "rosewood-residences-west-palm-beach").safeFields.status, undefined);
  const edge = copies.find(p => p.repoProjectId === "edgeworth").showcase.residenceCollections;
  assert.match(JSON.stringify(edge), /\$5\.5M/);
  assert.doesNotMatch(JSON.stringify(edge), /\$2\.5M|1-3 bedrooms|4-5 bedrooms|9 penthouses/);
  const olin = copies.find(p => p.repoProjectId === "olin-palm-beach");
  assert.equal(olin.quickFacts.find(f => f.label === "Pricing").value, "Request current pricing");
  for (const project of model) {
    const row = rows.find(r => r.project_id === project.compareDatabaseId);
    if (!row) continue;
    assert.equal(row.price_display, project.price, `${project.publicSlug}: Compare price qualification`);
    assert.equal(row.completion_or_delivery, project.delivery, `${project.publicSlug}: Compare timing qualification`);
    assert.equal(row.status_badge, project.status, `${project.publicSlug}: Compare reviewed status`);
  }
});


test("municipal program differences stay qualified across all public summary surfaces", () => {
  for (const project of model) {
    const copy = copies.find(p => p.repoProjectId === project.publicSlug || p.slug === project.publicSlug || project.lookupAliases.includes(p.repoProjectId));
    if (copy) for (const [field, labels] of Object.entries({status:["Status"], residences:["Residences"], delivery:["Delivery"], price:["Price Range","Pricing"], address:["Address"]})) {
      const fact = copy.quickFacts.find(f => labels.includes(f.label));
      if (fact) assert.equal(fact.value, field === "address" ? project.facts.projectAddress : project[field], `${project.publicSlug}: ${field}`);
    }
    const row = rows.find(r => r.project_id === project.compareDatabaseId);
    if (row) assert.equal(row.residence_count, project.residences, `${project.publicSlug}: Compare count scope`);
  }
  for (const slug of ["maison-dor","edgeworth","201-arkona-court","the-sound-west-palm-beach"]) {
    assert.doesNotMatch(model.find(p=>p.publicSlug===slug).delivery, /20\d{2}/, `${slug}: unsupported delivery target`);
  }
  for (const slug of ["berkeley","nora-house","maison-dor"]) {
    assert.equal(safeProjects.find(p=>p.identity.slug===slug).safeFields.address, undefined, `${slug}: marketing address is not legal-address approval`);
  }
  assert.match(model.find(p=>p.publicSlug==="forte-on-flagler").price, /developer and resale/);
  assert.doesNotMatch(JSON.stringify(copies.find(p=>p.repoProjectId==="rybovich-marina-redevelopment")), /initial approvals? cover.*259|initial phase covering 259/i);
});

test("buyer-guide supplements cannot revive obsolete price, address, availability or timing claims", async () => {
  const supplements = await readJson("public/data/project-seo-batch4.json");
  for (const record of supplements) {
    const copy = copies.find(p => p.repoProjectId === record.projectId);
    const current = projectBuyerGuide(record, copy);
    assert.equal(current.eyebrow, copy.quickFacts.find(f=>f.label==="Status").value);
    assert.equal(current.opening, copy.overview);
    assert.equal(current.status.construction.includes(copy.quickFacts.find(f=>f.label==="Delivery").value), true);
    assert.doesNotMatch(current.status.availability, /No developer inventory|resale-driven|95%/i);
    const core = JSON.stringify([current.opening,current.location,current.status,current.verifiedFacts,current.residences]);
    if (record.projectId === "olin-palm-beach") assert.doesNotMatch(core, /\$(?:20|30|40)M|inquiry.*bands/i);
    if (record.projectId === "maison-dor") assert.doesNotMatch(core, /3705 South Flagler Drive|late 2028|4Q 2028/i);
    if (record.projectId === "rosewood") assert.doesNotMatch(current.opening, /is an approved|approved 90-residence/i);
  }
  const record = {opening:"fixture"};
  assert.equal(projectBuyerGuide(record, undefined), record);
});

test("complete project schemas cannot revive unsupported descriptive details or exact coordinates", async () => {
  const allowed = new Set(["Published residence offering guidance", "Development status", "Delivery guidance"]);
  for (const project of model) {
    const html = await fs.readFile(`dist${project.publicRoute}index.html`, "utf8");
    const graph = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap(b => JSON.parse(b[1])["@graph"] || []);
    const entity = graph.find(n => n["@id"]?.endsWith("#project"));
    assert.equal(entity.latitude, undefined, project.publicSlug);
    assert.equal(entity.longitude, undefined, project.publicSlug);
    assert.equal(entity.amenityFeature, undefined, project.publicSlug);
    for (const p of entity.additionalProperty || []) assert.ok(allowed.has(p.name), `${project.publicSlug}: unreviewed detail ${p.name}`);
    if (project.publicSlug === "fern-and-gardenia-related-ross-fern-street") assert.doesNotMatch(JSON.stringify(graph), /194|486|4,343|316 feet|55 million/);
    if (project.publicSlug === "maison-dor") assert.doesNotMatch(JSON.stringify(graph), /late.2028/i);
    if (project.publicSlug === "rosewood-residences-west-palm-beach") {assert.equal(entity["@type"], "Place");assert.match(entity.name, /unconfirmed/);}
    if (project.publicSlug === "3031-s-ocean-palm-beach") assert.equal(entity.numberOfAccommodationUnits, undefined);
  }
});

test("floorplan schema descriptions withhold unverified physical dimensions and bedroom counts", async () => {
  const { floorplanSchemaDescription, auditedFaqItems } = await import("../../shared/project-schema-facts.mjs");
  const text = floorplanSchemaDescription("Residence 05", "Banyan Tree WPB");
  assert.doesNotMatch(text, /sq ft|bedroom|current availability/i);
  assert.match(text, /Confirm the latest developer drawing/);
  assert.deepEqual(auditedFaqItems([{answer:"Maison targets late 2028"},{answer:"Forté has resale-only inventory"},{answer:"Ask for current estimated monthly costs, reserves, parking/storage details, deposit schedule, and what services are included."}]), [{answer:"Ask for current estimated monthly costs, reserves, parking/storage details, deposit schedule, and what services are included."}]);
  assert.deepEqual(auditedFaqItems([{answer:"Ask for current estimated monthly costs, reserves, parking/storage details, deposit schedule, and what services are included. Fees are $800 monthly."}]), []);
});

test("secondary presentation and Compare explanations retain the reviewed fact scopes", async () => {
  const overlays = (await readJson("content/project-page-overlays.json")).projects;
  const presentation = slug => overlays.find(p => p.publicSlug === slug);
  const copy = slug => copies.find(p => p.repoProjectId === slug);
  const project = slug => model.find(p => p.publicSlug === slug);
  assert.doesNotMatch(presentation("maison-dor").summary, /2028/);
  assert.equal(presentation("maison-dor").deliveryYear, 0);
  assert.equal(presentation("maison-dor").approvedFallback.delivery, project("maison-dor").delivery);

  assert.match(project("3031-s-ocean-palm-beach").status, /Council approved Apr 15, 2026.*conditions to confirm/);
  assert.match(copy("3031-s-ocean-palm-beach").heroSubheadline, /conditional Town Council.*April 15, 2026/);
  assert.match(copy("3031-s-ocean-palm-beach").overview, /Architectural Commission minutes record approval/);
  assert.match(copy("3031-s-ocean-palm-beach").overview, /Town Council approved the special exception\/site plan and variances.*two 5–0 votes on April 15, 2026/);
  assert.match(copy("3031-s-ocean-palm-beach").showcase.intro, /agreeable construction-management agreement.*prior version.*staff-level approval/);
  for (const value of [copy("3031-s-ocean-palm-beach").overview, copy("3031-s-ocean-palm-beach").showcase.intro]) {
    assert.match(value, /Confirm the construction-management agreement, permits, construction timing and sales stage/);
    assert.doesNotMatch(value, /Final Town Council zoning approval.*not independently verified|construction-ready/i);
  }
  assert.equal(overrides["3031-s-ocean-palm-beach"].status.schemaSafe, false);

  for (const text of [presentation("berkeley").summary, copy("berkeley").overview, copy("berkeley").location]) {
    assert.match(text, /550 S\. Australian/);
    assert.match(text, /500 S\. Australian/);
    assert.doesNotMatch(text, /601[-–]621/);
  }
  assert.match(copy("berkeley").location, /Municipal.*parcel address/);
  const shorecrest = rows.find(r => r.project_id === "shorecrest-wpb");
  assert.doesNotMatch(shorecrest.tradeoffs, /still pre-construction/i);
  assert.match(shorecrest.tradeoffs, /under construction.*anticipated 2027/);
  const olara = rows.find(r => r.project_id === "olara-wpb");
  assert.match(olara.landscape_architect, /EDSA.*official March 2026/);
  assert.match(olara.storage_summary, /5-by-5-foot climate-controlled/);
  assert.match(olara.storage_summary, /allocation.*ownership or use rights/);
  assert.equal(copy("mandarin-oriental").showcase.heroTags.find(t => t.label === "Delivery").value, project("mandarin-oriental").delivery);
  assert.match(project("mandarin-oriental").delivery, /^2031 anticipated opening.*brand target/);
});
