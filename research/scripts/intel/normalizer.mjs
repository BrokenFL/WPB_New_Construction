import crypto from "node:crypto";
import net from "node:net";

export const REVIEW_STATUS = Object.freeze({
  SUPPORTED: "supported",
  CONFLICTED: "conflicted",
  UNSUPPORTED: "unsupported",
  UNADJUDICATED: "unadjudicated",
});

// A verifier-created snapshot carries this non-serializable marker while it
// is in process. The serializable retrieval_attested field is the contract for
// a separately persisted local snapshot supplied by the review API.
export const fetchedEvidenceMark = Symbol("wpb.fetchedEvidenceMark");

const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  }
  return value;
}

export const stableJson = (value) => JSON.stringify(stable(value));
export const sha256 = (value) => crypto.createHash("sha256").update(typeof value === "string" ? value : stableJson(value)).digest("hex");

export function csvList(value = "") {
  if (Array.isArray(value)) return [...new Set(value.map((item) => String(item ?? "").trim()).filter(Boolean))];
  return [...new Set(String(value ?? "").split(",").map((item) => item.trim()).filter(Boolean))];
}

export function normalizeText(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function stripBrackets(hostname) {
  const value = String(hostname || "").trim().toLowerCase().replace(/\.$/, "");
  return value.startsWith("[") && value.endsWith("]") ? value.slice(1, -1) : value;
}

function ipv4Number(value) {
  const pieces = String(value).split(".");
  if (pieces.length !== 4 || pieces.some((piece) => !/^\d+$/.test(piece) || Number(piece) > 255)) return null;
  return pieces.reduce((number, piece) => (number * 256) + Number(piece), 0);
}

function ipv4InRange(value, start, end) {
  const number = ipv4Number(value);
  return number != null && number >= start && number <= end;
}

function ipv6Number(value) {
  let input = stripBrackets(value);
  if (input.includes(".")) {
    const lastColon = input.lastIndexOf(":");
    const dotted = ipv4Number(input.slice(lastColon + 1));
    if (dotted == null) return null;
    input = `${input.slice(0, lastColon)}:${((dotted >>> 16) & 0xffff).toString(16)}:${(dotted & 0xffff).toString(16)}`;
  }
  const halves = input.split("::");
  if (halves.length > 2) return null;
  const left = halves[0] ? halves[0].split(":") : [];
  const right = halves.length === 2 && halves[1] ? halves[1].split(":") : [];
  if ([...left, ...right].some((part) => !/^[0-9a-f]{1,4}$/i.test(part))) return null;
  const missing = 8 - left.length - right.length;
  if ((halves.length === 1 && missing !== 0) || (halves.length === 2 && missing < 1)) return null;
  const groups = [...left, ...Array.from({ length: Math.max(0, missing) }, () => "0"), ...right].map((part) => Number.parseInt(part || "0", 16));
  if (groups.length !== 8) return null;
  return groups.reduce((number, group) => (number << 16n) | BigInt(group), 0n);
}

export function isDisallowedIp(hostname) {
  const value = stripBrackets(hostname);
  const family = net.isIP(value);
  if (family === 4) {
    return [
      ["0.0.0.0", "0.255.255.255"],
      ["10.0.0.0", "10.255.255.255"],
      ["100.64.0.0", "100.127.255.255"],
      ["127.0.0.0", "127.255.255.255"],
      ["169.254.0.0", "169.254.255.255"],
      ["172.16.0.0", "172.31.255.255"],
      ["192.0.0.0", "192.0.0.255"],
      ["192.0.2.0", "192.0.2.255"],
      ["192.88.99.0", "192.88.99.255"],
      ["192.168.0.0", "192.168.255.255"],
      ["198.18.0.0", "198.19.255.255"],
      ["198.51.100.0", "198.51.100.255"],
      ["203.0.113.0", "203.0.113.255"],
      ["224.0.0.0", "255.255.255.255"],
    ].some(([start, end]) => ipv4InRange(value, ipv4Number(start), ipv4Number(end)));
  }
  if (family !== 6) return false;
  const number = ipv6Number(value);
  if (number == null) return true;
  const prefix = (bits) => (number >> BigInt(128 - bits));
  return prefix(3) !== 0x1n // only globally routable 2000::/3 is eligible
    || number === 0n
    || number === 1n
    || prefix(7) === 0x7en // fc00::/7 (unique-local)
    || prefix(10) === 0x3fan // fe80::/10 (link-local)
    || prefix(8) === 0xffn // ff00::/8 (multicast)
    || prefix(32) === 0x20010db8n // documentation range
    || prefix(32) === 0x20010000n // Teredo transition addresses
    || prefix(16) === 0x2002n // 6to4 transition addresses
    || (number >> 32n) === 0n // IPv4-compatible transition addresses
    || prefix(48) === 0x64ff9bn // NAT64 well-known prefix
    || prefix(96) === 0xffffn; // IPv4-mapped addresses, including public values
}

// Keep the IPv4-mapped case readable and avoid relying on bit arithmetic in the
// public predicate above for addresses such as ::ffff:127.0.0.1.
function isIpv4Mapped(hostname) {
  const value = stripBrackets(hostname);
  if (!value.includes(":")) return null;
  const number = ipv6Number(value);
  if (number == null || (number >> 32n) !== 0xffffn) return null;
  return Number(number & 0xffffffffn);
}

const originalIsDisallowedIp = isDisallowedIp;

export function isPrivateOrReservedAddress(hostname) {
  const mapped = isIpv4Mapped(hostname);
  if (mapped != null) return true;
  return originalIsDisallowedIp(hostname);
}

export function isObviousPrivateHostname(hostname) {
  const value = stripBrackets(hostname);
  return value === "localhost"
    || value.endsWith(".localhost")
    || value.endsWith(".local")
    || value.endsWith(".internal")
    || value.endsWith(".home.arpa")
    || value === "metadata.google.internal"
    || value === "host.docker.internal";
}

export function safeHttpUrl(value) {
  try {
    const raw = String(value ?? "").trim();
    if (!raw) return null;
    const url = new URL(raw);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) return null;
    if (isObviousPrivateHostname(url.hostname) || isPrivateOrReservedAddress(url.hostname)) return null;
    return url.href;
  } catch {
    return null;
  }
}

