#!/usr/bin/env node
// Fast Mode cycle runner — intended owner: GitHub Actions (15-minute cron or
// repository_dispatch), but also runnable locally with the same env.
//
// Required env:
//   P2_GOOGLE_SERVICE_ACCOUNT_JSON  service account with Sheets read/write on
//                                   the private intelligence spreadsheet
//   P2_GOOGLE_SHEET_ID              (defaults to the primary spreadsheet)
// Optional:
//   P2_PUBLISH_PAT                  token used for git push so the normal
//                                   deploy workflow fires (GITHUB_TOKEN pushes
//                                   do not trigger push-event workflows)
//   P2_SKIP_PUBLISH=1               process intel/facts only (sheet cycle)
//   P2_DRY_RUN=1                    run everything except git push/publish
import { execFile } from "node:child_process";
import path from "node:path";
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

async function fetchSources(row) {
  const hints = [];
  const push = (url, sourceName) => {
    if (url && /^https?:\/\//i.test(url) && !hints.some((hint) => hint.url === url)) {
      hints.push({ url, source_name: sourceName || row.source_name || "", published_date: row.source_published_date || undefined });
    }
  };
  push(row.lead_source_url || row.source_url, row.source_name);
  push(row.primary_source_url, row.source_name);
  const sources = [];
  for (const hint of hints) sources.push(await verifySourceHint({ ...hint, claims_supported: [] }));
  return sources.filter((source) => !source.error);
}

async function publishWithSha(story) {
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
  const add = await run("git", ["add",
    "content/overrides/project-fact-automated.json",
    "src/generated/",
    "public/sitemap.xml",
  ]);
  if (add.code !== 0) return { ok: false, error: `git add: ${add.stderr}` };
  const diff = await run("git", ["diff", "--cached", "--quiet"]);
  if (diff.code === 0) return { ok: true, committed: false };
  const commit = await run("git", ["commit", "-m", `p2: apply automated project-fact updates (${FAST_MODE_POLICY_VERSION})`]);
  if (commit.code !== 0) return { ok: false, error: `git commit: ${commit.stderr.slice(-400)}` };
  return { ok: true, committed: true };
}

async function pushMain() {
  const pat = process.env.P2_PUBLISH_PAT || "";
  if (pat) {
    const remote = await run("git", ["remote", "get-url", "origin"]);
    const url = remote.stdout.trim().replace("https://", `https://x-access-token:${pat}@`);
    await run("git", ["remote", "set-url", "origin", url]);
  }
  const push = await run("git", ["push", "origin", "main"]);
  return { ok: push.code === 0, stderr: push.stderr.slice(-400) };
}

async function triggerDeployIfNeeded(anyPushHappened) {
  // A PAT push already fires the normal push-event deploy workflow. When only
  // GITHUB_TOKEN pushed, explicitly dispatch the deploy workflow instead.
  if (!anyPushHappened || process.env.P2_PUBLISH_PAT || process.env.P2_SKIP_DEPLOY_TRIGGER) return { triggered: false };
  const result = await run("gh", ["workflow", "run", "deploy-cloudflare-pages.yml", "--ref", "main"]);
  return { triggered: result.code === 0, stderr: result.stderr.slice(-400) };
}

async function main() {
  const sheets = createGoogleSheetsIo({
    serviceAccountJson: process.env.P2_GOOGLE_SERVICE_ACCOUNT_JSON,
    expectedSheetId: SHEET_ID,
  });
  const dryRun = process.env.P2_DRY_RUN === "1";
  const skipPublish = process.env.P2_SKIP_PUBLISH === "1";

  const cycle = await runFastCycle({
    root,
    sheets,
    fetchSources,
    publish: skipPublish || dryRun ? undefined : publishWithSha,
  });

  let factsCommit = { ok: true, committed: false };
  if (cycle.factsChanged && !dryRun) {
    factsCommit = await commitFactOutputs();
    if (factsCommit.ok && factsCommit.committed) {
      const pushed = await pushMain();
      factsCommit.pushed = pushed.ok;
      if (!pushed.ok) factsCommit.push_error = pushed.stderr;
      // Article publishes push their own commits; the fact push above is the
      // only push this process makes directly.
      await triggerDeployIfNeeded(pushed.ok && !cycle.publishActions.some((a) => a.ok && !a.deduplicated));
    }
  }

  const summary = {
    ok: cycle.ok && factsCommit.ok,
    policy_version: cycle.policy_version,
    digest: cycle.digest.summary,
    facts_commit: factsCommit,
    digest_files: cycle.digest_files,
  };
  console.log(JSON.stringify(summary, null, 2));
  if (!summary.ok) process.exitCode = 1;
}

main().catch((error) => {
  console.error(String(error?.stack || error));
  process.exitCode = 2;
});
