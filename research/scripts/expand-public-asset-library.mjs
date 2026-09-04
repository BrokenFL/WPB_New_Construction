import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const workspace = process.cwd();
const assetRoot = path.join(workspace, "research/asset-library");
const projectsRoot = path.join(assetRoot, "projects");
const manifestPath = path.join(assetRoot, "asset-manifest.json");
const masterPath = path.join(
  workspace,
  "research/source-repos/WestPalmNewConstruction/data/buildings_master.json",
);
const teamCreditsPath = path.join(workspace, "research/generated/project-team-credits.json");

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36 WPBAssetResearch/2.0";

const MIN_IMAGE_BYTES = 45_000;
const MAX_IMAGE_BYTES = 9_000_000;
const MAX_NEW_IMAGES_PER_PROJECT = 12;

const RIGHTS_NOTE =
  "Public-source research asset. Do not publish until rights/owner permission are confirmed for the intended use.";

const ENTITY_DIRECTORY = [
  ["13th Floor Investments", "developer", "https://13fi.com/"],
  ["10 Design", "architect", "https://www.10design.co/"],
  ["Alpha Blue Ventures", "developer", "https://www.alphablueventures.com/"],
  ["Arquitectonica", "architect", "https://arquitectonica.com/"],
  ["Banyan Group", "brand", "https://www.groupbanyan.com/"],
  ["BEKO Equities", "developer", "https://www.bekoequities.com/"],
  ["BGI Capital", "developer", "https://bgicapital.com/"],
  ["BGI Companies", "developer", "https://bgicompanies.com/"],
  ["BH Group", "developer", "https://bhgroupmiami.com/"],
  ["Carlos Ott", "architect", "https://www.carlosott.com/"],
  ["Corcoran Sunshine", "sales", "https://www.corcoransunshine.com/"],
  ["Curated JCZM", "developer", "https://curatedjczm.com/"],
  ["DS Boca", "design", "https://www.dsboca.com/"],
  ["EDSA", "landscape architect", "https://www.edsaplan.com/"],
  ["ENEA Landscape Architecture", "landscape architect", "https://www.enea.ch/"],
  ["Enzo Enea", "landscape architect", "https://www.enea.ch/"],
  ["Fort Partners", "developer", "https://www.fortpartners.com/"],
  ["Gabellini Sheppard", "interior designer", "https://gabellinisheppard.com/"],
  ["Great Gulf", "developer", "https://www.greatgulf.com/"],
  ["Hariri Pontarini Architects", "architect", "https://hariripontarini.com/"],
  ["Hirsch Bedner Associates", "interior designer", "https://www.hba.com/"],
  ["Huizenga Holdings", "developer", "https://huizengaholdings.com/"],
  ["Immocorp Capital", "developer", "https://immocorpcapital.com/"],
  ["Integra Investments", "developer", "https://integrafl.com/"],
  ["Jean-Louis Deniot", "interior designer", "https://www.deniot.com/"],
  ["Kohn Pedersen Fox", "architect", "https://www.kpf.com/"],
  ["Kolter Urban", "developer", "https://kolterurban.com/"],
  ["L&L Holding Company", "developer", "https://ll-holding.com/"],
  ["Lillian Wu Studio", "interior designer", "https://www.lillianwu.com/"],
  ["Mast Capital", "developer", "https://www.mastcapital.com/"],
  ["MAWD", "interior designer", "https://mawd.co/"],
  ["Naturalficial", "landscape architect", "https://www.naturalficial.com/"],
  ["OMA", "architect", "https://www.oma.com/"],
  ["One Sotheby's", "sales", "https://www.onesothebysrealty.com/"],
  ["Pembrooke & Ives", "interior designer", "https://pembrookeandives.com/"],
  ["Perko Development Partners", "developer", "https://perkodevelopment.com/"],
  ["Related Group", "developer", "https://relatedgroup.com/"],
  ["Related Ross", "developer", "https://www.relatedross.com/"],
  ["Related Sales", "sales", "https://www.relatedsales.com/"],
  ["Revuelta", "architect", "https://revuelta.com/"],
  ["Robert A.M. Stern Architects", "architect", "https://www.ramsa.com/"],
  ["Rockwell Group", "interior designer", "https://www.rockwellgroup.com/"],
  ["Roger Ferris + Partners", "architect", "https://rogerferris.com/"],
  ["Rottet Studio", "interior designer", "https://rottetstudio.com/"],
  ["Safdie Architects", "architect", "https://www.safdiearchitects.com/"],
  ["Savanna", "developer", "https://savannafund.com/"],
  ["Schmidt Nichols", "landscape architect", "https://schmidtnichols.com/"],
  ["Spina O'Rourke + Partners", "architect", "https://www.soprealtors.com/"],
  ["Stantec", "architect", "https://www.stantec.com/"],
  ["Studio Munge", "interior designer", "https://www.studiomunge.com/"],
  ["Swedroe Architecture", "architect", "https://www.swedroe.com/"],
  ["Terra", "developer", "https://www.terragroup.com/"],
  ["The Ronto Group", "developer", "https://www.rontogroup.com/"],
  ["Two Roads Development", "developer", "https://www.tworoadsre.com/"],
  ["Wexford Real Estate Investors", "developer", "https://www.wexfordrei.com/"],
  ["Yabu Pushelberg", "interior designer", "https://yabupushelberg.com/"],
].map(([name, role, website]) => ({ name, role, website, key: normalizeEntity(name) }));

