import { sha256, stableJson } from "../intel/core.mjs";

// The evidence handoff stays on the already-live v1 policy binding so current
// signed handoffs remain usable. The processor revision is separate: changing
// it forces already-decided rows through the corrected Fast Mode V2 engine.
export const FAST_MODE_POLICY_VERSION = "p2-fast-policy-v1";
export const FAST_MODE_PROCESSOR_VERSION = "p2-fast-mode-v2-throughput-r2";

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

// A publishable event is semantic: an identifiable entity plus an occurrence.
// Headline, event_key, corridor, dates, and buyer context are editorial or
// workflow fields. They may help describe the event, but their literal intake
// representation is never itself a blocking core contract.
const IDENTITY_CLAIM_FIELDS = new Set(["project_identity", "project_name"]);
const OCCURRENCE_CLAIM_FIELDS = new Set(["material_updates", "summary", "headline"]);

const ARTICLE_HOLD_WARNING_CODES = new Set([
  "ERR_TEMPORAL_CONFLICT",
  "ERR_ENTITY_AMBIGUOUS",
  "ERR_UNSAFE_SOURCE",
]);

export const FAST_AUTO_FACT_FIELDS = new Set([
  "status",
  "name",
  "residenceCount",
  "address",
]);

export const FAST_DYNAMIC_FACT_FIELDS = new Set([
  "priceDisplay",
  "deliveryTiming",
]);

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

function isFetchedCredibleSource(source) {
  return !source?.error
    && source.url
    && (source.source_tier === 1 || source.source_tier === 2)
    && source.retrieval_status === "fetched"
    && source.retrieval_attested === true
    && source.reachable === true;
}

function credibleSourceRefs(result) {
  return new Set((result.verificationSources || []).filter(isFetchedCredibleSource).map((source) => source.source_ref_id));
}

function claimHasCredibleSupport(claim, credibleRefs) {
  return claim?.support === "supported"
    && (claim.supporting_source_ref_ids || []).some((id) => credibleRefs.has(id));
}

export function semanticArticleEvidence(result) {
  const credibleRefs = credibleSourceRefs(result);
  const claims = result.claims || [];
  const identityClaims = claims.filter((claim) => IDENTITY_CLAIM_FIELDS.has(claim.field) && claim.support === "supported");
  const occurrenceClaims = claims.filter((claim) => OCCURRENCE_CLAIM_FIELDS.has(claim.field)
    && String(claim.claim_value ?? "").trim()
    && claimHasCredibleSupport(claim, credibleRefs));
  return {
    credible_source_refs: [...credibleRefs],
    identity_claim_ids: identityClaims.map((claim) => claim.claim_id),
    occurrence_claim_ids: occurrenceClaims.map((claim) => claim.claim_id),
    identifiable: identityClaims.length > 0,
    supported_occurrence: occurrenceClaims.length > 0,
  };
}

function explicitBrookeDecisionRequired(row) {
  try { return JSON.parse(row.flags_json || "{}").brooke_decision_required === true; } catch { return false; }
}

function qualifiedClaims(result) {
  return (result.claims || [])
    .filter((claim) => (claim.material || ["headline", "event_date", "corridor_identity", "buyer_context"].includes(claim.field))
      && claim.support !== "supported"
      && claim.field !== "event_identity")
    .map((claim) => ({
      claim_id: claim.claim_id,
      field: claim.field,
      value: claim.claim_value,
      support: claim.support,
      disposition: claim.support === "conflicted" ? "qualify_or_omit" : "omit",
    }));
}

function decideFastArticle({ row, result, boundReview }) {
  if (!boundReview?.bound) {
    return { decision: ARTICLE_DECISION.HOLD, reasons: [boundReview?.code || "no_verified_evidence"], qualified_claims: [], evidence: semanticArticleEvidence(result) };
  }
  const report = result.report;
  if (["duplicate", "additional_source"].includes(report.dedupe_classification)) {
    return { decision: ARTICLE_DECISION.DUPLICATE, reasons: [`dedupe:${report.dedupe_classification}`], qualified_claims: qualifiedClaims(result), evidence: semanticArticleEvidence(result) };
  }
  if (report.dedupe_classification === "conflicting_event") {
    return { decision: ARTICLE_DECISION.HOLD, reasons: ["core_event_contradicted"], qualified_claims: qualifiedClaims(result), evidence: semanticArticleEvidence(result) };
  }
  const blocking = (report.warnings || []).filter((warning) => ARTICLE_HOLD_WARNING_CODES.has(warning.code)).map((warning) => warning.code);
  if (blocking.length) {
    return { decision: ARTICLE_DECISION.HOLD, reasons: blocking, qualified_claims: qualifiedClaims(result), evidence: semanticArticleEvidence(result) };
  }
  const evidence = semanticArticleEvidence(result);
  if (!evidence.identifiable) {
    return { decision: ARTICLE_DECISION.HOLD, reasons: ["unresolved_entity_identity"], qualified_claims: qualifiedClaims(result), evidence };
  }
  if (!evidence.supported_occurrence) {
    return { decision: ARTICLE_DECISION.HOLD, reasons: ["no_credible_source_supports_core_occurrence"], qualified_claims: qualifiedClaims(result), evidence };
  }
  const qualified = qualifiedClaims(result);
  if (explicitBrookeDecisionRequired(row)) {
    return { decision: ARTICLE_DECISION.NEEDS_DECISION, reasons: ["brooke_decision_required_flag"], qualified_claims: qualified, evidence };
  }
  return {
    decision: ARTICLE_DECISION.AUTO_PUBLISH,
    reasons: ["credible_attributable_semantic_occurrence", ...(qualified.length ? [`secondary_claims_qualified_or_omitted:${qualified.length}`] : [])],
    qualified_claims: qualified,
    evidence,
  };
}

