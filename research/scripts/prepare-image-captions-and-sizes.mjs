import fs from "node:fs/promises";
import path from "node:path";
import { execFile as execFileCallback } from "node:child_process";
import { promisify } from "node:util";

const execFile = promisify(execFileCallback);

const workspace = process.cwd();
const catalogPath = path.join(workspace, "research/source-material-review/image-candidate-catalog.json");
const sourceCatalogPath = path.join(workspace, "research/source-material-review/project-source-catalog.json");
const preferredRoot = path.join(workspace, "research/asset-library/preferred-image-exports");
const captionCatalogPath = path.join(workspace, "research/source-material-review/image-caption-catalog.json");
const sizingReportPath = path.join(workspace, "research/source-material-review/image-sizing-report.md");

const VARIANTS = [
  { label: "hero", maxDimension: 1600 },
  { label: "card", maxDimension: 900 },
  { label: "thumb", maxDimension: 480 },
];

const PUBLIC_IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

async function main() {
  const catalog = await readJson(catalogPath);
  const sourceCatalog = await readJson(sourceCatalogPath);
  const sourceByProject = new Map(sourceCatalog.projects.map((project) => [project.projectId, project]));
  const generated = [];
  const verified = [];
  const warnings = [];
  const blockers = [];

  for (const project of catalog.projects) {
    for (const preferred of project.preferred ?? []) {
      const candidate = findCandidate(project, preferred);
      if (!candidate) {
        warnings.push(`${project.projectId}: preferred source not found in candidate list (${preferred.researchPath})`);
        continue;
      }

      for (const variant of VARIANTS) {
        const outPath = preferredExportPath(project.projectId, candidate, variant);
        await fs.mkdir(path.dirname(outPath), { recursive: true });
        const sourcePath = path.join(workspace, candidate.researchPath);
        const exists = await fileExists(outPath);

        if (!exists) {
          await resizeImage(sourcePath, outPath, variant.maxDimension);
          generated.push(relative(outPath));
        }

        const dimensions = await imageDimensions(outPath);
        verified.push({
          projectId: project.projectId,
          label: variant.label,
          path: relative(outPath),
          sourcePath: candidate.researchPath,
          width: dimensions.width,
          height: dimensions.height,
          maxDimension: variant.maxDimension,
          status: isWithinVariant(dimensions, variant.maxDimension) ? "ok" : "oversized",
        });
      }
    }
  }

  const orphanExports = await findOrphanPreferredExports(verified);
  for (const orphanPath of orphanExports) {
    const dimensions = await imageDimensions(path.join(workspace, orphanPath));
    verified.push({
      projectId: orphanPath.split("/").at(-2) ?? "",
      label: inferVariantLabel(orphanPath),
      path: orphanPath,
      sourcePath: "",
      width: dimensions.width,
      height: dimensions.height,
      maxDimension: inferVariantMax(orphanPath),
      status: isWithinVariant(dimensions, inferVariantMax(orphanPath)) ? "ok" : "oversized",
      note: "present on disk but not referenced by image-candidate-catalog.json",
    });
  }

  for (const item of verified.filter((item) => item.status !== "ok")) {
    warnings.push(`${item.path}: ${item.width}x${item.height} exceeds ${item.maxDimension}px target`);
  }

  const publicMedia = await collectPublicMedia(sourceByProject);
  const captionCatalog = buildCaptionCatalog({
    catalog,
    sourceByProject,
    verified,
    publicMedia,
    blockers,
  });

  await fs.writeFile(captionCatalogPath, `${JSON.stringify(captionCatalog, null, 2)}\n`);
  await fs.writeFile(
    sizingReportPath,
    renderSizingReport({
      generated,
      verified,
      warnings,
      blockers: captionCatalog.rightsAndSourceBlockers,
      publicMedia,
      orphanExports,
    }),
  );

  console.log(
    JSON.stringify(
      {
        generated: generated.length,
        verified: verified.length,
        publicMedia: publicMedia.length,
        warnings: warnings.length,
        captionCatalog: relative(captionCatalogPath),
        sizingReport: relative(sizingReportPath),
      },
      null,
      2,
    ),
  );
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

function findCandidate(project, preferred) {
  return (project.candidates ?? []).find(
    (candidate) =>
      candidate.researchPath === preferred.researchPath ||
      candidate.sourceUrl === preferred.sourceUrl ||
      candidate.label === preferred.label,
  );
}

function preferredExportPath(projectId, candidate, variant) {
  const parsed = parseCandidateBasename(candidate.researchPath);
  const role = slugify(candidate.role || parsed.role || "image");
  const stem = `${role}-${parsed.index}-${slugify(parsed.middle)}-${variant.label}-${variant.maxDimension}`;
  return path.join(preferredRoot, projectId, `${stem}.jpg`);
}

function parseCandidateBasename(researchPath) {
  const basename = path.basename(researchPath, path.extname(researchPath));
  const parts = basename.split("--");
  if (parts.length >= 3) {
    return {
      index: parts[0],
      middle: parts.slice(1, -1).join("-"),
    };
  }
  return {
    index: "01",
    middle: basename,
  };
}

function slugify(value) {
  return value
    .toString()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function resizeImage(sourcePath, outPath, maxDimension) {
  const ext = path.extname(outPath).toLowerCase();
  const args = ["-Z", String(maxDimension), sourcePath, "--out", outPath];
  if (ext === ".jpg" || ext === ".jpeg") {
    args.unshift("-s", "format", "jpeg");
  } else if (ext === ".png") {
    args.unshift("-s", "format", "png");
  }
  await execFile("sips", args);
}

async function imageDimensions(filePath) {
  const { stdout } = await execFile("sips", ["-g", "pixelWidth", "-g", "pixelHeight", filePath]);
  const width = Number(stdout.match(/pixelWidth:\s*(\d+)/)?.[1] ?? 0);
  const height = Number(stdout.match(/pixelHeight:\s*(\d+)/)?.[1] ?? 0);
  return { width, height };
}

function isWithinVariant(dimensions, maxDimension) {
  if (!maxDimension) return true;
  return Math.max(dimensions.width, dimensions.height) <= maxDimension;
}

async function findOrphanPreferredExports(verified) {
  const referenced = new Set(verified.map((item) => item.path));
  const files = await walk(preferredRoot);
  return files.map(relative).filter((filePath) => !referenced.has(filePath));
}

async function collectPublicMedia(sourceByProject) {
  const publicRoot = path.join(workspace, "public/projects");
  if (!(await fileExists(publicRoot))) return [];
  const files = (await walk(publicRoot)).filter((filePath) => PUBLIC_IMAGE_EXTENSIONS.has(path.extname(filePath).toLowerCase()));
  const items = [];

  for (const filePath of files) {
    const publicPath = relative(filePath).replace(/^public/, "");
    const [, projectId] = relative(filePath).split(path.sep).slice(1);
    const dimensions = await imageDimensions(filePath);
    const sourceProject = sourceByProject.get(projectId);
    const provider = inferPublicMediaProvider(projectId, filePath, sourceProject);
    items.push({
      projectId,
      publicPath,
      width: dimensions.width,
      height: dimensions.height,
      role: inferRoleFromPath(filePath),
      providerType: provider.providerType,
      providerLabel: provider.providerLabel,
      sourceLabel: provider.sourceLabel,
      captionReadyLabel: provider.captionReadyLabel,
      rightsStatus: provider.rightsStatus,
      sourceBlocker: provider.sourceBlocker,
    });
  }

  return items.sort((a, b) => a.publicPath.localeCompare(b.publicPath));
}

async function walk(root) {
  const entries = await fs.readdir(root, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const entryPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(entryPath)));
    } else if (entry.isFile()) {
      files.push(entryPath);
    }
  }
  return files;
}

