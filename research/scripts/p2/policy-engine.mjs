import { bool, csvList, riskFlags } from "../intel/core.mjs";
import { classifyFactField } from "./fact-mutation.mjs";

// Policy-based decision engine for exception-based automation.
// Produces TWO independent decisions per event:
//   article_decision      — may a dated update/article publish?
//   fact_change_decision  — may canonical project-fact mutations proceed?
// A verified event may produce an article only, a fact change only, both, or
// neither. AUTO_ELIGIBLE is deliberately narrow; confidence scores may rank
// work but never bypass hard requirements.

export const POLICY_VERSION = "p2-policy-v1";

export const DECISION = Object.freeze({
  AUTO_ELIGIBLE: "AUTO_ELIGIBLE",
  NEEDS_DECISION: "NEEDS_DECISION",
  HOLD: "HOLD",
  DUPLICATE: "DUPLICATE",
});

// Flags that always force human handling regardless of evidence strength.
const SENSITIVE_FLAG_PATTERN = /(pricing|inventory|legal|termination|financing|regulatory|approval|zoning|permit|delivery|completion|handover|incentive|fee|assessment|ownership|title|equity|condo_termination)/i;

// Hard blockers: nothing with these may auto-publish or even reach the
// approval shortcut — they require an authorized review step.
const HOLD_WARNING_CODES = new Set([
  "ERR_TEMPORAL_CONFLICT",
  "ERR_EVIDENCE_CONFLICT",
  "ERR_EVENT_KEY_CONFLICT",
  "ERR_ENTITY_AMBIGUOUS",
  "ERR_UNSAFE_SOURCE",
]);

const AUTO_SUMMARY_MAX_CHARS = 400;

// Shared hard gates applied before either output is considered.
function hardGate({ row, result }) {
  const report = result.report;
  if (["duplicate", "additional_source"].includes(report.dedupe_classification)) {
    return { decision: DECISION.DUPLICATE, reasons: [`dedupe:${report.dedupe_classification}`] };
  }
  if (report.errors.length) return { decision: DECISION.HOLD, reasons: report.errors.map((e) => e.code) };
  if (report.dedupe_classification === "conflicting_event" || row.verification_status === "conflicting") {
    return { decision: DECISION.HOLD, reasons: ["conflicting_event"] };
  }
  const blockingWarnings = report.warnings.filter((w) => HOLD_WARNING_CODES.has(w.code));
  if (blockingWarnings.length) return { decision: DECISION.HOLD, reasons: blockingWarnings.map((w) => w.code) };
  return null;
}

// Soft gates escalate to NEEDS_DECISION — an authorized review step — rather
// than HOLD. HOLD is reserved for integrity problems (errors, conflicts,
// ambiguous identity) that must be resolved before a decision is even asked.
function softGateReasons({ row, result, boundReview }) {
  const reasons = [];
  if (bool(row.requires_human_review)) reasons.push("requires_human_review");
  const sensitiveFlags = riskFlags(row).filter((flag) => SENSITIVE_FLAG_PATTERN.test(flag));
  if (sensitiveFlags.length) reasons.push(`sensitive_flags:${sensitiveFlags.join(",")}`);
  const unsupported = result.claims.filter((claim) => claim.material && claim.support !== "supported");
  if (unsupported.length) reasons.push(`unsupported_claims:${unsupported.length}`);
  if (!boundReview?.bound) reasons.push("review_not_bound");
  else if (boundReview.reviewer_type !== "human" && !boundReview.claims_all_supported) reasons.push("ai_review_incomplete");
  if (result.report.warnings.length) reasons.push(`warnings:${result.report.warnings.map((w) => w.code).join(",")}`);
  return reasons;
}

function decideArticle({ row, result, boundReview, reviewCandidate }) {
  const candidate = reviewCandidate || result.candidate;
  if (!candidate) return { decision: DECISION.HOLD, reasons: ["no_candidate"] };
  const reasons = softGateReasons({ row, result, boundReview });
  if (candidate.provisional) reasons.push("provisional_candidate");
  if (!csvList(candidate.related_project_ids).length) reasons.push("unknown_project");
  if (!/^20\d{2}-\d{2}/.test(String(candidate.event_date || ""))) reasons.push("undated");
  if (String(candidate.summary || "").length > AUTO_SUMMARY_MAX_CHARS) reasons.push("over_long_summary");
  if (!reasons.length) return { decision: DECISION.AUTO_ELIGIBLE, reasons: ["all_requirements_met"] };
  return { decision: DECISION.NEEDS_DECISION, reasons };
}

// Fact mutations are classified per-field: objective project-state fields on
// the AUTO-FACT allowlist may auto-apply after strong verification; sensitive
// fields always require human approval. A high confidence score alone never
// authorizes a mutation.
function decideFactChange({ row, result, boundReview, mutations }) {
  if (!mutations?.length) return { decision: DECISION.HOLD, reasons: ["no_fact_mutation_proposed"], mutations: [] };
  const reasons = softGateReasons({ row, result, boundReview });
  const classified = mutations.map((mutation) => ({ ...mutation, risk: classifyFactField(mutation.field) }));

  const humanRequired = classified.filter((m) => m.risk === "human_required");
  if (humanRequired.length) reasons.push(`human_required_fields:${humanRequired.map((m) => m.field).join(",")}`);
  const noChange = classified.filter((m) => m.current === m.proposed);
  if (noChange.length) reasons.push(`no_op_fields:${noChange.map((m) => m.field).join(",")}`);

  if (!reasons.length) return { decision: DECISION.AUTO_ELIGIBLE, reasons: ["all_requirements_met"], mutations: classified };
  if (humanRequired.length) return { decision: DECISION.NEEDS_DECISION, reasons, mutations: classified };
  return { decision: DECISION.NEEDS_DECISION, reasons, mutations: classified };
}

export function decide({ row, result, boundReview, factMutations = [], reviewCandidate }) {
  const gate = hardGate({ row, result });
  if (gate) {
    return {
      policy_version: POLICY_VERSION,
      article_decision: gate.decision,
      fact_change_decision: gate.decision,
      reasons: gate.reasons,
      fact_mutations: [],
    };
  }
  const article = decideArticle({ row, result, boundReview, reviewCandidate });
  const facts = decideFactChange({ row, result, boundReview, mutations: factMutations });
  return {
    policy_version: POLICY_VERSION,
    article_decision: article.decision,
    fact_change_decision: facts.decision,
    reasons: { article: article.reasons, fact_change: facts.reasons },
    fact_mutations: facts.mutations,
  };
}
