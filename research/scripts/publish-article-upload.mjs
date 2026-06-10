import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import sharp from "sharp";

const workspace = process.cwd();
const inputPath = valueForArg("--input");
const editTarget = valueForArg("--edit");
const shouldPublish = process.argv.includes("--publish");
const shouldShip = process.argv.includes("--ship");
const previewOnly = !shouldPublish || process.argv.includes("--preview");
const now = new Date();
const today = now.toISOString().slice(0, 10);
const timestamp = now.toISOString().replace(/[:.]/g, "-");
const articlePreviewRoot = path.join(workspace, ".runtime/article-previews");
const imageBudgetBytes = 750 * 1024;

const destinationConfig = {
  news: {
    label: "News Update",
    routeBase: "/updates/",
    sourcePath: "research/news-review/approved-development-news.json",
    sourceType: "json-array",
    publishCommands: [["npm", ["run", "news:promote"]], ["npm", ["run", "news:refresh"]]],
  },
  buyer: {
    label: "Buyer Intelligence",
    routeBase: "/market-notes/",
    sourcePath: "src/data/marketNotes.ts",
    sourceType: "ts-array",
    publishCommands: [["npm", ["run", "research:site-intelligence"]]],
  },
  downtown: {
    label: "Downtown Spotlight",
    routeBase: "/downtown-spotlight/",
    sourcePath: "src/data/marketNotes.ts",
    sourceType: "ts-array",
    publishCommands: [["npm", ["run", "research:site-intelligence"]]],
  },
};

if (!inputPath) fail("--input is required.");

const input = JSON.parse(await fs.readFile(path.resolve(workspace, inputPath), "utf8"));
const destination = clean(input.destination || "news");
if (!destinationConfig[destination]) fail(`Unsupported destination: ${destination}`);

const editKey = clean(editTarget || input.edit || input.slug || input.id);
const existing = editKey ? await loadExistingArticle(destination, editKey) : null;
const requestedSlug = clean(input.slug || existing?.slug || existing?.id || slugBaseFromTitle(input.title));
const routeSlug = normalizeRouteSlug(destination, requestedSlug, input.title, existing);

const merged = mergeArticleInput(input, existing);
const title = clean(merged.title);
const deck = clean(merged.deck || merged.excerpt || merged.summary || merged.description);
const bodyText = clean(merged.body || merged.bodyText);
const bodySectionsInput = Array.isArray(merged.bodySections) ? merged.bodySections : [];
const sourceLinksInput = Array.isArray(merged.sourceLinks) ? merged.sourceLinks : [];
const shouldInferExisting = Boolean(existing) && !bodyText && !bodySectionsInput.length && !merged.heroImage && !(merged.bodyImages?.length);

if (!title) fail("Title is required.");
if (!deck) fail("Deck / summary is required.");
if (!shouldInferExisting && !bodyText && !bodySectionsInput.length && !existing?.bodySections?.length && !existing?.sections?.length) fail("Article body is required.");

const articleId = clean(existing?.id || merged.id || routeSlug);
const routePath = `${destinationConfig[destination].routeBase}${routeSlug}/`;
const sourcePath = path.join(workspace, destinationConfig[destination].sourcePath);
const previewDir = path.join(articlePreviewRoot, destination, routeSlug);
const previewHtmlPath = path.join(previewDir, "preview.html");
const previewJsonPath = path.join(previewDir, "preview.json");

const resolved = await normalizeArticle({
  destination,
  articleId,
  routeSlug,
  title,
  deck,
  merged,
  existing,
  bodyText,
  bodySectionsInput,
  sourceLinksInput,
});

const warnings = [...resolved.warnings];
const errors = [...resolved.errors];

const preview = buildPreviewModel({
  destination,
  routePath,
  routeSlug,
  articleId,
  title,
  deck,
  resolved,
  warnings,
  existing,
});

if (previewOnly) {
  await writePreviewArtifacts(previewDir, previewHtmlPath, previewJsonPath, preview);
  printPreview(preview);
  if (errors.length) process.exit(1);
  process.exit(0);
}

if (errors.length) fail(errors.join("\n"));

await writeDestinationFiles({
  destination,
  sourcePath,
  articleId,
  routeSlug,
  title,
  deck,
  resolved,
  existing,
  routePath,
});

for (const [command, args] of destinationConfig[destination].publishCommands) {
  await runChecked(command, args);
}

await runChecked("npm", ["run", "build"]);
await runChecked("npm", ["run", "qa:launch:no-write"]);

const changedBeforeCommit = await run("git", ["status", "--short"]);
if (!changedBeforeCommit.stdout.trim()) {
  await writePreviewArtifacts(previewDir, previewHtmlPath, previewJsonPath, preview);
  console.log(JSON.stringify({ ok: true, route: routePath, changedFiles: [], shipped: false, message: "No changes to publish." }, null, 2));
  process.exit(0);
}

await runChecked("git", ["add", "public/assets/editorial", "public/data/news-feed.json", "public/feed.json", "public/rss.xml", "public/llms.txt", "public/sitemap.xml", "research/news-review/approved-development-news.json", "src/data/approvedExternalNews.ts", "src/data/marketNotes.ts", "src/generated/siteData.ts", "research/scripts/build-site-intelligence.mjs"]);
const commitMessage = clean(merged.commitMessage) || `Publish ${destinationConfig[destination].label.toLowerCase()}: ${title}`;
await runChecked("git", ["commit", "-m", commitMessage]);
await runChecked("git", ["push", "origin", "main"]);

let shipped = false;
if (shouldShip) {
  await runChecked("npm", ["run", "ship:live"]);
  await runChecked("npm", ["run", "qa:live"]);
  shipped = true;
}

