import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import sharp from "sharp";
import { syncEditorOverrides } from "../../research/scripts/sync-editor-overrides.mjs";
import { newsletterDraftsPath, readDraftStore, readJsonFile as readNewsJsonFile, writeDraftStore } from "../../research/scripts/news-draft-utils.mjs";
import { buildProjectIntelligenceReviewQueue, getProjectIntelligence } from "../../src/lib/projectIntelligence.ts";
import { projectIntelligenceRegistryEntries } from "../../src/lib/projectIntelligenceRegistry.ts";

const workspace = process.cwd();
const studioRoot = path.join(workspace, "tools/content-studio");
const overridesRoot = path.join(workspace, "content/overrides");
const legacyEditorOverridesPath = path.join(workspace, "research/content-editor/site-overrides.json");
const changeLogPath = path.join(overridesRoot, "change-log.json");
const builderChangeLogPath = path.join(overridesRoot, "content-studio-change-log.json");
const port = Number(process.env.WPB_CONTENT_STUDIO_PORT ?? 8787);
const viteDevPort = Number(process.env.WPB_VITE_PORT ?? 5174);
const viteDevUrl = `http://localhost:${viteDevPort}`;
let viteReady = false;
let viteProcess = null;
const launchAgentRoot = path.join(process.env.HOME ?? "", "Library/LaunchAgents");
const articleDraftsRoot = path.join(workspace, ".runtime", "article-drafts");
const articlePreviewLogPath = path.join(workspace, ".runtime", "article-preview-log.json");
const articleWorkflowLogPath = path.join(workspace, ".runtime", "article-workflow-log.json");
const newsDraftActionLogPath = path.join(workspace, ".runtime", "news-draft-action-log.json");
const articleSitePreviewsRoot = path.join(workspace, ".runtime", "article-site-previews");
const articleSitePreviewAssetsRoot = path.join(articleSitePreviewsRoot, "assets");
const approvedNewsPath = path.join(workspace, "research/news-review/approved-development-news.json");
const marketNotesSourcePath = path.join(workspace, "src/data/marketNotes.ts");
const remoteHostnames = ["builder.wpbnewconstruction.com", "brooke-builder.wpbnewconstruction.com"];
const reportDefinitions = [
  { category: "Visual Audits", path: "research/source-material-review/card-level-visual-polish-audit.md" },
  { category: "Visual Audits", path: "research/source-material-review/live-visual-product-audit.md" },
  { category: "Visual Audits", path: "research/source-material-review/image-repetition-audit.md" },
  { category: "News / Automation", path: "research/source-material-review/news-publisher-report.md" },
  { category: "News / Automation", path: "research/source-material-review/news-daily-publisher-report.md" },
  { category: "News / Automation", path: "research/source-material-review/daily-maintenance-report.md" },
  { category: "QA", path: "research/source-material-review/brooke-builder-update-site-test.md" },
  { category: "Floorplans / Images", path: "research/source-material-review/floorplan-viewer-ux.md" },
  { category: "Floorplans / Images", path: "research/source-material-review/project-link-out-cleanup.md" },
  { category: "Deployment", path: "research/source-material-review/brooke-builder-remote-access-feasibility.md" },
  { category: "Deployment", path: "research/source-material-review/builder-remote-report-focal-point-audit.md" },
  { category: "Deployment", path: "research/source-material-review/remote-builder-image-loading-fix.md" },
  { category: "Visual Audits", path: "research/source-material-review/brooke-builder-live-preview-before.md" },
  { category: "Visual Audits", path: "research/source-material-review/brooke-builder-live-preview-after.md" },
  { category: "Visual Audits", path: "research/source-material-review/brooke-builder-visual-overlay-before.md" },
  { category: "Visual Audits", path: "research/source-material-review/brooke-builder-visual-overlay-after.md" },
];

const overrideFiles = {
  projectCopy: "project-copy-overrides.json",
  pageCopy: "page-copy-overrides.json",
  projectImages: "project-image-overrides.json",
  projectFactOverrides: "project-fact-overrides.json",
  homepage: "homepage-overrides.json",
  homepageCards: "homepage-card-overrides.json",
  imageCaptions: "image-caption-overrides.json",
  editorialImages: "editorial-image-overrides.json",
  marketNotes: "market-note-overrides.json",
  updates: "update-overrides.json",
  projectUpdates: "project-update-overrides.json",
  teamResources: "team-resource-overrides.json",
};

const targetPaths = {
  projectHero: ({ projectId, slug }) => `public/projects/${projectId}/media/user-provided-${slug}.jpg`,
  projectCard: ({ projectId, slug }) => `public/projects/${projectId}/media/user-provided-${slug}.jpg`,
  projectGallery: ({ projectId, slug }) => `public/projects/${projectId}/media/imported/${slug}.jpg`,
  editorial: ({ slug }) => `public/assets/editorial/${slug}.jpg`,
  marketNote: ({ slug }) => `public/assets/editorial/${slug}.jpg`,
  update: ({ slug }) => `public/assets/editorial/${slug}.jpg`,
  team: ({ projectId, roleSlug, slug }) => `public/team-resources/${projectId}/${roleSlug}-${slug}.jpg`,
  buyerInterior: ({ slug }) => `public/assets/editorial/${slug}.jpg`,
};