function normalizedValue(value) {
  if (Array.isArray(value)) return [...new Set(value.map(normalizedValue))].sort((a, b) => stableJson(a).localeCompare(stableJson(b)));
  if (value && typeof value === "object") return stable(Object.fromEntries(Object.entries(value).map(([key, item]) => [key, normalizedValue(item)])));
  if (typeof value === "string") return normalizeText(value);
  return value;
}

function valueIsPresent(value) {
  return value !== undefined && value !== null && (typeof value !== "string" || normalizeText(value) !== "");
}

function isRealIsoDate(value) {
  const match = normalizeText(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1) return false;
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
  return day <= daysInMonth;
}

function valueText(value) {
  if (Array.isArray(value)) return value.map(valueText).join(", ");
  if (value && typeof value === "object") return Object.entries(value).map(([key, item]) => `${key}: ${valueText(item)}`).join("; ");
  return normalizeText(value);
}

function claimRisk(text, riskFlags = [], field = "") {
  const normalized = `${field} ${text} ${riskFlags.join(" ")}`.toLowerCase();
  const high = /(pricing|price|inventory|buyout|lawsuit|litigation|dispute|termination|financ|approval|zoning|rezone|permit|regulatory|assessment|delivery|completion|handover|incentive|fee|ownership|title|equity|condo)/.test(normalized);
  return { risk_level: high ? "high" : "low", risk_flags: [...new Set(riskFlags)].sort() };
}

function makeClaim(spec, index, riskFlags) {
  const value = normalizedValue(spec.value);
  const text = normalizeText(spec.text || valueText(value));
  const claimType = String(spec.claim_type || spec.type || "material_fact");
  const field = String(spec.field || claimType);
  const identity = { field, claim_type: claimType, value };
  const risk = claimRisk(text, riskFlags, field);
  return {
    claim_id: `claim-${sha256(identity).slice(0, 16)}`,
    field,
    claim_text_normalized: text,
    text,
    claim_value: value,
    value,
    claim_type: claimType,
    type: claimType,
    source_ref_ids: [],
    sources: [],
    source_tiers: [],
    source_types: [],
    supporting_source_ref_ids: [],
    conflicting_source_ref_ids: [],
    support: "unsupported",
    support_status: REVIEW_STATUS.UNADJUDICATED,
    verification_status: "unadjudicated",
    evidence: [],
    conflict: false,
    ...risk,
    review_required: true,
    material: spec.material !== false,
  };
}

