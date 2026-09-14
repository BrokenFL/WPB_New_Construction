#!/usr/bin/env node
// Fast Mode cycle runner — intended owner: GitHub Actions (15-minute cron or
// repository_dispatch), but also runnable locally with the same env.
//
// Required env:
//   P2_GOOGLE_SERVICE_ACCOUNT_JSON  service account with Sheets read/write on
//                                   the private intelligence spreadsheet
//   P2_GOOGLE_SHEET_ID              (defaults to the primary spreadsheet)
// Required for live mode:
//   P2_PUBLISH_PAT                  workflow checkout/push token so the normal
//                                   push-event deploy workflow fires
// Optional:
//   P2_SKIP_PUBLISH=1               process intel/facts only (sheet cycle)
//   P2_DRY_RUN=1                    run everything except git push/publish
import { execFile } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { safeHttpUrl } from "../intel/core.mjs";
import { verifySourceHint } from "../intel/source-verifier.mjs";
import { createGoogleSheetsIo } from "./google-sheets-io.mjs";
import { INCOMING_INTEL_SHEET, runFastCycle } from "./fast-cycle.mjs";
import { publishStory } from "./story-publisher.mjs";
import { FAST_MODE_POLICY_VERSION } from "./fast-policy.mjs";

const root = process.cwd();
const SHEET_ID = process.env.P2_GOOGLE_SHEET_ID || "1gVDZbH632Gmghea2eCXZFvAvcyJrDj7o6zjsQsRJ6a8";

function run(cmd, args, options = {}) {
  return new Promise((resolve) => {
    execFile(cmd, args, { cwd: root, maxBuffer: 16 * 1024 * 1024, ...options }, (error, stdout, stderr) => {
      resolve({ code: error ? error.code ?? 1 : 0, stdout: String(stdout), stderr: String(stderr) });
    });
  });
}

export function sourceHintsFromRow(row = {}, { additionalSources = [] } = {}) {
  const hints = [];
  const indexByUrl = new Map();
  const push = (url, sourceName, publishedDate, sourceType) => {
    const safe = safeHttpUrl(String(url || "").trim());
    if (!safe) return;
    const next = {
      url: safe,
      source_name: String(sourceName || "").trim(),
      published_date: String(publishedDate || "").trim() || undefined,
      source_type_hint: String(sourceType || "").trim() || undefined,
    };
    const existingIndex = indexByUrl.get(safe);
    if (existingIndex !== undefined) {
      const existing = hints[existingIndex];
      hints[existingIndex] = {
        ...existing,
        source_name: existing.source_name || next.source_name,
        published_date: existing.published_date || next.published_date,
        source_type_hint: existing.source_type_hint || next.source_type_hint,
      };
      return;
    }
    indexByUrl.set(safe, hints.length);
    hints.push(next);
  };

  let discovered = [];
  try {
    const parsed = typeof row.discovery_sources_json === "string"
      ? JSON.parse(row.discovery_sources_json || "[]")
      : row.discovery_sources_json;
    if (Array.isArray(parsed)) discovered = parsed;
  } catch {
    // A malformed optional source list never crashes the cycle. The legacy
    // source columns remain available and policy will fail closed if none can
    // be independently fetched.
  }
  for (const source of discovered) {
    if (!source || typeof source !== "object" || Array.isArray(source)) continue;
    push(
      source.url,
      source.name || source.source_name,
      source.published_date || source.source_published_date,
      source.source_type,
    );
  }
  // Keep every legacy source column independently. `lead_source_url` must not
  // hide a different `source_url`. Discovery entries are loaded first so their
  // per-source name/date metadata wins when the same URL appears in both.
  push(row.source_url, row.source_name, row.source_published_date);
  push(row.lead_source_url, row.source_name, row.source_published_date);
  push(row.primary_source_url, row.source_name, row.source_published_date);
  for (const source of additionalSources) {
    if (typeof source === "string") push(source, "", "");
    else if (source && typeof source === "object") push(source.url, source.source_name || source.name, source.published_date, source.source_type);
  }
  return hints;
}

async function fetchHintBatch(hints, verify) {
  const settled = await Promise.allSettled(hints.map((hint) => verify({ ...hint, claims_supported: [] })));
  return settled
    .filter((result) => result.status === "fulfilled")
    .map((result) => result.value)
    .filter((source) => source
      && !source.error
      && source.retrieval_status === "fetched"
      && source.retrieval_attested === true
      && source.reachable === true);
}

