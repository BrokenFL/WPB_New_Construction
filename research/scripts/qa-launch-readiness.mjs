import fs from "node:fs/promises";
import path from "node:path";

const workspace = process.cwd();
const distRoot = path.join(workspace, "dist");
const reportPath = path.join(workspace, "research/source-material-review/launch-qa-report.md");
const floorplanDataPath = path.join(workspace, "public/data/floorplans.json");
const duplicateReportPath = path.join(workspace, "research/source-material-review/asset-duplicate-inventory.json");

const requiredRoutes = [
  "/",
  "/floorplans/",
  "/answers/",
  "/updates/",
  "/methodology/",
  "/fair-housing/",
  "/privacy/",
  "/terms/",
  "/inquire/",
  "/projects/olara/",
  "/projects/ritz-carlton-wpb/",
  "/projects/mandarin-oriental/",
  "/projects/mr-c/",
  "/projects/alba-palm-beach/",
  "/projects/shorecrest/",
  "/projects/south-flagler-house/",
  "/projects/nora-house/",
];

function routeFile(route) {
  return route === "/" ? path.join(distRoot, "index.html") : path.join(distRoot, route, "index.html");
}

function localPublicPath(href) {
  if (!href.startsWith("/")) return "";
  return path.join(workspace, "public", decodeURIComponent(href.slice(1)));
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function readBuiltAssetText(extension) {
  const assetsDir = path.join(distRoot, "assets");
  const entries = await fs.readdir(assetsDir, { withFileTypes: true }).catch(() => []);
  const contents = [];
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(extension)) continue;
    contents.push(await fs.readFile(path.join(assetsDir, entry.name), "utf8"));
  }
  return contents.join("\n");
}

async function dirSize(dirPath) {
  let total = 0;
  const entries = await fs.readdir(dirPath, { withFileTypes: true }).catch(() => []);
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      total += await dirSize(fullPath);
    } else if (entry.isFile()) {
      total += (await fs.stat(fullPath)).size;
    }
  }
  return total;
}

