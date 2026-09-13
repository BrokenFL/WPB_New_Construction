import { sha256, stableJson } from "../intel/core.mjs";

// Fast Mode policy (p2-fast-policy-v1). Intentionally looser than the shadow
// policy: a credible, attributable core event auto-publishes even when
// secondary details are uncertain; the writer omits or qualifies them.
// Canonical facts auto-apply for objective fields and for dynamic fields that
// carry source + as-of provenance. Humans are reserved for genuine conflicts,
// unresolved identity, legal conclusions, and destructive merges.
export const FAST_MODE_POLICY_VERSION = "p2-fast-policy-v1";

export const ARTICLE_DECISION = Object.freeze({
  AUTO_PUBLISH: "AUTO_PUBLISH",
  NEEDS_DECISION: "NEEDS_DECISION",
  HOLD: "HOLD",
  DUPLICATE: "DUPLICATE",
});

export const FACT_DECISION = Object.freeze({
  AUTO_APPLY: "AUTO_APPLY",
  NEEDS_DECISION: "NEEDS_DECISION",
  HOLD: "HOLD",
  NONE: "NONE",
});

// Claims that define the event itself. If one of these is unsupported or
// conflicted there is no responsible story; secondary claims may be dropped
// or qualified instead of blocking publication.
const CORE_CLAIM_FIELDS = new Set(["headline", "project_identity", "corridor_identity", "event_identity"]);

// Warnings that always block an article: the core event is contradicted, the
// entity cannot be resolved, or the source set is unsafe/corrupt.
const ARTICLE_HOLD_WARNING_CODES = new Set([
  "ERR_TEMPORAL_CONFLICT",
  "ERR_ENTITY_AMBIGUOUS",
  "ERR_UNSAFE_SOURCE",
  "ERR_EVENT_KEY_CONFLICT",
  "ERR_REVIEW_BUNDLE_MALFORMED",
  "ERR_REVIEW_BUNDLE_HASH",
  "ERR_REVIEW_SNAPSHOT_MISMATCH",
  "ERR_REVIEW_EVENT_MISMATCH",
  "ERR_REVIEW_CLAIMS_MISMATCH",
  "ERR_REVIEW_SOURCE_MISMATCH",
  "ERR_REVIEW_POLICY_MISMATCH",
  "ERR_REVIEW_REVIEWER_VERSION_MISMATCH",
]);

// Objective project attributes that may be auto-applied.
export const FAST_AUTO_FACT_FIELDS = new Set([
  "status",
  "constructionStage",
  "toppingOut",
  "groundbreaking",
  "completionStatus",
  "completion",
  "moveInStatus",
  "name",
  "residenceCount",
  "floorCount",
  "address",
  "developer",
]);

// Dynamic facts may also auto-apply, but only when they carry a valid as-of
// date and at least one source URL so the stored value is honestly dated.
export const FAST_DYNAMIC_FACT_FIELDS = new Set([
  "pricing",
  "priceDisplay",
  "startingPrice",
  "deliveryTiming",
  "inventory",
  "availability",
  "salesPace",
]);

// Legal conclusions, identity merges, and anything unrecognized stay human.
export const FAST_HUMAN_FACT_FIELDS = new Set([
  "legal",
  "termination",
  "buyout",
  "zoning",
  "entitlement",
  "approvalStatus",
  "slug",
  "entity",
  "merge",
]);

export function classifyFastFactField(field) {
  if (FAST_HUMAN_FACT_FIELDS.has(field)) return "human_required";
  if (FAST_DYNAMIC_FACT_FIELDS.has(field)) return "auto_dynamic";
  if (FAST_AUTO_FACT_FIELDS.has(field)) return "auto_objective";
  return "human_required";
}

function isCoreClaim(claim) {
  return CORE_CLAIM_FIELDS.has(claim.field);
}

function conflictingCoreClaims(result) {
  return (result.claims || []).filter((claim) => isCoreClaim(claim) && claim.support === "conflicted");
}

function unsupportedCoreClaims(result) {
  return (result.claims || []).filter((claim) => isCoreClaim(claim) && claim.material && claim.support !== "supported");
}