function buildCaptionCatalog({ catalog, sourceByProject, verified, publicMedia }) {
  const verifiedBySource = groupBy(verified.filter((item) => item.sourcePath), (item) => item.sourcePath);
  const publicByProject = groupBy(publicMedia, (item) => item.projectId);
  const projects = catalog.projects.map((project) => {
    const sourceProject = sourceByProject.get(project.projectId);
    const candidates = (project.candidates ?? []).map((candidate) => {
      const provider = inferProvider(candidate, sourceProject);
      return {
        role: candidate.role,
        label: candidate.label,
        researchPath: candidate.researchPath,
        sourceUrl: candidate.sourceUrl,
        sourcePage: candidate.sourcePage,
        width: candidate.width,
        height: candidate.height,
        orientation: candidate.orientation,
        providerType: provider.providerType,
        providerLabel: provider.providerLabel,
        sourceLabel: provider.sourceLabel,
        captionReadyLabel: provider.captionReadyLabel,
        clearanceStatus: candidate.clearanceStatus,
        recommendedUse: candidate.recommendedUse,
      };
    });

    const preferredExports = (project.preferred ?? []).flatMap((preferred) => {
      const candidate = findCandidate(project, preferred);
      if (!candidate) return [];
      const provider = inferProvider(candidate, sourceProject);
      return (verifiedBySource.get(candidate.researchPath) ?? []).map((exported) => ({
        role: candidate.role,
        variant: exported.label,
        path: exported.path,
        width: exported.width,
        height: exported.height,
        maxDimension: exported.maxDimension,
        sourceResearchPath: candidate.researchPath,
        sourceUrl: candidate.sourceUrl,
        sourcePage: candidate.sourcePage,
        providerType: provider.providerType,
        providerLabel: provider.providerLabel,
        captionReadyLabel: provider.captionReadyLabel,
        clearanceStatus: candidate.clearanceStatus,
        sizingStatus: exported.status,
      }));
    });

    return {
      projectId: project.projectId,
      name: project.name,
      area: project.area,
      officialWebsite: sourceProject?.officialWebsite ?? "",
      rightsStatus: sourceProject?.rightsStatus ?? "Rights review required before publishing images",
      candidates,
      preferredExports,
      publicMedia: publicByProject.get(project.projectId) ?? [],
    };
  });

  const rightsAndSourceBlockers = collectBlockers(projects);

  return {
    generatedAt: new Date().toISOString(),
    usageNote:
      "Caption/source readiness catalog. Labels describe apparent source/provider only; they do not clear publication rights.",
    variantTargets: VARIANTS,
    projects,
    rightsAndSourceBlockers,
  };
}

