import {
  DEFAULT_REVIEWER_VERSION,
  EVIDENCE_BUNDLE_CONTRACT_VERSION,
  REVIEW_ERR,
  evidenceSourceRecord,
  reviewBundleHash,
  sourceRevisionSha256,
} from "./evidence-review.mjs";
import { stableJson } from "../intel/normalizer.mjs";

// p2-fact-check-handoff-v2 — the Fast Mode verifier contract. Unlike v1 it is
// computable by an external assistant task without SHA-256 tooling: the
// verifier copies intake_snapshot_sha256 and event_key verbatim from the
// processor-emitted fact-check packet and selects verdicts plus evidence
// source_ref_ids. The processor still owns every fetched source revision, so
// the verifier can only bind claims to sources the runner actually fetched.
export const FAST_FACT_CHECK_HANDOFF_VERSION = "p2-fact-check-handoff-v2";

const VERDICTS = new Set(["supported", "unsupported", "conflicting"]);
const REVIEWER_TYPES = new Set(["automated_fact_checker", "human"]);

function failure(code, detail) {
  return { ok: false, bound: false, code, errors: [detail], claims_all_supported: false };
}

function exactKeys(value, allowed) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const set = new Set(allowed);
  return Object.keys(value).every((key) => set.has(key));
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

function sortedBy(items, key) {
  return [...items].sort((a, b) => String(a[key]).localeCompare(String(b[key])));
}

/**
 * Ingest a fast-mode verifier handoff and derive the same bound review shape
 * the v1 handoff produces. `expectedClaims` and `expectedSources` are the
 * authoritative Phase A output for this exact intake snapshot; the handoff
 * must cover every claim exactly once and may only cite fetched sources.
 */
