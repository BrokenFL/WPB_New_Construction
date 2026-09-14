import fs from "node:fs/promises";
import path from "node:path";
import { sha256, stableJson } from "../intel/core.mjs";

// Fast Mode digest: reports what happened, not what needs review. Brooke
// should see counts and only the items the system genuinely could not resolve.
export const FAST_DIGEST_CONTRACT_VERSION = "p2-fast-digest-v1";

export function buildFastDigest({ results = [], storyActions = [], publishActions = [], generatedAt = new Date().toISOString() } = {}) {
  const summary = {
    intel_rows_processed: results.length,
    stories_queued_for_writer: storyActions.filter((a) => a.action === "queued_for_writer").length,
    stories_published: publishActions.filter((a) => a.published === true || a.outcome === "published").length,
    publish_errors_retrying: publishActions.filter((a) => !a.ok && a.outcome === "retrying").length,
    stories_returned_for_rewrite: publishActions.filter((a) => a.outcome === "rewrite").length,
    stories_held_at_publish: publishActions.filter((a) => a.outcome === "held").length,
    facts_applied: results.reduce((count, r) => count + (r.applied_facts?.length || 0), 0),
    facts_needing_decision: results.filter((r) => r.fact_change_decision === "NEEDS_DECISION").length,
    duplicates_skipped: results.filter((r) => r.article_decision === "DUPLICATE").length,
    held: results.filter((r) => r.article_decision === "HOLD" || r.fact_change_decision === "HOLD").length,
    awaiting_fact_check: results.filter((r) => r.stage === "awaiting_fact_check").length,
    needs_brooke: 0, // filled below
  };
  const attention = [];
  for (const result of results) {
    if (result.article_decision === "NEEDS_DECISION" || result.fact_change_decision === "NEEDS_DECISION") {
      summary.needs_brooke += 1;
      attention.push({
        intel_id: result.intel_id,
        event_key: result.event_key,
        article: result.article_decision,
        fact_change: result.fact_change_decision,
        reasons: result.reasons,
      });
    }
  }
  const digest = {
    contract_version: FAST_DIGEST_CONTRACT_VERSION,
    generated_at: generatedAt,
    summary,
    attention,
  };
  return { ...digest, digest_sha256: sha256(stableJson(digest)) };
}

export function fastDigestMarkdown(digest) {
  const s = digest.summary;
  const lines = [
    `WPB intelligence digest — ${digest.generated_at.slice(0, 10)}`,
    "",
    `- ${s.stories_published} stories published`,
    `- ${s.stories_queued_for_writer} stories queued for writer`,
    `- ${s.facts_applied} canonical project updates applied`,
    `- ${s.duplicates_skipped} duplicates skipped`,
    `- ${s.publish_errors_retrying} errors retrying`,
    `- ${s.stories_returned_for_rewrite} returned to the writer`,
    `- ${s.stories_held_at_publish} held at the publish boundary`,
    `- ${s.held} held`,
    `- ${s.awaiting_fact_check} awaiting fact check`,
    `- ${s.needs_brooke} need${s.needs_brooke === 1 ? "s" : ""} your attention`,
  ];
  for (const item of digest.attention || []) {
    lines.push("", `Attention: ${item.intel_id} — ${item.event_key}`);
    lines.push(`Article: ${item.article} | Fact: ${item.fact_change}`);
    lines.push(`Reasons: ${JSON.stringify(item.reasons)}`);
  }
  return `${lines.join("\n")}\n`;
}

export async function writeFastDigest(root, digest) {
  const dir = path.join(root, ".runtime", "p2", "digests");
  await fs.mkdir(dir, { recursive: true });
  const stamp = digest.generated_at.replace(/[:.]/g, "-");
  const jsonFile = path.join(dir, `${stamp}.json`);
  const mdFile = path.join(dir, `${stamp}.md`);
  await fs.writeFile(jsonFile, `${stableJson(digest)}\n`, { mode: 0o600 });
  await fs.writeFile(mdFile, fastDigestMarkdown(digest), { mode: 0o600 });
  return { json: jsonFile, markdown: mdFile };
}