function formatBytes(bytes) {
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function formatDelta(bytes) {
  if (bytes === null || bytes === undefined) return "n/a";
  const prefix = bytes > 0 ? "+" : "";
  return `${prefix}${formatBytes(bytes)}`;
}

async function main() {
  const findings = [];
  const checks = [];

  for (const route of requiredRoutes) {
    const filePath = routeFile(route);
    const ok = await exists(filePath);
    checks.push({ label: `Prerender route ${route}`, ok, detail: path.relative(workspace, filePath) });
    if (!ok) findings.push(`Missing prerendered route: ${route}`);
  }

  for (const route of requiredRoutes.filter((route) => route !== "/")) {
    const html = await fs.readFile(routeFile(route), "utf8").catch(() => "");
    const canonical = `https://wpbnewconstruction.com${route}`;
    const ok = html.includes(`rel="canonical" href="${canonical}"`);
    checks.push({ label: `Canonical ${route}`, ok, detail: canonical });
    if (!ok) findings.push(`Missing or incorrect canonical for ${route}`);
  }

  const floorplans = await readJson(floorplanDataPath);
  let floorplanTotal = 0;
  let missingHref = 0;
  let missingPublicFile = 0;
  for (const project of floorplans.projects) {
    for (const plan of project.plans) {
      floorplanTotal += 1;
      if (!plan.href) {
        const requestOnly = /request|available/i.test(`${plan.status ?? ""} ${plan.sourceUse ?? ""}`);
        if (!requestOnly) {
          missingHref += 1;
          findings.push(`Floorplan missing href: ${project.projectId} / ${plan.title}`);
        }
        continue;
      }
      if (plan.href.startsWith("/projects/")) {
        const filePath = localPublicPath(plan.href);
        if (!(await exists(filePath))) {
          missingPublicFile += 1;
          findings.push(`Missing public floorplan file: ${plan.href}`);
        }
      }
    }
  }

  checks.push({ label: "Floorplan href coverage", ok: missingHref === 0, detail: `${floorplanTotal - missingHref}/${floorplanTotal}` });
  checks.push({ label: "Local floorplan file coverage", ok: missingPublicFile === 0, detail: `${missingPublicFile} missing public files` });

  const homeHtml = await fs.readFile(routeFile("/"), "utf8");
  const leadFormOk = homeHtml.includes('form name="wpb-lead-intake"') && homeHtml.includes('netlify-honeypot="company"');
  checks.push({ label: "Lead intake static form", ok: leadFormOk, detail: "wpb-lead-intake" });
  if (!leadFormOk) findings.push("Lead intake static form is missing from prerender shell.");

  const builtJavaScript = await readBuiltAssetText(".js");
  const googleMapsLoaderOk = builtJavaScript.includes("maps.googleapis.com/maps/api/js");
  const requireGoogleMaps = process.env.REQUIRE_GOOGLE_MAPS === "true";
  checks.push({
    label: "Homepage Google Maps API loader",
    ok: googleMapsLoaderOk || !requireGoogleMaps,
    detail: googleMapsLoaderOk ? "Google Maps script loader present" : "Google Maps key not required for this QA run",
  });
  if (requireGoogleMaps && !googleMapsLoaderOk) findings.push("Homepage Google Maps API loader is missing from the production bundle.");

  const artifactSizes = {
    public: await dirSize(path.join(workspace, "public")),
    research: await dirSize(path.join(workspace, "research")),
    dist: await dirSize(path.join(workspace, "dist")),
    playwright: await dirSize(path.join(workspace, ".playwright-cli")),
    output: await dirSize(path.join(workspace, "output")),
  };
  const duplicateReport = await readJson(duplicateReportPath).catch(() => null);
  const duplicateSummary = duplicateReport?.summary ?? null;

  const reportLines = [
    "# Launch QA Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Summary",
    "",
    `- Routes checked: ${requiredRoutes.length}`,
    `- Floorplan records checked: ${floorplanTotal}`,
    `- Blocking findings: ${findings.length}`,
    `- Public artifact size: ${formatBytes(artifactSizes.public)}`,
    `- Research artifact size: ${formatBytes(artifactSizes.research)}`,
    `- Dist artifact size: ${formatBytes(artifactSizes.dist)}`,
    `- Duplicate source extra bytes: ${duplicateSummary ? formatBytes(duplicateSummary.sourceDuplicateExtraBytes) : "no duplicate report found"}`,
    `- Duplicate source byte delta: ${duplicateSummary ? formatDelta(duplicateSummary.sourceDuplicateExtraByteDelta) : "n/a"}`,
    "",
    "## Checks",
    "",
    ...checks.map((check) => `- ${check.ok ? "PASS" : "FAIL"} - ${check.label}: ${check.detail}`),
    "",
    "## Findings",
    "",
    ...(findings.length ? findings.map((finding) => `- ${finding}`) : ["- No blocking static/build findings from automated QA."]),
    "",
    "## Artifact And Duplicate Watch",
    "",
    `- public/: ${formatBytes(artifactSizes.public)}`,
    `- research/: ${formatBytes(artifactSizes.research)}`,
    `- dist/: ${formatBytes(artifactSizes.dist)}`,
    `- .playwright-cli/: ${formatBytes(artifactSizes.playwright)}`,
    `- output/: ${formatBytes(artifactSizes.output)}`,
    duplicateSummary
      ? `- Duplicate inventory: ${duplicateSummary.sourceDuplicateHashGroups} source groups, ${formatBytes(duplicateSummary.sourceDuplicateExtraBytes)} source extra bytes, delta ${formatDelta(duplicateSummary.sourceDuplicateExtraByteDelta)}`
      : "- Duplicate inventory: not generated; run `npm run assets:duplicates` before launch QA to include duplicate deltas.",
    "",
    "## Manual QA Still Required",
    "",
    "- Browser screenshots for desktop and mobile visual layout.",
    "- Final CRM/lead destination test after provider selection.",
    "- Final broker/compliance review before launch.",
  ];

  await fs.writeFile(reportPath, `${reportLines.join("\n")}\n`);
  console.log(JSON.stringify({ reportPath, checks: checks.length, findings: findings.length }, null, 2));
  if (findings.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
