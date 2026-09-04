#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import sharp from "sharp";

const websiteRoot = process.cwd();
const assetRepoRoot = path.join("/", "Volumes", "ExternalSSD", ["WPB", "NewConstruction", "Assets"].join("_"));
const sourceBase = path.join(assetRepoRoot, "public-projects");
const destinationBase = path.join(websiteRoot, "public/assets/projects");
const manifestPath = path.join(websiteRoot, "data/generated_asset_publish_manifest.json");
const reportJsonPath = path.join(websiteRoot, "docs/reports/asset-repo-to-website-publish-report.json");
const reportMdPath = path.join(websiteRoot, "docs/reports/asset-repo-to-website-publish-report.md");
const targetProjects = ["201-arkona-court", "2085-north-flagler", "3031-s-ocean-palm-beach", "alba-palm-beach", "apogee-residences-wpb", "berkeley", "forte-on-flagler", "maison-dor", "mandarin-oriental", "mr-c", "olin-palm-beach"];
const destinationCategories = ["hero", "amenities", "residences", "logos", "floorplans", "site-plans", "neighborhood", "misc"];
const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".svg"]);
const rasterExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const args = process.argv.slice(2);
const writeMode = args.includes("--write");
const dryRun = args.includes("--dry-run") || !writeMode;
const projectArg = readFlag("--project");
const projects = projectArg
  ? projectArg.split(",").map((value) => normalizeProjectSlug(value)).filter(Boolean)
  : targetProjects;
const publishedAt = new Date().toISOString();

for (const project of projects) {
  if (!targetProjects.includes(project)) {
    console.error(`Unsupported project for this first publish pass: ${project}`);
    process.exit(2);
  }
}

const existingManifest = readJsonArray(manifestPath);
const existingBySource = new Map(existingManifest.map((entry) => [`${entry.projectSlug}|${entry.sourceRelativePath || entry.sourceAssetRepoPath}|${entry.sourceHash}`, entry]));
const entries = [];

for (const projectSlug of projects) {
  const approvedRoot = path.join(sourceBase, projectSlug, "approved-for-website");
  if (!fs.existsSync(approvedRoot)) {
    entries.push(makeEntry({ projectSlug, sourceAssetRepoPath: approvedRoot, action: "unsupported", reason: "approved warehouse folder not found" }));
    continue;
  }
  for (const sourcePath of walkFiles(approvedRoot).sort((a, b) => a.localeCompare(b))) {
    entries.push(await planPublish(projectSlug, approvedRoot, sourcePath));
  }
}

if (writeMode) {
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.mkdirSync(path.dirname(reportJsonPath), { recursive: true });

  for (const projectSlug of projects) {
    for (const category of destinationCategories) {
      fs.mkdirSync(path.join(destinationBase, projectSlug, category), { recursive: true });
    }
  }

  for (const entry of entries) {
    if (entry.action === "published") {
      fs.mkdirSync(path.dirname(entry._websiteFsPath), { recursive: true });
      await writeOptimizedImage(entry);
    } else if (entry.action === "preserved-pdf") {
      fs.mkdirSync(path.dirname(entry._websiteFsPath), { recursive: true });
      fs.copyFileSync(entry._sourceFsPath, entry._websiteFsPath);
    }
  }

  const finalizedEntries = [];
  for (const entry of entries) {
    if ((entry.action === "published" || entry.action === "preserved-pdf") && fs.existsSync(entry._websiteFsPath)) {
      const outputDimensions = rasterExtensions.has(entry.outputFormat) ? await dimensionsFor(entry._websiteFsPath) : null;
      finalizedEntries.push({
        ...entry,
        outputHash: sha256(entry._websiteFsPath),
        outputSizeBytes: fs.statSync(entry._websiteFsPath).size,
        outputDimensions,
      });
    } else {
      finalizedEntries.push(entry);
    }
  }
  entries.splice(0, entries.length, ...finalizedEntries);

  fs.writeFileSync(manifestPath, `${JSON.stringify(sortManifest(mergeManifest(existingManifest, entries)).map(cleanEntry), null, 2)}\n`);
  fs.writeFileSync(reportJsonPath, `${JSON.stringify(buildReport(entries), null, 2)}\n`);
  fs.writeFileSync(reportMdPath, buildMarkdownReport(entries));
}

