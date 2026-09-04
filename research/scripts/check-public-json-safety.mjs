import fs from "node:fs/promises";
import path from "node:path";
import { scanPublicOutput } from "./public-copy-safety.mjs";

const workspace = process.cwd();
const scanRoots = ["public", "dist"].map((item) => path.join(workspace, item));

const allowlistedFiles = new Set([
  "public/_redirects",
]);

async function main() {
  const files = (await Promise.all(scanRoots.map(listFiles))).flat();
  const findings = [];

  for (const file of files) {
    const rel = path.relative(workspace, file);
    if (allowlistedFiles.has(rel)) continue;
    if (!/\.(?:json|txt|xml|html|js)$/i.test(file)) continue;
    const content = await fs.readFile(file, "utf8");
    for (const match of scanPublicOutput(content)) findings.push(`${rel}: blocked public JSON/text phrase "${match.match}" (${match.label})`);
  }

  if (findings.length) {
    console.error(["Public JSON safety failed:", ...findings.map((finding) => `- ${finding}`)].join("\n"));
    process.exit(1);
  }

  await validatePublicSchemas(findings);

  if (findings.length) {
    console.error(["Public JSON safety failed:", ...findings.map((finding) => `- ${finding}`)].join("\n"));
    process.exit(1);
  }

  console.log(JSON.stringify({ publicJsonSafety: "pass", checkedFiles: files.length }, null, 2));
}

async function validatePublicSchemas(findings) {
  const publicProjectPath = path.join(workspace, "src/generated/projectModelPublic.json");
  const publicProjectModel = JSON.parse(await fs.readFile(publicProjectPath, "utf8"));
  const projectKeys = new Set(["publicSlug", "publicRoute", "corridorKey", "corridor", "displayName", "projectType", "status", "delivery", "residences", "price", "facts", "sourceUrls", "lookupAliases", "compareDatabaseId", "compareDatabaseSlug", "presentation"]);
  const factKeys = new Set(["projectAddress", "salesGalleryAddress", "mailingAddress", "planningParcelAddress", "canonicalResidenceCount", "historicalResidenceCounts", "expectedDeliveryCurrent", "priorDeliveryGuidance", "factEffectiveDate", "lastVerifiedDate", "sourcePriority"]);
  for (const project of publicProjectModel.projects || []) {
    for (const key of Object.keys(project)) if (!projectKeys.has(key)) findings.push(`src/generated/projectModelPublic.json: unapproved project field "${key}"`);
    for (const key of Object.keys(project.facts || {})) if (!factKeys.has(key)) findings.push(`src/generated/projectModelPublic.json: unapproved fact field "${key}"`);
  }

  const floorplanPath = path.join(workspace, "public/data/floorplans.json");
  const floorplans = JSON.parse(await fs.readFile(floorplanPath, "utf8"));
  const planKeys = new Set(["planId", "projectId", "normalizedName", "displayName", "title", "planType", "href", "sourceUrl", "publicAssetUrl", "effectiveDate", "isCanonicalPublicPlan"]);
  for (const project of floorplans.projects || []) {
    const ids = new Set();
    for (const plan of project.plans || []) {
      for (const key of Object.keys(plan)) if (!planKeys.has(key)) findings.push(`public/data/floorplans.json: unapproved plan field "${key}"`);
      if (!plan.planId) findings.push(`public/data/floorplans.json: ${project.projectId} plan is missing planId`);
      if (ids.has(plan.planId)) findings.push(`public/data/floorplans.json: duplicate planId "${plan.planId}"`);
      ids.add(plan.planId);
    }
  }
}

async function listFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      return entry.isDirectory() ? listFiles(fullPath) : [fullPath];
    }),
  );
  return nested.flat();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
