import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import sharp from "sharp";

const workspace = process.cwd();
const inputPath = argValue("--input");
const editTarget = argValue("--edit");
const wantsPreview = process.argv.includes("--preview");
const wantsStage = process.argv.includes("--stage");
const wantsPublish = process.argv.includes("--publish");
const shouldShip = process.argv.includes("--ship");
const mode = wantsPreview ? "preview" : wantsPublish ? "publish" : wantsStage ? "stage" : shouldShip ? "ship" : "stage";
const previewOnly = mode === "preview";
const stageOnly = mode === "stage";
const publishMode = mode === "publish";
const shipOnly = mode === "ship";
const now = new Date();
const today = now.toISOString().slice(0, 10);
const timestamp = now.toISOString().replace(/[:.]/g, "-");
const previewRoot = path.join(workspace, ".runtime/article-previews");
const imageBudgetBytes = 750 * 1024;

if (!inputPath) fail("--input is required.");

const input = JSON.parse(await fs.readFile(resolveWorkspacePath(inputPath), "utf8"));
const openAiApiKey = clean(process.env.OPENAI_API_KEY || "");
const openAiImageModel = clean(process.env.WPB_IMAGE_REFRAME_MODEL || "gpt-5.6");
const destination = normalizeDestination(input.destination || "news");
const sourceFile = destination === "news"
  ? path.join(workspace, "research/news-review/approved-development-news.json")
  : path.join(workspace, "src/data/marketNotes.ts");
const editKey = clean(editTarget || input.edit || input.slug || input.id || "");
const existing = editKey ? await loadExistingArticle(destination, sourceFile, editKey) : null;
const title = clean(input.title || existing?.title);
const deck = clean(input.deck || input.excerpt || input.summary || input.description || existing?.deck || existing?.excerpt || existing?.summary || existing?.description);
const bodyText = clean(input.body || input.bodyText || input.bodySectionsText || "");
const sectionsInput = Array.isArray(input.sections) && input.sections.length ? input.sections : [];
const bodySectionsInput = sectionsInput.length
  ? sectionsInput
  : Array.isArray(input.bodySections) && input.bodySections.length
    ? input.bodySections
    : Array.isArray(existing?.bodySections)
      ? existing.bodySections
      : [];
const routeSlug = normalizeSlug(input.slug || existing?.slug || title || input.id || "article", destination, existing);
const articleId = clean(existing?.id || input.id || routeSlug);
const initialGitStatus = parseGitStatus(await gitStatus());

if (!title) fail("Title is required.");
if (!deck) fail("Deck / summary is required.");
if (!bodyText && !bodySectionsInput.length) fail("Article body is required.");

const normalized = await normalizeArticle({ destination, sourceFile, articleId, routeSlug, title, deck, input, existing, bodyText, bodySectionsInput, mode });
const routePath = `${routeBase(destination)}${routeSlug}/`;
const preview = buildPreview({ destination, articleId, routeSlug, routePath, title, deck, normalized, existing });
await writePreviewArtifacts(preview);

if (previewOnly) {
  const result = buildResult({
    mode: "preview",
    destination,
    routePath,
    preview,
    ok: preview.errors.length === 0,
    shipped: false,
    pushed: false,
  });
  console.log(JSON.stringify(result, null, 2));
  process.exitCode = result.ok ? 0 : 1;
} else {
  if (preview.errors.length) fail(preview.errors.join("\n"));
  const changedFilesBeforeCleanup = new Set(initialGitStatus.map((entry) => entry.path));
  if (shipOnly && !publishMode) {
    await requireCleanPushedCommit();
    await runChecked("npm", ["run", "build"]);
    await runChecked("npm", ["run", "qa:launch:no-write"]);
    await runChecked("npm", ["run", "ship:live"]);
    await runChecked("npm", ["run", "qa:live"]);
  }
  if (stageOnly || publishMode) {
    if (destination === "news") {
      await publishNewsArticle({ sourceFile, normalized, articleId, routeSlug, input, existing });
      await runChecked("npm", ["run", "news:promote"]);
      await runChecked("npm", ["run", "news:refresh"]);
    } else {
      // Keep the legacy market-note publish path for now, but feed it the normalized payload.
      const payloadPath = path.join(workspace, ".runtime", "article-publish-workflow", `${routeSlug}.json`);
      await fs.mkdir(path.dirname(payloadPath), { recursive: true });
      await fs.writeFile(payloadPath, `${JSON.stringify({ ...input, destination, title, deck, slug: routeSlug, id: articleId, bodySections: normalized.bodySections, heroImage: normalized.heroImage, bodyImages: normalized.bodyImages?.values || [], sourceLinks: normalized.sourceLinks }, null, 2)}\n`);
      await runChecked("node", ["research/scripts/manual-article-publisher.mjs", "--input", path.relative(workspace, payloadPath), "--ship"]);
    }

    if (stageOnly || publishMode) {
      await markStageOutputsAsIntentToAdd({ destination, normalized });
    }

    await runChecked("npm", ["run", "build"]);
    await runChecked("npm", ["run", "qa:launch:no-write"]);
    await cleanupUnexpectedGeneratedFiles({
      baselinePaths: changedFilesBeforeCleanup,
      keepPaths: new Set(articleOutputPaths({ destination, normalized })),
    });
  }

  let commitHash = "";
  let pushed = false;
  if (publishMode) {
    const filesToCommit = articleOutputPaths({ destination, normalized });
    await runChecked("git", ["add", "--", ...filesToCommit]);
    const commitMessage = clean(input.commitMessage || input.commit || `Publish ${title}`);
    await runChecked("git", ["commit", "-m", commitMessage]);
    commitHash = (await runChecked("git", ["rev-parse", "HEAD"])).stdout.trim();
    const branch = clean((await runChecked("git", ["branch", "--show-current"])).stdout) || "main";
    await runChecked("git", ["push", "origin", branch]);
    pushed = true;
  }

  if (shouldShip) {
    if (!publishMode && !shipOnly) await requireCleanPushedCommit();
    if (publishMode) {
      await runChecked("npm", ["run", "ship:live"]);
      await runChecked("npm", ["run", "qa:live"]);
    }
  }

  const result = buildResult({
    mode,
    destination,
    routePath,
    preview,
    ok: true,
    shipped: shouldShip,
    pushed,
    commitHash,
    deployUrl: shouldShip ? `https://www.wpbnewconstruction.com${routePath}` : "",
    changedFiles: publishMode ? await commitChangedFiles(commitHash) : await stageChangedFiles(initialGitStatus, destination, normalized),
    liveUrl: `https://www.wpbnewconstruction.com${routePath}`,
  });
  console.log(JSON.stringify(result, null, 2));
}

