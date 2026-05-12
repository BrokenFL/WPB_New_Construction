import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const workspace = process.cwd();
const sourceRepo = path.join(workspace, "research/source-repos/WestPalmNewConstruction");
const sourceMasterPath = path.join(sourceRepo, "data/buildings_master.json");
const localProposalsPath = path.join(workspace, "src/proposals.ts");
const outRoot = path.join(workspace, "research/asset-library");
const projectsRoot = path.join(outRoot, "projects");

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36 WPBAssetResearch/1.0";

const MAX_PAGES_PER_PROJECT = 5;
const MAX_IMAGES_PER_PROJECT = 4;
const MIN_IMAGE_BYTES = 60_000;
const MAX_IMAGE_BYTES = 3_500_000;

const keywordPattern =
  /(floor|plan|plans|brochure|fact|factsheet|fact-sheet|download|downloads|gallery|residence|residences|amenit|availability|press|media|views|lifestyle)/i;

async function main() {
  await fs.mkdir(projectsRoot, { recursive: true });

  const master = JSON.parse(await fs.readFile(sourceMasterPath, "utf8"));
  const localBuildings = await loadLocalProposalBuildings();
  const localById = new Map(localBuildings.map((building) => [building.id, building]));

  const projectRecords = master.buildings.map((building) => {
    const local = localById.get(building.project_id);
    return mergeProject(building, local);
  });

  const harvestResults = [];

  for (const project of projectRecords) {
    const projectDir = path.join(projectsRoot, project.projectId);
    await prepareProjectFolders(projectDir);
    await copyGeneratedPlaceholders(project, projectDir);

    const result = await harvestProject(project, projectDir);
    harvestResults.push(result);
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    sourceRepo: "https://github.com/BrokenFL/WestPalmNewConstruction",
    sourceRepoCommit: await readSourceRepoCommit(),
    usageNote:
      "Raw public-source research library. Images, renderings, PDFs, logos, and brochures may be copyrighted or broker/developer-owned. Treat every downloaded third-party asset as rights-review-required before publishing.",
    projectCount: harvestResults.length,
    projects: harvestResults,
  };

  await fs.writeFile(
    path.join(outRoot, "asset-manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );

  await fs.writeFile(path.join(outRoot, "README.md"), renderReadme(manifest));
  await fs.writeFile(path.join(outRoot, "asset-gaps.md"), renderGaps(manifest));

  console.log(
    JSON.stringify(
      {
        outRoot,
        projectCount: manifest.projectCount,
        downloadedPdfs: harvestResults.reduce(
          (sum, project) => sum + project.downloadedAssets.filter((asset) => asset.kind === "pdf").length,
          0,
        ),
        downloadedImages: harvestResults.reduce(
          (sum, project) =>
            sum + project.downloadedAssets.filter((asset) => asset.kind === "image").length,
          0,
        ),
      },
      null,
      2,
    ),
  );
}

async function loadLocalProposalBuildings() {
  const source = await fs.readFile(localProposalsPath, "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;

  const encoded = Buffer.from(transpiled).toString("base64");
  const module = await import(`data:text/javascript;base64,${encoded}`);
  return module.proposalScenarios.flatMap((scenario) =>
    scenario.buildings.map((building) => ({
      ...building,
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      market: scenario.market,
    })),
  );
}

function mergeProject(remote, local) {
  const assetLinks = [];

  for (const url of remote.floor_plan_links ?? []) {
    assetLinks.push({ label: inferLabel(url, "Floor plan"), url, type: "Floor plan", source: "github-master" });
  }
  for (const url of remote.floor_plans ?? []) {
    assetLinks.push({ label: inferLabel(url, "Floor plan"), url, type: "Floor plan", source: "github-master" });
  }
  for (const url of remote.brochure_links ?? []) {
    assetLinks.push({ label: inferLabel(url, "Brochure"), url, type: "Brochure", source: "github-master" });
  }
  for (const item of remote.official_downloads ?? []) {
    if (typeof item === "string") {
      assetLinks.push({ label: inferLabel(item, "Download"), url: item, type: "Download", source: "github-master" });
    } else if (item?.url) {
      assetLinks.push({
        label: item.label ?? inferLabel(item.url, "Download"),
        url: item.url,
        type: classifyAssetType(item.url, item.label),
        source: "github-master",
      });
    }
  }
  for (const asset of local?.assetLinks ?? []) {
    assetLinks.push({
      label: asset.label,
      url: asset.url,
      type: asset.type,
      note: asset.note,
      source: "current-app",
    });
  }

  const sourceUrls = unique([
    remote.official_website,
    ...(remote.source_urls ?? []),
    ...(remote.sources ?? []).map((source) => source.url),
    ...(local?.sourceUrls ?? []),
  ]);

  const crawlSeeds = unique([
    remote.official_website,
    ...sourceUrls,
    ...assetLinks.map((asset) => asset.url).filter((url) => !isLikelyPdf(url)),
  ]);

  return {
    projectId: remote.project_id,
    slug: remote.slug,
    name: remote.project_name,
    address: remote.address,
    corridor: remote.neighborhood_subarea || remote.waterfront_status || local?.market || "",
    officialWebsite: remote.official_website || "",
    status: remote.status,
    completion: remote.estimated_or_actual_completion_date || local?.year?.toString() || "",
    developer: remote.developer,
    architect: remote.architect,
    interiorDesigner: remote.interior_designer,
    landscapeArchitect: remote.landscape_architect,
    residences: remote.number_of_residences,
    stories: remote.number_of_stories,
    unitMix: remote.unit_mix,
    squareFootage: remote.square_footage_ranges,
    pricing: remote.pricing_ranges,
    amenities: splitList(remote.amenities),
    salesContact: remote.sales_gallery_contact_info,
    confidence: remote.confidence_score,
    notes: remote.notes_on_conflicts_or_missing_info,
    sourceUrls,
    assetLinks: uniqueAssets(assetLinks),
    crawlSeeds,
    generatedAssets: remote.generated_assets ?? [],
    localModelUri: local?.modelUri ?? "",
    localScenario: local?.scenarioName ?? "",
  };
}

async function prepareProjectFolders(projectDir) {
  await fs.mkdir(path.join(projectDir, "floorplans"), { recursive: true });
  await fs.mkdir(path.join(projectDir, "brochures"), { recursive: true });
  await fs.mkdir(path.join(projectDir, "factsheets"), { recursive: true });
  await fs.mkdir(path.join(projectDir, "downloads"), { recursive: true });
  await fs.mkdir(path.join(projectDir, "images/candidates"), { recursive: true });
  await fs.mkdir(path.join(projectDir, "images/generated-placeholders"), { recursive: true });
  await fs.mkdir(path.join(projectDir, "source-pages"), { recursive: true });
}

async function copyGeneratedPlaceholders(project, projectDir) {
  const copied = [];
  for (const asset of project.generatedAssets) {
    const sourcePath = path.join(sourceRepo, "public", asset.replace(/^\/+/, ""));
    const exists = await fileExists(sourcePath);
    if (!exists) continue;
    const targetName = `placeholder--${path.basename(sourcePath)}`;
    const targetPath = path.join(projectDir, "images/generated-placeholders", targetName);
    await fs.copyFile(sourcePath, targetPath);
    copied.push(relativeOut(targetPath));
  }
  project.generatedPlaceholderCopies = copied;
}

async function harvestProject(project, projectDir) {
  const knownAssetDownloads = [];
  const crawlFindings = {
    pages: [],
    discoveredLinks: [],
    imageCandidates: [],
    pdfCandidates: [],
    errors: [],
  };

  for (const asset of project.assetLinks) {
    if (isLikelyPdf(asset.url)) {
      const downloaded = await downloadAsset(asset.url, asset.type, projectDir, asset.label);
      knownAssetDownloads.push({ ...downloaded, label: asset.label, source: asset.source });
    }
  }

  await crawlProject(project, crawlFindings);

  const discoveredPdfAssets = [];
  for (const candidate of crawlFindings.pdfCandidates) {
    if (knownAssetDownloads.some((asset) => sameUrl(asset.url, candidate.url))) continue;
    const type = classifyAssetType(candidate.url, candidate.label);
    const downloaded = await downloadAsset(candidate.url, type, projectDir, candidate.label);
    discoveredPdfAssets.push({ ...downloaded, label: candidate.label, source: "crawl" });
  }

  const downloadedImages = [];
  let imageIndex = 1;
  for (const image of crawlFindings.imageCandidates) {
    if (downloadedImages.length >= MAX_IMAGES_PER_PROJECT) break;
    const downloaded = await downloadImageCandidate(image.url, projectDir, imageIndex);
    if (downloaded.status === "downloaded") {
      imageIndex += 1;
      downloadedImages.push({ ...downloaded, sourcePage: image.sourcePage });
    }
  }

  const downloadedAssets = [...knownAssetDownloads, ...discoveredPdfAssets, ...downloadedImages];

  const projectMetadata = {
    ...project,
    downloadedAssets,
    crawlFindings,
    rightsNote:
      "Every third-party image/PDF/rendering in this folder is research-only until the owner, broker, developer, or license terms permit site publication.",
  };

  await fs.writeFile(
    path.join(projectDir, "metadata.json"),
    `${JSON.stringify(projectMetadata, null, 2)}\n`,
  );
  await fs.writeFile(path.join(projectDir, "source-links.md"), renderProjectSources(projectMetadata));
  await fs.writeFile(
    path.join(projectDir, "image-candidates.json"),
    `${JSON.stringify(crawlFindings.imageCandidates, null, 2)}\n`,
  );

  return summarizeProject(projectMetadata);
}

async function crawlProject(project, findings) {
  const queue = project.crawlSeeds.filter(Boolean).slice(0, MAX_PAGES_PER_PROJECT);
  const seen = new Set();
  const officialHost = safeHost(project.officialWebsite);

  while (queue.length && findings.pages.length < MAX_PAGES_PER_PROJECT) {
    const url = queue.shift();
    if (!url || seen.has(url) || isLikelyPdf(url)) continue;
    seen.add(url);

    const response = await fetchWithTimeout(url);
    if (!response.ok) {
      findings.errors.push({ url, status: response.status, error: response.error ?? response.statusText });
      continue;
    }

    const contentType = response.contentType;
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
      continue;
    }

    const html = response.body;
    const pageInfo = extractPageInfo(url, html);
    findings.pages.push(pageInfo);
    await fs.mkdir(path.join(projectsRoot, project.projectId, "source-pages"), { recursive: true });
    await fs.writeFile(
      path.join(projectsRoot, project.projectId, "source-pages", `${pad(findings.pages.length)}--page-summary.json`),
      `${JSON.stringify(pageInfo, null, 2)}\n`,
    );

    const links = extractLinks(url, html);
    for (const link of links) {
      findings.discoveredLinks.push(link);

      if (isLikelyPdf(link.url) && keywordPattern.test(`${link.url} ${link.label}`)) {
        addUniqueFinding(findings.pdfCandidates, link);
      }

      if (isLikelyImage(link.url) && !isLikelyIcon(link.url)) {
        addUniqueFinding(findings.imageCandidates, { ...link, sourcePage: url });
      }

      const linkHost = safeHost(link.url);
      const shouldQueue =
        linkHost &&
        officialHost &&
        linkHost === officialHost &&
        keywordPattern.test(`${link.url} ${link.label}`) &&
        !isLikelyImage(link.url) &&
        !isLikelyPdf(link.url);

      if (shouldQueue && !seen.has(link.url) && !queue.includes(link.url)) {
        queue.push(link.url);
      }
    }
  }

  findings.discoveredLinks = uniqueFindings(findings.discoveredLinks).slice(0, 250);
  findings.imageCandidates = uniqueFindings(findings.imageCandidates).slice(0, 80);
  findings.pdfCandidates = uniqueFindings(findings.pdfCandidates).slice(0, 80);
}

async function fetchWithTimeout(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 18_000);
    const res = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": USER_AGENT,
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,application/pdf,image/avif,image/webp,image/png,image/jpeg,*/*;q=0.8",
      },
    });
    clearTimeout(timeout);
    const contentType = res.headers.get("content-type") ?? "";
    const buffer = Buffer.from(await res.arrayBuffer());
    return {
      ok: res.ok,
      status: res.status,
      statusText: res.statusText,
      contentType,
      body: contentType.includes("text/") || contentType.includes("html") ? buffer.toString("utf8") : buffer,
      bytes: buffer.length,
      finalUrl: res.url,
    };
  } catch (error) {
    return { ok: false, status: 0, error: error.message, contentType: "", body: "" };
  }
}

async function downloadAsset(url, type, projectDir, label) {
  const response = await fetchWithTimeout(url);
  if (!response.ok) {
    return { kind: "pdf", status: "failed", url, type, label, error: response.error ?? response.statusText };
  }

  const isPdf = response.contentType.includes("pdf") || isLikelyPdf(url);
  if (!isPdf) {
    return { kind: "pdf", status: "skipped-not-pdf", url, type, label, contentType: response.contentType };
  }

  const folder = folderForType(type);
  const filename = `${safeFileBase(label || inferLabel(url, type))}--${shortHash(url)}.pdf`;
  const targetPath = path.join(projectDir, folder, filename);
  await fs.writeFile(targetPath, response.body);
  return {
    kind: "pdf",
    status: "downloaded",
    type,
    label,
    url,
    path: relativeOut(targetPath),
    bytes: response.bytes,
  };
}

async function downloadImageCandidate(url, projectDir, index) {
  const head = await fetchHead(url);
  if (head.ok && head.contentLength > MAX_IMAGE_BYTES) {
    return { kind: "image", status: "skipped-large", url, bytes: head.contentLength };
  }

  const response = await fetchWithTimeout(url);
  if (!response.ok) {
    return { kind: "image", status: "failed", url, error: response.error ?? response.statusText };
  }
  if (!response.contentType.startsWith("image/") && !isLikelyImage(url)) {
    return { kind: "image", status: "skipped-not-image", url, contentType: response.contentType };
  }
  if (response.bytes < MIN_IMAGE_BYTES) {
    return { kind: "image", status: "skipped-small", url, bytes: response.bytes };
  }
  if (response.bytes > MAX_IMAGE_BYTES) {
    return { kind: "image", status: "skipped-large", url, bytes: response.bytes };
  }

  const ext = extensionForImage(url, response.contentType);
  const targetPath = path.join(
    projectDir,
    "images/candidates",
    `${pad(index)}--official-candidate--${safeHost(url) || "source"}--${shortHash(url)}.${ext}`,
  );
  await fs.writeFile(targetPath, response.body);
  return {
    kind: "image",
    status: "downloaded",
    url,
    path: relativeOut(targetPath),
    bytes: response.bytes,
    contentType: response.contentType,
  };
}

async function fetchHead(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8_000);
    const res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": USER_AGENT,
        accept: "image/avif,image/webp,image/png,image/jpeg,*/*;q=0.8",
      },
    });
    clearTimeout(timeout);
    return {
      ok: res.ok,
      contentLength: Number(res.headers.get("content-length") ?? 0),
      contentType: res.headers.get("content-type") ?? "",
    };
  } catch {
    return { ok: false, contentLength: 0, contentType: "" };
  }
}