await writePreviewArtifacts(previewDir, previewHtmlPath, previewJsonPath, preview);
console.log(JSON.stringify({
  ok: true,
  destination,
  route: routePath,
  liveUrl: `https://www.wpbnewconstruction.com${routePath}`,
  title,
  id: articleId,
  previewHtml: previewHtmlPath,
  changedFiles: (await run("git", ["status", "--short"])).stdout.trim().split("\n").filter(Boolean),
  shipped,
}, null, 2));

async function loadExistingArticle(destination, editKey) {
  if (destination === "news") {
    const approvedPath = path.join(workspace, destinationConfig.news.sourcePath);
    const items = JSON.parse(await fs.readFile(approvedPath, "utf8"));
    return items.find((item) => item.id === editKey || item.slug === editKey) || null;
  }

  const source = await fs.readFile(path.join(workspace, destinationConfig[destination].sourcePath), "utf8");
  const items = readTsArrayItems(source, "marketNotes");
  return items.find((item) => item.id === editKey || item.slug === editKey) || null;
}

function mergeArticleInput(inputValue, existingValue) {
  const merged = {
    ...existingValue,
    ...inputValue,
    bodySections: inputValue.bodySections ?? existingValue?.bodySections,
    bodyImages: inputValue.bodyImages ?? existingValue?.bodyImages,
    heroImage: inputValue.heroImage ?? existingValue?.heroImage,
    sourceLinks: inputValue.sourceLinks ?? existingValue?.sourceLinks,
    projectIds: inputValue.projectIds ?? inputValue.relatedProjectIds ?? existingValue?.projectIds ?? existingValue?.relatedProjectIds,
    relatedProjectIds: inputValue.relatedProjectIds ?? inputValue.projectIds ?? existingValue?.relatedProjectIds ?? existingValue?.projectIds,
    relatedCorridorIds: inputValue.relatedCorridorIds ?? existingValue?.relatedCorridorIds,
    relatedCorridors: inputValue.relatedCorridors ?? existingValue?.relatedCorridors,
    dateModified: today,
  };
  if (existingValue && !inputValue.slug && existingValue.slug) merged.slug = existingValue.slug;
  if (existingValue && !inputValue.id && existingValue.id) merged.id = existingValue.id;
  return merged;
}

async function normalizeArticle({ destination, articleId, routeSlug, title, deck, merged, existing, bodyText, bodySectionsInput, sourceLinksInput }) {
  const errors = [];
  const warnings = [];
  const sourceUrl = clean(merged.sourceUrl || existing?.sourceUrl);
  if (destination === "news" && !sourceUrl) errors.push("Missing sourceUrl for news article.");

  const hero = await resolveHeroImage({ destination, routeSlug, title, merged, existing, warnings, errors });
  const bodyImages = await resolveBodyImages({ routeSlug, title, merged, existing, warnings, errors });

  const body = bodySectionsInput.length
    ? normalizeExplicitSections(bodySectionsInput, bodyImages, title, warnings)
    : normalizeTextBody(bodyText || existing?.body || existing?.summary || deck, bodyImages, title, warnings);

  if (!body.sections.length) errors.push("Body normalization produced no sections.");

  const sourceLinks = normalizeSourceLinks(sourceLinksInput.length ? sourceLinksInput : existing?.sourceLinks || [], { sourceUrl, sourceName: merged.sourceName || existing?.sourceName || title, destination, warnings, errors });

  const relatedProjectIds = normalizeSlugList(merged.relatedProjectIds || merged.projectIds || existing?.relatedProjectIds || existing?.projectIds);
  const relatedCorridorIds = normalizeSlugList(merged.relatedCorridorIds || existing?.relatedCorridorIds || existing?.relatedCorridors);

  const seo = normalizeSeo({ title, deck, merged, routeSlug, destination, body });
  const final = {
    id: articleId,
    slug: routeSlug,
    title,
    deck,
    description: clean(merged.description || deck),
    summary: clean(merged.summary || deck),
    bodySections: body.sections,
    body,
    hero,
    bodyImages: bodyImages.values,
    sourceName: clean(merged.sourceName || existing?.sourceName || title),
    sourceUrl,
    canonicalUrl: clean(merged.canonicalUrl || sourceUrl),
    sourceTitle: clean(merged.sourceTitle || existing?.sourceTitle || title),
    sourceLinks,
    relatedProjectIds,
    relatedCorridorIds,
    relatedProjectSlugs: normalizeSlugList(merged.relatedProjectSlugs || relatedProjectIds),
    relatedCorridors: normalizeSlugList(merged.relatedCorridors || relatedCorridorIds),
    primaryProjectSlug: clean(merged.primaryProjectSlug || relatedProjectIds[0] || existing?.primaryProjectSlug),
    corridorLabel: clean(merged.corridorLabel || existing?.corridorLabel),
    datePublished: clean(existing?.datePublished || merged.datePublished || today),
    dateModified: today,
    publishedAt: clean(existing?.publishedAt || merged.publishedAt || `${today}T12:00:00Z`),
    sourcePublishedAt: clean(existing?.sourcePublishedAt || merged.sourcePublishedAt || merged.sourcePublishedDate || today),
    sourcePublishedDate: clean(existing?.sourcePublishedDate || merged.sourcePublishedDate || merged.sourcePublishedAt || today),
    eventDate: clean(merged.eventDate || existing?.eventDate || today),
    dateDiscovered: clean(existing?.dateDiscovered || merged.dateDiscovered || today),
    freshnessLane: clean(merged.freshnessLane || existing?.freshnessLane || "breaking_14d"),
    fetchedAt: now.toISOString(),
    paywallStatus: clean(merged.paywallStatus || existing?.paywallStatus || "free"),
    status: clean(merged.status || existing?.status || (destination === "news" ? "published" : "published")),
    riskLevel: clean(merged.riskLevel || existing?.riskLevel || "medium"),
    whyItMatters: clean(merged.whyItMatters || existing?.whyItMatters || deck),
    buyerContext: clean(merged.buyerContext || existing?.buyerContext || deck),
    newsletterHeadline: clean(merged.newsletterHeadline || existing?.newsletterHeadline || title),
    newsletterBlurb: clean(merged.newsletterBlurb || existing?.newsletterBlurb || deck),
    newsletterCta: clean(merged.newsletterCta || existing?.newsletterCta || "Read the article"),
    query: clean(merged.query || existing?.query || title),
    category: clean(merged.category || existing?.category || (destination === "downtown" ? "Downtown Spotlight" : "Buyer Intelligence")),
    ctaText: clean(merged.ctaText || existing?.ctaText || "Request current availability and private comparison notes."),
    factCheckRequired: normalizeList(merged.factCheckRequired || existing?.factCheckRequired || ["Verify current pricing, availability, incentives, fees, square footage, and delivery timing before advising a buyer.", "Confirm source links and dates before relying on this note in a buyer recommendation."] ),
    seo,
  };

  if (!body.sections.length) errors.push("Article body is required.");
  if (deck.length < 20) warnings.push("Deck is very short.");
  if (body.sections.length === 1) warnings.push("Only one section detected; consider adding more structure.");
  if (!body.hasHeading) warnings.push("No explicit headings were detected; defaults were applied.");
  if (body.longSections.length) warnings.push(`Long sections detected: ${body.longSections.join(", ")}`);
  if (body.rawNote) warnings.push(body.rawNote);
  if (body.unusedImages.length) warnings.push(`Unused body images: ${body.unusedImages.join(", ")}`);
  if (body.missingPlaceholders.length) errors.push(`Missing body images for placeholders: ${body.missingPlaceholders.join(", ")}`);
  if (bodyImages.missing.length) warnings.push(`Body images referenced in input were not found: ${bodyImages.missing.join(", ")}`);
  if (hero.fallbackUsed) warnings.push("Hero image fallback was used.");
  if (hero.altFallbackUsed) warnings.push("Hero alt text fallback was used.");
  if (hero.sizeBytes && hero.sizeBytes > imageBudgetBytes) warnings.push(`Hero image exceeds the ${Math.round(imageBudgetBytes / 1024)} KB editorial budget.`);
  for (const image of bodyImages.values) {
    if (image.sizeBytes > imageBudgetBytes) warnings.push(`Body image ${image.label} exceeds the ${Math.round(imageBudgetBytes / 1024)} KB editorial budget.`);
  }
  if (!sourceLinks.length) warnings.push("No source links provided; article will publish with a fallback source link only if required.");
  if (destination === "news" && !sourceUrl) errors.push("Missing source URL for externally sourced news.");
  if (destination !== "news" && !sourceLinks.length) warnings.push("No source links provided.");

  return { ...final, warnings, errors };
}

