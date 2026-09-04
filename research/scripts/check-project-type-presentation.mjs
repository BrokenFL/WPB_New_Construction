import fs from "node:fs/promises";
import path from "node:path";

const workspace = process.cwd();
const model = JSON.parse(await fs.readFile(path.join(workspace, "src/generated/projectModelPublic.json"), "utf8"));
const source = await fs.readFile(path.join(workspace, "src/main.ts"), "utf8");
const findings = [];
const allowedTypes = new Set([
  "condo-active-sales",
  "condo-pipeline",
  "rental",
  "office",
  "hotel-residences",
  "mixed-use",
  "completed-comparable",
]);

for (const project of model.projects) {
  if (!allowedTypes.has(project.projectType)) {
    findings.push(`${project.publicSlug}: unsupported public project type ${project.projectType || "missing"}.`);
    continue;
  }
  const route = project.publicRoute;
  const routeFile = path.join(workspace, "dist", route.replace(/^\//, ""), "index.html");
  const html = await fs.readFile(routeFile, "utf8").catch(() => "");
  if (!html) {
    findings.push(`${route}: built project page is missing.`);
    continue;
  }
  if (!html.includes(`data-project-type="${project.projectType}"`)) {
    findings.push(`${route}: built page does not expose its canonical project type.`);
  }
}

const requiredPolicyLabels = [
  "Check Current Leasing Information",
  "Request Leasing Information",
  "Get Project Updates",
  "Get Development Updates",
  "Request Current Resale Availability",
  "Request Current Residence Information",
];
for (const label of requiredPolicyLabels) {
  if (!source.includes(label)) findings.push(`Project presentation policy is missing: ${label}.`);
}

const soundRoute = "/projects/the-sound-west-palm-beach/";
const soundHtml = await fs.readFile(path.join(workspace, "dist", soundRoute.replace(/^\//, ""), "index.html"), "utf8").catch(() => "");
const soundRequired = [
  "Rental apartments, not condominiums",
  "Trader Joe’s",
  "Current rents",
  "Flagler Realty &amp; Development",
  "Verdex Construction",
  "/updates/sound-apartments-right-of-way-maintenance-2026-07-12/",
  "/corridors/south-end/",
];
for (const phrase of soundRequired) {
  if (!soundHtml.toLowerCase().includes(phrase.toLowerCase())) findings.push(`${soundRoute}: missing rental-route evidence ${phrase}.`);
}
const soundForbidden = ["Request Current Pricing", "Sales Status", "North Flagler", "current buyer packet", "condo buyer"];
for (const phrase of soundForbidden) {
  if (soundHtml.toLowerCase().includes(phrase.toLowerCase())) findings.push(`${soundRoute}: contains condo-only language ${phrase}.`);
}
for (const phrase of ["Development Partner", "General Contractor"]) {
  if (!source.includes(phrase)) findings.push(`Project-team presentation is missing: ${phrase}.`);
}
if (!JSON.stringify(model).includes("Verdex Construction")) findings.push("Public project model is missing the verified Verdex Construction credit.");

const soundUpdateRoute = "/updates/sound-apartments-right-of-way-maintenance-2026-07-12/";
const soundUpdateHtml = await fs.readFile(path.join(workspace, "dist", soundUpdateRoute.replace(/^\//, ""), "index.html"), "utf8").catch(() => "");
if (!soundUpdateHtml.includes(soundRoute)) findings.push(`${soundUpdateRoute}: missing link back to the canonical project page.`);

const southEndRoute = "/corridors/south-end/";
const southEndHtml = await fs.readFile(path.join(workspace, "dist", southEndRoute.replace(/^\//, ""), "index.html"), "utf8").catch(() => "");
if (!southEndHtml.includes(soundRoute)) findings.push(`${southEndRoute}: missing The Sound project link.`);

if (findings.length) {
  console.error("Project-type presentation findings:");
  findings.forEach((finding) => console.error(`- ${finding}`));
  process.exit(1);
}

const counts = Object.groupBy(model.projects, (project) => project.projectType);
console.log(`Project-type presentation QA passed for ${model.projects.length} projects (${Object.entries(counts).map(([type, projects]) => `${type}: ${projects.length}`).join(", ")}).`);
