import fs from "node:fs/promises";
import path from "node:path";
import { sha256, stableJson } from "../intel/core.mjs";
import { idempotencyKey } from "./dispatch.mjs";

export const QUEUE_STATE = Object.freeze({
  PENDING_REVIEW: "pending_review",
  AUTO_ELIGIBLE: "auto_eligible_pending_release",
  APPROVED: "approved",
  HELD: "held",
  REJECTED: "rejected",
  RELEASED: "released",
  NONE: "none",
  MIXED: "mixed",
});

function stateForDecision(decision) {
  if (decision === "AUTO_ELIGIBLE") return QUEUE_STATE.AUTO_ELIGIBLE;
  if (decision === "NEEDS_DECISION") return QUEUE_STATE.PENDING_REVIEW;
  if (decision === "HOLD") return QUEUE_STATE.HELD;
  if (decision === "DUPLICATE") return QUEUE_STATE.REJECTED;
  return QUEUE_STATE.NONE;
}

function aggregateState(articleState, factState) {
  return articleState === factState ? articleState : QUEUE_STATE.MIXED;
}

export function reviewCandidateSha256(reviewObject) {
  return sha256(reviewObject);
}

export class ReviewQueue {
  constructor(root) {
    this.dir = path.join(root, ".runtime", "p2");
    this.file = path.join(this.dir, "review-queue.json");
    this.entries = new Map();
  }

  async load() {
    try {
      const data = JSON.parse(await fs.readFile(this.file, "utf8"));
      if (!data || typeof data !== "object" || Array.isArray(data) || Object.keys(data).length !== 1 || !Array.isArray(data.entries)) throw new Error("ERR_REVIEW_QUEUE_MALFORMED");
      for (const entry of data.entries) {
        if (!entry || typeof entry !== "object" || Array.isArray(entry)
          || typeof entry.idempotency_key !== "string" || !entry.idempotency_key
          || typeof entry.candidate_sha256 !== "string" || !entry.candidate_sha256
          || typeof entry.policy_version !== "string" || !entry.policy_version
          || this.entries.has(entry.idempotency_key)) throw new Error("ERR_REVIEW_QUEUE_MALFORMED");
        this.entries.set(entry.idempotency_key, entry);
      }
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    return this;
  }

  async save() {
    await fs.mkdir(this.dir, { recursive: true });
    const temp = `${this.file}.${process.pid}.tmp`;
    await fs.writeFile(temp, `${stableJson({ entries: [...this.entries.values()] })}\n`, { mode: 0o600 });
    await fs.rename(temp, this.file);
  }

  key({ eventKey, candidateSha256, policyVersion }) {
    return idempotencyKey({ eventKey, candidateSha256, policyVersion });
  }

  enqueue({ eventKey, policyVersion, intelId, articleDecision, factChangeDecision, reviewObject, binding, provenance }) {
    const candidateSha256 = reviewCandidateSha256(reviewObject);
    const key = this.key({ eventKey, candidateSha256, policyVersion });
    const existing = this.entries.get(key);
    if (existing) return { entry: existing, created: false };
    const articleState = stateForDecision(articleDecision);
    const factState = stateForDecision(factChangeDecision);
    const entry = {
      idempotency_key: key,
      intel_id: intelId,
      event_key: eventKey,
      candidate_sha256: candidateSha256,
      evidence_bundle_sha256: binding?.review_bundle_sha256 || null,
      policy_version: policyVersion,
      article_decision: articleDecision,
      fact_change_decision: factChangeDecision,
      article_state: articleState,
      fact_change_state: factState,
      state: aggregateState(articleState, factState),
      review_object: reviewObject,
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

  act({ key, approvalToken, action, scope, now = new Date() }) {
    const entry = this.entries.get(key);
    if (!entry) return { ok: false, code: "ERR_QUEUE_ENTRY_NOT_FOUND" };
    if (!approvalToken || Date.parse(approvalToken.expires_at) < now.getTime()) return { ok: false, code: "ERR_APPROVAL_EXPIRED" };
    const actualSha = reviewCandidateSha256(entry.review_object);
    if (actualSha !== entry.candidate_sha256) return { ok: false, code: "ERR_ALTERED_CANDIDATE" };
    if (approvalToken.candidate_sha256 !== entry.candidate_sha256
      || approvalToken.evidence_bundle_sha256 !== entry.evidence_bundle_sha256
      || approvalToken.policy_version !== entry.policy_version) return { ok: false, code: "ERR_STALE_APPROVAL" };
    if (!approvalToken.scopes?.includes(scope) || !["article", "fact_change"].includes(scope)) return { ok: false, code: "ERR_APPROVAL_SCOPE" };
    if (entry.approvals.some((item) => item.token_id === approvalToken.token_id && item.scope === scope)) return { ok: false, code: "ERR_REPEATED_APPROVAL" };
    if (!["approve", "hold", "reject"].includes(action)) return { ok: false, code: "ERR_APPROVAL_ACTION" };
    const stateKey = scope === "article" ? "article_state" : "fact_change_state";
    if (entry[stateKey] !== QUEUE_STATE.PENDING_REVIEW) return { ok: false, code: "ERR_STALE_APPROVAL" };
    entry.approvals.push({ token_id: approvalToken.token_id, scope, action, acted_at: now.toISOString(), approver: approvalToken.approver });
    if (action === "approve") {
      entry[stateKey] = QUEUE_STATE.APPROVED;
    } else if (action === "hold") {
      entry[stateKey] = QUEUE_STATE.HELD;
      entry.hold_reason = "approver_hold";
    } else {
      entry[stateKey] = QUEUE_STATE.REJECTED;
      entry.reject_reason = "approver_reject";
    }
    entry.state = aggregateState(entry.article_state, entry.fact_change_state);
    return { ok: true, entry };
  }

  approve({ key, approvalToken, scope, now = new Date() }) {
    return this.act({ key, approvalToken, action: "approve", scope, now });
  }

  hold({ key, approvalToken, scope, now = new Date() }) {
    return this.act({ key, approvalToken, action: "hold", scope, now });
  }

  reject({ key, approvalToken, scope, now = new Date() }) {
    return this.act({ key, approvalToken, action: "reject", scope, now });
  }

  stats() {
    const article = {};
    const factChange = {};
    for (const entry of this.entries.values()) {
      article[entry.article_state] = (article[entry.article_state] || 0) + 1;
      factChange[entry.fact_change_state] = (factChange[entry.fact_change_state] || 0) + 1;
    }
    return { total: this.entries.size, article, fact_change: factChange };
  }
}
