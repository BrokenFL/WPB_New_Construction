import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { safeHttpUrl, stableJson } from "../intel/core.mjs";
import { FAST_MODE_POLICY_VERSION } from "./fast-policy.mjs";

// Story_Queue -> existing article publisher bridge. Converts the writer's
// story_package_json into the article template input shape and invokes
// article-publish-cli --publish, which runs the real normalize + build + QA +
// commit + push. Push to main fires the normal deploy workflow — no second
// deploy trigger is created here.

export function articleInputFromStory(story) {
  let pkg;
  try { pkg = JSON.parse(story.story_package_json || "{}"); }
  catch { return { error: "story_package_json is not valid JSON" }; }
  if (!pkg || typeof pkg !== "object" || Array.isArray(pkg)) return { error: "story_package_json must be an object" };
  const bodyImages = Array.isArray(pkg.bodyImages) ? pkg.bodyImages : undefined;
  const sections = Array.isArray(pkg.sections) && pkg.sections.length
    ? pkg.sections.map((section) => ({ ...section }))
    : undefined;
  if (sections?.length && bodyImages?.length
    && !sections.some((section) => section.imageKey || section.image || section.imageId)) {
    sections[0].imageKey = bodyImages[0].key;
  }
  const input = {
    destination: pkg.destination || "news",
    title: pkg.title || story.headline,
    deck: pkg.deck || story.deck || story.summary,
    slug: pkg.slug || story.story_id && `intel-${story.story_id.replace(/^story-/, "")}`,
    id: pkg.id || `intel-${story.story_id}`,
    summary: pkg.summary || story.summary || undefined,
    description: pkg.description || pkg.deck || story.deck || undefined,
    sourceName: pkg.sourceName || undefined,
    sourceUrl: pkg.sourceUrl || undefined,
    sourcePublishedDate: pkg.sourcePublishedDate || undefined,
    sourceLinks: Array.isArray(pkg.sourceLinks) ? pkg.sourceLinks : undefined,
    relatedProjectIds: pkg.relatedProjectIds?.length ? pkg.relatedProjectIds : (story.project_ids ? story.project_ids.split(",").filter(Boolean) : undefined),
    relatedCorridorIds: pkg.relatedCorridorIds?.length ? pkg.relatedCorridorIds : (story.corridor_ids ? story.corridor_ids.split(",").filter(Boolean) : undefined),
    sections,
    body: pkg.body || story.article_body || undefined,
    eventDate: pkg.eventDate || undefined,
    category: pkg.category || undefined,
    seoTitle: pkg.seoTitle || story.seo_title || undefined,
    seoDescription: pkg.seoDescription || story.seo_description || undefined,
    socialCopy: pkg.socialCopy || story.social_copy || undefined,
    heroImage: pkg.heroImage || undefined,
    bodyImages,
    buyerTakeaway: pkg.buyerTakeaway || undefined,
    marketSignal: pkg.marketSignal || undefined,
    bestFor: pkg.bestFor || undefined,
    watchPoints: pkg.watchPoints || undefined,
    buyerQuestions: pkg.buyerQuestions || undefined,
    whyItMatters: pkg.whyItMatters || undefined,
    buyerContext: pkg.buyerContext || undefined,
    commitMessage: pkg.commitMessage || `Publish intel story ${story.story_id}: ${pkg.title || story.headline}`,
  };
  if (!input.title || !input.deck || (!input.sections && !input.body)) {
    return { error: "story package needs title, deck, and sections or body" };
  }
  return { input };
}

