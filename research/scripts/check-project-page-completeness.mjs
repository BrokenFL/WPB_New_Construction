import fs from "node:fs";
import path from "node:path";

const workspace = process.cwd();
const main = fs.readFileSync(path.join(workspace, "src/main.ts"), "utf8");
const prerender = fs.readFileSync(path.join(workspace, "research/scripts/prerender-static-routes.mjs"), "utf8");
const projectModel = JSON.parse(fs.readFileSync(path.join(workspace, "src/generated/projectModel.json"), "utf8"));
const findings = [];

const projectIds = projectModel.projects
  .filter((project) => project.publicationState === "published")
  .map((project) => ({ id: project.publicSlug, pageState: project.presentation?.pageState || "" }));
const awaitingImagery = projectModel.projects.filter((project) => project.publicationState === "awaiting_imagery");

if (!projectIds.length) findings.push("Generated project model contains no published project page definitions.");
for (const project of projectModel.projects) {
  if (project.publicationState === "published" && !project.presentation) findings.push(`${project.publicSlug}: published project is missing presentation data.`);
  if (project.publicationState === "awaiting_imagery" && project.presentation) findings.push(`${project.publicSlug}: imagery-gated project must not have presentation data or a public page.`);
}

for (const section of ["hero", "facts", "residences", "neighborhood", "inquiry"]) {
  if (!main.includes(`data-project-section="${section}"`)) findings.push(`Browser project renderer is missing ${section} section contract marker.`);
  if (!prerender.includes(`data-project-section="${section}"`)) findings.push(`Prerender project renderer is missing ${section} section contract marker.`);
}

if (!main.includes("renderProjectIdentityHeader(project, pageType)")) {
  findings.push("Project pages do not render a shared identity header.");
}

if (!main.includes("projectLogoImages")) {
  findings.push("Project logo mapping is missing.");
}

if (!main.includes("renderEmailSignup(`project_${project.id}`")) {
  findings.push("Planning/source-watch project pages do not render lightweight email signup.");
}

if (!main.includes("isCompactWatch ?")) {
  findings.push("Project renderer does not branch for planning/source-watch pages.");
}

for (const project of projectIds) {
  const state = project.pageState.toLowerCase();
  if (state.includes("planning") || state.includes("source") || state.includes("market") || state.includes("pipeline")) {
    if (!main.includes("What Is Not Yet Confirmed")) {
      findings.push(`${project.id}: compact project pages need a missing-information panel.`);
    }
  }
}

const logoMatches = [...main.matchAll(/src:\s*"([^"]*(?:logo|Logo)[^"]*)"/g)];
for (const [, logo] of logoMatches) {
  if (logo.startsWith("/projects/")) {
    const filePath = path.join(workspace, "public", logo);
    if (!fs.existsSync(filePath)) findings.push(`${logo}: configured project logo does not exist.`);
  }
}

if (!/Not publicly confirmed/.test(main)) {
  findings.push("Missing or uncertain facts must render as Not publicly confirmed.");
}

if (!main.includes('isCompactWatch ? "Get Updates on This Project" : "Request Current Availability"')) {
  findings.push("Compact planning/source-watch pages must use Get Updates as the primary CTA.");
}

if (findings.length) {
  console.error("Project page completeness QA findings:");
  findings.forEach((finding) => console.error(`- ${finding}`));
  process.exit(1);
}

console.log(`Project page completeness QA passed for ${projectIds.length} published project pages; ${awaitingImagery.length} imagery-gated candidates remain unpublished.`);