export async function fetchSources(row, { verify = verifySourceHint, indexes } = {}) {
  const intakeHints = sourceHintsFromRow(row);
  const intakeSources = await fetchHintBatch(intakeHints, verify);
  if (intakeSources.length) return intakeSources;

  // Legacy rows often preserve only a bot-blocked article URL. If every
  // intake URL fails, retry against reviewed canonical project sources. These
  // URLs are evidence candidates only: Fact Check must still bind a fetched
  // source to the exact claim before article or fact throughput can resume.
  const projectIds = String(row.related_project_ids || row.related_project_slug || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const canonicalHints = projectIds.flatMap((projectId) => indexes?.project_sources?.[projectId] || []);
  if (!canonicalHints.length) return [];
  const supplemental = sourceHintsFromRow({}, { additionalSources: canonicalHints });
  return fetchHintBatch(supplemental, verify);
}

async function publishWithSha({ story }) {
  const outcome = await publishStory({ root, story });
  if (!outcome.ok) return outcome;
  const head = await run("git", ["rev-parse", "HEAD"]);
  return { ...outcome, commitSha: head.stdout.trim() || null };
}

async function commitFactOutputs() {
  // Regenerate derived surfaces first so the commit carries the propagated
  // model/schema/site-data output in one shot.
  const regen = await run("npm", ["run", "research:site-intelligence"], { maxBuffer: 32 * 1024 * 1024 });
  if (regen.code !== 0) return { ok: false, error: `research:site-intelligence failed: ${regen.stderr.slice(-800)}` };
  const [tracked, untracked] = await Promise.all([
    run("git", ["diff", "--name-only", "-z"]),
    run("git", ["ls-files", "--others", "--exclude-standard", "-z"]),
  ]);
  if (tracked.code !== 0 || untracked.code !== 0) return { ok: false, error: "could not enumerate generated fact outputs" };
  const changedPaths = [...new Set(`${tracked.stdout}${untracked.stdout}`.split("\0").filter(Boolean))];
  const unexpected = changedPaths.filter((file) => !isAllowedFactOutputPath(file));
  if (unexpected.length) {
    return { ok: false, error: `unexpected files changed during fact regeneration: ${unexpected.slice(0, 10).join(", ")}` };
  }
  const add = await run("git", ["add", "--", ...changedPaths]);
  if (add.code !== 0) return { ok: false, error: `git add: ${add.stderr}` };
  const diff = await run("git", ["diff", "--cached", "--quiet"]);
  if (diff.code === 0) return { ok: true, committed: false };
  const commit = await run("git", ["commit", "-m", `p2: apply automated project-fact updates (${FAST_MODE_POLICY_VERSION})`]);
  if (commit.code !== 0) return { ok: false, error: `git commit: ${commit.stderr.slice(-400)}` };
  return { ok: true, committed: true };
}

const FACT_OUTPUT_FILES = new Set([
  "content/overrides/project-fact-automated.json",
  "public/feed.json",
  "public/rss.xml",
  "public/llms.txt",
  "public/robots.txt",
  "public/sitemap.xml",
  "research/source-material-review/floorplan-library.md",
  "research/source-material-review/image-candidate-catalog.md",
  "research/source-material-review/image-candidate-catalog.json",
  "research/source-material-review/metadata-answer-engine-plan.md",
]);
const FACT_OUTPUT_PREFIXES = ["src/generated/", "public/data/", "research/generated/"];

export function isAllowedFactOutputPath(file) {
  return FACT_OUTPUT_FILES.has(file) || FACT_OUTPUT_PREFIXES.some((prefix) => file.startsWith(prefix));
}

async function pushMain() {
  // actions/checkout configures the selected token without putting it in the
  // remote URL. Never persist P2_PUBLISH_PAT in .git/config.
  const push = await run("git", ["push", "origin", "main"]);
  return { ok: push.code === 0, stderr: push.stderr.slice(-400) };
}

export async function dryRunFactApplier({ mutations = [] } = {}) {
  return {
    changed: false,
    applied: [],
    skipped: mutations.map((mutation) => ({
      project_id: mutation.project_id,
      field: mutation.field,
      reason: "dry_run_no_fact_write",
    })),
  };
}

function rowsFromValues(values = []) {
  const headers = (values[0] || []).map(String);
  return values.slice(1).map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""])));
}