function inferProvider(candidate, sourceProject) {
  const sourceUrl = candidate.sourceUrl || "";
  const sourcePage = candidate.sourcePage || "";
  const officialWebsite = sourceProject?.officialWebsite || "";
  const domain = hostname(sourcePage || sourceUrl);
  const sourceDomain = hostname(sourceUrl);
  const officialDomain = hostname(officialWebsite);
  const labelDomain = titleDomain(domain || sourceDomain);

  if (isPublicationDomain(domain) || isPublicationDomain(sourceDomain)) {
    return provider("publication", publicationName(domain || sourceDomain), candidate.clearanceStatus);
  }

  if (officialDomain && (sameDomain(domain, officialDomain) || sameDomain(sourceDomain, officialDomain))) {
    return provider("official project site", sourceProject?.name ?? labelDomain, candidate.clearanceStatus);
  }

  if (sourcePage && officialDomain && sameDomain(domain, officialDomain)) {
    return provider("official project site", sourceProject?.name ?? labelDomain, candidate.clearanceStatus);
  }

  if (isDeveloperDomain(domain || sourceDomain)) {
    return provider("developer", titleDomain(domain || sourceDomain), candidate.clearanceStatus);
  }

  if (isConsultantDomain(domain || sourceDomain)) {
    return provider("consultant/architect", titleDomain(domain || sourceDomain), candidate.clearanceStatus);
  }

  if (sourcePage && officialWebsite && sameDomain(hostname(sourcePage), officialDomain)) {
    return provider("official project site", sourceProject?.name ?? labelDomain, candidate.clearanceStatus);
  }

  return provider("source site", labelDomain || "Source site", candidate.clearanceStatus);
}