export function ingestFastFactCheckHandoff({
  handoff,
  expectedClaims = [],
  expectedSources = [],
  intelId,
  intakeSnapshotSha256,
  eventKey,
  policyVersion,
  reviewerVersion = DEFAULT_REVIEWER_VERSION,
  now = Date.now(),
  maxAgeMs = 30 * 24 * 60 * 60 * 1000,
} = {}) {
  const topKeys = [
    "contract_version", "intel_id", "intake_snapshot_sha256", "event_key",
    "claims", "verification_timestamp", "reviewer_type", "reviewer_id",
    "reviewer_name", "reviewer_version", "policy_version", "notes",
  ];
  const claimKeys = ["claim_id", "verdict", "evidence_source_ref_ids", "note"];
  if (!exactKeys(handoff, topKeys) || handoff?.contract_version !== FAST_FACT_CHECK_HANDOFF_VERSION) {
    return failure("ERR_FACT_CHECK_HANDOFF_MALFORMED", "handoff has an unknown or missing field or wrong contract_version");
  }
  for (const key of ["contract_version", "intel_id", "intake_snapshot_sha256", "event_key", "claims", "verification_timestamp", "reviewer_type", "reviewer_id", "reviewer_name", "reviewer_version", "policy_version"]) {
    if (!Object.prototype.hasOwnProperty.call(handoff, key)) {
      return failure("ERR_FACT_CHECK_HANDOFF_MALFORMED", `missing required field ${key}`);
    }
  }
  if (handoff.intel_id !== intelId || typeof intelId !== "string" || !intelId) {
    return failure(REVIEW_ERR.SNAPSHOT_MISMATCH, "intel_id does not match the selected intake record");
  }
  if (handoff.intake_snapshot_sha256 !== intakeSnapshotSha256) {
    return failure(REVIEW_ERR.SNAPSHOT_MISMATCH, "intake snapshot hash mismatch — copy p2_row_sha256 verbatim");
  }
  if (handoff.event_key !== eventKey || !eventKey) {
    return failure(REVIEW_ERR.EVENT_MISMATCH, "event_key does not match the Phase A event");
  }
  if (handoff.policy_version !== policyVersion) {
    return failure(REVIEW_ERR.POLICY_MISMATCH, "policy version mismatch");
  }
  if (!REVIEWER_TYPES.has(handoff.reviewer_type)
    || typeof handoff.reviewer_id !== "string" || !handoff.reviewer_id
    || typeof handoff.reviewer_name !== "string" || !handoff.reviewer_name
    || handoff.reviewer_version !== reviewerVersion) {
    return failure(REVIEW_ERR.MISSING_REVIEWER, "reviewer type, id, name, or version is invalid");
  }
  const verifiedAt = Date.parse(handoff.verification_timestamp);
  if (typeof handoff.verification_timestamp !== "string"
    || !Number.isFinite(verifiedAt)
    || verifiedAt > now + 5 * 60 * 1000
    || now - verifiedAt > maxAgeMs) {
    return failure(REVIEW_ERR.STALE, "verification timestamp is invalid, future, or stale");
  }
  if (!Array.isArray(expectedClaims) || !expectedClaims.length || !Array.isArray(expectedSources) || !expectedSources.length) {
    return failure("ERR_FACT_CHECK_HANDOFF_MALFORMED", "authoritative claims and sources are required");
  }
  const expectedClaimById = new Map(expectedClaims.map((claim) => [claim.claim_id, claim]));
  const expectedSourceById = new Map(expectedSources.map((source) => [source.source_ref_id, source]));
  if (expectedClaimById.size !== expectedClaims.length || expectedSourceById.size !== expectedSources.length) {
    return failure("ERR_FACT_CHECK_HANDOFF_MALFORMED", "authoritative claims or sources contain duplicate identifiers");
  }
  if (!Array.isArray(handoff.claims) || handoff.claims.length !== expectedClaims.length) {
    return failure(REVIEW_ERR.CLAIMS_MISMATCH, "handoff must give a verdict for every Phase A claim exactly once");
  }

  const seenClaims = new Set();
  const bundleClaims = [];
  for (const entry of handoff.claims) {
    if (!exactKeys(entry, claimKeys) || !VERDICTS.has(entry.verdict)) {
      return failure("ERR_FACT_CHECK_HANDOFF_MALFORMED", "claim entries allow only claim_id, verdict, evidence_source_ref_ids, note and a valid verdict");
    }
    const expected = expectedClaimById.get(entry.claim_id);
    if (!expected || seenClaims.has(entry.claim_id)) {
      return failure(REVIEW_ERR.CLAIMS_MISMATCH, `claim ${entry.claim_id} is absent from Phase A or duplicated`);
    }
    seenClaims.add(entry.claim_id);
    const refs = Array.isArray(entry.evidence_source_ref_ids) ? entry.evidence_source_ref_ids : [];
    if (!refs.length) {
      return failure(REVIEW_ERR.SOURCE_MISMATCH, `claim ${entry.claim_id} cites no evidence source`);
    }
    const verificationSources = [];
    const seenSources = new Set();
    for (const ref of refs) {
      const source = expectedSourceById.get(ref);
      if (!source || seenSources.has(ref)) {
        return failure(REVIEW_ERR.SOURCE_MISMATCH, `claim ${entry.claim_id} cites unknown or duplicate source ${ref}`);
      }
      seenSources.add(ref);
      verificationSources.push(evidenceSourceRecord(source));
    }
    bundleClaims.push({
      claim_id: expected.claim_id,
      claim_type: expected.claim_type,
      field: expected.field,
      claim_value: expected.claim_value,
      claim_text: expected.claim_text_normalized,
      support_verdict: entry.verdict,
      verification_sources: sortedBy(verificationSources, "source_ref_id"),
      ...(typeof entry.note === "string" && entry.note.trim() ? {} : {}),
    });
  }
  if (seenClaims.size !== expectedClaims.length) {
    return failure(REVIEW_ERR.CLAIMS_MISMATCH, "handoff is missing one or more Phase A claims");
  }

  const payload = {
    contract_version: EVIDENCE_BUNDLE_CONTRACT_VERSION,
    intel_id: intelId,
    intake_snapshot_sha256: intakeSnapshotSha256,
    event_key: eventKey,
    claims: sortedBy(bundleClaims, "claim_id").map(({ note, ...claim }) => claim),
    verification_timestamp: handoff.verification_timestamp,
    reviewer_type: handoff.reviewer_type,
    reviewer_identity: `${handoff.reviewer_id} (${handoff.reviewer_name})`,
    reviewer_version: handoff.reviewer_version,
    policy_version: policyVersion,
  };
  const bundle = { ...payload, review_bundle_sha256: reviewBundleHash(payload) };

  // Reuse the strict bundle validator so fetched-source integrity rules are
  // identical to the v1 path (reachable, attested, hashed revisions only).
  const bound = bundle.claims.every((claim) => claim.verification_sources.every((sourceRecord) => {
    const source = expectedSourceById.get(sourceRecord.source_ref_id);
    return source
      && sourceRecord.verification_source_url === source.url
      && sourceRecord.fetched_content_sha256 === source.content_hash
      && sourceRecord.source_revision_sha256 === sourceRevisionSha256(source)
      && source.retrieval_status === "fetched"
      && source.retrieval_attested === true
      && source.reachable === true
      && Number.isFinite(source.body_bytes)
      && !source.error;
  }));
  if (!bound) {
    return failure(REVIEW_ERR.SOURCE_MISMATCH, "a cited source was not a successfully fetched, attested revision");
  }

  const materialClaimIds = expectedClaims.filter((claim) => claim.material).map((claim) => claim.claim_id);
  const verdictByClaim = Object.fromEntries(bundle.claims.map((claim) => [claim.claim_id, claim.support_verdict]));
  const claimsAllSupported = materialClaimIds.length > 0 && materialClaimIds.every((id) => verdictByClaim[id] === "supported");
  return {
    ok: true,
    bound: true,
    contract_version: FAST_FACT_CHECK_HANDOFF_VERSION,
    evidence_bundle_sha256: bundle.review_bundle_sha256,
    bundle,
    claims_all_supported: claimsAllSupported,
    validation: {
      bound: true,
      review_bundle_sha256: bundle.review_bundle_sha256,
      claims_all_supported: claimsAllSupported,
      verdicts: verdictByClaim,
      provenance: {
        reviewer_type: handoff.reviewer_type,
        reviewer_identity: payload.reviewer_identity,
        reviewer_version: handoff.reviewer_version,
        verification_timestamp: handoff.verification_timestamp,
        policy_version: policyVersion,
        review_bundle_sha256: bundle.review_bundle_sha256,
      },
    },
    authority: Object.freeze({ publish: false, canonical_fact_write: false, approval: false }),
  };
}