function parseJsonArray(value) {
  try {
    const parsed = typeof value === "string" ? JSON.parse(value || "[]") : value;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function publicAssetPath(value) {
  const clean = String(value || "").trim();
  return /^\/(?:assets|projects)\//.test(clean) ? clean : "";
}

function syntheticMarker(story, pkg) {
  const tokens = [story.story_id, story.intel_ids, story.event_key, pkg.id, pkg.slug]
    .join(" ").toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  return ["synthetic", "fixture", "mock", "demo", "test"].find((token) => tokens.includes(token)) || "";
}

export function validatePublishableStory(story) {
  let pkg;
  try { pkg = JSON.parse(story.story_package_json || "{}"); }
  catch { return { error: "story_package_json is not valid JSON", disposition: "rewrite" }; }
  if (!pkg || typeof pkg !== "object" || Array.isArray(pkg)) {
    return { error: "story_package_json must be an object", disposition: "rewrite" };
  }
  if (story.policy_version !== FAST_MODE_POLICY_VERSION) {
    return { error: "story policy_version is not the active Fast Mode policy", disposition: "hold" };
  }
  if (story.article_decision !== "AUTO_PUBLISH") {
    return { error: "story does not carry an AUTO_PUBLISH decision", disposition: "hold" };
  }
  if (story.writer_name !== "chatgpt-story-writer" || story.writer_version !== "story-writer-v1") {
    return { error: "story writer identity/version is not the approved contract", disposition: "rewrite" };
  }
  if (pkg.destination && pkg.destination !== "news") {
    return { error: "Fast Mode may publish only to the news destination", disposition: "rewrite" };
  }
  const marker = syntheticMarker(story, pkg);
  if (marker || pkg.synthetic === true || pkg.demo === true || pkg.fixture === true) {
    return { error: `synthetic/demo story marker blocked${marker ? `: ${marker}` : ""}`, disposition: "hold" };
  }
  const verifiedFacts = parseJsonArray(story.verified_facts_json);
  const verifiedSourceRefs = new Set(verifiedFacts.flatMap((fact) => Array.isArray(fact?.source_ref_ids) ? fact.source_ref_ids : []));
  // The publish bridge must enforce the same semantic occurrence contract as
  // Fast Mode policy. Project/corridor identity and the internal event key are
  // metadata; they do not establish that the real-world action occurred.
  const coreSourceRefs = new Set(verifiedFacts
    .filter((fact) => ["material_updates", "summary", "headline"].includes(fact?.field))
    .flatMap((fact) => Array.isArray(fact?.source_ref_ids) ? fact.source_ref_ids : []));
  const sources = parseJsonArray(story.sources_json)
    .filter((source) => source && typeof source === "object" && safeHttpUrl(source.url));
  const sourceByRef = new Map(sources.map((source) => [source.source_ref_id, source]));
  if (!verifiedSourceRefs.size || [...verifiedSourceRefs].some((ref) => !sourceByRef.has(ref))) {
    return { error: "story sources_json does not cover every verified fact source binding", disposition: "hold" };
  }
  const boundSources = sources.filter((source) => verifiedSourceRefs.has(source.source_ref_id));
  if (!boundSources.length) {
    return { error: "story has no evidence-bound sources_json entries", disposition: "hold" };
  }
  const allowedUrls = new Set(boundSources.map((source) => safeHttpUrl(source.url)));
  const credibleCoreUrls = new Set(boundSources
    .filter((source) => coreSourceRefs.has(source.source_ref_id) && (source.tier === 1 || source.tier === 2))
    .map((source) => safeHttpUrl(source.url)));
  const packageUrls = [
    pkg.sourceUrl,
    ...(Array.isArray(pkg.sourceLinks)
      ? pkg.sourceLinks.map((source) => typeof source === "string" ? source : source?.url)
      : []),
  ].filter(Boolean).map((url) => safeHttpUrl(url));
  if (!packageUrls.length || packageUrls.some((url) => !url || !allowedUrls.has(url))) {
    return { error: "story package source URLs must be a non-empty subset of sources_json", disposition: "rewrite" };
  }
  if (!packageUrls.some((url) => credibleCoreUrls.has(url))) {
    return { error: "story package must cite a reputable source bound to a verified core-event claim", disposition: "rewrite" };
  }
  return { pkg };
}

function assetRecordToImage(asset, key) {
  const pathValue = publicAssetPath(asset.publicPath || asset.src);
  if (!pathValue) return null;
  return {
    key,
    path: pathValue,
    alt: String(asset.alt || asset.title || "West Palm Beach development context").trim(),
    caption: String(asset.title || asset.alt || "West Palm Beach development context").trim(),
    credit: String(asset.credit || "Project marketing materials").trim(),
    mode: "approved-local",
  };
}

const CORRIDOR_IMAGE_FALLBACKS = Object.freeze({
  "north-flagler": [
    { path: "/assets/editorial/flagler-waterfront-corridor.jpg", alt: "Flagler Drive waterfront and West Palm Beach skyline", caption: "Flagler Drive waterfront context in West Palm Beach." },
    { path: "/assets/editorial/wpb-corridors-aerial-hero-v01.jpg", alt: "Aerial view of West Palm Beach development corridors", caption: "West Palm Beach corridor context for the development update." },
  ],
  "south-flagler": [
    { path: "/assets/editorial/south-flagler-corridor.jpg", alt: "South Flagler waterfront corridor in West Palm Beach", caption: "South Flagler waterfront context in West Palm Beach." },
    { path: "/assets/editorial/south-flagler-evening-corridor.jpg", alt: "South Flagler waterfront in evening light", caption: "The South Flagler waterfront provides geographic context for this update." },
  ],
  downtown: [
    { path: "/assets/editorial/downtown-core-corridor.jpg", alt: "Downtown West Palm Beach skyline and streets", caption: "Downtown West Palm Beach provides the setting for this development update." },
    { path: "/assets/editorial/downtown-spotlight-night-skyline-hero.jpg", alt: "Downtown West Palm Beach skyline at night", caption: "Downtown West Palm Beach skyline context." },
  ],
  nora: [
    { path: "/assets/editorial/nora-growth-corridor.jpg", alt: "NORA growth corridor in West Palm Beach", caption: "NORA district growth context in West Palm Beach." },
    { path: "/assets/editorial/nora-district-aerial-evening-hero.jpg", alt: "Aerial evening view of the NORA district", caption: "NORA district context in West Palm Beach." },
  ],
});

function fallbackImages(corridorIds = []) {
  const normalized = corridorIds.map((value) => String(value).trim().toLowerCase());
  const key = normalized.find((value) => CORRIDOR_IMAGE_FALLBACKS[value]) || "downtown";
  return CORRIDOR_IMAGE_FALLBACKS[key].map((image, index) => ({
    ...image,
    key: index === 0 ? "hero" : "story-context-1",
    credit: "User-provided editorial image, optimized for site use.",
    mode: "approved-local",
  }));
}

async function existsWithinBudget(root, publicPath) {
  const file = path.join(root, "public", publicPath.replace(/^\//, ""));
  const stat = await fs.stat(file).catch(() => null);
  return Boolean(stat?.isFile() && stat.size > 0 && stat.size <= 750 * 1024);
}

export async function enrichStoryWithApprovedImages({ root, story }) {
  const checked = validatePublishableStory(story);
  if (checked.error) return checked;
  const pkg = { ...checked.pkg };
  const existingHero = pkg.heroImage && typeof pkg.heroImage === "object" ? pkg.heroImage : null;
  const existingBody = Array.isArray(pkg.bodyImages) ? pkg.bodyImages.filter(Boolean) : [];
  if (existingHero && existingBody.length) return { story };

  const projectIds = Array.isArray(pkg.relatedProjectIds) && pkg.relatedProjectIds.length
    ? pkg.relatedProjectIds
    : String(story.project_ids || "").split(",").map((value) => value.trim()).filter(Boolean);
  let candidates = [];
  try {
    const registry = JSON.parse(await fs.readFile(path.join(root, "data/project_assets.json"), "utf8"));
    for (const projectId of projectIds) {
      const project = registry?.projects?.[projectId];
      const approved = (project?.assets || [])
        .filter((asset) => asset?.status === "approved" && !["floorplans", "logos", "docs", "misc"].includes(asset.category))
        .sort((a, b) => Number(b.placement === "hero" && b.variant === "primary") - Number(a.placement === "hero" && a.variant === "primary"));
      candidates.push(...approved.map((asset, index) => assetRecordToImage(asset, index === 0 ? "hero" : `story-context-${index}`)).filter(Boolean));
      if (candidates.length >= 2) break;
    }
  } catch {
    candidates = [];
  }
  const corridorIds = Array.isArray(pkg.relatedCorridorIds) && pkg.relatedCorridorIds.length
    ? pkg.relatedCorridorIds
    : String(story.corridor_ids || "").split(",").filter(Boolean);
  candidates.push(...fallbackImages(corridorIds));

  const usable = [];
  const seen = new Set();
  for (const candidate of candidates) {
    if (!candidate?.path || seen.has(candidate.path) || !(await existsWithinBudget(root, candidate.path))) continue;
    seen.add(candidate.path);
    usable.push(candidate);
  }
  const hero = existingHero || usable[0];
  const body = existingBody.length ? existingBody : usable.filter((candidate) => candidate.path !== hero?.path).slice(0, 1);
  if (!hero || !body.length) {
    return { error: "story has fewer than two approved local images available", disposition: "hold" };
  }
  pkg.heroImage = hero;
  pkg.bodyImages = body.map((image, index) => ({ ...image, key: image.key && image.key !== "hero" ? image.key : `story-context-${index + 1}` }));
  return { story: { ...story, story_package_json: JSON.stringify(pkg) } };
}

export async function writeStoryInput(root, storyId, input) {
  const dir = path.join(root, ".runtime", "p2", "story-inputs");
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, `${storyId}.json`);
  await fs.writeFile(file, `${JSON.stringify(input, null, 2)}\n`, { mode: 0o600 });
  return file;
}

function parseTrailingJson(text) {
  const trimmed = String(text || "").trimEnd();
  const end = trimmed.lastIndexOf("}");
  if (end === -1) return null;
  for (let start = trimmed.lastIndexOf("{", end); start >= 0; start = trimmed.lastIndexOf("{", start - 1)) {
    try { return JSON.parse(trimmed.slice(start, end + 1)); } catch { /* keep scanning */ }
  }
  return null;
}

export function runArticlePublish({ root, inputFile, args = ["--publish"], timeoutMs = 15 * 60 * 1000 }) {
  const cli = path.join(root, "research/scripts/article-publish-cli.mjs");
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [cli, "--input", inputFile, ...args], {
      cwd: root,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => { child.kill("SIGTERM"); }, timeoutMs);
    child.stdout.on("data", (chunk) => { stdout += chunk.toString(); });
    child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
    child.on("error", (error) => { clearTimeout(timer); resolve({ ok: false, error: error.message }); });
    child.on("close", (code) => {
      clearTimeout(timer);
      const result = parseTrailingJson(stdout);
      resolve({
        ok: result?.ok === true,
        code,
        result,
        stdoutTail: stdout.slice(-6000),
        stderr: stderr.slice(-2000),
      });
    });
  });
}

/**
 * Publish one ready_to_publish Story_Queue row. Idempotent at the row level:
 * callers must not re-invoke for rows already `published`. A failed attempt
 * returns { ok:false } so the row can be marked error and retried in place —
 * never duplicated.
 */
export async function publishStory({ root, story, run = runArticlePublish }) {
  const checked = validatePublishableStory(story);
  if (checked.error) return { ok: false, retryable: false, disposition: checked.disposition, error: checked.error };
  const firstPrepared = articleInputFromStory(story);
  if (firstPrepared.error) return { ok: false, retryable: false, disposition: "rewrite", error: firstPrepared.error };
  const existing = await findExistingPublication(root, firstPrepared.input);
  if (existing) {
    return { ok: true, alreadyPublished: true, liveUrl: existing.liveUrl, route: existing.route, published: true };
  }
  const enriched = await enrichStoryWithApprovedImages({ root, story });
  if (enriched.error) {
    return { ok: false, retryable: false, disposition: enriched.disposition || "hold", error: enriched.error };
  }
  const prepared = articleInputFromStory(enriched.story);
  if (prepared.error) return { ok: false, retryable: false, disposition: "rewrite", error: prepared.error };
  const inputFile = await writeStoryInput(root, enriched.story.story_id, prepared.input);
  const outcome = await run({ root, inputFile });
  if (!outcome.ok) {
    const detail = [
      outcome.error,
      outcome.result?.error,
      outcome.result?.errors?.join("; "),
      outcome.stdoutTail?.trim(),
      outcome.stderr?.trim(),
    ].filter(Boolean).join("\n") || `publisher exit ${outcome.code}`;
    return {
      ok: false,
      error: String(detail).slice(-4000),
      publisherReason: outcome.result?.reason || "publisher-error",
    };
  }
  return {
    ok: true,
    liveUrl: outcome.result?.liveUrl || null,
    route: outcome.result?.route || null,
    published: outcome.result?.published ?? outcome.result?.committed ?? true,
  };
}

async function findExistingPublication(root, input) {
  try {
    const items = JSON.parse(await fs.readFile(path.join(root, "research/news-review/approved-development-news.json"), "utf8"));
    if (!Array.isArray(items)) return null;
    const item = items.find((candidate) => candidate?.id === input.id || candidate?.slug === input.slug);
    if (!item) return null;
    const slug = String(item.slug || input.slug || "").trim();
    const route = `/updates/${slug}/`;
    return { item, route, liveUrl: `https://www.wpbnewconstruction.com${route}` };
  } catch {
    return null;
  }
}

export function stableStoryPublishRecord(story) {
  return stableJson({ story_id: story.story_id, event_key: story.event_key, published_url: story.published_url });
}