function inferPublicMediaProvider(projectId, filePath, sourceProject) {
  const filename = path.basename(filePath).toLowerCase();
  if (projectId === "olara" || projectId === "ritz-carlton-wpb") {
    return {
      providerType: "supplied asset",
      providerLabel: "Supplied project asset",
      sourceLabel: "Supplied asset",
      captionReadyLabel: "Source: supplied project asset",
      rightsStatus: "Confirm supplied-asset license/permission before publication",
      sourceBlocker: "Supplied file provenance is local/asset-map based; license terms are not embedded.",
    };
  }

  if (filename.includes("alba")) {
    return publicOfficial(sourceProject, "Alba Palm Beach");
  }
  if (filename.includes("mr-c")) {
    return publicOfficial(sourceProject, "Mr. C Residences West Palm Beach");
  }
  if (filename.includes("nora")) {
    return publicOfficial(sourceProject, "Nora House");
  }
  if (filename.includes("shorecrest")) {
    return publicOfficial(sourceProject, "Shorecrest");
  }
  if (filename.includes("south-flagler")) {
    return publicOfficial(sourceProject, "South Flagler House");
  }

  return {
    providerType: "unknown",
    providerLabel: "Unknown public media source",
    sourceLabel: "Source unknown",
    captionReadyLabel: "Source: source to be confirmed",
    rightsStatus: "Source/provider confirmation required",
    sourceBlocker: "Public media file is not mapped to a source URL or asset-map entry.",
  };
}

function publicOfficial(sourceProject, fallbackName) {
  const label = sourceProject?.name ?? fallbackName;
  return {
    providerType: "official project site",
    providerLabel: label,
    sourceLabel: `Official project site: ${label}`,
    captionReadyLabel: `Source: ${label} official project site`,
    rightsStatus: "Rights review required before publishing images",
    sourceBlocker: "",
  };
}

function provider(providerType, providerLabel, rightsStatus) {
  const cleanLabel = providerLabel || "Source";
  return {
    providerType,
    providerLabel: cleanLabel,
    sourceLabel: `${capitalize(providerType)}: ${cleanLabel}`,
    captionReadyLabel: `Source: ${cleanLabel}${providerType === "publication" ? "" : providerType === "official project site" ? " official project site" : ""}`,
    rightsStatus: rightsStatus || "Rights review required before publishing images",
  };
}

function collectBlockers(projects) {
  const blockers = [];
  for (const project of projects) {
    if (project.candidates.length === 0) {
      blockers.push({
        projectId: project.projectId,
        type: "missing imagery",
        blocker: "No downloaded image candidates in image-candidate-catalog.json.",
      });
    }

    for (const candidate of project.candidates) {
      if (candidate.providerType === "publication") {
        blockers.push({
          projectId: project.projectId,
          type: "publication rights",
          path: candidate.researchPath,
          blocker: "Publication/editorial image should not be used as marketing imagery until replaced or cleared.",
        });
      }
      if (!candidate.sourceUrl && !candidate.sourcePage) {
        blockers.push({
          projectId: project.projectId,
          type: "source missing",
          path: candidate.researchPath,
          blocker: "Candidate does not include a source URL or source page.",
        });
      }
    }

    for (const publicItem of project.publicMedia) {
      if (publicItem.sourceBlocker) {
        blockers.push({
          projectId: project.projectId,
          type: "public media source",
          path: publicItem.publicPath,
          blocker: publicItem.sourceBlocker,
        });
      }
    }
  }
  return blockers;
}

function inferRoleFromPath(filePath) {
  const value = path.basename(filePath).toLowerCase();
  if (value.includes("hero")) return "hero";
  if (value.includes("card")) return "card";
  if (value.includes("logo")) return "logo";
  if (value.includes("amenity") || value.includes("pool") || value.includes("gym") || value.includes("spa")) return "amenity";
  if (value.includes("residence") || value.includes("bath") || value.includes("kitchen") || value.includes("living")) return "residence";
  if (value.includes("view") || value.includes("balcony") || value.includes("aerial")) return "view";
  return "media";
}

function inferVariantLabel(filePath) {
  if (filePath.includes("-hero-1600")) return "hero";
  if (filePath.includes("-card-900")) return "card";
  if (filePath.includes("-thumb-480")) return "thumb";
  return "unknown";
}

function inferVariantMax(filePath) {
  if (filePath.includes("-hero-1600")) return 1600;
  if (filePath.includes("-card-900")) return 900;
  if (filePath.includes("-thumb-480")) return 480;
  return 0;
}

