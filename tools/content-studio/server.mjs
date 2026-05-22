import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { syncEditorOverrides } from "../../research/scripts/sync-editor-overrides.mjs";
import { newsletterDraftsPath, readDraftStore, readJsonFile as readNewsJsonFile, writeDraftStore } from "../../research/scripts/news-draft-utils.mjs";

const workspace = process.cwd();
const studioRoot = path.join(workspace, "tools/content-studio");
const overridesRoot = path.join(workspace, "content/overrides");
const legacyEditorOverridesPath = path.join(workspace, "research/content-editor/site-overrides.json");
const changeLogPath = path.join(overridesRoot, "change-log.json");
const builderChangeLogPath = path.join(overridesRoot, "content-studio-change-log.json");
const port = Number(process.env.WPB_CONTENT_STUDIO_PORT ?? 8787);

const overrideFiles = {
  projectCopy: "project-copy-overrides.json",
  pageCopy: "page-copy-overrides.json",
  projectImages: "project-image-overrides.json",
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
      if (request.method === "GET" && url.pathname === "/api/state") return sendJson(response, await state());
      if (request.method === "POST" && url.pathname === "/api/project-copy") return saveProjectCopy(request, response);
      if (request.method === "POST" && url.pathname === "/api/page-copy") return savePageCopy(request, response);
      if (request.method === "POST" && url.pathname === "/api/upload-image") return uploadImage(request, response);
      if (request.method === "POST" && url.pathname === "/api/image-caption") return saveImageCaption(request, response);
      if (request.method === "POST" && url.pathname === "/api/project-update") return saveProjectUpdate(request, response);
      if (request.method === "POST" && url.pathname === "/api/team-resource") return saveTeamResource(request, response);
      if (request.method === "POST" && url.pathname === "/api/news-draft") return saveNewsDraft(request, response);
      if (request.method === "POST" && url.pathname === "/api/run-workflow") return runWorkflow(request, response);
      return sendText(response, "Not found", 404);
    } catch (error) {
      return sendJson(response, { ok: false, error: error.message }, 500);
    }
  });

  server.listen(port, "127.0.0.1", () => {
    console.log(`Brooke Builder running at http://127.0.0.1:${port}`);
    console.log("Local editorial tool only. Review Git diff before publishing.");
  });
}

async function state() {
  return {
    ok: true,
    projects: await readProjects(),
    overrides: await readAllOverrides(),
    news: await readDraftStore(),
    newsletter: await readNewsJsonFile(newsletterDraftsPath, { version: 1, updatedAt: "", items: [] }),
    automation: await automationStatus(),
    statusCards: await statusCards(),
    warning: "Local editorial tool. Changes write to repo files. Review Git diff before publishing.",
  };
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
  if (draft.riskLevel === "high" && ["queued", "scheduled"].includes(nextStatus)) {
    return sendJson(response, { ok: false, error: "High-risk drafts require manual review and cannot be queued from the quick action." }, 400);
  }
  draft.rewrittenHeadline = clean(body.rewrittenHeadline || draft.rewrittenHeadline);
  draft.deck = clean(body.deck || draft.deck);
  draft.buyerTakeaway = clean(body.buyerTakeaway || draft.buyerTakeaway);
  draft.newsletterBlurb = clean(body.newsletterBlurb || draft.newsletterBlurb);
  draft.suggestedImagePath = clean(body.suggestedImagePath || draft.suggestedImagePath);
  draft.status = nextStatus;
  draft.updatedAt = new Date().toISOString();
  await writeDraftStore(store);
  await logChange("news-draft", { id: draft.id, status: draft.status });
  return sendJson(response, { ok: true, draft });
}

async function runWorkflow(request, response) {
  const body = await readJson(request);
  const workflow = clean(body.workflow);
  const workflows = {
    preview: [["git", ["status", "--short"]]],
    qa: [["npm", ["run", "typecheck"]], ["npm", ["run", "build"]], ["npm", ["run", "qa:launch"]]],
    "news-import": [["npm", ["run", "news:import-gpt"]]],
    "news-publish": [["npm", ["run", "news:publish-queued"]]],
    newsletter: [["npm", ["run", "newsletter:draft"]]],
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
  return sendJson(response, { ok: true, workflow, results });
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
    imageCaptions: { version: 1, updatedAt: "", items: [] },
    editorialImages: { version: 1, updatedAt: "", items: [] },
    marketNotes: { version: 1, updatedAt: "", marketNotes: {} },
    updates: { version: 1, updatedAt: "", projectUpdates: {} },
    projectUpdates: { version: 1, updatedAt: "", projects: {} },
    teamResources: { version: 1, updatedAt: "", teamResources: [] },
  };
  return readJsonFile(path.join(overridesRoot, overrideFiles[key]), defaults[key]);
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

async function automationStatus() {
  const launchctl = await run("launchctl", ["list"]);
  return {
    scripts: ["daily:maintenance", "news:fetch", "news:promote", "import:developer-images", "review:developer-images", "qa:live"],
    condoScanLoaded: launchctl.stdout.includes("com.brooke.wpb-condo-scan"),
    dailyMaintenanceInstalled: await exists(path.join(process.env.HOME ?? "", "Library/LaunchAgents/com.brooke.wpb-daily-site-maintenance.plist")),
    developerImageImportInstalled: await exists(path.join(process.env.HOME ?? "", "Library/LaunchAgents/com.brooke.wpb-developer-image-import.plist")),
  };
}

async function statusCards() {
  const [gitStatus, lastBuild, lastDeploy, liveBundle] = await Promise.all([
    run("git", ["status", "--short"]),
    exists(path.join(workspace, "dist/index.html")),
    exists(path.join(workspace, "research/source-material-review/deploy-report.json")),
    run("bash", ["-lc", "curl --max-time 5 -Ls https://www.wpbnewconstruction.com/ | grep -o '/assets/index-[^\" ]*\\.js' | head -1"]),
  ]);
  return {
    workingTreeStatus: gitStatus.stdout.trim() || "clean",
    lastBuildResult: lastBuild ? "dist exists" : "no local dist build found",
    lastDeployResult: lastDeploy ? "deploy report exists" : "no deploy report found",
    liveBundle: liveBundle.stdout.trim() || "not checked",
    dailyNewsAutomationStatus: "GPT issue import available with npm run news:import-gpt",
    dailySiteMaintenanceStatus: "daily:maintenance configured",
  };
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

async function optimizeImage(inputPath, outputPath, maxWidth) {
  const result = await run("sips", ["-s", "format", "jpeg", "-Z", String(maxWidth), inputPath, "--out", outputPath]);
  if (result.code !== 0) {
    await fs.copyFile(inputPath, outputPath);
  }
}

function maxWidthFor(targetType) {
  return ["projectHero", "editorial", "marketNote", "update", "buyerInterior"].includes(targetType) ? 2200 : 1600;
}

async function sendFile(response, fileName, contentType) {
  const body = await fs.readFile(path.join(studioRoot, fileName));
  response.writeHead(200, { "content-type": contentType });
  response.end(body);
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
  response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
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