async function main() {
  const server = http.createServer(async (request, response) => {
    try {
      const url = new URL(request.url ?? "/", `http://${request.headers.host}`);
      if (request.method === "GET" && url.pathname === "/") return sendFile(response, "index.html", "text/html; charset=utf-8");
      if (request.method === "GET" && url.pathname === "/app.js") return sendFile(response, "app.js", "text/javascript; charset=utf-8");
      if (request.method === "GET" && url.pathname === "/style.css") return sendFile(response, "style.css", "text/css; charset=utf-8");
      if (request.method === "GET" && url.pathname === "/favicon.ico") return sendText(response, "", 204);
      if (request.method === "GET" && await maybeSendPublicAsset(url.pathname, response)) return;
      if (request.method === "GET" && url.pathname === "/api/state") return sendJson(response, await state(request));
      if (request.method === "GET" && url.pathname === "/api/reports") return sendJson(response, await reportsIndex());
      if (request.method === "GET" && url.pathname === "/api/report") return sendJson(response, await reportBody(url.searchParams.get("path")));
      if (request.method === "GET" && url.pathname === "/api/project-intelligence") return sendJson(response, await projectIntelligenceReview());
      if (request.method === "POST" && url.pathname === "/api/project-fact-override") return saveProjectFactOverride(request, response);
      if (request.method === "POST" && url.pathname === "/api/project-copy") return saveProjectCopy(request, response);
      if (request.method === "POST" && url.pathname === "/api/page-copy") return savePageCopy(request, response);
      if (request.method === "POST" && url.pathname === "/api/homepage-overrides") return saveHomepageOverrides(request, response);
      if (request.method === "POST" && url.pathname === "/api/homepage-card-overrides") return saveHomepageCardOverride(request, response);
      if (request.method === "POST" && url.pathname === "/api/upload-image") return uploadImage(request, response);
      if (request.method === "POST" && url.pathname === "/api/image-caption") return saveImageCaption(request, response);
      if (request.method === "POST" && url.pathname === "/api/project-update") return saveProjectUpdate(request, response);
      if (request.method === "POST" && url.pathname === "/api/team-resource") return saveTeamResource(request, response);
      if (request.method === "POST" && url.pathname === "/api/news-draft") return saveNewsDraft(request, response);
      if (request.method === "POST" && url.pathname === "/api/manual-article") return publishManualArticle(request, response);
      if (request.method === "POST" && url.pathname === "/api/run-workflow") return runWorkflow(request, response);
      if (request.method === "GET" && url.pathname === "/api/articles") return listArticles(request, response, url);
      if (request.method === "GET" && url.pathname === "/api/article") return getArticle(request, response, url);
      if (request.method === "POST" && url.pathname === "/api/article/save-draft") return saveArticleDraft(request, response);
      if (request.method === "POST" && url.pathname === "/api/article/archive") return archiveArticle(request, response);
      if (request.method === "POST" && url.pathname === "/api/article/delete") return deletePublishedArticle(request, response);
      if (request.method === "POST" && url.pathname === "/api/article/delete-draft") return deleteArticleDraft(request, response);
      if (request.method === "POST" && url.pathname === "/api/article/preview") return previewArticle(request, response);
      if (request.method === "POST" && url.pathname === "/api/article/publish") return publishManualArticle(request, response);
      if (request.method === "POST" && url.pathname === "/api/article/import-package/validate") return validateImportPackage(request, response);
      if (request.method === "POST" && url.pathname === "/api/article/import-package/create-draft") return createImportDraft(request, response);
      if (request.method === "POST" && url.pathname === "/api/article/site-preview") return createSitePreview(request, response);
      if (request.method === "GET" && url.pathname === "/api/article/site-preview") return getSitePreview(request, response, url);
      if (request.method === "GET" && url.pathname.startsWith("/api/article/site-preview-asset/")) return serveSitePreviewAsset(request, response, url);
      if (request.method === "POST" && url.pathname === "/api/article/commit-staged") return commitStagedArticle(request, response);
      if (request.method === "GET" && url.pathname === "/api/vite-status") return sendJson(response, { ok: true, ready: viteReady, url: viteDevUrl, port: viteDevPort });
      if (request.method === "POST" && url.pathname === "/api/visual-editor/save-project-override") return saveVisualProjectOverride(request, response);
      if (request.method === "POST" && url.pathname === "/api/visual-editor/pre-commit-check") return visualEditorPreCommitCheck(request, response);
      if (request.method === "POST" && url.pathname === "/api/visual-editor/commit") return visualEditorCommit(request, response);
      return sendText(response, "Not found", 404);
    } catch (error) {
      return sendJson(response, { ok: false, error: error.message }, 500);
    }
  });

  server.listen(port, "127.0.0.1", () => {
    console.log(`Brooke Builder running at http://127.0.0.1:${port}`);
    console.log("Local editorial tool only. Review Git diff before publishing.");
    startViteDev();
  });

  function startViteDev() {
    const viteBin = path.resolve(workspace, "node_modules/vite/bin/vite.js");
    viteProcess = spawn(process.execPath, [viteBin, "--port", String(viteDevPort), "--strictPort"], {
      cwd: workspace,
      env: { ...process.env },
      stdio: ["ignore", "pipe", "pipe"],
    });
    viteProcess.stdout?.on("data", (chunk) => {
      const text = String(chunk);
      if (text.includes("ready") || text.includes("localhost")) {
        viteReady = true;
        console.log(`Vite dev server ready at ${viteDevUrl}`);
      }
    });
    viteProcess.stderr?.on("data", () => {});
    viteProcess.on("error", (err) => console.error("Vite dev server error:", err.message));
    viteProcess.on("close", (code) => {
      viteReady = false;
      if (code !== 0 && code !== null) console.error(`Vite dev server exited (code ${code})`);
    });
    // Poll until Vite responds (up to 30 s), then mark ready even if stdout didn't confirm
    const startTime = Date.now();
    const pollVite = () => {
      if (viteReady || Date.now() - startTime > 30000) return;
      http.get(`${viteDevUrl}/`, (res) => {
        if (res.statusCode && res.statusCode < 500) { viteReady = true; console.log(`Vite dev server ready at ${viteDevUrl}`); }
        else setTimeout(pollVite, 2000);
      }).on("error", () => setTimeout(pollVite, 2000));
    };
    setTimeout(pollVite, 3000);
  }

  const shutdown = () => {
    if (viteProcess) { viteProcess.kill(); viteProcess = null; }
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

async function state(request) {
  const remote = remoteContext(request);
  const liveBase = "https://www.wpbnewconstruction.com";
  const localBase = remote.isRemote ? liveBase : viteDevUrl;
  return {
    ok: true,
    remote,
    viteDevUrl: remote.isRemote ? null : viteDevUrl,
    viteReady,
    assetBaseUrl: remote.isRemote ? liveBase : "",
    previewUrls: {
      homepage: `${localBase}/`,
      updates: `${localBase}/updates/`,
      guidance: `${localBase}/answers/`,
      market: `${localBase}/market-notes/`,
      floorplans: `${localBase}/floorplans/`,
      projectBase: `${localBase}/projects/`,
    },
    projects: await readProjects(),
    overrides: await readAllOverrides(),
    availableImages: await availablePublicImages(),
    imageCatalog: await imageCatalog(),
    homepageCards: await homepageCardInventory(),
    news: await readDraftStore(),
    newsletter: await readNewsJsonFile(newsletterDraftsPath, { version: 1, updatedAt: "", items: [] }),
    automation: await automationStatus(),
    projectIntelligence: await projectIntelligenceReview(),
    statusCards: await statusCards(remote),
    warning: remote.isRemote
      ? "Remote Builder Mode - connected through Cloudflare Access. Extra confirmation required before publishing."
      : "Local editorial tool. Changes write to repo files. Review Git diff before publishing.",
  };
}

async function saveHomepageOverrides(request, response) {
  const body = await readJson(request);
  const validation = validatePublicFields(body, ["sectionId", "headline", "subhead", "caption", "alt"]);
  if (validation.length) return sendJson(response, { ok: false, error: validation.join(" ") }, 400);
  const sectionId = slug(body.sectionId || body.assignedSection || "homepage");
  const imagePath = clean(body.imagePath);
  const overrides = await readOverride("homepage");
  overrides.sections[sectionId] = {
    sectionId,
    imagePath,
    caption: clean(body.caption),
    alt: clean(body.alt),
    headline: clean(body.headline),
    subhead: clean(body.subhead),
    status: body.status === "approved" ? "approved" : "needs_review",
    updatedAt: new Date().toISOString(),
  };
  await writeOverride("homepage", overrides);
  if (imagePath || body.caption || body.alt) {
    const captions = await readOverride("imageCaptions");
    captions.items = upsertBy(captions.items ?? [], "imagePath", {
      imagePath,
      caption: clean(body.caption),
      alt: clean(body.alt),
      status: body.status === "approved" ? "approved" : "needs_review",
      assignedSection: sectionId,
      updatedAt: new Date().toISOString(),
    });
    await writeOverride("imageCaptions", captions);
  }
  await logChange("homepage-overrides", { sectionId, imagePath, status: overrides.sections[sectionId].status });
  return sendJson(response, { ok: true, item: overrides.sections[sectionId] });
}

async function saveHomepageCardOverride(request, response) {
  const body = await readJson(request);
  const validation = validatePublicFields(body, ["sectionId", "cardId", "headline", "subhead", "deck", "caption", "alt", "ctaLabel"]);
  if (validation.length) return sendJson(response, { ok: false, error: validation.join(" ") }, 400);
  const sectionId = homepageSectionId(body.sectionId);
  const cardId = clean(body.cardId || body.itemId);
  if (!sectionId || !cardId) return sendJson(response, { ok: false, error: "sectionId and cardId are required" }, 400);
  const overrides = await readOverride("homepageCards");
  overrides.sections[sectionId] = overrides.sections[sectionId] ?? { cards: {} };
  if (body.action === "revert") {
    delete overrides.sections[sectionId].cards[cardId];
  } else {
    const focalPoint = normalizeFocalPoint(body);
    const imagePosition = imagePositionFromBody(body, focalPoint);
    overrides.sections[sectionId].cards[cardId] = {
      imagePath: clean(body.imagePath),
      caption: clean(body.caption),
      alt: clean(body.alt),
      headline: clean(body.headline),
      subhead: clean(body.subhead),
      deck: clean(body.deck),
      ctaLabel: clean(body.ctaLabel),
      objectFit: ["cover", "contain"].includes(clean(body.objectFit)) ? clean(body.objectFit) : "cover",
      imagePosition,
      focalPoint,
      allowRepeatedImage: body.allowRepeatedImage === true || body.allowRepeatedImage === "true" || body.allowRepeatedImage === "on",
      repetitionApprovalReason: clean(body.repetitionApprovalReason),
      status: body.status === "approved" ? "approved" : "draft",
      updatedAt: new Date().toISOString(),
    };
    if (overrides.sections[sectionId].cards[cardId].allowRepeatedImage && !overrides.sections[sectionId].cards[cardId].repetitionApprovalReason) {
      return sendJson(response, { ok: false, error: "Intentional repeated image approval requires a reason." }, 400);
    }
  }
  await writeOverride("homepageCards", overrides);
  const entry = overrides.sections[sectionId].cards[cardId];
  if (entry?.imagePath || entry?.caption || entry?.alt) {
    const captions = await readOverride("imageCaptions");
    captions.items = upsertBy(captions.items ?? [], "imagePath", {
      imagePath: entry.imagePath,
      caption: entry.caption,
      alt: entry.alt,
      status: entry.status === "approved" ? "approved" : "needs_review",
      assignedSection: `homepage:${sectionId}:${cardId}`,
      updatedAt: entry.updatedAt,
    });
    await writeOverride("imageCaptions", captions);
  }
  await logChange(body.action === "revert" ? "homepage-card-revert" : "homepage-card-override", { sectionId, cardId, status: entry?.status ?? "reverted" });
  return sendJson(response, { ok: true, sectionId, cardId, item: entry ?? null, overrides });
}

async function saveProjectCopy(request, response) {
  const body = await readJson(request);
  const projectId = slug(body.projectId);
  if (!projectId) return sendJson(response, { ok: false, error: "projectId is required" }, 400);
  const overrides = await readOverride("projectCopy");
  const validation = validatePublicFields(body, ["summary", "editorialIntro", "buyerFit", "missingInfo", "projectPageUpdateText", "ctaSupportCopy", "projectFactsNotes"]);
  if (validation.length) return sendJson(response, { ok: false, error: validation.join(" ") }, 400);
  overrides.projects[projectId] = {
    ...(overrides.projects[projectId] ?? {}),
    summary: clean(body.summary),
    editorialIntro: clean(body.editorialIntro),
    buyerFit: clean(body.buyerFit),
    missingInfo: lines(body.missingInfo),
    projectPageUpdateText: clean(body.projectPageUpdateText),
    ctaSupportCopy: clean(body.ctaSupportCopy),
    projectFactsNotes: clean(body.projectFactsNotes),
    status: clean(body.status) || "needs_review",
  };
  await writeOverride("projectCopy", overrides);
  await syncLegacyProjectOverrides(overrides);
  await logChange("project-copy", { projectId, status: overrides.projects[projectId].status });
  return sendJson(response, { ok: true, overrides });
}

async function saveProjectFactOverride(request, response) {
  const body = await readJson(request);
  const projectSlug = slug(body.projectSlug || body.projectId || "");
  const field = clean(body.field);
  const value = clean(body.value);
  if (!projectSlug) return sendJson(response, { ok: false, error: "projectSlug is required" }, 400);
  if (!field) return sendJson(response, { ok: false, error: "field is required" }, 400);
  if (!value) return sendJson(response, { ok: false, error: "value is required" }, 400);
  const overrides = await readOverride("projectFactOverrides");
  overrides.projects[projectSlug] = overrides.projects[projectSlug] ?? {};
  overrides.projects[projectSlug][field] = {
    value,
    source: "manual_review",
    preferredFrom: clean(body.preferredFrom) || "custom",
    reviewedBy: clean(body.reviewedBy || "Brooke") || "Brooke",
    reviewedAt: new Date().toISOString(),
    note: clean(body.note),
    schemaSafe: body.schemaSafe === true || body.schemaSafe === "true",
  };
  await writeOverride("projectFactOverrides", overrides);
  await logChange("project-fact-override", { projectSlug, field, schemaSafe: overrides.projects[projectSlug][field].schemaSafe });
  return sendJson(response, { ok: true, overrides, item: overrides.projects[projectSlug][field] });
}

async function savePageCopy(request, response) {
  const body = await readJson(request);
  const pageId = slug(body.pageId || body.route || "homepage");
  const validation = validatePublicFields(body, ["headline", "subhead", "bodyCopy", "cta"]);
  if (validation.length) return sendJson(response, { ok: false, error: validation.join(" ") }, 400);
  const overrides = await readOverride("pageCopy");
  overrides.pages[pageId] = {
    route: clean(body.route) || "/",
    section: clean(body.section) || "homepage",
    headline: clean(body.headline),
    subhead: clean(body.subhead),
    bodyCopy: clean(body.bodyCopy),
    cta: clean(body.cta),
    status: body.status === "approved" ? "approved" : "needs_review",
    updatedAt: new Date().toISOString(),
  };
  await writeOverride("pageCopy", overrides);
  await logChange("page-copy", { pageId, status: overrides.pages[pageId].status });
  return sendJson(response, { ok: true, item: overrides.pages[pageId] });
}

async function uploadImage(request, response) {
  const body = await readJson(request, 15 * 1024 * 1024);
  const targetType = clean(body.targetType) || "projectGallery";
  const projectId = slug(body.projectId);
  const imageSlug = slug(body.slug || body.caption || body.fileName || "content-studio-image");
  const roleSlug = slug(body.role || "team");
  const resolver = targetPaths[targetType];
  if (!resolver) return sendJson(response, { ok: false, error: `Unsupported target type: ${targetType}` }, 400);
  if (targetType.startsWith("project") && !projectId) return sendJson(response, { ok: false, error: "projectId is required for project images" }, 400);
  if (targetType === "team" && !projectId) return sendJson(response, { ok: false, error: "projectId is required for team images" }, 400);
  const match = String(body.dataUrl ?? "").match(/^data:image\/[a-z0-9.+-]+;base64,(.+)$/i);
  if (!match) return sendJson(response, { ok: false, error: "dataUrl image payload is required" }, 400);

  const relativePath = resolver({ projectId, slug: imageSlug, roleSlug });
  const outputPath = path.join(workspace, relativePath);
  const tempPath = `${outputPath}.upload`;
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(tempPath, Buffer.from(match[1], "base64"));
  await optimizeImage(tempPath, outputPath, maxWidthFor(targetType));
  await fs.rm(tempPath, { force: true });

  const overrides = await readOverride("projectImages");
  const entry = {
    id: `${Date.now()}-${imageSlug}`,
    targetType,
    projectId,
    path: `/${relativePath.replace(/^public\//, "")}`,
    caption: clean(body.caption),
    alt: clean(body.alt),
    sourceRightsNote: clean(body.sourceRightsNote),
    imageType: clean(body.imageType) || targetType,
    status: body.status === "approved" ? "approved" : "needs_review",
    updatedAt: new Date().toISOString(),
  };
  overrides.images = [...(overrides.images ?? []), entry];
  await writeOverride("projectImages", overrides);
  await appendImageCaptionOverride(entry);
  await logChange("image-upload", entry);
  return sendJson(response, { ok: true, entry });
}

async function saveImageCaption(request, response) {
  const body = await readJson(request);
  const imagePath = clean(body.imagePath);
  if (!imagePath) return sendJson(response, { ok: false, error: "imagePath is required" }, 400);
  const entry = {
    imagePath,
    caption: clean(body.caption),
    alt: clean(body.alt),
    credit: clean(body.credit || body.sourceRightsNote),
    status: body.status === "approved" ? "approved" : "needs_review",
    assignedSection: clean(body.assignedSection),
    assignedProject: slug(body.assignedProject || body.projectId),
    assignedCorridor: slug(body.assignedCorridor),
    updatedAt: new Date().toISOString(),
  };
  const captions = await readOverride("imageCaptions");
  captions.items = upsertBy(captions.items ?? [], "imagePath", entry);
  await writeOverride("imageCaptions", captions);
  await logChange("image-caption", { imagePath, status: entry.status });
  return sendJson(response, { ok: true, entry });
}

async function saveProjectUpdate(request, response) {
  const body = await readJson(request);
  const projectId = slug(body.projectId);
  if (!projectId) return sendJson(response, { ok: false, error: "projectId is required" }, 400);
  const overrides = await readOverride("updates");
  overrides.projectUpdates[projectId] = overrides.projectUpdates[projectId] ?? [];
  const entry = {
    date: clean(body.date) || new Date().toISOString().slice(0, 10),
    title: clean(body.title),
    summary: clean(body.summary),
    sourceName: clean(body.sourceName),
    sourceUrl: clean(body.sourceUrl),
    status: body.status === "approved" ? "approved" : body.status === "rejected" ? "rejected" : "needs_review",
  };
  overrides.projectUpdates[projectId].push(entry);
  await writeOverride("updates", overrides);
  const projectUpdates = await readOverride("projectUpdates");
  projectUpdates.projects[projectId] = [...(projectUpdates.projects[projectId] ?? []), { ...entry, updatedAt: new Date().toISOString() }];
  await writeOverride("projectUpdates", projectUpdates);
  await logChange("project-update", { projectId, title: entry.title, status: entry.status });
  return sendJson(response, { ok: true, entry });
}

async function saveTeamResource(request, response) {
  const body = await readJson(request);
  const projectId = slug(body.projectId);
  const entry = {
    projectId,
    role: clean(body.role) || "Other",
    name: clean(body.name),
    websiteUrl: clean(body.websiteUrl),
    imagePath: clean(body.imagePath),
    caption: clean(body.caption),
    sourceUrl: clean(body.sourceUrl),
    status: body.status === "approved" ? "approved" : "needs_review",
  };
  if (!projectId || !entry.name) return sendJson(response, { ok: false, error: "projectId and name are required" }, 400);
  const overrides = await readOverride("teamResources");
  overrides.teamResources = [...(overrides.teamResources ?? []), entry];
  await writeOverride("teamResources", overrides);
  await logChange("team-resource", { projectId, role: entry.role, name: entry.name, status: entry.status });
  return sendJson(response, { ok: true, entry });
}

async function saveNewsDraft(request, response) {
  const body = await readJson(request);
  const store = await readDraftStore();
  const draft = store.items.find((item) => item.id === body.id);
  if (!draft) return sendJson(response, { ok: false, error: "News draft not found." }, 404);
  const nextStatus = clean(body.status || draft.status);
  if (!["draft", "queued", "scheduled", "published", "blocked", "needs_review", "archived"].includes(nextStatus)) {
    return sendJson(response, { ok: false, error: `Invalid status: ${nextStatus}` }, 400);
  }
  if (draft.riskLevel === "high" && ["queued", "scheduled", "published"].includes(nextStatus)) {
    return sendJson(response, { ok: false, error: "High-risk drafts require manual review and cannot be queued, scheduled, or published from News Desk quick actions." }, 400);
  }
  draft.rewrittenHeadline = clean(body.rewrittenHeadline || draft.rewrittenHeadline);
  draft.deck = clean(body.deck || draft.deck);
  draft.bodySections = parseBodySections(body.bodySectionsText, draft.bodySections);
  draft.buyerTakeaway = clean(body.buyerTakeaway || draft.buyerTakeaway);
  draft.cta = clean(body.cta || draft.cta);
  draft.newsletterBlurb = clean(body.newsletterBlurb || draft.newsletterBlurb);
  draft.sourceUrl = clean(body.sourceUrl || draft.sourceUrl);
  draft.sourceName = clean(body.sourceName || draft.sourceName);
  draft.suggestedImagePath = clean(body.suggestedImagePath || draft.suggestedImagePath);
  draft.imageResolutionReason = clean(body.imageResolutionReason || draft.imageResolutionReason);
  draft.scheduledAt = nextStatus === "scheduled" ? clean(body.scheduledAt || draft.scheduledAt) : draft.scheduledAt;
  draft.newsletterStatus = body.sendToNewsletter === true || body.sendToNewsletter === "true" ? "ready_for_digest" : draft.newsletterStatus;
  draft.status = nextStatus;
  draft.updatedAt = new Date().toISOString();
  await writeDraftStore(store);
  await logNewsDraftAction("news-draft", { id: draft.id, status: draft.status, newsletterStatus: draft.newsletterStatus });
  return sendJson(response, { ok: true, draft, changedFiles: await changedFiles(), nextStep: nextStepForNewsDraft(draft) });
}

async function publishManualArticle(request, response) {
  const body = await readJson(request, 60 * 1024 * 1024);
  return runArticleWorkflow(body, request, response);
}

async function previewArticle(request, response) {
  const body = await readJson(request, 60 * 1024 * 1024);
  body.mode = "preview";
  return runArticleWorkflow(body, request, response);
}

async function runArticleWorkflow(body, request, response) {
  const remote = remoteContext(request);
  const mode = clean(body.mode || body.workflowMode || body.publishMode || "stage");
  if (remote.isRemote && body.confirmRemote !== true) {
    return sendJson(response, { ok: false, error: "Remote Builder Mode requires the remote confirmation checkbox before publishing." }, 400);
  }
  if (mode === "publish" || mode === "ship") {
    if (body.confirmPublish !== true) {
      return sendJson(response, { ok: false, error: "Check the publish confirmation box before running commit, push, and deploy." }, 400);
    }
  }
  if (body.triggerDeploy === true && body.confirmDeploy !== true) {
    return sendJson(response, { ok: false, error: "Check the deploy confirmation box before triggering a live deploy." }, 400);
  }
  const dirty = await run("git", ["status", "--short"]);
  if (dirty.stdout.trim()) {
    const dirtyLines = dirty.stdout.trim().split("\n").filter(Boolean);
    const dirtyFiles = dirtyLines.map((line) => {
      const match = line.match(/^(..?)\s+(.*)$/);
      return match ? match[2].trim() : line.trim();
    });
    const disallowed = dirtyFiles.filter((f) => !isInArticleAllowlist(f));
    if (disallowed.length) {
      return sendJson(response, { ok: false, error: `The repo has unrelated changes. Review or clear them first: ${disallowed.join("; ")}` }, 400);
    }
    return sendJson(response, {
      ok: false,
      error: "Stage has already generated article output files. Review them, then click 'Commit Staged Article Changes' to commit and push, or clear the changes to run Publish From Clean State.",
      stagedFiles: dirtyFiles,
      nextStep: "commit-staged",
    }, 400);
  }
  const inputDir = path.join(workspace, ".runtime", "manual-article-publisher");
  await fs.mkdir(inputDir, { recursive: true });
  const inputPath = path.join(inputDir, `article-${Date.now()}.json`);
  await fs.writeFile(inputPath, `${JSON.stringify(body, null, 2)}\n`);
  const args = ["research/scripts/article-publish-cli.mjs", "--input", path.relative(workspace, inputPath)];
  if (mode === "preview") args.push("--preview");
  else if (mode === "stage") args.push("--stage");
  else if (mode === "publish") args.push("--publish");
  else if (mode === "ship") args.push("--publish", "--ship");
  const result = await run("node", args);
  if (mode === "preview") {
    await logPreviewRun(result.code === 0 ? "article-preview" : "article-preview-failed", {
      destination: body.destination,
      title: body.title,
      code: result.code,
    });
  } else {
    await logArticleWorkflow(result.code === 0 ? "article-published" : "article-publish-failed", {
      destination: body.destination,
      title: body.title,
      code: result.code,
    });
  }
  const parsed = parseTrailingJson(result.stdout);
  const responseBody = {
    ok: result.code === 0,
    result: parsed,
    warnings: parsed?.warnings ?? [],
    stdout: result.stdout.slice(-12000),
    stderr: result.stderr.slice(-12000),
    changedFiles: await changedFiles(),
  };

  if (result.code === 0 && body.triggerDeploy === true && (mode === "publish" || mode === "ship")) {
    const deployResult = await run("gh", ["workflow", "run", "deploy-cloudflare-pages.yml", "--ref", "main"]);
    if (deployResult.code !== 0) {
      responseBody.deployTriggered = false;
      responseBody.deployError = deployResult.stderr || deployResult.stdout || "gh workflow run returned a non-zero exit code.";
    } else {
      responseBody.deployTriggered = true;
      const runListResult = await run("gh", ["run", "list", "--workflow=deploy-cloudflare-pages.yml", "--limit", "1", "--json", "databaseId,url,status"]);
      let deployRunInfo = null;
      try {
        const runs = JSON.parse(runListResult.stdout);
        if (Array.isArray(runs) && runs.length > 0) deployRunInfo = runs[0];
      } catch { /* ignore JSON parse errors */ }
      if (deployRunInfo) {
        responseBody.deployRunId = deployRunInfo.databaseId;
        responseBody.deployRunUrl = deployRunInfo.url;
        responseBody.deployStatus = deployRunInfo.status;
      }
    }
  }

  return sendJson(response, responseBody, result.code === 0 ? 200 : 500);
}

async function listArticles(request, response, url) {
  const newsRaw = await readJsonFile(approvedNewsPath, []);
  const newsList = Array.isArray(newsRaw) ? newsRaw.map((item) => ({
    id: item.id,
    slug: item.slug || item.id,
    title: item.title || "(Untitled)",
    destination: "news",
    category: item.category || "general",
    status: item.status || "published",
    publishedAt: item.publishedAt || "",
    modifiedAt: item.fetchedAt || item.publishedAt || "",
    imagePath: item.imagePath || "",
    isDraft: false,
    draftId: null,
    source: "news",
  })) : [];
  const marketNotes = await readMarketNotes();
  const marketNotesList = marketNotes.map((note) => marketNoteToArticleListItem(note));
  const draftsList = await readAllArticleDrafts();
  const articles = [...draftsList, ...newsList, ...marketNotesList].sort((a, b) => {
    const dateDelta = articleListTimestamp(b) - articleListTimestamp(a);
    if (dateDelta !== 0) return dateDelta;
    return a.title.localeCompare(b.title);
  });
  return sendJson(response, {
    ok: true,
    articles,
    buyerDowntownNote: "Published News, Buyer Intelligence, and Downtown Spotlight articles are listed together with drafts.",
  });
}

async function readAllArticleDrafts() {
  const results = [];
  for (const dest of ["news", "buyer", "downtown"]) {
    const destDir = path.join(articleDraftsRoot, dest);
    const files = await fs.readdir(destDir).catch(() => []);
    for (const file of files.filter((f) => f.endsWith(".json"))) {
      const filePath = path.join(destDir, file);
      try {
        const content = JSON.parse(await fs.readFile(filePath, "utf8"));
        results.push({
          id: content.id || file.replace(".json", ""),
          slug: content.slug || "",
          title: content.title || "(Untitled draft)",
          destination: dest,
          category: content.category || "general",
          status: "draft",
          publishedAt: "",
          modifiedAt: content.savedAt || "",
          imagePath: "",
          isDraft: true,
          draftId: file.replace(".json", ""),
          source: "draft",
        });
      } catch {
        // skip corrupt draft files
      }
    }
  }
  return results;
}

async function getArticle(request, response, url) {
  const id = clean(url.searchParams.get("id") || "");
  const destination = clean(url.searchParams.get("destination") || "news");
  const draftId = clean(url.searchParams.get("draftId") || "");
  if (!id && !draftId) return sendJson(response, { ok: false, error: "id or draftId query parameter is required" }, 400);
  if (draftId) {
    const safeDraftId = draftId.replace(/[^a-z0-9_\-]/gi, "-").slice(0, 120);
    const draftPath = path.join(articleDraftsRoot, destination, `${safeDraftId}.json`);
    if (!draftPath.startsWith(articleDraftsRoot)) return sendJson(response, { ok: false, error: "Invalid draftId" }, 400);
    const raw = await fs.readFile(draftPath, "utf8").catch(() => null);
    if (!raw) return sendJson(response, { ok: false, error: "Draft not found" }, 404);
    return sendJson(response, { ok: true, article: JSON.parse(raw), source: "draft" });
  }
  if (destination === "news") {
    const newsRaw = await readJsonFile(approvedNewsPath, []);
    const article = Array.isArray(newsRaw) ? newsRaw.find((item) => item.id === id || item.slug === id) : null;
    if (!article) return sendJson(response, { ok: false, error: `Article not found: ${id}` }, 404);
    return sendJson(response, { ok: true, article, source: "approved-development-news" });
  }
  if (destination === "buyer" || destination === "downtown") {
    const marketNotes = await readMarketNotes();
    const article = marketNotes.find((item) => item.id === id || item.slug === id || item.seo?.suggestedSlug === id);
    if (!article) return sendJson(response, { ok: false, error: `Article not found: ${id}` }, 404);
    return sendJson(response, { ok: true, article: marketNoteToEditorArticle(article, destination), source: "market-notes" });
  }
  return sendJson(response, { ok: false, error: `Unsupported destination: ${destination}` }, 422);
}

async function saveArticleDraft(request, response) {
  const body = await readJson(request, 60 * 1024 * 1024);
  const destination = clean(body.destination || "news");
  if (!["news", "buyer", "downtown"].includes(destination)) {
    return sendJson(response, { ok: false, error: `Invalid destination: ${destination}` }, 400);
  }
  const rawId = clean(body.draftId || body.id || `draft-${Date.now()}`);
  const safeDraftId = rawId.replace(/[^a-z0-9_\-]/gi, "-").slice(0, 120);
  const destDir = path.join(articleDraftsRoot, destination);
  await fs.mkdir(destDir, { recursive: true });
  const draftPath = path.join(destDir, `${safeDraftId}.json`);
  if (!draftPath.startsWith(articleDraftsRoot)) {
    return sendJson(response, { ok: false, error: "Invalid draft path" }, 400);
  }
  const draft = { ...body, draftId: safeDraftId, savedAt: new Date().toISOString() };
  await fs.writeFile(draftPath, `${JSON.stringify(draft, null, 2)}\n`);
  return sendJson(response, { ok: true, draftId: safeDraftId, savedAt: draft.savedAt });
}

async function validateImportPackage(request, response) {
  const body = await readJson(request, 2 * 1024 * 1024);
  const pkg = body.package || {};
  const images = body.images || {};
  const errors = [];
  const warnings = [];

  // Required fields
  if (!clean(pkg.destination)) errors.push("destination is required.");
  if (!clean(pkg.title)) errors.push("title is required.");
  if (!clean(pkg.slug) && !clean(pkg.title)) errors.push("slug is required or must be generated from title.");

  // JSON parse check already done by readJson
  // Warn on missing fields
  if (!clean(pkg.deck)) warnings.push("deck is missing.");
  if (!clean(pkg.summary)) warnings.push("summary is missing.");
  if (!clean(pkg.description)) warnings.push("description is missing.");

  // Hero image check (metadata presence, not dataUrl)
  const heroKey = clean(pkg.heroImage?.uploadKey || "hero");
  if (!pkg.heroImage || !images[heroKey]) errors.push(`Article packages require an uploaded hero image matching uploadKey "${heroKey}".`);

  // Inline images consistency
  const placementIds = new Set();
  const imageUploadKeys = new Set();
  if (Array.isArray(pkg.images)) {
    for (const img of pkg.images) {
      const uploadKey = clean(img?.uploadKey);
      const placementId = clean(img?.placementId);
      if (uploadKey) imageUploadKeys.add(uploadKey);
      if (placementId) placementIds.add(placementId);
      if (uploadKey && !images[uploadKey]) {
        warnings.push(`images[].uploadKey "${uploadKey}" does not match an uploaded image.`);
      }
    }
  }
  if (!Array.isArray(pkg.images) || pkg.images.length < 1) {
    errors.push("Article packages require at least one uploaded inline image in addition to the hero image.");
  }

  // Large image warnings
  const LARGE_THRESHOLD = 5 * 1024 * 1024;
  for (const meta of Object.values(images)) {
    if (meta.size > LARGE_THRESHOLD) {
      warnings.push(`Image "${meta.fileName || meta.key}" (${(meta.size / 1024 / 1024).toFixed(1)} MB) is large. It will work, but may slow draft creation.`);
    }
  }

  // Section image placement checks
  if (pkg.body?.sections && Array.isArray(pkg.body.sections)) {
    for (const section of pkg.body.sections) {
      const placement = clean(section?.imagePlacement);
      if (placement && !placementIds.has(placement)) {
        errors.push(`Section "${clean(section.heading) || "(untitled)"}" references imagePlacement "${placement}" not defined in images[].placementId.`);
      }
    }
  }

  // Duplicate slug / id detection
  const checkSlug = slug(pkg.slug || pkg.title || "draft");
  const checkId = clean(pkg.id || checkSlug);
  const newsRaw = await readJsonFile(approvedNewsPath, []);
  const publishedBySlug = new Map((Array.isArray(newsRaw) ? newsRaw : []).map((item) => [slug(item.slug || item.id), item]));
  const publishedById = new Map((Array.isArray(newsRaw) ? newsRaw : []).map((item) => [item.id, item]));
  const marketNoteRaw = await readMarketNotes();
  for (const note of marketNoteRaw) {
    const noteSlug = slug(note.slug || note.seo?.suggestedSlug || note.id);
    publishedBySlug.set(noteSlug, note);
    publishedById.set(note.id, note);
  }
  const drafts = await readAllArticleDrafts();

  if (publishedBySlug.has(checkSlug)) warnings.push(`Slug "${checkSlug}" matches a published article: "${publishedBySlug.get(checkSlug).title}".`);
  if (publishedById.has(checkId)) warnings.push(`ID "${checkId}" matches a published article: "${publishedById.get(checkId).title}".`);
  const draftSlugMatch = drafts.find((d) => slug(d.slug || d.id) === checkSlug);
  const draftIdMatch = drafts.find((d) => d.id === checkId);
  if (draftSlugMatch) warnings.push(`Slug "${checkSlug}" matches an existing draft: "${draftSlugMatch.title}".`);
  if (draftIdMatch) warnings.push(`ID "${checkId}" matches an existing draft: "${draftIdMatch.title}".`);

  return sendJson(response, { ok: errors.length === 0, errors, warnings, slug: checkSlug, id: checkId });
}

async function createImportDraft(request, response) {
  const body = await readJson(request, 60 * 1024 * 1024);
  const pkg = body.package || {};
  const images = body.images || {};
  const destination = clean(pkg.destination || "news");
  if (!["news", "buyer", "downtown"].includes(destination)) {
    return sendJson(response, { ok: false, error: `Invalid destination: ${destination}` }, 400);
  }

  const rawId = clean(pkg.id || pkg.slug || `draft-${Date.now()}`);
  const safeDraftId = rawId.replace(/[^a-z0-9_\-]/gi, "-").slice(0, 120);
  const destDir = path.join(articleDraftsRoot, destination);
  await fs.mkdir(destDir, { recursive: true });
  const draftPath = path.join(destDir, `${safeDraftId}.json`);
  if (!draftPath.startsWith(articleDraftsRoot)) {
    return sendJson(response, { ok: false, error: "Invalid draft path" }, 400);
  }

  // Build bodySections from package body
  const bodySections = [];
  const intro = clean(pkg.body?.intro);
  if (intro) {
    bodySections.push({ heading: "Introduction", body: intro });
  }
  if (Array.isArray(pkg.body?.sections)) {
    for (const section of pkg.body.sections) {
      const paragraphs = Array.isArray(section?.paragraphs) ? section.paragraphs.filter(Boolean).join("\n\n") : "";
      const sec = {
        heading: clean(section?.heading) || "",
        body: paragraphs,
      };
      if (Array.isArray(section?.bullets) && section.bullets.length) {
        sec.bullets = section.bullets.map((bullet) => clean(bullet)).filter(Boolean);
      }
      if (clean(section?.imagePlacement)) sec.imageKey = clean(section.imagePlacement);
      if (sec.heading || sec.body || (sec.bullets?.length ?? 0)) bodySections.push(sec);
    }
  }

  // Normalize nested buyerIntelligence to flat fields (prefer flat, fallback to nested)
  const bi = pkg.buyerIntelligence || {};
  const buyerTakeaway = clean(pkg.buyerTakeaway || bi.buyerTakeaway || "");
  const marketSignal = clean(pkg.marketSignal || bi.marketSignal || "");
  const bestFor = clean(pkg.bestFor || bi.bestFor || "");
  const watchPoints = clean(pkg.watchPoints || bi.watchPoints || "");
  const buyerQuestions = clean(pkg.buyerQuestions || bi.buyerQuestions || "");
  const relatedCorridor = clean(pkg.relatedCorridor || bi.relatedCorridor || "");
  const relatedNeighborhoods = Array.isArray(pkg.relatedNeighborhoods) ? pkg.relatedNeighborhoods : (Array.isArray(bi.relatedNeighborhoods) ? bi.relatedNeighborhoods : []);
  const relatedBuildings = Array.isArray(pkg.relatedBuildings) ? pkg.relatedBuildings : (Array.isArray(bi.relatedBuildings) ? bi.relatedBuildings : []);

  // Build source links (prefer top-level sourceName/sourceUrl, fallback to sources[0])
  const sourceLinks = [];
  const pkgSourceName = clean(pkg.sourceName || (pkg.sources || [])[0]?.publisher || (pkg.sources || [])[0]?.title || "");
  const pkgSourceUrl = clean(pkg.sourceUrl || (pkg.sources || [])[0]?.url || "");
  const pkgSourcePublishedDate = clean(pkg.sourcePublishedDate || pkg.eventDate || (pkg.sources || [])[0]?.publishedDate || new Date().toISOString().slice(0, 10));
  if (Array.isArray(pkg.sources)) {
    for (const src of pkg.sources) {
      if (clean(src?.url)) {
        sourceLinks.push({ label: clean(src?.title) || clean(src?.publisher) || "Source", url: clean(src.url), type: "source" });
      }
    }
  }

  // Build hero image
  const heroKey = clean(pkg.heroImage?.uploadKey || "hero");
  const heroImg = images[heroKey];
  let heroImage = null;
  if (heroImg?.dataUrl) {
    heroImage = {
      dataUrl: heroImg.dataUrl,
      key: heroKey,
      alt: clean(pkg.heroImage?.alt) || clean(pkg.title),
      caption: clean(pkg.heroImage?.caption) || "",
      credit: clean(pkg.heroImage?.credit) || "",
    };
  }

  // Build body images
  const bodyImages = [];
  const imageMap = new Map();
  if (Array.isArray(pkg.images)) {
    for (const img of pkg.images) {
      const uploadKey = clean(img?.uploadKey);
      const placementId = clean(img?.placementId) || uploadKey;
      const uploaded = images[uploadKey];
      if (uploaded?.dataUrl) {
        const bodyImg = {
          dataUrl: uploaded.dataUrl,
          key: placementId,
          alt: clean(img?.alt) || "",
          caption: clean(img?.caption) || "",
          credit: clean(img?.credit) || "",
        };
        bodyImages.push(bodyImg);
        imageMap.set(uploadKey, bodyImg);
      }
    }
  }

  // Determine related IDs from explicit package fields
  const splitToArray = (value) => {
    if (Array.isArray(value)) return value.map((v) => clean(String(v))).filter(Boolean);
    const str = clean(String(value ?? ""));
    return str ? str.split(",").map(clean).filter(Boolean) : [];
  };
  const relatedProjectIds = splitToArray(pkg.relatedProjects || pkg.projects || pkg.relatedProjectIds);
  const relatedCorridorIds = splitToArray(pkg.relatedCorridors || pkg.relatedCorridorIds);

  // Determine category from pkg.category, then tags, then destination
  const tags = Array.isArray(pkg.tags) ? pkg.tags : [];
  const validCategories = new Set(["development", "construction", "planning", "sales", "financing", "city", "press-release", "general", "Buyer Intelligence", "Downtown Spotlight"]);
  const category = validCategories.has(clean(pkg.category)) ? clean(pkg.category) : (validCategories.has(clean(tags[0])) ? clean(tags[0]) : "general");

  const draft = {
    id: safeDraftId,
    draftId: safeDraftId,
    destination,
    title: clean(pkg.title),
    slug: slug(pkg.slug || pkg.title),
    deck: clean(pkg.deck),
    description: clean(pkg.description || pkg.deck),
    summary: clean(pkg.summary || pkg.deck),
    category,
    relatedProjectIds,
    relatedCorridorIds,
    sourceName: pkgSourceName,
    sourceUrl: pkgSourceUrl,
    sourcePublishedDate: pkgSourcePublishedDate,
    whyItMatters: clean(pkg.whyItMatters || ""),
    buyerContext: clean(pkg.buyerContext || ""),
    buyerTakeaway,
    marketSignal,
    bestFor,
    watchPoints,
    buyerQuestions,
    relatedCorridor,
    relatedNeighborhoods,
    relatedBuildings,
    commitMessage: clean(pkg.commitMessage || ""),
    bodySections,
    bodyImages,
    heroImage,
    imagePath: "",
    sourceLinks,
    newsletterHeadline: clean(pkg.newsletterHeadline) || clean(pkg.title),
    newsletterBlurb: clean(pkg.summary || pkg.deck),
    query: clean(pkg.query) || "",
    freshnessLane: clean(pkg.freshnessLane) || "breaking_14d",
    savedAt: new Date().toISOString(),
  };

  await fs.writeFile(draftPath, `${JSON.stringify(draft, null, 2)}\n`);
  return sendJson(response, { ok: true, draftId: safeDraftId, destination, savedAt: draft.savedAt });
}

async function archiveArticle(request, response) {
  const body = await readJson(request);
  const remote = remoteContext(request);
  if (!body.confirmArchive) {
    return sendJson(response, { ok: false, error: "confirmArchive: true is required to archive an article." }, 400);
  }
  if (remote.isRemote && body.confirmRemote !== true) {
    return sendJson(response, { ok: false, error: "Remote Builder Mode requires the remote confirmation checkbox before archiving." }, 400);
  }
  const destination = clean(body.destination || "news");
  const id = clean(body.id || "");
  if (!id) return sendJson(response, { ok: false, error: "id is required" }, 400);
  if (destination !== "news") {
    return sendJson(response, { ok: false, error: "Archive for buyer and downtown articles is deferred to Phase 2." }, 422);
  }
  const newsRaw = await readJsonFile(approvedNewsPath, []);
  if (!Array.isArray(newsRaw)) return sendJson(response, { ok: false, error: "Could not read news articles" }, 500);
  const index = newsRaw.findIndex((item) => item.id === id);
  if (index === -1) return sendJson(response, { ok: false, error: `Article not found: ${id}` }, 404);
  const title = newsRaw[index].title;
  newsRaw[index] = { ...newsRaw[index], status: "archived" };
  await fs.writeFile(approvedNewsPath, `${JSON.stringify(newsRaw, null, 2)}\n`);
  await logChange("article-archived", { id, destination, title });
  const deployResult = await autoCommitAndPush(
    `Archive news article: ${title}\n\nGenerated with Devin\n\nCo-Authored-By: Devin <158243242+devin-ai-integration[bot]@users.noreply.github.com>`,
    [approvedNewsPath, path.join(workspace, "content/overrides/content-studio-change-log.json")],
  );
  return sendJson(response, { ok: true, id, status: "archived", deployed: deployResult.ok, deployNote: deployResult.reason || (deployResult.pushed ? "Committed and pushed — deploy triggered" : deployResult.error), changedFiles: await changedFiles() });
}

async function deletePublishedArticle(request, response) {
  const body = await readJson(request);
  const remote = remoteContext(request);
  if (!body.confirmDelete) {
    return sendJson(response, { ok: false, error: "confirmDelete: true is required to delete an article." }, 400);
  }
  if (remote.isRemote && body.confirmRemote !== true) {
    return sendJson(response, { ok: false, error: "Remote Builder Mode requires the remote confirmation checkbox before deleting." }, 400);
  }
  const destination = clean(body.destination || "news");
  const id = clean(body.id || "");
  if (!id) return sendJson(response, { ok: false, error: "id is required" }, 400);
  if (!["news", "buyer", "downtown"].includes(destination)) {
    return sendJson(response, { ok: false, error: `Unsupported destination: ${destination}` }, 422);
  }

  // News articles: hard-delete from approved-development-news.json
  if (destination === "news") {
    const newsRaw = await readJsonFile(approvedNewsPath, []);
    if (!Array.isArray(newsRaw)) return sendJson(response, { ok: false, error: "Could not read news articles" }, 500);
    const index = newsRaw.findIndex((item) => item.id === id || item.slug === id);
    if (index === -1) return sendJson(response, { ok: false, error: `Article not found: ${id}` }, 404);
    const title = newsRaw[index].title;
    newsRaw.splice(index, 1);
    await fs.writeFile(approvedNewsPath, `${JSON.stringify(newsRaw, null, 2)}\n`);
    await logChange("article-deleted", { id, destination, title });
    const deployResult = await autoCommitAndPush(
      `Delete news article: ${title}\n\nGenerated with Devin\n\nCo-Authored-By: Devin <158243242+devin-ai-integration[bot]@users.noreply.github.com>`,
      [approvedNewsPath, path.join(workspace, "content/overrides/content-studio-change-log.json")],
    );
    return sendJson(response, { ok: true, id, deleted: true, deployed: deployResult.ok, deployNote: deployResult.pushed ? "Committed and pushed — deploy triggered" : (deployResult.error || deployResult.reason), changedFiles: await changedFiles() });
  }

  // Buyer / Downtown Spotlight: set status: "archived" in marketNotes.ts
  const source = await fs.readFile(marketNotesSourcePath, "utf8").catch(() => "");
  if (!source) return sendJson(response, { ok: false, error: "Could not read marketNotes.ts" }, 500);
  // Find the object containing this id
  const safeId = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const idMatch = new RegExp(`id:\\s*"${safeId}"`).exec(source);
  if (!idMatch) return sendJson(response, { ok: false, error: `Article not found in market notes: ${id}` }, 404);
  // Walk back to the enclosing {
  let objStart = idMatch.index;
  while (objStart > 0 && source[objStart] !== "{") objStart--;
  // Walk forward to the matching }
  let depth = 0, objEnd = objStart;
  for (let i = objStart; i < source.length; i++) {
    if (source[i] === "{") depth++;
    else if (source[i] === "}") { depth--; if (depth === 0) { objEnd = i; break; } }
  }
  const objText = source.slice(objStart, objEnd + 1);
  const titleMatch = /title:\s*"([^"]+)"/.exec(objText);
  const title = titleMatch?.[1] || id;
  // Replace the status value within this object only
  const updatedObj = objText.replace(/\bstatus:\s*"[^"]*"/, 'status: "archived"');
  if (updatedObj === objText) {
    return sendJson(response, { ok: false, error: `Could not update status for article: ${id} (status field not found or already archived)` }, 422);
  }
  const updatedSource = source.slice(0, objStart) + updatedObj + source.slice(objEnd + 1);
  await fs.writeFile(marketNotesSourcePath, updatedSource);
  await logChange("article-deleted", { id, destination, title, method: "archived-in-source" });
  const deployResult = await autoCommitAndPush(
    `Delete ${destination} article: ${title}\n\nGenerated with Devin\n\nCo-Authored-By: Devin <158243242+devin-ai-integration[bot]@users.noreply.github.com>`,
    [marketNotesSourcePath, path.join(workspace, "content/overrides/content-studio-change-log.json")],
  );
  return sendJson(response, { ok: true, id, deleted: true, archived: true, deployed: deployResult.ok, deployNote: deployResult.pushed ? "Committed and pushed — deploy triggered" : (deployResult.error || deployResult.reason), changedFiles: await changedFiles() });
}