function parseJsonObject(value) {
  if (value && typeof value === "object") return value;
  if (typeof value !== "string" || !normalizeText(value)) return null;
  try { return JSON.parse(value); } catch { return null; }
}

export function extractFactSpecs(row = {}) {
  const specs = [];
  const candidate = row.fact_proposals_json || row.project_fact_proposals_json || row.fact_proposal_json || row.proposed_facts_json;
  const parsed = parseJsonObject(candidate);
  const entries = Array.isArray(parsed) ? parsed : parsed && typeof parsed === "object" ? (Array.isArray(parsed.proposals) ? parsed.proposals : [parsed]) : [];
  for (const entry of entries) if (entry && typeof entry === "object") specs.push({ ...entry });
  const field = row.project_fact_field || row.fact_field || row.canonical_fact_field;
  const hasNew = hasOwn(row, "project_fact_new_value") || hasOwn(row, "new_value") || hasOwn(row, "proposed_value");
  if (field && hasNew) {
    specs.push({
      project_id: row.project_fact_project_id || row.project_id,
      field,
      old_value: hasOwn(row, "project_fact_old_value") ? row.project_fact_old_value : row.old_value,
      new_value: hasOwn(row, "project_fact_new_value") ? row.project_fact_new_value : hasOwn(row, "new_value") ? row.new_value : row.proposed_value,
      effective_date: row.project_fact_effective_date || row.effective_date,
    });
  }
  const factEffectiveDate = (entry) => hasOwn(entry, "effective_date") ? entry.effective_date : hasOwn(entry, "date") ? entry.date : undefined;
  return specs.map((entry) => ({
    project_id: normalizeText(entry.project_id || entry.project_slug || entry.related_project_slug || row.related_project_slug || csvList(row.related_project_ids)[0]),
    field: normalizeText(entry.field || entry.name),
    old_value: hasOwn(entry, "old_value") ? entry.old_value : entry.current_value,
    new_value: hasOwn(entry, "new_value") ? entry.new_value : entry.proposed_value,
    effective_date: normalizeText(factEffectiveDate(entry)) || undefined,
    reason: normalizeText(entry.reason),
  })).filter((entry) => entry.project_id && entry.field && hasOwn(entry, "new_value") && entry.new_value !== undefined);
}

export function buildMaterialClaims(row = {}, { eventKey, riskFlags = [] } = {}) {
  const specs = [];
  const add = (field, value, claim_type, text = value, material = true) => {
    const normalized = normalizedValue(value);
    if (valueIsPresent(normalized)) specs.push({ field, value: normalized, claim_type, text, material });
  };
  add("headline", row.headline, "headline");
  add("event_date", normalizeText(row.event_date || row.effective_date).slice(0, 10), "date");
  add("project_identity", csvList(row.related_project_ids || row.related_project_slug), "project_identity");
  add("corridor_identity", csvList(row.related_corridor_ids || row.corridor), "corridor_identity");
  add("project_name", row.project_name, "project_name");
  add("category", row.category, "category");
  add("summary", row.summary, "summary");
  const materialUpdates = String(row.material_updates || "").split(/\n|;/).map(normalizeText).filter(Boolean);
  materialUpdates.forEach((update) => add("material_updates", update, "material_update", update));
  add("buyer_context", row.buyer_angle, "buyer_context", row.buyer_angle, false);
  add("event_identity", eventKey, "event_identity", eventKey);
  for (const spec of extractFactSpecs(row)) {
    add(`fact:${spec.field}`, {
      project_id: spec.project_id,
      field: spec.field,
      old_value: normalizedValue(spec.old_value),
      new_value: normalizedValue(spec.new_value),
      effective_date: spec.effective_date,
      event_key: eventKey,
    }, "canonical_fact", `${spec.field}: ${valueText(spec.new_value)}`);
  }
  return specs.map((spec, index) => makeClaim(spec, index, riskFlags));
}

function sourceDigest(source) {
  const digest = normalizeText(source?.content_hash || source?.body_sha256 || source?.fetched_content_sha256 || "");
  return /^[a-f0-9]{64}$/i.test(digest) ? digest.toLowerCase() : undefined;
}