async function normalizeArticle({ destination, sourceFile, articleId, routeSlug, title, deck, input, existing, bodyText, bodySectionsInput, mode }) {
  const warnings = [];
  const errors = [];
  const heroImage = await resolveHeroImage({ destination, routeSlug, title, input, existing, warnings, errors, mode, sourceLinksInput: input.sourceLinks || existing?.sourceLinks || [] });
  const bodyImages = await resolveBodyImages({ destination, routeSlug, title, input, existing, mode });
  const sectionInput = parseSectionInput({ input, existing, bodySectionsInput, bodyText, warnings });
  const bodySections = sectionInput.map((section, index) => normalizeSection(section, index, bodyImages, warnings));
  if (!bodySections.length) errors.push("Could not normalize any body sections.");

  const sourceLinks = normalizeSourceLinks(input, existing, destination);
  if (destination === "news" && !clean(input.sourceUrl || existing?.sourceUrl)) warnings.push("News items should include a sourceUrl.");
  if (!sourceLinks.length) warnings.push("No source links were provided.");
  if (input.sourcePolicy === "two-source" || input.requireMultipleSources === true) {
    const sourceHosts = new Set(sourceLinks.map((link) => hostForSourceLink(link.url)).filter(Boolean));
    if (sourceLinks.length < 2) errors.push("Automated articles require at least two source links.");
    else if (sourceHosts.size < 2) errors.push("Automated articles require source links from at least two independent hosts.");
  }

  const bodyImagesBudgetChecks = [...bodyImages.values, heroImage].filter(Boolean).filter((image) => image.sizeBytes > imageBudgetBytes);
  for (const image of bodyImagesBudgetChecks) warnings.push(`Image ${image.path} exceeds the ${Math.round(imageBudgetBytes / 1024)} KB editorial budget.`);

  return {
    mode,
    warnings,
    errors,
    heroImage,
    bodyImages,
    bodySections,
    sourceLinks,
    article: {
      id: articleId,
      slug: routeSlug,
      title,
      deck,
      datePublished: clean(existing?.datePublished || input.datePublished || today),
      dateModified: today,
    },
  };
}

