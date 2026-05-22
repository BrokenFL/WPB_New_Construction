import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const registryPath = path.join(root, "research/config/project-image-sources.json");
const metadataPath = path.join(root, "research/imported-project-images/importedProjectImages.json");
const maxPerProject = Number(process.env.WPB_IMAGE_IMPORT_MAX_PER_PROJECT ?? 4);
const userAgent = "WPBNewConstructionImageReview/1.0 (+https://www.wpbnewconstruction.com/)";

const rejectPattern = /logo|icon|favicon|sprite|placeholder|transparent|tracking|pixel|avatar|seal|badge|social|facebook|instagram|linkedin|youtube|twitter|x\.com|floor.?plan|map|marker/i;
const priorityHints = /interior|residence|kitchen|living|bedroom|bath|amenity|pool|spa|lobby|lounge|club|render|terrace|penthouse|dining|wellness|arrival/i;

function readJson(file, fallback) {
  if (!existsSync(file)) return fallback;
  return JSON.parse(readFileSync(file, "utf8"));
}

function writeJson(file, value) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function normalizeDomain(hostname) {
  return hostname.toLowerCase().replace(/^www\./, "");
}

function sameAllowedDomain(url, allowedDomains) {
  try {
    const host = normalizeDomain(new URL(url).hostname);
    return allowedDomains.some((domain) => host === normalizeDomain(domain) || host.endsWith(`.${normalizeDomain(domain)}`));
  } catch {
    return false;
  }
}

async function politeFetch(url, init = {}) {
  await new Promise((resolve) => setTimeout(resolve, 900));
  return fetch(url, {
    ...init,
    headers: {
      "user-agent": userAgent,
      accept: init.accept ?? "text/html,application/xhtml+xml,image/avif,image/webp,image/png,image/jpeg,*/*;q=0.8",
      ...(init.headers ?? {}),
    },
  });
}

async function robotsAllows(seedUrl, allowedDomains) {
  try {
    if (!sameAllowedDomain(seedUrl, allowedDomains)) return false;
    const url = new URL(seedUrl);
    const robotsUrl = `${url.origin}/robots.txt`;
    const response = await politeFetch(robotsUrl, { headers: { accept: "text/plain,*/*;q=0.8" } });
    if (!response.ok) return true;
    const text = await response.text();
    const blocks = text.split(/\n(?=User-agent:)/i);
    const relevant = blocks.filter((block) => /User-agent:\s*\*/i.test(block) || /User-agent:\s*WPBNewConstructionImageReview/i.test(block));
    const pathName = url.pathname || "/";
    return !relevant.some((block) =>
      block
        .split(/\n/)
        .map((line) => line.trim())
        .filter((line) => /^Disallow:/i.test(line))
        .map((line) => line.replace(/^Disallow:\s*/i, "").trim())
        .filter(Boolean)
        .some((rule) => rule !== "/" && pathName.startsWith(rule)),
    );
  } catch {
    return true;
  }
}

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function srcsetUrls(value) {
  return value
    .split(",")
    .map((part) => part.trim().split(/\s+/)[0])
    .filter(Boolean);
}

function normalizeImageUrl(rawUrl, pageUrl) {
  const clean = decodeHtml(rawUrl).trim();
  if (!clean || clean.startsWith("data:") || clean.startsWith("blob:")) return "";
  try {
    return new URL(clean, pageUrl).href.split("#")[0];
  } catch {
    return "";
  }
}

