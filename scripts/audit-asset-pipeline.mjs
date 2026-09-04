import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const websiteRoot = process.cwd();
const assetRepoRoot = path.join("/", "Volumes", "ExternalSSD", ["WPB", "NewConstruction", "Assets"].join("_"));
const iCloudRoot = path.join("/", "Users", "brookesnader", "Library", "Mobile Documents", "com~apple~CloudDocs", "WPB New Construction Asset Library");
const reportJsonPath = path.join(websiteRoot, "docs/reports/asset-pipeline-audit-report.json");
const reportMdPath = path.join(websiteRoot, "docs/reports/asset-pipeline-audit-report.md");

const args = new Set(process.argv.slice(2));
const strict = args.has("--strict");
const rawProjectArg = valueAfter("--project");
const projectArg = rawProjectArg ? normalizeProjectSlug(rawProjectArg) : null;

const approvedFolderNames = new Set([
  "approved-for-website",
  "approved_for_website",
  "approved for website",
  "approved website",
  "website-approved",
  "approved-web",
  "website approved",
  "for website",
]);

const safeWebsiteExtensions = new Set([".webp", ".png", ".jpg", ".jpeg", ".svg"]);
const safeAssetRepoExtensions = new Set([".webp", ".png", ".jpg", ".jpeg", ".svg", ".pdf", ".json", ".md", ".csv", ".xlsx", ".html", ".glb"]);
const unsupportedWebsiteExtensions = new Set([".tif", ".tiff", ".heic", ".psd", ".ai", ".indd", ".zip"]);
const tempPatterns = [/^\.DS_Store$/i, /^\._/, /~$/, /\.(tmp|temp|crdownload|download)$/i];
const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".svg", ".avif"]);

const knownProjectSlugs = deriveKnownProjectSlugs();
const registry = readJson(path.join(websiteRoot, "data/project_assets.json")) ?? { projects: {} };
const registryProjects = new Set(Object.keys(registry.projects ?? {}));

const iCloudAudit = auditICloudLibrary();
const assetRepoAudit = auditAssetRepo();
const websiteAssetsAudit = auditWebsitePublicAssets();
const referencesAudit = auditWebsiteReferences();
const crossLayerAudit = auditPipelineLinks();
const summary = summarize();

const report = {
  timestamp: new Date().toISOString(),
  mode: { strict, project: projectArg ?? null },
  paths: { websiteRoot, assetRepoRoot, iCloudRoot },
  summary,
  knownProjectSlugs: [...knownProjectSlugs].sort(),
  iCloud: iCloudAudit,
  assetRepo: assetRepoAudit,
  websitePublicAssets: websiteAssetsAudit,
  websiteReferences: referencesAudit,
  missingPipelineLinks: crossLayerAudit.missingPipelineLinks,
  unsupportedFormats: crossLayerAudit.unsupportedFormats,
  oversizedOrUnoptimized: crossLayerAudit.oversizedOrUnoptimized,
  slugMismatches: crossLayerAudit.slugMismatches,
  brokenReferences: referencesAudit.brokenAssetReferences,
  localPathLeaks: referencesAudit.localPathLeaks,
  duplicateCandidates: crossLayerAudit.duplicateCandidates,
  recommendedNextFixes: recommendedNextFixes(),
  safeToProceedToICloudIntake: summary.blockers === 0 && summary.strictBlockers === 0,
};