async function createSitePreview(request, response) {
  const body = await readJson(request, 60 * 1024 * 1024);
  const rawDestination = clean(body.destination || "news");
  const supportedDestinations = new Set([
    "news", "updates",
    "downtown", "downtown-spotlight",
    "development-watch", "devwatch",
    "buyer", "buyer-intelligence",
  ]);
  if (!supportedDestinations.has(rawDestination)) {
    return sendJson(response, { ok: false, error: `Preview in Site destination "${rawDestination}" is not supported. Supported: news, updates, downtown-spotlight, development-watch, buyer-intelligence.` }, 400);
  }
  // All destinations currently render through the same update/article renderer.
  const previewDestination = rawDestination;
  const previewId = `preview-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const assetFilename = await writePreviewHeroAsset(body, previewId);
  if (assetFilename) {
    body.imagePath = `http://localhost:${port}/api/article/site-preview-asset/${assetFilename}`;
  }
  // Phase 2: write body image assets and inject URLs into sections
  const bodyAssetMap = await writePreviewBodyAssets(body, previewId);
  if (bodyAssetMap && Array.isArray(body.bodySections)) {
    for (const section of body.bodySections) {
      if (section.imageKey && bodyAssetMap[section.imageKey]) {
        section.image = bodyAssetMap[section.imageKey];
      }
      // Also support direct imageKey matching on bodyImages key
      if (section.imageKey && !section.image) {
        const matched = (body.bodyImages || []).find((img) => img.key === section.imageKey);
        if (matched?.path) section.image = matched.path;
      }
    }
  }
  const item = normalizeArticlePreview(body);
  if (!item.title) return sendJson(response, { ok: false, error: "Title is required for Preview in Site." }, 400);
  await fs.mkdir(articleSitePreviewsRoot, { recursive: true });
  const previewPath = path.join(articleSitePreviewsRoot, `${previewId}.json`);
  await fs.writeFile(previewPath, `${JSON.stringify({ previewId, createdAt: new Date().toISOString(), destination: previewDestination, item }, null, 2)}\n`);
  const previewUrl = `http://localhost:5173/updates/__preview__/?previewId=${encodeURIComponent(previewId)}`;
  return sendJson(response, { ok: true, previewId, previewUrl, destination: previewDestination, destinationNote: "All destinations currently render through the Updates/article renderer. True route previews are aliased for now." });
}

