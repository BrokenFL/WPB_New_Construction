#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const workspace = process.cwd();
const args = process.argv.slice(2);
const writeMode = args.includes("--write");
const sourceArg = valueAfter("--source");
const snapshotPath = path.join(workspace, "research/source-material-review/wpb-projects-canonical-v3-planning-update.json");
const sourcePath = sourceArg || process.env.WPB_CANONICAL_PROJECTS_SOURCE || "";
const appPath = path.join(workspace, "src/main.ts");
const sourceCatalogPath = path.join(workspace, "research/source-material-review/project-source-catalog.json");

const routeAliases = {
  "olara-west-palm-beach": "olara",
  "ritz-carlton-residences-west-palm-beach": "ritz-carlton-wpb",
  "berkeley-palm-beach": "berkeley",
  "mr-c-residences-west-palm-beach": "mr-c",
  "mandarin-oriental-residences-west-palm-beach": "mandarin-oriental",
  "banyan-tree-residences-west-palm-beach": "banyan-tree",
};

const sourceCatalogAliases = {
  "olara-west-palm-beach": "olara",
  "ritz-carlton-residences-west-palm-beach": "ritz-carlton-wpb",
  "berkeley-palm-beach": "berkeley",
  "mr-c-residences-west-palm-beach": "mr-c",
  "mandarin-oriental-residences-west-palm-beach": "mandarin-oriental",
  "banyan-tree-residences-west-palm-beach": "banyan-tree",
  "fern-and-gardenia-related-ross-fern-street": ["related-ross-fern-street"],
  "rybovich-marina-redevelopment": ["rybovich-marina"],
  "rosewood-residences-west-palm-beach": ["rosewood"],
  "south-flagler-house": ["south-flagler-house-north", "south-flagler-house-south"],
  "edgeworth": ["edgeworth-north", "edgeworth-south"],
};

if (writeMode) {
  if (!sourcePath) fail("Pass --source /path/to/reviewed-canonical.json or set WPB_CANONICAL_PROJECTS_SOURCE before importing.");
  if (!fs.existsSync(sourcePath)) fail(`Canonical source file not found: ${sourcePath}`);
  fs.mkdirSync(path.dirname(snapshotPath), { recursive: true });
  fs.copyFileSync(sourcePath, snapshotPath);
}

if (!fs.existsSync(snapshotPath)) {
  fail(`Tracked canonical snapshot not found. Run npm run research:canonical-projects:import first.`);
}

const schema = readJson(snapshotPath);
const sourceCatalog = readJson(sourceCatalogPath);
const appSource = fs.readFileSync(appPath, "utf8");
const errors = [];

if (!Array.isArray(schema.projects)) errors.push("Canonical schema projects must be an array.");
if (!Array.isArray(schema.excluded_or_internal_only)) errors.push("Canonical schema excluded_or_internal_only must be an array.");

const publicProjects = Array.isArray(schema.projects) ? schema.projects : [];
const internalProjects = Array.isArray(schema.excluded_or_internal_only) ? schema.excluded_or_internal_only : [];
const publicIds = new Set();
const internalIds = new Set();

for (const project of publicProjects) {
  const id = project.project_id || project.slug;
  for (const field of ["project_id", "slug", "display_name", "site_group", "page_type", "development_stage", "status_badge"]) {
    if (!project[field]) errors.push(`${id || "(unknown public project)"}: missing ${field}.`);
  }
  if (project.include_on_site !== true) errors.push(`${id}: public project must set include_on_site=true.`);
  if (publicIds.has(id)) errors.push(`${id}: duplicate public project id.`);
  publicIds.add(id);

  const routeId = routeAliases[id] || id;
  if (!appSource.includes(`id: "${routeId}"`)) errors.push(`${id}: public route ${routeId} is missing from src/main.ts.`);
}

for (const project of internalProjects) {
  const id = project.project_id || project.slug;
  if (!id) {
    errors.push("Internal project is missing project_id or slug.");
    continue;
  }
  if (internalIds.has(id)) errors.push(`${id}: duplicate internal project id.`);
  if (publicIds.has(id)) errors.push(`${id}: project appears in both public and internal buckets.`);
  internalIds.add(id);
}

const sourceCatalogIds = new Set((sourceCatalog.projects || []).map((project) => project.projectId).filter(Boolean));
const sourceCatalogCoverage = publicProjects.map((project) => {
  const id = project.project_id || project.slug;
  const catalogIds = sourceCatalogAliases[id] || [id];
  const normalizedCatalogIds = Array.isArray(catalogIds) ? catalogIds : [catalogIds];
  return { id, catalogIds: normalizedCatalogIds, covered: normalizedCatalogIds.some((catalogId) => sourceCatalogIds.has(catalogId)) };
});
const missingSourceCatalogCoverage = sourceCatalogCoverage.filter((project) => !project.covered);

if (errors.length) {
  console.error(JSON.stringify({ canonicalProjects: "fail", errors }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  canonicalProjects: writeMode ? "imported-and-validated" : "validated",
  snapshotPath: path.relative(workspace, snapshotPath),
  publicProjects: publicProjects.length,
  internalProjects: internalProjects.length,
  sourceCatalogCoveredProjects: sourceCatalogCoverage.length - missingSourceCatalogCoverage.length,
  sourceCatalogCoverageGaps: missingSourceCatalogCoverage,
}, null, 2));

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

function valueAfter(flag) {
  const inline = args.find((arg) => arg.startsWith(`${flag}=`));
  if (inline) return inline.slice(flag.length + 1);
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] || "" : "";
}
