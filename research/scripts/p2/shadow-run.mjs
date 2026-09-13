import { csvList, processRow, sha256 } from "../intel/core.mjs";
import { readSelectedRows } from "../intel/sheet-adapter.mjs";
import { bindSnapshotToDispatch, verifyDispatch } from "./dispatch.mjs";
import { bindReview, reviewBinding } from "./evidence-review.mjs";
import { decide, POLICY_VERSION } from "./policy-engine.mjs";
import { ReviewQueue } from "./review-queue.mjs";
import { buildEmailPreview, writeEmailPreview } from "./email-preview.mjs";
import { mintApprovalToken } from "./approval-server.mjs";
import { planRelease, planWriteback } from "./release-adapter.mjs";

// Shadow-run orchestrator: dispatch → snapshot binding → Phase A processing →
// evidence review binding → dual policy decision (article + fact change) →
// private queue → email preview. Everything is local and read-only against
// the repo; release/writeback stay mocked. Single-worker by construction
// (one process, sequential records).

// When Phase A holds the candidate (human_review recommendation), the review
// queue still needs exact proposed wording. Build a provisional candidate from
// supported claims only — clearly marked, never publishable as-is.
export function provisionalFromClaims(claims) {
  const get = (field) => claims.find((c) => c.field === field && c.support === "supported")?.claim_value;
  const headline = get("headline");
  if (!headline) return null;
  return {
    provisional: true,
    headline,
    summary: get("summary") || "",
    event_date: get("event_date") || "",
    related_project_ids: csvList(get("project_identity")),
    related_corridor_ids: csvList(get("corridor_identity")),
  };
}

export async function shadowRun({
  root,
  envelope,
  secret,
  snapshotCsv,
  reviews = {},
  factMutations = {},
  indexes = {},
  verificationSources = {},
  trustedEvidence = {},
  seenNonces = new Set(),
  ackStore,
  approver = "brooke",
  approvalBaseUrl = "http://127.0.0.1:8790",
  approvalSecret = secret,
}) {
  const verified = verifyDispatch({ envelope, secret, seenNonces });
  if (!verified.ok) return { ok: false, stage: "dispatch", ...verified };
  seenNonces.add(verified.dispatch.nonce);

  if (ackStore?.isAcked(verified.dispatch.dispatch_id)) {
    return { ok: true, replayed: true, dispatch_id: verified.dispatch.dispatch_id, results: [] };
  }

  const bound = bindSnapshotToDispatch({ dispatch: verified.dispatch, snapshotCsv });
  if (!bound.ok) return { ok: false, stage: "snapshot", ...bound };

  const queue = await new ReviewQueue(root).load();
  const ids = verified.dispatch.records.map((r) => r.intel_id);
  const rows = await readSelectedRows({ ids, csvText: snapshotCsv });
  const results = [];
  const tokens = new Map();

  for (const row of rows) {
    const result = processRow({ row, verificationSources: verificationSources[row.id] || [], indexes, trustedEvidence: trustedEvidence[row.id] });
    const binding = reviewBinding({
      snapshotSha256: bound.snapshot_sha256,
      claims: result.claims,
      sources: result.verificationSources,
      policyVersion: POLICY_VERSION,
    });
    const boundReview = reviews[row.id] ? bindReview({ review: reviews[row.id], binding }) : { bound: false };
    const reviewCandidate = result.candidate || provisionalFromClaims(result.claims);
    const decision = decide({ row, result, boundReview, factMutations: factMutations[row.id] || [], reviewCandidate });

    const { entry, created } = queue.enqueue({
      eventKey: result.report.derived_event_key,
      candidateSha256: result.report.candidate_sha256,
      policyVersion: POLICY_VERSION,
      intelId: row.id,
      decision: decision.article_decision === "AUTO_ELIGIBLE" || decision.fact_change_decision === "AUTO_ELIGIBLE"
        ? "AUTO_ELIGIBLE"
        : decision.article_decision,
      candidate: reviewCandidate,
      binding,
      provenance: boundReview.provenance || null,
    });
    entry.dual_decision = decision;

    let previewFile = null;
    if (created && ["AUTO_ELIGIBLE", "NEEDS_DECISION"].includes(decision.article_decision) && reviewCandidate) {
      const token = mintApprovalToken({ secret: approvalSecret, entry, approver });
      tokens.set(token.token_id, token);
      const preview = buildEmailPreview({ entry, approvalBaseUrl, approvalToken: token });
      previewFile = await writeEmailPreview(root, entry, preview);
    }

    results.push({
      intel_id: row.id,
      created,
      article_decision: decision.article_decision,
      fact_change_decision: decision.fact_change_decision,
      reasons: decision.reasons,
      queue_state: entry.state,
      preview_file: previewFile,
      release_plan: planRelease({ entry }),
      writeback_plan: planWriteback({ entry, liveVerifiedUrl: null }),
    });
  }

  await queue.save();
  ackStore?.ack(verified.dispatch.dispatch_id);
  return { ok: true, dispatch_id: verified.dispatch.dispatch_id, results, queue_stats: queue.stats(), tokens };
}
