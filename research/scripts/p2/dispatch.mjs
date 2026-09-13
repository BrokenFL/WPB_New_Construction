import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { parseSheetCsv } from "../intel/sheet-adapter.mjs";
import { sha256, stableJson } from "../intel/core.mjs";

// Authenticated, data-minimal scanner handoff. The envelope carries only row
// identifiers, positions, and deterministic hashes. Private row content moves
// through a separately authorized snapshot channel.
export const DISPATCH_CONTRACT_VERSION = "p2-dispatch-v1";
export const DISPATCH_ACK_CONTRACT_VERSION = "p2-dispatch-ack-v1";
export const DISPATCH_MAX_AGE_MS = 15 * 60 * 1000;
export const DISPATCH_MAX_RETRIES = 3;

export const CONTENT_FIELDS = Object.freeze([
  "id", "headline", "project_name", "related_project_slug", "corridor",
  "article_type", "category", "summary", "material_updates", "why_it_matters",
  "buyer_angle", "source_name", "source_url", "source_published_date",
  "source_quality", "confidence_score", "recommended_status", "flags_json",
  "requires_human_review", "article_body", "seo_title", "seo_description",
  "social_copy", "record_type", "event_key", "lead_source_url",
  "primary_source_url", "related_project_ids", "related_corridor_ids",
  "created_at", "event_date", "effective_date", "fact_proposals_json",
  "project_fact_proposals_json", "fact_proposal_json", "proposed_facts_json",
  "project_fact_field", "project_fact_project_id", "project_fact_old_value",
  "project_fact_new_value", "project_fact_effective_date",
]);

export const EVIDENCE_FIELDS = Object.freeze([
  "verification_status", "verification_summary", "review_notes",
]);

export const WRITEBACK_FIELDS = Object.freeze([
  "status", "processed_at", "pr_url", "output_decision", "site_update_id",
  "canonical_update_url", "published_at", "processor_version",
  "processing_started_at", "claimed_by", "claim_token", "lease_expires_at",
  "last_updated",
]);

export const DISPATCH_ERR = Object.freeze({
  BAD_SIGNATURE: "ERR_DISPATCH_SIGNATURE",
  STALE: "ERR_DISPATCH_STALE",
  REPLAY: "ERR_DISPATCH_REPLAY",
  MALFORMED: "ERR_DISPATCH_MALFORMED",
  SNAPSHOT_MISMATCH: "ERR_SNAPSHOT_MISMATCH",
  RECORD_MISMATCH: "ERR_SNAPSHOT_RECORD_MISMATCH",
});

const SHA256 = /^[a-f0-9]{64}$/;
const INTEL_ID = /^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/;

function hmac(secret, payload) {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

function timingSafeHexEqual(left, right) {
  if (!SHA256.test(String(left)) || !SHA256.test(String(right))) return false;
  return crypto.timingSafeEqual(Buffer.from(left, "hex"), Buffer.from(right, "hex"));
}

function exactKeys(value, keys) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const allowed = new Set(keys);
  return keys.every((key) => Object.prototype.hasOwnProperty.call(value, key))
    && Object.keys(value).every((key) => allowed.has(key));
}

export function fieldHash(row, fields) {
  return sha256(Object.fromEntries(fields.map((field) => [field, String(row?.[field] ?? "")])));
}

export function recordHashes(row) {
  return {
    content_hash: fieldHash(row, CONTENT_FIELDS),
    evidence_hash: fieldHash(row, EVIDENCE_FIELDS),
  };
}

function normalizedRecords(records = []) {
  return [...records].map((record) => ({
    intel_id: record.intel_id,
    record_position: record.record_position,
    content_hash: record.content_hash,
    evidence_hash: record.evidence_hash,
  })).sort((a, b) => a.intel_id.localeCompare(b.intel_id));
}

export function dispatchSnapshotSha256({ sheetId, sheetName, records }) {
  return sha256({ sheet_id: sheetId, sheet_name: sheetName, records: normalizedRecords(records) });
}

function dispatchIdFor(snapshotSha256, records) {
  return `disp-${sha256({ snapshotSha256, recordIds: records.map((record) => record.intel_id).sort() }).slice(0, 16)}`;
}

