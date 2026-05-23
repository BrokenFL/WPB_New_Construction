import fs from "node:fs/promises";
import path from "node:path";

export const workspace = process.cwd();
export const newsDraftsPath = path.join(workspace, "content/news-drafts.json");
export const newsletterDraftsPath = path.join(workspace, "content/newsletter-digest-drafts.json");
export const newsAutomationConfigPath = path.join(workspace, "content/news-automation-config.json");
export const approvedNewsPath = path.join(workspace, "research/news-review/approved-development-news.json");

export const validStatuses = new Set(["draft", "queued", "scheduled", "published", "blocked", "needs_review", "archived"]);
export const riskLevels = new Set(["low", "medium", "high"]);
export const highRiskTerms = [
  "pricing",
  "price",
  "availability",
  "available",
  "legal",
  "approval",
  "approved",
  "completion",
  "delivery",
  "delay",
  "delayed",
  "dispute",
  "lawsuit",
  "financing",
  "loan",
  "mortgage",
];

export async function readJsonFile(filePath, fallback) {
  const raw = await fs.readFile(filePath, "utf8").catch(() => "");
  if (!raw.trim()) return structuredClone(fallback);
  return JSON.parse(raw);
}

export async function writeJsonFile(filePath, payload) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`);
}

export async function readDraftStore() {
  return readJsonFile(newsDraftsPath, { version: 1, updatedAt: "", items: [] });
}

export async function writeDraftStore(store) {
  store.version = 1;
  store.updatedAt = new Date().toISOString();
  await writeJsonFile(newsDraftsPath, store);
}

export async function readAutomationConfig() {
  return readJsonFile(newsAutomationConfigPath, {
    autoPublishEnabled: true,
    autoPublishDelayHours: 6,
    maxAutoPublishedPerDay: 3,
    highRiskRequiresReview: true,
    newsletterDigestFrequency: "weekly",
  });
}

export function canonicalUrlFor(item) {
  return clean(item.canonicalUrl || item.sourceUrl || item.url || item.link);
}

export function clean(value) {
  return String(value ?? "").replace(/\r\n/g, "\n").trim();
}

export function slug(value) {
  return clean(value).toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function isoDate(value = new Date()) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const text = clean(value);
  const match = text.match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : new Date().toISOString().slice(0, 10);
}

export function riskLevelFor(candidate) {
  const explicit = clean(candidate.riskLevel).toLowerCase().replace(/-/g, "_");
  if (riskLevels.has(explicit)) return explicit;
  const text = [
    candidate.sourceTitle,
    candidate.title,
    candidate.rewrittenHeadline,
    candidate.deck,
    candidate.summary,
    candidate.buyerTakeaway,
    ...(candidate.bodySections ?? []).flatMap((section) => [section.heading, section.body]),
  ].join(" ").toLowerCase();
  return highRiskTerms.some((term) => text.includes(term)) ? "high" : text.includes("construction") || text.includes("planning") || text.includes("developer") ? "medium" : "low";
}

export function statusForRisk(riskLevel, candidate = {}) {
  const explicit = clean(candidate.status).toLowerCase();
  if (validStatuses.has(explicit)) return explicit;
  return riskLevel === "high" ? "needs_review" : "queued";
}

export function normalizeBodySections(candidate) {
  const sections = Array.isArray(candidate.bodySections) ? candidate.bodySections : [];
  const normalized = sections
    .map((section) => ({
      heading: clean(section.heading),
      body: clean(section.body),
    }))
    .filter((section) => section.heading && section.body);
  if (normalized.length) return normalized;
  return [
    { heading: "What happened", body: clean(candidate.summary || candidate.deck || "Source coverage needs an editor summary before publication.") },
    { heading: "Why it matters for buyers", body: clean(candidate.buyerTakeaway || "Review whether this changes buyer timing, project confidence, or corridor context.") },
    { heading: "What to verify", body: "Confirm the source link, project match, timing, and any buyer-reliant claims before publishing." },
  ];
}

export async function normalizeCandidate(candidate, existingItems = []) {
  const now = new Date().toISOString();
  const sourceUrl = canonicalUrlFor(candidate);
  const sourceTitle = clean(candidate.sourceTitle || candidate.title || candidate.headline || "Untitled source item");
  const sourcePublishedAt = isoDate(candidate.sourcePublishedAt || candidate.publishedAt || candidate.date);
  const riskLevel = riskLevelFor(candidate);
  const rewrittenHeadline = clean(candidate.rewrittenHeadline || candidate.headline || buyerHeadline(sourceTitle));
  const relatedProjectIds = asSlugArray(candidate.relatedProjectIds || candidate.projects || candidate.projectIds);
  const relatedCorridorIds = asSlugArray(candidate.relatedCorridorIds || candidate.corridors || candidate.corridorIds);
  const image = await resolveNewsImage({
    ...candidate,
    sourceTitle,
    sourceUrl,
    relatedProjectIds,
    relatedCorridorIds,
  });
  const idBase = `${sourcePublishedAt}-${relatedProjectIds[0] || relatedCorridorIds[0] || slug(sourceTitle).slice(0, 50)}`;
  const id = uniqueId(slug(candidate.id || idBase), existingItems);
  return {
    id,
    sourceUrl,
    sourceName: clean(candidate.sourceName || candidate.publication || candidate.publisher || "Source"),
    sourceTitle,
    sourcePublishedAt,
    status: statusForRisk(riskLevel, candidate),
    riskLevel,
    publishMode: riskLevel === "high" ? "manual-review" : riskLevel === "medium" ? "queued-unless-blocked" : "auto-queue",
    relatedProjectIds,
    relatedCorridorIds,
    suggestedImagePath: image.path,
    imageResolutionReason: image.reason,
    suggestedImagePrompt: image.prompt,
    rewrittenHeadline,
    deck: clean(candidate.deck || candidate.summary || "Buyer-facing summary needs editor review."),
    bodySections: normalizeBodySections(candidate),
    buyerTakeaway: clean(candidate.buyerTakeaway || "Verify the practical buyer impact before relying on this item."),
    cta: clean(candidate.cta || candidate.callToAction || "Compare related West Palm Beach projects"),
    newsletterBlurb: clean(candidate.newsletterBlurb || candidate.deck || candidate.summary || rewrittenHeadline),
    createdAt: clean(candidate.createdAt) || now,
    updatedAt: now,
    importedFromIssue: candidate.importedFromIssue,
  };
}

export async function resolveNewsImage(candidate) {
  const explicit = clean(candidate.suggestedImagePath || candidate.imagePath || candidate.image?.path);
  if (explicit && await publicAssetExists(explicit)) {
    return { path: explicit, reason: "Explicit GPT suggested image exists in the public asset tree." };
  }

  const projectId = candidate.relatedProjectIds?.[0];
  if (projectId) {
    const projectDir = path.join(workspace, "public/projects", projectId, "media");
    const files = await listFiles(projectDir);
    const preferred = files.find((file) => /hero|card|exterior|rendering|user-provided/i.test(file)) ?? files.find((file) => /\.(jpe?g|png|webp)$/i.test(file));
    if (preferred) {
      return {
        path: publicPath(preferred),
        reason: `Exact related project image selected for ${projectId}.`,
      };
    }
  }

  const corridorId = candidate.relatedCorridorIds?.[0];
  const corridorMap = {
    "north-flagler": "/assets/editorial/flagler-waterfront-corridor.jpg",
    downtown: "/assets/editorial/rosemary-square-corridor.jpg",
    "south-flagler": "/assets/editorial/south-flagler-corridor.jpg",
  };
  if (corridorMap[corridorId] && await publicAssetExists(corridorMap[corridorId])) {
    return { path: corridorMap[corridorId], reason: `Corridor image selected for ${corridorId}.` };
  }

  const geography = "/assets/editorial/wpb-geography-map-hero.jpg";
  if (await publicAssetExists(geography)) return { path: geography, reason: "General West Palm Beach geography image selected." };
  return {
    path: "",
    reason: "No approved local image matched; editor should assign an image before publication.",
    prompt: `Create a neutral editorial image for: ${candidate.sourceTitle || candidate.rewrittenHeadline || "West Palm Beach condo news"}`,
  };
}

export function eligibleForAutoPublish(item, config, now = new Date()) {
  if (item.status !== "queued") return false;
  if (item.riskLevel === "high") return false;
  if (!config.autoPublishEnabled) return false;
  const createdAt = new Date(item.createdAt || item.updatedAt || now);
  const ageHours = (now.getTime() - createdAt.getTime()) / 36e5;
  return ageHours >= Number(config.autoPublishDelayHours ?? 6);
}

export function publicNewsRecordFromDraft(item) {
  return {
    id: item.id,
    slug: item.slug || item.id,
    title: item.rewrittenHeadline,
    sourceName: item.sourceName,
    sourceUrl: item.sourceUrl,
    canonicalUrl: item.sourceUrl,
    sourcePublishedAt: item.sourcePublishedAt,
    publishedAt: isoDate(item.sourcePublishedAt || new Date()),
    fetchedAt: isoDate(item.createdAt || new Date()),
    deck: item.deck,
    description: item.deck,
    summary: item.buyerTakeaway || item.deck,
    bodySections: item.bodySections ?? [],
    whyItMatters: item.bodySections?.find((section) => /why/i.test(section.heading))?.body || item.buyerTakeaway,
    brookeTake: item.buyerTakeaway,
    buyerContext: item.buyerTakeaway,
    newsletterHeadline: item.newsletterHeadline || item.rewrittenHeadline,
    newsletterBlurb: item.newsletterBlurb,
    newsletterCta: item.cta || "Request current availability",
    query: "GPT daily news draft",
    category: item.riskLevel === "high" ? "general" : item.riskLevel === "medium" ? "construction" : "development",
    relatedProjectIds: item.relatedProjectIds ?? [],
    relatedCorridorIds: item.relatedCorridorIds ?? [],
    imageUrl: item.suggestedImagePath || undefined,
    imagePath: item.suggestedImagePath || undefined,
    paywallStatus: "unknown",
    status: "published",
    riskLevel: item.riskLevel,
  };
}

export function containsBackendTerms(text) {
  return /\b(needs_review|generated|placeholder|internal|data model|source-material|backend)\b/i.test(text);
}

function asSlugArray(value) {
  if (!Array.isArray(value)) return [];
  return value.map(slug).filter(Boolean);
}

function buyerHeadline(sourceTitle) {
  return sourceTitle.replace(/\s*[-|]\s*[^-|]+$/, "").trim();
}

function uniqueId(base, existingItems) {
  const existing = new Set(existingItems.map((item) => item.id));
  if (!existing.has(base)) return base;
  let index = 2;
  while (existing.has(`${base}-${index}`)) index += 1;
  return `${base}-${index}`;
}

async function publicAssetExists(assetPath) {
  const normalized = assetPath.startsWith("/") ? assetPath.slice(1) : assetPath.replace(/^public\//, "");
  return fs.access(path.join(workspace, "public", normalized)).then(() => true).catch(() => false);
}

async function listFiles(root) {
  const entries = await fs.readdir(root, { withFileTypes: true }).catch(() => []);
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(fullPath));
    else files.push(fullPath);
  }
  return files;
}

function publicPath(filePath) {
  return `/${path.relative(path.join(workspace, "public"), filePath).split(path.sep).join("/")}`;
}