function extractPageInfo(url, html) {
  return {
    url,
    title: firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i),
    description: firstMatch(
      html,
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    ),
    ogImage: firstMatch(
      html,
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    ),
  };
}

function extractLinks(baseUrl, html) {
  const links = [];
  const attrPattern = /\b(?:href|src)=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = attrPattern.exec(html))) {
    const raw = decodeHtml(match[1]);
    const normalized = normalizeUrl(raw, baseUrl);
    if (!normalized) continue;
    const elementStart = Math.max(0, html.lastIndexOf("<", match.index));
    const elementEnd = html.indexOf(">", match.index);
    const element = html.slice(elementStart, elementEnd > -1 ? elementEnd + 1 : match.index + 200);
    links.push({
      url: normalized,
      label: cleanText(element.replace(/<[^>]+>/g, " ")).slice(0, 160),
    });
  }

  const metaImage = firstMatch(
    html,
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
  );
  if (metaImage) {
    const normalized = normalizeUrl(decodeHtml(metaImage), baseUrl);
    if (normalized) links.push({ url: normalized, label: "Open Graph image" });
  }

  const absoluteUrlPattern = /https?:\/\/[^"'\s<>\\)]+/gi;
  while ((match = absoluteUrlPattern.exec(html))) {
    const normalized = normalizeUrl(match[0], baseUrl);
    if (normalized && (isLikelyPdf(normalized) || isLikelyImage(normalized))) {
      links.push({ url: normalized, label: inferLabel(normalized, "Discovered asset") });
    }
  }

  return uniqueFindings(links);
}