const report = buildReport(entries);
console.log(JSON.stringify({
  assetRepoToWebsitePublish: dryRun ? "dry-run" : "write",
  projects,
  scanned: report.summary.filesScanned,
  published: report.summary.actions.published || 0,
  preservedPdf: report.summary.actions["preserved-pdf"] || 0,
  skippedExisting: report.summary.actions["skipped-existing"] || 0,
  conflicts: report.summary.actions.conflict || 0,
  unsupported: report.summary.actions.unsupported || 0,
  convertedImages: report.summary.convertedImages,
  resizedImages: report.summary.resizedImages,
  manifestPath: dryRun ? null : path.relative(websiteRoot, manifestPath),
  reportJsonPath: dryRun ? null : path.relative(websiteRoot, reportJsonPath),
  reportMdPath: dryRun ? null : path.relative(websiteRoot, reportMdPath),
}, null, 2));

async function planPublish(projectSlug, approvedRoot, sourcePath) {
  const originalFilename = path.basename(sourcePath);
  const sourceRelativePath = path.relative(assetRepoRoot, sourcePath);
  const sourceFormat = path.extname(sourcePath).toLowerCase();
  const sourceSizeBytes = fs.statSync(sourcePath).size;
  const sourceHash = sha256(sourcePath);
  const category = classifyDestination(projectSlug, sourcePath, sourceFormat);

  if (isHiddenOrTemp(originalFilename)) {
    return makeEntry({ projectSlug, sourceAssetRepoPath: sourcePath, sourceRelativePath, sourceHash, sourceFormat, sourceSizeBytes, category, action: "unsupported", reason: "hidden or temporary file" });
  }
  if (sourceSizeBytes === 0) {
    return makeEntry({ projectSlug, sourceAssetRepoPath: sourcePath, sourceRelativePath, sourceHash, sourceFormat, sourceSizeBytes, category, action: "unsupported", reason: "zero-byte file" });
  }
  if (sourceFormat === ".pdf") {
    return planPdf(projectSlug, sourcePath, sourceRelativePath, sourceHash, sourceFormat, sourceSizeBytes, category, originalFilename);
  }
  if (!imageExtensions.has(sourceFormat)) {
    return makeEntry({ projectSlug, sourceAssetRepoPath: sourcePath, sourceRelativePath, sourceHash, sourceFormat, sourceSizeBytes, category, action: "unsupported", reason: "unsupported source format" });
  }
  if (sourceFormat === ".svg") {
    return planStaticCopy(projectSlug, sourcePath, sourceRelativePath, sourceHash, sourceFormat, sourceSizeBytes, category, originalFilename, ".svg", "preserved svg logo/icon");
  }
  return planRaster(projectSlug, sourcePath, sourceRelativePath, sourceHash, sourceFormat, sourceSizeBytes, category, originalFilename);
}

