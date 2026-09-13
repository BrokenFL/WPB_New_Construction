import crypto from "node:crypto";
import { sha256, stableJson } from "../intel/core.mjs";

// Authenticated dispatch contract between the Apps Script change scanner and
// the local review-bundle runner. The envelope carries identifiers and hashes
// only — never private research text, credentials, or row content. Row content
// travels separately through the authorized private snapshot channel (see
// docs/P2_CLOUD_HANDOFF_APPROVAL.md).

export const DISPATCH_CONTRACT_VERSION = "p2-dispatch-v1";
export const DISPATCH_MAX_AGE_MS = 15 * 60 * 1000; // match the ~15-minute scan cadence
export const DISPATCH_MAX_RETRIES = 3;

export const DISPATCH_ERR = Object.freeze({
  BAD_SIGNATURE: "ERR_DISPATCH_SIGNATURE",
  STALE: "ERR_DISPATCH_STALE",
  REPLAY: "ERR_DISPATCH_REPLAY",
  MALFORMED: "ERR_DISPATCH_MALFORMED",
  SNAPSHOT_MISMATCH: "ERR_SNAPSHOT_MISMATCH",
});

function hmac(secret, payload) {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

export function signDispatch({ secret, sheetId, sheetName, snapshotSha256, records, policyVersion, issuedAt = new Date().toISOString(), nonce = crypto.randomUUID() }) {
  if (!secret) throw new Error("ERR_DISPATCH_SECRET_REQUIRED");
  const envelope = {
    contract_version: DISPATCH_CONTRACT_VERSION,
    // Content-derived: a retry with a fresh nonce still resolves to the same
    // dispatch_id so the durable ack store can no-op it.
    dispatch_id: `disp-${sha256({ snapshotSha256, recordIds: records.map((r) => r.intel_id).sort() }).slice(0, 16)}`,
    sheet_id: sheetId,
    sheet_name: sheetName,
    snapshot_sha256: snapshotSha256,
    policy_version: policyVersion,
    issued_at: issuedAt,
    nonce,
    records: records.map((record) => ({
      intel_id: record.intel_id,
      record_position: record.record_position,
      content_hash: record.content_hash,
      evidence_hash: record.evidence_hash,
    })),
  };
  return { ...envelope, signature: hmac(secret, stableJson(envelope)) };
}

export function verifyDispatch({ envelope, secret, now = Date.now(), seenNonces = new Set() }) {
  if (!envelope || typeof envelope !== "object") return { ok: false, code: DISPATCH_ERR.MALFORMED };
  const { signature, ...unsigned } = envelope;
  if (!signature || unsigned.contract_version !== DISPATCH_CONTRACT_VERSION) return { ok: false, code: DISPATCH_ERR.MALFORMED };
  if (!secret || hmac(secret, stableJson(unsigned)) !== signature) return { ok: false, code: DISPATCH_ERR.BAD_SIGNATURE };
  const issued = Date.parse(unsigned.issued_at || "");
  if (!Number.isFinite(issued) || Math.abs(now - issued) > DISPATCH_MAX_AGE_MS) return { ok: false, code: DISPATCH_ERR.STALE };
  if (seenNonces.has(unsigned.nonce)) return { ok: false, code: DISPATCH_ERR.REPLAY };
  return { ok: true, dispatch: unsigned };
}

// Idempotency: a retry of the same event + candidate revision + policy version
// must resolve to the same key and never create another article, approval
// request, or deployment.
export function idempotencyKey({ eventKey, candidateSha256, policyVersion }) {
  return sha256({ event_key: eventKey, candidate_sha256: candidateSha256, policy_version: policyVersion });
}

// Durable acknowledgment store: once a dispatch_id is acked, replays are
// acknowledged again without reprocessing.
export function createAckStore() {
  const acked = new Map();
  return {
    isAcked: (dispatchId) => acked.has(dispatchId),
    ack: (dispatchId, at = new Date().toISOString()) => {
      if (!acked.has(dispatchId)) acked.set(dispatchId, at);
      return { dispatch_id: dispatchId, acked_at: acked.get(dispatchId), duplicate: acked.get(dispatchId) !== at };
    },
    size: () => acked.size,
  };
}

// The runner binds a private snapshot to a dispatch by hash. A snapshot whose
// bytes do not hash to snapshot_sha256 is rejected — the dispatch can never
// smuggle in different row content than the scanner observed.
export function bindSnapshotToDispatch({ dispatch, snapshotCsv }) {
  const actual = sha256(snapshotCsv);
  if (actual !== dispatch.snapshot_sha256) {
    return { ok: false, code: DISPATCH_ERR.SNAPSHOT_MISMATCH, expected: dispatch.snapshot_sha256, actual };
  }
  return { ok: true, snapshot_sha256: actual };
}