async function main() {
  const [manifest, master, teamCredits] = await Promise.all([
    readJson(manifestPath),
    readJson(masterPath),
    readJson(teamCreditsPath),
  ]);

  const masterById = new Map(master.buildings.map((project) => [project.project_id, project]));
  const creditById = new Map(teamCredits.projects.map((project) => [project.projectId, project]));
  const results = [];

  for (const project of manifest.projects) {
    const projectDir = path.join(projectsRoot, project.projectId);
    await fs.mkdir(path.join(projectDir, "images/public-research"), { recursive: true });
    await fs.mkdir(path.join(projectDir, "logos"), { recursive: true });
    await fs.mkdir(path.join(projectDir, "team-logos"), { recursive: true });

    const masterRecord = masterById.get(project.projectId) ?? {};
    const creditRecord = creditById.get(project.projectId) ?? {};
    const index = await buildStartingIndex(projectDir, project);
    const existingUrls = new Set(index.map((asset) => asset.assetUrl).filter(Boolean));

    const publicImages = await collectProjectImages(project, projectDir, existingUrls);
    const projectLogo = await collectProjectLogo(project, projectDir, existingUrls);
    const teamLogos = await collectTeamLogos(project, projectDir, masterRecord, creditRecord, existingUrls);

    const merged = mergeAssets(index, [...publicImages, ...projectLogo, ...teamLogos]);
    await writeProjectIndexes(projectDir, project, merged);

    results.push({
      projectId: project.projectId,
      name: project.name,
      assetsIndexed: merged.length,
      publicImagesAdded: publicImages.length,
      projectLogosAdded: projectLogo.length,
      teamLogosAdded: teamLogos.length,
    });
  }

  const report = {
    generatedAt: new Date().toISOString(),
    usageNote: RIGHTS_NOTE,
    projects: results,
  };
  await fs.writeFile(
    path.join(assetRoot, "asset-expansion-report.json"),
    `${JSON.stringify(report, null, 2)}\n`,
  );
  await fs.writeFile(path.join(assetRoot, "asset-expansion-report.md"), renderReport(report));
  console.log(JSON.stringify(report, null, 2));
}

