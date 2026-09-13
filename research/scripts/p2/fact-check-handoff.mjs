import {
  EVIDENCE_BUNDLE_CONTRACT_VERSION,
  DEFAULT_REVIEWER_VERSION,
  reviewBundleHash,
  sourceRevisionSha256,
  validateEvidenceBundle,
} from "./evidence-review.mjs";
import { stableJson } from "../intel/normalizer.mjs";

// This is an input-only, provider-neutral contract. The verifier can submit a
// handoff, but it cannot publish, write canonical facts, approve a candidate,
// or otherwise acquire authority by including additional fields.
export const FACT_CHECK_HANDOFF_CONTRACT_VERSION = "p2-fact-check-handoff-v1";

export const FACT_CHECK_HANDOFF_ERR = Object.freeze({
  MALFORMED: "ERR_FACT_CHECK_HANDOFF_MALFORMED",
  SNAPSHOT_MISMATCH: "ERR_FACT_CHECK_HANDOFF_SNAPSHOT_MISMATCH",
  EVENT_MISMATCH: "ERR_FACT_CHECK_HANDOFF_EVENT_MISMATCH",
  CLAIMS_MISMATCH: "ERR_FACT_CHECK_HANDOFF_CLAIMS_MISMATCH",
  SOURCE_MISMATCH: "ERR_FACT_CHECK_HANDOFF_SOURCE_MISMATCH",
  HASH: "ERR_FACT_CHECK_HANDOFF_HASH",
  REVIEWER: "ERR_FACT_CHECK_HANDOFF_REVIEWER",
  POLICY_MISMATCH: "ERR_FACT_CHECK_HANDOFF_POLICY_MISMATCH",
  STALE: "ERR_FACT_CHECK_HANDOFF_STALE",
});

const SHA256 = /^[a-f0-9]{64}$/;
const VERDICTS = new Set(["supported", "unsupported", "conflicting"]);
const REVIEWER_TYPES = new Set(["automated_fact_checker", "human"]);

function exactKeys(value, required) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return required.every((key) => Object.prototype.hasOwnProperty.call(value, key))
    && Object.keys(value).every((key) => required.includes(key));
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