export function normalizeVerificationSources(sources = [], { classifySource } = {}) {
  const list = Array.isArray(sources) ? sources : [];
  return list.map((source, index) => {
    const input = source && typeof source === "object" ? source : { url: source };
    const hintUrl = safeHttpUrl(input.hint_url || input.url || input.source_url);
    const url = safeHttpUrl(input.final_url || hintUrl);
    if (!url) return {
      source_ref_id: `source-invalid-${index + 1}`,
      url: input.final_url || input.url || input.source_url,
      source_name: normalizeText(input.source_name),
      source_tier: undefined,
      source_type: undefined,
      error: "ERR_UNSAFE_SOURCE",
      verification_status: "unadjudicated",
      claims_supported: [],
    };
    const classified = typeof classifySource === "function" ? classifySource(url, input.source_name || "") : {};
    const digest = sourceDigest(input);
    const sourceRefId = `source-${sha256(url).slice(0, 16)}`;
    return {
      source_ref_id: sourceRefId,
      url,
      hint_url: input.hint_url || (hintUrl && hintUrl !== url ? hintUrl : undefined),
      hint_source_name: normalizeText(input.hint_source_name),
      hostname: new URL(url).hostname.toLowerCase().replace(/\.$/, ""),
      source_name: normalizeText(input.source_name) || new URL(url).hostname,
      source_tier: classified.source_tier,
      source_type: classified.source_type,
      published_date: input.published_date || input.source_published_date || undefined,
      accessed_at: input.accessed_at,
      reachable: input.reachable,
      http_status: input.http_status,
      retrieval_status: input.retrieval_status,
      retrieval_attested: input.retrieval_attested === true || input[fetchedEvidenceMark] === true,
      body_bytes: input.body_bytes,
      content_type: input.content_type,
      final_url: input.final_url,
      redirect_chain: Array.isArray(input.redirect_chain) ? [...input.redirect_chain] : undefined,
      content_hash: digest,
      source_revision: normalizeText(input.source_revision) || digest,
      verification_status: "unadjudicated",
      support_state: "unadjudicated",
      claims_supported: [],
      claimed_support_ignored: Array.isArray(input.claims_supported) && input.claims_supported.length > 0,
      verification_error: normalizeText(input.verification_error) || undefined,
      error: classified.error,
    };
  }).map((source, _index, all) => {
    if (source.error || !source.url) return source;
    const duplicates = all.filter((candidate) => candidate.url === source.url);
    if (duplicates.length > 1) return { ...source, error: "ERR_AMBIGUOUS_SOURCE", source_ambiguity: "duplicate_url" };
    return source;
  });
}

function flattenReviewInput(input) {
  if (!input || typeof input !== "object" || Array.isArray(input) || !Array.isArray(input.records)) return [];
  return input.records.map((record) => ({ record, inherited: input }));
}

function reviewDecision(record) {
  return Object.values(REVIEW_STATUS).includes(record?.decision) && record.decision !== REVIEW_STATUS.UNADJUDICATED ? record.decision : null;
}

function listValue(value) {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null || value === "") return [];
  return [value];
}

function sameValue(a, b) {
  return stableJson(normalizedValue(a)) === stableJson(normalizedValue(b));
}

function findSource(sourceValue, sources) {
  const value = normalizeText(sourceValue);
  if (!value) return null;
  const safe = safeHttpUrl(value);
  const matches = sources.filter((source) => source.source_ref_id === value || (safe && source.url === safe));
  return matches.length === 1 ? matches[0] : null;
}

function sourceEvidenceDigest(source) {
  return source?.content_hash || undefined;
}

function sourceRevisionMatches(source, record) {
  const expected = normalizeText(record.content_hash || "").toLowerCase();
  const actual = normalizeText(source.content_hash || "").toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(expected) || !/^[a-f0-9]{64}$/.test(actual) || expected !== actual) return false;
  return !record.source_revision || normalizeText(record.source_revision) === normalizeText(source.source_revision || "");
}

function rejectRecord(result, code, message, record) {
  result.rejected.push({ code, message, claim_id: record?.claim_id, source_ref_id: record?.source_ref_id });
}

