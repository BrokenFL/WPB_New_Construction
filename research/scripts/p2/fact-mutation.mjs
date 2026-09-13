import { sha256, stableJson } from "../intel/core.mjs";

// Canonical project-fact mutation records. Every proposed mutation carries the
// full audit bundle: project_id, canonical field, current value, proposed
// value, supporting claims, verification sources, effective/event date,
// evidence hashes, risk classification, policy decision, provenance, and a
// rollback/audit reference. Mutations flow through the existing PR #95
// reviewed-fact/public projection architecture — never direct page edits and
// never a competing project database.

// AUTO-FACT allowlist: strongly verified, objective project-state fields only.
export const AUTO_FACT_FIELDS = new Set([
  "status",               // construction status / phase
  "toppingOut",           // topping-out milestone
  "groundbreaking",       // groundbreaking
  "completionStatus",     // completion / move-in status
  "name",                 // project name / identity correction when unambiguous
  "residenceCount",       // objectively verified residence count
  "floorCount",           // objectively verified floor count
]);

// Always require human approval regardless of evidence strength.
export const HUMAN_REQUIRED_FIELDS = new Set([
  "deliveryTiming",       // delivery year/date
  "pricing",
  "inventory",
  "incentives",
  "hoaFees",
  "salesPace",
  "financing",
  "legal",
  "termination",
  "zoning",
  "approvalStatus",
]);

export function classifyFactField(field) {
  if (HUMAN_REQUIRED_FIELDS.has(field)) return "human_required";
  if (AUTO_FACT_FIELDS.has(field)) return "auto_fact_allowlist";
  return "human_required"; // unknown fields default to human review
}

export function buildFactMutation({
  projectId,
  field,
  current,
  proposed,
  supportingClaims = [],
  verificationSources = [],
  eventDate,
  eventKey,
  snapshotSha256,
  claimSetSha256,
  sourceRevisionSha256,
  provenance,
}) {
  const mutation = {
    mutation_id: `fm-${sha256({ projectId, field, proposed, eventKey }).slice(0, 12)}`,
    project_id: projectId,
    field,
    current,
    proposed,
    supporting_claims: supportingClaims,
    verification_sources: verificationSources,
    effective_date: eventDate,
    event_key: eventKey,
    evidence_hashes: {
      snapshot_sha256: snapshotSha256,
      claim_set_sha256: claimSetSha256,
      source_revision_sha256: sourceRevisionSha256,
    },
    risk_classification: classifyFactField(field),
    provenance,
    rollback_ref: `rollback:${sha256({ projectId, field, current }).slice(0, 12)}`,
  };
  return { ...mutation, mutation_sha256: sha256(stableJson(mutation)) };
}
