import fs from "node:fs/promises";
import path from "node:path";
import { stableJson } from "../intel/core.mjs";

export function buildEmailPreview({ entry, approvalBaseUrl, approvalToken }) {
  const review = entry.review_object || {};
  const article = review.article;
  const facts = review.fact_changes || [];
  const evidence = review.evidence_summary || {};
  const sourceUrls = [...new Set((evidence.claims || []).flatMap((claim) => claim.source_urls || []))].sort();
  const reviewUrl = `${approvalBaseUrl}/review/${approvalToken.token_id}?sig=${approvalToken.signature}`;
  const articleWording = article
    ? [
      `Headline: ${article.title}`,
      `Deck: ${article.deck}`,
      ...article.sections.flatMap((section) => [`Section: ${section.heading}`, section.body]),
    ]
    : ["(no article proposed)"];
  const factDiff = facts.length
    ? facts.map((fact) => `- ${fact.project_id} · ${fact.field}: ${stableJson(fact.current_value)} → ${stableJson(fact.proposed_value)} (risk ${fact.risk_classification}; ${fact.audit_identifier})`)
    : ["- none"];
  const lines = [
    `Subject: [WPB Intel] ARTICLE ${entry.article_decision} · FACT ${entry.fact_change_decision} — ${article?.title || entry.intel_id}`,
    "",
    `Intel ID: ${entry.intel_id}`,
    `Event key: ${entry.event_key}`,
    `Policy: ${entry.policy_version}`,
    `Candidate SHA: ${entry.candidate_sha256}`,
    `Evidence SHA: ${entry.evidence_bundle_sha256}`,
    "",
    "## What happened",
    article?.deck || facts.map((fact) => `${fact.field} proposed for ${fact.project_id}`).join("; ") || "No public change proposed.",
    "",
    "## Exact public article wording",
    ...articleWording,
    "",
    "## Exact canonical fact diff",
    ...factDiff,
    "",
    "## Evidence summary",
    `Reviewer: ${evidence.reviewer_type || "none"} · ${evidence.reviewer_identity || "none"} · ${evidence.reviewer_version || "none"}`,
    `Verified at: ${evidence.verification_timestamp || "none"}`,
    ...((evidence.claims || []).map((claim) => `- ${claim.claim_id}: ${claim.support_verdict}`)),
    "",
    "## Source links",
    ...(sourceUrls.length ? sourceUrls.map((url) => `- ${url}`) : ["- none"]),
    "",
    "## Risk / policy reason",
    `Article: ${(review.reasons?.article || []).join(", ") || "none"}`,
    `Fact change: ${(review.reasons?.fact_change || []).join(", ") || "none"}`,
    "",
    "## Actions",
    `Approve / Hold / Reject: ${reviewUrl}`,
    "",
    "Any wording, fact, evidence, or policy change creates a new revision and invalidates this approval.",
  ];
  return { subject: lines[0].replace("Subject: ", ""), body: lines.slice(1).join("\n"), review_url: reviewUrl };
}

export async function writeEmailPreview(root, entry, preview) {
  const dir = path.join(root, ".runtime", "p2", "email-previews");
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, `${entry.idempotency_key.slice(0, 16)}.txt`);
  await fs.writeFile(file, preview.body, { mode: 0o600 });
  return file;
}
