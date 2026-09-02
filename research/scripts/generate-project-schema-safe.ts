#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { getSchemaSafeProjectFacts } from "../../src/lib/projectIntelligence.ts";
import { projectIntelligenceRegistryEntries } from "../../src/lib/projectIntelligenceRegistry.ts";

const workspace = process.cwd();
const outputPath = path.join(workspace, "src/generated/projectSchemaSafe.json");
const checkOnly = process.argv.includes("--check");
const projects = projectIntelligenceRegistryEntries
  .filter((entry) => entry.publicationState === "published")
  .map((entry) => getSchemaSafeProjectFacts(entry.publicSlug));
const output = `${JSON.stringify({ version: 1, projects }, null, 2)}\n`;

if (checkOnly) {
  if (!fs.existsSync(outputPath) || fs.readFileSync(outputPath, "utf8") !== output) {
    console.error("src/generated/projectSchemaSafe.json is stale. Run npm run research:project-schema-safe.");
    process.exit(1);
  }
} else {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, output);
}

console.log(JSON.stringify({
  projectSchemaSafe: checkOnly ? "checked" : "generated",
  projects: projects.length,
  emittedAddresses: projects.filter((project) => project.safeFields.address).length,
  omittedFields: projects.reduce((sum, project) => sum + project.omittedFields.length, 0),
}, null, 2));