function credibleSourceTiers(result) {
  return new Set(
    (result.verificationSources || [])
      .filter((source) => !source.error && source.url && (source.source_tier === 1 || source.source_tier === 2))
      .map((source) => source.source_ref_id),
  );
}

function supportedClaimsWithCredibleSource(result) {
  const credible = credibleSourceTiers(result);
  return (result.claims || []).filter((claim) => claim.support === "supported"
    && (claim.supporting_source_ref_ids || []).some((id) => credible.has(id)));
}

function hardGate({ row, result }) {
  const report = result.report;
  if (["duplicate", "additional_source"].includes(report.dedupe_classification)) {
    return { article: ARTICLE_DECISION.DUPLICATE, fact: FACT_DECISION.NONE, articleReasons: [`dedupe:${report.dedupe_classification}`], factReasons: ["duplicate_event_has_no_fact_change"] };
  }
  if (report.errors.length) {
    const codes = report.errors.map((error) => error.code);
    return { article: ARTICLE_DECISION.HOLD, fact: FACT_DECISION.HOLD, articleReasons: codes, factReasons: codes };
  }
  if (report.dedupe_classification === "conflicting_event" || row.verification_status === "conflicting") {
    const reasons = ["core_event_contradicted", ...report.warnings.map((warning) => warning.code)];
    return { article: ARTICLE_DECISION.HOLD, fact: FACT_DECISION.HOLD, articleReasons: reasons, factReasons: reasons };
  }
  const blocking = report.warnings.filter((warning) => ARTICLE_HOLD_WARNING_CODES.has(warning.code)).map((warning) => warning.code);
  const conflictedCore = conflictingCoreClaims(result);
  if (conflictedCore.length) blocking.push(`core_claim_conflict:${conflictedCore.map((claim) => claim.claim_id).join(",")}`);
  if (blocking.length) {
    return { article: ARTICLE_DECISION.HOLD, fact: FACT_DECISION.HOLD, articleReasons: blocking, factReasons: blocking };
  }
  return null;
}

function brookeDecisionRequired(row) {
  try { return JSON.parse(row.flags_json || "{}").brooke_decision_required === true; } catch { return false; }
}

function decideFastArticle({ row, result, boundReview }) {
  if (!boundReview?.bound) return { decision: ARTICLE_DECISION.HOLD, reasons: [boundReview?.code || "no_verified_evidence"], qualified_claims: [] };
  const flagged = brookeDecisionRequired(row);
  const unsupportedCore = unsupportedCoreClaims(result);
  if (unsupportedCore.length) {
    return {
      decision: flagged ? ARTICLE_DECISION.NEEDS_DECISION : ARTICLE_DECISION.HOLD,
      reasons: [`unsupported_core_claims:${unsupportedCore.map((claim) => claim.field).join(",")}`],
      qualified_claims: [],
    };
  }
  const supported = supportedClaimsWithCredibleSource(result);
  if (!supported.length) return { decision: ARTICLE_DECISION.HOLD, reasons: ["no_credible_attributable_source"], qualified_claims: [] };
  // Secondary claims that are unsupported or conflicted do not block the
  // story; they are handed to the writer as qualify-or-omit guidance.
  const qualified = (result.claims || [])
    .filter((claim) => claim.material && !isCoreClaim(claim) && claim.support !== "supported")
    .map((claim) => ({ claim_id: claim.claim_id, field: claim.field, support: claim.support }));
  if (flagged) return { decision: ARTICLE_DECISION.NEEDS_DECISION, reasons: ["brooke_decision_required_flag"], qualified_claims: qualified };
  return { decision: ARTICLE_DECISION.AUTO_PUBLISH, reasons: ["credible_attributable_core_event"], qualified_claims: qualified };
}

function proposalSources(result, proposal) {
  const refs = new Set(proposal.verification_source_ref_ids || []);
  return (result.verificationSources || []).filter((source) => refs.has(source.source_ref_id) && !source.error);
}

