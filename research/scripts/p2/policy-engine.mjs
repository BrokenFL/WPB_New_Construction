import { bool, riskFlags, sha256, stableJson } from "../intel/core.mjs";
import { classifyFactField, factTestTargetSha256, requiredAutoFactTests } from "./fact-mutation.mjs";

export const POLICY_VERSION = "p2-shadow-policy-v2";

export const DECISION = Object.freeze({
  AUTO_ELIGIBLE: "AUTO_ELIGIBLE",
  NEEDS_DECISION: "NEEDS_DECISION",
  HOLD: "HOLD",
  DUPLICATE: "DUPLICATE",
  NONE: "NONE",
});

const SENSITIVE_FLAG_PATTERN = /(pricing|inventory|legal|termination|financing|regulatory|approval|zoning|permit|delivery|handover|incentive|fee|assessment|ownership|title|equity|condo_termination)/i;
const HOLD_WARNING_CODES = new Set([
  "ERR_TEMPORAL_CONFLICT",
  "ERR_EVIDENCE_CONFLICT",
  "ERR_EVENT_KEY_CONFLICT",
  "ERR_ENTITY_AMBIGUOUS",
  "ERR_UNSAFE_SOURCE",
  "ERR_REVIEW_BUNDLE_MALFORMED",
  "ERR_REVIEW_BUNDLE_HASH",
  "ERR_REVIEW_SNAPSHOT_MISMATCH",
  "ERR_REVIEW_EVENT_MISMATCH",
  "ERR_REVIEW_CLAIMS_MISMATCH",
  "ERR_REVIEW_SOURCE_MISMATCH",
  "ERR_REVIEW_POLICY_MISMATCH",
  "ERR_REVIEW_REVIEWER_VERSION_MISMATCH",
  "ERR_REVIEW_STALE",
]);
const AUTO_SUMMARY_MAX_CHARS = 400;

function hardGate({ row, result }) {
  const report = result.report;
  if (["duplicate", "additional_source"].includes(report.dedupe_classification)) {
    return { decision: DECISION.DUPLICATE, reasons: [`dedupe:${report.dedupe_classification}`] };
  }
  if (report.errors.length) return { decision: DECISION.HOLD, reasons: report.errors.map((error) => error.code) };
  if (report.dedupe_classification === "conflicting_event" || row.verification_status === "conflicting") {
    return { decision: DECISION.HOLD, reasons: ["conflicting_event", ...report.warnings.map((warning) => warning.code)] };
  }
  const blockingWarnings = report.warnings.filter((warning) => HOLD_WARNING_CODES.has(warning.code));
  if (blockingWarnings.length) return { decision: DECISION.HOLD, reasons: blockingWarnings.map((warning) => warning.code) };
  return null;
}

function exceptionReasons(row) {
  const reasons = [];
  if (bool(row.requires_human_review)) reasons.push("requires_human_review");
  const sensitive = riskFlags(row).filter((flag) => SENSITIVE_FLAG_PATTERN.test(flag));
  if (sensitive.length) reasons.push(`sensitive_flags:${sensitive.join(",")}`);
  return reasons;
}

function decideArticle({ row, result, boundReview, articleCandidate }) {
  if (!articleCandidate) return { decision: DECISION.HOLD, reasons: ["no_article_candidate"] };
  if (!boundReview?.bound) return { decision: DECISION.HOLD, reasons: [boundReview?.code || "review_not_bound"] };
  if (!boundReview.claims_all_supported) return { decision: DECISION.HOLD, reasons: ["article_claims_not_all_supported"] };
  const reasons = exceptionReasons(row);
  if (!articleCandidate.title || !Array.isArray(articleCandidate.sections) || !articleCandidate.sections.length) reasons.push("article_candidate_incomplete");
  if (!/^20\d{2}-\d{2}/.test(String(result.candidate?.event_date || result.snapshot?.event_date || ""))) reasons.push("undated");
  if (String(articleCandidate.deck || "").length > AUTO_SUMMARY_MAX_CHARS) reasons.push("over_long_deck");
  if (reasons.length) return { decision: DECISION.NEEDS_DECISION, reasons };
  return { decision: DECISION.AUTO_ELIGIBLE, reasons: ["all_article_requirements_met"] };
}

function sameValue(left, right) {
  return stableJson(left) === stableJson(right);
}