async function publishNewsArticle({ sourceFile, normalized, articleId, routeSlug, input, existing }) {
  const items = JSON.parse(await fs.readFile(sourceFile, "utf8"));
  const hero = normalized.heroImage?.path || "";
  const item = {
    ...(existing || {}),
    id: articleId,
    slug: routeSlug,
    title: normalized.article.title,
    sourceName: clean(input.sourceName || existing?.sourceName || "West Palm Beach New Construction"),
    sourceUrl: clean(input.sourceUrl || existing?.sourceUrl || "https://www.wpbnewconstruction.com/updates/"),
    canonicalUrl: clean(input.canonicalUrl || existing?.canonicalUrl || input.sourceUrl || existing?.sourceUrl || "https://www.wpbnewconstruction.com/updates/"),
    sourceTitle: clean(input.sourceTitle || existing?.sourceTitle || normalized.article.title),
    publishedAt: existing?.publishedAt || now.toISOString(),
    sourcePublishedAt: clean(input.sourcePublishedAt || input.sourcePublishedDate || existing?.sourcePublishedAt || today),
    sourcePublishedDate: clean(input.sourcePublishedDate || input.sourcePublishedAt || existing?.sourcePublishedDate || today),
    eventDate: clean(input.eventDate || existing?.eventDate || today),
    dateDiscovered: clean(input.dateDiscovered || existing?.dateDiscovered || today),
    freshnessLane: clean(input.freshnessLane || existing?.freshnessLane || "breaking_14d"),
    fetchedAt: now.toISOString(),
    deck: normalized.article.deck,
    description: clean(input.description || existing?.description || normalized.article.deck),
    summary: clean(input.summary || existing?.summary || normalized.article.deck),
    bodySections: normalized.bodySections,
    whyItMatters: clean(input.whyItMatters || existing?.whyItMatters || ""),
    buyerContext: clean(input.buyerContext || existing?.buyerContext || ""),
    buyerTakeaway: clean(input.buyerTakeaway || existing?.buyerTakeaway || ""),
    marketSignal: clean(input.marketSignal || existing?.marketSignal || ""),
    bestFor: clean(input.bestFor || existing?.bestFor || ""),
    watchPoints: clean(input.watchPoints || existing?.watchPoints || ""),
    buyerQuestions: clean(input.buyerQuestions || existing?.buyerQuestions || ""),
    relatedBuildings: asArray(input.relatedBuildings || existing?.relatedBuildings || []),
    relatedNeighborhoods: asArray(input.relatedNeighborhoods || existing?.relatedNeighborhoods || []),
    relatedCorridor: clean(input.relatedCorridor || existing?.relatedCorridor || ""),
    relatedArticleIds: asArray(input.relatedArticleIds || existing?.relatedArticleIds || []),
    newsletterHeadline: clean(input.newsletterHeadline || existing?.newsletterHeadline || normalized.article.title),
    newsletterBlurb: clean(input.newsletterBlurb || existing?.newsletterBlurb || normalized.article.deck),
    newsletterCta: clean(input.newsletterCta || existing?.newsletterCta || "Read the article"),
    query: clean(input.query || existing?.query || normalized.article.title),
    category: clean(input.category || existing?.category || "general"),
    relatedProjectIds: asArray(input.relatedProjectIds || input.projectIds || existing?.relatedProjectIds || existing?.projectIds),
    relatedCorridorIds: asArray(input.relatedCorridorIds || existing?.relatedCorridorIds || existing?.relatedCorridorIds),
    relatedProjectSlugs: asArray(input.relatedProjectSlugs || input.relatedProjectIds || input.projectIds || existing?.relatedProjectSlugs || existing?.relatedProjectIds),
    relatedCorridors: asArray(input.relatedCorridors || input.relatedCorridorIds || existing?.relatedCorridors || existing?.relatedCorridorIds),
    primaryProjectSlug: clean(input.primaryProjectSlug || existing?.primaryProjectSlug || asArray(input.relatedProjectIds || input.projectIds || existing?.relatedProjectIds || existing?.projectIds)[0]),
    corridorLabel: clean(input.corridorLabel || existing?.corridorLabel || corridorLabel(asArray(input.relatedCorridorIds || existing?.relatedCorridorIds)[0])),
    imagePath: hero,
    sourceLinks: normalized.sourceLinks,
    paywallStatus: clean(input.paywallStatus || existing?.paywallStatus || "free"),
    status: "published",
    riskLevel: clean(input.riskLevel || existing?.riskLevel || "medium"),
  };
  const next = [item, ...items.filter((existingItem) => existingItem.id !== item.id && existingItem.slug !== item.slug)];
  await fs.writeFile(sourceFile, `${JSON.stringify(next, null, 2)}\n`);
}

async function loadExistingArticle(destination, sourceFile, editKey) {
  if (destination === "news") {
    const items = JSON.parse(await fs.readFile(sourceFile, "utf8"));
    return items.find((item) => item.id === editKey || item.slug === editKey) || null;
  }
  const source = await fs.readFile(sourceFile, "utf8");
  const items = readTsArray(source, "marketNotes");
  return items.find((item) => item.id === editKey || item.slug === editKey) || null;
}

async function resolveHeroImage({ destination, routeSlug, title, input, existing, warnings, mode, sourceLinksInput }) {
  const imageMode = clean(input.imageMode || input.heroImage?.mode || input.heroImage?.strategy).toLowerCase();
  if (imageMode === "source-reframe" || imageMode === "generated-editorial") {
    try {
      return await generateOpenAiHeroImage({ destination, routeSlug, title, input, existing, warnings, mode, sourceLinksInput, imageMode });
    } catch (error) {
      warnings.push(`OpenAI editorial image generation failed: ${error.message}`);
    }
  }
  const heroInput = input.heroImage?.dataUrl || input.heroImage?.file || input.image?.path || existing?.image?.path || existing?.imagePath || "";
  if (heroInput) {
    if (!input.heroImage?.dataUrl && !input.heroImage?.file && isPublicImagePath(heroInput)) {
      return {
        path: heroInput,
        alt: clean(input.heroImage?.alt || existing?.image?.alt || `${title} hero image`),
        caption: clean(input.heroImage?.caption || existing?.image?.caption || ""),
        credit: clean(input.heroImage?.credit || existing?.image?.credit || ""),
        sizeBytes: await publicSize(heroInput),
      };
    }
    const image = await optimizeImage(heroInput, `${routeSlug}-hero.jpg`, title, input.heroImage?.alt || existing?.image?.alt || `${title} hero image`, input.heroImage?.caption || existing?.image?.caption || "", input.heroImage?.credit || existing?.image?.credit || "", assetOutputDir(mode, destination, routeSlug), assetPublicPath(mode, `${routeSlug}-hero.jpg`));
    return image;
  }
  const fallback = destination === "downtown"
    ? "/assets/editorial/rosemary-square-corridor.jpg"
    : destination === "buyer"
      ? "/assets/editorial/wpb-geography-map-hero.jpg"
      : "/assets/editorial/flagler-waterfront-corridor.jpg";
  warnings.push("Hero image fallback was used.");
  return { path: fallback, alt: `${title} hero image`, caption: "", credit: "", sizeBytes: await publicSize(fallback) };
}

