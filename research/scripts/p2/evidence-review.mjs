import { normalizeText, sha256, stableJson } from "../intel/normalizer.mjs";

// This is the only P2 contract that can turn a fact-check result into trusted
// claim evidence. It grants no publication or canonical-write authority; the
// independent policy engine consumes the validated result later.
export const EVIDENCE_BUNDLE_CONTRACT_VERSION = "p2-trusted-evidence-v1";
export const DEFAULT_REVIEWER_VERSION = "fact-checker-v1";
export const EVIDENCE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export const REVIEW_ERR = Object.freeze({
  MALFORMED: "ERR_REVIEW_BUNDLE_MALFORMED",
  HASH: "ERR_REVIEW_BUNDLE_HASH",
  SNAPSHOT_MISMATCH: "ERR_REVIEW_SNAPSHOT_MISMATCH",
  EVENT_MISMATCH: "ERR_REVIEW_EVENT_MISMATCH",
  CLAIMS_MISMATCH: "ERR_REVIEW_CLAIMS_MISMATCH",
  SOURCE_MISMATCH: "ERR_REVIEW_SOURCE_MISMATCH",
  MISSING_REVIEWER: "ERR_REVIEW_MISSING_REVIEWER",
  REVIEWER_VERSION_MISMATCH: "ERR_REVIEW_REVIEWER_VERSION_MISMATCH",
  POLICY_MISMATCH: "ERR_REVIEW_POLICY_MISMATCH",
  STALE: "ERR_REVIEW_STALE",
});

const SHA256 = /^[a-f0-9]{64}$/;
const VERDICTS = new Set(["supported", "unsupported", "conflicting"]);
const REVIEWER_TYPES = new Set(["automated_fact_checker", "human"]);

function exactKeys(value, required, optional = []) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const allowed = new Set([...required, ...optional]);
  return required.every((key) => Object.prototype.hasOwnProperty.call(value, key))
    && Object.keys(value).every((key) => allowed.has(key));
}

function jsonValue(value) {
  if (value === undefined || typeof value === "function" || typeof value === "symbol" || typeof value === "bigint") return false;
  if (Array.isArray(value)) return value.every(jsonValue);
  if (value && typeof value === "object") return Object.values(value).every(jsonValue);
  return true;
}

function sameValue(left, right) {
  return jsonValue(left) && jsonValue(right) && stableJson(left) === stableJson(right);
}

function sortedClaims(claims = []) {
  return [...claims].sort((a, b) => String(a.claim_id).localeCompare(String(b.claim_id)));
}

function sortedSources(sources = []) {
  return [...sources].sort((a, b) => String(a.source_ref_id).localeCompare(String(b.source_ref_id)));
}

export function claimSetHash(claims = []) {
  return sha256(sortedClaims(claims).map((claim) => ({
    claim_id: claim.claim_id,
    claim_type: claim.claim_type,
    field: claim.field,
    claim_value: claim.claim_value,
    claim_text: claim.claim_text_normalized,
  })));
}

export function sourceRevisionSha256(source) {
  return sha256({
    verification_source_url: source.url,
    fetched_content_sha256: source.content_hash,
    source_revision: source.source_revision || source.content_hash,
  });
}

export function sourceRevisionHash(sources = []) {
  return sha256(sortedSources(sources).map((source) => ({
    source_ref_id: source.source_ref_id,
    verification_source_url: source.url,
    fetched_content_sha256: source.content_hash,
    source_revision_sha256: sourceRevisionSha256(source),
  })));
}

export function evidenceSourceRecord(source) {
  return {
    source_ref_id: source.source_ref_id,
    verification_source_url: source.url,
    fetched_content_sha256: source.content_hash,
    source_revision_sha256: sourceRevisionSha256(source),
  };
}

export function reviewBundleHash(bundle) {
  const { review_bundle_sha256: _ignored, ...payload } = bundle || {};
  return sha256(payload);
}