function renderProjectSources(project) {
  const lines = [
    `# ${project.name}`,
    "",
    "## Usage Note",
    "",
    "Downloaded third-party assets in this folder are research-only until publication rights are confirmed.",
    "",
    "## Official / Source Links",
    "",
  ];

  for (const url of project.sourceUrls) {
    lines.push(`- ${url}`);
  }

  lines.push("", "## Known Asset Links", "");
  for (const asset of project.assetLinks) {
    lines.push(`- ${asset.type}: ${asset.label} — ${asset.url}`);
  }

  lines.push("", "## Downloaded Assets", "");
  for (const asset of project.downloadedAssets) {
    if (asset.status === "downloaded") {
      lines.push(`- ${asset.type ?? asset.kind}: ${asset.label ?? asset.url} -> ${asset.path}`);
    }
  }

  return `${lines.join("\n")}\n`;
}

function renderReadme(manifest) {
  return `# WPB Raw Asset Library

Generated: ${manifest.generatedAt}

Source inventory: ${manifest.sourceRepo}

This directory is a raw research library for the luxury West Palm Beach new-construction site. It collects public project metadata, source links, downloaded PDFs, candidate imagery, and generated placeholder imagery.

## Rights Note

${manifest.usageNote}

## Directory Structure

- \`asset-manifest.json\`: machine-readable master inventory.
- \`asset-gaps.md\`: high-level completeness and missing-materials checklist.
- \`projects/<project-id>/metadata.json\`: project-specific metadata, crawl findings, downloaded assets, and rights note.
- \`projects/<project-id>/floorplans/\`: floor-plan PDFs.
- \`projects/<project-id>/brochures/\`: brochure PDFs.
- \`projects/<project-id>/factsheets/\`: fact-sheet PDFs.
- \`projects/<project-id>/downloads/\`: other official PDFs/downloads.
- \`projects/<project-id>/images/candidates/\`: downloaded public image candidates requiring rights review.
- \`projects/<project-id>/images/generated-placeholders/\`: generated/editorial placeholder images from the referenced repo.

## Projects

${manifest.projects
  .map(
    (project) =>
      `- ${project.name} (${project.projectId}) — PDFs: ${project.downloadedAssets.filter((asset) => asset.kind === "pdf" && asset.status === "downloaded").length}, image candidates: ${project.downloadedAssets.filter((asset) => asset.kind === "image" && asset.status === "downloaded").length}`,
  )
  .join("\n")}
`;
}

