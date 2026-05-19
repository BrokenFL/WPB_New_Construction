import fs from "node:fs/promises";
import path from "node:path";

const workspace = process.cwd();
const reviewRoot = path.join(workspace, "research/source-material-review");
const captionCatalogPath = path.join(reviewRoot, "image-caption-catalog.json");
const assetTrackerPath = path.join(reviewRoot, "wpb-project-asset-tracker.csv");
const planJsonPath = path.join(reviewRoot, "authorized-asset-resize-plan.json");
const planMdPath = path.join(reviewRoot, "authorized-asset-resize-plan.md");

const DEFAULT_VARIANTS = [
  { label: "hero", width: 1920, format: "webp", quality: 82 },
  { label: "card", width: 960, format: "webp", quality: 82 },
  { label: "thumb", width: 480, format: "webp", quality: 80 },
  { label: "og", width: 1200, height: 630, format: "jpg", quality: 84 },
];

const AUTHORIZED_PATTERNS = [
  /\bauthorized\b/i,
  /\bcleared\b/i,
  /\blicen[cs]ed\b/i,
  /written permission/i,
  /approved for publication/i,
  /approved for web/i,
];

const BLOCKED_PATTERNS = [
  /rights review required/i,
  /avoid marketing use/i,
  /until replaced or cleared/i,
  /confirm .*permission/i,
  /source.*required/i,
  /unknown/i,
];

async function main() {
  const args = new Set(process.argv.slice(2));
  const shouldWrite = args.has("--write");
  const catalog = JSON.parse(await fs.readFile(captionCatalogPath, "utf8"));
  const assetTracker = await readAssetTracker();
  const plan = buildPlan(catalog, assetTracker);

  if (shouldWrite) {
    await fs.writeFile(planJsonPath, `${JSON.stringify(plan, null, 2)}\n`);
    await fs.writeFile(planMdPath, renderMarkdown(plan));
  }

  console.log(
    JSON.stringify(
      {
        mode: shouldWrite ? "wrote-plan" : "dry-run",
        authorizedAssets: plan.summary.authorizedAssets,
        plannedDerivativeCount: plan.summary.plannedDerivativeCount,
        blockedAssets: plan.summary.blockedAssets,
        json: relative(planJsonPath),
        markdown: relative(planMdPath),
      },
      null,
      2,
    ),
  );
}

function buildPlan(catalog, assetTracker) {
  const projects = [];
  const blocked = [];

  for (const project of catalog.projects ?? []) {
    const sourceAssets = [
      ...(project.candidates ?? []).map((asset) => ({ ...asset, sourceKind: "candidate" })),
      ...(project.publicMedia ?? []).map((asset) => ({ ...asset, sourceKind: "publicMedia" })),
    ];
    const plannedAssets = [];

    for (const asset of sourceAssets) {
      const decision = clearanceDecision(asset, project, assetTracker);
      if (!decision.authorized) {
        blocked.push({
          projectId: project.projectId,
          name: project.name,
          path: asset.researchPath ?? asset.publicPath ?? "",
          sourceKind: asset.sourceKind,
          status: decision.status,
          reason: decision.reason,
        });
        continue;
      }

      const inputPath = asset.researchPath ?? asset.publicPath;
      plannedAssets.push({
        projectId: project.projectId,
        role: asset.role ?? "media",
        sourceKind: asset.sourceKind,
        inputPath,
        sourceUrl: asset.sourceUrl ?? "",
        sourcePage: asset.sourcePage ?? "",
        credit: creditLine(asset),
        clearanceStatus: decision.status,
        derivatives: DEFAULT_VARIANTS.map((variant) => ({
          ...variant,
          outputPath: derivativePath(project.projectId, asset, variant),
        })),
      });
    }

    if (plannedAssets.length > 0) {
      projects.push({
        projectId: project.projectId,
        name: project.name,
        assets: plannedAssets,
      });
    }
  }

  const authorizedAssets = projects.reduce((count, project) => count + project.assets.length, 0);
  const plannedDerivativeCount = projects.reduce(
    (count, project) => count + project.assets.reduce((assetCount, asset) => assetCount + asset.derivatives.length, 0),
    0,
  );

  return {
    generatedAt: new Date().toISOString(),
    mode: "plan-only; no image generation or resizing performed",
    sourceCatalog: relative(captionCatalogPath),
    authorizationRule:
    "Only assets with explicit positive asset-level clearance text or an authorized project entry in the reviewed asset tracker are included. Source availability alone is not authorization.",
    outputBoundary:
      "This planner writes only research/source-material-review/authorized-asset-resize-plan.{json,md}. A separate future asset agent may consume the plan.",
    variants: DEFAULT_VARIANTS,
    summary: {
      authorizedAssets,
      plannedDerivativeCount,
      blockedAssets: blocked.length,
      projectsWithAuthorizedAssets: projects.length,
    },
    projects,
    blocked,
  };
}