export function createEvidenceBundle({
  intelId,
  intakeSnapshotSha256,
  eventKey,
  claims,
  sources,
  verdicts,
  reviewerType = "automated_fact_checker",
  reviewerIdentity,
  reviewerVersion = DEFAULT_REVIEWER_VERSION,
  policyVersion,
  verificationTimestamp = new Date().toISOString(),
}) {
  if (!verdicts || typeof verdicts !== "object" || Array.isArray(verdicts)) throw new Error("ERR_REVIEW_VERDICTS_REQUIRED");
  const claimIds = new Set(claims.map((claim) => claim.claim_id));
  for (const claim of claims) {
    if (!Object.prototype.hasOwnProperty.call(verdicts, claim.claim_id) || !VERDICTS.has(verdicts[claim.claim_id])) {
      throw new Error(`ERR_REVIEW_VERDICT_REQUIRED:${claim.claim_id}`);
    }
  }
  if (Object.keys(verdicts).some((claimId) => !claimIds.has(claimId))) throw new Error("ERR_REVIEW_UNKNOWN_CLAIM_VERDICT");
  const sourceRecords = sortedSources(sources).map(evidenceSourceRecord);
  const payload = {
    contract_version: EVIDENCE_BUNDLE_CONTRACT_VERSION,
    intel_id: intelId,
    intake_snapshot_sha256: intakeSnapshotSha256,
    event_key: eventKey,
    claims: sortedClaims(claims).map((claim) => ({
      claim_id: claim.claim_id,
      claim_type: claim.claim_type,
      field: claim.field,
      claim_value: claim.claim_value,
      claim_text: claim.claim_text_normalized,
      support_verdict: verdicts[claim.claim_id],
      verification_sources: sourceRecords,
    })),
    verification_timestamp: verificationTimestamp,
    reviewer_type: reviewerType,
    reviewer_identity: reviewerIdentity,
    reviewer_version: reviewerVersion,
    policy_version: policyVersion,
  };
  return { ...payload, review_bundle_sha256: sha256(payload) };
}

function malformed(code = REVIEW_ERR.MALFORMED, detail = "invalid trusted evidence bundle") {
  return { bound: false, code, errors: [detail], claims_all_supported: false };
}