async function collectProjectImages(project, projectDir, existingUrls) {
  const rows = [];
  const pageUrls = unique([project.officialWebsite, ...(project.sourceUrls ?? [])]).filter(Boolean);
  const candidates = [];

  for (const sourcePage of pageUrls.slice(0, 8)) {
    if (isLikelyImage(sourcePage)) {
      candidates.push({
        url: sourcePage,
        label: "Source image",
        sourcePage,
        section: inferSection(sourcePage, "Source image"),
      });
      continue;
    }

    const page = await fetchText(sourcePage);
    if (!page.ok) continue;
    for (const image of extractImageCandidates(sourcePage, page.body)) {
      if (isProjectImageCandidate(image.url)) candidates.push(image);
    }
  }

  let count = 0;
  for (const candidate of rankCandidates(uniqueByUrl(candidates))) {
    if (count >= MAX_NEW_IMAGES_PER_PROJECT) break;
    if (existingUrls.has(candidate.url)) continue;
    const downloaded = await downloadBinary(candidate.url, {
      minBytes: MIN_IMAGE_BYTES,
      maxBytes: MAX_IMAGE_BYTES,
      allowSvg: false,
    });
    if (!downloaded.ok) continue;
    const section = candidate.section || inferSection(candidate.url, candidate.label);
    const ext = extensionFor(candidate.url, downloaded.contentType);
    const filename = `image-${pad(count + 1)}--${safeFileBase(section)}--${safeHost(candidate.url)}--${shortHash(candidate.url)}.${ext}`;
    const localPath = path.join(projectDir, "images/public-research", filename);
    await fs.writeFile(localPath, downloaded.body);
    count += 1;
    existingUrls.add(candidate.url);
    rows.push(assetRow(project, localPath, {
      kind: "image",
      role: "project imagery",
      entity: project.name,
      section,
      recommendedUse: recommendedUse(section),
      sourcePage: candidate.sourcePage,
      assetUrl: candidate.url,
      contentType: downloaded.contentType,
      bytes: downloaded.bytes,
      label: candidate.label,
      rightsStatus: "rights review required",
    }));
  }
  return rows;
}

async function collectProjectLogo(project, projectDir, existingUrls) {
  if (!project.officialWebsite) return [];
  const page = await fetchText(project.officialWebsite);
  if (!page.ok) return [];
  const logo = chooseLogoCandidate(project.officialWebsite, page.body, project.name);
  if (!logo || existingUrls.has(logo.url)) return [];
  const downloaded = await downloadBinary(logo.url, {
    minBytes: logo.url.endsWith(".ico") ? 200 : 500,
    maxBytes: 2_500_000,
    allowSvg: true,
  });
  if (!downloaded.ok) return [];
  const ext = extensionFor(logo.url, downloaded.contentType);
  const filename = `project-logo--${safeFileBase(project.projectId)}--${shortHash(logo.url)}.${ext}`;
  const localPath = path.join(projectDir, "logos", filename);
  await fs.writeFile(localPath, downloaded.body);
  existingUrls.add(logo.url);
  return [
    assetRow(project, localPath, {
      kind: "logo",
      role: "project logo",
      entity: project.name,
      section: "brand identity",
      recommendedUse: "project header, design reference, attribution block",
      sourcePage: project.officialWebsite,
      assetUrl: logo.url,
      contentType: downloaded.contentType,
      bytes: downloaded.bytes,
      label: logo.label,
      rightsStatus: "rights review required",
    }),
  ];
}

async function collectTeamLogos(project, projectDir, masterRecord, creditRecord, existingUrls) {
  const entities = matchProjectEntities(masterRecord, creditRecord);
  const rows = [];

  for (const entity of entities) {
    const page = await fetchText(entity.website);
    if (!page.ok) continue;
    const logo = chooseLogoCandidate(entity.website, page.body, entity.name);
    if (!logo || existingUrls.has(logo.url)) continue;
    const downloaded = await downloadBinary(logo.url, {
      minBytes: logo.url.endsWith(".ico") ? 200 : 500,
      maxBytes: 2_500_000,
      allowSvg: true,
    });
    if (!downloaded.ok) continue;
    const ext = extensionFor(logo.url, downloaded.contentType);
    const filename = `${safeFileBase(entity.role)}--${safeFileBase(entity.name)}--logo--${shortHash(logo.url)}.${ext}`;
    const localPath = path.join(projectDir, "team-logos", filename);
    await fs.writeFile(localPath, downloaded.body);
    existingUrls.add(logo.url);
    rows.push(
      assetRow(project, localPath, {
        kind: "logo",
        role: entity.role,
        entity: entity.name,
        section: "project team",
        recommendedUse: "team/design credit reference",
        sourcePage: entity.website,
        assetUrl: logo.url,
        contentType: downloaded.contentType,
        bytes: downloaded.bytes,
        label: logo.label,
        rightsStatus: "rights review required",
      }),
    );
  }

  return rows;
}