export function summarizeSheetState({ intelValues = [], storyValues = [] } = {}) {
  const intelRows = rowsFromValues(intelValues);
  const storyRows = rowsFromValues(storyValues);
  const countsBy = (rows, key) => rows.reduce((counts, row) => {
    const value = String(row[key] || "").trim() || "blank";
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {});
  const idCounts = intelRows.reduce((counts, row) => {
    const id = String(row.id || "").trim();
    if (id) counts.set(id, (counts.get(id) || 0) + 1);
    return counts;
  }, new Map());
  return {
    incoming_rows: intelRows.length,
    incoming_status_counts: countsBy(intelRows, "status"),
    awaiting_fact_check: intelRows.filter((row) => row.status === "awaiting_fact_check").length,
    packets_present: intelRows.filter((row) => String(row.p2_packet_json || "").trim()).length,
    handoffs_present: intelRows.filter((row) => String(row.fact_check_handoff_json || "").trim()).length,
    duplicate_id_groups: [...idCounts.values()].filter((count) => count > 1).length,
    duplicate_id_rows: [...idCounts.values()].filter((count) => count > 1).reduce((sum, count) => sum + count, 0),
    story_queue_rows: storyRows.length,
    story_status_counts: countsBy(storyRows, "status"),
  };
}

export function summarizeCycleActivity(cycle = {}) {
  const results = Array.isArray(cycle.results) ? cycle.results : [];
  const storyActions = Array.isArray(cycle.storyActions) ? cycle.storyActions : [];
  return {
    packets_emitted: results.filter((result) => result.packet_emitted === true).length,
    rows_transitioned_to_awaiting_fact_check: results.filter((result) => result.packet_emitted === true).length,
    valid_handoffs_accepted: results.filter((result) => result.stage === "decided" && result.review_retry === false).length,
    story_queue_items_created: storyActions.filter((action) => action.action === "queued_for_writer").length,
    source_retries: results.filter((result) => result.stage === "source_retry").length,
    duplicate_groups_quarantined: results.filter((result) => result.stage === "quarantined" && result.quarantine_reason === "duplicate_id").length,
  };
}

export async function main() {
  const beforeHead = (await run("git", ["rev-parse", "HEAD"])).stdout.trim();
  const sheets = createGoogleSheetsIo({
    serviceAccountJson: process.env.P2_GOOGLE_SERVICE_ACCOUNT_JSON,
    expectedSheetId: SHEET_ID,
  });
  // Activation is explicit: absent/misspelled variables stay safe.
  const dryRun = process.env.P2_DRY_RUN !== "0";
  const skipPublish = process.env.P2_SKIP_PUBLISH !== "0";
  if (!dryRun && !process.env.P2_PUBLISH_PAT) throw new Error("ERR_P2_PUBLISH_PAT_MISSING");

  const cycle = await runFastCycle({
    root,
    sheets,
    fetchSources,
    publish: skipPublish || dryRun ? undefined : publishWithSha,
    applyFacts: dryRun ? dryRunFactApplier : undefined,
  });

  let factsCommit = { ok: true, committed: false };
  let factSheetAck = { ok: true, rows: 0 };
  if (cycle.factsChanged && !dryRun) {
    factsCommit = await commitFactOutputs();
    if (factsCommit.ok && !factsCommit.committed) {
      factsCommit = { ok: false, committed: false, error: "facts changed but no commit was produced" };
    }
    if (factsCommit.ok && factsCommit.committed) {
      const pushed = await pushMain();
      factsCommit.pushed = pushed.ok;
      if (!pushed.ok) factsCommit.push_error = pushed.stderr;
      if (pushed.ok && cycle.factCommitWritebacks.length) {
        try {
          await sheets.updateCells(INCOMING_INTEL_SHEET, cycle.factCommitWritebacks);
          factSheetAck = { ok: true, rows: cycle.factCommitWritebacks.length };
        } catch (error) {
          factSheetAck = { ok: false, rows: 0, error: String(error?.message || error) };
        }
      }
    }
  }

  const sheetState = summarizeSheetState({
    intelValues: await sheets.readValues(INCOMING_INTEL_SHEET),
    storyValues: await sheets.readValues("Story_Queue"),
  });

  const afterHead = (await run("git", ["rev-parse", "HEAD"])).stdout.trim();
  const status = (await run("git", ["status", "--short"])).stdout.trim().split("\n").filter(Boolean);
  const summary = {
    ok: cycle.ok && factsCommit.ok && factsCommit.pushed !== false && factSheetAck.ok,
    dry_run: dryRun,
    skip_publish: skipPublish,
    policy_version: cycle.policy_version,
    processor_version: cycle.processor_version,
    digest: cycle.digest.summary,
    cycle_activity: summarizeCycleActivity(cycle),
    story_queue_row_count: cycle.story_queue_row_count,
    quarantined_duplicate_groups: cycle.results.filter((result) => result.stage === "quarantined" && result.quarantine_reason === "duplicate_id").length,
    publish_actions: cycle.publishActions.length,
    facts_commit: factsCommit,
    fact_sheet_ack: factSheetAck,
    sheet_after: sheetState,
    git: {
      before_head: beforeHead || null,
      after_head: afterHead || null,
      head_changed: Boolean(beforeHead && afterHead && beforeHead !== afterHead),
      tracked_status: status,
    },
    digest_files: cycle.digest_files,
  };
  console.log(JSON.stringify(summary, null, 2));
  if (!summary.ok) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(String(error?.stack || error));
    process.exitCode = 2;
  });
}
