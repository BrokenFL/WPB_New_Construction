import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const metadataPath = path.join(root, "research/imported-project-images/importedProjectImages.json");
const publicBundlePath = path.join(root, "src/data/approvedImportedProjectImages.json");
const analysisPath = path.join(root, "research/source-material-review/developer-image-placement-analysis.md");
const matrixPath = path.join(root, "research/source-material-review/project-asset-placement-matrix.md");

const placementCredit = "Image via developer/project marketing materials";
const captionByType = {
  interior: "Interior rendering",
  amenity: "Amenity image",
  exterior: "Project rendering",
  rendering: "Project rendering",
  floorplan: "Developer image",
  logo: "Developer image",
  unknown: "Developer image",
};

const preferredPlacementByType = {
  interior: "interior",
  amenity: "amenity",
  exterior: "gallery",
  rendering: "gallery",
  unknown: "gallery",
};

function readJson(file, fallback) {
  if (!existsSync(file)) return fallback;
  return JSON.parse(readFileSync(file, "utf8"));
}

function writeJson(file, value) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function publicPath(record) {
  return record.localPath.replace(/^public/, "");
}

function normalizeSourceKey(url) {
  try {
    const parsed = new URL(url);
    const name = path.basename(parsed.pathname)
      .toLowerCase()
      .replace(/-\d{3,5}x\d{3,5}(?=\.)/g, "")
      .replace(/[_-](scaled|final|rev|copy|v\d+|8k|desktop|hero|source)(?=\.)/g, "");
    return `${parsed.hostname.replace(/^www\./, "")}/${name}`;
  } catch {
    return url.toLowerCase();
  }
}

function pixelArea(record) {
  return Number(record.width ?? 0) * Number(record.height ?? 0);
}

function localBytes(record) {
  try {
    return statSync(path.join(root, record.localPath)).size;
  } catch {
    return 0;
  }
}

function score(record) {
  const typeScore = { interior: 40, amenity: 36, exterior: 34, rendering: 34, unknown: 18, floorplan: -80, logo: -100 }[record.imageType] ?? 0;
  const areaScore = Math.min(pixelArea(record) / 90_000, 45);
  const ratio = record.width && record.height ? record.width / record.height : 1.5;
  const ratioScore = ratio > 1.15 && ratio < 2.6 ? 12 : ratio >= 0.65 && ratio <= 1.15 ? 7 : -4;
  const sourcePenalty = /portrait|logo|headshot|grayscale|pineapple|weather|avatar|icon/i.test(record.sourceImageUrl) ? 80 : 0;
  const bytePenalty = localBytes(record) && localBytes(record) < 40_000 ? 90 : 0;
  return typeScore + areaScore + ratioScore - sourcePenalty - bytePenalty;
}

function placementFor(record, selectedForProject) {
  const sameProjectPlaced = selectedForProject.filter((item) => item.status === "placed");
  if (!sameProjectPlaced.length && ["exterior", "rendering", "unknown"].includes(record.imageType)) return "card";
  return preferredPlacementByType[record.imageType] ?? "gallery";
}

const records = readJson(metadataPath, []);
const byProject = new Map();
for (const record of records) {
  if (!byProject.has(record.projectId)) byProject.set(record.projectId, []);
  byProject.get(record.projectId).push(record);
}

const nextRecords = [];
const placed = [];
const duplicateGroups = [];
const rejected = [];

for (const [projectId, projectRecords] of [...byProject.entries()].sort(([a], [b]) => a.localeCompare(b))) {
  const usable = projectRecords.filter((record) => existsSync(path.join(root, record.localPath)) && !["logo", "floorplan"].includes(record.imageType));
  const groups = new Map();
  for (const record of usable) {
    const key = normalizeSourceKey(record.sourceImageUrl);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(record);
  }

  const bestFromGroups = [];
  for (const [key, group] of groups) {
    const ranked = [...group].sort((a, b) => score(b) - score(a));
    const winner = ranked[0];
    bestFromGroups.push(winner);
    if (group.length > 1) {
      duplicateGroups.push({ projectId, key, selected: winner.id, archived: ranked.slice(1).map((record) => record.id) });
    }
  }

  const selected = bestFromGroups
    .filter((record) => score(record) > 20)
    .sort((a, b) => score(b) - score(a))
    .slice(0, 6);
  const selectedIds = new Set(selected.map((record) => record.id));
  const selectedForProject = [];

  for (const record of projectRecords) {
    const isSelected = selectedIds.has(record.id);
    const isDuplicate = !isSelected && usable.some((candidate) => candidate.id !== record.id && normalizeSourceKey(candidate.sourceImageUrl) === normalizeSourceKey(record.sourceImageUrl));
    const badAsset = ["logo", "floorplan"].includes(record.imageType) || /portrait|headshot|grayscale|pineapple|weather|avatar|icon/i.test(record.sourceImageUrl) || (localBytes(record) > 0 && localBytes(record) < 40_000);
    const status = isSelected ? "placed" : badAsset ? "rejected" : isDuplicate ? "archived" : "candidate";
    const placement = isSelected ? placementFor(record, selectedForProject) : record.placement;
    const next = {
      ...record,
      status,
      caption: captionByType[record.imageType] ?? "Developer image",
      alt: record.alt || `${record.imageType} image for ${projectId.replaceAll("-", " ")} in West Palm Beach.`,
      placement,
      credit: placementCredit,
      notes: isSelected
        ? "Selected after duplicate and best-version analysis."
        : status === "archived"
          ? "Inferior duplicate or lower-resolution version retained but not displayed."
          : status === "rejected"
            ? "Rejected as unsuitable, off-context, or low-confidence for project placement."
            : "Candidate retained for future placement.",
    };
    if (isSelected) {
      selectedForProject.push(next);
      placed.push(next);
    }
    if (status === "rejected") rejected.push(next);
    nextRecords.push(next);
  }
}