function matchProjectEntities(masterRecord, creditRecord) {
  const text = [
    masterRecord.developer,
    masterRecord.architect,
    masterRecord.interior_designer,
    masterRecord.landscape_architect,
    masterRecord.sales_team,
    creditRecord.teamCredit,
  ]
    .filter(Boolean)
    .join("; ");
  const normalized = normalizeEntity(text);
  const matches = [];
  const seen = new Set();
  for (const entity of ENTITY_DIRECTORY) {
    if (normalized.includes(entity.key) && !seen.has(entity.key)) {
      seen.add(entity.key);
      matches.push(entity);
    }
  }
  return matches;
}

async function buildStartingIndex(projectDir, project) {
  const rows = [];

  for (const asset of project.downloadedAssets ?? []) {
    if (asset.status !== "downloaded" || !asset.path) continue;
    const localPath = path.join(assetRoot, asset.path);
    rows.push(
      assetRow(project, localPath, {
        kind: asset.kind,
        role: asset.kind === "pdf" ? asset.type ?? "document" : "project imagery",
        entity: project.name,
        section: asset.kind === "pdf" ? inferDocumentSection(asset.type, asset.label) : inferSection(asset.url, asset.label),
        recommendedUse:
          asset.kind === "pdf"
            ? "floorplan/document reference"
            : recommendedUse(inferSection(asset.url, asset.label)),
        sourcePage: asset.sourcePage ?? "",
        assetUrl: asset.url,
        contentType: asset.contentType ?? (asset.kind === "pdf" ? "application/pdf" : ""),
        bytes: asset.bytes ?? "",
        label: asset.label ?? "",
        rightsStatus: "rights review required",
      }),
    );
  }

  const publicMediaDir = path.join(workspace, "public/projects", project.projectId, "media");
  for (const file of await listFiles(publicMediaDir)) {
    if (!isLikelyImage(file) && !file.endsWith(".svg")) continue;
    rows.push(
      assetRow(project, file, {
        kind: file.endsWith(".svg") ? "logo/vector" : "published media",
        role: file.includes("logo") ? "project logo" : "site media",
        entity: project.name,
        section: inferSection(file, path.basename(file)),
        recommendedUse: "currently available in site media folder",
        sourcePage: "",
        assetUrl: "",
        contentType: contentTypeFromPath(file),
        bytes: await fileSize(file),
        label: path.basename(file),
        rightsStatus: "site asset, verify source rights before new use",
      }),
    );
  }

  return rows;
}

async function writeProjectIndexes(projectDir, project, rows) {
  const sorted = rows.sort((a, b) =>
    `${a.kind}|${a.section}|${a.filename}`.localeCompare(`${b.kind}|${b.section}|${b.filename}`),
  );
  await fs.writeFile(path.join(projectDir, "asset-index.json"), `${JSON.stringify(sorted, null, 2)}\n`);
  await fs.writeFile(path.join(projectDir, "asset-index.csv"), toCsv(sorted));
  await fs.writeFile(path.join(projectDir, "asset-index.md"), renderProjectIndex(project, sorted));
}

function assetRow(project, localPath, details) {
  return {
    projectId: project.projectId,
    projectName: project.name,
    kind: details.kind,
    role: details.role,
    entity: details.entity,
    section: details.section,
    recommendedUse: details.recommendedUse,
    filename: path.basename(localPath),
    localPath: path.relative(assetRoot, localPath),
    sourcePage: details.sourcePage ?? "",
    assetUrl: details.assetUrl ?? "",
    label: details.label ?? "",
    contentType: details.contentType ?? "",
    bytes: details.bytes ?? "",
    rightsStatus: details.rightsStatus,
    rightsNote: RIGHTS_NOTE,
    collectedAt: new Date().toISOString(),
  };
}