async function planRaster(projectSlug, sourcePath, sourceRelativePath, sourceHash, sourceFormat, sourceSizeBytes, category, originalFilename) {
  const sourceDimensions = await dimensionsFor(sourcePath);
  const metadata = await sharp(sourcePath, { failOn: "none" }).metadata();
  const hasAlpha = Boolean(metadata.hasAlpha);
  const maxWidth = maxWidthFor(category);
  const resizeWidth = sourceDimensions?.width && sourceDimensions.width > maxWidth ? maxWidth : null;
  const outputFormat = chooseOutputFormat(sourceFormat, category, hasAlpha);
  const outputFilename = normalizeWebsiteFilename(projectSlug, originalFilename, outputFormat);
  let destinationPath = path.join(destinationBase, projectSlug, category, outputFilename);
  destinationPath = resolveCollision(destinationPath, sourceHash);
  const publicPath = `/${path.relative(path.join(websiteRoot, "public"), destinationPath).split(path.sep).join("/")}`;
  const existing = existingBySource.get(`${projectSlug}|${sourceRelativePath}|${sourceHash}`);
  const existingWebsitePath = existing?.websiteAssetPath ? path.join(websiteRoot, existing.websiteAssetPath) : null;
  if (existingWebsitePath && existing.category === category && fs.existsSync(existingWebsitePath)) {
    return makeEntryFromPlan({
      projectSlug,
      sourcePath,
      sourceRelativePath,
      destinationPath: existingWebsitePath,
      publicPath: existing.publicPath,
      sourceHash,
      sourceFormat,
      sourceSizeBytes,
      sourceDimensions,
      outputFormat: existing.outputFormat,
      outputHash: existing.outputHash || sha256(existingWebsitePath),
      outputSizeBytes: existing.outputSizeBytes || fs.statSync(existingWebsitePath).size,
      outputDimensions: existing.outputDimensions || await dimensionsFor(existingWebsitePath),
      category,
      action: "skipped-existing",
      reason: "already recorded in publish manifest",
    });
  }
  if (fs.existsSync(destinationPath)) {
    return await compareExistingDestination({ projectSlug, sourcePath, sourceRelativePath, destinationPath, publicPath, sourceHash, sourceFormat, sourceSizeBytes, sourceDimensions, outputFormat, category });
  }
  const reasons = [];
  if (outputFormat !== sourceFormat) reasons.push(`converted ${sourceFormat.slice(1)} to ${outputFormat.slice(1)}`);
  if (resizeWidth) reasons.push(`resized to ${resizeWidth}px max width`);
  if (!reasons.length && sourceFormat === ".webp") reasons.push("recompressed webp for website delivery");
  if (!reasons.length) reasons.push("optimized for website delivery");
  return makeEntryFromPlan({ projectSlug, sourcePath, sourceRelativePath, destinationPath, publicPath, sourceHash, sourceFormat, sourceSizeBytes, sourceDimensions, outputFormat, category, action: "published", reason: reasons.join("; "), transform: { resizeWidth, hasAlpha } });
}

function planPdf(projectSlug, sourcePath, sourceRelativePath, sourceHash, sourceFormat, sourceSizeBytes, category, originalFilename) {
  const outputFilename = normalizeWebsiteFilename(projectSlug, originalFilename, ".pdf");
  let destinationPath = path.join(destinationBase, projectSlug, "floorplans", outputFilename);
  destinationPath = resolveCollision(destinationPath, sourceHash);
  const publicPath = `/${path.relative(path.join(websiteRoot, "public"), destinationPath).split(path.sep).join("/")}`;
  const existing = existingBySource.get(`${projectSlug}|${sourceRelativePath}|${sourceHash}`);
  const existingWebsitePath = existing?.websiteAssetPath ? path.join(websiteRoot, existing.websiteAssetPath) : null;
  if (existingWebsitePath && fs.existsSync(existingWebsitePath)) {
    return makeEntryFromPlan({ projectSlug, sourcePath, sourceRelativePath, destinationPath: existingWebsitePath, publicPath: existing.publicPath, sourceHash, sourceFormat, sourceSizeBytes, sourceDimensions: null, outputFormat: ".pdf", outputHash: existing.outputHash || sha256(existingWebsitePath), outputSizeBytes: existing.outputSizeBytes || fs.statSync(existingWebsitePath).size, category: "floorplans", action: "skipped-existing", reason: "already recorded in publish manifest" });
  }
  if (fs.existsSync(destinationPath)) {
    const existingHash = sha256(destinationPath);
    if (existingHash === sourceHash) {
      return makeEntryFromPlan({ projectSlug, sourcePath, sourceRelativePath, destinationPath, publicPath, sourceHash, sourceFormat, sourceSizeBytes, sourceDimensions: null, outputFormat: ".pdf", category: "floorplans", action: "skipped-existing", reason: "pdf already exists with same hash", outputHash: existingHash, outputSizeBytes: fs.statSync(destinationPath).size });
    }
    return makeEntryFromPlan({ projectSlug, sourcePath, sourceRelativePath, destinationPath, publicPath, sourceHash, sourceFormat, sourceSizeBytes, sourceDimensions: null, outputFormat: ".pdf", category: "floorplans", action: "conflict", reason: "destination pdf exists with different content" });
  }
  return makeEntryFromPlan({ projectSlug, sourcePath, sourceRelativePath, destinationPath, publicPath, sourceHash, sourceFormat, sourceSizeBytes, sourceDimensions: null, outputFormat: ".pdf", category: "floorplans", action: "preserved-pdf", reason: "floorplan pdf preserved for website document link" });
}