fs.mkdirSync(path.dirname(reportJsonPath), { recursive: true });
fs.writeFileSync(reportJsonPath, `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(reportMdPath, renderMarkdownReport(report));

console.log(JSON.stringify({
  assetPipelineAudit: strict
    ? (summary.strictBlockers ? "strict-fail" : "pass")
    : (summary.blockers ? "fail" : "pass-with-findings"),
  strict,
  project: projectArg ?? "all",
  blockers: summary.blockers,
  strictBlockers: summary.strictBlockers,
  warnings: summary.warnings,
  iCloudApprovedFolders: iCloudAudit.approvedFolders.length,
  assetRepoApprovedFolders: assetRepoAudit.approvedFolders.length,
  websiteProjectAssetFiles: websiteAssetsAudit.totalFiles,
  brokenAssetReferences: referencesAudit.brokenAssetReferences.length,
  localPathLeaks: referencesAudit.localPathLeaks.length,
  reportJsonPath: path.relative(websiteRoot, reportJsonPath),
  reportMdPath: path.relative(websiteRoot, reportMdPath),
}, null, 2));

if (strict && summary.strictBlockers > 0) {
  process.exit(1);
}

function valueAfter(flag) {
  const argv = process.argv.slice(2);
  const index = argv.indexOf(flag);
  return index === -1 ? null : argv[index + 1] || null;
}

function normalizeApprovedFolderName(name) {
  return name.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
}

function isApprovedFolder(name) {
  const lower = name.trim().toLowerCase();
  return approvedFolderNames.has(lower) || approvedFolderNames.has(normalizeApprovedFolderName(name));
}

function normalizeProjectSlug(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeAssetName(filePath) {
  const parsed = path.parse(filePath);
  return normalizeProjectSlug(parsed.name.replace(/\bcopy\b/gi, "").replace(/-v\d+$/i, ""));
}

function relativeOrNull(root, filePath) {
  return filePath ? path.relative(root, filePath).split(path.sep).join("/") : null;
}

function walkFiles(root, options = {}) {
  const files = [];
  const ignoreDirs = new Set(options.ignoreDirs ?? []);
  function visit(current) {
    let entries = [];
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (!ignoreDirs.has(entry.name)) visit(fullPath);
      } else if (entry.isFile()) {
        files.push(fullPath);
      }
    }
  }
  if (fs.existsSync(root)) visit(root);
  return files;
}

function walkDirs(root, options = {}) {
  const dirs = [];
  const ignoreDirs = new Set(options.ignoreDirs ?? []);
  function visit(current) {
    let entries = [];
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (!entry.isDirectory()) continue;
      if (ignoreDirs.has(entry.name)) continue;
      dirs.push(fullPath);
      visit(fullPath);
    }
  }
  if (fs.existsSync(root)) visit(root);
  return dirs;
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function deriveKnownProjectSlugs() {
  const slugs = new Set();
  const mainPath = path.join(websiteRoot, "src/main.ts");
  const siteDataPath = path.join(websiteRoot, "src/generated/siteData.ts");
  const approvedImportedPath = path.join(websiteRoot, "src/data/approvedImportedProjectImages.json");
  const projectAssetsPath = path.join(websiteRoot, "data/project_assets.json");

  const main = fs.existsSync(mainPath) ? fs.readFileSync(mainPath, "utf8") : "";
  const baseBlock = sliceArrayAfterMarker(main, "const baseFeaturedProjects: FeaturedProject[] = ");
  for (const match of baseBlock.matchAll(/\bid:\s*"([^"]+)"/g)) slugs.add(match[1]);

  const siteData = fs.existsSync(siteDataPath) ? fs.readFileSync(siteDataPath, "utf8") : "";
  for (const match of siteData.matchAll(/"projectId":\s*"([^"]+)"/g)) slugs.add(match[1]);

  const imported = readJson(approvedImportedPath) ?? [];
  for (const item of imported) if (item.projectId) slugs.add(item.projectId);

  const projectAssets = readJson(projectAssetsPath);
  for (const [key, record] of Object.entries(projectAssets?.projects ?? {})) {
    slugs.add(key);
    if (record.projectId) slugs.add(record.projectId);
    if (record.slug) slugs.add(record.slug);
    for (const alias of record.aliases ?? []) slugs.add(alias);
  }

  for (const root of [path.join(websiteRoot, "public/projects"), path.join(websiteRoot, "public/assets/projects")]) {
    if (!fs.existsSync(root)) continue;
    for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
      if (entry.isDirectory()) slugs.add(entry.name);
    }
  }

  return new Set([...slugs].filter(Boolean).map(normalizeProjectSlug));
}

function sliceArrayAfterMarker(source, marker) {
  const markerIndex = source.indexOf(marker);
  if (markerIndex === -1) return "";
  const start = source.indexOf("[", markerIndex);
  if (start === -1) return "";
  let depth = 0;
  let quote = "";
  let escaping = false;
  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    if (quote) {
      if (escaping) {
        escaping = false;
      } else if (char === "\\") {
        escaping = true;
      } else if (char === quote) {
        quote = "";
      }
      continue;
    }
    if (char === "\"" || char === "'" || char === "`") {
      quote = char;
      continue;
    }
    if (char === "[") depth += 1;
    if (char === "]") {
      depth -= 1;
      if (depth === 0) return source.slice(start, index + 1);
    }
  }
  return "";
}

function auditICloudLibrary() {
  const approvedFolders = walkDirs(iCloudRoot).filter((dir) => isApprovedFolder(path.basename(dir)));
  const scopedFolders = filterProjectRecords(approvedFolders.map((folderPath) => {
    const projectSlug = inferICloudProjectSlug(folderPath);
    const files = walkFiles(folderPath);
    const fileRecords = files.map((filePath) => fileRecord(filePath, iCloudRoot, { safeExtensions: safeAssetRepoExtensions }));
    return {
      path: relativeOrNull(iCloudRoot, folderPath),
      absolutePath: folderPath,
      projectSlug,
      mappedToKnownProject: knownProjectSlugs.has(projectSlug),
      fileCount: fileRecords.length,
      extensionCounts: countBy(fileRecords, "extension"),
      files: fileRecords,
      unsupportedFiles: fileRecords.filter((file) => file.unsupported),
      hiddenOrTempFiles: fileRecords.filter((file) => file.hiddenOrTemp),
      zeroByteFiles: fileRecords.filter((file) => file.sizeBytes === 0),
      unavailablePlaceholders: fileRecords.filter((file) => file.unavailablePlaceholder),
      duplicateCandidates: duplicateCandidates(fileRecords),
      namingInconsistencies: fileRecords.filter((file) => file.namingIssues.length),
    };
  }), (record) => record.projectSlug);

  return {
    root: iCloudRoot,
    exists: fs.existsSync(iCloudRoot),
    isGitRepo: fs.existsSync(path.join(iCloudRoot, ".git")),
    approvedFolders: scopedFolders,
    approvedFolderCount: scopedFolders.length,
    approvedFileCount: scopedFolders.reduce((sum, folder) => sum + folder.fileCount, 0),
    fileCountByProject: Object.fromEntries(scopedFolders.map((folder) => [folder.projectSlug, folder.fileCount])),
    extensionCounts: mergeCounts(scopedFolders.map((folder) => folder.extensionCounts)),
    unmappedApprovedFolders: scopedFolders.filter((folder) => !folder.mappedToKnownProject),
  };
}