async function generateOpenAiHeroImage({ destination, routeSlug, title, input, existing, warnings, mode, sourceLinksInput, imageMode }) {
  if (!openAiApiKey) throw new Error("OPENAI_API_KEY is not configured.");
  const sourceCandidate = imageMode === "source-reframe"
    ? await findBestSourceImageCandidate({ sourceLinksInput, warnings })
    : null;
  const prompt = buildEditorialHeroPrompt({ title, input, sourceCandidate, imageMode });
  const inputContent = [{ type: "input_text", text: prompt }];
  if (sourceCandidate?.imageUrl) {
    inputContent.push({ type: "input_image", image_url: await imageUrlToDataUrl(sourceCandidate.imageUrl) });
  }
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      authorization: `Bearer ${openAiApiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: openAiImageModel,
      input: [{ role: "user", content: inputContent }],
      tools: [{ type: "image_generation" }],
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`status ${response.status}${payload?.error?.message ? `: ${payload.error.message}` : ""}`);
  }
  const imageCall = Array.isArray(payload.output)
    ? payload.output.find((item) => item?.type === "image_generation_call" && item?.status === "completed" && typeof item?.result === "string")
    : null;
  if (!imageCall?.result) throw new Error("OpenAI returned no generated image.");
  const buffer = Buffer.from(imageCall.result, "base64");
  const outputDir = assetOutputDir(mode, destination, routeSlug);
  const fileName = `${routeSlug}-hero.webp`;
  const outputPath = path.join(outputDir, fileName);
  await fs.mkdir(outputDir, { recursive: true });
  await sharp(buffer).rotate().resize({ width: 1536, height: 1024, fit: "cover", withoutEnlargement: true }).webp({ quality: 84 }).toFile(outputPath);
  const stat = await fs.stat(outputPath);
  return {
    path: assetPublicPath(mode, fileName),
    alt: clean(input.heroImage?.alt || existing?.image?.alt || `${title} hero image`),
    caption: clean(input.heroImage?.caption || existing?.image?.caption || ""),
    credit: clean(input.heroImage?.credit || "AI-generated editorial illustration"),
    sizeBytes: stat.size,
  };
}

function buildEditorialHeroPrompt({ title, input, sourceCandidate, imageMode }) {
  const sourceClause = sourceCandidate?.sourcePageUrl
    ? `Use the reference image as a loose visual starting point, but reframe it into a fresh editorial composition rather than a republished stock look.`
    : `Create a fresh editorial image from scratch.`;
  const topic = clean(input.buyerTakeaway || input.marketSignal || input.deck || input.summary || title);
  return [
    `Create a neutral editorial hero image for a West Palm Beach new-construction article.`,
    `Article title: ${title}.`,
    `Article context: ${topic}.`,
    sourceClause,
    `Keep it local, calm, and realistic.`,
    `Do not include logos, signage, watermarks, or exact branded architecture.`,
    `Do not invent unsupported building details or text.`,
    `Avoid a brochure or marketing-rendering look.`,
    `Use a polished composition suitable for a news article hero.`,
    imageMode === "source-reframe" ? `Preserve the general mood and composition of the reference image while making it feel newly photographed.` : `The image should stand on its own without any reference photo.`,
  ].join(" ");
}

async function findBestSourceImageCandidate({ sourceLinksInput, warnings }) {
  const links = Array.isArray(sourceLinksInput) ? sourceLinksInput : [];
  const uniquePages = dedupe(links.map((link) => clean(link?.url)).filter((url) => /^https?:\/\//i.test(url)));
  const candidates = [];
  for (const pageUrl of uniquePages.slice(0, 4)) {
    try {
      const response = await fetch(pageUrl, {
        headers: {
          "user-agent": "WPBNewConstructionArticleImageScout/1.0 (+https://www.wpbnewconstruction.com/)",
          accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/png,image/jpeg,*/*;q=0.8",
        },
      });
      if (!response.ok) continue;
      const html = await response.text();
      for (const candidate of collectImageCandidates(html, pageUrl)) {
        candidates.push({ ...candidate, sourcePageUrl: pageUrl });
      }
    } catch (error) {
      warnings.push(`Source image scan failed for ${pageUrl}: ${error.message}`);
    }
  }
  candidates.sort((a, b) => scoreSourceImageCandidate(b) - scoreSourceImageCandidate(a));
  return candidates[0] || null;
}

function collectImageCandidates(html, pageUrl) {
  const candidates = new Map();
  const add = (url, source) => {
    const normalized = normalizeCandidateImageUrl(url, pageUrl);
    if (!normalized || rejectImageCandidate(normalized)) return;
    candidates.set(normalized, { imageUrl: normalized, source });
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

  return [...candidates.values()];
}

function scoreSourceImageCandidate(candidate) {
  let score = 0;
  if (/og:image|open-graph/i.test(candidate.source)) score += 30;
  if (/interior|residence|kitchen|living|bedroom|bath|dining|penthouse|lobby|lounge|waterfront|aerial|exterior|tower|building|hero|feature|cover/i.test(candidate.imageUrl)) score += 20;
  if (/\.(jpe?g|png|webp)(\?|$)/i.test(candidate.imageUrl)) score += 8;
  if (/logo|icon|favicon|sprite|placeholder|social|avatar|badge|map|floor.?plan/i.test(candidate.imageUrl)) score -= 50;
  return score;
}

function normalizeCandidateImageUrl(rawUrl, pageUrl) {
  const cleanUrl = decodeHtml(String(rawUrl ?? "").trim());
  if (!cleanUrl || cleanUrl.startsWith("data:") || cleanUrl.startsWith("blob:")) return "";
  try {
    return new URL(cleanUrl, pageUrl).href.split("#")[0];
  } catch {
    return "";
  }
}

function rejectImageCandidate(url) {
  return /logo|icon|favicon|sprite|placeholder|tracking|pixel|avatar|badge|social|facebook|instagram|linkedin|youtube|twitter|x\.com|floor.?plan|map|marker/i.test(url);
}

function srcsetUrls(value) {
  return String(value || "")
    .split(",")
    .map((part) => part.trim().split(/\s+/)[0])
    .filter(Boolean);
}

function decodeHtml(value) {
  return String(value ?? "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

async function imageUrlToDataUrl(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "WPBNewConstructionArticleImageScout/1.0 (+https://www.wpbnewconstruction.com/)",
      accept: "image/avif,image/webp,image/png,image/jpeg,*/*;q=0.8",
    },
  });
  if (!response.ok) throw new Error(`source image HTTP ${response.status}`);
  const contentType = response.headers.get("content-type") || "image/jpeg";
  if (!/^image\/(jpeg|jpg|png|webp|avif)/i.test(contentType)) throw new Error(`source image is not a usable image (${contentType})`);
  const buffer = Buffer.from(await response.arrayBuffer());
  if (!buffer.length) throw new Error("source image is empty");
  return `data:${contentType};base64,${buffer.toString("base64")}`;
}

async function resolveBodyImages({ destination, routeSlug, title, input, existing, mode }) {
  const items = Array.isArray(input.bodyImages) && input.bodyImages.length
    ? input.bodyImages
    : Array.isArray(existing?.bodyImages)
      ? existing.bodyImages
      : [];
  const values = [];
  for (const [index, item] of items.entries()) {
    const src = item?.dataUrl || item?.file || item?.path;
    if (!src) continue;
    const label = clean(item.key || item.label || `image-${index + 1}`);
    if (!item?.dataUrl && !item?.file && isPublicImagePath(src)) {
      values.push({
        key: label,
        path: src,
        alt: clean(item.alt || `${title} image`),
        caption: clean(item.caption || ""),
        credit: clean(item.credit || ""),
        placementMode: "manual",
        sizeBytes: await publicSize(src),
      });
      continue;
    }
    const optimized = await optimizeImage(src, `${routeSlug}-body-${index + 1}.jpg`, title, item.alt || `${title} image`, item.caption || "", item.credit || "", assetOutputDir(mode, destination, routeSlug), assetPublicPath(mode, `${routeSlug}-body-${index + 1}.jpg`));
    values.push({
      key: label,
      path: optimized.path,
      alt: clean(item.alt || `${title} image`),
      caption: clean(item.caption || ""),
      credit: clean(item.credit || ""),
      placementMode: "manual",
      sizeBytes: optimized.sizeBytes,
    });
  }
  return { values };
}

function normalizeSection(section, index, bodyImages, warnings) {
  const heading = clean(section.heading || section.title || defaultHeading(index));
  const body = clean(section.body || section.text || section.copy || "");
  const imageRef = clean(section.imageKey || section.image || section.imageId || extractFirstImageKey(body) || "");
  const image = imageRef ? bodyImages.values.find((item) => item.key === imageRef || item.path === imageRef) : bodyImages.values[index] || null;
  if (imageRef && !image) warnings.push(`Body image placeholder '${imageRef}' could not be resolved.`);
  const bullets = Array.isArray(section.bullets) ? section.bullets.map((bullet) => clean(bullet)).filter(Boolean) : [];
  return { heading, body, ...(bullets.length ? { bullets } : {}), ...(image ? { image: image.path } : {}) };
}

function parseSectionInput({ input, existing, bodySectionsInput, bodyText, warnings }) {
  if (Array.isArray(input.sections) && input.sections.length) {
    return input.sections.map((section, index) => ({
      heading: clean(section.heading || section.title || defaultHeading(index)),
      body: clean(section.body || section.text || section.copy || ""),
      imageKey: clean(section.imageKey || section.imageId || section.image || ""),
      bullets: Array.isArray(section.bullets) ? section.bullets.map((bullet) => clean(bullet)).filter(Boolean) : [],
    })).filter((section) => section.body || section.imageKey || (section.bullets?.length ?? 0));
  }
  if (Array.isArray(bodySectionsInput) && bodySectionsInput.length) {
    return bodySectionsInput.map((section, index) => ({
      heading: clean(section.heading || section.title || defaultHeading(index)),
      body: clean(section.body || section.text || section.copy || ""),
      imageKey: clean(section.imageKey || section.imageId || section.image || ""),
      bullets: Array.isArray(section.bullets) ? section.bullets.map((bullet) => clean(bullet)).filter(Boolean) : [],
    }));
  }
  const parsed = parseMarkdownBody(bodyText);
  if (parsed.usedFallback) warnings.push("Body sections were inferred from raw body text. Provide explicit sections for stable publishing.");
  return parsed.sections.length ? parsed.sections : Array.isArray(existing?.bodySections) ? existing.bodySections : [];
}

function parseMarkdownBody(bodyText) {
  const lines = clean(bodyText).split(/\n/);
  const sections = [];
  let current = null;
  const pushCurrent = () => {
    if (!current) return;
    const body = clean(current.paragraphs.join("\n\n"));
    if (body) sections.push({ heading: current.heading, body });
  };
  for (const rawLine of lines) {
    const line = clean(rawLine);
    if (!line) {
      if (current?.paragraphs.length) current.paragraphs.push("");
      continue;
    }
    const headingMatch = line.match(/^#{2,3}\s+(.+)$/);
    if (headingMatch) {
      pushCurrent();
      current = { heading: clean(headingMatch[1]), paragraphs: [] };
      continue;
    }
    if (!current) current = { heading: defaultHeading(sections.length), paragraphs: [] };
    current.paragraphs.push(line);
  }
  pushCurrent();
  return { usedFallback: sections.length > 0, sections };
}

function articleOutputPaths({ destination }) {
  const files = destination === "news"
    ? [
        "public/assets/editorial",
        "research/news-review/approved-development-news.json",
        "src/data/approvedExternalNews.ts",
        "public/data/news-feed.json",
        "public/feed.json",
        "public/rss.xml",
        "public/llms.txt",
        "public/sitemap.xml",
        "src/generated/siteData.ts",
      ]
    : [
        "public/assets/editorial",
        "src/data/marketNotes.ts",
        "src/generated/siteData.ts",
        "public/sitemap.xml",
      ];
  return files;
}

function assetOutputDir(mode, destination, routeSlug) {
  return mode === "preview"
    ? path.join(previewRoot, destination, routeSlug, "assets")
    : path.join(workspace, "public/assets/editorial");
}

function assetPublicPath(mode, fileName) {
  return mode === "preview" ? `assets/${fileName}` : `/assets/editorial/${fileName}`;
}

async function markStageOutputsAsIntentToAdd({ destination, normalized }) {
  const files = new Set();
  for (const image of [normalized.heroImage, ...(normalized.bodyImages?.values || [])].filter(Boolean)) {
    if (typeof image.path === "string" && image.path.startsWith("/assets/editorial/")) {
      files.add(path.join("public", image.path.replace(/^\//, "")));
    }
  }
  if (destination === "news") {
    files.add("research/news-review/approved-development-news.json");
    files.add("src/data/approvedExternalNews.ts");
  }
  if (files.size) {
    await runChecked("git", ["add", "-N", "--", ...files]);
  }
}

function parseGitStatus(stdout) {
  return String(stdout || "").split(/\n/).filter(Boolean).map((line) => {
    const match = line.match(/^(..?)\s+(.*)$/);
    if (!match) {
      return { raw: line, path: line.trim() };
    }
    return { raw: line, path: match[2].trim() };
  });
}

async function cleanupUnexpectedGeneratedFiles({ baselinePaths, keepPaths }) {
  const current = parseGitStatus(await gitStatus());
  const unexpected = current.filter((entry) => !isKeptPath(entry.path, keepPaths) && !baselinePaths.has(entry.path));
  const tracked = unexpected.filter((entry) => !entry.raw.startsWith("?? "));
  if (tracked.length) {
    await runChecked("git", ["restore", "--source=HEAD", "--", ...tracked.map((entry) => entry.path)]);
  }
}

function isKeptPath(pathName, keepPaths) {
  for (const keepPath of keepPaths) {
    if (pathName === keepPath) return true;
    if (keepPath.endsWith("/")) {
      if (pathName.startsWith(keepPath)) return true;
      continue;
    }
    if (keepPath.includes("/")) {
      if (pathName.startsWith(`${keepPath}/`)) return true;
    }
  }
  return false;
}

async function stageChangedFiles(initialStatus, destination, normalized) {
  const current = parseGitStatus(await gitStatus());
  const baselineRaw = new Set(initialStatus.map((entry) => entry.raw));
  const expected = articleOutputPaths({ destination, normalized });
  const isExpected = (pathName) => expected.some((keep) => {
    if (pathName === keep) return true;
    if (keep.endsWith("/")) return pathName.startsWith(keep);
    if (keep.includes("/")) return pathName.startsWith(`${keep}/`);
    return false;
  });
  // Report a file when it is an expected article output (even if the worktree was
  // already dirty for that path at startup) OR when its git status line is new
  // versus the baseline captured before the stage run. This avoids the previous
  // bug where a pre-dirty baseline made changedFiles collapse to [].
  return current
    .filter((entry) => isExpected(entry.path) || !baselineRaw.has(entry.raw))
    .map((entry) => entry.raw);
}

async function commitChangedFiles(commitHash) {
  const result = await run("git", ["show", "--name-only", "--format=", commitHash]);
  return result.stdout.split("\n").map((line) => line.trim()).filter(Boolean);
}

async function requireCleanPushedCommit() {
  const status = await gitStatus();
  if (status.trim()) fail("Ship requires a clean pushed commit. Run publish first.");
}

function renderPreviewSection(section, imageMap) {
  const hasPlaceholder = /\[\[image:[a-zA-Z0-9_-]+\]\]/.test(section.body);
  const paragraphs = String(section.body ?? "").split(/\n{2,}/).map((paragraph) => renderPreviewParagraph(paragraph, imageMap)).filter(Boolean);
  const bullets = Array.isArray(section.bullets) && section.bullets.length
    ? `<ul>${section.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}</ul>`
    : "";
  return `
    <section class="section">
      <h2>${escapeHtml(section.heading)}</h2>
      ${paragraphs.join("")}
      ${bullets}
      ${section.image && !hasPlaceholder ? renderPreviewImage(imageMap.get(section.image) || { path: section.image, alt: section.heading, caption: "", credit: "", placementMode: "manual" }) : ""}
    </section>
  `;
}

function renderPreviewImage(image) {
  return `<img class="preview-inline-image" data-placement="${escapeHtml(image.placementMode || "manual")}" src="${escapeHtml(image.path)}" alt="${escapeHtml(image.alt || "")}" />`;
}

function renderPreviewParagraph(paragraph, imageMap) {
  const text = escapeHtml(paragraph).replace(/\[\[image:([a-zA-Z0-9_-]+)\]\]/g, (_, key) => {
    const image = imageMap.get(key) || imageMap.get(`image-${key}`);
    if (!image) return `<mark>Missing image: ${escapeHtml(key)}</mark>`;
    return renderPreviewImage(image);
  });
  return text ? `<p>${text}</p>` : "";
}

function extractFirstImageKey(body) {
  const match = String(body ?? "").match(/\[\[image:([a-zA-Z0-9_-]+)\]\]/);
  return match?.[1] || "";
}

function normalizeSourceLinks(input, existing, destination) {
  const raw = [input.sourceLinks, input.sources, existing?.sourceLinks].find(Array.isArray) || [];
  const links = raw.map((item) => ({
    label: clean(item.label || item.sourceName || item.title || item.url || item.href),
    url: clean(item.url || item.href || item.link || item.sourceUrl),
    type: clean(item.type || item.sourceType || (destination === "news" ? "news" : "official project site")),
  })).filter((item) => item.label && /^https?:\/\//i.test(item.url));
  if (!links.length && clean(input.sourceUrl || existing?.sourceUrl)) {
    links.push({ label: clean(input.sourceName || existing?.sourceName || "Source"), url: clean(input.sourceUrl || existing?.sourceUrl), type: destination === "news" ? "news" : "official project site" });
  }
  return dedupe(links);
}

function hostForSourceLink(value) {
  try {
    return new URL(value).hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return "";
  }
}

function buildPreview({ destination, articleId, routeSlug, routePath, title, deck, normalized, existing }) {
  const previewDir = path.join(previewRoot, destination, routeSlug);
  const htmlPath = path.join(previewDir, "preview.html");
  return {
    destination,
    articleId,
    routeSlug,
    routePath,
    title,
    deck,
    hero: normalized.heroImage,
    bodySections: normalized.bodySections,
    bodyImages: normalized.bodyImages?.values || [],
    sourceLinks: normalized.sourceLinks,
    warnings: normalized.warnings,
    errors: normalized.errors,
    htmlPath,
    previewDir,
    existing: Boolean(existing),
    filesThatWouldChange: previewFiles(destination),
  };
}

function buildResult({ mode, destination, routePath, preview, ok, shipped, pushed = false, commitHash = "", deployUrl = "", changedFiles = [], liveUrl = "" }) {
  return {
    ok,
    mode,
    destination,
    route: routePath,
    previewHtml: path.relative(workspace, preview.htmlPath),
    previewJson: path.relative(workspace, path.join(preview.previewDir, "preview.json")),
    errors: preview.errors,
    warnings: preview.warnings,
    changedFiles,
    shipped,
    pushed,
    commitHash,
    deployUrl,
    liveUrl,
  };
}

async function writePreviewArtifacts(preview) {
  await fs.mkdir(preview.previewDir, { recursive: true });
  await fs.writeFile(path.join(preview.previewDir, "preview.json"), `${JSON.stringify(preview, null, 2)}\n`);
  await fs.writeFile(preview.htmlPath, renderPreviewHtml(preview));
}

function renderPreviewHtml(preview) {
  const imageMap = new Map((preview.bodyImages || []).map((image) => [image.key || image.label || image.path, image]));
  const bodySections = preview.bodySections.map((section) => renderPreviewSection(section, imageMap)).join("");
  const sourceLinks = preview.sourceLinks.map((link) => `<li><a href="${escapeHtml(link.url)}" target="_blank" rel="noreferrer">${escapeHtml(link.label)}</a> <small>${escapeHtml(link.type || "source")}</small></li>`).join("");
  const warnings = preview.warnings.map((warning) => `<li>${escapeHtml(warning)}</li>`).join("");
  const bodyImages = [preview.hero, ...preview.bodyImages].filter(Boolean).map((image) => `<tr><td>${escapeHtml(image.key || image.path)}</td><td><code>${escapeHtml(image.path)}</code></td><td>${escapeHtml(image.caption || "")}</td><td>${escapeHtml(image.credit || "")}</td><td>${escapeHtml(image.placementMode || "manual")}</td></tr>`).join("");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(preview.title)} preview</title>
  <style>
    body { margin: 0; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f5f6f4; color: #1f2937; }
    .wrap { max-width: 1120px; margin: 0 auto; padding: 32px 20px 56px; }
    .card { background: #fff; border: 1px solid #d8e0db; border-radius: 18px; padding: 22px; margin-bottom: 18px; box-shadow: 0 8px 24px rgba(0,0,0,.05); }
    .hero { display: grid; gap: 18px; grid-template-columns: minmax(0, 1.2fr) minmax(300px, 420px); align-items: center; }
    figure { margin: 0; }
    img { width: 100%; display: block; border-radius: 16px; background: #e9eeea; }
    code { font-size: 12px; background: #f3f5f3; padding: 2px 6px; border-radius: 6px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td { border-top: 1px solid #e9eeea; padding: 10px 8px; text-align: left; vertical-align: top; }
    .grid { display: grid; gap: 16px; grid-template-columns: minmax(0, 1fr) 360px; align-items: start; }
    @media (max-width: 1024px) { .hero, .grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <div class="wrap">
    <section class="card hero">
      <div>
        <p>Route: <code>${escapeHtml(preview.routePath)}</code></p>
        <h1>${escapeHtml(preview.title)}</h1>
        <p>${escapeHtml(preview.deck)}</p>
      </div>
      ${preview.hero ? `<figure><img src="${escapeHtml(preview.hero.path)}" alt="${escapeHtml(preview.hero.alt || preview.title)}" /></figure>` : ""}
    </section>
    <div class="grid">
      <main>
        <section class="card">
          ${bodySections}
        </section>
        <section class="card">
          <h2>Sources</h2>
          <ul>${sourceLinks}</ul>
        </section>
      </main>
      <aside>
        <section class="card">
          <h2>Warnings</h2>
          ${warnings ? `<ul>${warnings}</ul>` : "<p>No warnings.</p>"}
        </section>
        <section class="card">
          <h2>Images</h2>
          <table><thead><tr><th>Label</th><th>Path</th><th>Caption</th><th>Credit</th><th>Placement</th></tr></thead><tbody>${bodyImages}</tbody></table>
        </section>
        <section class="card">
          <h2>Files that would change</h2>
          <ul>${preview.filesThatWouldChange.map((file) => `<li><code>${escapeHtml(file)}</code></li>`).join("")}</ul>
        </section>
      </aside>
    </div>
  </div>
</body>
</html>`;
}

