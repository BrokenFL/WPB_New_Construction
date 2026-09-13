import fs from "node:fs/promises";
import path from "node:path";
import { sha256, stableJson } from "../intel/core.mjs";
import { idempotencyKey } from "./dispatch.mjs";

// Consolidated private review queue. Lives under gitignored .runtime/p2/ —
// raw intake, internal reviews, and approval tokens never enter tracked or
// public data. Entries are keyed by idempotency key so a retry of the same
// event + candidate revision + policy version can never create a second
// article, approval request, or deployment.

export const QUEUE_STATE = Object.freeze({
  PENDING_REVIEW: "pending_review",
  AUTO_ELIGIBLE: "auto_eligible_pending_release",
  APPROVED: "approved",
  HELD: "held",
  REJECTED: "rejected",
  RELEASED: "released",
});

export class ReviewQueue {
  constructor(root) {
    this.dir = path.join(root, ".runtime", "p2");
    this.file = path.join(this.dir, "review-queue.json");
    this.entries = new Map();
  }

  async load() {
    try {
      const data = JSON.parse(await fs.readFile(this.file, "utf8"));
      for (const entry of data.entries || []) this.entries.set(entry.idempotency_key, entry);
    } catch {}
    return this;
  }

  async save() {
    await fs.mkdir(this.dir, { recursive: true });
    await fs.writeFile(this.file, `${stableJson({ entries: [...this.entries.values()] })}\n`);
  }

  key({ eventKey, candidateSha256, policyVersion }) {
    return idempotencyKey({ eventKey, candidateSha256, policyVersion });
  }

  // Returns { entry, created } — created=false on replayed dispatch.
  enqueue({ eventKey, candidateSha256, policyVersion, intelId, decision, candidate, binding, provenance }) {
    const key = this.key({ eventKey, candidateSha256, policyVersion });
    const existing = this.entries.get(key);
    if (existing) return { entry: existing, created: false };
    const entry = {
      idempotency_key: key,
      intel_id: intelId,
      event_key: eventKey,
      candidate_sha256: candidateSha256,
      policy_version: policyVersion,
      decision,
      state: decision === "AUTO_ELIGIBLE" ? QUEUE_STATE.AUTO_ELIGIBLE : decision === "DUPLICATE" ? QUEUE_STATE.REJECTED : decision === "HOLD" ? QUEUE_STATE.HELD : QUEUE_STATE.PENDING_REVIEW,
      candidate,
      binding,
      provenance,
      approvals: [],
      created_at: new Date().toISOString(),
    };
    this.entries.set(key, entry);
    return { entry, created: true };
  }

  get(key) {
    return this.entries.get(key);
  }

  // Approval is bound to the exact candidate revision: stale or repeated
  // approvals are rejected, and a changed candidate_sha256 never inherits an
  // earlier approval.
  approve({ key, approvalToken, candidateSha256, now = new Date() }) {
    const entry = this.entries.get(key);
    if (!entry) return { ok: false, code: "ERR_QUEUE_ENTRY_NOT_FOUND" };
    if (Date.parse(approvalToken.expires_at) < now.getTime()) return { ok: false, code: "ERR_APPROVAL_EXPIRED" };
    if (entry.candidate_sha256 !== candidateSha256) return { ok: false, code: "ERR_STALE_APPROVAL" };
    if (entry.approvals.some((a) => a.token_id === approvalToken.token_id)) return { ok: false, code: "ERR_REPEATED_APPROVAL" };
    if (entry.state === QUEUE_STATE.APPROVED || entry.state === QUEUE_STATE.RELEASED) return { ok: false, code: "ERR_REPEATED_APPROVAL" };
    if (entry.state === QUEUE_STATE.REJECTED) return { ok: false, code: "ERR_ENTRY_REJECTED" };
    entry.approvals.push({ token_id: approvalToken.token_id, approved_at: now.toISOString(), approver: approvalToken.approver });
    entry.state = QUEUE_STATE.APPROVED;
    return { ok: true, entry };
  }

  hold(key, reason) {
    const entry = this.entries.get(key);
    if (!entry) return { ok: false, code: "ERR_QUEUE_ENTRY_NOT_FOUND" };
    entry.state = QUEUE_STATE.HELD;
    entry.hold_reason = reason;
    return { ok: true, entry };
  }

  reject(key, reason) {
    const entry = this.entries.get(key);
    if (!entry) return { ok: false, code: "ERR_QUEUE_ENTRY_NOT_FOUND" };
    entry.state = QUEUE_STATE.REJECTED;
    entry.reject_reason = reason;
    return { ok: true, entry };
  }

  stats() {
    const counts = {};
    for (const entry of this.entries.values()) counts[entry.state] = (counts[entry.state] || 0) + 1;
    return { total: this.entries.size, by_state: counts };
  }
}