function acceptableFastSourceClass(sources, field) {
  const tier1 = sources.filter((source) => source.source_tier === 1);
  if (field === "name") return tier1.length > 0;
  if (tier1.length > 0) return true;
  const tier2Hosts = new Set(sources.filter((source) => source.source_tier === 2).map((source) => {
    try { return new URL(source.url).hostname; } catch { return ""; }
  }).filter(Boolean));
  return tier2Hosts.size >= 2;
}

function decideFastFacts({ result, boundReview }) {
  const proposals = result.projectFactProposals || [];
  const held = result.heldProjectFactProposals || [];
  if (!proposals.length) {
    if (held.length) return { decision: FACT_DECISION.HOLD, reasons: held.map((item) => `held:${item.field}:${item.hold_reason || item.review_requirement}`), mutations: [] };
    return { decision: FACT_DECISION.NONE, reasons: ["no_fact_change_proposed"], mutations: [] };
  }
  const mutations = [];
  const human = [];
  const blocked = [];
  for (const proposal of proposals) {
    const fieldClass = classifyFastFactField(proposal.field);
    if (fieldClass === "human_required") {
      human.push(`human_required_field:${proposal.field}`);
      continue;
    }
    if (!boundReview?.bound) {
      blocked.push(`${proposal.field}:no_bound_evidence`);
      continue;
    }
    if (stableJson(proposal.old_value) === stableJson(proposal.proposed_value)) {
      blocked.push(`${proposal.field}:no_change`);
      continue;
    }
    const sources = proposalSources(result, proposal);
    if (!sources.length || !acceptableFastSourceClass(sources, proposal.field)) {
      blocked.push(`${proposal.field}:source_class_unacceptable`);
      continue;
    }
    const asOf = String(proposal.effective_date || "").slice(0, 10);
    if (fieldClass === "auto_dynamic" && !/^20\d{2}-\d{2}-\d{2}$/.test(asOf)) {
      blocked.push(`${proposal.field}:dynamic_fact_requires_as_of`);
      continue;
    }
    mutations.push({
      project_id: proposal.project_id,
      field: proposal.field,
      previous_value: proposal.old_value,
      value: proposal.proposed_value,
      as_of: asOf || null,
      source_url: sources[0]?.url || null,
      source_name: sources[0]?.source_name || null,
      proposal_id: proposal.proposal_id,
      event_key: proposal.event_key,
      effective_date: proposal.effective_date,
      evidence_bundle_sha256: boundReview.review_bundle_sha256,
      risk_classification: fieldClass,
      policy_version: FAST_MODE_POLICY_VERSION,
      apply: true,
      rollback: proposal.rollback || { previous_value: proposal.old_value },
    });
  }
  const reasons = [
    ...mutations.map((mutation) => `auto_apply:${mutation.field}`),
    ...human,
    ...blocked,
    ...held.map((item) => `held:${item.field}`),
  ];
  if (human.length) return { decision: FACT_DECISION.NEEDS_DECISION, reasons, mutations };
  if (mutations.length) return { decision: FACT_DECISION.AUTO_APPLY, reasons, mutations };
  return { decision: FACT_DECISION.HOLD, reasons: reasons.length ? reasons : ["no_auto_applicable_facts"], mutations };
}

export function decideFast({ row, result, boundReview }) {
  const gate = hardGate({ row, result });
  if (gate) {
    return {
      policy_version: FAST_MODE_POLICY_VERSION,
      article_decision: gate.article,
      fact_change_decision: gate.fact,
      reasons: { article: gate.articleReasons, fact_change: gate.factReasons },
      qualified_claims: [],
      fact_mutations: [],
    };
  }
  const article = decideFastArticle({ row, result, boundReview });
  const facts = decideFastFacts({ result, boundReview });
  return {
    policy_version: FAST_MODE_POLICY_VERSION,
    article_decision: article.decision,
    fact_change_decision: facts.decision,
    reasons: { article: article.reasons, fact_change: facts.reasons },
    qualified_claims: article.qualified_claims,
    fact_mutations: facts.mutations,
  };
}

export function fastDecisionSha256(decision) {
  return sha256(stableJson(decision));
}
