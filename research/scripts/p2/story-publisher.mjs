import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { stableJson } from "../intel/core.mjs";

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
    sections: Array.isArray(pkg.sections) && pkg.sections.length ? pkg.sections : undefined,
    body: pkg.body || story.article_body || undefined,
    eventDate: pkg.eventDate || undefined,
    category: pkg.category || undefined,
    seoTitle: pkg.seoTitle || story.seo_title || undefined,
    seoDescription: pkg.seoDescription || story.seo_description || undefined,
    socialCopy: pkg.socialCopy || story.social_copy || undefined,
    heroImage: pkg.heroImage || undefined,
    bodyImages: Array.isArray(pkg.bodyImages) ? pkg.bodyImages : undefined,
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
      resolve({ ok: result?.ok === true, code, result, stderr: stderr.slice(-2000) });
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
  const prepared = articleInputFromStory(story);
  if (prepared.error) return { ok: false, error: prepared.error };
  const inputFile = await writeStoryInput(root, story.story_id, prepared.input);
  const outcome = await run({ root, inputFile });
  if (!outcome.ok) return { ok: false, error: outcome.error || outcome.result?.errors?.join("; ") || `publisher exit ${outcome.code}` };
  return {
    ok: true,
    liveUrl: outcome.result?.liveUrl || null,
    route: outcome.result?.route || null,
    published: outcome.result?.published ?? outcome.result?.committed ?? true,
  };
}

export function stableStoryPublishRecord(story) {
  return stableJson({ story_id: story.story_id, event_key: story.event_key, published_url: story.published_url });
}