function extractImageCandidates(baseUrl, html) {
  const candidates = [];
  const tagPattern = /<(img|source|a|meta|link)\b[^>]*>/gi;
  let match;
  while ((match = tagPattern.exec(html))) {
    const tag = match[0];
    const attrs = parseAttrs(tag);
    const label = cleanText([attrs.alt, attrs.title, attrs.ariaLabel, attrs.class, attrs.id, attrs.rel].filter(Boolean).join(" "));
    const rawUrls = [
      attrs.src,
      attrs.href,
      attrs.content,
      ...parseSrcset(attrs.srcset),
      ...parseSrcset(attrs.imagesrcset),
    ];
    for (const raw of rawUrls) {
      const url = normalizeUrl(decodeHtml(raw), baseUrl);
      if (!url || !isLikelyImage(url)) continue;
      candidates.push({
        url,
        label: label || inferLabel(url),
        sourcePage: baseUrl,
        section: inferSection(url, label),
      });
    }
  }

  const urlPattern = /url\((["']?)([^"')]+)\1\)/gi;
  while ((match = urlPattern.exec(html))) {
    const url = normalizeUrl(decodeHtml(match[2]), baseUrl);
    if (url && isLikelyImage(url)) {
      candidates.push({ url, label: "CSS background image", sourcePage: baseUrl, section: inferSection(url, "") });
    }
  }

  const absolutePattern = /https?:\/\/[^"'\s<>\\)]+?\.(?:jpg|jpeg|png|webp|avif|svg|ico)(?:\?[^"'\s<>\\)]*)?/gi;
  while ((match = absolutePattern.exec(html))) {
    const url = normalizeUrl(match[0], baseUrl);
    if (url && isLikelyImage(url)) {
      candidates.push({ url, label: inferLabel(url), sourcePage: baseUrl, section: inferSection(url, "") });
    }
  }

  return uniqueByUrl(candidates);
}

function chooseLogoCandidate(baseUrl, html, entityName) {
  const candidates = extractImageCandidates(baseUrl, html).filter((candidate) => {
    const text = `${candidate.url} ${candidate.label}`.toLowerCase();
    return /logo|brand|identity|mark|site-logo|navbar|header/.test(text) || /\.(svg|ico)(?:\?|$)/i.test(candidate.url);
  });
  const iconLinks = [];
  const linkPattern = /<link\b[^>]*>/gi;
  let match;
  while ((match = linkPattern.exec(html))) {
    const attrs = parseAttrs(match[0]);
    const rel = (attrs.rel ?? "").toLowerCase();
    if (!/(icon|apple-touch-icon|mask-icon)/.test(rel)) continue;
    const url = normalizeUrl(decodeHtml(attrs.href), baseUrl);
    if (url) iconLinks.push({ url, label: rel, sourcePage: baseUrl, section: "brand identity" });
  }
  candidates.push(...iconLinks);
  candidates.push({ url: normalizeUrl("/favicon.ico", baseUrl), label: `${entityName} favicon`, sourcePage: baseUrl, section: "brand identity" });

  return uniqueByUrl(candidates)
    .map((candidate) => ({ ...candidate, score: logoScore(candidate, entityName) }))
    .sort((a, b) => b.score - a.score)[0];
}

function logoScore(candidate, entityName) {
  const text = `${candidate.url} ${candidate.label}`.toLowerCase();
  let score = 0;
  if (text.includes("logo")) score += 50;
  if (text.includes("brand")) score += 25;
  if (text.includes("header") || text.includes("navbar")) score += 15;
  if (text.includes("favicon") || text.includes("icon")) score -= 10;
  if (candidate.url.endsWith(".svg")) score += 15;
  if (candidate.url.includes(normalizeEntity(entityName))) score += 8;
  return score;
}

function rankCandidates(candidates) {
  return candidates
    .filter((candidate) => !isLikelyIcon(candidate.url))
    .map((candidate) => ({ ...candidate, score: imageScore(candidate) }))
    .sort((a, b) => b.score - a.score);
}

function imageScore(candidate) {
  const text = `${candidate.url} ${candidate.label} ${candidate.section}`.toLowerCase();
  let score = 0;
  if (/hero|exterior|render|rendering|aerial|view|waterfront|skyline/.test(text)) score += 30;
  if (/residence|interior|living|kitchen|bath|bedroom|terrace/.test(text)) score += 22;
  if (/amenity|pool|lobby|spa|fitness|wellness|dining|club/.test(text)) score += 18;
  if (/gallery|uploads|media|wp-content|cloudfront|squarespace/.test(text)) score += 8;
  if (/logo|icon|favicon|map|floor|plan|broker|agent|portrait|headshot/.test(text)) score -= 40;
  return score;
}

async function fetchText(url) {
  const response = await fetchBinary(url, { accept: "text/html,application/xhtml+xml,*/*;q=0.8" });
  if (!response.ok) return response;
  const text = response.body.toString("utf8");
  return { ...response, body: text };
}

async function downloadBinary(url, options) {
  const response = await fetchBinary(url, {
    accept: "image/avif,image/webp,image/png,image/jpeg,image/svg+xml,image/x-icon,*/*;q=0.8",
  });
  if (!response.ok) return response;
  const contentType = response.contentType.toLowerCase();
  const looksSvg = contentType.includes("svg") || /\.svg(?:\?|$)/i.test(url);
  if (looksSvg && !options.allowSvg) return { ok: false, url, error: "svg skipped" };
  if (!contentType.startsWith("image/") && !looksSvg && !isLikelyImage(url)) {
    return { ok: false, url, error: `not image: ${contentType}` };
  }
  if (response.bytes < options.minBytes) return { ok: false, url, error: "small", bytes: response.bytes };
  if (response.bytes > options.maxBytes) return { ok: false, url, error: "large", bytes: response.bytes };
  return response;
}

async function fetchBinary(url, { accept }) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 18_000);
    const res = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": USER_AGENT,
        accept,
      },
    });
    clearTimeout(timeout);
    const body = Buffer.from(await res.arrayBuffer());
    return {
      ok: res.ok,
      status: res.status,
      statusText: res.statusText,
      url: res.url,
      contentType: res.headers.get("content-type") ?? "",
      bytes: body.length,
      body,
    };
  } catch (error) {
    return { ok: false, status: 0, error: error.message, contentType: "", bytes: 0, body: Buffer.alloc(0) };
  }
}