async function resolveHeroImage({ destination, routeSlug, title, merged, existing, warnings, errors }) {
  const heroInput = merged.heroImage || existing?.heroImage || existing?.image || null;
  if (heroInput?.file || heroInput?.dataUrl) {
    const image = await writeOptimizedImage({
      source: heroInput.file || heroInput.dataUrl,
      role: "hero",
      routeSlug,
      key: heroInput.key || "hero",
      title,
      alt: clean(heroInput.alt),
      caption: clean(heroInput.caption),
      credit: clean(heroInput.credit),
    });
    return image;
  }

  const fallbackPath = destination === "downtown"
    ? "/assets/editorial/rosemary-square-corridor.jpg"
    : destination === "buyer"
      ? "/assets/editorial/wpb-geography-map-hero.jpg"
      : "/assets/editorial/flagler-waterfront-corridor.jpg";
  return {
    label: "hero",
    placeholder: "hero",
    path: fallbackPath,
    placementMode: "fallback",
    alt: `${title} hero image`,
    caption: "",
    credit: "",
    sizeBytes: await fileSizeForPublicPath(fallbackPath),
    fallbackUsed: true,
    altFallbackUsed: true,
  };
}

async function resolveBodyImages({ routeSlug, title, merged, existing, warnings, errors }) {
  const items = Array.isArray(merged.bodyImages) ? merged.bodyImages : Array.isArray(existing?.bodyImages) ? existing.bodyImages : [];
  const values = [];
  const missing = [];
  for (const [index, item] of items.entries()) {
    if (!item) continue;
    const label = clean(item.key || item.label || `image-${index + 1}`) || `image-${index + 1}`;
    const source = item.file || item.dataUrl || item.path;
    if (!source) {
      missing.push(label);
      continue;
    }
    const image = await writeOptimizedImage({
      source,
      role: `body-${index + 1}`,
      routeSlug,
      key: label,
      title,
      alt: clean(item.alt),
      caption: clean(item.caption),
      credit: clean(item.credit),
    });
    values.push({ ...image, key: label });
  }
  return { values, missing };
}

function normalizeExplicitSections(bodySectionsInput, bodyImages, title, warnings) {
  const sections = [];
  const imageMap = new Map(bodyImages.values.map((image) => [image.key, image]));
  const used = new Set();
  let hasHeading = false;
  for (const [index, section] of bodySectionsInput.entries()) {
    const heading = normalizeHeading(section.heading, index, title);
    const body = collapseWhitespace(clean(section.body || section.text || ""));
    if (heading.explicit) hasHeading = true;
    const resolvedImage = resolveInlineImageReference(section, imageMap, used);
    sections.push({ heading: heading.value, body, ...(resolvedImage ? { image: resolvedImage.path } : {}) });
  }
  const unusedImages = bodyImages.values.filter((image) => !used.has(image.key)).map((image) => image.key);
  if (unusedImages.length) warnings.push(`Body images not used by explicit sections: ${unusedImages.join(", ")}`);
  return { sections, hasHeading, longSections: sections.filter((section) => section.body.length > 850).map((section) => section.heading), unusedImages, missingPlaceholders: [] };
}