function nonEmpty(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function sorted(items, key) {
  return [...items].sort((left, right) => String(left[key]).localeCompare(String(right[key])));
}

function failure(code, detail) {
  return { ok: false, bound: false, code, errors: [detail], claims_all_supported: false };
}

export function evidenceBundlePayloadFromHandoff(handoff) {
  return {
    contract_version: EVIDENCE_BUNDLE_CONTRACT_VERSION,
    intel_id: handoff.intel_id,
    intake_snapshot_sha256: handoff.intake_snapshot_sha256,
    event_key: handoff.event_key,
    claims: sorted(handoff.claims || [], "claim_id").map((claim) => ({
      claim_id: claim.claim_id,
      claim_type: claim.claim_type,
      field: claim.field,
      claim_value: claim.claim_value,
      claim_text: claim.claim_text,
      support_verdict: claim.verdict,
      verification_sources: sorted(claim.evidence || [], "source_ref_id").map((source) => ({
        source_ref_id: source.source_ref_id,
        verification_source_url: source.source_url,
        fetched_content_sha256: source.fetched_content_sha256,
        source_revision_sha256: source.source_revision_sha256,
      })),
    })),
    verification_timestamp: handoff.verification_timestamp,
    reviewer_type: handoff.reviewer_type,
    reviewer_identity: `${handoff.reviewer_id} (${handoff.reviewer_name})`,
    reviewer_version: handoff.reviewer_version,
    policy_version: handoff.policy_version,
  };
}

export function evidenceBundleSha256ForHandoff(handoff) {
  return reviewBundleHash(evidenceBundlePayloadFromHandoff(handoff));
}

/**
 * Ingest a verifier's structured result and bind it to the authoritative
 * Phase A context. `expectedClaims` and `expectedSources` must come from the
 * same Phase A run as `intakeSnapshotSha256` and `eventKey`.
 *
 * The handoff deliberately requires reviewer_id and reviewer_name separately;
 * both are bound into the p2 bundle's reviewer_identity string. All text is
 * treated as inert data. No field is interpreted as an instruction.
 */
export function ingestFactCheckHandoff({
  handoff,
  expectedClaims = [],
  expectedSources = [],
  intelId,
  intakeSnapshotSha256,
  eventKey,
  policyVersion,
  reviewerVersion = DEFAULT_REVIEWER_VERSION,
  now = Date.now(),
  maxAgeMs,
} = {}) {
  const handoffKeys = [
    "contract_version", "intel_id", "intake_snapshot_sha256", "event_key", "claims",
    "verification_timestamp", "reviewer_type", "reviewer_id", "reviewer_name",
    "reviewer_version", "policy_version", "evidence_bundle_sha256",
  ];
  const claimKeys = ["claim_id", "claim_type", "field", "claim_text", "claim_value", "verdict", "evidence"];
  const sourceKeys = ["source_ref_id", "source_url", "fetched_content_sha256", "source_revision", "source_revision_sha256"];

  if (!exactKeys(handoff, handoffKeys) || handoff.contract_version !== FACT_CHECK_HANDOFF_CONTRACT_VERSION) {
    return failure(FACT_CHECK_HANDOFF_ERR.MALFORMED, "handoff has an unknown, missing, or unsupported field");
  }
  if (handoff.intel_id !== intelId || !nonEmpty(intelId)) {
    return failure(FACT_CHECK_HANDOFF_ERR.SNAPSHOT_MISMATCH, "intel_id does not match the selected intake record");
  }
  if (!SHA256.test(String(handoff.intake_snapshot_sha256)) || handoff.intake_snapshot_sha256 !== intakeSnapshotSha256) {
    return failure(FACT_CHECK_HANDOFF_ERR.SNAPSHOT_MISMATCH, "intake snapshot hash mismatch");
  }
  if (handoff.event_key !== eventKey || !nonEmpty(eventKey)) {
    return failure(FACT_CHECK_HANDOFF_ERR.EVENT_MISMATCH, "event_key does not match the Phase A event");
  }
  if (handoff.policy_version !== policyVersion || !nonEmpty(policyVersion)) {
    return failure(FACT_CHECK_HANDOFF_ERR.POLICY_MISMATCH, "policy version mismatch");
  }
  if (!REVIEWER_TYPES.has(handoff.reviewer_type)
    || !nonEmpty(handoff.reviewer_id)
    || !nonEmpty(handoff.reviewer_name)
    || handoff.reviewer_version !== reviewerVersion) {
    return failure(FACT_CHECK_HANDOFF_ERR.REVIEWER, "reviewer type, id, name, or version is invalid");
  }
  const verifiedAt = Date.parse(handoff.verification_timestamp);
  const effectiveMaxAge = maxAgeMs ?? 30 * 24 * 60 * 60 * 1000;
  if (typeof handoff.verification_timestamp !== "string"
    || !Number.isFinite(verifiedAt)
    || verifiedAt > now + 5 * 60 * 1000
    || now - verifiedAt > effectiveMaxAge) {
    return failure(FACT_CHECK_HANDOFF_ERR.STALE, "verification timestamp is invalid, future, or stale");
  }
  if (!SHA256.test(String(handoff.evidence_bundle_sha256))) {
    return failure(FACT_CHECK_HANDOFF_ERR.HASH, "evidence_bundle_sha256 must be a lowercase SHA-256 hash");
  }
  if (!Array.isArray(expectedClaims) || !expectedClaims.length || !Array.isArray(expectedSources) || !expectedSources.length) {
    return failure(FACT_CHECK_HANDOFF_ERR.MALFORMED, "authoritative claims and sources are required");
  }
  if (new Set(expectedClaims.map((claim) => claim.claim_id)).size !== expectedClaims.length
    || new Set(expectedSources.map((source) => source.source_ref_id)).size !== expectedSources.length) {
    return failure(FACT_CHECK_HANDOFF_ERR.MALFORMED, "authoritative claims and sources contain duplicate identifiers");
  }
  if (!Array.isArray(handoff.claims) || handoff.claims.length !== expectedClaims.length) {
    return failure(FACT_CHECK_HANDOFF_ERR.CLAIMS_MISMATCH, "handoff claim set does not exactly match Phase A");
  }

  const expectedClaimById = new Map(expectedClaims.map((claim) => [claim.claim_id, claim]));
  const expectedSourceById = new Map(expectedSources.map((source) => [source.source_ref_id, source]));
  const seenClaims = new Set();
  const bundleClaims = [];

  for (const claim of handoff.claims) {
    if (!exactKeys(claim, claimKeys) || !VERDICTS.has(claim.verdict)) {
      return failure(FACT_CHECK_HANDOFF_ERR.MALFORMED, "claim is missing exact fields or has an invalid verdict");
    }
    if (seenClaims.has(claim.claim_id)) {
      return failure(FACT_CHECK_HANDOFF_ERR.CLAIMS_MISMATCH, `duplicate claim_id: ${claim.claim_id}`);
    }
    seenClaims.add(claim.claim_id);
    const expected = expectedClaimById.get(claim.claim_id);
    if (!expected || claim.claim_type !== expected.claim_type || claim.field !== expected.field
      || claim.claim_text !== expected.claim_text_normalized || !sameValue(claim.claim_value, expected.claim_value)) {
      return failure(FACT_CHECK_HANDOFF_ERR.CLAIMS_MISMATCH, `exact claim binding failed for ${claim.claim_id}`);
    }
    if (!Array.isArray(claim.evidence) || !claim.evidence.length) {
      return failure(FACT_CHECK_HANDOFF_ERR.SOURCE_MISMATCH, `claim ${claim.claim_id} has no bound evidence source`);
    }

    const seenSources = new Set();
    const verificationSources = [];
    for (const source of claim.evidence) {
      if (!exactKeys(source, sourceKeys)
        || !SHA256.test(String(source.fetched_content_sha256))
        || !SHA256.test(String(source.source_revision))
        || !SHA256.test(String(source.source_revision_sha256))) {
        return failure(FACT_CHECK_HANDOFF_ERR.MALFORMED, `source evidence for ${claim.claim_id} has invalid fields or hashes`);
      }
      if (seenSources.has(source.source_ref_id)) {
        return failure(FACT_CHECK_HANDOFF_ERR.SOURCE_MISMATCH, `duplicate source_ref_id: ${source.source_ref_id}`);
      }
      seenSources.add(source.source_ref_id);
      const expectedSource = expectedSourceById.get(source.source_ref_id);
      if (!expectedSource
        || source.source_url !== expectedSource.url
        || source.fetched_content_sha256 !== expectedSource.content_hash
        || source.source_revision !== (expectedSource.source_revision || expectedSource.content_hash)
        || source.source_revision_sha256 !== sourceRevisionSha256({
          url: source.source_url,
          content_hash: source.fetched_content_sha256,
          source_revision: source.source_revision,
        })) {
        return failure(FACT_CHECK_HANDOFF_ERR.SOURCE_MISMATCH, `source revision binding failed for ${source.source_ref_id}`);
      }
      verificationSources.push({
        source_ref_id: source.source_ref_id,
        verification_source_url: source.source_url,
        fetched_content_sha256: source.fetched_content_sha256,
        source_revision_sha256: source.source_revision_sha256,
      });
    }
    bundleClaims.push({
      claim_id: claim.claim_id,
      claim_type: claim.claim_type,
      field: claim.field,
      claim_value: claim.claim_value,
      claim_text: claim.claim_text,
      support_verdict: claim.verdict,
      verification_sources: sorted(verificationSources, "source_ref_id"),
    });
  }

  if (seenClaims.size !== expectedClaims.length) {
    return failure(FACT_CHECK_HANDOFF_ERR.CLAIMS_MISMATCH, "handoff is missing one or more Phase A claims");
  }

  const bundlePayload = evidenceBundlePayloadFromHandoff({ ...handoff, claims: bundleClaims.map((claim) => ({
    claim_id: claim.claim_id,
    claim_type: claim.claim_type,
    field: claim.field,
    claim_value: claim.claim_value,
    claim_text: claim.claim_text,
    verdict: claim.support_verdict,
    evidence: claim.verification_sources.map((source) => ({
      source_ref_id: source.source_ref_id,
      source_url: source.verification_source_url,
      fetched_content_sha256: source.fetched_content_sha256,
      source_revision_sha256: source.source_revision_sha256,
    })),
  })) });
  const bundle = { ...bundlePayload, review_bundle_sha256: reviewBundleHash(bundlePayload) };
  if (bundle.review_bundle_sha256 !== handoff.evidence_bundle_sha256) {
    return failure(FACT_CHECK_HANDOFF_ERR.HASH, "evidence_bundle_sha256 does not match the exact bound bundle");
  }

  const sourcesForValidation = expectedSources.map((source) => ({
    ...source,
    source_revision: source.source_revision || source.content_hash,
  }));
  const bound = validateEvidenceBundle({
    bundle,
    intelId,
    intakeSnapshotSha256,
    eventKey,
    claims: expectedClaims,
    sources: sourcesForValidation,
    policyVersion,
    reviewerVersion,
    now,
    maxAgeMs: effectiveMaxAge,
  });
  if (!bound.bound) {
    return failure(bound.code || FACT_CHECK_HANDOFF_ERR.MALFORMED, bound.errors?.join("; ") || "trusted evidence validation failed");
  }
  return {
    ok: true,
    bound: true,
    contract_version: FACT_CHECK_HANDOFF_CONTRACT_VERSION,
    evidence_bundle_sha256: bundle.review_bundle_sha256,
    bundle,
    validation: bound,
    authority: Object.freeze({ publish: false, canonical_fact_write: false, approval: false }),
  };
}

// This alias makes the adapter easy to discover for callers that name the
// operation after its output rather than its provider-neutral input contract.
export const ingestTrustedEvidence = ingestFactCheckHandoff;