function planStaticCopy(projectSlug, sourcePath, sourceRelativePath, sourceHash, sourceFormat, sourceSizeBytes, category, originalFilename, outputFormat, reason) {
  const outputFilename = normalizeWebsiteFilename(projectSlug, originalFilename, outputFormat);
  let destinationPath = path.join(destinationBase, projectSlug, category, outputFilename);
  destinationPath = resolveCollision(destinationPath, sourceHash);
  const publicPath = `/${path.relative(path.join(websiteRoot, "public"), destinationPath).split(path.sep).join("/")}`;
  return makeEntryFromPlan({ projectSlug, sourcePath, sourceRelativePath, destinationPath, publicPath, sourceHash, sourceFormat, sourceSizeBytes, sourceDimensions: null, outputFormat, category, action: "published", reason });
}

async function compareExistingDestination(plan) {
  const tempOutput = await renderOptimizedBuffer(plan.sourcePath, plan.outputFormat, maxWidthFor(plan.category));
  const outputHash = crypto.createHash("sha256").update(tempOutput.buffer).digest("hex");
  const existingHash = sha256(plan.destinationPath);
  if (existingHash === outputHash) {
    return makeEntryFromPlan({ ...plan, action: "skipped-existing", reason: "destination already exists with matching optimized output", outputHash: existingHash, outputSizeBytes: fs.statSync(plan.destinationPath).size, outputDimensions: await dimensionsFor(plan.destinationPath) });
  }
  return makeEntryFromPlan({ ...plan, action: "conflict", reason: "destination exists with different optimized output", outputHash: existingHash, outputSizeBytes: fs.statSync(plan.destinationPath).size, outputDimensions: await dimensionsFor(plan.destinationPath) });
}

async function writeOptimizedImage(entry) {
  if (entry.outputFormat === ".svg") {
    fs.copyFileSync(entry._sourceFsPath, entry._websiteFsPath);
    return;
  }
  const { buffer } = await renderOptimizedBuffer(entry._sourceFsPath, entry.outputFormat, maxWidthFor(entry.category));
  fs.writeFileSync(entry._websiteFsPath, buffer);
}

async function renderOptimizedBuffer(sourcePath, outputFormat, maxWidth) {
  const metadata = await sharp(sourcePath, { failOn: "none" }).metadata();
  const resizeWidth = metadata.width && metadata.width > maxWidth ? maxWidth : null;
  let pipeline = sharp(sourcePath, { failOn: "none" }).rotate();
  if (resizeWidth) pipeline = pipeline.resize({ width: resizeWidth, withoutEnlargement: true });
  if (outputFormat === ".webp") pipeline = pipeline.webp({ quality: 84 });
  if (outputFormat === ".jpg" || outputFormat === ".jpeg") pipeline = pipeline.jpeg({ quality: 86, mozjpeg: true });
  if (outputFormat === ".png") pipeline = pipeline.png({ compressionLevel: 9 });
  const buffer = await pipeline.toBuffer();
  return { buffer, pipeline };
}

function chooseOutputFormat(sourceFormat, category, hasAlpha) {
  if (category === "logos" && (sourceFormat === ".png" || hasAlpha)) return ".png";
  if (sourceFormat === ".svg") return ".svg";
  return ".webp";
}

