import { sha256, stableJson } from "../intel/core.mjs";

export const AUTO_FACT_FIELDS = new Set([
  "status",
  "toppingOut",
  "groundbreaking",
  "completionStatus",
  "name",
  "residenceCount",
  "floorCount",
]);

export const HUMAN_REQUIRED_FIELDS = new Set([
  "deliveryTiming",
  "pricing",
  "priceDisplay",
  "inventory",
  "incentives",
  "hoaFees",
  "fees",
  "salesPace",
  "financing",
  "legal",
  "termination",
  "zoning",
  "approvalStatus",
]);

export const REQUIRED_AUTO_FACT_TESTS = Object.freeze({
  default: Object.freeze(["canonical-fact-contract"]),
  name: Object.freeze(["canonical-fact-contract", "project-identity-contract"]),
});

export function classifyFactField(field) {
  if (HUMAN_REQUIRED_FIELDS.has(field)) return "human_required";
  if (AUTO_FACT_FIELDS.has(field)) return "auto_fact_allowlist";
  return "human_required";
}

export function requiredAutoFactTests(field) {
  return [...(REQUIRED_AUTO_FACT_TESTS[field] || REQUIRED_AUTO_FACT_TESTS.default)];
}

export function factTestTargetSha256({
  projectId,
  field,
  current,
  proposed,
  eventKey,
  eventDate,
  effectiveDate,
  evidenceBundleSha256,
  expectedCanonicalRevision,
}) {
  return sha256({
    project_id: projectId,
    field,
    current_value: current,
    proposed_value: proposed,
    event_key: eventKey,
    event_date: eventDate,
    effective_date: effectiveDate,
    evidence_bundle_sha256: evidenceBundleSha256,
    canonical_revision: expectedCanonicalRevision,
  });
}

function normalizedClaimEvidence(claims = []) {
  return claims.map((claim) => typeof claim === "string" ? { claim_id: claim } : {
    claim_id: claim.claim_id,
    support_verdict: claim.support_status === "conflicted" ? "conflicting" : claim.support_status,
    source_ref_ids: [...(claim.supporting_source_ref_ids || [])].sort(),
  }).sort((a, b) => String(a.claim_id).localeCompare(String(b.claim_id)));
}

function normalizedSources(sources = []) {
  return sources.map((source) => ({
    source_ref_id: source.source_ref_id,
    url: source.url,
    source_tier: source.source_tier,
    source_type: source.source_type,
    content_hash: source.content_hash,
    source_revision: source.source_revision,
  })).sort((a, b) => String(a.source_ref_id).localeCompare(String(b.source_ref_id)));
}

function normalizedTests(tests = []) {
  return tests.map((item) => ({
    name: String(item.name || ""),
    status: item.status,
    tested_canonical_revision: item.tested_canonical_revision,
    test_target_sha256: item.test_target_sha256,
  })).sort((a, b) => a.name.localeCompare(b.name));
}

export function buildFactMutation({
  projectId,
  field,
  current,
  proposed,
  supportingClaims = [],
  verificationSources = [],
  eventDate,
  effectiveDate = eventDate,
  eventKey,
  evidenceBundleSha256,
  expectedCanonicalRevision,
  policyVersion,
  applicableTests = [],
  provenance,
}) {
  const claimEvidence = normalizedClaimEvidence(supportingClaims);
  const sourceEvidence = normalizedSources(verificationSources);
  const testResults = normalizedTests(applicableTests);
  const requiredTests = classifyFactField(field) === "auto_fact_allowlist" ? requiredAutoFactTests(field) : [];
  const testTargetSha256 = factTestTargetSha256({
    projectId,
    field,
    current,
    proposed,
    eventKey,
    eventDate,
    effectiveDate,
    evidenceBundleSha256,
    expectedCanonicalRevision,
  });
  const resultByName = new Map(testResults.map((item) => [item.name, item]));
  const exactResultSet = resultByName.size === testResults.length
    && resultByName.size === requiredTests.length
    && testResults.every((item) => requiredTests.includes(item.name));
  const allRequiredPassed = requiredTests.length > 0 && exactResultSet && requiredTests.every((name) => {
    const item = resultByName.get(name);
    return item?.status === "passed"
      && item.tested_canonical_revision === expectedCanonicalRevision
      && item.test_target_sha256 === testTargetSha256;
  });
  const auditSeed = { projectId, field, current, proposed, eventKey, expectedCanonicalRevision, evidenceBundleSha256 };
  const mutation = {
    mutation_id: `fm-${sha256(auditSeed).slice(0, 16)}`,
    audit_identifier: `fact-audit-${sha256(auditSeed).slice(0, 20)}`,
    project_id: projectId,
    field,
    current_value: current,
    proposed_value: proposed,
    event_date: eventDate,
    effective_date: effectiveDate,
    event_key: eventKey,
    claim_evidence: claimEvidence,
    verification_sources: sourceEvidence,
    evidence_bundle_sha256: evidenceBundleSha256,
    risk_classification: classifyFactField(field),
    policy_version: policyVersion,
    canonical_base: {
      expected_revision: expectedCanonicalRevision,
      current_value_sha256: sha256({ value: current }),
    },
    validation: {
      required_tests: requiredTests,
      test_target_sha256: testTargetSha256,
      results: testResults,
      all_required_passed: allRequiredPassed,
    },
    provenance: provenance || null,
    rollback: {
      previous_value: current,
      source_revision: expectedCanonicalRevision,
      rollback_identifier: `rollback-${sha256({ projectId, field, current, expectedCanonicalRevision }).slice(0, 16)}`,
    },
    apply: false,
  };
  return { ...mutation, mutation_sha256: sha256(stableJson(mutation)) };
}

export function buildFactMutationsFromPhaseA({ result, boundReview, policyVersion, factTestResults = {} }) {
  return (result.projectFactProposals || []).map((proposal) => {
    const claims = (proposal.supporting_claim_ids || []).map((claimId) => result.claims.find((claim) => claim.claim_id === claimId)).filter(Boolean);
    const refs = new Set(proposal.verification_source_ref_ids || []);
    const sources = result.verificationSources.filter((source) => refs.has(source.source_ref_id));
    const applicableTests = factTestResults[proposal.proposal_id] || factTestResults[proposal.field] || [];
    return buildFactMutation({
      projectId: proposal.project_id,
      field: proposal.field,
      current: proposal.old_value,
      proposed: proposal.proposed_value,
      supportingClaims: claims,
      verificationSources: sources,
      eventDate: result.snapshot?.event_date || result.report.derived_event_key?.split("|").at(-1),
      effectiveDate: proposal.effective_date,
      eventKey: proposal.event_key,
      evidenceBundleSha256: boundReview?.review_bundle_sha256,
      expectedCanonicalRevision: proposal.canonical_index_revision,
      policyVersion,
      applicableTests,
      provenance: boundReview?.provenance,
    });
  });
}
