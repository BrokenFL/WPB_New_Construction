#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import sharp from "sharp";

const websiteRoot = process.cwd();
const publicRoot = path.join(websiteRoot, "public");
const publicAssetsRoot = path.join(websiteRoot, "public/assets/projects");
const registryPath = path.join(websiteRoot, "data/project_assets.json");
const publishManifestPath = path.join(websiteRoot, "data/generated_asset_publish_manifest.json");
const reportJsonPath = path.join(websiteRoot, "docs/reports/website-asset-reference-refresh-report.json");
const reportMdPath = path.join(websiteRoot, "docs/reports/website-asset-reference-refresh-report.md");
const targetProjects = ["3031-s-ocean-palm-beach", "alba-palm-beach", "berkeley", "forte-on-flagler", "maison-dor", "mandarin-oriental", "mr-c", "olin-palm-beach"];
const galleryPlacements = ["hero", "amenities", "residences", "neighborhood"];
const allowedProjects = new Set(targetProjects);
const args = process.argv.slice(2);
const writeMode = args.includes("--write");
const dryRun = args.includes("--dry-run") || !writeMode;
const projectArg = readFlag("--project");
const projects = projectArg ? [normalizeProjectSlug(projectArg)] : targetProjects;
const timestamp = new Date().toISOString();

for (const project of projects) {
  if (!allowedProjects.has(project)) {
    console.error(`Unsupported project for this first reference refresh: ${project}`);
    process.exit(2);
  }
}

const registry = readJson(registryPath) ?? { projects: {} };
const publishManifest = readJson(publishManifestPath) ?? [];
const existingRegistry = JSON.parse(JSON.stringify(registry));
const refreshedProjects = {};
const reports = [];

for (const projectSlug of projects) {
  const current = registry.projects?.[projectSlug] ?? {
    projectId: projectSlug,
    slug: projectSlug,
    aliases: [projectSlug],
    assets: [],
  };
  const inventory = await scanProjectAssets(projectSlug);
  const existingManualHero = findExistingManualHero(current, inventory);
  const generatedAssets = buildRegistryAssets(projectSlug, inventory, current, existingManualHero);
  const updatedProject = {
    ...current,
    projectId: current.projectId ?? projectSlug,
    slug: current.slug ?? projectSlug,
    aliases: Array.from(new Set([...(current.aliases ?? []), projectSlug])).sort(),
    assets: generatedAssets,
    updatedAt: timestamp,
  };
  refreshedProjects[projectSlug] = updatedProject;
  reports.push(validateProject(projectSlug, inventory, updatedProject, existingManualHero));
}

const nextRegistry = {
  ...registry,
  projects: {
    ...(registry.projects ?? {}),
    ...refreshedProjects,
  },
};

const report = buildReport(reports, nextRegistry);