function classifyDestination(projectSlug, sourcePath, sourceFormat) {
  const relative = sourcePath.split(path.sep).join("/").toLowerCase();
  const approvedMarker = "/approved-for-website/";
  const approvedRelative = relative.includes(approvedMarker) ? relative.slice(relative.indexOf(approvedMarker) + approvedMarker.length) : relative;
  const filename = path.basename(sourcePath).toLowerCase();
  const descriptiveFilename = filename.startsWith(`${projectSlug}-`) ? filename.slice(projectSlug.length + 1) : filename;
  const classificationRelative = approvedRelative.replace(filename, descriptiveFilename);
  if (sourceFormat === ".pdf") return "floorplans";
  if (/(^|-)hero(?:-|\.|$)/.test(descriptiveFilename)) return "hero";
  if (/(logo|architect|developer|branding)/.test(classificationRelative)) return "logos";
  if (/(floorplan|floorplans|residence-[a-z0-9]|penthouse|townhouse|lph|unit|stack|plan)/.test(classificationRelative)) return "floorplans";
  if (/(site-plan|map|parcel|location|master-plan)/.test(classificationRelative)) return "site-plans";
  if (/(exterior|aerial|waterfront|building|facade|intracoastal|lake-view|lower-view|wide|\broof\b)/.test(descriptiveFilename)) return "hero";
  if (/(amenities|amenity|pool|fitness|spa|lobby|valet|private-dining|rooftop|lounge)/.test(classificationRelative)) return "amenities";
  if (/(residence|residences|interior|kitchen|bedroom|bathroom|living-room|patio|en-suite)/.test(classificationRelative)) return "residences";
  if (/(neighborhood|clocktower|cityplace|downtown|palm-beach|waterfront-context)/.test(descriptiveFilename)) return "neighborhood";
  return imageExtensions.has(sourceFormat) ? "misc" : "misc";
}

