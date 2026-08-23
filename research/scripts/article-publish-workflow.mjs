import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";
import { readTsArray, upsertTsArrayObject } from "./article-market-note-utils.mjs";
import {
  PublishSafetyError,
  acquireAttemptJournal,
  createPublishTransaction,
  requireCleanWorktree,
  runBoundedCommand,
  validateUniqueNewsCandidate,
} from "./article-publish-safety.mjs";
import { validateArticleImages } from "./article-content-policy.mjs";
import { scanPublicFields } from "./public-copy-safety.mjs";

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
const commandAbort = new AbortController();
let requestedSignal = "";
let activeTransaction = null;
let attemptJournal = null;

process.once("SIGINT", () => requestAbort("SIGINT"));
process.once("SIGTERM", () => requestAbort("SIGTERM"));

await main().catch(handleFatalError);

async function main() {
  if (!inputPath) fail("--input is required.");

  const input = JSON.parse(await fs.readFile(resolveWorkspacePath(inputPath), "utf8"));
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

  if (!title) fail("Title is required.");
  if (!deck) fail("Deck / summary is required.");
  if (!bodyText && !bodySectionsInput.length) fail("Article body is required.");

  if (!previewOnly) {
    await requireCleanWorktree({
      workspace,
      run: runForSafety,
      expectedBranch: "main",
      expectedRemoteFragment: "BrokenFL/WPB_New_Construction",
      requireUpstreamSync: true,
    });
    const attempt = automationAttempt(input, articleId);
    if (publishMode && attempt) {
      attemptJournal = await acquireAttemptJournal({ workspace, ...attempt, input });
    }
  }

  const initialGitStatus = parseGitStatus(await gitStatus());
  const previewNormalized = await normalizeArticle({
    destination,
    sourceFile,
    articleId,
    routeSlug,
    title,
    deck,
    input,
    existing,
    bodyText,
    bodySectionsInput,
    mode: "preview",
  });
  const routePath = `${routeBase(destination)}${routeSlug}/`;
  const preview = buildPreview({ destination, articleId, routeSlug, routePath, title, deck, normalized: previewNormalized, existing });
  preview.errors.push(...await preMutationValidation({ destination, sourceFile, articleId, routeSlug, input, existing, normalized: previewNormalized }));
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
    return;
  }

  if (preview.errors.length) fail(preview.errors.join("\n"));
  throwIfAborted();

  if (shipOnly && !publishMode) {
    await requireCleanPushedCommit();
    await runChecked("npm", ["run", "build"]);
    await runChecked("npm", ["run", "qa:launch:no-write"]);
    await runChecked("npm", ["run", "ship:live"]);
    await runChecked("npm", ["run", "qa:live"]);
  }

  let normalized = previewNormalized;
  if (stageOnly || publishMode) {
    const allowedOutputPaths = rollbackOutputPaths({ destination, normalized: previewNormalized });
    activeTransaction = createPublishTransaction({ workspace, allowedOutputPaths, run: runForRollback });
    normalized = await normalizeArticle({
      destination,
      sourceFile,
      articleId,
      routeSlug,
      title,
      deck,
      input,
      existing,
      bodyText,
      bodySectionsInput,
      mode,
    });
    throwIfAborted();

    if (destination === "news") {
      await publishNewsArticle({ sourceFile, normalized, articleId, routeSlug, input, existing });
      await runChecked("npm", ["run", "news:promote"]);
    } else {
      await publishMarketNoteArticle({ sourceFile, normalized, articleId, routeSlug, input, existing, destination });
    }
    await runChecked("npm", ["run", "news:refresh"]);
    await markStageOutputsAsIntentToAdd({ destination, normalized });
    await runChecked("npm", ["run", "build"]);
    await runChecked("npm", ["run", "qa:launch:no-write"]);
    await runChecked("npm", ["run", "qa:gatekeeper"]);
    await cleanupUnexpectedGeneratedFiles({
      baselinePaths: new Set(initialGitStatus.map((entry) => entry.path)),
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
    activeTransaction?.markCommitReached();
    commitHash = (await runChecked("git", ["rev-parse", "HEAD"])).stdout.trim();
    const branch = clean((await runChecked("git", ["branch", "--show-current"])).stdout) || "main";
    await runChecked("git", ["push", "origin", branch]);
    pushed = true;
  }

  if (shouldShip) {
    if (!publishMode && !shipOnly) await requireCleanPushedCommit();
    if (publishMode) {
      await runChecked("npm", ["run", "ship:live"], {
        env: { ...process.env, SHIP_LIVE_SKIP_CHECKS: "1" },
        idleTimeoutMs: numberFromEnv("ARTICLE_PUBLISH_SHIP_IDLE_TIMEOUT_MS", 600_000),
        absoluteTimeoutMs: numberFromEnv("ARTICLE_PUBLISH_SHIP_ABSOLUTE_TIMEOUT_MS", 1_200_000),
      });
      await runChecked("npm", ["run", "qa:live"]);
      await verifyLiveArticle({ routePath, title, heroImage: normalized.heroImage, bodyImages: normalized.bodyImages?.values || [] });
    }
  }

  activeTransaction?.complete();
  activeTransaction = null;
  await attemptJournal?.update("succeeded", { commitHash, pushed, shipped: shouldShip });

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

async function preMutationValidation({ destination, sourceFile, articleId, routeSlug, input, existing, normalized }) {
  const errors = [];
  if (destination === "news") {
    try {
      const items = JSON.parse(await fs.readFile(sourceFile, "utf8"));
      validateUniqueNewsCandidate(items, {
        id: articleId,
        slug: routeSlug,
        canonicalUrl: clean(input.canonicalUrl || existing?.canonicalUrl || input.sourceUrl || existing?.sourceUrl),
      });
    } catch (error) {
      errors.push(error.message);
    }
  }

  errors.push(...await validateImageRepetitionBeforeMutation({ destination, routeSlug, normalized, existing }));
  const publicCopy = {
    title: normalized.article.title,
    deck: normalized.article.deck,
    description: input.description || normalized.article.deck,
    summary: input.summary || normalized.article.deck,
    bodySections: normalized.bodySections,
    whyItMatters: input.whyItMatters || "",
    buyerContext: input.buyerContext || "",
    buyerTakeaway: input.buyerTakeaway || "",
    marketSignal: input.marketSignal || "",
    bestFor: input.bestFor || "",
    watchPoints: input.watchPoints || "",
    buyerQuestions: input.buyerQuestions || "",
    relatedCorridor: input.relatedCorridor || "",
    newsletterHeadline: input.newsletterHeadline || normalized.article.title,
    newsletterBlurb: input.newsletterBlurb || normalized.article.deck,
    newsletterCta: input.newsletterCta || "Read the article",
    heroImage: normalized.heroImage ? {
      alt: normalized.heroImage.alt,
      caption: normalized.heroImage.caption,
      credit: normalized.heroImage.credit,
    } : null,
    bodyImages: (normalized.bodyImages?.values || []).map((image) => ({
      alt: image.alt,
      caption: image.caption,
      credit: image.credit,
    })),
  };
  errors.push(...scanPublicFields(publicCopy).map((finding) => `Public copy safety failed before mutation: ${finding.field} contains blocked phrase "${finding.match}" (${finding.label}).`));
  return errors;
}

async function validateImageRepetitionBeforeMutation({ destination, routeSlug, normalized, existing }) {
  const findings = [];
  const images = [normalized.heroImage, ...(normalized.bodyImages?.values || [])].filter(Boolean);
  const sourceFiles = [
    "src/main.ts",
    "src/data/marketNotes.ts",
    "src/data/approvedExternalNews.ts",
    "src/data/editorialImagery.ts",
    "content/overrides/homepage-card-overrides.json",
  ];
  const sourceTexts = await Promise.all(sourceFiles.map((file) => fs.readFile(path.join(workspace, file), "utf8")));
  const existingImagePath = clean(existing?.image?.path || existing?.imagePath);

  for (const image of images) {
    if (/^\/(?:assets|projects)\//.test(image.path)) {
      const occurrences = sourceTexts.reduce((count, source) => count + source.split(image.path).length - 1, 0);
      const proposedUse = image.path === existingImagePath ? 0 : 1;
      if (occurrences + proposedUse > 3) {
        findings.push(`Image repetition preflight failed: ${image.path} would appear ${occurrences + proposedUse} times in source mappings.`);
      }
      continue;
    }

    const previewPath = path.join(previewRoot, destination, routeSlug, image.path);
    const previewHash = await fileSha256(previewPath).catch(() => "");
    if (!previewHash) continue;
    const publicTarget = `/assets/editorial/${path.basename(image.path)}`;
    for (const publicFile of await listFiles(path.join(workspace, "public/assets/editorial"))) {
      const publicPath = `/assets/editorial/${path.basename(publicFile)}`;
      if (publicPath === publicTarget || publicPath === existingImagePath) continue;
      if (await fileSha256(publicFile).catch(() => "") === previewHash) {
        findings.push(`Image repetition preflight failed: candidate image exactly duplicates ${publicPath}.`);
        break;
      }
    }
  }
  return findings;
}

async function listFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true }).catch(() => []);
  const files = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return listFiles(entryPath);
    return entry.isFile() ? [entryPath] : [];
  }));
  return files.flat();
}

