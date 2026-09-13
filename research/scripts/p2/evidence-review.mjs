import { sha256, stableJson } from "../intel/core.mjs";

// Trusted evidence-review adapter. A review result only counts when it is
// bound to the exact intake snapshot, the exact claim set, the exact source
// evidence revisions, a reviewer identity/type, a review time, and a policy
// version. HTTP 200, a Sheet "verified" label, model agreement, or a
// confidence score are metadata — never claim approval.

export const REVIEW_ERR = Object.freeze({
  SNAPSHOT_MISMATCH: "ERR_REVIEW_SNAPSHOT_MISMATCH",
  CLAIMS_MISMATCH: "ERR_REVIEW_CLAIMS_MISMATCH",
  SOURCE_MISMATCH: "ERR_REVIEW_SOURCE_MISMATCH",
  MISSING_REVIEWER: "ERR_REVIEW_MISSING_REVIEWER",
  POLICY_MISMATCH: "ERR_REVIEW_POLICY_MISMATCH",
});

export function claimSetHash(claims) {
  return sha256(claims.map((claim) => ({ claim_id: claim.claim_id, field: claim.field, claim_value: claim.claim_value })));
}

export function sourceRevisionHash(sources) {
  return sha256((sources || []).map((source) => ({ url: source.url, revision: source.source_revision || source.content_hash || null })));
}

// Build the binding a reviewer must sign over. Any drift in snapshot, claims,
// or source revisions invalidates the review.
export function reviewBinding({ snapshotSha256, claims, sources, policyVersion }) {
  return {
    snapshot_sha256: snapshotSha256,
    claim_set_sha256: claimSetHash(claims),
    source_revision_sha256: sourceRevisionHash(sources),
    policy_version: policyVersion,
  };
}

export function bindReview({ review, binding }) {
  if (!review || typeof review !== "object") return { bound: false, code: REVIEW_ERR.MISSING_REVIEWER };
  if (!review.reviewer_id || !["ai", "human"].includes(review.reviewer_type)) {
    return { bound: false, code: REVIEW_ERR.MISSING_REVIEWER };
  }
  if (review.binding?.snapshot_sha256 !== binding.snapshot_sha256) return { bound: false, code: REVIEW_ERR.SNAPSHOT_MISMATCH };
  if (review.binding?.claim_set_sha256 !== binding.claim_set_sha256) return { bound: false, code: REVIEW_ERR.CLAIMS_MISMATCH };
  if (review.binding?.source_revision_sha256 !== binding.source_revision_sha256) return { bound: false, code: REVIEW_ERR.SOURCE_MISMATCH };
  if (review.binding?.policy_version !== binding.policy_version) return { bound: false, code: REVIEW_ERR.POLICY_MISMATCH };
  const verdicts = review.claim_verdicts || {};
  return {
    bound: true,
    reviewer_type: review.reviewer_type,
    reviewer_id: review.reviewer_id,
    reviewed_at: review.reviewed_at,
    claims_all_supported: Object.values(verdicts).length > 0 && Object.values(verdicts).every((v) => v === "supported"),
    verdicts,
  };
}

// Provenance is preserved: AI and human reviews are recorded distinctly and
// never merged into the manual-reviewed override layer.
export function reviewRecord({ review, binding }) {
  const bound = bindReview({ review, binding });
  return {
    ...bound,
    provenance: bound.bound ? { reviewer_type: review.reviewer_type, reviewer_id: review.reviewer_id, reviewed_at: review.reviewed_at } : null,
    stable: stableJson({ review, binding }),
  };
}
