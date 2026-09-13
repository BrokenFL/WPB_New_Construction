import fs from "node:fs/promises";
import path from "node:path";
import { stableJson } from "../intel/core.mjs";

// Email preview generator. Produces the concise review email content locally
// — nothing is sent. A real sender would require explicit activation and an
// email credential; this prototype writes previews to .runtime/p2/email-previews/.

export function buildEmailPreview({ entry, approvalBaseUrl, approvalToken }) {
  const candidate = entry.candidate || {};
  const reviewUrl = `${approvalBaseUrl}/review/${approvalToken.token_id}?sig=${approvalToken.signature}`;
  const lines = [
    `Subject: [WPB Intel] ${entry.decision} — ${candidate.headline || entry.intel_id}`,
    "",
    `Decision: ${entry.decision} (policy ${entry.policy_version})`,
    `Intel ID: ${entry.intel_id}`,
    `Event key: ${entry.event_key}`,
    "",
    "## What changed",
    candidate.summary || "(no summary)",
    "",
    "## Exact public wording",
    `Headline: ${candidate.headline || "(none)"}`,
    `Date: ${candidate.event_date || "(undated)"}`,
    `Projects: ${(candidate.related_project_ids || []).join(", ") || "(none)"}`,
    `Corridors: ${(candidate.related_corridor_ids || []).join(", ") || "(none)"}`,
    "",
    "## Sources",
    ...((candidate.verification_sources || []).map((s) => `- ${s.url} (tier ${s.source_tier ?? "?"}, ${s.retrieval_status || "not fetched"})`)),
    "",
    "## Fact diff",
    ...(candidate.project_fact_proposals?.length
      ? candidate.project_fact_proposals.map((p) => `- ${p.field}: ${stableJson(p.current)} → ${stableJson(p.proposed)}`)
      : ["- none (no canonical fact mutation)"]),
    "",
    "## Actions",
    `Review/Approve/Hold/Reject: ${reviewUrl}`,
    "",
    "Replying with edit requests creates a revision — it is never blanket release consent.",
  ];
  return { subject: lines[0].replace("Subject: ", ""), body: lines.slice(1).join("\n"), review_url: reviewUrl };
}

export async function writeEmailPreview(root, entry, preview) {
  const dir = path.join(root, ".runtime", "p2", "email-previews");
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, `${entry.idempotency_key.slice(0, 16)}.txt`);
  await fs.writeFile(file, preview.body);
  return file;
}