function validIsoDate(value) {
  if (!/^20\d{2}-\d{2}-\d{2}$/.test(String(value || ""))) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function acceptableSourceClass(mutation) {
  const sources = mutation.verification_sources || [];
  const tier1 = sources.filter((source) => source.source_tier === 1);
  if (mutation.field === "name") return tier1.length > 0;
  if (tier1.length > 0) return true;
  const tier2Hosts = new Set(sources.filter((source) => source.source_tier === 2).map((source) => {
    try { return new URL(source.url).hostname; } catch { return ""; }
  }).filter(Boolean));
  return tier2Hosts.size >= 2;
}

function autoFactGateReasons({ mutation, result, boundReview }) {
  const reasons = [];
  const { mutation_sha256: suppliedMutationSha, ...mutationPayload } = mutation;
  if (suppliedMutationSha !== sha256(stableJson(mutationPayload))) reasons.push("fact_mutation_hash_mismatch");
  if (mutation.policy_version !== POLICY_VERSION) reasons.push("fact_policy_version_mismatch");
  if (mutation.apply !== false) reasons.push("fact_apply_must_remain_false");
  if (!boundReview?.bound || mutation.evidence_bundle_sha256 !== boundReview.review_bundle_sha256) reasons.push("fact_evidence_bundle_not_bound");
  const proposal = (result.projectFactProposals || []).find((item) => item.project_id === mutation.project_id
    && item.field === mutation.field
    && sameValue(item.old_value, mutation.current_value)
    && sameValue(item.proposed_value, mutation.proposed_value)
    && item.event_key === mutation.event_key);
  if (!proposal) reasons.push("fact_not_from_phase_a_proposal");
  if (!mutation.canonical_base || mutation.canonical_base.expected_revision !== result.report.canonical_index_revision
    || proposal?.canonical_index_revision !== result.report.canonical_index_revision
    || mutation.canonical_base.current_value_sha256 !== sha256({ value: mutation.current_value })) reasons.push("canonical_revision_drift");
  if (sameValue(mutation.current_value, mutation.proposed_value)) reasons.push("fact_no_change");
  if (!validIsoDate(mutation.event_date)) reasons.push("invalid_event_date");
  if (!validIsoDate(mutation.effective_date)) reasons.push("invalid_effective_date");
  if (validIsoDate(mutation.event_date) && validIsoDate(mutation.effective_date) && mutation.effective_date > mutation.event_date) reasons.push("effective_date_after_event");
  if (String(mutation.event_key || "").split("|").at(-1) !== mutation.event_date) reasons.push("event_key_date_mismatch");
  const claimIds = new Set(proposal?.supporting_claim_ids || []);
  const evidence = mutation.claim_evidence || [];
  if (!claimIds.size || evidence.length !== claimIds.size || evidence.some((item) => !claimIds.has(item.claim_id) || item.support_verdict !== "supported" || !item.source_ref_ids?.length)) reasons.push("fact_claims_not_supported");
  const resultClaims = new Map(result.claims.map((claim) => [claim.claim_id, claim]));
  if (evidence.some((item) => resultClaims.get(item.claim_id)?.support !== "supported")) reasons.push("fact_claim_state_mismatch");
  const sourceIds = new Set((mutation.verification_sources || []).map((source) => source.source_ref_id));
  if (evidence.some((item) => item.source_ref_ids.some((id) => !sourceIds.has(id)))) reasons.push("fact_source_binding_mismatch");
  if (!acceptableSourceClass(mutation)) reasons.push("fact_source_class_unacceptable");
  const expectedTests = requiredAutoFactTests(mutation.field).sort();
  const actualRequired = [...(mutation.validation?.required_tests || [])].sort();
  const expectedTarget = factTestTargetSha256({
    projectId: mutation.project_id,
    field: mutation.field,
    current: mutation.current_value,
    proposed: mutation.proposed_value,
    eventKey: mutation.event_key,
    eventDate: mutation.event_date,
    effectiveDate: mutation.effective_date,
    evidenceBundleSha256: mutation.evidence_bundle_sha256,
    expectedCanonicalRevision: mutation.canonical_base?.expected_revision,
  });
  const results = mutation.validation?.results || [];
  const resultNames = results.map((item) => item.name).sort();
  if (!mutation.validation?.all_required_passed
    || mutation.validation.test_target_sha256 !== expectedTarget
    || stableJson(actualRequired) !== stableJson(expectedTests)
    || stableJson(resultNames) !== stableJson(expectedTests)
    || results.some((item) => item.status !== "passed"
      || item.tested_canonical_revision !== mutation.canonical_base?.expected_revision
      || item.test_target_sha256 !== expectedTarget)) reasons.push("fact_tests_not_passed");
  return reasons;
}

function decideFactChange({ row, result, boundReview, mutations }) {
  if (!mutations?.length) {
    if (result.heldProjectFactProposals?.length) return { decision: DECISION.HOLD, reasons: ["held_fact_proposals"], mutations: [] };
    return { decision: DECISION.NONE, reasons: ["no_fact_change_proposed"], mutations: [] };
  }
  const actualChanges = mutations.filter((mutation) => !sameValue(mutation.current_value, mutation.proposed_value));
  if (!actualChanges.length) return { decision: DECISION.NONE, reasons: ["canonical_value_already_equal"], mutations };
  const humanRequired = actualChanges.filter((mutation) => classifyFactField(mutation.field) === "human_required");
  if (humanRequired.length) {
    return {
      decision: DECISION.NEEDS_DECISION,
      reasons: [...exceptionReasons(row), `human_required_fields:${humanRequired.map((mutation) => mutation.field).join(",")}`],
      mutations,
    };
  }
  const exceptions = exceptionReasons(row);
  if (exceptions.length) return { decision: DECISION.NEEDS_DECISION, reasons: exceptions, mutations };
  const gateReasons = actualChanges.flatMap((mutation) => autoFactGateReasons({ mutation, result, boundReview }).map((reason) => `${mutation.field}:${reason}`));
  if (gateReasons.length) return { decision: DECISION.HOLD, reasons: gateReasons, mutations };
  return { decision: DECISION.AUTO_ELIGIBLE, reasons: ["all_fact_requirements_met"], mutations };
}

export function decide({ row, result, boundReview, factMutations = [], articleCandidate = null }) {
  const gate = hardGate({ row, result });
  if (gate) {
    return {
      policy_version: POLICY_VERSION,
      article_decision: gate.decision,
      fact_change_decision: gate.decision === DECISION.DUPLICATE ? DECISION.NONE : gate.decision,
      reasons: { article: gate.reasons, fact_change: gate.decision === DECISION.DUPLICATE ? ["duplicate_event_has_no_fact_change"] : gate.reasons },
      fact_mutations: [],
    };
  }
  const article = decideArticle({ row, result, boundReview, articleCandidate });
  const facts = decideFactChange({ row, result, boundReview, mutations: factMutations });
  return {
    policy_version: POLICY_VERSION,
    article_decision: article.decision,
    fact_change_decision: facts.decision,
    reasons: { article: article.reasons, fact_change: facts.reasons },
    fact_mutations: facts.mutations,
  };
}
