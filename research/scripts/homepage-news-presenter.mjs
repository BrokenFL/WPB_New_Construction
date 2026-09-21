import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";

const repoRoot = process.cwd();
const mainSource = await fs.readFile(path.join(repoRoot, "src/main.ts"), "utf8");

function extractFunction(sourceFile, name) {
  let found;
  function visit(node) {
    if (found) return;
    if (ts.isFunctionDeclaration(node) && node.name?.text === name) found = node;
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  assert.ok(found, `Could not extract ${name} from src/main.ts`);
  return mainSource.slice(found.getStart(sourceFile), found.end);
}

const sourceFile = ts.createSourceFile("main.ts", mainSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
const extracted = [
  "homepageDeskDisplayVariants",
  "homepageDeskDisplayVariant",
  "homepageDeskCopy",
  "homepageDeskVisual",
  "renderHomepageDeskFigure",
  "renderHomepageLatestDevelopments",
  "newsDisplayDate",
].map((name) => extractFunction(sourceFile, name));

const transpiled = ts.transpileModule(
  `${extracted.join("\n")}\nglobalThis.__presenters = { homepageDeskDisplayVariants, homepageDeskDisplayVariant, homepageDeskCopy, homepageDeskVisual, renderHomepageDeskFigure, renderHomepageLatestDevelopments, newsDisplayDate };`,
  {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.None,
    },
  },
).outputText;

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function fixture(overrides = {}) {
  return {
    id: "future-news",
    slug: "future-news",
    title: "Future project update",
    buyerTakeaway: "Future buyer takeaway",
    summary: "Future summary",
    sourceName: "Approved source",
    sourceUrl: "https://example.invalid/source",
    canonicalUrl: "https://example.invalid/source",
    publishedAt: "2026-09-10",
    sourcePublishedDate: "2026-09-01",
    eventDate: "2026-09-15",
    dateDiscovered: "2026-09-16",
    fetchedAt: "2026-09-17",
    freshnessLane: "recent_30d",
    category: "development",
    relatedProjectIds: [],
    relatedCorridorIds: [],
    relatedProjectSlugs: [],
    relatedCorridors: [],
    status: "published",
    ...overrides,
  };
}

export function createHomepageNewsPresenter() {
  const context = {
    publishedExternalNews: [],
    corridorSections: [{ key: "north-flagler", label: "North Flagler" }],
    relatedProjectsForArticle(item) {
      return (item.relatedProjectIds ?? []).map((id) => ({ id, name: id === "alba-palm-beach" ? "Alba Palm Beach" : id }));
    },
    updateArticleContent(item) {
      return { excerpt: item.summary || item.buyerTakeaway || item.title };
    },
    safeHref(value) {
      return String(value ?? "");
    },
    escapeHtml,
    publicText: escapeHtml,
    updatePath(item) {
      return `/updates/${item.slug || item.id}/`;
    },
    projectPath(project) {
      return `/projects/${project.id}/`;
    },
    corridorPath(key) {
      return `/corridors/${key}/`;
    },
    renderCtaTrackingAttrs() {
      return "data-track-cta=\"true\"";
    },
    formatNewsDate(value) {
      return value;
    },
  };
  vm.createContext(context);
  vm.runInContext(transpiled, context, { filename: "homepage-news-presenters.js" });
  return {
    context,
    presenters: context.__presenters,
    render(items) {
      context.publishedExternalNews = items;
      return context.__presenters.renderHomepageLatestDevelopments();
    },
  };
}
