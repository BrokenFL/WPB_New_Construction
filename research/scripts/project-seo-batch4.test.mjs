import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";

const records = JSON.parse(await fs.readFile(new URL("../../public/data/project-seo-batch4.json", import.meta.url), "utf8"));
const byId = new Map(records.map((record) => [record.projectId, record]));

test("Batch 4 is limited to Rosewood and Maison d'Or canonical project pages", () => {
  assert.deepEqual([...byId.keys()].sort(), ["maison-dor", "rosewood"]);
  assert.equal(byId.get("rosewood").path, "/projects/rosewood-residences-west-palm-beach/");
  assert.equal(byId.get("maison-dor").path, "/projects/maison-dor/");
  for (const record of records) {
    assert.equal(new URL(record.canonical).pathname, record.path);
    assert.match(record.title, /Buyer Guide/);
    assert.match(record.h1, /Buyer Guide$/);
    assert.equal(record.reviewedOn, "2026-09-08");
  }
});

test("request links retain exact project and explicit intent", () => {
  for (const record of records) {
    for (const [key, expected] of [["availabilityHref", "Request current availability"], ["packetHref", "Pricing + floor-plan packet"]]) {
      const url = new URL(record[key], "https://www.wpbnewconstruction.com");
      assert.equal(url.pathname, "/inquire/");
      assert.equal(url.searchParams.get("project"), record.projectId);
      assert.equal(url.searchParams.get("interest"), expected);
      assert.equal([...url.searchParams.keys()].length, 2);
    }
  }
});

test("Rosewood separates approved planning from public sales and availability", () => {
  const rosewood = byId.get("rosewood");
  assert.match(rosewood.opening, /approved 90-residence/i);
  assert.match(rosewood.status.marketing, /No comprehensive public sales launch/i);
  assert.match(rosewood.status.availability, /No residence-specific current inventory/i);
  assert.match(rosewood.status.construction, /construction start is not confirmed/i);
  assert.ok(rosewood.sources.some((source) => source.kind === "official" && /wpb\.org/.test(source.url)));
  assert.doesNotMatch(JSON.stringify(rosewood), /\$[0-9]|delivery (?:in|by)|completion (?:in|by)/i);
});

test("Maison facts come from official project sources and remain availability-qualified", () => {
  const maison = byId.get("maison-dor");
  assert.equal(maison.sources.every((source) => source.kind === "official" && /livemaisondor\.com/.test(source.url)), true);
  assert.match(maison.opening, /39-residence/i);
  assert.match(maison.status.availability, /require a current buyer packet/i);
  assert.match(maison.status.construction, /do not establish a construction milestone/i);
  assert.ok(maison.residences.some((fact) => /two- to four-bedroom/i.test(fact)));
  assert.ok(maison.verifiedFacts.some((fact) => /starting pricing from \$5\.7 million/i.test(fact)));
});

test("Batch 4 contains buyer-fit, status, research links and source review", () => {
  for (const record of records) {
    assert.ok(record.buyerFit.length > 80);
    assert.ok(record.location.length > 80);
    assert.ok(record.verifiedFacts.length >= 3);
    assert.ok(record.amenities.length >= 2);
    assert.ok(record.residences.length >= 2);
    assert.ok(record.links.length >= 4);
    assert.ok(record.sources.length >= 2);
    assert.ok(record.status.marketing && record.status.construction && record.status.availability);
  }
});