function normalizeTextBody(bodyText, bodyImages, title, warnings) {
  const raw = collapseWhitespace(bodyText);
  const blocks = raw.split(/\n{2,}/).map((part) => part.trim()).filter(Boolean);
  const sections = [];
  const placeholders = new Map();
  const usedKeys = new Set();
  const placeholderRe = /^\[\[image:([^\]]+)\]\]$/i;
  let currentHeading = "";
  let currentBody = [];
  let hasHeading = false;
  let rawNote = "";
  const imageByKey = new Map(bodyImages.values.map((image) => [image.key, image]));

  const flush = () => {
    const body = currentBody.join(" ").replace(/\s+/g, " ").trim();
    if (!body && !currentHeading) return;
    const heading = normalizeHeading(currentHeading, sections.length, title);
    if (heading.explicit) hasHeading = true;
    const placeholderKey = placeholders.get(sections.length);
    const image = placeholderKey ? imageByKey.get(placeholderKey) : undefined;
    if (placeholderKey && image) usedKeys.add(placeholderKey);
    sections.push({ heading: heading.value, body, ...(image ? { image: image.path } : {}) });
    currentHeading = "";
    currentBody = [];
  };

  for (const block of blocks) {
    const trimmed = block.trim();
    const placeholderMatch = trimmed.match(placeholderRe);
    if (placeholderMatch) {
      const placeholderKey = clean(placeholderMatch[1]);
      const nextIndex = sections.length;
      placeholders.set(nextIndex, placeholderKey);
      if (!imageByKey.has(placeholderKey) && !bodyImages.values.some((image) => image.key === placeholderKey)) {
        rawNote = rawNote || `Placeholder ${placeholderKey} does not match any provided body image.`;
      }
      continue;
    }
    const lines = trimmed.split(/\n/).map((line) => line.trim()).filter(Boolean);
    const candidateHeading = lines[0] || "";
    const looksHeading = isHeadingCandidate(candidateHeading, lines.length > 1 || sections.length === 0);
    if (looksHeading && lines.length > 1) {
      flush();
      currentHeading = candidateHeading.replace(/:$/, "");
      currentBody.push(lines.slice(1).join(" "));
      continue;
    }
    if (looksHeading && lines.length === 1 && sections.length === 0) {
      currentHeading = candidateHeading.replace(/:$/, "");
      hasHeading = true;
      continue;
    }
    if (!currentHeading && sections.length === 0 && raw.length > 0 && rawNote === "") {
      rawNote = "Draft reads like notes or a single blob of text; normalized sections were generated.";
    }
    currentBody.push(trimmed.replace(placeholderRe, "").replace(/\s+/g, " ").trim());
  }

  flush();
  if (!sections.length && raw) {
    sections.push({ heading: "What happened", body: raw });
  }

  const withImageUse = sections.map((section, index) => {
    const imageFromPlaceholder = section.image;
    if (imageFromPlaceholder) return section;
    const autoImage = bodyImages.values[index] && !hasAnyPlaceholder(placeholders) ? bodyImages.values[index].path : undefined;
    return autoImage ? { ...section, image: autoImage } : section;
  });

  const used = new Set(withImageUse.flatMap((section) => section.image ? [section.image] : []));
  const unusedImages = bodyImages.values.filter((image) => !used.has(image.path)).map((image) => image.key);
  const missingPlaceholders = [...placeholders.entries()].filter(([, key]) => !imageByKey.has(key)).map(([, key]) => key);
  const longSections = withImageUse.filter((section) => section.body.length > 850).map((section) => section.heading);
  return { sections: withImageUse, hasHeading, longSections, unusedImages, missingPlaceholders, rawNote };
}