function collectImageCandidates(html, pageUrl) {
  const candidates = new Map();
  const add = (url, source) => {
    const normalized = normalizeImageUrl(url, pageUrl);
    if (!normalized || rejectPattern.test(normalized)) return;
    candidates.set(normalized, { sourceImageUrl: normalized, source });
  };

  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = match[0];
    for (const attr of ["src", "data-src", "data-lazy-src", "data-original"]) {
      const value = tag.match(new RegExp(`${attr}=["']([^"']+)["']`, "i"))?.[1];
      if (value) add(value, attr);
    }
    for (const attr of ["srcset", "data-srcset"]) {
      const value = tag.match(new RegExp(`${attr}=["']([^"']+)["']`, "i"))?.[1];
      if (value) srcsetUrls(value).forEach((url) => add(url, attr));
    }
  }

  for (const match of html.matchAll(/background(?:-image)?:\s*url\((["']?)([^"')]+)\1\)/gi)) {
    add(match[2], "css-background");
  }

  for (const match of html.matchAll(/<meta\b[^>]*(?:property|name)=["']og:image(?::secure_url)?["'][^>]*content=["']([^"']+)["'][^>]*>/gi)) {
    add(match[1], "open-graph");
  }

  for (const match of html.matchAll(/"image"\s*:\s*(?:"([^"]+)"|\[([^\]]+)\])/gi)) {
    if (match[1]) add(match[1], "json-ld");
    if (match[2]) {
      for (const urlMatch of match[2].matchAll(/"([^"]+)"/g)) add(urlMatch[1], "json-ld");
    }
  }

  return [...candidates.values()].sort((a, b) => scoreCandidate(b.sourceImageUrl) - scoreCandidate(a.sourceImageUrl));
}

function scoreCandidate(url) {
  let score = 0;
  if (priorityHints.test(url)) score += 20;
  if (/\.(jpe?g|png|webp)(\?|$)/i.test(url)) score += 8;
  if (/og|share|thumbnail/i.test(url)) score -= 12;
  return score;
}

function imageTypeForUrl(url) {
  const value = url.toLowerCase();
  if (/floor.?plan/.test(value)) return "floorplan";
  if (/logo|mark/.test(value)) return "logo";
  if (/interior|residence|kitchen|living|bedroom|bath|dining|penthouse/.test(value)) return "interior";
  if (/amenity|pool|spa|lobby|lounge|club|wellness|fitness/.test(value)) return "amenity";
  if (/render|rendering|cgi/.test(value)) return "rendering";
  if (/exterior|facade|aerial|tower|building/.test(value)) return "exterior";
  return "unknown";
}

function extensionFromContentType(contentType, url) {
  if (/webp/i.test(contentType)) return "webp";
  if (/png/i.test(contentType)) return "png";
  if (/jpe?g/i.test(contentType)) return "jpg";
  const ext = path.extname(new URL(url).pathname).replace(/^\./, "").toLowerCase();
  return ["jpg", "jpeg", "png", "webp"].includes(ext) ? (ext === "jpeg" ? "jpg" : ext) : "jpg";
}

function imageDimensions(buffer) {
  if (buffer[0] === 0x89 && buffer.toString("ascii", 1, 4) === "PNG") {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }
  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset < buffer.length) {
      if (buffer[offset] !== 0xff) break;
      const marker = buffer[offset + 1];
      const length = buffer.readUInt16BE(offset + 2);
      if (marker >= 0xc0 && marker <= 0xc3) {
        return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
      }
      offset += 2 + length;
    }
  }
  return { width: 0, height: 0 };
}

function optimizeImage(inputPath, outputPath, ext) {
  const args = ext === "webp"
    ? ["-Z", "1800", inputPath, "--out", outputPath]
    : ["-Z", "1800", "-s", "format", "jpeg", "-s", "formatOptions", "82", inputPath, "--out", outputPath];
  const sips = spawnSync("sips", args, { stdio: "ignore" });
  if (sips.status === 0) return true;
  renameSync(inputPath, outputPath);
  return ext !== "jpg";
}

async function importImage(project, candidate, index, capturedAt) {
  const response = await politeFetch(candidate.sourceImageUrl, { headers: { accept: "image/avif,image/webp,image/png,image/jpeg,*/*;q=0.8" } });
  if (!response.ok) return { skipped: true, reason: `HTTP ${response.status}` };
  const contentType = response.headers.get("content-type") ?? "";
  if (!/image\/(jpeg|jpg|png|webp)/i.test(contentType)) return { skipped: true, reason: `Not an image: ${contentType}` };
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  if (buffer.length < 40_000) return { skipped: true, reason: "Too small" };
  const dimensions = imageDimensions(buffer);
  if ((dimensions.width && dimensions.width < 900) || (dimensions.height && dimensions.height < 600)) {
    return { skipped: true, reason: `Small dimensions ${dimensions.width}x${dimensions.height}` };
  }

  const imageType = imageTypeForUrl(candidate.sourceImageUrl);
  if (imageType === "logo" || imageType === "floorplan") return { skipped: true, reason: `Skipped ${imageType}` };
  const ext = extensionFromContentType(contentType, candidate.sourceImageUrl);
  const projectDir = path.join(root, "public/projects", project.projectId, "media/imported");
  mkdirSync(projectDir, { recursive: true });
  const stamp = capturedAt.slice(0, 10);
  const id = `${project.projectId}-${imageType}-${stamp}-${String(index).padStart(3, "0")}`;
  const localPath = `public/projects/${project.projectId}/media/imported/${imageType}-${stamp}-${String(index).padStart(3, "0")}.${ext === "webp" ? "webp" : "jpg"}`;
  const outputPath = path.join(root, localPath);
  const tempPath = path.join(tmpdir(), `${id}-${createHash("sha1").update(candidate.sourceImageUrl).digest("hex").slice(0, 8)}.${ext}`);
  writeFileSync(tempPath, buffer);
  optimizeImage(tempPath, outputPath, ext);
  return {
    id,
    projectId: project.projectId,
    sourcePageUrl: candidate.sourcePageUrl,
    sourceImageUrl: candidate.sourceImageUrl,
    localPath,
    capturedAt,
    imageType,
    status: "candidate",
    width: dimensions.width,
    height: dimensions.height,
    caption:
      imageType === "interior"
        ? "Interior rendering"
        : imageType === "amenity"
          ? "Amenity image"
          : imageType === "exterior"
            ? "Project rendering"
            : "Developer image",
    alt: `${imageType === "interior" ? "Interior" : imageType === "amenity" ? "Amenity" : "Project"} image for ${project.projectName} in West Palm Beach.`,
    placement: "gallery",
    credit: "Image via developer/project marketing materials",
    notes: `Imported from ${candidate.source}; ready for placement analysis.`,
  };
}

async function run() {
  const registry = readJson(registryPath, { projects: [] });
  const existing = readJson(metadataPath, []);
  const existingUrls = new Set(existing.map((item) => item.sourceImageUrl));
  const existingPaths = new Set(existing.map((item) => item.localPath));
  const capturedAt = new Date().toISOString();
  const imported = [];
  const skipped = [];

  for (const project of registry.projects) {
    let projectImported = 0;
    for (const seed of project.crawlSeeds ?? []) {
      if (projectImported >= maxPerProject) break;
      if (!sameAllowedDomain(seed, project.allowedSourceDomains ?? [])) {
        skipped.push({ projectId: project.projectId, seed, reason: "Seed outside allowed domains" });
        continue;
      }
      if (!(await robotsAllows(seed, project.allowedSourceDomains ?? []))) {
        skipped.push({ projectId: project.projectId, seed, reason: "robots.txt disallowed" });
        continue;
      }
      try {
        const response = await politeFetch(seed);
        if (!response.ok) {
          skipped.push({ projectId: project.projectId, seed, reason: `HTTP ${response.status}` });
          continue;
        }
        const html = await response.text();
        const candidates = collectImageCandidates(html, seed)
          .filter((candidate) => sameAllowedDomain(candidate.sourceImageUrl, project.allowedSourceDomains ?? []))
          .filter((candidate) => !existingUrls.has(candidate.sourceImageUrl))
          .map((candidate) => ({ ...candidate, sourcePageUrl: seed }));

        for (const candidate of candidates) {
          if (projectImported >= maxPerProject) break;
          const record = await importImage(project, candidate, existing.length + imported.length + 1, capturedAt);
          if (record.skipped) {
            skipped.push({ projectId: project.projectId, seed, image: candidate.sourceImageUrl, reason: record.reason });
            continue;
          }
          if (existingPaths.has(record.localPath)) continue;
          existingUrls.add(record.sourceImageUrl);
          existingPaths.add(record.localPath);
          imported.push(record);
          projectImported += 1;
        }
      } catch (error) {
        skipped.push({ projectId: project.projectId, seed, reason: error.message });
      }
    }
  }

  const records = [...existing, ...imported];
  writeJson(metadataPath, records);
  console.log(JSON.stringify({ developerImageImport: "complete", imported: imported.length, totalRecords: records.length, skipped: skipped.length }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