async function getSitePreview(request, response, url) {
  const origin = allowedPreviewOrigin(request);
  const rawId = clean(url.searchParams.get("id") || "");
  const safeId = rawId.replace(/[^a-z0-9_\-]/gi, "-").slice(0, 120);
  if (!safeId) return sendJsonCors(response, { ok: false, error: "id is required" }, 400, origin);
  const previewPath = path.join(articleSitePreviewsRoot, `${safeId}.json`);
  if (!previewPath.startsWith(articleSitePreviewsRoot + path.sep)) {
    return sendJsonCors(response, { ok: false, error: "Invalid preview id." }, 400, origin);
  }
  const raw = await fs.readFile(previewPath, "utf8").catch(() => null);
  if (!raw) return sendJsonCors(response, { ok: false, error: "Preview not found." }, 404, origin);
  const parsed = JSON.parse(raw);
  return sendJsonCors(response, { ok: true, item: parsed.item }, 200, origin);
}

function allowedPreviewOrigin(request) {
  const origin = String(request.headers["origin"] || "").trim();
  const allowed = new Set(["http://localhost:5173", "http://127.0.0.1:5173"]);
  return allowed.has(origin) ? origin : "http://localhost:5173";
}

function normalizeArticlePreview(body) {
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date().toISOString();
  const splitToArray = (value) => {
    if (Array.isArray(value)) return value.map((v) => clean(String(v))).filter(Boolean);
    const str = clean(String(value ?? ""));
    return str ? str.split(",").map(clean).filter(Boolean) : [];
  };
  const validCategories = new Set(["development", "construction", "planning", "sales", "financing", "city", "press-release", "general"]);
  const category = validCategories.has(clean(body.category)) ? clean(body.category) : "general";
  const relatedProjectIds = splitToArray(body.relatedProjectIds);
  const relatedCorridorIds = splitToArray(body.relatedCorridorIds);
  const sourceUrl = clean(body.sourceUrl || "");
  const splitToArrayOrStr = (value) => {
    if (Array.isArray(value)) return value.map((v) => clean(String(v))).filter(Boolean);
    const str = clean(String(value ?? ""));
    return str ? str.split(",").map(clean).filter(Boolean) : [];
  };
  return {
    id: clean(body.id || body.draftId || `preview-${Date.now()}`),
    slug: clean(body.slug || body.id || body.draftId || "preview-draft"),
    title: clean(body.title || ""),
    deck: clean(body.deck || body.description || ""),
    category,
    sourceName: clean(body.sourceName || "Draft Preview"),
    sourceUrl,
    canonicalUrl: clean(body.canonicalUrl || sourceUrl),
    publishedAt: clean(body.publishedAt || body.sourcePublishedDate || today),
    sourcePublishedDate: clean(body.sourcePublishedDate || today),
    sourcePublishedAt: clean(body.sourcePublishedAt || body.sourcePublishedDate || today),
    dateDiscovered: clean(body.dateDiscovered || today),
    fetchedAt: now,
    freshnessLane: "breaking_14d",
    paywallStatus: "free",
    status: "published",
    relatedProjectIds,
    relatedProjectSlugs: relatedProjectIds,
    relatedCorridorIds,
    relatedCorridors: [],
    bodySections: Array.isArray(body.bodySections) ? body.bodySections : [],
    whyItMatters: clean(body.whyItMatters || ""),
    buyerContext: clean(body.buyerContext || ""),
    brookeTake: clean(body.brookeTake || ""),
    newsletterBlurb: clean(body.newsletterBlurb || ""),
    imagePath: clean(body.imagePath || ""),
    buyerTakeaway: clean(body.buyerTakeaway || ""),
    marketSignal: clean(body.marketSignal || ""),
    bestFor: clean(body.bestFor || ""),
    watchPoints: clean(body.watchPoints || ""),
    buyerQuestions: clean(body.buyerQuestions || ""),
    relatedBuildings: splitToArrayOrStr(body.relatedBuildings),
    relatedNeighborhoods: splitToArrayOrStr(body.relatedNeighborhoods),
    relatedCorridor: clean(body.relatedCorridor || ""),
    sourceLinks: Array.isArray(body.sourceLinks) && body.sourceLinks.length
      ? body.sourceLinks
      : sourceUrl ? [{ label: clean(body.sourceName || "Source"), url: sourceUrl, type: "news" }] : [],
  };
}

