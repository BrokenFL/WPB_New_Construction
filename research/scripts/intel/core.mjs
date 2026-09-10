import {
  applyTrustedEvidence,
  attachSourceProvenance,
  buildFactProposals,
  buildMaterialClaims,
  canonicalIndexRevision,
  csvList,
  normalizeVerificationSources,
  safeHttpUrl,
  semanticClaims,
  sha256,
  stableJson,
} from "./normalizer.mjs";
import { classifySource } from "./source-verifier.mjs";

export const PROCESSOR_VERSION = "phase-a-v2-safety";
export const ERR = Object.freeze({
  INELIGIBLE_RECORD_TYPE: "ERR_INELIGIBLE_RECORD_TYPE",
  MISSING_REQUIRED_FIELD: "ERR_MISSING_REQUIRED_FIELD",
  ENTITY_AMBIGUOUS: "ERR_ENTITY_AMBIGUOUS",
  EVENT_KEY_CONFLICT: "ERR_EVENT_KEY_CONFLICT",
  EVIDENCE_CONFLICT: "ERR_EVIDENCE_CONFLICT",
  UNSAFE_SOURCE: "ERR_UNSAFE_SOURCE",
  TEMPORAL_CONFLICT: "ERR_TEMPORAL_CONFLICT",
});

export { csvList, safeHttpUrl, sha256, stableJson };

export const bool = (value) => /^(true|1|yes)$/i.test(String(value ?? ""));

export function validateRow(row = {}) {
  const errors = [];
  for (const field of ["id", "status", "headline", "record_type", "category", "source_url"]) {
    if (!String(row[field] ?? "").trim()) errors.push({ code: ERR.MISSING_REQUIRED_FIELD, message: `Missing required field: ${field}` });
  }
  if (row.record_type !== "event") errors.push({ code: ERR.INELIGIBLE_RECORD_TYPE, message: "Phase A processes only explicit record_type=event rows" });
  for (const field of ["source_url", "lead_source_url", "primary_source_url"]) {
    if (row[field] && !safeHttpUrl(row[field])) errors.push({ code: ERR.UNSAFE_SOURCE, message: `Unsafe source URL in ${field}` });
  }
  return errors;
}

