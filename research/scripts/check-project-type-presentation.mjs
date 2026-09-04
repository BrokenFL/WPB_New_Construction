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

if (findings.length) {
  console.error("Project-type presentation findings:");
  findings.forEach((finding) => console.error(`- ${finding}`));
  process.exit(1);
}

const counts = Object.groupBy(model.projects, (project) => project.projectType);
console.log(`Project-type presentation QA passed for ${model.projects.length} projects (${Object.entries(counts).map(([type, projects]) => `${type}: ${projects.length}`).join(", ")}).`);