const PREVIEW_ASSET_MIME_TO_EXT = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

function safePreviewAssetFilename(filename) {
  const safe = String(filename).replace(/[^a-zA-Z0-9_.-]/g, "");
  if (!safe || safe.includes("..") || safe.startsWith(".")) return null;
  return safe;
}

async function writePreviewHeroAsset(body, previewId) {
  const dataUrl = body.heroImage?.dataUrl;
  if (!dataUrl || typeof dataUrl !== "string") return null;
  if (!dataUrl.startsWith("data:")) return null;

  const match = dataUrl.match(/^data:([^;,]+)?(?:;base64)?,(.+)$/);
  if (!match) return null;

  const mime = match[1] || "application/octet-stream";
  if (!PREVIEW_ASSET_MIME_TO_EXT[mime]) return null;

  const base64Data = match[2];
  const buffer = Buffer.from(base64Data, "base64");
  if (buffer.length > 10 * 1024 * 1024) return null;

  const ext = PREVIEW_ASSET_MIME_TO_EXT[mime];
  const filename = `${previewId}-hero.${ext}`;
  await fs.mkdir(articleSitePreviewAssetsRoot, { recursive: true });
  const filePath = path.join(articleSitePreviewAssetsRoot, filename);
  await fs.writeFile(filePath, buffer);
  return filename;
}

async function writePreviewBodyAssets(body, previewId) {
  const bodyImages = body.bodyImages || [];
  const assetMap = {};
  let index = 0;
  for (const img of bodyImages) {
    const dataUrl = img?.dataUrl;
    const key = clean(img?.key) || `image-${index + 1}`;
    if (!dataUrl || typeof dataUrl !== "string" || !dataUrl.startsWith("data:")) {
      index++;
      continue;
    }
    const match = dataUrl.match(/^data:([^;,]+)?(?:;base64)?,(.+)$/);
    if (!match) {
      index++;
      continue;
    }
    const mime = match[1] || "application/octet-stream";
    if (!PREVIEW_ASSET_MIME_TO_EXT[mime]) {
      index++;
      continue;
    }
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, "base64");
    if (buffer.length > 10 * 1024 * 1024) {
      index++;
      continue;
    }
    const ext = PREVIEW_ASSET_MIME_TO_EXT[mime];
    const filename = `${previewId}-body-${index + 1}.${ext}`;
    await fs.mkdir(articleSitePreviewAssetsRoot, { recursive: true });
    const filePath = path.join(articleSitePreviewAssetsRoot, filename);
    await fs.writeFile(filePath, buffer);
    assetMap[key] = `http://localhost:${port}/api/article/site-preview-asset/${filename}`;
    index++;
  }
  return assetMap;
}

async function serveSitePreviewAsset(request, response, url) {
  const origin = allowedPreviewOrigin(request);
  const rawFilename = url.pathname.slice("/api/article/site-preview-asset/".length);
  const safeFilename = safePreviewAssetFilename(rawFilename);
  if (!safeFilename) {
    response.writeHead(400, { "content-type": "text/plain; charset=utf-8", "access-control-allow-origin": origin });
    return response.end("Invalid filename");
  }
  const filePath = path.join(articleSitePreviewAssetsRoot, safeFilename);
  if (!filePath.startsWith(articleSitePreviewAssetsRoot + path.sep)) {
    response.writeHead(400, { "content-type": "text/plain; charset=utf-8", "access-control-allow-origin": origin });
    return response.end("Invalid path");
  }
  const buffer = await fs.readFile(filePath).catch(() => null);
  if (!buffer) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8", "access-control-allow-origin": origin });
    return response.end("Not found");
  }
  const ext = path.extname(safeFilename).slice(1).toLowerCase();
  const mimeType = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
  }[ext] || "application/octet-stream";
  response.writeHead(200, {
    "content-type": mimeType,
    "cache-control": "no-store",
    "access-control-allow-origin": origin,
  });
  response.end(buffer);
}

async function deleteArticleDraft(request, response) {
  const body = await readJson(request);
  if (!body.confirmDelete) {
    return sendJson(response, { ok: false, error: "confirmDelete: true is required to delete a draft." }, 400);
  }
  const destination = clean(body.destination || "news");
  const rawId = clean(body.draftId || body.id || "");
  if (!rawId) return sendJson(response, { ok: false, error: "draftId is required" }, 400);
  const safeDraftId = rawId.replace(/[^a-z0-9_\-]/gi, "-").slice(0, 120);
  const draftPath = path.join(articleDraftsRoot, destination, `${safeDraftId}.json`);
  if (!draftPath.startsWith(articleDraftsRoot + path.sep)) {
    return sendJson(response, { ok: false, error: "Invalid draftId — path rejected." }, 400);
  }
  const fileExists = await exists(draftPath);
  if (!fileExists) return sendJson(response, { ok: false, error: "Draft not found." }, 404);
  await fs.unlink(draftPath);
  return sendJson(response, { ok: true, draftId: safeDraftId, deleted: true });
}

async function runWorkflow(request, response) {
  const body = await readJson(request);
  const workflow = clean(body.workflow);
  const remote = remoteContext(request);
  const workflows = {
    preview: [["git", ["status", "--short"]]],
    qa: [["npm", ["run", "typecheck"]], ["npm", ["run", "build"]], ["npm", ["run", "qa:launch"]]],
    "news-import": [["npm", ["run", "news:import-gpt"]]],
    "news-daily-publisher": [["npm", ["run", "news:daily-publisher"]]],
    "news-publish": [["npm", ["run", "news:publish-queued"]]],
    newsletter: [["npm", ["run", "newsletter:draft"]]],
    "daily-maintenance": [["npm", ["run", "daily:maintenance"]]],
    update: [["npm", ["run", "typecheck"]], ["npm", ["run", "build"]], ["npm", ["run", "qa:launch"]]],
    "update-deploy": [
      ["npm", ["run", "typecheck"]],
      ["npm", ["run", "build"]],
      ["npm", ["run", "qa:launch"]],
      ["git", ["status", "--short"]],
      ["git", ["add", "content", "src", "public", "docs", "research", "package.json", "tools"]],
      ["git", ["commit", "-m", "Update site content from Brooke Builder"]],
      ["git", ["push", "origin", "main"]],
      ["npm", ["run", "ship:live"]],
      ["npm", ["run", "qa:live"]],
    ],
  };
  if (!workflows[workflow]) return sendJson(response, { ok: false, error: `Unknown workflow: ${workflow}` }, 400);
  if (["update", "update-deploy"].includes(workflow) && body.confirmUpdate !== true) {
    return sendJson(response, { ok: false, error: "Update Site requires explicit confirmation before running checks or publishing." }, 400);
  }
  if (remote.isRemote && ["update", "update-deploy", "news-publish"].includes(workflow) && body.confirmRemote !== true) {
    return sendJson(response, { ok: false, error: "Remote Builder Mode requires the remote confirmation checkbox before this workflow can run." }, 400);
  }
  if (workflow === "update-deploy" && body.confirmDeploy !== true) {
    return sendJson(response, { ok: false, error: "Final deploy requires confirmDeploy: true. Use Run QA first, review git diff, then confirm." }, 400);
  }
  if (workflow === "update-deploy") {
    const status = await run("git", ["status", "--short"]);
    const risky = status.stdout.split("\n").filter(Boolean).filter((line) => !/^..\s+(content|src|public|docs|research|package\.json|tools)\b/.test(line));
    if (risky.length) return sendJson(response, { ok: false, error: `Unrelated changes need review before deploy: ${risky.join("; ")}` }, 400);
  }
  const results = [];
  for (const [command, args] of workflows[workflow]) {
    const result = await run(command, args);
    results.push({ command: `${command} ${args.join(" ")}`, ...result });
    if (result.code !== 0) {
      await logChange("workflow-failed", { workflow, command, code: result.code });
      return sendJson(response, { ok: false, workflow, results }, 500);
    }
  }
  await logChange("workflow", { workflow, commands: results.length });
  return sendJson(response, { ok: true, workflow, results, changedFiles: await changedFiles(), nextStep: nextStepForWorkflow(workflow) });
}