const publicPlaced = placed.map((record) => ({
  projectId: record.projectId,
  sourcePageUrl: record.sourcePageUrl,
  sourceImageUrl: record.sourceImageUrl,
  localPath: record.localPath,
  capturedAt: record.capturedAt,
  imageType: record.imageType,
  status: "placed",
  caption: record.caption,
  alt: record.alt,
  placement: record.placement,
  credit: placementCredit,
  id: record.id,
  width: record.width,
  height: record.height,
}));

writeJson(metadataPath, nextRecords);
writeJson(publicBundlePath, publicPlaced);

const selectedLines = placed
  .sort((a, b) => a.projectId.localeCompare(b.projectId) || String(a.placement).localeCompare(String(b.placement)))
  .map((record) => `- ${record.projectId}: ${record.id} (${record.imageType}, ${record.width ?? "?"}x${record.height ?? "?"}, ${Math.round(localBytes(record) / 1024)} KB) -> ${record.placement}; ${publicPath(record)}; source ${record.sourcePageUrl}`);

const duplicateLines = duplicateGroups.length
  ? duplicateGroups.map((group) => `- ${group.projectId}: selected ${group.selected}; archived ${group.archived.join(", ")}.`)
  : ["- No exact/near source-size duplicate groups found in the imported set."];

const rejectedLines = rejected.length
  ? rejected.map((record) => `- ${record.projectId}: ${record.id} (${record.imageType}) rejected; ${record.sourceImageUrl}`)
  : ["- No imported records rejected."];

const projectDecisionLines = [...byProject.keys()].sort().map((projectId) => {
  const projectPlaced = placed.filter((record) => record.projectId === projectId);
  return `- ${projectId}: ${projectPlaced.length ? projectPlaced.map((record) => `${record.placement}=${record.id}`).join("; ") : "no imported image placed; existing project media remains primary."}`;
});

writeFileSync(
  analysisPath,
  `# Developer Image Placement Analysis

## Summary
Developer/project-site images are treated as usable project assets when they come from a registry domain. Records are analyzed for project fit, dimensions, duplicate source variants, and best public placement. Selected records are marked \`placed\`; lower-quality duplicates are \`archived\`; unsuitable assets are \`rejected\`; the rest remain \`candidate\`.

## Best Images Selected
${selectedLines.join("\n")}

## Duplicate Groups Reviewed
${duplicateLines.join("\n")}

## Rejected Images
${rejectedLines.join("\n")}

## Project Placement Decisions
${projectDecisionLines.join("\n")}

## Remaining Asset Gaps
- Olara, Mr. C, Mandarin Oriental, and Rosewood already have project-specific public images in the site and did not need new imported records from this import run.
- Projects without placed imported images should continue to use curated user-provided assets, existing project media, or corridor editorial images in that order.
- Future imports should favor true residence, amenity, exterior, and rendering imagery and avoid team portraits, decorative fragments, logos, maps, and low-context crops.
`,
);

const matrixLines = [...new Set([...nextRecords.map((record) => record.projectId)])].sort().map((projectId) => {
  const projectPlaced = placed.filter((record) => record.projectId === projectId);
  const candidates = nextRecords.filter((record) => record.projectId === projectId && record.status === "candidate").length;
  const archived = nextRecords.filter((record) => record.projectId === projectId && record.status === "archived").length;
  const rejectedCount = nextRecords.filter((record) => record.projectId === projectId && record.status === "rejected").length;
  return `| ${projectId} | ${projectPlaced.map((record) => `${record.placement}: ${publicPath(record)}`).join("<br>") || "Existing project media"} | ${candidates} | ${archived} | ${rejectedCount} |`;
});

writeFileSync(
  matrixPath,
  `# Project Asset Placement Matrix

| Project | Public placement | Candidates | Archived duplicates | Rejected |
| --- | --- | ---: | ---: | ---: |
${matrixLines.join("\n")}
`,
);

console.log(JSON.stringify({ placement: "complete", records: records.length, placed: placed.length, publicBundlePath: path.relative(root, publicBundlePath) }, null, 2));
