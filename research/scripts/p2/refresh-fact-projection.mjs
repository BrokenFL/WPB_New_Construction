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

const exportPattern = /export const projectFacts = ([\s\S]*?) as const;\n\nexport const prerenderRoutes/;
const match = siteData.match(exportPattern);
if (!match) throw new Error("Could not find the projectFacts export in src/generated/siteData.ts");

const existingFacts = JSON.parse(match[1]);
const existingById = new Map(existingFacts.map((project) => [project.projectId, project]));
const projectFacts = model.projects.map((project) => {
  const existing = existingById.get(project.publicSlug);
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

const replacement = `export const projectFacts = ${JSON.stringify(projectFacts, null, 2)} as const;\n\nexport const prerenderRoutes`;
// A callback keeps dollar-prefixed price strings literal; replacement strings
// otherwise interpret values such as "$1M" as capture-group substitutions.
await fs.writeFile(siteDataPath, siteData.replace(exportPattern, () => replacement));
console.log(JSON.stringify({ projectFactProjection: "generated", projects: projectFacts.length }, null, 2));
