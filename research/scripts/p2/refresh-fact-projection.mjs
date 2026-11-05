#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";

const workspace = process.cwd();
const modelPath = path.join(workspace, "src/generated/projectModelPublic.json");
const siteDataPath = path.join(workspace, "src/generated/siteData.ts");

const [model, siteData] = await Promise.all([
  fs.readFile(modelPath, "utf8").then(JSON.parse),
  fs.readFile(siteDataPath, "utf8"),
]);

// Other generated exports may sit between projectFacts and prerenderRoutes.
// Match this JSON export alone; requiring adjacency can consume several exports.
const exportPattern = /^export const projectFacts = ([\s\S]*?) as const;\r?\n/m;
const match = siteData.match(exportPattern);
if (!match) throw new Error("Could not find the projectFacts export in src/generated/siteData.ts");

const existingFacts = JSON.parse(match[1]);
const existingById = new Map(existingFacts.map((project) => [project.projectId, project]));
const scopeArg = process.argv.slice(2).find(arg => arg.startsWith("--projects="));
const scope = scopeArg ? new Set(scopeArg.slice("--projects=".length).split(",").filter(Boolean)) : null;
if (scope && (!scope.size || [...scope].some(id => !model.projects.some(project => project.publicSlug === id)))) throw new Error("Unknown or empty project scope");
const projectFacts = model.projects.map((project) => {
  const existing = existingById.get(project.publicSlug);
  if (scope && !scope.has(project.publicSlug)) {
    if (!existing) throw new Error(`Unreviewed project missing from existing projection: ${project.publicSlug}`);
    return existing;
  }
  return {
    projectId: project.publicSlug,
    name: project.displayName,
    area: project.corridor,
    projectType: project.projectType,
    summary: project.presentation?.summary || "",
    lastReviewedDate: project.facts.lastVerifiedDate,
    facts: {
      projectAddress: project.facts.projectAddress,
      salesGalleryAddress: project.facts.salesGalleryAddress,
      mailingAddress: project.facts.mailingAddress,
      planningParcelAddress: project.facts.planningParcelAddress,
      status: project.status,
      residences: project.facts.canonicalResidenceCount,
      stories: project.facts.stories || existing?.facts?.stories || "",
      completion: project.facts.expectedDeliveryCurrent,
      pricing: project.price,
      team: project.facts.projectTeam.join("; ") || existing?.facts?.team || "",
      amenities: project.facts.amenitySummary,
      residenceFeatures: project.facts.residenceFeatures,
      neighborhoodContext: project.facts.neighborhoodContext,
      effectiveDate: project.facts.factEffectiveDate,
    },
    sources: project.sourceUrls.map((url) => ({ url })),
  };
});

const replacement = `export const projectFacts = ${JSON.stringify(projectFacts, null, 2)} as const;\n`;
// A callback keeps dollar-prefixed price strings literal; replacement strings
// otherwise interpret values such as "$1M" as capture-group substitutions.
await fs.writeFile(siteDataPath, siteData.replace(exportPattern, () => replacement));
console.log(JSON.stringify({ projectFactProjection: "generated", projects: projectFacts.length }, null, 2));