export function signDispatch({ secret, sheetId, sheetName, snapshotSha256, records, policyVersion, issuedAt = new Date().toISOString(), nonce = crypto.randomUUID() }) {
  if (!secret) throw new Error("ERR_DISPATCH_SECRET_REQUIRED");
  const normalized = normalizedRecords(records);
  const computedSnapshot = dispatchSnapshotSha256({ sheetId, sheetName, records: normalized });
  if (snapshotSha256 && snapshotSha256 !== computedSnapshot) throw new Error(DISPATCH_ERR.SNAPSHOT_MISMATCH);
  const envelope = {
    contract_version: DISPATCH_CONTRACT_VERSION,
    dispatch_id: dispatchIdFor(computedSnapshot, normalized),
    sheet_id: sheetId,
    sheet_name: sheetName,
    snapshot_sha256: computedSnapshot,
    policy_version: policyVersion,
    issued_at: issuedAt,
    nonce,
    records: normalized,
  };
  return { ...envelope, signature: hmac(secret, stableJson(envelope)) };
}

function validRecord(record) {
  return exactKeys(record, ["intel_id", "record_position", "content_hash", "evidence_hash"])
    && INTEL_ID.test(String(record.intel_id))
    && Number.isSafeInteger(record.record_position)
    && record.record_position >= 2
    && SHA256.test(String(record.content_hash))
    && SHA256.test(String(record.evidence_hash));
}

export function verifyDispatch({ envelope, secret, now = Date.now(), seenNonces = new Set() }) {
  const keys = ["contract_version", "dispatch_id", "sheet_id", "sheet_name", "snapshot_sha256", "policy_version", "issued_at", "nonce", "records", "signature"];
  if (!exactKeys(envelope, keys) || envelope.contract_version !== DISPATCH_CONTRACT_VERSION) return { ok: false, code: DISPATCH_ERR.MALFORMED };
  const { signature, ...unsigned } = envelope;
  if (!secret || !timingSafeHexEqual(signature, hmac(secret, stableJson(unsigned)))) return { ok: false, code: DISPATCH_ERR.BAD_SIGNATURE };
  if (!String(unsigned.sheet_id) || !String(unsigned.sheet_name) || !String(unsigned.policy_version) || !String(unsigned.nonce)) return { ok: false, code: DISPATCH_ERR.MALFORMED };
  if (!Array.isArray(unsigned.records) || !unsigned.records.length || unsigned.records.some((record) => !validRecord(record))) return { ok: false, code: DISPATCH_ERR.MALFORMED };
  const ids = unsigned.records.map((record) => record.intel_id);
  const positions = unsigned.records.map((record) => record.record_position);
  if (new Set(ids).size !== ids.length || new Set(positions).size !== positions.length) return { ok: false, code: DISPATCH_ERR.MALFORMED };
  const expectedRecords = normalizedRecords(unsigned.records);
  if (stableJson(expectedRecords) !== stableJson(unsigned.records)) return { ok: false, code: DISPATCH_ERR.MALFORMED };
  const expectedSnapshot = dispatchSnapshotSha256({ sheetId: unsigned.sheet_id, sheetName: unsigned.sheet_name, records: unsigned.records });
  if (unsigned.snapshot_sha256 !== expectedSnapshot || unsigned.dispatch_id !== dispatchIdFor(expectedSnapshot, unsigned.records)) return { ok: false, code: DISPATCH_ERR.SNAPSHOT_MISMATCH };
  const issued = Date.parse(unsigned.issued_at || "");
  if (!Number.isFinite(issued) || Math.abs(now - issued) > DISPATCH_MAX_AGE_MS) return { ok: false, code: DISPATCH_ERR.STALE };
  if (seenNonces.has(unsigned.nonce)) return { ok: false, code: DISPATCH_ERR.REPLAY };
  return { ok: true, dispatch: unsigned };
}

export function idempotencyKey({ eventKey, candidateSha256, policyVersion }) {
  return sha256({ event_key: eventKey, candidate_sha256: candidateSha256, policy_version: policyVersion });
}

