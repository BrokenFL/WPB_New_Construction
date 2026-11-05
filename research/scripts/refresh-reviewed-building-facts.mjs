#!/usr/bin/env node
// Regenerate the existing reviewed-fact consumers. Evidence adjudication and
// source edits belong to the release owner; this never applies scraped values,
// changes schemaSafe, commits, pushes, deploys, or enables P2 automation.
import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";

const execute = promisify(execFile);
export const factOutputs = [
  "src/generated/projectModel.json", "src/generated/projectModel.ts",
  "src/generated/projectModelPublic.json", "src/generated/projectModelPublic.ts",
  "src/generated/buildingDatabase.ts", "src/generated/buildingDatabasePublic.ts",
  "src/generated/projectSchemaSafe.json", "src/generated/projectSchemaRuntime.ts",
  "src/generated/siteData.ts", "public/data/project-copy-package.json",
];
const commands = [
  ["research/scripts/reconcile-canonical-projects.mjs"],
  ["research/scripts/generate-project-model.mjs"],
  ["research/scripts/parse-building-database.mjs"],
  ["--experimental-strip-types", "research/scripts/generate-project-schema-safe.ts"],
  ["research/scripts/p2/refresh-fact-projection.mjs"],
  ["research/scripts/build-site-intelligence.mjs", "--project-copy-only"],
];
const digest = value => value === null ? null : createHash("sha256").update(value).digest("hex");
async function readOptional(file) {
  try { return await fs.readFile(file); } catch (error) { if (error.code === "ENOENT") return null; throw error; }
}
async function restore(root, snapshots) {
  for (const [file, bytes] of snapshots) {
    const target = path.join(root, file);
    if (bytes === null) await fs.rm(target, { force: true });
    else { await fs.mkdir(path.dirname(target), { recursive: true }); await fs.writeFile(target, bytes); }
  }
}
export async function refreshReviewedFacts({ root, projects, check = false, run = async args => {
  await execute(process.execPath, args, { cwd: root, maxBuffer: 32 * 1024 * 1024 });
} }) {
  if (!Array.isArray(projects) || !projects.length || projects.some(id => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id))) throw new Error("Explicit public project slugs are required");
  const snapshots = new Map();
  for (const file of factOutputs) snapshots.set(file, await readOptional(path.join(root, file)));
  try {
    for (const args of commands) await run(args[0].endsWith("/p2/refresh-fact-projection.mjs") ? [...args, `--projects=${projects.join(",")}`] : args);
    const changed = [];
    for (const [file, before] of snapshots) {
      const after = await readOptional(path.join(root, file));
      if (digest(before) !== digest(after)) changed.push({ file, beforeSha256: digest(before), afterSha256: digest(after) });
    }
    if (check) await restore(root, snapshots);
    return { state: changed.length ? (check ? "stale" : "prepared") : "no-change", projects, changed, checked: check };
  } catch (error) {
    await restore(root, snapshots);
    throw error;
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const unknown = process.argv.slice(2).filter(arg => arg !== "--check" && !arg.startsWith("--projects="));
  if (unknown.length) throw new Error(`Unknown argument: ${unknown.join(", ")}`);
  const root = process.cwd();
  const projects = process.argv.find(arg => arg.startsWith("--projects="))?.slice("--projects=".length).split(",").filter(Boolean);
  const result = await refreshReviewedFacts({ root, projects, check: process.argv.includes("--check") });
  const report = path.join(root, ".runtime/reviewed-building-facts/latest.json");
  await fs.mkdir(path.dirname(report), { recursive: true });
  await fs.writeFile(report, JSON.stringify({ checkedAt: new Date().toISOString(), ...result }, null, 2) + "\n");
  console.log(JSON.stringify(result, null, 2));
  if (result.state === "stale") process.exitCode = 1;
}