function renderGaps(manifest) {
  const lines = [
    "# WPB Asset Gaps",
    "",
    "Use this as the practical collection list before rebuilding the classy Option A site.",
    "",
    "| Project | Floorplans | Brochures/Factsheets | Images | Missing / Human Review |",
    "|---|---:|---:|---:|---|",
  ];

  for (const project of manifest.projects) {
    const pdfs = project.downloadedAssets.filter(
      (asset) => asset.kind === "pdf" && asset.status === "downloaded",
    );
    const floorplans = pdfs.filter((asset) => asset.type === "Floor plan").length;
    const brochures = pdfs.filter((asset) => asset.type !== "Floor plan").length;
    const images = project.downloadedAssets.filter(
      (asset) => asset.kind === "image" && asset.status === "downloaded",
    ).length;
    const missing = [];
    if (!floorplans) missing.push("floorplans");
    if (!brochures) missing.push("brochure/fact sheet");
    if (!images) missing.push("publishable hero/gallery images");
    if (!project.officialWebsite) missing.push("official website");
    missing.push("rights clearance");

    lines.push(
      `| ${project.name} | ${floorplans} | ${brochures} | ${images} | ${missing.join(", ")} |`,
    );
  }

  return `${lines.join("\n")}\n`;
}

function summarizeProject(project) {
  return {
    projectId: project.projectId,
    slug: project.slug,
    name: project.name,
    officialWebsite: project.officialWebsite,
    address: project.address,
    status: project.status,
    completion: project.completion,
    developer: project.developer,
    architect: project.architect,
    interiorDesigner: project.interiorDesigner,
    residences: project.residences,
    stories: project.stories,
    pricing: project.pricing,
    sourceUrls: project.sourceUrls,
    knownAssetLinks: project.assetLinks,
    downloadedAssets: project.downloadedAssets,
    generatedPlaceholderCopies: project.generatedPlaceholderCopies,
    crawlPages: project.crawlFindings.pages.map((page) => page.url),
    pdfCandidates: project.crawlFindings.pdfCandidates,
    imageCandidateCount: project.crawlFindings.imageCandidates.length,
    errors: project.crawlFindings.errors,
  };
}