function proposalSources(result, proposal) {
  const refs = new Set(proposal.verification_source_ref_ids || []);
  return (result.verificationSources || []).filter((source) => refs.has(source.source_ref_id) && isFetchedCredibleSource(source));
}

function isRealDateOnly(value) {
  const date = String(value || "").slice(0, 10);
  if (!/^20\d{2}-\d{2}-\d{2}$/.test(date)) return false;
  const parsed = new Date(`${date}T00:00:00.000Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === date;
}

function proposalClaimsAreSupported(result, boundReview, proposal) {
  const claimIds = new Set(proposal.supporting_claim_ids || []);
  if (!claimIds.size) return false;
  const resultClaims = new Map((result.claims || []).map((claim) => [claim.claim_id, claim]));
  const reviewClaims = new Map((boundReview?.bundle?.claims || []).map((claim) => [claim.claim_id, claim]));
  return [...claimIds].every((claimId) => {
    const resultClaim = resultClaims.get(claimId);
    const reviewClaim = reviewClaims.get(claimId);
    return resultClaim?.support === "supported"
      && reviewClaim?.support_verdict === "supported"
      && (resultClaim.supporting_source_ref_ids || []).some((ref) => (proposal.verification_source_ref_ids || []).includes(ref));
  });
}

function uniqueMatches(text, regex, transform = (value) => value) {
  const values = [...String(text || "").matchAll(regex)].map((match) => transform(match[1], match)).filter((value) => value !== null && value !== undefined && value !== "");
  return [...new Set(values.map(String))];
}

function derivedValuesForClaim(claim) {
  const text = String(claim.claim_value ?? "").replace(/\s+/g, " ").trim();
  const values = {};
  const residenceCounts = uniqueMatches(text, /\b([0-9]{1,4})\s+(?:exclusive\s+|luxury\s+|corner\s+)*(?:residences?|units?|condominiums?|condos?)\b/gi, (value) => String(Number(value)));
  if (residenceCounts.length === 1) values.residenceCount = residenceCounts[0];

  const deliveryYears = uniqueMatches(text, /\b(?:delivery|completion|opening|move[- ]?ins?|occupancy)[^.;]{0,48}?\b(20\d{2})\b/gi);
  if (deliveryYears.length === 1) values.deliveryTiming = deliveryYears[0];

  const addresses = uniqueMatches(text, /\b([0-9]{2,5}\s+[A-Z0-9][A-Za-z0-9.'’ -]{1,55}\s(?:Street|St\.?|Avenue|Ave\.?|Boulevard|Blvd\.?|Drive|Dr\.?|Road|Rd\.?|Way|Place|Pl\.?|Lane|Ln\.?))(?:,?\s+West Palm Beach(?:,?\s+FL(?:\s+\d{5})?)?)?/gi, (_value, match) => match[0].replace(/[.;,]+$/, "").trim());
  if (addresses.length === 1) values.address = addresses[0];

  const priceMatches = uniqueMatches(text, /\b(?:prices?|pricing)\s+(?:start(?:ing)?|begin(?:ning)?|from)\s+(?:at\s+)?(\$[0-9]+(?:\.[0-9]+)?\s*(?:m|million|k|thousand)?)\b/gi, (value) => `From ${String(value).replace(/\s+/g, "").toUpperCase()}`);
  if (priceMatches.length === 1) values.priceDisplay = priceMatches[0];

  if (/\b(?:completed|completion complete|move[- ]?ins? (?:are )?underway|residents? (?:are )?moving in)\b/i.test(text)) values.status = "Completed";
  else if (/\b(?:broke ground|groundbreaking|construction (?:has )?(?:begun|started)|under construction)\b/i.test(text)) values.status = "Under Construction";
  else if (/\b(?:sales (?:have )?launched|sales launch|now selling)\b/i.test(text)) values.status = "Active Sales";
  else if (/\b(?:plans? (?:were )?filed|proposed plans?|approved the proposal|received approval)\b/i.test(text)) values.status = "Planning";
  return values;
}

function semanticallyEqual(field, left, right) {
  if (field === "residenceCount") return Number(left) === Number(right);
  return String(left ?? "").trim().toLowerCase() === String(right ?? "").trim().toLowerCase();
}

function statusProgressRank(value) {
  const text = String(value || "").toLowerCase().replace(/[_-]+/g, " ");
  if (/completed|move.?ins? (?:are )?underway|residents? (?:are )?moving in/.test(text)) return 4;
  if (/under construction|construction (?:has )?(?:begun|started)|groundbreak/.test(text)) return 3;
  if (/active sales|sales office|now selling|sales (?:have )?launched/.test(text)) return 2;
  if (/pre.?construction|planning|proposed|filed|approval/.test(text)) return 1;
  return null;
}

function isSafeDerivedTransition(field, currentValue, proposedValue) {
  if (field !== "status") return true;
  const currentRank = statusProgressRank(currentValue);
  const proposedRank = statusProgressRank(proposedValue);
  return currentRank === null || proposedRank === null || proposedRank >= currentRank;
}

function supportedProjectId(result, indexes) {
  const values = (result.claims || [])
    .filter((claim) => claim.field === "project_identity" && claim.support === "supported")
    .flatMap((claim) => String(claim.claim_value || "").split(","))
    .map((value) => value.trim())
    .filter(Boolean);
  const resolved = values.map((value) => indexes?.project_aliases?.[value] || value);
  const unique = [...new Set(resolved)];
  if (unique.length !== 1 || !indexes?.reviewed_facts?.projects?.[unique[0]]) return null;
  return unique[0];
}

function supportedEffectiveDate(result, sourceRefs) {
  const eventDate = (result.claims || []).find((claim) => claim.field === "event_date" && claim.support === "supported" && isRealDateOnly(claim.claim_value));
  if (eventDate) return String(eventDate.claim_value).slice(0, 10);
  const dates = (result.verificationSources || [])
    .filter((source) => sourceRefs.includes(source.source_ref_id) && isRealDateOnly(source.published_date))
    .map((source) => String(source.published_date).slice(0, 10))
    .sort();
  return dates.at(-1) || null;
}

export function synthesizeFastFactProposals({ result, indexes } = {}) {
  const projectId = supportedProjectId(result, indexes);
  if (!projectId) return [];
  const explicitFields = new Set([
    ...(result.projectFactProposals || []).map((proposal) => proposal.field),
    ...(result.heldProjectFactProposals || []).map((proposal) => proposal.field),
  ]);
  const credibleRefs = credibleSourceRefs(result);
  const byField = new Map();
  for (const claim of result.claims || []) {
    if (claim.support !== "supported") continue;
    const claimSourceRefs = (claim.supporting_source_ref_ids || []).filter((ref) => credibleRefs.has(ref));
    if (!claimSourceRefs.length) continue;
    for (const [field, value] of Object.entries(derivedValuesForClaim(claim))) {
      if (explicitFields.has(field) || classifyFastFactField(field) === "human_required") continue;
      const candidates = byField.get(field) || [];
      candidates.push({ value, claim_id: claim.claim_id, source_refs: claimSourceRefs });
      byField.set(field, candidates);
    }
  }

  const proposals = [];
  for (const [field, candidates] of byField) {
    const uniqueValues = [...new Set(candidates.map((candidate) => String(candidate.value)))];
    if (uniqueValues.length !== 1) continue;
    const currentEntry = indexes.reviewed_facts.projects[projectId]?.[field];
    if (!currentEntry || currentEntry.value === undefined || semanticallyEqual(field, currentEntry.value, uniqueValues[0])) continue;
    if (!isSafeDerivedTransition(field, currentEntry.value, uniqueValues[0])) continue;
    const matching = candidates.filter((candidate) => String(candidate.value) === uniqueValues[0]);
    const claimIds = [...new Set(matching.map((candidate) => candidate.claim_id))].sort();
    const sourceRefs = [...new Set(matching.flatMap((candidate) => candidate.source_refs))].sort();
    const effectiveDate = supportedEffectiveDate(result, sourceRefs);
    proposals.push({
      proposal_id: `fast-derived-${sha256(stableJson({ projectId, field, value: uniqueValues[0], claimIds, sourceRefs })).slice(0, 16)}`,
      project_id: projectId,
      field,
      old_value: currentEntry.value,
      proposed_value: uniqueValues[0],
      effective_date: effectiveDate,
      event_key: result.report?.derived_event_key || "",
      supporting_claim_ids: claimIds,
      verification_source_ref_ids: sourceRefs,
      rollback: { previous_value: currentEntry.value },
      synthesized: true,
      provenance: { method: "supported_claim_vs_reviewed_public_field", as_of: effectiveDate },
    });
  }
  return proposals;
}

function decideFastFacts({ row, result, boundReview, indexes }) {
  const synthesized = synthesizeFastFactProposals({ result, indexes });
  const proposals = [...(result.projectFactProposals || []), ...synthesized];
  const held = result.heldProjectFactProposals || [];
  if (!proposals.length) {
    if (held.length) return { decision: FACT_DECISION.HOLD, reasons: held.map((item) => `held:${item.field}:${item.hold_reason || item.review_requirement}`), mutations: [], synthesized };
    return { decision: FACT_DECISION.NONE, reasons: ["no_fact_change_proposed"], mutations: [], synthesized };
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
    if (!proposalClaimsAreSupported(result, boundReview, proposal)) {
      blocked.push(`${proposal.field}:proposal_claim_not_supported`);
      continue;
    }
    if (semanticallyEqual(proposal.field, proposal.old_value, proposal.proposed_value)) {
      blocked.push(`${proposal.field}:no_change`);
      continue;
    }
    const sources = proposalSources(result, proposal);
    if (!sources.length) {
      blocked.push(`${proposal.field}:source_class_unacceptable`);
      continue;
    }
    const asOf = String(proposal.effective_date || "").slice(0, 10);
    if (fieldClass === "auto_dynamic" && !isRealDateOnly(asOf)) {
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
      sources: sources.map((source) => ({
        source_ref_id: source.source_ref_id,
        url: source.url,
        name: source.source_name || null,
        tier: source.source_tier,
        type: source.source_type || null,
        published_date: source.published_date || null,
        content_sha256: source.content_hash || null,
        revision: source.source_revision || source.content_hash || null,
      })),
      proposal_id: proposal.proposal_id,
      event_key: proposal.event_key,
      effective_date: proposal.effective_date,
      evidence_bundle_sha256: boundReview.review_bundle_sha256,
      risk_classification: fieldClass,
      policy_version: FAST_MODE_POLICY_VERSION,
      apply: true,
      rollback: proposal.rollback || { previous_value: proposal.old_value },
      synthesized: proposal.synthesized === true,
      provenance: proposal.provenance || null,
    });
  }
  const reasons = [
    ...mutations.map((mutation) => `${mutation.synthesized ? "auto_apply_synthesized" : "auto_apply"}:${mutation.field}`),
    ...human,
    ...blocked,
    ...held.map((item) => `held:${item.field}`),
  ];
  if (explicitBrookeDecisionRequired(row)) {
    return { decision: FACT_DECISION.NEEDS_DECISION, reasons: ["brooke_decision_required_flag", ...reasons], mutations: [], synthesized };
  }
  if (human.length) return { decision: FACT_DECISION.NEEDS_DECISION, reasons, mutations, synthesized };
  if (mutations.length) return { decision: FACT_DECISION.AUTO_APPLY, reasons, mutations, synthesized };
  return { decision: FACT_DECISION.HOLD, reasons: reasons.length ? reasons : ["no_auto_applicable_facts"], mutations, synthesized };
}

export function decideFast({ row, result, boundReview, indexes }) {
  const errorCodes = (result.report?.errors || []).map((error) => error.code);
  if (errorCodes.length) {
    return {
      policy_version: FAST_MODE_POLICY_VERSION,
      processor_version: FAST_MODE_PROCESSOR_VERSION,
      article_decision: ARTICLE_DECISION.HOLD,
      fact_change_decision: FACT_DECISION.HOLD,
      reasons: { article: errorCodes, fact_change: errorCodes },
      qualified_claims: [],
      fact_mutations: [],
      synthesized_fact_proposals: [],
      article_evidence: semanticArticleEvidence(result),
    };
  }
  const article = decideFastArticle({ row, result, boundReview });
  const facts = decideFastFacts({ row, result, boundReview, indexes });
  return {
    policy_version: FAST_MODE_POLICY_VERSION,
    processor_version: FAST_MODE_PROCESSOR_VERSION,
    article_decision: article.decision,
    fact_change_decision: facts.decision,
    reasons: { article: article.reasons, fact_change: facts.reasons },
    qualified_claims: article.qualified_claims,
    fact_mutations: facts.mutations,
    synthesized_fact_proposals: facts.synthesized,
    article_evidence: article.evidence,
  };
}

export function fastDecisionSha256(decision) {
  return sha256(stableJson(decision));
}