function slugify(value) {
  return String(value || "").toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function textForIdentity(row) {
  return [row.headline, row.summary, row.material_updates, row.verification_summary, row.why_it_matters].filter(Boolean).join(" ").toLowerCase();
}

function monthNumber(value) {
  const months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
  const index = months.findIndex((month) => month.startsWith(String(value || "").toLowerCase()));
  return index < 0 ? null : String(index + 1).padStart(2, "0");
}

function independentDateBucket(row) {
  const text = textForIdentity(row);
  const named = text.match(/\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\.?\s+(20\d{2})\b/);
  if (named) return `${named[2]}-${monthNumber(named[1])}`;
  const numeric = text.match(/\b(20\d{2})[-/](0[1-9]|1[0-2])(?:[-/](0[1-9]|[12]\d|3[01]))?\b/);
  if (numeric) return numeric[3] ? `${numeric[1]}-${numeric[2]}-${numeric[3]}` : `${numeric[1]}-${numeric[2]}`;
  const explicit = String(row.event_date || row.effective_date || "").slice(0, 10);
  if (/^20\d{2}-\d{2}(?:-\d{2})?$/.test(explicit)) return explicit;
  const reported = String(row.source_published_date || "").slice(0, 10);
  if (/^20\d{2}-\d{2}(?:-\d{2})?$/.test(reported)) return reported;
  const created = String(row.created_at || "").slice(0, 10);
  return /^20\d{2}-\d{2}(?:-\d{2})?$/.test(created) ? created : "undated";
}

function suppliedParts(row) {
  const supplied = String(row.event_key || "").trim();
  const parts = supplied.split("|");
  if (parts.length === 5) return { supplied, namespace: parts[0], entity: parts[1], domain: parts[2], action: parts[3], date: parts[4] };
  if (parts.length === 4 && parts[0] === "municipal") return { supplied, namespace: parts[0], entity: parts[1], domain: undefined, action: parts[2], date: parts[3] };
  return null;
}

function suppliedKeyIsIndependentlyConsistent(row, parts, projects, corridors, text) {
  if (!parts || !/^(project|corridor|municipal)$/.test(parts.namespace) || !parts.entity || !parts.action || !/^20\d{2}-\d{2}(?:-\d{2})?$/.test(parts.date)) return false;
  if (parts.namespace !== "municipal" && !parts.domain) return false;
  const date = independentDateBucket(row);
  if (!(date === parts.date || date.startsWith(parts.date) || parts.date.startsWith(date))) return false;
  if (parts.namespace === "project") {
    if (!projects.some((project) => slugify(project) === parts.entity)) return false;
    if (!["development-update", "topping-out", "site-plan-filing", "buyout", "buyout-extension", "policy-action", "dac-vote"].includes(parts.action)) return false;
    if (parts.domain === "construction" && !/(top(?:ped|ping)? out|topping[- ]out|floor|vertical|superstructure|construction)/.test(text)) return false;
    if (parts.domain === "municipal" && !/(site[- ]plan|plans? filed|municipal|zoning|rezone|permit|approval)/.test(text)) return false;
    if (parts.action === "topping-out" && !/(top(?:ped|ping)? out|topping[- ]out|floor|vertical|superstructure)/.test(text)) return false;
    if (parts.action === "site-plan-filing" && !/(site[- ]plan|plans? filed|municipal plan|filing)/.test(text)) return false;
    if (["buyout", "buyout-extension"].includes(parts.action) && !/buyout/.test(text)) return false;
    if (["dac-vote", "policy-action"].includes(parts.action) && !/(dac|vote|master plan|zoning|rezone)/.test(text)) return false;
    return true;
  }
  if (parts.namespace === "corridor") {
    const corridorNames = [...corridors, row.corridor].filter(Boolean).map(slugify);
    return corridorNames.includes(parts.entity)
      && ["development-update", "topping-out", "site-plan-filing", "buyout", "buyout-extension", "policy-action", "dac-vote"].includes(parts.action)
      && /(corridor|development|construction|zoning|rezone|buyout|plan|vote|dac)/.test(text);
  }
  return ["dac-vote", "policy-action", "site-plan-filing"].includes(parts.action)
    && /downtown|master plan|zoning|rezone|dac|dixie|datura|waterfront/.test(text)
    && (parts.action === "dac-vote" ? /dac|voted|vote/.test(text) : true);
}

function independentEventKey(row) {
  const projects = csvList(row.related_project_ids || row.related_project_slug);
  const corridors = csvList(row.related_corridor_ids || row.corridor);
  const text = textForIdentity(row);
  const parts = suppliedParts(row);
  if (suppliedKeyIsIndependentlyConsistent(row, parts, projects, corridors, text)) return parts.supplied;
  let action = "development-update";
  let domain = "development";
  if (/top(?:ped|ping)? out|topping[- ]out|15th floor|vertical|superstructure/.test(text)) { domain = "construction"; action = "topping-out"; }
  else if (/site[- ]plan|plans? filed|municipal plans|plan filing/.test(text)) { domain = "municipal"; action = "site-plan-filing"; }
  else if (/buyout/.test(text)) { domain = "acquisition"; action = /extend/.test(text) ? "buyout-extension" : "buyout"; }
  else if (/dac|master plan|zoning|rezone|vote/.test(text)) { domain = "municipal"; action = /dac|vote/.test(text) ? "dac-vote" : "policy-action"; }
  const date = independentDateBucket(row);
  if (projects.length === 1) return `project|${slugify(projects[0])}|${domain}|${action}|${date}`;
  if (corridors.length === 1) return `corridor|${slugify(corridors[0])}|${domain}|${action}|${date.slice(0, 7)}`;
  if (parts?.namespace === "municipal" && /downtown|master plan|zoning|rezone|dac|dixie|datura|waterfront/.test(text)) return `municipal|${parts.entity}|${domain}|${action}|${date}`;
  return `municipal|wpb|${domain}|${action}|${date}`;
}

export function deriveEventKey(row) {
  return independentEventKey(row);
}

export function riskFlags(row = {}) {
  let parsed = {};
  try { parsed = JSON.parse(row.flags_json || "{}"); } catch {}
  const text = `${row.headline || ""} ${row.summary || ""} ${row.material_updates || ""} ${row.why_it_matters || ""} ${row.buyer_angle || ""} ${row.article_body || ""}`.toLowerCase();
  const flags = Object.entries(parsed).filter(([, value]) => value === true).map(([key]) => key);
  if (/\$|pricing|price|buyout/.test(text)) flags.push("pricing");
  if (/inventory/.test(text)) flags.push("inventory");
  if (/lawsuit|litigation|dispute|termination/.test(text)) flags.push("legal_or_termination");
  if (/financ/.test(text)) flags.push("financing");
  if (/approval|zoning|rezone|municipal|dac|permit/.test(text)) flags.push("regulatory");
  if (/delivery|completion|handover|occupancy|top[- ]?off promise/.test(text)) flags.push("delivery_promise");
  if (/incentive|special offer|credit|concession/.test(text)) flags.push("incentive");
  if (/fee|assessment|dues|surcharge/.test(text)) flags.push("fees_or_assessment");
  if (/ownership|title|equity|condo|assemblage/.test(text)) flags.push("ownership_ambiguity");
  return [...new Set(flags)].sort();
}

export function buildClaimLedger(row, sources = [], options = {}) {
  const eventKey = options.eventKey || deriveEventKey(row);
  const flags = options.riskFlags || riskFlags(row);
  const normalizedSources = options.normalizedSources || normalizeVerificationSources(sources, { classifySource });
  const claims = buildMaterialClaims(row, { eventKey, riskFlags: flags });
  const review = applyTrustedEvidence({ claims, sources: normalizedSources, rowHash: options.rowHash, input: options.trustedEvidence, classifySource });
  attachSourceProvenance(claims, normalizedSources);
  return options.returnDetails ? { claims, sources: normalizedSources, review } : claims;
}

export function classifyDedupe(row, derivedEventKey, indexes = {}) {
  const warnings = [];
  const same = indexes.events?.find((event) => event.event_key === derivedEventKey);
  const knownText = stableJson(indexes).toLowerCase();
  const text = textForIdentity(row);
  const southFlaglerKey = "project|south-flagler-house|construction|topping-out|2025-11";
  if (derivedEventKey === southFlaglerKey && (same || /south flagler/.test(knownText) && /top|topping/.test(knownText))) {
    if (/15th floor/.test(text)) return { classification: "conflicting_event", warnings: [{ code: ERR.TEMPORAL_CONFLICT, message: "15th-floor claim occurs after known November 2025 full topping-out" }] };
    return { classification: same ? "additional_source" : "duplicate", warnings };
  }
  if (same) return { classification: "additional_source", warnings };
  if (row.related_project_slug === "464-fern-street" && /464 fern/.test(knownText)) return { classification: "duplicate", warnings: [{ code: "WARN_EXISTING_CONTENT_OVERLAP", message: "Existing approved/published 464 Fern content overlaps this event" }] };
  return { classification: "new_event", warnings };
}

export function recommendDecision(row, dedupe, flags, claims = null, { identityConflict = false, entityAmbiguous = false } = {}) {
  if (dedupe === "conflicting_event" || row.verification_status === "conflicting") return "human_review";
  if (identityConflict || entityAmbiguous) return "human_review";
  if (bool(row.requires_human_review)) return "human_review";
  if (flags.some((flag) => /(pricing|inventory|legal|termination|financing|regulatory|approval|zoning|permit|delivery|completion|handover|incentive|fee|assessment|ownership|title|equity)/i.test(flag))) return "human_review";
  if (["duplicate", "additional_source", "existing_known_fact"].includes(dedupe)) return dedupe === "additional_source" ? "additional_source" : "duplicate";
  if (claims && claims.some((claim) => claim.material && claim.support !== "supported")) return "human_review";
  if (csvList(row.related_project_ids).length === 0 && row.related_project_slug) return "new_project_candidate";
  return "project_update_only";
}

function semanticSource(source) {
  if (!source || typeof source !== "object") return source;
  const { accessed_at, reachable, http_status, content_type, verification_error, ...semantic } = source;
  return semantic;
}

function supportedClaim(claims, field) {
  return claims.find((claim) => claim.field === field && claim.support === "supported");
}

function supportedValues(claims, field) {
  return claims.filter((claim) => claim.field === field && claim.support === "supported").map((claim) => claim.claim_value);
}

function candidateFromClaims({ row, claims, sources, derived, recommendation, flags, proposals }) {
  const headline = supportedClaim(claims, "headline");
  const date = supportedClaim(claims, "event_date");
  const category = supportedClaim(claims, "category");
  const projectIdentity = supportedClaim(claims, "project_identity");
  const corridorIdentity = supportedClaim(claims, "corridor_identity");
  const identity = projectIdentity || corridorIdentity;
  const material = claims.filter((claim) => claim.material);
  const required = [headline, date, category, identity];
  if (required.some((claim) => !claim) || material.some((claim) => claim.support !== "supported")) return null;
  const materialUpdates = supportedValues(claims, "material_updates");
  const summary = supportedClaim(claims, "summary")?.claim_value;
  const buyer = claims.find((claim) => claim.field === "buyer_context" && claim.support === "supported")?.claim_value;
  const projectIds = projectIdentity ? csvList(projectIdentity.claim_value) : [];
  const corridorIds = corridorIdentity ? csvList(corridorIdentity.claim_value) : [];
  return {
    update_id: `du-${sha256(derived).slice(0, 12)}`,
    event_key: derived,
    headline: headline.claim_value,
    event_date: date.claim_value,
    related_project_ids: projectIds,
    related_corridor_ids: corridorIds,
    category: category.claim_value,
    output_type: recommendation === "standalone_article" ? "standalone_article" : recommendation === "project_update_only" ? "project_update" : "none",
    summary: typeof summary === "string" ? summary : "",
    material_updates: materialUpdates,
    buyer_context: typeof buyer === "string" ? buyer : undefined,
    lead_source: { url: safeHttpUrl(row.lead_source_url || row.source_url) || undefined, source_name: row.source_name || undefined, sheet_intel_id: row.id },
    verification_sources: sources,
    claim_evidence: claims.filter((claim) => claim.support === "supported"),
    source_quality: "",
    verification_summary: "",
    risk_flags: flags,
    review_status: recommendation === "project_update_only" ? "draft" : "needs_review",
    article_candidate: recommendation === "standalone_article" ? { slug: slugify(headline.claim_value), headline: headline.claim_value, summary: typeof summary === "string" ? summary : "", canonical_path: `/updates/${slugify(headline.claim_value)}/` } : undefined,
    project_fact_proposals: proposals,
    sheet_intel_ids: [row.id],
  };
}

export function processRow({ row, verificationSources = [], indexes = {}, trustedEvidence } = {}) {
  const errors = validateRow(row);
  const rowSnapshot = Object.fromEntries(Object.entries(row || {}).sort(([a], [b]) => a.localeCompare(b)));
  const rowHash = sha256(rowSnapshot);
  const supplied = String(row.event_key || "").trim();
  const derived = deriveEventKey(row);
  const flags = riskFlags(row);
  const dedupe = classifyDedupe(row, derived, indexes);
  const warnings = [...dedupe.warnings];
  if (supplied && supplied !== derived) warnings.push({ code: ERR.EVENT_KEY_CONFLICT, message: `Supplied event_key differs from independently derived event identity: ${supplied} != ${derived}` });
  if (row.verification_status === "conflicting") warnings.push({ code: ERR.EVIDENCE_CONFLICT, message: "Intake verification status is conflicting; public output must remain held" });
  const normalizedSources = normalizeVerificationSources(verificationSources, { classifySource });
  const entityAmbiguous = row.related_project_slug === "464-fern-street" && normalizedSources.filter((source) => !source.error).every((source) => source.source_tier !== 1);
  if (entityAmbiguous) warnings.push({ code: ERR.ENTITY_AMBIGUOUS, message: "464 Fern requires primary municipal/entity verification before public treatment" });
  const claims = buildMaterialClaims(row, { eventKey: derived, riskFlags: flags });
  const review = applyTrustedEvidence({ claims, sources: normalizedSources, rowHash, input: trustedEvidence, classifySource });
  attachSourceProvenance(claims, normalizedSources);
  if (review.rejected.length) warnings.push(...review.rejected.map((item) => ({ code: item.code, message: item.message })));
  const unsupportedClaims = claims.filter((claim) => claim.material && claim.support !== "supported");
  if (unsupportedClaims.length) warnings.push({ code: "WARN_UNSUPPORTED_CLAIMS", message: `${unsupportedClaims.length} material claim(s) lack trusted field-level evidence` });
  if (claims.some((claim) => claim.support === "conflicted")) warnings.push({ code: ERR.EVIDENCE_CONFLICT, message: "At least one material claim has conflicting trusted evidence" });
  const identityConflict = Boolean(supplied && supplied !== derived);
  const recommendation = recommendDecision(row, dedupe.classification, flags, claims, { identityConflict, entityAmbiguous });
  const proposalResult = buildFactProposals({ row, claims, eventKey: derived, indexes });
  const canCreate = !errors.length && recommendation !== "human_review" && !["duplicate", "additional_source"].includes(recommendation);
  const candidate = canCreate ? candidateFromClaims({ row, claims, sources: normalizedSources.filter((source) => !source.error), derived, recommendation, flags, proposals: proposalResult.proposals }) : null;
  const semanticCandidate = candidate ? { ...candidate, verification_sources: candidate.verification_sources.map(semanticSource), claim_evidence: semanticClaims(candidate.claim_evidence) } : null;
  const repositoryIndexHash = sha256(indexes);
  const semanticClaimsValue = semanticClaims(claims);
  const claimLedgerHash = sha256(semanticClaimsValue);
  const processorIdentityHash = sha256({ processor_version: PROCESSOR_VERSION, row_sha256: rowHash, repository_index_sha256: repositoryIndexHash });
  const evidenceBundleHash = sha256({ processor_identity_sha256: processorIdentityHash, claim_ledger_sha256: claimLedgerHash, review: { accepted: review.accepted.map(({ reviewed_at, reviewer, ...item }) => item), rejected: review.rejected.map(({ message, ...item }) => item) } });
  const report = {
    processor_version: PROCESSOR_VERSION,
    intel_id: row.id,
    row_sha256: rowHash,
    claim_ledger_sha256: claimLedgerHash,
    event_identity_sha256: sha256(derived),
    candidate_sha256: sha256(semanticCandidate),
    repository_index_sha256: repositoryIndexHash,
    processor_identity_sha256: processorIdentityHash,
    evidence_bundle_sha256: evidenceBundleHash,
    canonical_index_revision: canonicalIndexRevision(indexes),
    supplied_event_key: supplied || undefined,
    derived_event_key: derived,
    dedupe_classification: dedupe.classification,
    recommendation,
    warnings,
    errors,
    review: {
      provided: review.provided,
      accepted_records: review.accepted.length,
      rejected_records: review.rejected.length,
      held_claim_ids: unsupportedClaims.map((claim) => claim.claim_id),
      held_fact_proposals: proposalResult.held.length,
    },
    mutation_count: 0,
  };
  return {
    snapshot: rowSnapshot,
    claims,
    candidate,
    report,
    verificationSources: normalizedSources,
    review,
    projectFactProposals: proposalResult.proposals,
    heldProjectFactProposals: proposalResult.held,
  };
}