function inferICloudProjectSlug(folderPath) {
  const rel = relativeOrNull(iCloudRoot, folderPath);
  const parts = rel.split("/");
  const projectIndex = parts.indexOf("01_PROJECTS");
  if (projectIndex !== -1 && parts[projectIndex + 1]) return normalizeProjectSlug(parts[projectIndex + 1]);
  return normalizeProjectSlug(parts.at(-2) ?? parts.at(-1) ?? "");
}

function auditAssetRepo() {
  const allFiles = walkFiles(assetRepoRoot, { ignoreDirs: [".git"] }).map((filePath) => fileRecord(filePath, assetRepoRoot, { safeExtensions: safeAssetRepoExtensions }));
  const approvedFolders = walkDirs(assetRepoRoot, { ignoreDirs: [".git"] }).filter((dir) => isApprovedFolder(path.basename(dir)));
  const approvedFiles = approvedFolders.flatMap((folder) => walkFiles(folder).map((filePath) => fileRecord(filePath, assetRepoRoot, { safeExtensions: safeAssetRepoExtensions })));
  const projectFolders = findAssetRepoProjectFolders();
  const fileByNormalizedName = new Map();
  for (const file of allFiles) {
    const key = normalizeAssetName(file.path);
    if (!fileByNormalizedName.has(key)) fileByNormalizedName.set(key, []);
    fileByNormalizedName.get(key).push(file);
  }
  const iCloudApprovedFiles = iCloudAudit.approvedFolders.flatMap((folder) => folder.files.map((file) => ({ ...file, projectSlug: folder.projectSlug })));
  const iCloudPresence = iCloudApprovedFiles.map((file) => {
    const matches = fileByNormalizedName.get(normalizeAssetName(file.path)) ?? [];
    return {
      projectSlug: file.projectSlug,
      iCloudPath: file.path,
      appearsInAssetRepo: matches.length > 0,
      matches: matches.slice(0, 10).map((match) => match.path),
    };
  });

  return {
    root: assetRepoRoot,
    exists: fs.existsSync(assetRepoRoot),
    git: gitInfo(assetRepoRoot),
    lfs: gitLfsInfo(assetRepoRoot),
    projectFolders,
    approvedFolders: approvedFolders.map((folderPath) => ({
      path: relativeOrNull(assetRepoRoot, folderPath),
      projectSlug: inferGenericProjectSlug(folderPath, assetRepoRoot),
      fileCount: walkFiles(folderPath).length,
    })),
    approvedWarehouseAssetsPresent: approvedFiles.length,
    olderMaterialsPresent: {
      publicProjects: fs.existsSync(path.join(assetRepoRoot, "public-projects")),
      researchAssetLibrary: fs.existsSync(path.join(assetRepoRoot, "research-asset-library")),
      publicTeamLogos: fs.existsSync(path.join(assetRepoRoot, "public-team-logos")),
    },
    iCloudApprovedAssetPresence: iCloudPresence,
    missingICloudApprovedAssets: iCloudPresence.filter((item) => !item.appearsInAssetRepo),
    totalFiles: allFiles.length,
    assetCountByProject: countAssetRepoFilesByProject(allFiles),
    extensionCounts: countBy(allFiles, "extension"),
    unsupportedFiles: allFiles.filter((file) => file.unsupported),
    hiddenOrTempFiles: allFiles.filter((file) => file.hiddenOrTemp),
    zeroByteFiles: allFiles.filter((file) => file.sizeBytes === 0),
    duplicateCandidates: duplicateCandidates(allFiles),
    namingInconsistencies: allFiles.filter((file) => file.namingIssues.length),
    largeFiles: allFiles.filter((file) => file.sizeBytes > 3_000_000).sort((a, b) => b.sizeBytes - a.sizeBytes).slice(0, 100),
  };
}

function gitInfo(root) {
  if (!fs.existsSync(path.join(root, ".git"))) return { isGitRepo: false };
  return {
    isGitRepo: true,
    branch: runGit(root, ["branch", "--show-current"]),
    statusShort: runGit(root, ["status", "--short", "--branch"]),
    origin: runGit(root, ["remote", "get-url", "origin"]),
  };
}