function readTsArray(source, varName) {
  // Find `export const <varName>[: SomeType] = [`
  const re = new RegExp(`export\\s+const\\s+${varName}\\s*(?::[^=]+)?=\\s*\\[`);
  const match = re.exec(source);
  if (!match) return [];
  // The match ends with '[', so bracketStart is the last char of the match
  const bracketStart = match.index + match[0].length - 1;
  // Walk forward balancing [ { ] } to find the closing ]
  let depth = 0, end = -1;
  for (let i = bracketStart; i < source.length; i++) {
    const ch = source[i];
    if (ch === "[" || ch === "{") depth++;
    else if (ch === "]" || ch === "}") { depth--; if (depth === 0) { end = i; break; } }
  }
  if (end === -1) return [];
  // Collect any simple `const X = "..."` or `const X = number` declarations
  // that appear before the array — the array may reference them by name
  const preambleLines = [];
  for (const m of source.slice(0, bracketStart).matchAll(/^(?:export\s+)?const\s+(\w+)\s*=\s*("[^"]*"|'[^']*'|\d[\d.]*)\s*;/gm)) {
    if (m[1] !== varName) preambleLines.push(`const ${m[1]} = ${m[2]};`);
  }
  const arrayText = source.slice(bracketStart, end + 1)
    .replace(/\s+as\s+const\b/g, "");  // strip "as const" type assertions
  try {
    return (new Function(preambleLines.join("\n") + `\nreturn ${arrayText}`))();
  } catch (e) {
    console.error(`readTsArray(${varName}) parse error:`, e.message?.slice(0, 160));
    return [];
  }
}

async function readMarketNotes() {
  const source = await fs.readFile(marketNotesSourcePath, "utf8").catch(() => "");
  if (!source) return [];
  return readTsArray(source, "marketNotes");
}

function marketNoteDestination(note) {
  return note.category === "Downtown Spotlight" ? "downtown" : "buyer";
}

function marketNoteToArticleListItem(note) {
  return {
    id: note.id,
    slug: note.slug || note.seo?.suggestedSlug || note.id,
    title: note.title || "(Untitled)",
    destination: marketNoteDestination(note),
    category: note.category || "general",
    status: note.status || "published",
    publishedAt: note.datePublished || "",
    modifiedAt: note.dateModified || note.datePublished || "",
    imagePath: note.image?.path || "",
    isDraft: false,
    draftId: null,
    source: "market-notes",
  };
}

function marketNoteToEditorArticle(note, destination = marketNoteDestination(note)) {
  const bodySections = Array.isArray(note.sections)
    ? note.sections.map((section, index) => ({
        heading: clean(section.heading || `Section ${index + 1}`),
        body: clean(section.body || ""),
        bullets: Array.isArray(section.bullets) ? section.bullets.map((bullet) => clean(bullet)).filter(Boolean) : [],
        imageKey: section.image ? `image-${index + 1}` : "",
        image: section.image || "",
      }))
    : [];
  const bodyImages = [];
  if (note.image?.path) {
    bodyImages.push({
      key: "hero",
      path: note.image.path,
      alt: clean(note.title),
      caption: "",
      credit: clean(note.image.credit || ""),
    });
  }
  if (Array.isArray(note.sections)) {
    note.sections.forEach((section, index) => {
      if (!section.image) return;
      bodyImages.push({
        key: `image-${index + 1}`,
        path: section.image,
        alt: clean(section.heading || note.title),
        caption: "",
        credit: "",
      });
    });
  }
  return {
    id: note.id,
    draftId: "",
    destination,
    category: note.category || "general",
    title: note.title || "",
    slug: note.slug || note.seo?.suggestedSlug || note.id,
    deck: note.excerpt || note.buyerThesis || "",
    description: note.excerpt || note.buyerThesis || "",
    summary: note.excerpt || note.buyerThesis || "",
    relatedProjectIds: note.projectIds || [],
    relatedCorridorIds: note.relatedCorridor ? [note.relatedCorridor] : [],
    sourceName: note.sourceName || "",
    sourceUrl: note.sourceLinks?.[0]?.href || "",
    sourcePublishedDate: note.datePublished || "",
    whyItMatters: note.buyerThesis || "",
    buyerContext: note.buyerTakeaway || "",
    buyerTakeaway: note.buyerTakeaway || "",
    marketSignal: note.marketSignal || "",
    bestFor: note.bestFor || "",
    watchPoints: note.watchPoints || "",
    buyerQuestions: note.buyerQuestions || "",
    relatedCorridor: note.relatedCorridor || "",
    relatedNeighborhoods: note.relatedNeighborhoods || [],
    relatedBuildings: note.relatedBuildings || [],
    commitMessage: "",
    bodySections,
    bodyImages,
    heroImage: note.image?.path
      ? {
          dataUrl: "",
          key: "hero",
          alt: clean(note.title),
          caption: "",
          credit: clean(note.image.credit || ""),
        }
      : null,
    imagePath: note.image?.path || "",
    sourceLinks: Array.isArray(note.sourceLinks)
      ? note.sourceLinks.map((link) => ({ label: link.label, url: link.href, type: link.sourceType || "source" }))
      : [],
    newsletterHeadline: note.title || "",
    newsletterBlurb: note.excerpt || note.buyerThesis || "",
    query: note.title || "",
    freshnessLane: "breaking_14d",
    savedAt: note.dateModified || note.datePublished || new Date().toISOString(),
    source: "market-notes",
    status: note.status || "published",
  };
}

function articleListTimestamp(item) {
  const value = item.publishedAt || item.modifiedAt || "";
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function parseTrailingJson(stdout) {
  const text = String(stdout || "").trimEnd();
  if (!text) return null;
  const end = text.lastIndexOf("}");
  if (end === -1) return null;
  for (let start = text.lastIndexOf("{", end); start >= 0; start = text.lastIndexOf("{", start - 1)) {
    const candidate = text.slice(start, end + 1);
    try {
      return JSON.parse(candidate);
    } catch {
      continue;
    }
  }
  return null;
}

async function syncLegacyProjectOverrides(overrides) {
  const legacy = { version: 1, updatedAt: new Date().toISOString(), projects: {} };
  for (const [projectId, item] of Object.entries(overrides.projects ?? {})) {
    legacy.projects[projectId] = {
      summary: item.summary,
      draft: {
        intro: item.editorialIntro,
        needed: item.missingInfo,
      },
    };
  }
  await fs.mkdir(path.dirname(legacyEditorOverridesPath), { recursive: true });
  await fs.writeFile(legacyEditorOverridesPath, `${JSON.stringify(legacy, null, 2)}\n`);
  await syncEditorOverrides(legacy);
}

async function readProjects() {
  const source = await fs.readFile(path.join(workspace, "src/main.ts"), "utf8");
  return [...source.matchAll(/id:\s*"([^"]+)"[\s\S]{0,320}?name:\s*"([^"]+)"/g)]
    .map((match) => ({ id: match[1], name: match[2] }))
    .filter((project, index, all) => all.findIndex((item) => item.id === project.id) === index)
    .sort((a, b) => a.name.localeCompare(b.name));
}

async function readAllOverrides() {
  const result = {};
  for (const key of Object.keys(overrideFiles)) result[key] = await readOverride(key);
  result.changeLog = await readJsonFile(changeLogPath, { version: 1, entries: [] });
  return result;
}

async function readOverride(key) {
  const defaults = {
    projectCopy: { version: 1, updatedAt: "", projects: {} },
    pageCopy: { version: 1, updatedAt: "", pages: {} },
    projectImages: { version: 1, updatedAt: "", images: [] },
    projectFactOverrides: { version: 1, updatedAt: "", projects: {} },
    homepage: { version: 1, updatedAt: "", sections: {} },
    homepageCards: { version: 1, updatedAt: "", sections: defaultHomepageCardSections() },
    imageCaptions: { version: 1, updatedAt: "", items: [] },
    editorialImages: { version: 1, updatedAt: "", items: [] },
    marketNotes: { version: 1, updatedAt: "", marketNotes: {} },
    updates: { version: 1, updatedAt: "", projectUpdates: {} },
    projectUpdates: { version: 1, updatedAt: "", projects: {} },
    teamResources: { version: 1, updatedAt: "", teamResources: [] },
  };
  return readJsonFile(path.join(overridesRoot, overrideFiles[key]), defaults[key]);
}

async function availablePublicImages() {
  const roots = ["public/assets/editorial", "public/projects", "public/hero"];
  const files = [];
  for (const root of roots) files.push(...await listPublicImages(path.join(workspace, root)));
  return files
    .map((filePath) => `/${path.relative(path.join(workspace, "public"), filePath).split(path.sep).join("/")}`)
    .sort();
}

async function imageCatalog() {
  const imagePaths = await availablePublicImages();
  const usage = await imageUsageCounts(imagePaths);
  const uploaded = await readOverride("projectImages");
  const uploadedByPath = new Map((uploaded.images ?? []).map((item) => [item.path, item]));
  return Promise.all(imagePaths.map(async (imagePath) => {
    const filePath = path.join(workspace, "public", imagePath.replace(/^\//, ""));
    const stat = await fs.stat(filePath).catch(() => null);
    const uploadedEntry = uploadedByPath.get(imagePath);
    const meta = imageMetadata(imagePath, uploadedEntry);
    return {
      path: imagePath,
      category: meta.category,
      association: meta.association,
      dimensions: shouldReadImageDimensions(imagePath) ? await imageDimensions(filePath) : "",
      imageType: uploadedEntry?.imageType || meta.imageType,
      usageCount: usage.get(imagePath) ?? 0,
      status: uploadedEntry?.status || meta.status,
      reviewOnly: meta.reviewOnly,
      bytes: stat?.size ?? 0,
      updatedAt: stat?.mtime?.toISOString?.() ?? "",
    };
  }));
}

function shouldReadImageDimensions(imagePath) {
  if (/\.svg$/i.test(imagePath)) return false;
  if (imagePath.includes("/docs/floorplans/")) return false;
  return imagePath.startsWith("/assets/editorial/")
    || imagePath.startsWith("/hero/")
    || imagePath.includes("/media/")
    || imagePath.startsWith("/team-resources/");
}

async function imageUsageCounts(imagePaths) {
  const counts = new Map(imagePaths.map((imagePath) => [imagePath, 0]));
  const files = ["src/main.ts", "src/data/marketNotes.ts", "src/data/approvedExternalNews.ts", "src/data/editorialImagery.ts", "content/overrides/homepage-card-overrides.json", "content/overrides/homepage-overrides.json"];
  const text = (await Promise.all(files.map((file) => fs.readFile(path.join(workspace, file), "utf8").catch(() => "")))).join("\n");
  for (const imagePath of imagePaths) {
    counts.set(imagePath, text.split(imagePath).length - 1);
  }
  return counts;
}

async function imageDimensions(filePath) {
  if (/\.svg$/i.test(filePath)) return "";
  try {
    const meta = await sharp(filePath).metadata();
    return meta.width && meta.height ? `${meta.width}x${meta.height}` : "";
  } catch {
    return "";
  }
}

function imageMetadata(imagePath, uploadedEntry) {
  if (uploadedEntry) {
    return {
      category: uploadedEntry.targetType === "team" ? "Team/developer/designer/architect images" : "Recently uploaded",
      association: uploadedEntry.projectId || uploadedEntry.targetType,
      imageType: uploadedEntry.imageType || uploadedEntry.targetType,
      status: uploadedEntry.status || "needs_review",
      reviewOnly: uploadedEntry.status !== "approved",
    };
  }
  const projectMatch = imagePath.match(/^\/projects\/([^/]+)\//);
  if (projectMatch) {
    const type = imagePath.includes("/docs/floorplans/") ? "Floorplan previews" : "Project images";
    return { category: type, association: projectMatch[1], imageType: type === "Floorplan previews" ? "floorplan" : "project", status: "approved", reviewOnly: false };
  }
  if (imagePath.startsWith("/assets/editorial/")) return { category: "Editorial/corridor images", association: "editorial", imageType: "editorial", status: "approved", reviewOnly: false };
  if (imagePath.startsWith("/team-resources/")) return { category: "Team/developer/designer/architect images", association: imagePath.split("/")[2] || "team", imageType: "team", status: "approved", reviewOnly: false };
  return { category: "Review-only images", association: "review", imageType: "review", status: "needs_review", reviewOnly: true };
}

async function homepageCardInventory() {
  const [updates, guidance] = await Promise.all([readUpdateCards(), readGuidanceCards()]);
  return {
    hero: [{ id: "hero", title: "Homepage hero", imagePath: "", deck: "Hero image rotation and lead copy" }],
    map: [{ id: "homepage-map", title: "Map", imagePath: "/assets/editorial/wpb-geography-map-hero.jpg", deck: "Map and corridor orientation block" }],
    corridors: [
      { id: "north-flagler", title: "North Flagler", imagePath: "/assets/editorial/flagler-waterfront-corridor.jpg", deck: "Waterfront and marina corridor" },
      { id: "downtown", title: "Downtown", imagePath: "/assets/editorial/rosemary-square-corridor.jpg", deck: "Walkability and district living" },
      { id: "south-flagler", title: "South Flagler", imagePath: "/assets/editorial/south-flagler-corridor.jpg", deck: "Quieter waterfront corridor" },
    ],
    updates,
    guidance,
    featuredBuildings: await featuredBuildingCards(),
    cta: [{ id: "bottom-cta", title: "Bottom homepage CTA", imagePath: "", deck: "Final advisory conversion block" }],
  };
}

async function readUpdateCards() {
  const text = await fs.readFile(path.join(workspace, "src/data/approvedExternalNews.ts"), "utf8").catch(() => "");
  return [...text.matchAll(/"?id"?\s*:\s*"([^"]+)"[\s\S]{0,420}?"?title"?\s*:\s*"([^"]+)"[\s\S]{0,900}?(?:"?description"?\s*:\s*"([^"]+)")?[\s\S]{0,900}?(?:"?relatedProjectIds"?\s*:\s*\[\s*"([^"]+)")?/g)]
    .slice(0, 8)
    .map((match) => ({ id: match[1], title: match[2], imagePath: projectPreviewImage(match[4]), deck: match[3] || "Homepage update card" }));
}

async function readGuidanceCards() {
  const text = await fs.readFile(path.join(workspace, "src/data/marketNotes.ts"), "utf8").catch(() => "");
  return [...text.matchAll(/"?title"?\s*:\s*"([^"]+)"[\s\S]{0,260}?"?slug"?\s*:\s*"([^"]+)"[\s\S]{0,700}?(?:"?excerpt"?\s*:\s*"([^"]+)")?[\s\S]{0,700}?(?:"?imageId"?\s*:\s*"([^"]+)")?/g)]
    .slice(0, 8)
    .map((match) => ({ id: match[2], title: match[1], imagePath: imagePathFromImageId(match[4]), deck: match[3] || "Homepage guidance card" }));
}

async function featuredBuildingCards() {
  const projects = await readProjects();
  const projectImages = await projectCardImages();
  return projects.slice(0, 18).map((project) => ({
    id: project.id,
    title: project.name,
    imagePath: projectImages.get(project.id) || projectPreviewImage(project.id),
    deck: "Featured building card",
  }));
}

async function projectCardImages() {
  const text = await fs.readFile(path.join(workspace, "src/main.ts"), "utf8").catch(() => "");
  const images = new Map();
  for (const match of text.matchAll(/id:\s*"([^"]+)"[\s\S]{0,520}?image:\s*"([^"]+)"/g)) {
    if (!images.has(match[1])) images.set(match[1], match[2]);
  }
  return images;
}

function projectPreviewImage(projectId = "") {
  const fallback = {
    olara: "/projects/olara/media/olara-hero-exterior-1536x1024.jpg",
    rosewood: "/projects/rosewood/media/rosewood-rendering-hero.jpg",
    "nora-house": "/projects/nora-house/media/user-provided-nora-house-card.jpg",
    "mandarin-oriental": "/projects/mandarin-oriental/media/mandarin-oriental-exterior-hero-source.jpg",
    "south-flagler-house": "/projects/south-flagler-house/media/card.jpg",
    shorecrest: "/projects/shorecrest/media/card.jpg",
  };
  return fallback[projectId] || "";
}

function imagePathFromImageId(imageId = "") {
  if (!imageId) return "";
  return `/assets/editorial/${imageId}.jpg`;
}

function defaultHomepageCardSections() {
  return Object.fromEntries(["hero", "map", "corridors", "updates", "guidance", "featuredBuildings", "cta"].map((key) => [key, { cards: {} }]));
}

function homepageSectionId(value) {
  const raw = clean(value);
  const aliases = {
    "featured-buildings": "featuredBuildings",
    featuredbuildings: "featuredBuildings",
  };
  return aliases[raw] || aliases[slug(raw)] || raw;
}

async function listPublicImages(root) {
  const entries = await fs.readdir(root, { withFileTypes: true }).catch(() => []);
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) files.push(...await listPublicImages(fullPath));
    else if (/\.(?:jpe?g|png|webp|svg)$/i.test(entry.name)) files.push(fullPath);
  }
  return files;
}

async function writeOverride(key, payload) {
  payload.version = 1;
  payload.updatedAt = new Date().toISOString();
  await fs.mkdir(overridesRoot, { recursive: true });
  await fs.writeFile(path.join(overridesRoot, overrideFiles[key]), `${JSON.stringify(payload, null, 2)}\n`);
}

async function readJsonFile(filePath, fallback) {
  const raw = await fs.readFile(filePath, "utf8").catch(() => "");
  if (!raw.trim()) return structuredClone(fallback);
  try {
    return JSON.parse(raw);
  } catch {
    return structuredClone(fallback);
  }
}

async function logChange(action, detail) {
  const log = await readJsonFile(changeLogPath, { version: 1, entries: [] });
  log.entries.unshift({ at: new Date().toISOString(), action, detail });
  await fs.writeFile(changeLogPath, `${JSON.stringify(log, null, 2)}\n`);
  const builderLog = await readJsonFile(builderChangeLogPath, { version: 1, entries: [] });
  builderLog.entries.unshift({ at: new Date().toISOString(), action, detail });
  await fs.writeFile(builderChangeLogPath, `${JSON.stringify(builderLog, null, 2)}\n`);
}

async function logPreviewRun(action, detail) {
  try {
    await fs.mkdir(path.dirname(articlePreviewLogPath), { recursive: true });
    const log = await readJsonFile(articlePreviewLogPath, { version: 1, entries: [] });
    log.entries.unshift({ at: new Date().toISOString(), action, detail });
    await fs.writeFile(articlePreviewLogPath, `${JSON.stringify(log, null, 2)}\n`);
  } catch {
    // preview log is best-effort; never fail the preview run over a log write
  }
}

async function logArticleWorkflow(action, detail) {
  try {
    await fs.mkdir(path.dirname(articleWorkflowLogPath), { recursive: true });
    const log = await readJsonFile(articleWorkflowLogPath, { version: 1, entries: [] });
    log.entries.unshift({ at: new Date().toISOString(), action, detail });
    await fs.writeFile(articleWorkflowLogPath, `${JSON.stringify(log, null, 2)}\n`);
  } catch {
    // workflow log is best-effort; never fail the run over a log write
  }
}

async function logNewsDraftAction(action, detail) {
  try {
    await fs.mkdir(path.dirname(newsDraftActionLogPath), { recursive: true });
    const log = await readJsonFile(newsDraftActionLogPath, { version: 1, entries: [] });
    log.entries.unshift({ at: new Date().toISOString(), action, detail });
    await fs.writeFile(newsDraftActionLogPath, `${JSON.stringify(log, null, 2)}\n`);
  } catch {
    // draft action log is best-effort
  }
}

// ─── Visual Editor endpoints ──────────────────────────────────────────────────

const visualEditorCommitAllowlist = [
  "research/content-editor/site-overrides.json",
  "src/generated/editorOverrides.ts",
  "content/overrides/homepage-card-overrides.json",
  "content/overrides/homepage-overrides.json",
  "content/overrides/content-studio-change-log.json",
  "public/assets/editorial",
  "public/projects",
];

/** Save a single project override and regenerate editorOverrides.ts. */
async function saveVisualProjectOverride(request, response) {
  const body = await readJson(request);
  const projectId = slug(body.projectId);
  if (!projectId) return sendJson(response, { ok: false, error: "projectId is required" }, 400);

  const allowedFields = ["name", "status", "delivery", "deliveryYear", "residences", "price", "image", "summary", "pageState", "address"];
  const override = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined && body[field] !== "") {
      override[field] = field === "deliveryYear" ? Number(body[field]) : clean(body[field]);
    }
  }

  // Read current overrides, update this project, write back
  const { readEditorOverrides, writeEditorOverrides } = await import("../../research/scripts/sync-editor-overrides.mjs");
  const current = await readEditorOverrides();
  current.projects = current.projects ?? {};
  if (body.revert) {
    delete current.projects[projectId];
  } else {
    current.projects[projectId] = { ...(current.projects[projectId] ?? {}), ...override };
  }
  await writeEditorOverrides(current);
  await logChange("visual-editor-project-override", { projectId, fields: Object.keys(override) });
  return sendJson(response, { ok: true, projectId, override: current.projects[projectId] ?? null });
}

/** Run typecheck + qa:content-studio + image size checks. */
async function visualEditorPreCommitCheck(request, response) {
  const checks = [];

  // Check 1: typecheck
  const tsCheck = await run("npm", ["run", "typecheck", "--silent"]);
  checks.push({
    name: "TypeScript typecheck",
    pass: tsCheck.code === 0,
    detail: tsCheck.code !== 0 ? tsCheck.stdout.slice(0, 600) + tsCheck.stderr.slice(0, 200) : "No errors",
  });

  // Check 2: qa:content-studio
  const qaCheck = await run("npm", ["run", "qa:content-studio", "--silent"]);
  let qaPass = qaCheck.code === 0;
  let qaDetail = "pass";
  try {
    const parsed = JSON.parse(qaCheck.stdout.trim().split("\n").pop() ?? "{}");
    qaPass = parsed.contentStudioSafety === "pass";
    qaDetail = parsed.contentStudioSafety ?? qaCheck.stdout.slice(0, 300);
  } catch { qaDetail = qaCheck.stdout.slice(0, 300); }
  checks.push({ name: "Content studio safety (qa:content-studio)", pass: qaPass, detail: qaDetail });

  // Check 3: image file size — scan all images in visual editor allowlist paths
  const imagePaths = [];
  for (const allow of visualEditorCommitAllowlist) {
    if (!allow.startsWith("public/")) continue;
    const dir = path.join(workspace, allow);
    const dirStat = await fs.stat(dir).catch(() => null);
    if (!dirStat?.isDirectory()) continue;
    const entries = await fs.readdir(dir, { recursive: true }).catch(() => []);
    for (const entry of entries) {
      if (/\.(jpe?g|png|webp)$/i.test(entry)) imagePaths.push(path.join(dir, entry));
    }
  }
  const oversized = [];
  for (const imgPath of imagePaths) {
    const stat = await fs.stat(imgPath).catch(() => null);
    if (stat && stat.size > IMAGE_MAX_BYTES) {
      oversized.push({ path: path.relative(workspace, imgPath), sizeKB: Math.round(stat.size / 1024) });
    }
  }
  checks.push({
    name: "Image file sizes (≤750 KB each)",
    pass: oversized.length === 0,
    detail: oversized.length === 0 ? "All images within limit" : oversized.map((f) => `${f.path} (${f.sizeKB} KB)`).join(", "),
  });

  const allPass = checks.every((c) => c.pass);
  return sendJson(response, { ok: true, allPass, checks });
}

/** Commit and push visual editor changes after pre-commit check passes. */
async function visualEditorCommit(request, response) {
  const body = await readJson(request);
  const remote = remoteContext(request);
  if (remote.isRemote && !body.confirmRemote) {
    return sendJson(response, { ok: false, error: "Remote commit requires confirmRemote: true" }, 400);
  }

  // Verify nothing outside the allowlist is dirty
  const status = await run("git", ["status", "--short"]);
  const dirtyFiles = status.stdout.split("\n")
    .filter(Boolean)
    .map((line) => { const m = line.match(/^..\s+(.*)/); return m ? m[1].trim() : line.trim(); });

  const disallowed = dirtyFiles.filter((f) => !visualEditorCommitAllowlist.some((allow) =>
    allow.endsWith("/") ? f.startsWith(allow) : (f === allow || f.startsWith(`${allow}/`))
  ));
  if (disallowed.length > 0) {
    return sendJson(response, {
      ok: false,
      error: `Cannot commit — unrelated dirty files: ${disallowed.join(", ")}. Clean them first.`,
      disallowed,
    }, 400);
  }

  const filesToCommit = dirtyFiles.filter((f) => visualEditorCommitAllowlist.some((allow) =>
    allow.endsWith("/") ? f.startsWith(allow) : (f === allow || f.startsWith(`${allow}/`))
  ));
  if (!filesToCommit.length) return sendJson(response, { ok: false, error: "No visual editor changes to commit." }, 400);

  const commitMessage = clean(body.commitMessage) || "Visual Editor: update site content via Content Studio";
  const result = await autoCommitAndPush(commitMessage, filesToCommit);
  if (!result.ok) return sendJson(response, result, 500);
  await logChange("visual-editor-commit", { files: filesToCommit, message: commitMessage });
  return sendJson(response, { ok: true, committed: result.committed, pushed: result.pushed, files: filesToCommit });
}

// ─────────────────────────────────────────────────────────────────────────────

const articleCommitAllowlist = [
  "research/news-review/approved-development-news.json",
  "src/data/approvedExternalNews.ts",
  "src/data/marketNotes.ts",
  "src/generated/siteData.ts",
  "public/data/news-feed.json",
  "public/feed.json",
  "public/rss.xml",
  "public/llms.txt",
  "public/sitemap.xml",
  "public/assets/editorial",
  "content/overrides/change-log.json",
  "content/overrides/content-studio-change-log.json",
];

async function autoCommitAndPush(commitMessage, filesToCommit) {
  const addResult = await run("git", ["add", "--", ...filesToCommit]);
  if (addResult.code !== 0) return { ok: false, error: `git add failed: ${addResult.stderr.slice(0, 200)}` };
  const staged = await run("git", ["diff", "--cached", "--name-only"]);
  if (!staged.stdout.trim()) return { ok: true, committed: false, pushed: false, reason: "Nothing changed" };
  const commitResult = await run("git", ["commit", "-m", commitMessage]);
  if (commitResult.code !== 0) return { ok: false, error: `git commit failed: ${commitResult.stderr.slice(0, 200)}` };
  const pushResult = await run("git", ["push", "origin", "main"]);
  if (pushResult.code !== 0) return { ok: false, error: `git push failed: ${pushResult.stderr.slice(0, 200)}` };
  return { ok: true, committed: true, pushed: true };
}

function isInArticleAllowlist(filePath) {
  for (const allowed of articleCommitAllowlist) {
    if (filePath === allowed) return true;
    if (allowed.endsWith("/")) {
      if (filePath.startsWith(allowed)) return true;
      continue;
    }
    if (allowed.includes("/")) {
      if (filePath.startsWith(`${allowed}/`)) return true;
    }
  }
  return false;
}

async function commitStagedArticle(request, response) {
  const body = await readJson(request);
  const remote = remoteContext(request);
  const status = await run("git", ["status", "--short"]);
  const dirtyLines = status.stdout.split("\n").filter(Boolean);
  const dirtyFiles = dirtyLines.map((line) => {
    const match = line.match(/^(..?)\s+(.*)$/);
    return match ? match[2].trim() : line.trim();
  });

  if (!dirtyFiles.length) {
    return sendJson(response, { ok: false, error: "No staged changes to commit. Stage an article first." }, 400);
  }

  const disallowed = dirtyFiles.filter((f) => !isInArticleAllowlist(f));
  if (disallowed.length) {
    return sendJson(response, {
      ok: false,
      error: `Cannot commit because unrelated files are dirty: ${disallowed.join(", ")}. Clear them first.`,
      disallowed,
    }, 400);
  }

  const commitMessage = clean(body.commitMessage || body.title || body.slug || "Commit staged article changes");
  const filesToCommit = dirtyFiles.filter((f) => isInArticleAllowlist(f));

  if (body.confirmCommit !== true) {
    return sendJson(response, {
      ok: true,
      preview: true,
      files: filesToCommit,
      commitMessage,
      nextStep: "Review the files above, check the confirmation box, then click Commit Staged Article Changes again.",
    });
  }

  if (remote.isRemote && body.confirmRemote !== true) {
    return sendJson(response, { ok: false, error: "Remote Builder Mode requires the remote confirmation checkbox before committing." }, 400);
  }

  for (const file of filesToCommit) {
    await run("git", ["add", "--", file]);
  }
  const commitResult = await run("git", ["commit", "-m", commitMessage]);
  if (commitResult.code !== 0) {
    return sendJson(response, { ok: false, error: `git commit failed: ${commitResult.stderr || commitResult.stdout}` }, 500);
  }
  const commitHash = (await run("git", ["rev-parse", "HEAD"])).stdout.trim();
  const branchResult = await run("git", ["branch", "--show-current"]);
  const branch = clean(branchResult.stdout) || "main";
  const pushResult = await run("git", ["push", "origin", branch]);
  if (pushResult.code !== 0) {
    return sendJson(response, { ok: false, error: `git push failed: ${pushResult.stderr || pushResult.stdout}`, commitHash }, 500);
  }

  return sendJson(response, {
    ok: true,
    commitHash,
    pushed: true,
    changedFiles: filesToCommit,
    commitMessage,
  });
}

async function automationStatus() {
  const launchctl = await run("launchctl", ["list"]);
  const gh = await githubAuthStatus();
  const drafts = await readDraftStore();
  const importedDrafts = drafts.items.filter((item) => item.importedFromIssue?.number);
  const latestImport = importedDrafts.at(-1);
  const dailyAgent = path.join(launchAgentRoot, "com.brooke.wpb-daily-site-maintenance.plist");
  const newsPublisherAgent = path.join(launchAgentRoot, "com.brooke.wpb-news-publisher.plist");
  const deployReport = await lastReport("research/source-material-review/deploy-report.json");
  const newsletterReport = await lastReport("content/newsletter-digest-drafts.json");
  return {
    scripts: ["daily:maintenance", "news:import-gpt", "news:daily-publisher", "news:publish-queued", "newsletter:draft", "qa:live"],
    githubAuth: gh,
    githubPath: await commandPath("gh"),
    loadedLaunchAgents: launchctl.stdout.split("\n").filter((line) => /wpb|news|maintenance/i.test(line)).map((line) => line.trim()).filter(Boolean),
    gptIssueImport: {
      label: importedDrafts.length ? "Healthy" : "Not run yet",
      lastImportTime: latestImport?.updatedAt || latestImport?.createdAt || "",
      lastImportedIssue: latestImport?.importedFromIssue ? `#${latestImport.importedFromIssue.number} ${latestImport.importedFromIssue.title || latestImport.rewrittenHeadline || ""}`.trim() : "",
      importedDraftCount: importedDrafts.length,
    },
    gptIssueImportStatus: importedDrafts.length
      ? `${importedDrafts.length} imported draft(s); latest issue #${importedDrafts.at(-1).importedFromIssue.number}`
      : "No GPT issue imports found in content/news-drafts.json",
    condoScanLoaded: launchctl.stdout.includes("com.brooke.wpb-condo-scan"),
    dailyMaintenanceInstalled: await exists(dailyAgent),
    dailyMaintenanceLoaded: launchctl.stdout.includes("com.brooke.wpb-daily-site-maintenance"),
    dailyMaintenanceNextRun: "Daily at 9:00 AM local time when installed from launchd/com.brooke.wpb-daily-site-maintenance.plist",
    dailyMaintenanceManualRun: "npm run daily:maintenance",
    dailyMaintenanceLastReport: await lastReport("research/source-material-review/daily-maintenance-report.md"),
    newsPublisherInstalled: await exists(newsPublisherAgent),
    newsPublisherLoaded: launchctl.stdout.includes("com.brooke.wpb-news-publisher"),
    newsPublisherNextRun: "Daily at 9:20 AM local time when installed from launchd/com.brooke.wpb-news-publisher.plist",
    newsPublisherManualRun: "npm run news:daily-publisher",
    newsPublisherDryRun: "npm run news:daily-publisher -- --dry-run",
    newsPublisherLastReport: await lastReport("research/source-material-review/news-publisher-report.md"),
    newsletterLastGenerated: newsletterReport,
    lastDeployResult: deployReport.exists ? "Healthy" : "Not run yet",
    cloudflareDeployStatus: deployReport.exists ? "Deploy report found" : "No deploy report found",
    reports: [
      "research/source-material-review/news-publisher-report.md",
      "research/source-material-review/news-daily-publisher-report.md",
      "research/source-material-review/daily-maintenance-report.md",
      "research/source-material-review/gpt-news-issue-import-test.md",
      "content/newsletter-digest-drafts.json",
    ],
    developerImageImportInstalled: await exists(path.join(process.env.HOME ?? "", "Library/LaunchAgents/com.brooke.wpb-developer-image-import.plist")),
  };
}

async function commandPath(command) {
  const result = await run("bash", ["-lc", `command -v ${command} || true`]);
  const found = result.stdout.trim();
  if (found) return found;
  const local = path.join(process.env.HOME ?? "", ".local/bin", command);
  if (await exists(local)) return local;
  return "Not installed";
}

async function githubAuthStatus() {
  const gh = await run("gh", ["auth", "status"]);
  const tokenAvailable = Boolean(process.env.GITHUB_TOKEN || process.env.GH_TOKEN);
  if (gh.code === 0) return { mode: "gh", status: "authenticated", tokenFallbackAvailable: tokenAvailable };
  if (/ENOENT|not found|command not found/i.test(gh.stderr)) {
    const localGh = path.join(process.env.HOME ?? "", ".local/bin/gh");
    if (await exists(localGh)) {
      const localStatus = await run(localGh, ["auth", "status"]);
      if (localStatus.code === 0) {
        return {
          mode: "local-gh",
          status: `${localGh} authenticated`,
          tokenFallbackAvailable: tokenAvailable,
        };
      }
      return {
        mode: tokenAvailable ? "token-fallback" : "local-gh",
        status: tokenAvailable ? `${localGh} unavailable; token fallback available` : `${localGh} installed but not authenticated`,
        tokenFallbackAvailable: tokenAvailable,
      };
    }
    return {
      mode: tokenAvailable ? "token-fallback" : "unauthenticated",
      status: tokenAvailable ? "GH_TOKEN/GITHUB_TOKEN available in Builder process" : "gh CLI not installed in Builder process",
      tokenFallbackAvailable: tokenAvailable,
    };
  }
  return {
    mode: tokenAvailable ? "token-fallback" : "gh",
    status: tokenAvailable ? "gh unavailable; token fallback available" : "gh installed but not authenticated",
    tokenFallbackAvailable: tokenAvailable,
  };
}

async function statusCards(remote = { isRemote: false }) {
  const [gitStatus, gitBranch, lastBuild, lastDeploy, liveBundle] = await Promise.all([
    run("git", ["status", "--short"]),
    run("git", ["branch", "--show-current"]),
    exists(path.join(workspace, "dist/index.html")),
    exists(path.join(workspace, "research/source-material-review/deploy-report.json")),
    run("bash", ["-lc", "curl --max-time 5 -Ls https://www.wpbnewconstruction.com/ | grep -o '/assets/index-[^\" ]*\\.js' | head -1"]),
  ]);
  return {
    builderMode: remote.isRemote ? `Remote via ${remote.host || "Cloudflare tunnel"}` : "Local only",
    gitBranch: gitBranch.stdout.trim() || "unknown",
    workingTreeStatus: gitStatus.stdout.trim() || "clean",
    lastBuildResult: lastBuild ? "dist exists" : "no local dist build found",
    lastDeployResult: lastDeploy ? "deploy report exists" : "no deploy report found",
    liveBundle: liveBundle.stdout.trim() || "not checked",
    dailyNewsAutomationStatus: "GPT issue import available with npm run news:import-gpt",
    dailySiteMaintenanceStatus: "daily:maintenance configured",
  };
}

function remoteContext(request) {
  const host = clean(request?.headers?.host).split(":")[0].toLowerCase();
  const forwardedHost = clean(request?.headers?.["x-forwarded-host"]).split(":")[0].toLowerCase();
  const cfRay = clean(request?.headers?.["cf-ray"]);
  const envRemote = process.env.BROOKE_BUILDER_REMOTE_MODE === "true";
  const matchedHost = [host, forwardedHost].find((value) => remoteHostnames.includes(value));
  const isRemote = envRemote || Boolean(matchedHost) || (Boolean(cfRay) && remoteHostnames.includes(forwardedHost));
  return {
    isRemote,
    host: matchedHost || forwardedHost || host || "",
    recommendedHostname: "builder.wpbnewconstruction.com",
    accessRequired: true,
    message: isRemote
      ? "Remote Builder Mode - connected through Cloudflare Access. Extra confirmation required before publishing."
      : "Local Builder Mode - bound to 127.0.0.1.",
    desktopNote: "Desktop Mac must remain awake and Brooke Builder must keep running.",
  };
}

async function reportsIndex() {
  const reports = [];
  for (const definition of reportDefinitions) {
    const filePath = path.join(workspace, definition.path);
    const stat = await fs.stat(filePath).catch(() => null);
    reports.push({
      ...definition,
      exists: Boolean(stat),
      updatedAt: stat?.mtime?.toISOString?.() ?? "",
      bytes: stat?.size ?? 0,
    });
  }
  return { ok: true, reports };
}

async function reportBody(relativePath) {
  const definition = reportDefinitions.find((item) => item.path === relativePath);
  if (!definition) return { ok: false, error: "Report is not on the approved Builder report list." };
  const filePath = path.join(workspace, definition.path);
  const text = await fs.readFile(filePath, "utf8").catch(() => "");
  return { ok: Boolean(text), ...definition, text };
}

async function projectIntelligenceReview() {
  const projects = [];
  const intelligences = [];
  for (const entry of projectIntelligenceRegistryEntries) {
    const intelligence = await getProjectIntelligence(entry.publicSlug);
    intelligences.push(intelligence);
    const schemaEmittedFields = Object.entries(intelligence.schemaSafety.safeFields)
      .map(([field, value]) => ({ field, value }))
      .sort((a, b) => a.field.localeCompare(b.field));
    projects.push({
      slug: intelligence.publicIdentity.slug,
      name: intelligence.publicIdentity.displayName,
      route: intelligence.publicIdentity.route,
      corridor: intelligence.publicIdentity.corridor,
      status: intelligence.publicIdentity.status,
      compareDatabaseId: intelligence.compare.id || "",
      compareDatabaseSlug: intelligence.compare.slug || "",
      sourceCatalogIds: intelligence.sourceCatalog.ids,
      hasCompareRow: Boolean(intelligence.compare.record),
      hasSourceMapping: intelligence.sourceCatalog.ids.length > 0,
      conflictCount: intelligence.reviewSummary.reviewFields,
      reviewSummary: intelligence.reviewSummary,
      missingDataFlags: intelligence.missingDataFlags,
      schemaEmittedFields,
      schemaOmittedFields: intelligence.schemaSafety.omittedFields,
      fieldReviews: intelligence.fieldReviews,
      conflicts: intelligence.conflicts,
    });
  }
  projects.sort((a, b) => b.conflictCount - a.conflictCount || a.name.localeCompare(b.name));
  const queue = buildProjectIntelligenceReviewQueue(intelligences);
  return {
    ok: true,
    updatedAt: new Date().toISOString(),
    summary: {
      projects: projects.length,
      withCompareRows: projects.filter((item) => item.hasCompareRow).length,
      withSourceMappings: projects.filter((item) => item.hasSourceMapping).length,
      withIssues: projects.filter((item) => item.conflictCount > 0 || item.schemaOmittedFields.length > 0).length,
      totalIssues: queue.summary.totalIssues,
      priority1Issues: queue.summary.priority1Issues,
      priority2Issues: queue.summary.priority2Issues,
      missingCompareRows: queue.summary.missingCompareRows,
      missingSourceMappings: queue.summary.missingSourceMappings,
      projectsWithMostConflicts: queue.summary.projectsWithMostConflicts,
    },
    projects,
    queueRows: queue.rows,
    queueSummary: queue.summary,
  };
}

function normalizeFocalPoint(body) {
  const x = clampNumber(body.focalPointX ?? body.focalX ?? body.x, 0, 100, 50);
  const y = clampNumber(body.focalPointY ?? body.focalY ?? body.y, 0, 100, 50);
  return { x, y };
}

function imagePositionFromBody(body, focalPoint) {
  const preset = clean(body.imagePositionPreset || body.imagePosition);
  const presets = new Set(["center center", "top center", "bottom center", "left center", "right center"]);
  if (presets.has(preset)) return preset;
  return `${focalPoint.x}% ${focalPoint.y}%`;
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, Math.round(number)));
}