export function applyTrustedEvidence({ claims = [], sources = [], rowHash, input, classifySource } = {}) {
  const result = { provided: input !== undefined && input !== null, accepted: [], rejected: [], reviewed_claim_ids: [] };
  const entries = flattenReviewInput(input);
  const stateByClaim = new Map();
  const claimFor = (record) => {
    const claimId = normalizeText(record.claim_id);
    let claim = null;
    if (claimId) {
      claim = claims.find((item) => item.claim_id === claimId);
      if (!claim) return { error: "ERR_CLAIM_NOT_FOUND", message: "Review record claim identity is not present in this intake snapshot" };
    } else {
      const type = normalizeText(record.claim_type);
      const field = normalizeText(record.field);
      const valuePresent = hasOwn(record, "claim_value");
      const value = record.claim_value;
      const candidates = claims.filter((item) => type && field && valuePresent && item.claim_type === type && item.field === field && sameValue(item.claim_value, value));
      if (candidates.length === 1) claim = candidates[0];
      else if (candidates.length > 1) return { error: "ERR_AMBIGUOUS_CLAIM", message: "Review record maps to multiple claims" };
      else return { error: "ERR_CLAIM_NOT_FOUND", message: "Review record claim identity is not present in this intake snapshot" };
    }
    const type = normalizeText(record.claim_type);
    const valuePresent = hasOwn(record, "claim_value");
    const value = record.claim_value;
    if (!type || !valuePresent || !normalizeText(record.field) || type !== claim.claim_type || !sameValue(value, claim.claim_value)) return { error: "ERR_CLAIM_BINDING", message: "Review record must bind the exact claim field, type, and value" };
    if (normalizeText(record.field) !== claim.field) return { error: "ERR_CLAIM_BINDING", message: "Review record field does not match the claim" };
    if (record.claim_text_normalized !== undefined && normalizeText(record.claim_text_normalized) !== claim.claim_text_normalized) return { error: "ERR_CLAIM_BINDING", message: "Review record text does not match the claim" };
    return { claim };
  };

  for (const entry of entries) {
    const record = entry.record && typeof entry.record === "object" ? entry.record : {};
    const inherited = entry.inherited || {};
    const snapshotHash = normalizeText(record.intake_snapshot_sha256 || inherited.intake_snapshot_sha256);
    if (!snapshotHash || snapshotHash !== rowHash) {
      rejectRecord(result, "ERR_REVIEW_SNAPSHOT_BINDING", "Trusted review record is not bound to this intake snapshot", record);
      continue;
    }
    const decision = reviewDecision(record);
    if (!decision) {
      rejectRecord(result, "ERR_REVIEW_DECISION", "Trusted review record has no explicit supported/conflicted/unsupported decision", record);
      continue;
    }
    const resolvedClaim = claimFor(record);
    if (resolvedClaim.error) {
      rejectRecord(result, resolvedClaim.error, resolvedClaim.message, record);
      continue;
    }
    const refValues = listValue(record.verification_source_ref_ids);
    const sourceRefs = [...new Set(refValues.map((value) => normalizeText(value)).filter(Boolean))].map((value) => findSource(value, sources));
    if (!sourceRefs.length || sourceRefs.some((source) => !source || source.error)) {
      rejectRecord(result, "ERR_REVIEW_SOURCE_BINDING", "Trusted review record must bind an exact verification source reference or URL", record);
      continue;
    }
    if (typeof classifySource === "function") {
      const provenanceInvalid = sourceRefs.some((source) => {
        const classified = classifySource(source.url, "");
        return classified.error || classified.source_tier !== source.source_tier || classified.source_type !== source.source_type;
      });
      if (provenanceInvalid) {
        rejectRecord(result, "ERR_REVIEW_SOURCE_PROVENANCE", "Verification source is not independently classified from its exact URL", record);
        continue;
      }
    }
    const reviewer = normalizeText(record.reviewer);
    const reviewedAt = normalizeText(record.reviewed_at);
    if (!reviewer || !reviewedAt || Number.isNaN(Date.parse(reviewedAt))) {
      rejectRecord(result, "ERR_REVIEW_PROVENANCE", "Trusted review record must include reviewer and a valid reviewed_at timestamp", record);
      continue;
    }
    const digest = sourceEvidenceDigest(sourceRefs[0]);
    if (!digest || sourceRefs.some((source) => source.retrieval_status !== "fetched" || source.retrieval_attested !== true || source.reachable !== true || !Number.isFinite(source.body_bytes) || !sourceRevisionMatches(source, record))) {
      rejectRecord(result, "ERR_REVIEW_CONTENT_BINDING", "Trusted review record must match a successfully fetched source content digest/revision", record);
      continue;
    }
    const claim = resolvedClaim.claim;
    const reviewId = normalizeText(record.review_id || record.id) || `review-${sha256({ claim_id: claim.claim_id, decision, source_ref_ids: sourceRefs.map((source) => source.source_ref_id).sort(), digest }).slice(0, 16)}`;
    const evidence = {
      review_id: reviewId,
      decision,
      source_ref_ids: sourceRefs.map((source) => source.source_ref_id).sort(),
      content_hash: digest,
      source_revision: sourceRefs[0].source_revision || digest,
      reviewed_at: reviewedAt,
      reviewer,
      excerpt: normalizeText(record.evidence_excerpt || record.excerpt || record.quote).slice(0, 500) || undefined,
    };
    result.accepted.push({ claim_id: claim.claim_id, ...evidence });
    result.reviewed_claim_ids.push(claim.claim_id);
    const current = stateByClaim.get(claim.claim_id) || [];
    current.push(evidence);
    stateByClaim.set(claim.claim_id, current);
  }

  for (const claim of claims) {
    const evidence = stateByClaim.get(claim.claim_id) || [];
    const hasSupport = evidence.some((item) => item.decision === REVIEW_STATUS.SUPPORTED);
    const hasConflict = evidence.some((item) => item.decision === REVIEW_STATUS.CONFLICTED);
    const hasUnsupported = evidence.some((item) => item.decision === REVIEW_STATUS.UNSUPPORTED);
    const status = hasConflict || (hasSupport && hasUnsupported)
      ? REVIEW_STATUS.CONFLICTED
      : hasSupport
        ? REVIEW_STATUS.SUPPORTED
        : hasUnsupported
          ? REVIEW_STATUS.UNSUPPORTED
          : REVIEW_STATUS.UNADJUDICATED;
    claim.support = status === REVIEW_STATUS.SUPPORTED ? REVIEW_STATUS.SUPPORTED : status === REVIEW_STATUS.CONFLICTED ? REVIEW_STATUS.CONFLICTED : "unsupported";
    claim.support_status = status;
    claim.verification_status = status === REVIEW_STATUS.SUPPORTED ? "verified" : status === REVIEW_STATUS.CONFLICTED ? "conflicting" : status === REVIEW_STATUS.UNSUPPORTED ? "unsupported" : "unadjudicated";
    claim.evidence = evidence;
    claim.supporting_source_ref_ids = [...new Set(evidence.filter((item) => item.decision === REVIEW_STATUS.SUPPORTED).flatMap((item) => item.source_ref_ids))].sort();
    claim.conflicting_source_ref_ids = [...new Set(evidence.filter((item) => item.decision === REVIEW_STATUS.CONFLICTED).flatMap((item) => item.source_ref_ids))].sort();
    claim.conflict = status === REVIEW_STATUS.CONFLICTED;
  }
  return result;
}