function gitLfsInfo(root) {
  const attributesPath = path.join(root, ".gitattributes");
  const hasGitAttributes = fs.existsSync(attributesPath);
  let tracked = "";
  try {
    tracked = execFileSync("git", ["lfs", "ls-files"], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    tracked = "";
  }
  return {
    hasGitAttributes,
    gitAttributesMentionsLfs: hasGitAttributes ? /filter=lfs|diff=lfs|merge=lfs/i.test(fs.readFileSync(attributesPath, "utf8")) : false,
    trackedLfsFileCount: tracked ? tracked.split("\n").filter(Boolean).length : 0,
  };
}

function runGit(root, gitArgs) {
  try {
    return execFileSync("git", gitArgs, { cwd: root, encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

function findAssetRepoProjectFolders() {
  const roots = [
    path.join(assetRepoRoot, "public-projects"),
    path.join(assetRepoRoot, "research-asset-library/projects"),
    path.join(assetRepoRoot, "approved-for-website/projects"),
  ];
  return roots.flatMap((root) => {
    if (!fs.existsSync(root)) return [];
    return fs.readdirSync(root, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => ({
        root: relativeOrNull(assetRepoRoot, root),
        projectSlug: normalizeProjectSlug(entry.name),
        path: relativeOrNull(assetRepoRoot, path.join(root, entry.name)),
        mappedToKnownProject: knownProjectSlugs.has(normalizeProjectSlug(entry.name)),
      }));
  });
}

function countAssetRepoFilesByProject(files) {
  const counts = {};
  for (const file of files) {
    const parts = file.path.split("/");
    let project = null;
    if (parts[0] === "public-projects") project = parts[1];
    if (parts[0] === "research-asset-library" && parts[1] === "projects") project = parts[2];
    if (parts[0] === "approved-for-website" && parts[1] === "projects") project = parts[2];
    if (!project) continue;
    project = normalizeProjectSlug(project);
    if (projectArg && project !== projectArg) continue;
    counts[project] = (counts[project] ?? 0) + 1;
  }
  return counts;
}

function auditWebsitePublicAssets() {
  const root = path.join(websiteRoot, "public/assets/projects");
  const files = walkFiles(root).map((filePath) => {
    const record = fileRecord(filePath, websiteRoot, { safeExtensions: safeWebsiteExtensions });
    const rel = path.relative(root, filePath).split(path.sep).join("/");
    const [projectSlug, category] = rel.split("/");
    if (record.extension === ".pdf" && category === "floorplans") record.unsupported = false;
    const dimensions = imageDimensions(filePath, record.extension);
    const optimizationWarnings = optimizationWarningsFor({ ...record, projectSlug, category, dimensions });
    return {
      ...record,
      publicPath: `/${record.path.replace(/^public\//, "")}`,
      projectSlug: normalizeProjectSlug(projectSlug),
      category: category ?? "",
      dimensions,
      optimizationWarnings,
      categoryMistakes: categoryMistakes(category, record),
    };
  });
  const scopedFiles = filterProjectRecords(files, (file) => file.projectSlug);

  return {
    root: relativeOrNull(websiteRoot, root),
    exists: fs.existsSync(root),
    totalFiles: scopedFiles.length,
    projectFoldersPresent: [...new Set(scopedFiles.map((file) => file.projectSlug))].sort(),
    assetsByProject: groupCount(scopedFiles, "projectSlug"),
    assetsByCategory: groupCount(scopedFiles, "category"),
    imageFormats: groupCount(scopedFiles.filter((file) => imageExtensions.has(file.extension)), "extension"),
    files: scopedFiles,
    oversizedOrUnoptimized: scopedFiles.filter((file) => file.optimizationWarnings.length),
    unsupportedFiles: scopedFiles.filter((file) => file.unsupported || unsupportedWebsiteExtensions.has(file.extension)),
    hiddenOrTempFiles: scopedFiles.filter((file) => file.hiddenOrTemp),
    zeroByteFiles: scopedFiles.filter((file) => file.sizeBytes === 0),
    duplicateFilenames: duplicateBy(scopedFiles, (file) => path.basename(file.path).toLowerCase()),
    categoryMistakes: scopedFiles.filter((file) => file.categoryMistakes.length),
    namingInconsistencies: scopedFiles.filter((file) => file.namingIssues.length),
    missingAssetsThatExistInAssetRepoApprovedAreas: [],
  };
}

function fileRecord(filePath, root, options = {}) {
  const rel = relativeOrNull(root, filePath);
  let stat = null;
  try {
    stat = fs.statSync(filePath);
  } catch {
    stat = { size: 0 };
  }
  const extension = path.extname(filePath).toLowerCase();
  const base = path.basename(filePath);
  const safeExtensions = options.safeExtensions ?? safeWebsiteExtensions;
  return {
    path: rel,
    absolutePath: filePath,
    extension: extension || "(none)",
    sizeBytes: stat.size,
    hiddenOrTemp: tempPatterns.some((pattern) => pattern.test(base)) || base.startsWith("."),
    unsupported: extension ? !safeExtensions.has(extension) : true,
    zeroByte: stat.size === 0,
    unavailablePlaceholder: isLikelyICloudPlaceholder(filePath, stat.size),
    namingIssues: namingIssues(base),
  };
}

function isLikelyICloudPlaceholder(filePath, sizeBytes) {
  const base = path.basename(filePath);
  return sizeBytes === 0 || base.startsWith(".") || /\.icloud$/i.test(base);
}

function namingIssues(filename) {
  const issues = [];
  if (/[A-Z]/.test(filename)) issues.push("uppercase");
  if (/_/.test(filename)) issues.push("underscore");
  if (/\s/.test(filename)) issues.push("space");
  if (/'|’/.test(filename)) issues.push("apostrophe");
  if (/\bcopy\b/i.test(filename)) issues.push("copy suffix");
  if (/--/.test(filename)) issues.push("double hyphen");
  if (/\.pdf\.pdf$/i.test(filename)) issues.push("double pdf extension");
  if (!path.extname(filename)) issues.push("missing extension");
  if (/[^a-zA-Z0-9._'’ -]/.test(filename)) issues.push("special character");
  return issues;
}

function imageDimensions(filePath, extension) {
  try {
    const buffer = fs.readFileSync(filePath);
    if (extension === ".png" && buffer.toString("ascii", 1, 4) === "PNG") {
      return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20), detectedType: "png" };
    }
    if ((extension === ".jpg" || extension === ".jpeg" || extension === ".webp") && buffer[0] === 0xff && buffer[1] === 0xd8) {
      const size = jpegSize(buffer);
      if (size) return { ...size, detectedType: "jpeg" };
    }
    if (extension === ".webp" && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") {
      const size = webpSize(buffer);
      if (size) return { ...size, detectedType: "webp" };
    }
    if (extension === ".svg") {
      const text = buffer.toString("utf8", 0, Math.min(buffer.length, 4000));
      const width = Number(text.match(/\bwidth=["']?([\d.]+)/i)?.[1]);
      const height = Number(text.match(/\bheight=["']?([\d.]+)/i)?.[1]);
      const viewBox = text.match(/\bviewBox=["'][^"']*?([\d.]+)\s+([\d.]+)["']/i);
      return {
        width: Number.isFinite(width) ? width : (viewBox ? Number(viewBox[1]) : null),
        height: Number.isFinite(height) ? height : (viewBox ? Number(viewBox[2]) : null),
        detectedType: "svg",
      };
    }
  } catch {
    return null;
  }
  return null;
}

function jpegSize(buffer) {
  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) return null;
    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);
    if (marker >= 0xc0 && marker <= 0xc3) {
      return { width: buffer.readUInt16BE(offset + 7), height: buffer.readUInt16BE(offset + 5) };
    }
    offset += 2 + length;
  }
  return null;
}

function webpSize(buffer) {
  const chunk = buffer.toString("ascii", 12, 16);
  if (chunk === "VP8 ") {
    return { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff };
  }
  if (chunk === "VP8L") {
    const b0 = buffer[21];
    const b1 = buffer[22];
    const b2 = buffer[23];
    const b3 = buffer[24];
    return {
      width: 1 + (((b1 & 0x3f) << 8) | b0),
      height: 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6)),
    };
  }
  if (chunk === "VP8X") {
    return {
      width: 1 + buffer.readUIntLE(24, 3),
      height: 1 + buffer.readUIntLE(27, 3),
    };
  }
  return null;
}

function optimizationWarningsFor(file) {
  const warnings = [];
  const category = file.category || "";
  const width = file.dimensions?.width ?? null;
  const isHero = /hero/i.test(category);
  const isLogo = /logo|logos/i.test(category);
  const isFloorplan = /floor|plan|map|site/i.test(category);
  const isCard = /card|thumb|thumbnail/i.test(file.path);
  const isGallery = !isHero && !isLogo && !isFloorplan;

  if ((isHero || isGallery) && file.sizeBytes > 1_500_000) warnings.push("hero/gallery over 1.5 MB");
  if (isCard && file.sizeBytes > 500_000) warnings.push("thumbnail/card over 500 KB");
  if (isLogo && file.sizeBytes > 500_000) warnings.push("logo over 500 KB");
  if (isFloorplan && file.sizeBytes > 3_000_000) warnings.push("floorplan/site/map over 3 MB");
  if (isHero && width && width > 2400) warnings.push("hero wider than 2400px");
  if (isGallery && width && width > 1800) warnings.push("gallery wider than 1800px");
  if (isCard && width && width > 900) warnings.push("thumbnail/card wider than 900px");
  if (isFloorplan && width && width > 3000) warnings.push("floorplan/site/map wider than 3000px");
  if (file.extension === ".webp" && file.dimensions?.detectedType === "jpeg") warnings.push("extension is webp but detected JPEG");
  return warnings;
}

function categoryMistakes(category, file) {
  const issues = [];
  if (!category) issues.push("missing category folder");
  if (category && !["hero", "residences", "amenities", "neighborhood", "logos", "team", "floorplans", "maps"].includes(category)) {
    issues.push(`unexpected category ${category}`);
  }
  if (/logo/i.test(file.path) && category !== "logos") issues.push("logo-like filename outside logos");
  if (/floor|plan|site-plan/i.test(file.path) && category !== "floorplans" && category !== "maps") issues.push("floorplan-like filename outside floorplans/maps");
  return issues;
}

function auditWebsiteReferences() {
  const roots = [
    "src",
    "data",
    "public/data",
  ];
  const extraFiles = ["public/feed.json", "public/rss.xml", "public/llms.txt", "public/robots.txt", "public/sitemap.xml"];
  const files = roots.flatMap((rel) => walkFiles(path.join(websiteRoot, rel), { ignoreDirs: ["node_modules", "dist", ".git"] }))
    .concat(extraFiles.map((rel) => path.join(websiteRoot, rel)).filter((file) => fs.existsSync(file)))
    .filter(isTextFile);

  const assetReferences = [];
  const legacyProjectReferences = [];
  const localPathLeaks = [];
  const unsupportedFormatReferences = [];
  const duplicateReferenceCandidates = [];

  for (const filePath of files) {
    const rel = relativeOrNull(websiteRoot, filePath);
    const content = fs.readFileSync(filePath, "utf8");
    const leakPattern = /(?:\/Users\/brookesnader|\/Volumes\/ExternalSSD|com~apple~CloudDocs|WPB New Construction Asset Library|WPB_NewConstruction_Assets|source_material|source-repos)/g;
    for (const leak of content.matchAll(leakPattern)) {
      if (rel === "scripts/audit-asset-pipeline.mjs") continue;
      localPathLeaks.push({ file: rel, match: leak[0], index: leak.index });
    }
    const refs = [...content.matchAll(/["'`]((?:\/assets\/|\/projects\/)[^"'`<>\s?#)]+)["'`]/g)].map((match) => match[1]);
    const seenInFile = new Map();
    for (const ref of refs) {
      const ext = path.extname(ref).toLowerCase();
      const record = { file: rel, ref, extension: ext || "(none)" };
      if (ref.startsWith("/assets/")) assetReferences.push(record);
      if (ref.startsWith("/projects/")) legacyProjectReferences.push(record);
      if (ext && !safeWebsiteExtensions.has(ext) && ext !== ".pdf" && ext !== ".html") unsupportedFormatReferences.push(record);
      const key = ref.toLowerCase();
      seenInFile.set(key, (seenInFile.get(key) ?? 0) + 1);
    }
    for (const [ref, count] of seenInFile.entries()) {
      if (count > 1) duplicateReferenceCandidates.push({ file: rel, ref, count });
    }
  }

  const brokenAssetReferences = [];
  for (const ref of assetReferences) {
    const localPath = path.join(websiteRoot, "public", ref.ref.replace(/^\//, ""));
    if (!fs.existsSync(localPath)) brokenAssetReferences.push(ref);
  }

  const projectsWithWebsiteAssets = new Set(websiteAssetsAudit.projectFoldersPresent);
  const missingHeroImages = [...projectsWithWebsiteAssets].filter((projectSlug) => {
    const projectFiles = websiteAssetsAudit.files.filter((file) => file.projectSlug === projectSlug);
    return projectFiles.length && !projectFiles.some((file) => file.category === "hero");
  });
  const galleriesEmptyWhereAssetsExist = [...projectsWithWebsiteAssets].filter((projectSlug) => {
    const approvedImported = readJson(path.join(websiteRoot, "src/data/approvedImportedProjectImages.json")) ?? [];
    const importedCount = approvedImported.filter((item) => normalizeProjectSlug(item.projectId) === projectSlug && item.status === "placed").length;
    const approvedRegistryCount = registry.projects?.[projectSlug]?.assets?.length ?? 0;
    return (approvedRegistryCount > 0 || importedCount > 0) ? false : websiteAssetsAudit.files.some((file) => file.projectSlug === projectSlug);
  });

  return {
    scannedFiles: files.map((file) => relativeOrNull(websiteRoot, file)),
    assetReferences,
    legacyProjectReferences,
    brokenAssetReferences,
    localPathLeaks,
    unsupportedFormatReferences,
    duplicateReferenceCandidates,
    missingHeroImages,
    galleriesEmptyWhereAssetsExist,
  };
}

function isTextFile(filePath) {
  return /\.(ts|tsx|js|mjs|json|md|html|css|xml|txt|yml|yaml)$/i.test(filePath);
}

function auditPipelineLinks() {
  const iCloudProjects = new Set(iCloudAudit.approvedFolders.map((folder) => folder.projectSlug));
  const assetRepoApprovedProjects = new Set(assetRepoAudit.approvedFolders.map((folder) => folder.projectSlug));
  const websiteProjects = new Set(websiteAssetsAudit.projectFoldersPresent);
  const missingPipelineLinks = [];
  for (const projectSlug of iCloudProjects) {
    if (!assetRepoApprovedProjects.has(projectSlug)) {
      missingPipelineLinks.push({ projectSlug, from: "iCloud approved folder", missing: "asset repo approved warehouse" });
    }
    if (!websiteProjects.has(projectSlug)) {
      missingPipelineLinks.push({ projectSlug, from: "iCloud approved folder", missing: "website public/assets/projects" });
    }
    if (!registryProjects.has(projectSlug)) {
      missingPipelineLinks.push({ projectSlug, from: "iCloud approved folder", missing: "data/project_assets.json registry entry" });
    }
  }

  const unsupportedFormats = [
    ...iCloudAudit.approvedFolders.flatMap((folder) => folder.unsupportedFiles.map((file) => ({ layer: "iCloud", projectSlug: folder.projectSlug, path: file.path, extension: file.extension }))),
    ...assetRepoAudit.unsupportedFiles.map((file) => ({ layer: "assetRepo", path: file.path, extension: file.extension })),
    ...websiteAssetsAudit.unsupportedFiles.map((file) => ({ layer: "website", projectSlug: file.projectSlug, path: file.path, extension: file.extension })),
  ];

  const oversizedOrUnoptimized = [
    ...websiteAssetsAudit.oversizedOrUnoptimized.map((file) => ({ layer: "website", projectSlug: file.projectSlug, path: file.path, warnings: file.optimizationWarnings, sizeBytes: file.sizeBytes, dimensions: file.dimensions })),
    ...assetRepoAudit.largeFiles.map((file) => ({ layer: "assetRepo", path: file.path, sizeBytes: file.sizeBytes })),
  ];

  const slugMismatches = [
    ...iCloudAudit.unmappedApprovedFolders.map((folder) => ({ layer: "iCloud", path: folder.path, projectSlug: folder.projectSlug })),
    ...assetRepoAudit.projectFolders.filter((folder) => !folder.mappedToKnownProject).map((folder) => ({ layer: "assetRepo", path: folder.path, projectSlug: folder.projectSlug })),
  ];

  const duplicateCandidatesAll = [
    ...iCloudAudit.approvedFolders.flatMap((folder) => folder.duplicateCandidates.map((item) => ({ layer: "iCloud", projectSlug: folder.projectSlug, ...item }))),
    ...assetRepoAudit.duplicateCandidates.map((item) => ({ layer: "assetRepo", ...item })),
    ...websiteAssetsAudit.duplicateFilenames.map((item) => ({ layer: "website", ...item })),
  ];

  return {
    missingPipelineLinks,
    unsupportedFormats,
    oversizedOrUnoptimized,
    slugMismatches,
    duplicateCandidates: duplicateCandidatesAll,
  };
}

function filterProjectRecords(records, projectGetter) {
  if (!projectArg) return records;
  return records.filter((record) => {
    const slug = typeof projectGetter === "function" ? projectGetter(record) : record[projectGetter];
    return normalizeProjectSlug(slug) === projectArg;
  });
}

function inferGenericProjectSlug(folderPath, root) {
  const parts = relativeOrNull(root, folderPath).split("/");
  const projectMarkers = ["01_PROJECTS", "public-projects", "projects"];
  for (const marker of projectMarkers) {
    const index = parts.indexOf(marker);
    if (index !== -1 && parts[index + 1]) return normalizeProjectSlug(parts[index + 1]);
  }
  return normalizeProjectSlug(parts.at(-2) ?? parts.at(-1));
}

function countBy(records, key) {
  const counts = {};
  for (const record of records) {
    const value = record[key] || "(none)";
    counts[value] = (counts[value] ?? 0) + 1;
  }
  return counts;
}

function groupCount(records, key) {
  return countBy(records, key);
}

function mergeCounts(countsList) {
  const merged = {};
  for (const counts of countsList) {
    for (const [key, value] of Object.entries(counts)) merged[key] = (merged[key] ?? 0) + value;
  }
  return merged;
}

function duplicateCandidates(records) {
  return duplicateBy(records, (record) => `${normalizeAssetName(record.path)}:${record.sizeBytes}`);
}

function duplicateBy(records, keyFn) {
  const groups = new Map();
  for (const record of records) {
    const key = keyFn(record);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(record);
  }
  return [...groups.entries()]
    .filter(([, items]) => items.length > 1)
    .map(([key, items]) => ({ key, count: items.length, files: items.map((item) => item.path).slice(0, 20) }))
    .slice(0, 100);
}

function summarize() {
  const strictBlockers =
    referencesAudit.brokenAssetReferences.length +
    referencesAudit.localPathLeaks.length +
    referencesAudit.unsupportedFormatReferences.filter((ref) => ref.ref?.startsWith("/assets/")).length +
    websiteAssetsAudit.unsupportedFiles.length;
  const blockers = referencesAudit.brokenAssetReferences.length;
  const warnings =
    crossLayerAudit.missingPipelineLinks.length +
    crossLayerAudit.unsupportedFormats.length +
    crossLayerAudit.oversizedOrUnoptimized.length +
    crossLayerAudit.slugMismatches.length +
    crossLayerAudit.duplicateCandidates.length +
    websiteAssetsAudit.namingInconsistencies.length +
    iCloudAudit.approvedFolders.reduce((sum, folder) => sum + folder.namingInconsistencies.length + folder.hiddenOrTempFiles.length + folder.zeroByteFiles.length, 0);
  return { blockers, strictBlockers, warnings };
}

function recommendedNextFixes() {
  const fixes = [];
  if (referencesAudit.localPathLeaks.length) fixes.push("Remove local absolute path leaks from website source/data before strict publication.");
  if (referencesAudit.brokenAssetReferences.length) fixes.push("Fix missing /assets references before running strict mode or publishing.");
  if (assetRepoAudit.approvedFolders.length === 0) fixes.push("Create an approved warehouse structure in the asset repo before iCloud-to-asset-repo intake.");
  if (iCloudAudit.approvedFolders.some((folder) => folder.namingInconsistencies.length)) fixes.push("Normalize approved iCloud filenames during intake; do not publish source names directly.");
  if (websiteAssetsAudit.oversizedOrUnoptimized.length) fixes.push("Review website public assets with size/dimension warnings before adding more public assets.");
  if (crossLayerAudit.missingPipelineLinks.length) fixes.push("Promote one approved project at a time through iCloud, asset repo, website public assets, then registry.");
  if (!fixes.length) fixes.push("No blockers found; proceed with dry-run iCloud-to-asset-repo intake for one project.");
  return fixes;
}

function renderMarkdownReport(report) {
  return `# Asset Pipeline Audit Report

Generated: ${report.timestamp}

Mode: ${report.mode.strict ? "strict" : "default"}
Project filter: ${report.mode.project ?? "all"}

## Summary

- Blockers: ${report.summary.blockers}
- Strict blockers: ${report.summary.strictBlockers}
- Warnings: ${report.summary.warnings}
- Safe to proceed to iCloud -> asset repo intake: ${report.safeToProceedToICloudIntake ? "yes" : "no"}

## iCloud Asset Library

- Root exists: ${report.iCloud.exists ? "yes" : "no"}
- Is Git repo: ${report.iCloud.isGitRepo ? "yes" : "no"}
- Approved folders found: ${report.iCloud.approvedFolderCount}
- Approved files found: ${report.iCloud.approvedFileCount}
- Approved projects: ${report.iCloud.approvedFolders.map((folder) => folder.projectSlug).join(", ") || "none"}
- Extension counts: ${inlineJson(report.iCloud.extensionCounts)}
- Unmapped approved folders: ${report.iCloud.unmappedApprovedFolders.length}

${report.iCloud.approvedFolders.map((folder) => `### iCloud ${folder.projectSlug}

- Folder: \`${folder.path}\`
- Files: ${folder.fileCount}
- Extensions: ${inlineJson(folder.extensionCounts)}
- Unsupported files: ${folder.unsupportedFiles.length}
- Hidden/temp files: ${folder.hiddenOrTempFiles.length}
- Zero-byte files: ${folder.zeroByteFiles.length}
- Naming issues: ${folder.namingInconsistencies.length}
- Duplicate candidates: ${folder.duplicateCandidates.length}
`).join("\n")}

## Asset Repo

- Root exists: ${report.assetRepo.exists ? "yes" : "no"}
- Branch: ${report.assetRepo.git.branch || "unknown"}
- Origin: ${report.assetRepo.git.origin || "unknown"}
- Status: \`${oneLine(report.assetRepo.git.statusShort)}\`
- Git LFS configured: ${report.assetRepo.lfs.gitAttributesMentionsLfs || report.assetRepo.lfs.trackedLfsFileCount ? "yes" : "no"}
- Project folders: ${report.assetRepo.projectFolders.length}
- Approved folders: ${report.assetRepo.approvedFolders.length}
- Approved warehouse assets: ${report.assetRepo.approvedWarehouseAssetsPresent}
- Total files: ${report.assetRepo.totalFiles}
- Extension counts: ${inlineJson(report.assetRepo.extensionCounts)}
- Missing iCloud-approved assets in asset repo by name: ${report.assetRepo.missingICloudApprovedAssets.length}
- Large files over 3 MB: ${report.assetRepo.largeFiles.length}

## Website Public Assets

- Root exists: ${report.websitePublicAssets.exists ? "yes" : "no"}
- Files: ${report.websitePublicAssets.totalFiles}
- Project folders: ${report.websitePublicAssets.projectFoldersPresent.join(", ") || "none"}
- Assets by project: ${inlineJson(report.websitePublicAssets.assetsByProject)}
- Assets by category: ${inlineJson(report.websitePublicAssets.assetsByCategory)}
- Image formats: ${inlineJson(report.websitePublicAssets.imageFormats)}
- Unsupported files: ${report.websitePublicAssets.unsupportedFiles.length}
- Oversized/unoptimized warnings: ${report.websitePublicAssets.oversizedOrUnoptimized.length}
- Naming inconsistencies: ${report.websitePublicAssets.namingInconsistencies.length}
- Category mistakes: ${report.websitePublicAssets.categoryMistakes.length}

## Website References

- Scanned files: ${report.websiteReferences.scannedFiles.length}
- /assets references: ${report.websiteReferences.assetReferences.length}
- Legacy /projects references: ${report.websiteReferences.legacyProjectReferences.length}
- Broken /assets references: ${report.websiteReferences.brokenAssetReferences.length}
- Local path leaks: ${report.websiteReferences.localPathLeaks.length}
- Unsupported format references: ${report.websiteReferences.unsupportedFormatReferences.length}
- Duplicate reference candidates: ${report.websiteReferences.duplicateReferenceCandidates.length}
- Missing hero images where website project assets exist: ${report.websiteReferences.missingHeroImages.join(", ") || "none"}
- Galleries empty where project assets exist: ${report.websiteReferences.galleriesEmptyWhereAssetsExist.join(", ") || "none"}

## Missing Pipeline Links

${listItems(report.missingPipelineLinks.map((item) => `${item.projectSlug}: ${item.from} missing ${item.missing}`))}

## Unsupported Formats

${listItems(report.unsupportedFormats.slice(0, 50).map((item) => `${item.layer}: ${item.path} (${item.extension})`))}

## Oversized / Unoptimized Warnings

${listItems(report.oversizedOrUnoptimized.slice(0, 50).map((item) => `${item.layer}: ${item.path} ${item.warnings ? `(${item.warnings.join(", ")})` : `${Math.round(item.sizeBytes / 1024)} KB`}`))}

## Slug Mismatches

${listItems(report.slugMismatches.map((item) => `${item.layer}: ${item.projectSlug} at \`${item.path}\``))}

## Broken References

${listItems(report.brokenReferences.map((item) => `${item.file}: ${item.ref}`))}

## Local Path Leaks

${listItems(report.localPathLeaks.map((item) => `${item.file}: ${item.match}`))}

## Duplicate Candidates

${listItems(report.duplicateCandidates.slice(0, 50).map((item) => `${item.layer}: ${item.key} (${item.count})`))}

## Recommended Next Fixes

${listItems(report.recommendedNextFixes)}
`;
}

function inlineJson(value) {
  return `\`${JSON.stringify(value)}\``;
}

function oneLine(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function listItems(items) {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : "- None";
}