export function bindSnapshotToDispatch({ dispatch, snapshotCsv }) {
  let rows;
  try { rows = parseSheetCsv(snapshotCsv); }
  catch { return { ok: false, code: DISPATCH_ERR.SNAPSHOT_MISMATCH }; }
  const positionsById = new Map();
  rows.forEach((row, index) => {
    const positions = positionsById.get(row.id) || [];
    positions.push(index + 2);
    positionsById.set(row.id, positions);
  });
  for (const record of dispatch.records) {
    const row = rows[record.record_position - 2];
    const positions = positionsById.get(record.intel_id) || [];
    if (!row || row.id !== record.intel_id || positions.length !== 1) return { ok: false, code: DISPATCH_ERR.RECORD_MISMATCH, intel_id: record.intel_id };
    const hashes = recordHashes(row);
    if (hashes.content_hash !== record.content_hash || hashes.evidence_hash !== record.evidence_hash) return { ok: false, code: DISPATCH_ERR.RECORD_MISMATCH, intel_id: record.intel_id };
  }
  const actual = dispatchSnapshotSha256({ sheetId: dispatch.sheet_id, sheetName: dispatch.sheet_name, records: dispatch.records });
  if (actual !== dispatch.snapshot_sha256) return { ok: false, code: DISPATCH_ERR.SNAPSHOT_MISMATCH, expected: dispatch.snapshot_sha256, actual };
  return { ok: true, snapshot_sha256: actual };
}

export function createDispatchAck({ dispatchId, replayed = false, ackedAt = new Date().toISOString() }) {
  return {
    contract_version: DISPATCH_ACK_CONTRACT_VERSION,
    ok: true,
    durable: true,
    dispatch_id: dispatchId,
    replayed,
    acked_at: ackedAt,
  };
}

export function createAckStore() {
  const acked = new Map();
  return {
    isAcked: async (dispatchId) => acked.has(dispatchId),
    ack: async (dispatchId, at = new Date().toISOString()) => {
      const duplicate = acked.has(dispatchId);
      if (!duplicate) acked.set(dispatchId, at);
      return { dispatch_id: dispatchId, acked_at: acked.get(dispatchId), duplicate };
    },
    size: () => acked.size,
  };
}

export function createFileAckStore(root) {
  const dir = path.join(root, ".runtime", "p2");
  const file = path.join(dir, "dispatch-acks.json");
  let loaded = false;
  const acked = new Map();
  const load = async () => {
    if (loaded) return;
    loaded = true;
    try {
      const parsed = JSON.parse(await fs.readFile(file, "utf8"));
      if (!exactKeys(parsed, ["acks"]) || !Array.isArray(parsed.acks)) throw new Error("ERR_ACK_STORE_MALFORMED");
      for (const item of parsed.acks) {
        if (!exactKeys(item, ["dispatch_id", "acked_at"])
          || typeof item.dispatch_id !== "string"
          || !item.dispatch_id
          || !Number.isFinite(Date.parse(item.acked_at))
          || acked.has(item.dispatch_id)) throw new Error("ERR_ACK_STORE_MALFORMED");
        acked.set(item.dispatch_id, item.acked_at);
      }
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  };
  return {
    isAcked: async (dispatchId) => { await load(); return acked.has(dispatchId); },
    ack: async (dispatchId, at = new Date().toISOString()) => {
      await load();
      const duplicate = acked.has(dispatchId);
      if (!duplicate) {
        acked.set(dispatchId, at);
        await fs.mkdir(dir, { recursive: true });
        const tmp = `${file}.${process.pid}.${crypto.randomUUID()}.tmp`;
        const acks = [...acked].map(([id, time]) => ({ dispatch_id: id, acked_at: time })).sort((a, b) => a.dispatch_id.localeCompare(b.dispatch_id));
        await fs.writeFile(tmp, `${stableJson({ acks })}\n`, { mode: 0o600 });
        await fs.rename(tmp, file);
      }
      return { dispatch_id: dispatchId, acked_at: acked.get(dispatchId), duplicate };
    },
    size: () => acked.size,
  };
}