async function fileSha256(filePath) {
  return crypto.createHash("sha256").update(await fs.readFile(filePath)).digest("hex");
}

function automationAttempt(input, articleId) {
  const inferredAutomationId = articleId.startsWith("wpb-content-scout-safe-daily-publish-")
    ? "wpb-content-scout-safe-daily-publish"
    : "";
  const automationId = clean(input.automationId || input.automation?.id || inferredAutomationId);
  if (!automationId) return null;
  const runKey = clean(input.automationRunId || input.runId || `${automationId}:${newYorkDate(now)}`);
  return { automationId, runKey };
}

function newYorkDate(value) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${byType.year}-${byType.month}-${byType.day}`;
}

function requestAbort(signalName) {
  if (commandAbort.signal.aborted) return;
  requestedSignal = signalName;
  commandAbort.abort(new PublishSafetyError(`Article publishing interrupted by ${signalName}.`, {
    code: signalName === "SIGINT" ? 130 : 143,
    reason: "signal",
  }));
}

function throwIfAborted() {
  if (!commandAbort.signal.aborted) return;
  throw commandAbort.signal.reason instanceof Error
    ? commandAbort.signal.reason
    : new PublishSafetyError("Article publishing was aborted.", { reason: "aborted" });
}

async function handleFatalError(error) {
  const rollback = await activeTransaction?.rollback().catch((rollbackError) => ({
    rolledBack: false,
    reason: "rollback-error",
    remaining: rollbackError.message,
  }));
  activeTransaction = null;
  await attemptJournal?.update("failed", {
    error: error.message,
    reason: error.reason || "workflow-error",
    rollback: rollback || null,
  }).catch((journalError) => {
    process.stderr.write(`Could not update publish attempt journal: ${journalError.message}\n`);
  });

  const exitCode = requestedSignal === "SIGINT" ? 130 : requestedSignal === "SIGTERM" ? 143 : error.exitCode || 1;
  process.stderr.write(`${error.message}\n`);
  console.log(JSON.stringify({
    ok: false,
    mode,
    error: error.message,
    reason: error.reason || "workflow-error",
    rolledBack: rollback?.rolledBack ?? false,
    rollbackReason: rollback?.reason || "not-started",
    remainingChanges: rollback?.remaining || "",
  }, null, 2));
  process.exitCode = exitCode;
}

async function normalizeArticle({ destination, sourceFile, articleId, routeSlug, title, deck, input, existing, bodyText, bodySectionsInput, mode }) {
  const warnings = [];
  const errors = [];
  const heroImage = await resolveHeroImage({ destination, routeSlug, title, input, existing, warnings, errors, mode });
  const bodyImages = await resolveBodyImages({ destination, routeSlug, title, input, existing, mode });
  const sectionInput = parseSectionInput({ input, existing, bodySectionsInput, bodyText, warnings });
  const bodySections = sectionInput.map((section, index) => normalizeSection(section, index, bodyImages, warnings));
  if (!bodySections.length) errors.push("Could not normalize any body sections.");
  errors.push(...validateArticleImages({
    heroImage,
    bodyImages: bodyImages.values,
    bodySections,
  }));

  const sourceLinks = normalizeSourceLinks(input, existing, destination);
  if (destination === "news" && !clean(input.sourceUrl || existing?.sourceUrl)) warnings.push("News items should include a sourceUrl.");
  if (!sourceLinks.length) warnings.push("No source links were provided.");
  if (input.sourcePolicy === "two-source" || input.requireMultipleSources === true) {
    const sourceHosts = new Set(sourceLinks.map((link) => hostForSourceLink(link.url)).filter(Boolean));
    if (sourceLinks.length < 2) errors.push("Automated articles require at least two source links.");
    else if (sourceHosts.size < 2) errors.push("Automated articles require source links from at least two independent hosts.");
  }

  const bodyImagesBudgetChecks = [...bodyImages.values, heroImage].filter(Boolean).filter((image) => image.sizeBytes > imageBudgetBytes);
  for (const image of bodyImagesBudgetChecks) errors.push(`Image ${image.path} exceeds the ${Math.round(imageBudgetBytes / 1024)} KB editorial budget.`);

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

async function publishMarketNoteArticle({ sourceFile, normalized, articleId, routeSlug, input, existing, destination }) {
  const source = await fs.readFile(sourceFile, "utf8");
  const hero = normalized.heroImage;
  const note = {
    ...(existing || {}),
    id: articleId,
    status: "published",
    category: destination === "downtown" ? "Downtown Spotlight" : clean(input.category || existing?.category || "Buyer Intelligence"),
    title: normalized.article.title,
    slug: routeSlug,
    excerpt: normalized.article.deck,
    buyerThesis: clean(input.buyerThesis || existing?.buyerThesis || input.buyerContext || normalized.article.deck),
    buyerTakeaway: clean(input.buyerTakeaway || existing?.buyerTakeaway || input.buyerContext || input.whyItMatters || normalized.article.deck),
    marketSignal: clean(input.marketSignal || existing?.marketSignal || ""),
    bestFor: clean(input.bestFor || existing?.bestFor || ""),
    watchPoints: clean(input.watchPoints || existing?.watchPoints || ""),
    buyerQuestions: clean(input.buyerQuestions || existing?.buyerQuestions || ""),
    relatedBuildings: asArray(input.relatedBuildings || existing?.relatedBuildings || []),
    relatedNeighborhoods: asArray(input.relatedNeighborhoods || existing?.relatedNeighborhoods || []),
    relatedCorridor: clean(input.relatedCorridor || existing?.relatedCorridor || ""),
    relatedArticleIds: asArray(input.relatedArticleIds || existing?.relatedArticleIds || []),
    image: {
      path: hero.path,
      alt: hero.alt,
      caption: hero.caption,
      credit: hero.credit,
      mode: hero.mode,
    },
    primaryProjectId: clean(input.primaryProjectId || existing?.primaryProjectId || asArray(input.relatedProjectIds || input.projectIds || existing?.projectIds || [])[0]),
    projectIds: asArray(input.relatedProjectIds || input.projectIds || existing?.projectIds || []),
    sourceName: clean(input.sourceName || existing?.sourceName || "West Palm Beach New Construction"),
    sourceLinks: normalized.sourceLinks.map((link) => ({
      label: link.label,
      href: link.url,
      sourceType: marketSourceType(link.type),
    })),
    datePublished: clean(existing?.datePublished || input.datePublished || today),
    dateModified: today,
    sections: normalized.bodySections,
    ctaText: clean(input.ctaText || existing?.ctaText || "The Scott Gordon Group at Douglas Elliman can help buyers apply this note to current West Palm Beach new-construction options."),
    factCheckRequired: asArray(input.factCheckRequired || existing?.factCheckRequired || [
      "Verify current pricing, availability, incentives, fees, square footage, and delivery timing before advising a buyer.",
      "Confirm source links and dates before relying on this note in a buyer recommendation.",
    ]),
    seo: {
      primaryQuery: clean(input.primaryQuery || existing?.seo?.primaryQuery || normalized.article.title),
      secondaryQueries: asArray(input.secondaryQueries || existing?.seo?.secondaryQueries || []),
      suggestedSlug: routeSlug,
      titleTag: clean(input.titleTag || existing?.seo?.titleTag || `${normalized.article.title} | ${destination === "downtown" ? "Downtown Spotlight" : "Buyer Intelligence"}`),
      metaDescription: clean(input.metaDescription || existing?.seo?.metaDescription || input.description || normalized.article.deck),
    },
  };
  const next = upsertTsArrayObject(source, "marketNotes", note, existing?.slug || existing?.id || routeSlug);
  await fs.writeFile(sourceFile, next);
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

async function resolveHeroImage({ destination, routeSlug, title, input, existing, warnings, errors, mode }) {
  const imageMode = clean(input.imageMode || input.heroImage?.mode || input.heroImage?.strategy).toLowerCase();
  const wantsGeneratedHero = imageMode === "source-reframe" || imageMode === "generated-editorial" || imageMode === "native-editorial";
  const heroInput = input.heroImage?.dataUrl || input.heroImage?.file || input.heroImage?.path || input.image?.path || existing?.image?.path || existing?.imagePath || "";
  if (wantsGeneratedHero && !heroInput) {
    errors.push("Native editorial image generation is handled outside the publisher. Provide heroImage.path, heroImage.file, or heroImage.dataUrl from the chat-native image tool before publishing.");
    return null;
  }
  if (heroInput) {
    if (!input.heroImage?.dataUrl && !input.heroImage?.file && isPublicImagePath(heroInput)) {
      const image = {
        path: heroInput,
        alt: clean(input.heroImage?.alt || existing?.image?.alt || `${title} hero image`),
        caption: clean(input.heroImage?.caption || existing?.image?.caption || ""),
        credit: clean(input.heroImage?.credit || existing?.image?.credit || ""),
        mode: imageMode || "approved-local",
        sizeBytes: await publicSize(heroInput),
      };
      validateHeroImage(image, errors);
      return image;
    }
    const image = await optimizeImage(heroInput, `${routeSlug}-hero.jpg`, title, input.heroImage?.alt || existing?.image?.alt || `${title} hero image`, input.heroImage?.caption || existing?.image?.caption || "", input.heroImage?.credit || existing?.image?.credit || "", assetOutputDir(mode, destination, routeSlug), assetPublicPath(mode, `${routeSlug}-hero.jpg`));
    image.mode = imageMode || "provided-editorial";
    validateHeroImage(image, errors);
    return image;
  }
  errors.push("A meaningful hero image is required. Provide an approved local public path or a generated/editorial heroImage dataUrl, file, or path.");
  return null;
}

function validateHeroImage(image, errors) {
  if (!image.path || !image.sizeBytes) errors.push("Hero image could not be found or optimized.");
  if (!image.alt) errors.push("Hero image alt text is required.");
  if (!image.caption) errors.push("Hero image caption is required.");
  if (!image.credit) errors.push("Hero image credit is required.");
  if (image.sizeBytes > imageBudgetBytes) errors.push(`Hero image ${image.path} exceeds the ${Math.round(imageBudgetBytes / 1024)} KB editorial budget.`);
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
  const files = [
    "public/assets/editorial",
    // news:refresh regenerates this shared intelligence set for every route.
    "public/data/answer-engine-faq.json",
    "public/data/floorplans.json",
    "public/data/image-clearance-candidates.json",
    "public/data/news-feed.json",
    "public/data/project-asset-status.json",
    "public/data/project-team-credits.json",
    "public/data/published-floorplan-assets.json",
    "public/feed.json",
    "public/rss.xml",
    "public/llms.txt",
    "public/sitemap.xml",
    "research/source-material-review/image-candidate-catalog.json",
    "src/generated/siteData.ts",
  ];
  if (destination === "news") {
    files.push("research/news-review/approved-development-news.json", "src/data/approvedExternalNews.ts");
  } else {
    files.push("src/data/marketNotes.ts");
  }
  return files;
}

function rollbackOutputPaths({ destination, normalized }) {
  const files = articleOutputPaths({ destination }).filter((file) => file !== "public/assets/editorial");
  for (const image of [normalized.heroImage, ...(normalized.bodyImages?.values || [])].filter(Boolean)) {
    const fileName = path.basename(image.path || "");
    if (fileName && !isPublicImagePath(image.path)) files.push(`public/assets/editorial/${fileName}`);
  }
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
  files.add(destination === "news" ? "research/news-review/approved-development-news.json" : "src/data/marketNotes.ts");
  if (destination === "news") files.add("src/data/approvedExternalNews.ts");
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

function marketSourceType(value) {
  const sourceType = clean(value).toLowerCase();
  if (sourceType.includes("city") || sourceType.includes("planning")) return "city planning material";
  if (sourceType.includes("developer") || sourceType.includes("official") || sourceType.includes("business") || sourceType.includes("district")) return "official project site";
  if (sourceType.includes("market")) return "market report";
  if (sourceType.includes("legal") || sourceType.includes("filing")) return "official legal source";
  return "local news coverage";
}

async function verifyLiveArticle({ routePath, title, heroImage, bodyImages = [] }) {
  const articleUrl = `https://www.wpbnewconstruction.com${routePath}`;
  const response = await fetch(articleUrl, { redirect: "follow" });
  if (!response.ok) fail(`Live article verification failed: ${articleUrl} returned HTTP ${response.status}.`);
  const html = await response.text();
  if (!html.includes(title)) fail(`Live article verification failed: title was not found at ${articleUrl}.`);
  const images = [heroImage, ...bodyImages].filter(Boolean);
  for (const [index, image] of images.entries()) {
    const label = index === 0 ? "hero image" : `body image ${index}`;
    if (!image.path || !html.includes(image.path)) fail(`Live article verification failed: expected ${label} was not found at ${articleUrl}.`);
    const imageUrl = new URL(image.path, articleUrl);
    const imageResponse = await fetch(imageUrl, { method: "HEAD", redirect: "follow" });
    if (!imageResponse.ok || !String(imageResponse.headers.get("content-type") || "").startsWith("image/")) {
      fail(`Live article verification failed: ${label} ${imageUrl} did not return an image response.`);
    }
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
  const errors = preview.errors.map((error) => `<li>${escapeHtml(error)}</li>`).join("");
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
          <h2>Errors</h2>
          ${errors ? `<ul>${errors}</ul>` : "<p>No errors.</p>"}
        </section>
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
  return runForSafety("git", ["status", "--short"]).then((result) => result.stdout);
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
  throw new PublishSafetyError(message, { reason: "workflow-validation" });
}

