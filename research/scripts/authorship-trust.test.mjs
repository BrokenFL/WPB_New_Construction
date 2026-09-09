import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";

const readJson = async (relative) => JSON.parse(await fs.readFile(new URL(`../../${relative}`, import.meta.url), "utf8"));
const registry = await readJson("public/data/contributors.json");
const siteMeta = await readJson("public/data/site-meta.json");
const skill = await fs.readFile(new URL("../../public/.well-known/agent-skills/wpb-new-construction-buyer-research/SKILL.md", import.meta.url), "utf8");

const people = new Map(registry.contributors.map((person) => [person.id, person]));
const assignments = [
  ...Object.entries(registry.assignmentPolicy || {}),
  ...Object.entries(registry.routeAssignments || {}),
];

test("Batch 5 contributor registry contains only the two approved real people", () => {
  assert.deepEqual([...people.keys()].sort(), ["brooke-snader", "scott-gordon"]);
  assert.equal(people.get("brooke-snader").name, "Brooke Snader");
  assert.equal(people.get("brooke-snader").role, "Broker Associate");
  assert.equal(people.get("brooke-snader").license, "BK3291335");
  assert.equal(people.get("scott-gordon").name, "Scott Gordon");
  assert.equal(people.get("scott-gordon").role, "Broker Associate");
  assert.equal(people.get("scott-gordon").license, "BK383426");
  assert.equal(people.get("brooke-snader").team, "The Scott Gordon Team");
  assert.equal(people.get("scott-gordon").team, "The Scott Gordon Team");
});

test("Person entity IDs and professional profile links are unique and stable", () => {
  const ids = registry.contributors.map((person) => person.schemaId);
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual(ids.sort(), [
    "https://www.wpbnewconstruction.com/about/#brooke-snader",
    "https://www.wpbnewconstruction.com/about/#scott-gordon",
  ]);
  const sameAs = registry.contributors.flatMap((person) => person.sameAs);
  assert.equal(new Set(sameAs).size, sameAs.length);
  assert.ok(sameAs.every((url) => new URL(url).hostname === "www.elliman.com"));
});

test("all named assignments resolve to registered people and are deliberately narrow", () => {
  for (const [surface, assignment] of assignments) {
    for (const key of ["author", "reviewer"]) {
      if (assignment[key]) assert.ok(people.has(assignment[key]), `${surface}: ${key} resolves`);
    }
  }
  assert.equal(registry.assignmentPolicy.about.author, "brooke-snader");
  assert.equal(registry.assignmentPolicy.methodology.author, "brooke-snader");
  assert.deepEqual(Object.keys(registry.routeAssignments).sort(), [
    "/projects/maison-dor/",
    "/projects/rosewood-residences-west-palm-beach/",
  ]);
  assert.ok(Object.values(registry.routeAssignments).every((assignment) => assignment.reviewer === "brooke-snader"));
  assert.ok(assignments.every(([, assignment]) => assignment.reviewer !== "scott-gordon"), "Scott is not mechanically credited as reviewer");
  for (const family of ["compare", "project", "corridor", "answer", "update", "market-note", "downtown-spotlight"]) {
    assert.deepEqual(registry.assignmentPolicy[family], {}, `${family}: no family-wide invented byline`);
  }
});

test("site metadata no longer invents a review desk or attaches a personal license to a team identity", () => {
  const text = JSON.stringify(siteMeta);
  assert.doesNotMatch(text, /Review Desk/i);
  assert.doesNotMatch(JSON.stringify(siteMeta.expertByline), /BK3291335|BK383426/);
  assert.equal(siteMeta.expertByline.name, "The Scott Gordon Team");
  assert.equal(siteMeta.expertByline.group, "The Scott Gordon Team");
});

test("public contributor registry excludes private contact PII and unsupported performance claims", () => {
  const text = JSON.stringify(registry);
  assert.doesNotMatch(text, /@[a-z0-9.-]+\.[a-z]{2,}/i);
  assert.doesNotMatch(text, /\b\d{3}[-.)\s]+\d{3}[-.\s]+\d{4}\b/);
  assert.doesNotMatch(text, /\$\d|million in sales|transaction volume|board of directors/i);
});

test("Agent Skill teaches agents to use stable people without inferring authorship", () => {
  assert.match(skill, /data\/contributors\.json/);
  assert.match(skill, /stable Person IDs/i);
  assert.match(skill, /does not mean that person authored or reviewed every page/i);
  assert.match(skill, /methodology/i);
  assert.match(skill, /official\/public sources/i);
});