function normalizeWebsiteFilename(projectSlug, filename, outputExtension) {
  let base = stripExtensions(path.basename(filename));
  base = base.replace(/\bmasion\b/g, "maison");
  base = base.replace(/\bweclome\b/g, "welcome");
  base = base.replace(/([a-z])([A-Z])/g, "$1-$2");
  base = base.replace(/[''']/g, "");
  base = base.replace(/_/g, "-");
  base = base.replace(/\b(copy|final|final-final|approved|website|screenshot|image|img)\b/gi, "");
  base = base.replace(/[^a-zA-Z0-9]+/g, "-");
  base = base.replace(/-+/g, "-").replace(/^-|-$/g, "").toLowerCase();
  base = base.replace(/\bamenties\b/g, "amenities");
  base = base.replace(/\bspar\b/g, "spa");
  
  if (projectSlug === "forte-on-flagler" && base.startsWith("forte-") && !base.startsWith("forte-on-flagler-")) {
    base = base.replace(/^forte-/, "forte-on-flagler-");
  }

  if (!base.startsWith(`${projectSlug}-`) && projectSlug === "alba-palm-beach" && base.startsWith("alba-")) {
    // Existing site assets use the full slug in some files, but the approved warehouse uses the clear short Alba prefix.
  } else if (!base.startsWith(`${projectSlug}-`)) {
    base = `${projectSlug}-${base}`;
  }
  return `${base}${outputExtension}`;
}

function resolveCollision(destinationPath, sourceHash) {
  if (!fs.existsSync(destinationPath)) return destinationPath;
  const existingHash = sha256(destinationPath);
  if (existingHash === sourceHash) return destinationPath;
  return destinationPath;
}

function makeEntryFromPlan(values) {
  return {
    projectSlug: values.projectSlug,
    sourceAssetRepoPath: values.sourceRelativePath,
    sourceRelativePath: values.sourceRelativePath,
    websiteAssetPath: path.relative(websiteRoot, values.destinationPath),
    publicPath: values.publicPath,
    sourceHash: values.sourceHash,
    outputHash: values.outputHash || null,
    sourceFormat: values.sourceFormat,
    outputFormat: values.outputFormat,
    sourceSizeBytes: values.sourceSizeBytes,
    outputSizeBytes: values.outputSizeBytes || null,
    sourceDimensions: values.sourceDimensions || null,
    outputDimensions: values.outputDimensions || null,
    category: values.category,
    action: values.action,
    reason: values.reason,
    publishedAt,
    _sourceFsPath: values.sourcePath,
    _websiteFsPath: values.destinationPath,
  };
}

function makeEntry(values) {
  return {
    projectSlug: values.projectSlug,
    sourceAssetRepoPath: values.sourceRelativePath || (values.sourceAssetRepoPath ? path.relative(assetRepoRoot, values.sourceAssetRepoPath) : null),
    sourceRelativePath: values.sourceRelativePath || (values.sourceAssetRepoPath ? path.relative(assetRepoRoot, values.sourceAssetRepoPath) : null),
    websiteAssetPath: null,
    publicPath: null,
    sourceHash: values.sourceHash || null,
    outputHash: null,
    sourceFormat: values.sourceFormat || null,
    outputFormat: null,
    sourceSizeBytes: values.sourceSizeBytes || null,
    outputSizeBytes: null,
    sourceDimensions: null,
    outputDimensions: null,
    category: values.category || null,
    action: values.action,
    reason: values.reason,
    publishedAt,
    _sourceFsPath: values.sourceAssetRepoPath,
    _websiteFsPath: null,
  };
}

function mergeManifest(existing, latestEntries) {
  const byKey = new Map(existing.map((entry) => [manifestKey(entry), entry]));
  for (const entry of latestEntries) {
    const key = manifestKey(entry);
    const previous = byKey.get(key);
    if (previous && entry.action === "skipped-existing") {
      byKey.set(key, {
        ...previous,
        websiteAssetPath: entry.websiteAssetPath || previous.websiteAssetPath,
        publicPath: entry.publicPath || previous.publicPath,
        outputHash: entry.outputHash || previous.outputHash,
        outputSizeBytes: entry.outputSizeBytes || previous.outputSizeBytes,
        sourceDimensions: entry.sourceDimensions || previous.sourceDimensions,
        outputDimensions: entry.outputDimensions || previous.outputDimensions,
        category: entry.category || previous.category,
      });
      continue;
    }
    byKey.set(key, entry);
  }
  return [...byKey.values()];
}

function manifestKey(entry) {
  return `${entry.projectSlug}|${entry.sourceAssetRepoPath}|${entry.sourceHash || entry.reason}`;
}

function sortManifest(items) {
  return [...items].sort((a, b) =>
    (a.projectSlug || "").localeCompare(b.projectSlug || "") ||
    (a.category || "").localeCompare(b.category || "") ||
    (a.publicPath || "").localeCompare(b.publicPath || "")
  );
}

function cleanEntry(entry) {
  const { _sourceFsPath, _websiteFsPath, ...clean } = entry;
  return clean;
}

function buildReport(latestEntries) {
  const actions = countBy(latestEntries, "action");
  const convertedImages = latestEntries.filter((entry) => entry.action === "published" && rasterExtensions.has(entry.sourceFormat) && entry.sourceFormat !== entry.outputFormat).length;
  const resizedImages = latestEntries.filter((entry) => /resized/.test(entry.reason)).length;
  return {
    timestamp: publishedAt,
    mode: dryRun ? "dry-run" : "write",
    sourceRoot: "asset-repo:/",
    sourceApprovedRoots: projects.map((projectSlug) => `public-projects/${projectSlug}/approved-for-website`),
    destinationRoot: "website:public/assets/projects",
    projectsProcessed: projects,
    manifestPath: path.relative(websiteRoot, manifestPath),
    gitStatus: getGitStatus(),
    summary: {
      filesScanned: latestEntries.length,
      actions,
      convertedImages,
      resizedImages,
      finalPublicPaths: latestEntries.filter((entry) => entry.publicPath).map((entry) => entry.publicPath).sort(),
    },
    publishedFiles: latestEntries.filter((entry) => entry.action === "published").map(cleanEntry),
    skippedFiles: latestEntries.filter((entry) => entry.action === "skipped-existing").map(cleanEntry),
    preservedPdfs: latestEntries.filter((entry) => entry.action === "preserved-pdf").map(cleanEntry),
    conflicts: latestEntries.filter((entry) => entry.action === "conflict").map(cleanEntry),
    unsupportedFiles: latestEntries.filter((entry) => entry.action === "unsupported").map(cleanEntry),
    entries: sortManifest(latestEntries).map(cleanEntry),
  };
}

function buildMarkdownReport(latestEntries) {
  const report = buildReport(latestEntries);
  const lines = [
    "# Asset Repo to Website Publish Report",
    "",
    `Generated: ${report.timestamp}`,
    `Mode: ${report.mode}`,
    "",
    "## Summary",
    "",
    `- Source root: \`${report.sourceRoot}\``,
    `- Destination root: \`${report.destinationRoot}\``,
    `- Projects processed: ${report.projectsProcessed.join(", ")}`,
    `- Files scanned: ${report.summary.filesScanned}`,
    `- Published images/SVGs: ${report.summary.actions.published || 0}`,
    `- PDFs preserved: ${report.summary.actions["preserved-pdf"] || 0}`,
    `- Existing files skipped: ${report.summary.actions["skipped-existing"] || 0}`,
    `- Conflicts: ${report.summary.actions.conflict || 0}`,
    `- Unsupported: ${report.summary.actions.unsupported || 0}`,
    `- Images converted: ${report.summary.convertedImages}`,
    `- Images resized/recompressed: ${report.summary.resizedImages}`,
    `- Manifest: \`${report.manifestPath}\``,
    "",
    "## Git Status",
    "",
    `\`\`\`text\n${report.gitStatus}\n\`\`\``,
    "",
    "## Published Files",
    "",
    ...formatList(report.publishedFiles),
    "",
    "## Preserved PDFs",
    "",
    ...formatList(report.preservedPdfs),
    "",
    "## Existing Files Skipped",
    "",
    ...formatList(report.skippedFiles),
    "",
    "## Conflicts",
    "",
    ...formatList(report.conflicts),
    "",
    "## Unsupported Files",
    "",
    ...formatList(report.unsupportedFiles),
    "",
    "## Final Public Paths",
    "",
    ...report.summary.finalPublicPaths.map((publicPath) => `- \`${publicPath}\``),
    "",
  ];
  return `${lines.join("\n")}\n`;
}

function formatList(items) {
  if (!items.length) return ["- None"];
  return items.map((entry) => `- ${entry.projectSlug}: \`${entry.sourceRelativePath}\` -> \`${entry.publicPath || "(none)"}\` (${entry.reason})`);
}

async function dimensionsFor(filePath) {
  try {
    const metadata = await sharp(filePath, { failOn: "none" }).metadata();
    return metadata.width && metadata.height ? { width: metadata.width, height: metadata.height } : null;
  } catch {
    return null;
  }
}

function maxWidthFor(category) {
  if (category === "hero") return 2400;
  if (category === "floorplans" || category === "site-plans") return 3000;
  if (category === "logos") return 1800;
  return 1800;
}

function walkFiles(root) {
  const out = [];
  for (const dirent of fs.readdirSync(root, { withFileTypes: true })) {
    const fullPath = path.join(root, dirent.name);
    if (dirent.isDirectory()) out.push(...walkFiles(fullPath));
    if (dirent.isFile()) out.push(fullPath);
  }
  return out;
}

function readJsonArray(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
  return Array.isArray(parsed) ? parsed : [];
}

function getGitStatus() {
  try {
    return execFileSync("git", ["status", "-sb"], { cwd: websiteRoot, encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

function countBy(items, key) {
  return items.reduce((acc, item) => {
    const value = item[key] || "unknown";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function sha256(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function stripExtensions(filename) {
  let base = filename;
  while (path.extname(base)) {
    base = base.slice(0, base.length - path.extname(base).length);
  }
  return base;
}

function readFlag(flag) {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : null;
}

function normalizeProjectSlug(value) {
  return value.trim().toLowerCase().replace(/_/g, "-");
}

function isHiddenOrTemp(filename) {
  return filename.startsWith(".") || /(~$|\.tmp$|\.temp$|^~\$)/i.test(filename);
}