function run(command, args, options = {}) {
  const commandEnv = options.env || process.env;
  return runBoundedCommand(command, args, {
    cwd: workspace,
    env: commandEnv,
    signal: commandAbort.signal,
    idleTimeoutMs: options.idleTimeoutMs ?? numberFromEnv("ARTICLE_PUBLISH_IDLE_TIMEOUT_MS", 180_000),
    absoluteTimeoutMs: options.absoluteTimeoutMs ?? numberFromEnv("ARTICLE_PUBLISH_ABSOLUTE_TIMEOUT_MS", 1_200_000),
    heartbeatMs: options.heartbeatMs ?? numberFromEnv("ARTICLE_PUBLISH_HEARTBEAT_MS", 30_000),
    onStdout: (text) => process.stdout.write(text),
    onStderr: (text) => process.stderr.write(text),
    onHeartbeat: ({ command: runningCommand, args: runningArgs, elapsedMs, silentMs }) => {
      process.stderr.write(`[article-publish] ${runningCommand} ${runningArgs.join(" ")} still running; elapsed ${Math.round(elapsedMs / 1000)}s, quiet ${Math.round(silentMs / 1000)}s.\n`);
    },
  });
}

async function runChecked(command, args, options = {}) {
  const result = await run(command, args, options);
  if (result.code !== 0) {
    const detail = result.terminationReason ? ` (${result.terminationReason})` : "";
    throw new PublishSafetyError(`${command} ${args.join(" ")} failed with code ${result.code}${detail}`, {
      reason: result.terminationReason || "command-failed",
    });
  }
  return result;
}

function runForSafety(command, args) {
  return runBoundedCommand(command, args, {
    cwd: workspace,
    signal: commandAbort.signal,
    idleTimeoutMs: 30_000,
    absoluteTimeoutMs: 60_000,
    heartbeatMs: 0,
  });
}

function runForRollback(command, args) {
  return runBoundedCommand(command, args, {
    cwd: workspace,
    idleTimeoutMs: 30_000,
    absoluteTimeoutMs: 60_000,
    heartbeatMs: 0,
  });
}

function numberFromEnv(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}