/**
 * Build the packet the external verifier copies from. Written into the private
 * `p2_fact_packet_json` writeback column so the task needs no hash tooling —
 * it copies `intake_snapshot_sha256`/`event_key` verbatim and picks
 * source_ref_ids from `available_sources`.
 */
export function buildFastFactCheckPacket({ result, policyVersion, reviewerVersion = DEFAULT_REVIEWER_VERSION } = {}) {
  const packet = {
    contract_version: "p2-fast-fact-packet-v1",
    intel_id: result.report.intel_id,
    intake_snapshot_sha256: result.report.row_sha256,
    event_key: result.report.derived_event_key,
    policy_version: policyVersion,
    reviewer_version: reviewerVersion,
    claims: [...result.claims]
      .sort((a, b) => String(a.claim_id).localeCompare(String(b.claim_id)))
      .map((claim) => ({
        claim_id: claim.claim_id,
        claim_type: claim.claim_type,
        field: claim.field,
        claim_value: claim.claim_value,
        claim_text: claim.claim_text_normalized,
        material: claim.material === true,
      })),
    available_sources: [...result.verificationSources]
      .filter((source) => !source.error && source.url)
      .sort((a, b) => String(a.source_ref_id).localeCompare(String(b.source_ref_id)))
      .map((source) => ({
        source_ref_id: source.source_ref_id,
        url: source.url,
        source_name: source.source_name || null,
        source_tier: source.source_tier ?? null,
        retrieved: source.retrieval_status === "fetched" && source.reachable === true,
      })),
    authority: { publish: false, canonical_fact_write: false, approval: false },
  };
  return packet;
}

export function sameClaimValue(left, right) {
  return sameValue(left, right);
}