async function appendImageCaptionOverride(entry) {
  const captions = await readOverride("imageCaptions");
  captions.items = upsertBy(captions.items ?? [], "imagePath", {
    imagePath: entry.path,
    caption: entry.caption,
    alt: entry.alt,
    credit: entry.sourceRightsNote,
    status: entry.status,
    assignedSection: entry.targetType,
    assignedProject: entry.projectId,
    updatedAt: entry.updatedAt,
  });
  await writeOverride("imageCaptions", captions);
}

function upsertBy(items, key, entry) {
  const index = items.findIndex((item) => item[key] === entry[key]);
  if (index >= 0) return items.map((item, itemIndex) => itemIndex === index ? { ...item, ...entry } : item);
  return [entry, ...items];
}

function validatePublicFields(body, fields) {
  const forbidden = /\b(needs_review|generated|placeholder|internal|data model|source-material)\b/i;
  return fields.flatMap((field) => forbidden.test(clean(body[field])) ? [`${field} contains a backend/admin phrase.`] : []);
}

const IMAGE_MAX_BYTES = 750 * 1024; // 750 KB hard limit

async function optimizeImage(inputPath, outputPath, maxWidth) {
  const inputBuf = await fs.readFile(inputPath);
  const outputBuf = await sharp(inputBuf)
    .rotate()
    .resize({ width: maxWidth, withoutEnlargement: true, fit: "inside" })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  if (outputBuf.length > IMAGE_MAX_BYTES) {
    throw new Error(
      `Optimized image is ${Math.round(outputBuf.length / 1024)} KB, which exceeds the 750 KB limit. ` +
      `Try a smaller source image, reduce resolution, or crop tighter.`
    );
  }
  await fs.writeFile(outputPath, outputBuf);
}