function parseAttrs(tag) {
  const attrs = {};
  const attrPattern = /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
  let match;
  while ((match = attrPattern.exec(tag))) {
    attrs[toCamel(match[1])] = match[2] ?? match[3] ?? match[4] ?? "";
  }
  return attrs;
}

function parseSrcset(value) {
  if (!value) return [];
  return value
    .split(",")
    .map((entry) => entry.trim().split(/\s+/)[0])
    .filter(Boolean);
}

function inferSection(url, label = "") {
  const text = `${url} ${label}`.toLowerCase();
  if (/logo|brand|mark/.test(text)) return "brand identity";
  if (/hero|exterior|facade|building|tower|render|rendering/.test(text)) return "hero/exterior";
  if (/aerial|waterfront|skyline|view|intracoastal|ocean|balcony/.test(text)) return "views/context";
  if (/lobby|arrival|porte|valet|entrance/.test(text)) return "arrival/lobby";
  if (/pool|spa|fitness|wellness|amenity|club|dining|restaurant|bar|cabana/.test(text)) return "amenities";
  if (/kitchen|living|bath|bedroom|residence|interior|terrace/.test(text)) return "residences/interiors";
  if (/floor|plan|res[ -]?\d/.test(text)) return "floorplans";
  if (/portrait|team|partner|architect|designer/.test(text)) return "project team";
  return "general reference";
}

function inferDocumentSection(type = "", label = "") {
  const text = `${type} ${label}`.toLowerCase();
  if (text.includes("floor")) return "floorplans";
  if (text.includes("brochure")) return "brochure";
  if (text.includes("fact")) return "fact sheet";
  return "documents";
}

function recommendedUse(section) {
  if (section === "hero/exterior") return "hero candidate, project card, exterior gallery";
  if (section === "views/context") return "location/context, view story";
  if (section === "arrival/lobby") return "arrival/lobby section";
  if (section === "amenities") return "amenity section";
  if (section === "residences/interiors") return "residence/interior section";
  if (section === "brand identity") return "logo/brand reference";
  if (section === "project team") return "team/design credit reference";
  return "designer reference";
}

function isProjectImageCandidate(url) {
  if (!isLikelyImage(url)) return false;
  return !/(favicon|apple-touch|sprite|icon|logo-only|blank|pixel|tracking|avatar)/i.test(url);
}