async function optimizeImage(source, fileName, title, alt, caption, credit, outputDir, publicPath) {
  const buffer = await readImageSource(source);
  await fs.mkdir(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, fileName);
  await sharp(buffer).rotate().resize({ width: fileName.includes("hero") ? 2400 : 1600, withoutEnlargement: true, fit: "inside" }).jpeg({ quality: 82, mozjpeg: true }).toFile(outputPath);
  const stat = await fs.stat(outputPath);
  return { path: publicPath, alt: clean(alt || `${title} image`), caption: clean(caption || ""), credit: clean(credit || ""), sizeBytes: stat.size };
}

async function readImageSource(source) {
  if (String(source).startsWith("data:image/")) {
    const match = String(source).match(/^data:image\/[a-z0-9.+-]+;base64,(.+)$/i);
    if (!match) fail("Invalid data URL image payload.");
    return Buffer.from(match[1], "base64");
  }
  const absolute = path.isAbsolute(source) ? source : resolveWorkspacePath(source);
  return fs.readFile(absolute);
}

async function publicSize(publicPath) {
  const absolute = path.join(workspace, "public", publicPath.replace(/^\//, ""));
  return fs.stat(absolute).then((stat) => stat.size).catch(() => 0);
}

function previewFiles(destination) {
  return destination === "news"
    ? ["research/news-review/approved-development-news.json", "public/data/news-feed.json", "public/feed.json", "public/rss.xml", "public/llms.txt", "public/sitemap.xml", "src/generated/siteData.ts"]
    : ["src/data/marketNotes.ts", "src/generated/siteData.ts", "public/sitemap.xml"];
}

async function gitStatus() {
  return run("git", ["status", "--short"]).then((result) => result.stdout);
}

function readTsArray(source, exportName) {
  const marker = `export const ${exportName} = [`;
  const start = source.indexOf(marker);
  if (start === -1) return [];
  const arrayStart = source.indexOf("[", start);
  const arrayEnd = findMatchingBracket(source, arrayStart);
  if (arrayEnd === -1) return [];
  const raw = source.slice(arrayStart, arrayEnd + 1);
  try {
    return Function(`"use strict"; return (${raw});`)();
  } catch {
    return [];
  }
}

function findMatchingBracket(source, start) {
  let depth = 0;
  let quote = "";
  let escaped = false;
  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
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

function normalizeDestination(value) {
  const normalized = clean(value).toLowerCase();
  if (normalized === "downtown" || normalized === "spotlight") return "downtown";
  if (normalized === "buyer" || normalized === "market" || normalized === "market-note" || normalized === "market-notes") return "buyer";
  return "news";
}

function routeBase(destination) {
  if (destination === "downtown") return "/downtown-spotlight/";
  if (destination === "buyer") return "/market-notes/";
  return "/updates/";
}

function normalizeSlug(value, destination, existing) {
  const base = slugify(value || existing?.slug || existing?.id || "article");
  if (destination === "news" && !/\d{4}-\d{2}-\d{2}$/.test(base)) return `${base}-${today}`;
  return base;
}

function slugify(value) {
  return clean(value).toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function looksLikeHeading(text) {
  return /^[A-Z0-9][A-Za-z0-9'’& ,/-]{2,80}:?$/.test(clean(text)) && !/[.!?]$/.test(clean(text));
}

function defaultHeading(index) {
  return ["What happened", "Why it matters", "Buyer context"][index] || `Section ${index + 1}`;
}

function corridorLabel(value) {
  return {
    downtown: "Downtown",
    "north-flagler": "North Flagler",
    "south-flagler": "South Flagler",
  }[value] || "West Palm Beach";
}

function asArray(value) {
  if (Array.isArray(value)) return value.map((item) => clean(item)).filter(Boolean);
  return clean(value).split(/[,|\n]/).map((item) => clean(item)).filter(Boolean);
}

function dedupe(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = item.url || item.href || `${item.label}:${item.type}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function clean(value) {
  return String(value ?? "").replace(/\r\n/g, "\n").trim();
}

function escapeHtml(value) {
  return clean(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function resolveWorkspacePath(value) {
  return path.isAbsolute(value) ? value : path.join(workspace, value);
}

function argValue(name) {
  const prefixed = process.argv.find((arg) => typeof arg === "string" && arg.startsWith(`${name}=`));
  if (prefixed) return prefixed.slice(name.length + 1);
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : "";
}

function isPublicImagePath(value) {
  return /^\/(assets|images|projects|team-resources)\//i.test(clean(value));
}

function fail(message) {
  console.error(message);
  process.exit(1);
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

async function runChecked(command, args) {
  const result = await run(command, args);
  if (result.code !== 0) fail(`${command} ${args.join(" ")} failed with code ${result.code}`);
  return result;
}