function maxWidthFor(targetType) {
  return ["projectHero", "editorial", "marketNote", "update", "buyerInterior"].includes(targetType) ? 2200 : 1600;
}

async function sendFile(response, fileName, contentType) {
  const body = await fs.readFile(path.join(studioRoot, fileName));
  response.writeHead(200, { "content-type": contentType, "cache-control": "no-store" });
  response.end(body);
}

async function maybeSendPublicAsset(urlPath, response) {
  if (!/^\/(?:assets|projects|hero|team-resources)\//.test(urlPath)) return false;
  const decoded = decodeURIComponent(urlPath);
  const assetPath = path.normalize(path.join(workspace, "public", decoded));
  const publicRoot = path.join(workspace, "public");
  if (!assetPath.startsWith(publicRoot)) return false;
  const body = await fs.readFile(assetPath).catch(() => null);
  if (!body) return false;
  response.writeHead(200, {
    "content-type": contentTypeFor(assetPath),
    "cache-control": "public, max-age=300",
  });
  response.end(body);
  return true;
}

function contentTypeFor(filePath) {
  if (/\.jpe?g$/i.test(filePath)) return "image/jpeg";
  if (/\.png$/i.test(filePath)) return "image/png";
  if (/\.webp$/i.test(filePath)) return "image/webp";
  if (/\.svg$/i.test(filePath)) return "image/svg+xml";
  return "application/octet-stream";
}

async function readJson(request, limit = 1024 * 1024) {
  let raw = "";
  for await (const chunk of request) {
    raw += chunk;
    if (raw.length > limit) throw new Error("Request body too large");
  }
  return raw ? JSON.parse(raw) : {};
}

function sendJson(response, payload, status = 200) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  response.end(`${JSON.stringify(payload, null, 2)}\n`);
}

function sendJsonCors(response, payload, status = 200, origin = "http://localhost:5173") {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "access-control-allow-origin": origin,
  });
  response.end(`${JSON.stringify(payload, null, 2)}\n`);
}

function sendText(response, text, status = 200) {
  response.writeHead(status, { "content-type": "text/plain; charset=utf-8" });
  response.end(text);
}

function run(command, args) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { cwd: workspace });
    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (chunk) => { stdout += chunk; });
    child.stderr?.on("data", (chunk) => { stderr += chunk; });
    child.on("error", (error) => resolve({ code: 1, stdout, stderr: error.message }));
    child.on("close", (code) => resolve({ code: code ?? 1, stdout, stderr }));
  });
}

async function changedFiles() {
  const status = await run("git", ["status", "--short"]);
  return status.stdout.split("\n").map((line) => line.trim()).filter(Boolean);
}

function parseBodySections(text, fallback = []) {
  const raw = clean(text);
  if (!raw) return fallback;
  return raw.split(/\n{2,}/).map((block) => {
    const [heading, ...bodyLines] = block.split("\n");
    return { heading: clean(heading), body: clean(bodyLines.join("\n")) };
  }).filter((section) => section.heading && section.body);
}

function nextStepForNewsDraft(draft) {
  if (draft.status === "queued") return "Run Publish Queued after QA passes, or generate a newsletter draft.";
  if (draft.status === "scheduled") return "Confirm scheduled timing, then run QA before publishing.";
  if (draft.status === "blocked") return "No publish action will run for this draft.";
  if (draft.status === "published") return "Run QA and review public news output before deploy.";
  return "Continue editing, then approve or block the draft.";
}

function nextStepForWorkflow(workflow) {
  const steps = {
    preview: "Review changed files before running QA.",
    qa: "If QA passed, review git diff before Update Site or deploy.",
    "news-import": "Open News Desk and edit, approve, block, schedule, or send imported drafts to newsletter.",
    "news-daily-publisher": "Review the news publisher report and changed files before publishing.",
    "news-publish": "Run QA before deploying any published news output.",
    newsletter: "Review content/newsletter-digest-drafts.json before sending.",
    "daily-maintenance": "Review the daily maintenance report and changed files before publishing.",
    update: "Review git diff; deploy only after checks pass.",
    "update-deploy": "Verify live site health and public bundle.",
  };
  return steps[workflow] ?? "Review output and changed files.";
}

async function lastReport(relativePath) {
  const filePath = path.join(workspace, relativePath);
  const stat = await fs.stat(filePath).catch(() => null);
  if (!stat) return { path: relativePath, exists: false };
  return { path: relativePath, exists: true, updatedAt: stat.mtime.toISOString() };
}

function clean(value) {
  return String(value ?? "").replace(/\r\n/g, "\n").trim();
}

function lines(value) {
  return clean(value).split(/\n+/).map(clean).filter(Boolean);
}

function slug(value) {
  return clean(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function exists(filePath) {
  return fs.access(filePath).then(() => true).catch(() => false);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