function clearanceDecision(asset, project, assetTracker) {
  const assetStatus = [
    asset.clearanceStatus,
    asset.rightsStatus,
  ]
    .filter(Boolean)
    .join(" | ");
  const status = [
    assetStatus,
    project.rightsStatus,
  ]
    .filter(Boolean)
    .join(" | ");

  if (!status) {
    return {
      authorized: false,
      status: "",
      reason: "No explicit clearance status.",
    };
  }

  const trackedProject = assetTracker.get(normalizeProjectId(project.projectId));
  if (trackedProject?.authorized && (asset.publicPath || asset.researchPath)) {
    return {
      authorized: true,
      status: [status, trackedProject.status].filter(Boolean).join(" | "),
      reason: "Project authorization recorded in reviewed asset tracker; preserve original-source credit.",
    };
  }

  if (assetStatus && AUTHORIZED_PATTERNS.some((pattern) => pattern.test(assetStatus))) {
    return {
      authorized: true,
      status,
      reason: "Explicit positive asset authorization status matched.",
    };
  }

  if (BLOCKED_PATTERNS.some((pattern) => pattern.test(status))) {
    return {
      authorized: false,
      status,
      reason: "Status still requires rights/source review.",
    };
  }

  if (AUTHORIZED_PATTERNS.some((pattern) => pattern.test(status))) {
    return {
      authorized: true,
      status,
      reason: "Explicit positive authorization status matched.",
    };
  }

  return {
    authorized: false,
    status,
    reason: "Status is not an explicit positive authorization.",
  };
}

async function readAssetTracker() {
  const tracker = new Map();
  const csv = await fs.readFile(assetTrackerPath, "utf8").catch(() => "");
  const [headerLine, ...rows] = csv.trim().split(/\r?\n/);
  if (!headerLine) return tracker;
  const headers = parseCsvLine(headerLine);
  const projectIdIndex = headers.indexOf("Project ID");
  const statusIndex = headers.indexOf("Image Authorization");
  if (projectIdIndex === -1 || statusIndex === -1) return tracker;

  for (const row of rows) {
    const cells = parseCsvLine(row);
    const projectId = normalizeProjectId(cells[projectIdIndex]);
    const status = cells[statusIndex] || "";
    tracker.set(projectId, {
      status,
      authorized: /\bauthorized\b/i.test(status) && !/pending|not authorized|unauthorized/i.test(status),
    });
  }
  return tracker;
}

function parseCsvLine(line) {
  const cells = [];
  let current = "";
  let inQuotes = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === "\"" && inQuotes && next === "\"") {
      current += "\"";
      index += 1;
    } else if (char === "\"") {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      cells.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current);
  return cells.map((cell) => cell.trim());
}

function normalizeProjectId(projectId) {
  return String(projectId ?? "").trim().toLowerCase();
}

function creditLine(asset) {
  if (asset.captionReadyLabel) return asset.captionReadyLabel;
  if (asset.sourceLabel) return `Source: ${asset.sourceLabel}`;
  if (asset.providerLabel) return `Source: ${asset.providerLabel}`;
  return "Source: authorized asset provider";
}

function derivativePath(projectId, asset, variant) {
  const inputPath = asset.researchPath ?? asset.publicPath ?? "asset";
  const stem = slugify(path.basename(inputPath, path.extname(inputPath)));
  const suffix = variant.height ? `${variant.width}x${variant.height}` : `${variant.width}w`;
  return `public/projects/${projectId}/media/generated/${stem}-${variant.label}-${suffix}.${variant.format}`;
}

function renderMarkdown(plan) {
  const lines = [
    "# Authorized Asset Resize Plan",
    "",
    `Generated: ${plan.generatedAt}`,
    "",
    "This is a plan-only artifact. It does not generate, resize, publish, or alter image assets.",
    "",
    "## Summary",
    "",
    `- Authorized source assets: ${plan.summary.authorizedAssets}`,
    `- Planned derivatives: ${plan.summary.plannedDerivativeCount}`,
    `- Blocked/non-authorized assets: ${plan.summary.blockedAssets}`,
    `- Projects with authorized assets: ${plan.summary.projectsWithAuthorizedAssets}`,
    "",
    "## Authorization Rule",
    "",
    plan.authorizationRule,
    "",
    "## Future Asset-Agent Command",
    "",
    "```bash",
    "node research/scripts/plan-authorized-asset-resize.mjs --write",
    "```",
    "",
    "The future image agent should consume `research/source-material-review/authorized-asset-resize-plan.json`, generate only listed derivatives, preserve the `credit` field beside every output, and stop if any source asset is missing or no longer explicitly authorized.",
    "",
    "## Variant Targets",
    "",
    ...plan.variants.map((variant) => {
      const size = variant.height ? `${variant.width}x${variant.height}` : `${variant.width}px wide`;
      return `- ${variant.label}: ${size}, ${variant.format}, quality ${variant.quality}`;
    }),
    "",
    "## Authorized Assets",
    "",
  ];

  if (plan.projects.length === 0) {
    lines.push("- None found. Do not generate resized derivatives until written authorization is recorded upstream.");
  } else {
    for (const project of plan.projects) {
      lines.push(`### ${project.name}`);
      lines.push("");
      for (const asset of project.assets) {
        lines.push(`- ${asset.inputPath} | ${asset.credit}`);
      }
      lines.push("");
    }
  }

  lines.push("", "## Blocked Inputs", "");
  for (const item of plan.blocked.slice(0, 200)) {
    lines.push(`- ${item.projectId}: ${item.path || item.sourceKind} | ${item.reason}`);
  }
  if (plan.blocked.length > 200) {
    lines.push(`- ${plan.blocked.length - 200} additional blocked inputs omitted from markdown; see JSON.`);
  }

  return `${lines.join("\n")}\n`;
}

function slugify(value) {
  return value
    .toString()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function relative(filePath) {
  return path.relative(workspace, filePath);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