if (writeMode) {
  fs.mkdirSync(path.dirname(registryPath), { recursive: true });
  fs.mkdirSync(path.dirname(reportJsonPath), { recursive: true });
  fs.writeFileSync(registryPath, `${JSON.stringify(nextRegistry, null, 2)}\n`);
  fs.writeFileSync(reportJsonPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(reportMdPath, renderMarkdown(report));
}

console.log(JSON.stringify({
  websiteAssetReferenceRefresh: dryRun ? "dry-run" : "write",
  projects,
  registryPath: path.relative(websiteRoot, registryPath),
  assets: reports.reduce((sum, item) => sum + item.assetCount, 0),
  galleryAssets: reports.reduce((sum, item) => sum + item.galleryCount, 0),
  floorplans: reports.reduce((sum, item) => sum + item.floorplanCount, 0),
  logos: reports.reduce((sum, item) => sum + item.logoCount, 0),
  warnings: report.warnings.length,
  validationErrors: report.validationErrors.length,
  validationErrorDetails: report.validationErrors.slice(0, 20),
  reportJsonPath: dryRun ? null : path.relative(websiteRoot, reportJsonPath),
  reportMdPath: dryRun ? null : path.relative(websiteRoot, reportMdPath),
}, null, 2));

if (report.validationErrors.length) process.exit(1);

async function scanProjectAssets(projectSlug) {
  const root = path.join(publicAssetsRoot, projectSlug);
  if (!fs.existsSync(root)) return [];
  const files = walkFiles(root)
    .filter((filePath) => !isHiddenOrTemp(path.basename(filePath)))
    .sort((a, b) => a.localeCompare(b));
  const assets = [];
  for (const filePath of files) {
    const category = path.relative(path.join(publicAssetsRoot, projectSlug), path.dirname(filePath)).split(path.sep)[0] || "misc";
    const ext = path.extname(filePath).toLowerCase();
    const dimensions = await dimensionsFor(filePath, ext);
    const publicPath = `/${path.relative(publicRoot, filePath).split(path.sep).join("/")}`;
    assets.push({
      projectSlug,
      filePath,
      publicPath,
      filename: path.basename(filePath),
      category: normalizeCategory(category),
      placement: placementForCategory(category),
      format: ext.replace(/^\./, ""),
      sizeBytes: fs.statSync(filePath).size,
      width: dimensions?.width,
      height: dimensions?.height,
      manifestEntry: publishManifest.find((entry) => entry.publicPath === publicPath),
    });
  }
  return assets;
}

function buildRegistryAssets(projectSlug, inventory, current, existingManualHero) {
  const currentBySrc = new Map((current.assets ?? []).map((asset) => [asset.src, asset]));
  const heroChoice = existingManualHero ?? chooseHero(inventory);
  const ordered = sortForRegistry(inventory);
  const items = [];
  for (const asset of ordered) {
    if (!isRegistryEligible(asset)) continue;
    const existing = currentBySrc.get(asset.publicPath);
    const placement = asset.publicPath === heroChoice?.src || asset.publicPath === heroChoice?.publicPath ? "hero" : asset.placement;
    const variant = variantFor(asset, placement, asset.publicPath === heroChoice?.src || asset.publicPath === heroChoice?.publicPath);
    items.push({
      placement,
      variant,
      src: asset.publicPath,
      publicPath: asset.publicPath,
      filename: asset.filename,
      category: asset.category,
      format: asset.format,
      sizeBytes: asset.sizeBytes,
      ...(asset.width ? { width: asset.width } : {}),
      ...(asset.height ? { height: asset.height } : {}),
      alt: existing?.alt ?? generatedAlt(projectSlug, asset, placement),
      title: existing?.title ?? titleFromFilename(asset.filename),
      credit: existing?.credit ?? `${titleProject(projectSlug)} project marketing materials`,
      source: "approved-asset-publisher",
      status: "approved",
      ...(existing?.notes ? { notes: existing.notes } : {}),
    });
  }
  return dedupeBySrc(items).sort((a, b) => placementRank(a.placement, a.variant) - placementRank(b.placement, b.variant) || a.src.localeCompare(b.src));
}

function findExistingManualHero(project, inventory) {
  const candidates = (project.assets ?? []).filter((asset) => asset.placement === "hero" && asset.status === "approved" && asset.src?.startsWith("/assets/"));
  const orderedCandidates = [
    ...candidates.filter((asset) => asset.variant === "primary"),
    ...candidates.filter((asset) => asset.variant !== "primary"),
  ];
  for (const asset of orderedCandidates) {
    const localPath = path.join(publicRoot, asset.src.replace(/^\//, ""));
    if (fs.existsSync(localPath) && inventory.some((item) => item.publicPath === asset.src)) return asset;
  }
  return null;
}

function chooseHero(inventory) {
  const candidates = inventory.filter((asset) => asset.category === "hero" && isGallerySafe(asset));
  return candidates.sort((a, b) => heroScore(b) - heroScore(a) || a.publicPath.localeCompare(b.publicPath))[0] ?? null;
}

function heroScore(asset) {
  const name = asset.filename.toLowerCase();
  let score = 0;
  for (const token of ["hero", "exterior", "aerial", "waterfront", "intracoastal", "lake-view", "building", "facade", "wide"]) {
    if (name.includes(token)) score += 10;
  }
  for (const token of ["logo", "floorplan", "pdf", "map", "site-plan", "thumbnail"]) {
    if (name.includes(token)) score -= 50;
  }
  if (asset.width) score += Math.min(asset.width / 100, 30);
  return score;
}

function validateProject(projectSlug, inventory, project, existingManualHero) {
  const validationErrors = [];
  const warnings = [];
  const seen = new Set();
  const gallery = project.assets.filter((asset) => galleryPlacements.includes(asset.placement) && isGalleryFormat(asset.format));
  const floorplans = project.assets.filter((asset) => asset.placement === "floorplans");
  const logos = project.assets.filter((asset) => asset.placement === "logos");
  const hero = project.assets.find((asset) => asset.placement === "hero" && asset.variant === "primary") ?? project.assets.find((asset) => asset.placement === "hero");
  for (const asset of project.assets) {
    if (!asset.src?.startsWith("/assets/")) validationErrors.push(`${projectSlug}: invalid public path ${asset.src ?? "(missing)"}`);
    if (localPathLeakPattern().test(JSON.stringify(asset))) {
      validationErrors.push(`${projectSlug}: local/source path leak in ${asset.src}`);
    }
    if (seen.has(asset.src)) validationErrors.push(`${projectSlug}: duplicate public path ${asset.src}`);
    seen.add(asset.src);
    const localPath = path.join(publicRoot, asset.src.replace(/^\//, ""));
    if (!fs.existsSync(localPath)) validationErrors.push(`${projectSlug}: missing file ${asset.src}`);
  }
  for (const asset of gallery) {
    if (!isGalleryFormat(asset.format)) validationErrors.push(`${projectSlug}: unsupported gallery format ${asset.src}`);
  }
  if (!hero) validationErrors.push(`${projectSlug}: missing hero asset after refresh`);
  if (projectSlug === "berkeley" && !project.assets.length) validationErrors.push("berkeley: registry still missing after refresh");
  if (!inventory.length) warnings.push(`${projectSlug}: no public assets found`);
  return {
    projectSlug,
    assetCount: project.assets.length,
    assetsByCategory: countBy(inventory, "category"),
    heroSelected: hero?.src ?? null,
    heroMode: existingManualHero ? "preserved-existing" : "selected-from-public-assets",
    galleryCount: gallery.length,
    floorplanCount: floorplans.length,
    logoCount: logos.length,
    pathsValidated: project.assets.length - validationErrors.length,
    skippedAssets: inventory.filter((asset) => !isRegistryEligible(asset)).map((asset) => asset.publicPath),
    warnings,
    validationErrors,
  };
}

function buildReport(projectReports, nextRegistry) {
  const validationErrors = projectReports.flatMap((item) => item.validationErrors);
  const warnings = projectReports.flatMap((item) => item.warnings);
  return {
    timestamp,
    mode: dryRun ? "dry-run" : "write",
    registryFile: path.relative(websiteRoot, registryPath),
    projectsRefreshed: projects,
    assetRoot: "public/assets/projects",
    usedPublishManifest: fs.existsSync(publishManifestPath),
    changedCuratedContent: false,
    gitStatus: gitStatus(),
    projects: projectReports,
    validationErrors,
    warnings,
    registryPreview: Object.fromEntries(projects.map((project) => [project, nextRegistry.projects[project]])),
  };
}

function renderMarkdown(report) {
  return [
    "# Website Asset Reference Refresh Report",
    "",
    `Generated: ${report.timestamp}`,
    `Mode: ${report.mode}`,
    "",
    "## Summary",
    "",
    `- Registry file: \`${report.registryFile}\``,
    `- Projects refreshed: ${report.projectsRefreshed.join(", ")}`,
    `- Asset root: \`${report.assetRoot}\``,
    `- Used publish manifest: ${report.usedPublishManifest ? "yes" : "no"}`,
    `- Curated content changed: ${report.changedCuratedContent ? "yes" : "no"}`,
    `- Validation errors: ${report.validationErrors.length}`,
    `- Warnings: ${report.warnings.length}`,
    "",
    "## Project Results",
    "",
    ...report.projects.flatMap((project) => [
      `### ${project.projectSlug}`,
      "",
      `- Assets: ${project.assetCount}`,
      `- Hero: \`${project.heroSelected ?? "none"}\` (${project.heroMode})`,
      `- Gallery count: ${project.galleryCount}`,
      `- Floorplans: ${project.floorplanCount}`,
      `- Logos: ${project.logoCount}`,
      `- Assets by category: \`${JSON.stringify(project.assetsByCategory)}\``,
      `- Skipped assets: ${project.skippedAssets.length ? project.skippedAssets.map((item) => `\`${item}\``).join(", ") : "none"}`,
      "",
    ]),
    "## Validation",
    "",
    ...(report.validationErrors.length ? report.validationErrors.map((item) => `- ${item}`) : ["- All registry paths validated."]),
    "",
    "## Warnings",
    "",
    ...(report.warnings.length ? report.warnings.map((item) => `- ${item}`) : ["- None"]),
    "",
    "## Git Status",
    "",
    `\`\`\`text\n${report.gitStatus}\n\`\`\``,
    "",
  ].join("\n");
}

function sortForRegistry(inventory) {
  return [...inventory].sort((a, b) => categoryRank(a.category) - categoryRank(b.category) || heroScore(b) - heroScore(a) || a.publicPath.localeCompare(b.publicPath));
}

function isRegistryEligible(asset) {
  return asset.publicPath.startsWith("/assets/") && ["webp", "jpg", "jpeg", "png", "svg", "pdf"].includes(asset.format);
}

function isGallerySafe(asset) {
  return isGalleryFormat(asset.format) && galleryPlacements.includes(asset.placement);
}

function isGalleryFormat(format) {
  return ["webp", "jpg", "jpeg", "png"].includes(format);
}

function placementForCategory(category) {
  const normalized = normalizeCategory(category);
  if (normalized === "site-plans") return "sitePlans";
  return normalized;
}

function normalizeCategory(category) {
  if (category === "site-plans" || category === "sitePlans") return "site-plans";
  return category || "misc";
}

function variantFor(asset, placement, isPrimaryHero) {
  if (placement === "hero" && isPrimaryHero) return "primary";
  const base = asset.filename.replace(/\.[^.]+$/, "").replace(new RegExp(`^${asset.projectSlug}-`), "");
  return base
    .replace(/^(hero|amenities|amenity|residences|residence|floorplans|floorplan|logos|logo|neighborhood)-/, "")
    .replace(/-v\d+$/i, "") || placement;
}

function generatedAlt(projectSlug, asset, placement) {
  const projectName = titleProject(projectSlug);
  if (placement === "floorplans") return `${projectName} ${titleFromFilename(asset.filename)} floor plan`;
  if (placement === "logos") return `${projectName} ${titleFromFilename(asset.filename)} logo`;
  return `${projectName} ${titleFromFilename(asset.filename)}`;
}

function titleFromFilename(filename) {
  return filename
    .replace(/\.[^.]+$/, "")
    .replace(/^(alba|alba-palm-beach|berkeley)-/, "")
    .replace(/-v\d+$/i, "")
    .split("-")
    .filter(Boolean)
    .map((part) => part.toUpperCase() === "LPH" ? "LPH" : part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function titleProject(projectSlug) {
  if (projectSlug === "alba-palm-beach") return "Alba Palm Beach";
  if (projectSlug === "berkeley") return "The Berkeley";
  if (projectSlug === "forte-on-flagler") return "Forte on Flagler";
  if (projectSlug === "maison-dor") return "Maison d'Or";
  if (projectSlug === "mandarin-oriental") return "Mandarin Oriental";
  if (projectSlug === "mr-c") return "Mr. C";
  return titleFromFilename(projectSlug);
}

function categoryRank(category) {
  return { hero: 0, amenities: 1, residences: 2, neighborhood: 3, misc: 4, logos: 5, floorplans: 6, "site-plans": 7 }[category] ?? 9;
}

function placementRank(placement, variant) {
  if (placement === "hero" && variant === "primary") return 0;
  return { hero: 1, amenities: 2, residences: 3, neighborhood: 4, misc: 5, logos: 6, floorplans: 7, sitePlans: 8 }[placement] ?? 9;
}

function dedupeBySrc(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.src)) return false;
    seen.add(item.src);
    return true;
  });
}

async function dimensionsFor(filePath, ext) {
  if (![".webp", ".jpg", ".jpeg", ".png"].includes(ext)) return null;
  try {
    const metadata = await sharp(filePath, { failOn: "none" }).metadata();
    return metadata.width && metadata.height ? { width: metadata.width, height: metadata.height } : null;
  } catch {
    return null;
  }
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

function countBy(items, key) {
  return items.reduce((acc, item) => {
    const value = item[key] ?? "unknown";
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});
}

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readFlag(flag) {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : null;
}

function normalizeProjectSlug(value) {
  return String(value || "").trim().toLowerCase().replace(/_/g, "-");
}

function isHiddenOrTemp(filename) {
  return filename.startsWith(".") || /(~$|\.tmp$|\.temp$|^~\$)/i.test(filename);
}

function gitStatus() {
  try {
    return execFileSync("git", ["status", "-sb"], { cwd: websiteRoot, encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

function localPathLeakPattern() {
  const blocked = [
    String.raw`\/Users\/`,
    String.raw`\/Volumes\/`,
    "iCloud",
    ["WPB", "NewConstruction", "Assets"].join("_"),
    ["source", "material"].join("_"),
    ["source", "repos"].join("-"),
  ];
  return new RegExp(blocked.join("|"), "i");
}
