// Durable generator for per-plan floor-plan pages.
// Reads src/data/floorplanApprovedLibrary.ts + canonical project facts and
// APPENDS FloorplanPlanPage records for Batch 5 projects to
// src/data/floorplanPlanPages.ts. Never modifies existing records.
//
// Usage: node --experimental-strip-types research/scripts/gen-floorplan-plan-pages.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { approvedFloorplanLibrary } from "../../src/data/floorplanApprovedLibrary.ts";

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const planPagesPath = path.join(workspace, "src/data/floorplanPlanPages.ts");
const publicDir = path.join(workspace, "public");

// Batch 5 scope. Do NOT add Codex-scope projects here (olara, mr-c,
// berkeley, ritz-carlton-wpb, shorecrest) or touch their records.
const BATCH5 = {
  "banyan-tree": { projectShort: "Banyan Tree WPB" },
  "la-clara": { projectShort: "La Clara" },
  "forte-on-flagler": { projectShort: "Forté on Flagler" },
  "maison-dor": { projectShort: "Maison d'Or" },
};

const CORRIDOR_SLUG = {
  "Downtown": "downtown-west-palm-beach",
  "South Flagler": "south-flagler",
  "North Flagler": "north-flagler",
};

function canonicalFact(projectId) {
  const model = JSON.parse(fs.readFileSync(path.join(workspace, "src/generated/projectModel.json"), "utf8"));
  const project = model.projects.find(
    (p) => p.canonicalId === projectId || p.publicSlug === projectId ||
      (p.aliases || []).includes(projectId),
  );
  if (!project) throw new Error(`Canonical facts missing for ${projectId}`);
  return project;
}

function slugify(title) {
  return title.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function fmtNum(value) {
  if (!value) return "";
  const n = Number(String(value).replace(/,/g, ""));
  if (!Number.isFinite(n)) return String(value);
  return n.toLocaleString("en-US");
}

function bedSegment(bedrooms) {
  if (!bedrooms) return "";
  return /bed/i.test(bedrooms) ? bedrooms : `${bedrooms} bd`;
}

function bathSegment(bathrooms) {
  if (!bathrooms) return "";
  return /bath/i.test(bathrooms) ? bathrooms : `${bathrooms} ba`;
}

function sqftSegment(plan) {
  if (plan.totalSqFt) return `${fmtNum(plan.totalSqFt)} sq ft`;
  if (plan.interiorSqFt) return `${fmtNum(plan.interiorSqFt)} interior sq ft`;
  return "";
}

function buildRecords() {
  const records = [];
  for (const [projectId, meta] of Object.entries(BATCH5)) {
    const lib = approvedFloorplanLibrary.find((p) => p.projectId === projectId);
    if (!lib) throw new Error(`Approved library missing project ${projectId}`);
    if (lib.count !== lib.plans.length || !lib.count) {
      throw new Error(`Approved floor-plan source review required: ${projectId}`);
    }
    const facts = canonicalFact(projectId);
    const corridor = lib.area;
    const corridorSlug = CORRIDOR_SLUG[corridor];
    if (!corridorSlug) throw new Error(`Unknown corridor mapping for area "${corridor}"`);
    const seenSlugs = new Set();
    for (const plan of lib.plans) {
      const planSlug = slugify(plan.title);
      if (!planSlug) throw new Error(`Empty planSlug for "${plan.title}" in ${projectId}`);
      if (seenSlugs.has(planSlug)) throw new Error(`planSlug collision in ${projectId}: ${planSlug}`);
      seenSlugs.add(planSlug);
      const href = plan.href || "";
      if (href.startsWith("/assets/") && !fs.existsSync(path.join(publicDir, href.slice(1)))) {
        throw new Error(`Missing plan asset: ${href}`);
      }
      const segments = [bedSegment(plan.bedrooms), bathSegment(plan.bathrooms), sqftSegment(plan)].filter(Boolean);
      records.push({
        projectId,
        projectName: lib.name,
        projectShort: meta.projectShort,
        corridor,
        corridorSlug,
        status: facts.status || "Unknown",
        delivery: facts.delivery || "Unknown",
        planSlug,
        planTitle: plan.title,
        planDetail: plan.detail || "",
        bedrooms: plan.bedrooms || "",
        bathrooms: plan.bathrooms || "",
        interiorSqFt: fmtNum(plan.interiorSqFt),
        terraceSqFt: fmtNum(plan.terraceSqFt),
        totalSqFt: fmtNum(plan.totalSqFt),
        pdfHref: href,
        seoTitle: `${plan.title} Floor Plan | ${meta.projectShort}`,
        seoDescription: `${plan.title} floor plan at ${meta.projectShort}: ${segments.join(", ")}. Released drawing and current availability.`,
      });
    }
  }
  return records;
}

function main() {
  const source = fs.readFileSync(planPagesPath, "utf8");
  const existingIds = new Set([...source.matchAll(/"projectId": "([^"]+)"/g)].map((m) => m[1]));
  for (const projectId of Object.keys(BATCH5)) {
    if (existingIds.has(projectId)) throw new Error(`Refusing to duplicate existing records for ${projectId}`);
  }
  const records = buildRecords();
  const block = records.map((r) => `  ${JSON.stringify(r, null, 2).replace(/\n/g, "\n  ")}`).join(",\n");
  const trimmed = source.replace(/\s+$/, "");
  if (!trimmed.endsWith("];")) throw new Error("Unexpected floorplanPlanPages.ts tail");
  const headerUpdated = trimmed
    .replace("Generated by /tmp/gen-plan-pages.mjs", "Generated by research/scripts/gen-floorplan-plan-pages.mjs")
    .replace("(Tier 1-2 projects with released plans)", "(projects with released plans)");
  const next = `${headerUpdated.slice(0, -2)},\n${block}\n];\n`;
  fs.writeFileSync(planPagesPath, next);
  const counts = Object.keys(BATCH5).map((id) => `${id}=${records.filter((r) => r.projectId === id).length}`).join(" ");
  console.log(`Appended ${records.length} records (${counts}) to src/data/floorplanPlanPages.ts`);
}

main();