function hostname(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

function sameDomain(a, b) {
  if (!a || !b) return false;
  return a === b || a.endsWith(`.${b}`) || b.endsWith(`.${a}`);
}

function isPublicationDomain(domain) {
  return /therealdeal\.com|floridayimby\.com|luxuryguideusa\.com|palmbeachpost\.com/.test(domain);
}

function isDeveloperDomain(domain) {
  return /relatedross\.com|relatedgroup\.com|fortpartners\.com|savannafund\.com|greatgulf\.com|alconbuildersgroup\.com/.test(domain);
}

function isConsultantDomain(domain) {
  return /stantec\.com|kpf\.com|binyanstudios\.com|visualhouse\.co/.test(domain);
}

function publicationName(domain) {
  if (domain.includes("therealdeal.com")) return "The Real Deal";
  if (domain.includes("floridayimby.com")) return "Florida YIMBY";
  if (domain.includes("palmbeachpost.com")) return "Palm Beach Post";
  if (domain.includes("luxuryguideusa.com")) return "Luxury Guide USA";
  return titleDomain(domain);
}

function titleDomain(domain) {
  if (!domain) return "";
  return domain
    .split(".")
    .filter((part) => !["com", "net", "org", "io", "co", "cdn", "cloudfront", "storage", "googleapis", "static"].includes(part))
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " "))
    .join(" ");
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function groupBy(items, keyFn) {
  const groups = new Map();
  for (const item of items) {
    const key = keyFn(item);
    const group = groups.get(key) ?? [];
    group.push(item);
    groups.set(key, group);
  }
  return groups;
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function relative(filePath) {
  return path.relative(workspace, filePath).split(path.sep).join("/");
}

function renderSizingReport({ generated, verified, warnings, blockers, publicMedia, orphanExports }) {
  const okCount = verified.filter((item) => item.status === "ok").length;
  const oversized = verified.filter((item) => item.status !== "ok");
  const byProject = groupBy(verified, (item) => item.projectId);
  const publicOversized = publicMedia.filter((item) => Math.max(item.width, item.height) > 2400);
  const projectsWithoutCandidates = blockers.filter((blocker) => blocker.type === "missing imagery");
  const publicationBlockers = blockers.filter((blocker) => blocker.type === "publication rights");
  const publicSourceBlockers = blockers.filter((blocker) => blocker.type === "public media source");

  return `# Image Sizing and Caption Readiness Report

Generated: ${new Date().toISOString()}

## Summary

- Preferred export variants verified: ${verified.length}
- Preferred export variants at or below target: ${okCount}
- Preferred export variants generated this run: ${generated.length}
- Orphan preferred exports present on disk: ${orphanExports.length}
- Public project media files cataloged for caption readiness: ${publicMedia.length}
- Sizing warnings: ${warnings.length}

## Variant Targets

- Hero: longest edge <= 1600px
- Card: longest edge <= 900px
- Thumb: longest edge <= 480px

## Generated Variants

${generated.length ? generated.map((item) => `- ${item}`).join("\n") : "- None; existing preferred exports were already present."}

## Preferred Export Verification

${[...byProject.entries()]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([projectId, items]) => {
    const counts = items.reduce((memo, item) => {
      memo[item.label] = (memo[item.label] ?? 0) + 1;
      return memo;
    }, {});
    return `- ${projectId}: ${items.length} variants (${Object.entries(counts)
      .map(([label, count]) => `${label} ${count}`)
      .join(", ")})`;
  })
  .join("\n")}

## Oversized Preferred Exports

${oversized.length ? oversized.map((item) => `- ${item.path}: ${item.width}x${item.height}, target ${item.maxDimension}`).join("\n") : "- None."}

## Public Project Media Size Notes

${publicOversized.length ? publicOversized.map((item) => `- ${item.publicPath}: ${item.width}x${item.height}; consider page-specific derivatives if loaded outside lazy galleries.`).join("\n") : "- No public project media exceeds 2400px on its longest edge."}

## Source and Rights Blockers

- Projects with no downloaded image candidates: ${projectsWithoutCandidates.map((item) => item.projectId).join(", ") || "none"}
- Publication/editorial images requiring replacement or clearance: ${publicationBlockers.length}
- Public media files with source/license confirmation still needed: ${publicSourceBlockers.length}
- All preferred third-party project-site/developer imagery remains rights-review-required until written permission or license terms are confirmed.

## Detailed Warnings

${warnings.length ? warnings.map((warning) => `- ${warning}`).join("\n") : "- None."}
`;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