function isLikelyImage(url) {
  return /\.(?:jpg|jpeg|png|webp|avif|svg|ico)(?:\?[^#]*)?(?:#.*)?$/i.test(url);
}

function isLikelyIcon(url) {
  return /(favicon|apple-touch|icon-|\/icons?\/|sprite|logo-symbol|loader|blank|pixel)/i.test(url);
}

function normalizeUrl(raw, baseUrl) {
  if (!raw || raw.startsWith("data:") || raw.startsWith("mailto:") || raw.startsWith("tel:")) return "";
  try {
    const url = new URL(raw, baseUrl);
    url.hash = "";
    return url.href;
  } catch {
    return "";
  }
}

function extensionFor(url, contentType = "") {
  const cleanPath = new URL(url).pathname.toLowerCase();
  const ext = path.extname(cleanPath).replace(".", "");
  if (["jpg", "jpeg", "png", "webp", "avif", "svg", "ico"].includes(ext)) return ext === "jpeg" ? "jpg" : ext;
  if (contentType.includes("svg")) return "svg";
  if (contentType.includes("png")) return "png";
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("avif")) return "avif";
  if (contentType.includes("icon")) return "ico";
  return "jpg";
}

function contentTypeFromPath(file) {
  const ext = path.extname(file).toLowerCase();
  if (ext === ".svg") return "image/svg+xml";
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".pdf") return "application/pdf";
  return "";
}

async function listFiles(dir) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) files.push(...(await listFiles(fullPath)));
      if (entry.isFile()) files.push(fullPath);
    }
    return files;
  } catch {
    return [];
  }
}

async function fileSize(file) {
  try {
    return (await fs.stat(file)).size;
  } catch {
    return "";
  }
}

function mergeAssets(existing, additions) {
  const seen = new Set();
  const merged = [];
  for (const asset of [...existing, ...additions]) {
    const key = asset.assetUrl || asset.localPath;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(asset);
  }
  return merged;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function uniqueByUrl(items) {
  const seen = new Set();
  const out = [];
  for (const item of items) {
    if (!item.url || seen.has(item.url)) continue;
    seen.add(item.url);
    out.push(item);
  }
  return out;
}

function shortHash(value) {
  return crypto.createHash("sha1").update(value).digest("hex").slice(0, 8);
}

function safeHost(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "source";
  }
}

function safeFileBase(value) {
  return String(value ?? "asset")
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase()
    .slice(0, 72) || "asset";
}

function normalizeEntity(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function inferLabel(url) {
  try {
    return decodeURIComponent(path.basename(new URL(url).pathname)).replace(/[-_]+/g, " ");
  } catch {
    return "";
  }
}

function cleanText(text) {
  return decodeHtml(String(text ?? ""))
    .replace(/\s+/g, " ")
    .trim();
}

function decodeHtml(text) {
  return String(text ?? "")
    .replace(/&amp;/g, "&")
    .replace(/&#038;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function toCamel(value) {
  return value.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function toCsv(rows) {
  const headers = [
    "projectId",
    "projectName",
    "kind",
    "role",
    "entity",
    "section",
    "recommendedUse",
    "filename",
    "localPath",
    "sourcePage",
    "assetUrl",
    "label",
    "contentType",
    "bytes",
    "rightsStatus",
    "rightsNote",
    "collectedAt",
  ];
  return `${headers.map(csvCell).join(",")}\n${rows
    .map((row) => headers.map((header) => csvCell(row[header])).join(","))
    .join("\n")}\n`;
}

function csvCell(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function renderProjectIndex(project, rows) {
  const lines = [
    `# ${project.name} Asset Index`,
    "",
    RIGHTS_NOTE,
    "",
    "| Kind | Section | Entity | Recommended use | File | Source |",
    "|---|---|---|---|---|---|",
  ];
  for (const row of rows) {
    lines.push(
      `| ${row.kind} | ${row.section} | ${row.entity} | ${row.recommendedUse} | ${row.localPath} | ${row.assetUrl || row.sourcePage || ""} |`,
    );
  }
  return `${lines.join("\n")}\n`;
}

function renderReport(report) {
  const lines = [
    "# WPB Asset Expansion Report",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    report.usageNote,
    "",
    "| Project | Assets indexed | Public images added | Project logos added | Team logos added |",
    "|---|---:|---:|---:|---:|",
  ];
  for (const project of report.projects) {
    lines.push(
      `| ${project.name} | ${project.assetsIndexed} | ${project.publicImagesAdded} | ${project.projectLogosAdded} | ${project.teamLogosAdded} |`,
    );
  }
  return `${lines.join("\n")}\n`;
}

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, "utf8"));
}

await main();
