import fs from "node:fs/promises";
import path from "node:path";

const workspace = process.cwd();
const outDir = path.join(workspace, "research/source-material-review");
const statusPath = path.join(workspace, "public/data/project-asset-status.json");
const floorplansPath = path.join(workspace, "public/data/floorplans.json");

function csvCell(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function row(values) {
  return values.map(csvCell).join(",");
}

const status = JSON.parse(await fs.readFile(statusPath, "utf8"));
const floorplans = JSON.parse(await fs.readFile(floorplansPath, "utf8"));
const floorplanByProject = new Map(floorplans.projects.map((project) => [project.projectId, project]));

const headers = [
  "Project",
  "Project ID",
  "Area",
  "Project Page",
  "Image Display Status",
  "Image Use Note",
  "Floorplan Records",
  "Published Floorplan Files",
  "Floorplan Public Folder",
  "Floorplan Sample Link",
  "Compliance Status",
  "Lead Intake Form",
  "Generated",
];

const rows = status.projects.map((project) => {
  const floorplanProject = floorplanByProject.get(project.projectId);
  const firstPlan = floorplanProject?.plans.find((plan) => plan.href);
  const firstPlanUrl = firstPlan
    ? firstPlan.href.startsWith("http")
      ? firstPlan.href
      : `https://wpbnewconstruction.com${firstPlan.href}`
    : "";
  return row([
    project.name,
    project.projectId,
    project.area,
    project.projectPagePath ? `https://wpbnewconstruction.com${project.projectPagePath}` : "Catalog only",
    project.imageDisplayStatus,
    project.imageUseNote,
    project.floorplanCount,
    project.publishedFloorplanAssetCount,
    `https://wpbnewconstruction.com${project.floorplanPublicFolder}`,
    firstPlanUrl,
    project.complianceStatus,
    "wpb-lead-intake",
    status.generatedAt,
  ]);
});

await fs.mkdir(outDir, { recursive: true });
const outputPath = path.join(outDir, "wpb-project-asset-tracker.csv");
await fs.writeFile(outputPath, `${row(headers)}\n${rows.join("\n")}\n`);
console.log(JSON.stringify({ outputPath, rows: rows.length }, null, 2));
