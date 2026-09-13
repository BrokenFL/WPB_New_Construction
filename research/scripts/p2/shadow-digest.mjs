import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { sha256, stableJson } from "../intel/core.mjs";

export const SHADOW_DIGEST_CONTRACT_VERSION = "p2-shadow-digest-v1";

function sortedUnique(values = []) {
  return [...new Set(values.filter((value) => typeof value === "string" && value))].sort();
}

function evidenceLinks(review = {}) {
  return sortedUnique((review.evidence_summary?.claims || [])
    .flatMap((claim) => claim.source_urls || []));
}

function canonicalDiffs(result = {}) {
  return (result.fact_mutations || []).map((mutation) => ({
    project_id: mutation.project_id,
    field: mutation.field,
    current_value: mutation.current_value,
    proposed_value: mutation.proposed_value,
    effective_date: mutation.effective_date,
    canonical_revision: mutation.canonical_base?.expected_revision || null,
    evidence_bundle_sha256: mutation.evidence_bundle_sha256 || null,
    audit_identifier: mutation.audit_identifier,
    downstream_surfaces: [...(mutation.shadow_propagation?.downstream_surfaces || [])],
    apply: false,
  }));
}

function exceptionFor(result = {}) {
  const review = result.review_object || {};
  const diffs = canonicalDiffs(result);
  const projectIds = sortedUnique([
    ...diffs.map((diff) => diff.project_id),
    String(review.event_key || "").split("|")[1],
  ]);
  const article = result.article_candidate || review.article;
  return {
    intel_id: result.intel_id,
    event_key: review.event_key || null,
    project_ids: projectIds,
    what_changed: diffs.length
      ? diffs.map((diff) => `${diff.field}: ${stableJson(diff.current_value)} -> ${stableJson(diff.proposed_value)}`)
      : [article?.deck || article?.title || "No public or canonical change proposed"],
    article_decision: result.article_decision,
    fact_decision: result.fact_change_decision,
    proposed_article_title: article?.title || null,
    canonical_diffs: diffs,
    evidence_links: evidenceLinks(review),
    evidence_bundle_sha256: result.evidence_bundle_sha256 || null,
    candidate_sha256: result.candidate_sha256 || null,
    human_review_reasons: {
      article: [...(result.reasons?.article || [])],
      fact_change: [...(result.reasons?.fact_change || [])],
    },
  };
}

export function buildShadowDigest({ results = [], dispatchId = null, generatedAt = new Date().toISOString() } = {}) {
  if (!Array.isArray(results)) throw new Error("ERR_SHADOW_DIGEST_RESULTS");
  const needsDecision = results.filter((result) => [result.article_decision, result.fact_change_decision].includes("NEEDS_DECISION"));
  const payload = {
    contract_version: SHADOW_DIGEST_CONTRACT_VERSION,
    mode: "shadow",
    production_side_effects: false,
    generated_at: generatedAt,
    dispatch_id: dispatchId,
    summary: {
      processed: results.length,
      auto_article_candidates: results.filter((result) => result.article_decision === "AUTO_ELIGIBLE").length,
      auto_fact_candidates: results.filter((result) => result.fact_change_decision === "AUTO_ELIGIBLE").length,
      duplicates_ignored: results.filter((result) => result.article_decision === "DUPLICATE").length,
      held: results.filter((result) => ![result.article_decision, result.fact_change_decision].includes("NEEDS_DECISION")
        && [result.article_decision, result.fact_change_decision].includes("HOLD")).length,
      needs_brooke: needsDecision.length,
    },
    exceptions: needsDecision.map(exceptionFor).sort((a, b) => String(a.intel_id).localeCompare(String(b.intel_id))),
  };
  return { ...payload, digest_sha256: sha256(payload) };
}

export function renderShadowDigestMarkdown(digest) {
  const lines = [
    "# WPB Intelligence Shadow Digest",
    "",
    `Generated: ${digest.generated_at}`,
    `Dispatch: ${digest.dispatch_id || "local/manual"}`,
    "Mode: SHADOW — no release or writeback",
    "",
    `Processed: ${digest.summary.processed}`,
    `Auto article candidates: ${digest.summary.auto_article_candidates}`,
    `Auto fact candidates: ${digest.summary.auto_fact_candidates}`,
    `Duplicates ignored: ${digest.summary.duplicates_ignored}`,
    `Held: ${digest.summary.held}`,
    `Needs Brooke: ${digest.summary.needs_brooke}`,
  ];
  if (!digest.exceptions.length) return `${lines.join("\n")}\n`;
  lines.push("", "## Exceptions requiring attention");
  for (const item of digest.exceptions) {
    lines.push(
      "",
      `### ${item.project_ids.join(", ") || item.intel_id} — ${item.event_key || item.intel_id}`,
      "",
      `- Article: ${item.article_decision}`,
      `- Fact: ${item.fact_decision}`,
      `- Changed: ${item.what_changed.join("; ")}`,
      `- Article reason: ${item.human_review_reasons.article.join(", ") || "none"}`,
      `- Fact reason: ${item.human_review_reasons.fact_change.join(", ") || "none"}`,
    );
    for (const diff of item.canonical_diffs) {
      lines.push(`- Canonical diff: ${diff.project_id}.${diff.field} ${stableJson(diff.current_value)} -> ${stableJson(diff.proposed_value)} (effective ${diff.effective_date}; base ${diff.canonical_revision}; ${diff.audit_identifier})`);
      if (diff.downstream_surfaces.length) lines.push(`- Would regenerate: ${diff.downstream_surfaces.join(", ")}`);
    }
    for (const url of item.evidence_links) lines.push(`- Evidence: ${url}`);
  }
  return `${lines.join("\n")}\n`;
}

export async function writeShadowDigest(root, digest) {
  const dir = path.join(root, ".runtime", "p2", "digests");
  await fs.mkdir(dir, { recursive: true });
  const stem = `shadow-digest-${digest.digest_sha256.slice(0, 16)}`;
  const jsonFile = path.join(dir, `${stem}.json`);
  const markdownFile = path.join(dir, `${stem}.md`);
  const writes = [
    [jsonFile, `${stableJson(digest)}\n`],
    [markdownFile, renderShadowDigestMarkdown(digest)],
  ];
  for (const [file, contents] of writes) {
    const temp = `${file}.${process.pid}.${crypto.randomUUID()}.tmp`;
    await fs.writeFile(temp, contents, { mode: 0o600 });
    await fs.rename(temp, file);
  }
  return { json: jsonFile, markdown: markdownFile };
}