function folderForType(type) {
  const lower = String(type ?? "").toLowerCase();
  if (lower.includes("floor")) return "floorplans";
  if (lower.includes("fact")) return "factsheets";
  if (lower.includes("brochure")) return "brochures";
  return "downloads";
}

function classifyAssetType(url, label = "") {
  const text = `${url} ${label}`.toLowerCase();
  if (text.includes("floor")) return "Floor plan";
  if (text.includes("fact")) return "Fact sheet";
  if (text.includes("brochure") || text.includes("rack") || text.includes("guide")) return "Brochure";
  return "Download";
}

function inferLabel(url, fallback) {
  try {
    const parsed = new URL(url);
    const base = path.basename(parsed.pathname) || fallback;
    return cleanText(decodeURIComponent(base).replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " ")) || fallback;
  } catch {
    return fallback;
  }
}

function splitList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return String(value)
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function uniqueAssets(assets) {
  const seen = new Set();
  return assets.filter((asset) => {
    const key = canonicalUrl(asset.url);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function addUniqueFinding(list, item) {
  if (!list.some((existing) => sameUrl(existing.url, item.url))) list.push(item);
}

function uniqueFindings(list) {
  const seen = new Set();
  return list.filter((item) => {
    const key = canonicalUrl(item.url);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function canonicalUrl(url) {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return "";
  }
}

function sameUrl(a, b) {
  return canonicalUrl(a) === canonicalUrl(b);
}

function normalizeUrl(raw, baseUrl) {
  if (!raw || raw.startsWith("data:") || raw.startsWith("mailto:") || raw.startsWith("tel:")) return "";
  try {
    return new URL(raw, baseUrl).toString();
  } catch {
    return "";
  }
}

function isLikelyPdf(url) {
  return /\.pdf(?:[?#]|$)/i.test(url);
}

function isLikelyImage(url) {
  return /\.(?:png|jpe?g|webp|avif)(?:[?#]|$)/i.test(url);
}

function isLikelyIcon(url) {
  return /(favicon|icon|logo|apple-touch|sprite|placeholder)/i.test(url);
}

function extensionForImage(url, contentType) {
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("png")) return "png";
  if (contentType.includes("avif")) return "avif";
  if (contentType.includes("jpeg") || contentType.includes("jpg")) return "jpg";
  const ext = path.extname(new URL(url).pathname).replace(".", "").toLowerCase();
  return ext || "jpg";
}

function safeHost(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function safeFileBase(value) {
  return String(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "asset";
}

function cleanText(value) {
  return decodeHtml(String(value)).replace(/\s+/g, " ").trim();
}

function decodeHtml(value) {
  return String(value)
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function firstMatch(value, pattern) {
  const match = pattern.exec(value);
  return match ? cleanText(match[1]) : "";
}

function pad(index) {
  return String(index).padStart(2, "0");
}

function shortHash(value) {
  return crypto.createHash("sha1").update(value).digest("hex").slice(0, 8);
}

function relativeOut(filePath) {
  return path.relative(outRoot, filePath);
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readSourceRepoCommit() {
  try {
    const head = await fs.readFile(path.join(sourceRepo, ".git/HEAD"), "utf8");
    if (head.startsWith("ref:")) {
      const refPath = head.replace("ref:", "").trim();
      return (await fs.readFile(path.join(sourceRepo, ".git", refPath), "utf8")).trim();
    }
    return head.trim();
  } catch {
    return "";
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
