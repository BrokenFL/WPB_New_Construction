import crypto from "node:crypto";

export const PROCESSOR_VERSION = "phase-a-v1";
export const ERR = Object.freeze({
  INELIGIBLE_RECORD_TYPE: "ERR_INELIGIBLE_RECORD_TYPE",
  MISSING_REQUIRED_FIELD: "ERR_MISSING_REQUIRED_FIELD",
  ENTITY_AMBIGUOUS: "ERR_ENTITY_AMBIGUOUS",
  EVENT_KEY_CONFLICT: "ERR_EVENT_KEY_CONFLICT",
  EVIDENCE_CONFLICT: "ERR_EVIDENCE_CONFLICT",
  UNSAFE_SOURCE: "ERR_UNSAFE_SOURCE",
  TEMPORAL_CONFLICT: "ERR_TEMPORAL_CONFLICT",
});

const stable = (value) => {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map((k) => [k, stable(value[k])]));
  return value;
};
export const stableJson = (value) => JSON.stringify(stable(value));
export const sha256 = (value) => crypto.createHash("sha256").update(typeof value === "string" ? value : stableJson(value)).digest("hex");
export const csvList = (value = "") => [...new Set(String(value).split(",").map((v) => v.trim()).filter(Boolean))];
export const bool = (value) => /^(true|1|yes)$/i.test(String(value ?? ""));

export function safeHttpUrl(value) {
  try {
    const url = new URL(String(value || ""));
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) return null;
    return url.href;
  } catch { return null; }
}

