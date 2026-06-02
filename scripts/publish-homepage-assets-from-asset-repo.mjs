#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import os from "node:os";
import { execFileSync } from "node:child_process";

const websiteRoot = process.cwd();
const assetRepoRoot = "/Volumes/ExternalSSD/WPB_NewConstruction_Assets";
const sourceRoot = path.join(assetRepoRoot, "public-front-page-assets", "approved-for-website", "images");
const destinationRoot = path.join(websiteRoot, "public", "assets", "home");
const manifestPath = path.join(websiteRoot, "data", "generated_homepage_asset_publish_manifest.json");
const reportPath = path.join(websiteRoot, "docs", "reports", "homepage-asset-publish-report.md");
const writeMode = process.argv.includes("--write");
const publishedAt = new Date().toISOString();

if (!fs.existsSync(sourceRoot)) {
  console.error(`Homepage asset warehouse not found: ${sourceRoot}`);
  process.exit(2);
}

const entries = [];
for (const sourcePath of fs.readdirSync(sourceRoot).sort().map((filename) => path.join(sourceRoot, filename))) {
  if (!fs.statSync(sourcePath).isFile() || !/\.(jpe?g|png|webp)$/i.test(sourcePath)) continue;
  const sourceHash = sha256(sourcePath);
  const outputFilename = `${normalizeFilename(path.basename(sourcePath))}.jpg`;
  const destinationPath = path.join(destinationRoot, outputFilename);
  const buffer = await renderWebsiteImage(sourcePath);
  const outputHash = crypto.createHash("sha256").update(buffer).digest("hex");
  const exists = fs.existsSync(destinationPath);
  const action = exists && sha256(destinationPath) === outputHash ? "skipped-existing" : "published";
  const sourceMetadata = dimensionsFor(sourcePath);
  const outputMetadata = dimensionsForBuffer(buffer);
  entries.push({
    sourceAssetRepoPath: path.relative(assetRepoRoot, sourcePath),
    websiteAssetPath: path.relative(websiteRoot, destinationPath),
    publicPath: `/${path.relative(path.join(websiteRoot, "public"), destinationPath).split(path.sep).join("/")}`,
    sourceHash,
    outputHash,
    sourceDimensions: { width: sourceMetadata.width, height: sourceMetadata.height },
    outputDimensions: { width: outputMetadata.width, height: outputMetadata.height },
    outputSizeBytes: buffer.length,
    action,
    publishedAt,
    _destinationPath: destinationPath,
    _buffer: buffer,
  });
}

if (writeMode) {
  fs.mkdirSync(destinationRoot, { recursive: true });
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  for (const entry of entries) {
    if (entry.action === "published") fs.writeFileSync(entry._destinationPath, entry._buffer);
  }
  fs.writeFileSync(manifestPath, `${JSON.stringify(entries.map(cleanEntry), null, 2)}\n`);
  fs.writeFileSync(reportPath, buildReport(entries));
}

console.log(JSON.stringify({
  homepageAssetPublish: writeMode ? "write" : "dry-run",
  sourceRoot,
  destinationRoot: path.relative(websiteRoot, destinationRoot),
  scanned: entries.length,
  published: entries.filter((entry) => entry.action === "published").length,
  skippedExisting: entries.filter((entry) => entry.action === "skipped-existing").length,
  manifestPath: writeMode ? path.relative(websiteRoot, manifestPath) : null,
  reportPath: writeMode ? path.relative(websiteRoot, reportPath) : null,
}, null, 2));

function normalizeFilename(filename) {
  return filename
    .replace(/\.(jpe?g|png|webp)$/i, "")
    .replace(/corrdior/gi, "corridor")
    .replace(/nightime/gi, "nighttime")
    .replace(/revelopment/gi, "redevelopment")
    .replace(/proiect/gi, "project")
    .replace(/mason-dor/gi, "maison-dor")
    .replace(/project-card-man-/gi, "project-card-main-")
    .replace(/south-flagler0/gi, "south-flagler-corridor-vertical-v01")
    .replace(/-4eef1bb7$/i, "-alternate")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

async function renderWebsiteImage(sourcePath) {
  const maxWidth = /project-card/i.test(sourcePath) ? 1200 : 1920;
  const temporaryPath = path.join(os.tmpdir(), `wpb-home-${crypto.randomUUID()}.jpg`);
  try {
    execFileSync("sips", ["-Z", String(maxWidth), "-s", "format", "jpeg", "-s", "formatOptions", "84", sourcePath, "--out", temporaryPath], { stdio: "ignore" });
    return fs.readFileSync(temporaryPath);
  } finally {
    fs.rmSync(temporaryPath, { force: true });
  }
}

function sha256(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function dimensionsFor(filePath) {
  const output = execFileSync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", filePath], { encoding: "utf8" });
  return parseDimensions(output);
}

function dimensionsForBuffer(buffer) {
  const temporaryPath = path.join(os.tmpdir(), `wpb-home-dimensions-${crypto.randomUUID()}.jpg`);
  try {
    fs.writeFileSync(temporaryPath, buffer);
    return dimensionsFor(temporaryPath);
  } finally {
    fs.rmSync(temporaryPath, { force: true });
  }
}

function parseDimensions(output) {
  return {
    width: Number(output.match(/pixelWidth:\s*(\d+)/)?.[1] ?? 0),
    height: Number(output.match(/pixelHeight:\s*(\d+)/)?.[1] ?? 0),
  };
}

function cleanEntry(entry) {
  const { _destinationPath, _buffer, ...clean } = entry;
  return clean;
}

function buildReport(items) {
  const published = items.filter((entry) => entry.action === "published");
  const skipped = items.filter((entry) => entry.action === "skipped-existing");
  return `# Homepage Asset Publish Report

Generated: ${publishedAt}

## Summary

- Source: \`${sourceRoot}\`
- Destination: \`${path.relative(websiteRoot, destinationRoot)}\`
- Approved images scanned: ${items.length}
- Published or refreshed: ${published.length}
- Existing optimized files skipped: ${skipped.length}
- Source warehouse files modified: 0

## Published Paths

${items.map((entry) => `- \`${entry.publicPath}\` (${entry.action})`).join("\n")}
`;
}