export function validateEvidenceBundle({
  bundle,
  intelId,
  intakeSnapshotSha256,
  eventKey,
  claims = [],
  sources = [],
  policyVersion,
  reviewerVersion = DEFAULT_REVIEWER_VERSION,
  now = Date.now(),
  maxAgeMs = EVIDENCE_MAX_AGE_MS,
}) {
  const topKeys = [
    "contract_version", "intel_id", "intake_snapshot_sha256", "event_key", "claims",
    "verification_timestamp", "reviewer_type", "reviewer_identity", "reviewer_version",
    "policy_version", "review_bundle_sha256",
  ];
  if (!exactKeys(bundle, topKeys) || bundle.contract_version !== EVIDENCE_BUNDLE_CONTRACT_VERSION) return malformed();
  if (!SHA256.test(String(bundle.review_bundle_sha256)) || reviewBundleHash(bundle) !== bundle.review_bundle_sha256) return malformed(REVIEW_ERR.HASH, "review_bundle_sha256 does not match the exact bundle payload");
  if (bundle.intel_id !== intelId || !normalizeText(bundle.intel_id)) return malformed(REVIEW_ERR.SNAPSHOT_MISMATCH, "intel_id does not match the selected intake record");
  if (!SHA256.test(String(bundle.intake_snapshot_sha256)) || bundle.intake_snapshot_sha256 !== intakeSnapshotSha256) return malformed(REVIEW_ERR.SNAPSHOT_MISMATCH, "intake snapshot hash mismatch");
  if (bundle.event_key !== eventKey || !normalizeText(bundle.event_key)) return malformed(REVIEW_ERR.EVENT_MISMATCH, "event_key mismatch");
  if (bundle.policy_version !== policyVersion || !normalizeText(bundle.policy_version)) return malformed(REVIEW_ERR.POLICY_MISMATCH, "policy version mismatch");
  if (bundle.reviewer_version !== reviewerVersion || !normalizeText(bundle.reviewer_version)) return malformed(REVIEW_ERR.REVIEWER_VERSION_MISMATCH, "reviewer version mismatch");
  if (!REVIEWER_TYPES.has(bundle.reviewer_type) || !normalizeText(bundle.reviewer_identity)) return malformed(REVIEW_ERR.MISSING_REVIEWER, "reviewer type or identity is invalid");
  const verifiedAt = Date.parse(bundle.verification_timestamp);
  if (!Number.isFinite(verifiedAt) || verifiedAt > now + 5 * 60 * 1000 || now - verifiedAt > maxAgeMs) return malformed(REVIEW_ERR.STALE, "verification timestamp is invalid, future, or stale");
  if (!Array.isArray(bundle.claims) || !bundle.claims.length) return malformed(REVIEW_ERR.CLAIMS_MISMATCH, "claims must be a non-empty array");

  const claimById = new Map(claims.map((claim) => [claim.claim_id, claim]));
  const sourceById = new Map(sources.map((source) => [source.source_ref_id, source]));
  const seenClaims = new Set();
  const accepted = [];
  for (const record of bundle.claims) {
    if (!exactKeys(record, ["claim_id", "claim_type", "field", "claim_value", "claim_text", "support_verdict", "verification_sources"])) return malformed(REVIEW_ERR.MALFORMED, "claim record has missing or unknown fields");
    const claim = claimById.get(record.claim_id);
    if (!claim || seenClaims.has(record.claim_id)) return malformed(REVIEW_ERR.CLAIMS_MISMATCH, "claim identity is absent or duplicated");
    seenClaims.add(record.claim_id);
    if (record.claim_type !== claim.claim_type || record.field !== claim.field || record.claim_text !== claim.claim_text_normalized || !sameValue(record.claim_value, claim.claim_value)) return malformed(REVIEW_ERR.CLAIMS_MISMATCH, `exact claim binding failed for ${record.claim_id}`);
    if (!VERDICTS.has(record.support_verdict)) return malformed(REVIEW_ERR.MALFORMED, `invalid verdict for ${record.claim_id}`);
    if (!Array.isArray(record.verification_sources) || !record.verification_sources.length) return malformed(REVIEW_ERR.SOURCE_MISMATCH, `claim ${record.claim_id} has no verification source`);
    const seenSources = new Set();
    for (const sourceRecord of record.verification_sources) {
      if (!exactKeys(sourceRecord, ["source_ref_id", "verification_source_url", "fetched_content_sha256", "source_revision_sha256"])) return malformed(REVIEW_ERR.MALFORMED, "source evidence has missing or unknown fields");
      const source = sourceById.get(sourceRecord.source_ref_id);
      if (!source || seenSources.has(sourceRecord.source_ref_id)) return malformed(REVIEW_ERR.SOURCE_MISMATCH, "source reference is absent or duplicated");
      seenSources.add(sourceRecord.source_ref_id);
      if (sourceRecord.verification_source_url !== source.url
        || sourceRecord.fetched_content_sha256 !== source.content_hash
        || sourceRecord.source_revision_sha256 !== sourceRevisionSha256(source)
        || !SHA256.test(String(sourceRecord.fetched_content_sha256))
        || source.retrieval_status !== "fetched"
        || source.retrieval_attested !== true
        || source.reachable !== true
        || !Number.isFinite(source.body_bytes)
        || source.error) {
        return malformed(REVIEW_ERR.SOURCE_MISMATCH, `fetched source revision binding failed for ${sourceRecord.source_ref_id}`);
      }
    }
    accepted.push(record);
  }

  const materialClaimIds = claims.filter((claim) => claim.material).map((claim) => claim.claim_id);
  const verdictByClaim = Object.fromEntries(accepted.map((record) => [record.claim_id, record.support_verdict]));
  const claimsAllSupported = materialClaimIds.length > 0 && materialClaimIds.every((id) => verdictByClaim[id] === "supported");
  return {
    bound: true,
    code: null,
    review_bundle_sha256: bundle.review_bundle_sha256,
    reviewer_type: bundle.reviewer_type,
    reviewer_id: bundle.reviewer_identity,
    reviewer_version: bundle.reviewer_version,
    reviewed_at: bundle.verification_timestamp,
    policy_version: bundle.policy_version,
    claims_all_supported: claimsAllSupported,
    verdicts: verdictByClaim,
    accepted,
    provenance: {
      reviewer_type: bundle.reviewer_type,
      reviewer_identity: bundle.reviewer_identity,
      reviewer_version: bundle.reviewer_version,
      verification_timestamp: bundle.verification_timestamp,
      policy_version: bundle.policy_version,
      review_bundle_sha256: bundle.review_bundle_sha256,
    },
  };
}

export function toPhaseATrustedEvidence(bundle, sources = []) {
  const sourceById = new Map(sources.map((source) => [source.source_ref_id, source]));
  return {
    intake_snapshot_sha256: bundle.intake_snapshot_sha256,
    records: bundle.claims.flatMap((record) => record.verification_sources.map((sourceRecord) => {
      const source = sourceById.get(sourceRecord.source_ref_id);
      return {
        claim_id: record.claim_id,
        claim_type: record.claim_type,
        field: record.field,
        claim_value: record.claim_value,
        claim_text_normalized: record.claim_text,
        decision: record.support_verdict === "conflicting" ? "conflicted" : record.support_verdict,
        verification_source_ref_ids: [sourceRecord.source_ref_id],
        content_hash: source?.content_hash,
        source_revision: source?.source_revision,
        reviewer: bundle.reviewer_identity,
        reviewed_at: bundle.verification_timestamp,
      };
    })),
  };
}