function normalizeSourceLinks(sourceLinksInput, { sourceUrl, sourceName, destination, warnings, errors }) {
  const links = [];
  const pushLink = (item, fallbackType = "news") => {
    const label = clean(item.label || item.sourceName || item.title || item.url || item.href);
    const url = clean(item.url || item.href || item.link || item.sourceUrl || sourceUrl);
    const type = clean(item.type || item.sourceType || fallbackType);
    if (!label || !/^https?:\/\//i.test(url)) return;
    links.push(destination === "news" ? { label, url, type } : { label, href: url, sourceType: type });
  };
  if (sourceUrl) {
    pushLink({ label: sourceName || "Source", url: sourceUrl, type: destination === "news" ? "news" : "official project site" }, destination === "news" ? "news" : "official project site");
  }
  for (const item of sourceLinksInput) pushLink(item, destination === "news" ? "news" : "official project site");
  if (!links.length) {
    errors.push("Bad sourceLinks format or missing source URL.");
  }
  return dedupeLinks(links);
}

function normalizeSeo({ title, deck, merged, routeSlug, destination, body }) {
  const suffix = destination === "news" ? "WPB Updates" : destination === "downtown" ? "Downtown Spotlight" : "Buyer Intelligence";
  return {
    primaryQuery: clean(merged.primaryQuery || title),
    secondaryQueries: normalizeList(merged.secondaryQueries),
    suggestedSlug: routeSlug,
    titleTag: clean(merged.titleTag || `${title} | ${suffix}`),
    metaDescription: clean(merged.metaDescription || deck || body.sections[0]?.body || title),
  };
}

async function writeDestinationFiles({ destination, sourcePath, articleId, routeSlug, title, deck, resolved, existing, routePath }) {
  if (destination === "news") {
    const approvedPath = sourcePath;
    const items = JSON.parse(await fs.readFile(approvedPath, "utf8"));
    const normalizedItem = toApprovedNewsItem({ articleId, routeSlug, title, deck, resolved, existing });
    const next = [normalizedItem, ...items.filter((item) => item.id !== normalizedItem.id && item.slug !== normalizedItem.slug)];
    await fs.writeFile(approvedPath, `${JSON.stringify(next, null, 2)}\n`);
    return;
  }

  const source = await fs.readFile(sourcePath, "utf8");
  const note = toMarketNoteItem({ articleId, routeSlug, title, deck, resolved, existing, destination });
  const next = upsertTsArrayObject(source, "marketNotes", note, existing?.slug || existing?.id || routeSlug);
  await fs.writeFile(sourcePath, next);
  await upsertMarketNoteRouteDefinitions({ destination, routeSlug, title, deck, existing });
}

function toApprovedNewsItem({ articleId, routeSlug, title, deck, resolved, existing }) {
  const sourceLinks = resolved.sourceLinks.map((link) => ({ label: link.label, href: link.url, sourceType: link.type }));
  return {
    ...(existing || {}),
    id: articleId,
    slug: routeSlug,
    title,
    sourceName: resolved.sourceName,
    sourceUrl: resolved.sourceUrl,
    canonicalUrl: resolved.canonicalUrl,
    sourceTitle: resolved.sourceTitle,
    publishedAt: existing?.publishedAt || resolved.publishedAt,
    sourcePublishedAt: resolved.sourcePublishedAt,
    sourcePublishedDate: resolved.sourcePublishedDate,
    eventDate: resolved.eventDate,
    dateDiscovered: resolved.dateDiscovered,
    freshnessLane: resolved.freshnessLane,
    fetchedAt: resolved.fetchedAt,
    deck,
    description: resolved.description,
    summary: resolved.summary,
    bodySections: resolved.bodySections,
    whyItMatters: resolved.whyItMatters,
    buyerContext: resolved.buyerContext,
    newsletterHeadline: resolved.newsletterHeadline,
    newsletterBlurb: resolved.newsletterBlurb,
    newsletterCta: resolved.newsletterCta,
    query: resolved.query,
    category: resolved.category,
    relatedProjectIds: resolved.relatedProjectIds,
    relatedCorridorIds: resolved.relatedCorridorIds,
    relatedProjectSlugs: resolved.relatedProjectSlugs,
    relatedCorridors: resolved.relatedCorridors,
    primaryProjectSlug: resolved.primaryProjectSlug,
    corridorLabel: resolved.corridorLabel,
    imagePath: resolved.hero.path,
    sourceLinks,
    paywallStatus: resolved.paywallStatus,
    status: resolved.status,
    riskLevel: resolved.riskLevel,
  };
}

function toMarketNoteItem({ articleId, routeSlug, title, deck, resolved, existing, destination }) {
  const sections = resolved.bodySections.map((section) => {
    const inlineImage = resolved.bodyImages.find((image) => image.path === section.image);
    return {
      heading: section.heading,
      body: section.body,
      ...(inlineImage ? { image: inlineImage.path } : section.image ? { image: section.image } : {}),
    };
  });
  const sourceLinks = resolved.sourceLinks.map((link) => ({ label: link.label, href: link.href, sourceType: link.sourceType }));
  return {
    ...(existing || {}),
    id: articleId,
    status: resolved.status,
    category: destination === "downtown" ? "Downtown Spotlight" : resolved.category,
    title,
    slug: routeSlug,
    excerpt: deck,
    buyerThesis: clean(resolved.buyerContext || deck),
    buyerTakeaway: clean(resolved.buyerContext || resolved.whyItMatters || deck),
    image: {
      path: resolved.hero.path,
      credit: resolved.hero.credit,
    },
    imageId: existing?.imageId,
    primaryProjectId: resolved.primaryProjectSlug || resolved.relatedProjectIds[0],
    projectIds: resolved.relatedProjectIds,
    sourceName: resolved.sourceName,
    sourceLinks,
    datePublished: resolved.datePublished,
    dateModified: resolved.dateModified,
    sections,
    ctaText: resolved.ctaText,
    factCheckRequired: resolved.factCheckRequired,
    seo: resolved.seo,
  };
}

async function upsertMarketNoteRouteDefinitions({ destination, routeSlug, title, deck, existing }) {
  const sourcePath = path.join(workspace, "research/scripts/build-site-intelligence.mjs");
  const source = await fs.readFile(sourcePath, "utf8");
  const arrayName = destination === "downtown" ? "downtownSpotlightRoutes" : "marketNoteRoutes";
  const next = upsertJsRouteArray(source, arrayName, {
    slug: routeSlug,
    title: destination === "downtown" ? `${title} | Downtown Spotlight` : `${title} | Buyer Intelligence`,
    description: deck,
  }, existing?.slug || existing?.id || routeSlug);
  await fs.writeFile(sourcePath, next);
}

function buildPreviewModel({ destination, routePath, routeSlug, articleId, title, deck, resolved, warnings, existing }) {
  const seo = resolved.seo;
  const hero = resolved.hero;
  const bodySections = resolved.bodySections;
  const sourceLinks = resolved.sourceLinks;
  const relatedProjects = resolved.relatedProjectIds;
  const relatedCorridors = resolved.relatedCorridorIds;
  return {
    destination,
    routePath,
    routeSlug,
    articleId,
    title,
    deck,
    hero,
    bodySections,
    bodyImages: resolved.bodyImages,
    sourceLinks,
    relatedProjects,
    relatedCorridors,
    seo,
    warnings,
    existing: Boolean(existing),
    filesThatWouldChange: filesThatWouldChange(destination, routePath),
  };
}

async function writePreviewArtifacts(previewDir, previewHtmlPath, previewJsonPath, preview) {
  await fs.mkdir(previewDir, { recursive: true });
  await fs.writeFile(previewJsonPath, `${JSON.stringify(preview, null, 2)}\n`);
  await fs.writeFile(previewHtmlPath, renderPreviewHtml(preview));
}

function renderPreviewHtml(preview) {
  const hero = preview.hero;
  const bodyRows = preview.bodySections.map((section, index) => {
    const image = preview.bodyImages.find((item) => item.path === section.image);
    return `
      <section class="article-section">
        <h2>${escapeHtml(section.heading)}</h2>
        <p>${escapeHtml(section.body)}</p>
        ${image ? renderPreviewImageCard(image) : ""}
      </section>
    `;
  }).join("");
  const imageTableRows = [
    preview.hero,
    ...preview.bodyImages,
  ].map((image) => `
    <tr>
      <td>${escapeHtml(image.label || image.key || "hero")}</td>
      <td>${escapeHtml(image.placeholder || "hero")}</td>
      <td><code>${escapeHtml(image.path)}</code></td>
      <td>${escapeHtml(image.placementMode)}</td>
      <td>${escapeHtml(image.caption || "")}</td>
      <td>${escapeHtml(image.credit || "")}</td>
      <td>${escapeHtml(sizeLabel(image.sizeBytes))}</td>
    </tr>
  `).join("");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(preview.title)} — Article Preview</title>
  <style>
    :root { color-scheme: light; }
    body { margin: 0; font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f5f6f4; color: #1f2937; }
    .shell { max-width: 1180px; margin: 0 auto; padding: 32px 20px 64px; }
    .topbar, .panel { background: #fff; border: 1px solid #d8e0db; border-radius: 18px; box-shadow: 0 8px 24px rgba(0,0,0,.05); }
    .topbar { padding: 20px 24px; margin-bottom: 20px; display: grid; gap: 12px; }
    .topbar h1 { margin: 0; font-size: 32px; }
    .meta { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; font-size: 14px; }
    .meta div { background: #f8faf8; border: 1px solid #e4e9e4; border-radius: 12px; padding: 12px 14px; }
    .layout { display: grid; gap: 20px; grid-template-columns: minmax(0, 1fr) 360px; align-items: start; }
    .article { padding: 24px; }
    .hero { display: grid; gap: 20px; grid-template-columns: minmax(0, 1.2fr) minmax(280px, 420px); align-items: center; }
    .eyebrow { text-transform: uppercase; letter-spacing: .12em; font-size: 12px; color: #60706a; margin: 0 0 10px; }
    .hero h2, .article h2 { margin: 0 0 12px; }
    .hero p, .article p { line-height: 1.65; }
    figure { margin: 0; }
    figure img { width: 100%; border-radius: 18px; display: block; background: #e7ece9; }
    figcaption { font-size: 13px; color: #5a6660; margin-top: 8px; }
    .sidebar { display: grid; gap: 20px; }
    .panel { padding: 18px; }
    .panel h3 { margin: 0 0 12px; font-size: 18px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td { padding: 10px 8px; border-top: 1px solid #e9eeea; text-align: left; vertical-align: top; }
    th { background: #f7f9f7; position: sticky; top: 0; }
    code { font-size: 12px; background: #f3f5f3; padding: 2px 6px; border-radius: 6px; }
    .warnings li { margin: 0 0 8px; }
    .files li { margin-bottom: 6px; }
    .article-section { margin-bottom: 28px; padding-bottom: 22px; border-bottom: 1px solid #e9eeea; }
    .image-card { margin-top: 14px; background: #f8faf8; border: 1px solid #e2e8e4; border-radius: 16px; padding: 14px; }
    .image-card strong { display: block; margin-bottom: 6px; }
    .tight { font-size: 14px; color: #52615a; }
    @media (max-width: 1024px) { .layout, .hero { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <div class="shell">
    <section class="topbar">
      <p class="eyebrow">Article preview</p>
      <h1>${escapeHtml(preview.title)}</h1>
      <div class="meta">
        <div><strong>Route</strong><br /><code>${escapeHtml(preview.routePath)}</code></div>
        <div><strong>Deck</strong><br />${escapeHtml(preview.deck)}</div>
        <div><strong>SEO title</strong><br />${escapeHtml(preview.seo.titleTag)}</div>
        <div><strong>SEO description</strong><br />${escapeHtml(preview.seo.metaDescription)}</div>
      </div>
    </section>
    <div class="layout">
      <main class="panel article">
        <section class="hero">
          <div>
            <p class="eyebrow">${escapeHtml(preview.destination === "news" ? "News update" : preview.destination === "downtown" ? "Downtown spotlight" : "Buyer intelligence")}</p>
            <h2>${escapeHtml(preview.title)}</h2>
            <p>${escapeHtml(preview.deck)}</p>
          </div>
          ${renderPreviewImageCard(hero)}
        </section>
        ${bodyRows}
        <section class="article-section">
          <h2>Reviewed sources</h2>
          <ul>
            ${preview.sourceLinks.map((source) => `<li><a href="${escapeAttr(source.url || source.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.label)}</a> <span class="tight">${escapeHtml(source.type || source.sourceType || "source")}</span></li>`).join("")}
          </ul>
        </section>
      </main>
      <aside class="sidebar">
        <section class="panel">
          <h3>Warnings</h3>
          ${preview.warnings.length ? `<ul class="warnings">${preview.warnings.map((warning) => `<li>${escapeHtml(warning)}</li>`).join("")}</ul>` : "<p class=\"tight\">No warnings.</p>"}
        </section>
        <section class="panel">
          <h3>Image placement</h3>
          <table>
            <thead><tr><th>Label</th><th>Placeholder</th><th>Path</th><th>Mode</th><th>Caption</th><th>Credit</th><th>Size</th></tr></thead>
            <tbody>${imageTableRows}</tbody>
          </table>
        </section>
        <section class="panel">
          <h3>Files that would change</h3>
          <ul class="files">${preview.filesThatWouldChange.map((item) => `<li><code>${escapeHtml(item)}</code></li>`).join("")}</ul>
        </section>
      </aside>
    </div>
  </div>
</body>
</html>`;
}

function renderPreviewImageCard(image) {
  return `
    <figure>
      <img src="${escapeAttr(image.path)}" alt="${escapeAttr(image.alt || image.caption || image.label || "Preview image")}" />
      ${image.caption || image.credit ? `<figcaption>${escapeHtml([image.caption, image.credit].filter(Boolean).join(image.caption && image.credit ? " · " : ""))}</figcaption>` : ""}
    </figure>
  `;
}

async function writeOptimizedImage({ source, role, routeSlug, key, title, alt, caption, credit }) {
  const fileBuffer = await readImageSource(source);
  const sourceName = role === "hero" ? `${routeSlug}-hero.jpg` : `${routeSlug}-${role}-${slugBaseFromTitle(key || title)}.jpg`;
  const outputPath = path.join(workspace, "public/assets/editorial", sourceName);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  const pipeline = sharp(fileBuffer).rotate().resize(role === "hero" ? { width: 2400, withoutEnlargement: true, fit: "inside" } : { width: 1600, withoutEnlargement: true, fit: "inside" }).jpeg({ quality: 82, mozjpeg: true });
  await pipeline.toFile(outputPath);
  const stat = await fs.stat(outputPath);
  const publicPath = `/assets/editorial/${path.basename(outputPath)}`;
  return {
    label: role,
    key,
    placeholder: key || role,
    path: publicPath,
    placementMode: role === "hero" ? "hero" : "inline",
    alt: alt || `${title} ${role}`,
    caption: clean(caption),
    credit: clean(credit),
    sizeBytes: stat.size,
    fallbackUsed: false,
    altFallbackUsed: !alt,
  };
}

async function readImageSource(source) {
  if (String(source).startsWith("data:image/")) {
    const match = String(source).match(/^data:image\/[a-z0-9.+-]+;base64,(.+)$/i);
    if (!match) fail("Invalid dataUrl image payload.");
    return Buffer.from(match[1], "base64");
  }
  const absolute = path.isAbsolute(source) ? source : path.join(workspace, source);
  return fs.readFile(absolute);
}

async function fileSizeForPublicPath(publicPath) {
  const absolute = path.join(workspace, "public", publicPath.replace(/^\//, ""));
  return fs.stat(absolute).then((item) => item.size).catch(() => 0);
}

function filesThatWouldChange(destination, routePath) {
  const files = [];
  if (destination === "news") {
    files.push("research/news-review/approved-development-news.json", "src/data/approvedExternalNews.ts", "public/data/news-feed.json", "public/feed.json", "public/rss.xml", "public/llms.txt", "public/sitemap.xml", "src/generated/siteData.ts");
  } else {
    files.push("src/data/marketNotes.ts", "research/scripts/build-site-intelligence.mjs", "public/sitemap.xml", "src/generated/siteData.ts");
  }
  files.push(`preview: ${routePath}`);
  return files;
}

function normalizeHeading(value, index, title) {
  const text = clean(value);
  if (!text) return { value: defaultHeading(index, title), explicit: false };
  return { value: text.replace(/:$/, ""), explicit: true };
}

function defaultHeading(index, title) {
  return ["What happened", "Why it matters", "Buyer context", `${title} detail`][index] || `${title} detail ${index + 1}`;
}

function isHeadingCandidate(text, hasFollowingBody) {
  if (!text) return false;
  if (/^#{1,3}\s+/.test(text)) return true;
  if (/^[A-Z0-9][A-Za-z0-9'’& ,/-]{2,80}:?$/.test(text) && !/[.!?]$/.test(text) && hasFollowingBody) return true;
  if (/^[A-Za-z][A-Za-z0-9'’& ,/-]{2,60}:$/.test(text)) return true;
  return false;
}

function resolveInlineImageReference(section, imageMap, used) {
  const ref = clean(section.image || section.imageKey || section.imageId || "");
  if (!ref) return null;
  const image = imageMap.get(ref);
  if (image) {
    used.add(ref);
    return image;
  }
  return null;
}

function hasAnyPlaceholder(placeholders) {
  return placeholders.size > 0;
}

function normalizeRouteSlug(destination, requestedSlug, title, existing) {
  if (requestedSlug) return slug(requestedSlug);
  if (destination === "news") return `${slugBaseFromTitle(title)}-${today}`;
  if (existing?.slug) return slug(existing.slug);
  return slugBaseFromTitle(title);
}

function slugBaseFromTitle(value) {
  return clean(value).toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function normalizeSlugList(value) {
  if (Array.isArray(value)) return value.map((item) => slug(item)).filter(Boolean);
  return clean(value).split(/[,|\n]/).map((item) => slug(item)).filter(Boolean);
}

function normalizeList(value) {
  if (Array.isArray(value)) return value.map((item) => clean(item)).filter(Boolean);
  return clean(value).split(/\n+/).map((item) => clean(item)).filter(Boolean);
}

function normalizeSourceLinksFormat(sourceLinksInput) {
  return sourceLinksInput.map((item) => ({
    label: clean(item.label || item.sourceName || item.title || item.url || item.href),
    url: clean(item.url || item.href || item.link || item.sourceUrl),
    type: clean(item.type || item.sourceType || "news"),
  })).filter((item) => item.label && /^https?:\/\//i.test(item.url));
}

function dedupeLinks(links) {
  const seen = new Set();
  return links.filter((link) => {
    const url = link.url || link.href;
    if (!url || seen.has(url)) return false;
    seen.add(url);
    return true;
  });
}

function normalizeText(value) {
  return String(value ?? "").replace(/\r\n/g, "\n").trim();
}

function collapseWhitespace(value) {
  return normalizeText(value).replace(/\n{3,}/g, "\n\n").replace(/[ \t]+/g, " ");
}

function clean(value) {
  return normalizeText(value);
}

function slug(value) {
  return clean(value).toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function normalizeSourceLinks(sourceLinksInput, opts) {
  return normalizeSourceLinksFormat(sourceLinksInput, opts);
}

function readTsArrayItems(source, exportName) {
  const marker = `export const ${exportName} = [`;
  const start = source.indexOf(marker);
  if (start === -1) return [];
  const bodyStart = source.indexOf("[", start);
  const bodyEnd = findMatchingBracket(source, bodyStart);
  if (bodyEnd === -1) return [];
  const raw = source.slice(bodyStart, bodyEnd + 1);
  try {
    return Function(`"use strict"; return (${raw});`)();
  } catch {
    return [];
  }
}

function upsertTsArrayObject(source, exportName, nextObject, editKey) {
  const marker = `export const ${exportName} = [`;
  const start = source.indexOf(marker);
  if (start === -1) fail(`Could not find ${exportName} export.`);
  const bodyStart = source.indexOf("[", start);
  const bodyEnd = findMatchingBracket(source, bodyStart);
  if (bodyEnd === -1) fail(`Could not parse ${exportName} array.`);
  const arrayText = source.slice(bodyStart + 1, bodyEnd);
  const objectJson = `${JSON.stringify(nextObject, null, 2)},`;
  const existingBlock = findObjectBlock(arrayText, editKey);
  let nextArrayText = arrayText;
  if (existingBlock) {
    nextArrayText = arrayText.replace(existingBlock, `\n  ${objectJson.replace(/\n/g, "\n  ")}\n`);
  } else {
    nextArrayText = `\n  ${objectJson.replace(/\n/g, "\n  ")}\n${arrayText}`;
  }
  return `${source.slice(0, bodyStart + 1)}${nextArrayText}${source.slice(bodyEnd)}`;
}

function upsertJsRouteArray(source, exportName, route, editKey) {
  const marker = `const ${exportName} = [`;
  const start = source.indexOf(marker);
  if (start === -1) fail(`Could not find ${exportName}.`);
  const bodyStart = source.indexOf("[", start);
  const bodyEnd = findMatchingBracket(source, bodyStart);
  if (bodyEnd === -1) fail(`Could not parse ${exportName}.`);
  const arrayText = source.slice(bodyStart + 1, bodyEnd);
  const routeObject = JSON.stringify(route, null, 2);
  const existingBlock = findObjectBlock(arrayText, editKey);
  let nextArrayText = arrayText;
  if (existingBlock) {
    nextArrayText = arrayText.replace(existingBlock, `\n  ${routeObject.replace(/\n/g, "\n  ")},\n`);
  } else if (!arrayText.includes(`slug: "${route.slug}"`) && !arrayText.includes(`"slug": "${route.slug}"`)) {
    nextArrayText = `\n  ${routeObject.replace(/\n/g, "\n  ")},\n${arrayText}`;
  }
  return `${source.slice(0, bodyStart + 1)}${nextArrayText}${source.slice(bodyEnd)}`;
}

function findObjectBlock(arrayText, editKey) {
  if (!editKey) return "";
  const pattern = new RegExp(`\\{[\\s\\S]*?(?:slug|id):\\s*["']${escapeRegExp(editKey)}["'][\\s\\S]*?\\},?`, "m");
  const match = arrayText.match(pattern);
  return match ? match[0] : "";
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findMatchingBracket(source, start) {
  let depth = 0;
  let quote = "";
  let escaping = false;
  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    if (quote) {
      if (escaping) {
        escaping = false;
        continue;
      }
      if (char === "\\") {
        escaping = true;
        continue;
      }
      if (char === quote) quote = "";
      continue;
    }
    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }
    if (char === "[") depth += 1;
    if (char === "]") {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return -1;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, "&#96;");
}

function sizeLabel(bytes) {
  if (!bytes) return "0 KB";
  return `${Math.round(bytes / 1024)} KB`;
}

function printPreview(preview) {
  const lines = [
    `Preview only: ${preview.routePath}`,
    `Title: ${preview.title}`,
    `Deck: ${preview.deck}`,
    `Hero: ${preview.hero.path}`,
    `Preview file: ${preview.htmlPath}`,
  ];
  if (preview.warnings.length) {
    lines.push("Warnings:");
    for (const warning of preview.warnings) lines.push(`- ${warning}`);
  }
  lines.push("Files that would change:");
  for (const file of preview.filesThatWouldChange) lines.push(`- ${file}`);
  console.log(lines.join("\n"));
}

function valueForArg(name) {
  const prefix = `${name}=`;
  const inline = process.argv.find((arg) => arg.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : "";
}

async function runChecked(command, args) {
  const result = await run(command, args);
  if (result.code !== 0) {
    console.error(result.stdout);
    console.error(result.stderr);
    fail(`${command} ${args.join(" ")} failed with code ${result.code}`);
  }
  return result;
}

function run(command, args) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { cwd: workspace });
    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (chunk) => {
      stdout += chunk;
      process.stdout.write(chunk);
    });
    child.stderr?.on("data", (chunk) => {
      stderr += chunk;
      process.stderr.write(chunk);
    });
    child.on("error", (error) => resolve({ code: 1, stdout, stderr: error.message }));
    child.on("close", (code) => resolve({ code: code ?? 1, stdout, stderr }));
  });
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