export function canonicalIndexRevision(indexes = {}) {
  return sha256({
    reviewed_facts: indexes.reviewed_facts || null,
    source_revisions: indexes.source_revisions || [],
  });
}

function canonicalFact(indexes, projectId, field) {
  const projects = indexes?.reviewed_facts?.projects;
  const entry = projects && projects[projectId] && projects[projectId][field];
  if (!entry || typeof entry !== "object" || !hasOwn(entry, "value")) return { present: false };
  return { present: true, value: entry.value, source: entry.source, reviewed_by: entry.reviewedBy, revision: canonicalIndexRevision(indexes) };
}

export function buildFactProposals({ row = {}, claims = [], eventKey, indexes = {} } = {}) {
  const proposals = [];
  const held = [];
  const indexRevision = canonicalIndexRevision(indexes);
  const specs = extractFactSpecs(row);
  for (const spec of specs) {
    const factValue = {
      project_id: spec.project_id,
      field: spec.field,
      old_value: normalizedValue(spec.old_value),
      new_value: normalizedValue(spec.new_value),
      effective_date: spec.effective_date,
      event_key: eventKey,
    };
    const claim = claims.find((item) => item.field === `fact:${spec.field}` && sameValue(item.claim_value, factValue));
    const current = canonicalFact(indexes, spec.project_id, spec.field);
    const oldValue = hasOwn(spec, "old_value") && spec.old_value !== undefined ? normalizedValue(spec.old_value) : current.present ? normalizedValue(current.value) : undefined;
    const oldMatches = current.present && sameValue(current.value, oldValue);
    const effectiveDateValid = isRealIsoDate(spec.effective_date);
    const supported = claim?.support === REVIEW_STATUS.SUPPORTED;
    const conflicted = claim?.support === REVIEW_STATUS.CONFLICTED || !oldMatches || !effectiveDateValid;
    const risk = claim?.risk_level === "high" ? "high" : conflicted ? "high" : "medium";
    const reviewRequirement = conflicted ? "blocked" : "human_review";
    const proposal = {
      proposal_id: `proposal-${sha256({ project_id: spec.project_id, field: spec.field, old_value: oldValue, new_value: normalizedValue(spec.new_value), effective_date: spec.effective_date, event_key: eventKey }).slice(0, 16)}`,
      project_id: spec.project_id,
      field: spec.field,
      old_value: oldValue,
      new_value: normalizedValue(spec.new_value),
      proposed_value: normalizedValue(spec.new_value),
      effective_date: spec.effective_date,
      event_key: eventKey,
      supporting_claim_ids: supported && claim ? [claim.claim_id] : [],
      verification_source_ref_ids: supported && claim ? claim.supporting_source_ref_ids : [],
      risk,
      review_requirement: reviewRequirement,
      apply: false,
      reason: spec.reason || (!effectiveDateValid ? "Fact proposal requires a strict valid effective_date" : !oldMatches ? "Canonical fact revision or evidence is conflicting" : "Phase A evidence requires explicit human review"),
      review: {
        required: true,
        status: reviewRequirement === "blocked" ? "blocked" : "pending",
        requirement: reviewRequirement,
      },
      evidence: {
        claim_ids: supported && claim ? [claim.claim_id] : [],
        source_ref_ids: supported && claim ? claim.supporting_source_ref_ids : [],
      },
      rollback: {
        previous_value: oldValue,
        source_revision: current.revision || indexRevision,
      },
      canonical_index_revision: indexRevision,
      supersedes_proposal_id: undefined,
    };
    if (supported && !conflicted) proposals.push(proposal);
    else held.push({
      proposal_id: proposal.proposal_id,
      project_id: spec.project_id,
      field: spec.field,
      claim_id: claim?.claim_id,
      hold_reason: !effectiveDateValid ? "Fact proposal requires a strict valid effective_date" : !claim ? "Claim has no trusted support" : !oldMatches ? "Canonical fact revision or evidence is conflicting" : conflicted ? "Claim or canonical value is conflicting" : "Claim is not supported",
      review_requirement: reviewRequirement,
    });
  }
  return { proposals, held };
}

export function attachSourceProvenance(claims, sources) {
  const validSources = sources.filter((source) => !source.error && source.url);
  for (const claim of claims) {
    const adjudicated = new Set([...claim.supporting_source_ref_ids, ...claim.conflicting_source_ref_ids]);
    claim.available_source_ref_ids = validSources.map((source) => source.source_ref_id).sort();
    claim.sources = validSources.filter((source) => adjudicated.has(source.source_ref_id)).map((source) => ({
      source_ref_id: source.source_ref_id,
      url: source.url,
      source_tier: source.source_tier,
      source_type: source.source_type,
      source_revision: source.source_revision,
      content_hash: source.content_hash,
    }));
    claim.source_ref_ids = [...adjudicated].sort();
    claim.source_tiers = [...new Set(claim.sources.map((source) => source.source_tier).filter((tier) => tier != null))].sort((a, b) => a - b);
    claim.source_types = [...new Set(claim.sources.map((source) => source.source_type).filter(Boolean))].sort();
  }
  return claims;
}

export function semanticClaims(claims = []) {
  return claims.map((claim) => {
    const { evidence, ...semantic } = claim;
    return {
      ...semantic,
      evidence: (evidence || []).map(({ reviewed_at, reviewer, ...item }) => item),
    };
  });
}