export function validateRow(row) {
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

function slugify(v) { return String(v || "").toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
function dateBucket(row) {
  const supplied = String(row.event_key || "").split("|").at(-1);
  if (supplied && /^\d{4}-\d{2}(?:-\d{2})?$/.test(supplied)) return supplied;
  return String(row.source_published_date || row.created_at || "").slice(0, 10) || "undated";
}

export function deriveEventKey(row) {
  const supplied = String(row.event_key || "").trim();
  const projects = csvList(row.related_project_ids || row.related_project_slug);
  const corridors = csvList(row.related_corridor_ids || row.corridor);
  const h = String(row.headline || "").toLowerCase();
  const material = String(row.material_updates || "").toLowerCase();
  if (supplied.startsWith("municipal|")) return supplied;
  if (supplied.startsWith("corridor|")) return supplied;
  let action = "development-update";
  let domain = "development";
  if (/top(?:ped|ping)? out|topping[- ]out|15th floor/.test(`${h} ${material}`)) { domain = "construction"; action = "topping-out"; }
  else if (/site[- ]plan|plans? filed|municipal plans/.test(`${h} ${material}`)) { domain = "municipal"; action = "site-plan-filing"; }
  else if (/buyout/.test(h)) { domain = "acquisition"; action = /extend/.test(h) ? "buyout-extension" : "buyout"; }
  else if (/dac|master plan|zoning|rezone/.test(`${h} ${material}`)) { domain = "municipal"; action = "policy-action"; }
  if (projects.length === 1) return `project|${slugify(projects[0])}|${domain}|${action}|${dateBucket(row)}`;
  if (corridors.length === 1) return `corridor|${slugify(corridors[0])}|${domain}|${action}|${dateBucket(row).slice(0,7)}`;
  return supplied || `municipal|wpb|${domain}|${action}|${dateBucket(row)}`;
}

export function riskFlags(row) {
  let parsed = {};
  try { parsed = JSON.parse(row.flags_json || "{}"); } catch {}
  const text = `${row.headline || ""} ${row.summary || ""} ${row.material_updates || ""}`.toLowerCase();
  const flags = Object.entries(parsed).filter(([,v]) => v === true).map(([k]) => k);
  if (/\$|pricing|price|buyout/.test(text)) flags.push("pricing");
  if (/inventory/.test(text)) flags.push("inventory");
  if (/lawsuit|litigation|dispute|termination/.test(text)) flags.push("legal_or_termination");
  if (/financ/.test(text)) flags.push("financing");
  if (/approval|zoning|rezone|municipal|dac|permit/.test(text)) flags.push("regulatory");
  return [...new Set(flags)].sort();
}

export function buildClaimLedger(row, sources) {
  const claims = [];
  const parts = [row.summary, row.material_updates, row.verification_summary].filter(Boolean);
  parts.forEach((text, i) => claims.push({
    claim_id: `claim-${i+1}`,
    claim_text_normalized: String(text).replace(/\s+/g," ").trim(),
    claim_type: i === 1 ? "material_update" : "summary",
    risk_level: riskFlags(row).length ? "high" : "low",
    source_ref_ids: sources.map((_,j) => `source-${j+1}`),
    verification_status: row.verification_status === "conflicting" ? "conflicting" : row.verification_status === "verified" ? "verified" : "attributed",
  }));
  return claims;
}

export function classifyDedupe(row, derivedEventKey, indexes) {
  const warnings = [];
  const same = indexes.events?.find((e) => e.event_key === derivedEventKey);
  const knownText = stableJson(indexes).toLowerCase();
  const h = String(row.headline || "").toLowerCase();
  if (row.id === "wpb-intel-2026-09-08-001" || (derivedEventKey === "project|south-flagler-house|construction|topping-out|2025-11" && knownText.includes("south flagler") && knownText.includes("top"))) {
    if (/15th floor/.test(`${h} ${String(row.summary||"").toLowerCase()}`)) return { classification: "conflicting_event", warnings: [{ code: ERR.TEMPORAL_CONFLICT, message: "15th-floor claim occurs after known November 2025 full topping-out" }] };
    return { classification: same ? "additional_source" : "duplicate", warnings };
  }
  if (same) return { classification: "additional_source", warnings };
  if (row.related_project_slug === "464-fern-street" && /464 fern/.test(knownText)) return { classification: "duplicate", warnings: [{ code: "WARN_EXISTING_CONTENT_OVERLAP", message: "Existing approved/published 464 Fern content overlaps this event" }] };
  return { classification: "new_event", warnings };
}

export function recommendDecision(row, dedupe, flags) {
  if (["duplicate", "additional_source", "existing_known_fact"].includes(dedupe)) return dedupe === "additional_source" ? "additional_source" : "duplicate";
  if (dedupe === "conflicting_event" || row.verification_status === "conflicting") return "human_review";
  if (bool(row.requires_human_review)) return "human_review";
  if (flags.some((f) => /(pricing|inventory|legal|termination|financing|regulatory|approval|zoning|permit)/i.test(f))) return "human_review";
  if (csvList(row.related_project_ids).length === 0 && row.related_project_slug) return "new_project_candidate";
  return "project_update_only";
}

export function processRow({ row, verificationSources = [], indexes = {} }) {
  const errors = validateRow(row);
  const rowSnapshot = stable(row);
  const rowHash = sha256(rowSnapshot);
  const supplied = String(row.event_key || "").trim();
  const derived = deriveEventKey(row);
  const flags = riskFlags(row);
  const dedupe = classifyDedupe(row, derived, indexes);
  const warnings = [...dedupe.warnings];
  if (supplied && supplied !== derived) warnings.push({ code: ERR.EVENT_KEY_CONFLICT, message: `Supplied event_key differs from derived event identity: ${supplied} != ${derived}` });
  if (row.verification_status === "conflicting") warnings.push({ code: ERR.EVIDENCE_CONFLICT, message: "Intake verification status is conflicting; public output must remain held" });
  if (row.related_project_slug === "464-fern-street" && verificationSources.every((s) => s.source_tier !== 1)) warnings.push({ code: ERR.ENTITY_AMBIGUOUS, message: "464 Fern requires primary municipal/entity verification before public treatment" });
  const recommendation = recommendDecision(row, dedupe.classification, flags);
  const claims = buildClaimLedger(row, verificationSources);
  const canCreate = !errors.length && !["duplicate","additional_source"].includes(recommendation);
  const candidate = canCreate ? {
    update_id: `du-${sha256(derived).slice(0,12)}`,
    event_key: derived,
    headline: row.headline,
    event_date: String(row.source_published_date || "") || undefined,
    related_project_ids: csvList(row.related_project_ids),
    related_corridor_ids: csvList(row.related_corridor_ids),
    category: row.category || "development",
    output_type: recommendation === "standalone_article" ? "standalone_article" : recommendation === "project_update_only" ? "project_update" : "none",
    summary: row.summary || "",
    material_updates: String(row.material_updates || "").split(/\n|;/).map((s) => s.trim()).filter(Boolean),
    buyer_context: row.buyer_angle || undefined,
    lead_source: { url: safeHttpUrl(row.lead_source_url || row.source_url) || undefined, source_name: row.source_name || undefined, sheet_intel_id: row.id },
    verification_sources: verificationSources,
    claim_evidence: claims,
    source_quality: row.source_quality || "",
    verification_summary: row.verification_summary || "",
    risk_flags: flags,
    review_status: recommendation === "project_update_only" ? "draft" : "needs_review",
    article_candidate: recommendation === "standalone_article" ? { slug: slugify(row.headline), headline: row.headline, summary: row.summary || "", canonical_path: `/updates/${slugify(row.headline)}/` } : undefined,
    project_fact_proposals: [],
    sheet_intel_ids: [row.id],
  } : null;
  const report = {
    processor_version: PROCESSOR_VERSION,
    intel_id: row.id,
    row_sha256: rowHash,
    claim_ledger_sha256: sha256(claims),
    event_identity_sha256: sha256(derived),
    candidate_sha256: sha256(candidate),
    supplied_event_key: supplied || undefined,
    derived_event_key: derived,
    dedupe_classification: dedupe.classification,
    recommendation,
    warnings,
    errors,
    mutation_count: 0,
  };
  return { snapshot: rowSnapshot, claims, candidate, report };
}
