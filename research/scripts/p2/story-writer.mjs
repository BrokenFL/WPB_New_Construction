import { safeHttpUrl, sha256, stableJson } from "../intel/core.mjs";

// Provider-neutral writing boundary. Providers receive only this immutable,
// evidence-bound brief and return copy; they do not research, adjudicate, or
// decide whether anything may be published.

export const STORY_BRIEF_CONTRACT_VERSION = "p2-story-brief-v1";
export const STORY_CANDIDATE_CONTRACT_VERSION = "p2-story-candidate-v1";

export const STORY_WRITER_ERR = Object.freeze({
  INVALID_BRIEF: "ERR_STORY_BRIEF_INVALID",
  BRIEF_HASH_MISMATCH: "ERR_STORY_BRIEF_HASH_MISMATCH",
  PROVIDER_REQUIRED: "ERR_STORY_PROVIDER_REQUIRED",
  PROVIDER_INTERFACE: "ERR_STORY_PROVIDER_INTERFACE",
  CANDIDATE_INVALID: "ERR_STORY_CANDIDATE_INVALID",
  CANDIDATE_BINDING: "ERR_STORY_CANDIDATE_BINDING",
  UNKNOWN_CLAIM: "ERR_STORY_UNKNOWN_CLAIM",
  FORBIDDEN_AUTHORITY_FIELD: "ERR_STORY_FORBIDDEN_AUTHORITY_FIELD",
});

const HEX_256 = /^[a-f0-9]{64}$/i;
const FORBIDDEN_AUTHORITY_KEY = /(publish|approval|decision)/i;
const BRIEF_KEYS = new Set([
  "contract_version",
  "intel_id",
  "event_key",
  "evidence_bundle_sha256",
  "claims",
  "source_urls",
  "editorial_constraints",
  "brief_sha256",
]);
const CLAIM_KEYS = new Set(["claim_id", "claim_type", "field", "claim_value", "text"]);
const CANDIDATE_KEYS = new Set(["contract_version", "brief_sha256", "evidence_bundle_sha256", "title", "deck", "sections", "article_candidate_sha256"]);
const SECTION_KEYS = new Set(["heading", "body", "claim_ids"]);

export class StoryWriterError extends Error {
  constructor(code, message) {
    super(`${code}: ${message}`);
    this.name = "StoryWriterError";
    this.code = code;
  }
}

function fail(code, message) {
  throw new StoryWriterError(code, message);
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
}

function assertJsonValue(value, path = "value") {
  if (value === null || typeof value === "string" || typeof value === "boolean" || (typeof value === "number" && Number.isFinite(value))) return;
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertJsonValue(item, `${path}[${index}]`));
    return;
  }
  if (isPlainObject(value)) {
    Object.entries(value).forEach(([key, item]) => {
      if (FORBIDDEN_AUTHORITY_KEY.test(key)) fail(STORY_WRITER_ERR.FORBIDDEN_AUTHORITY_FIELD, `${path}.${key} is not a provider authority`);
      assertJsonValue(item, `${path}.${key}`);
    });
    return;
  }
  fail(STORY_WRITER_ERR.INVALID_BRIEF, `${path} is not JSON-compatible`);
}

function assertNoUnknownKeys(value, allowed, path, errorCode = STORY_WRITER_ERR.CANDIDATE_INVALID) {
  if (!isPlainObject(value)) fail(errorCode, `${path} must be an object`);
  for (const key of Object.keys(value)) {
    if (FORBIDDEN_AUTHORITY_KEY.test(key)) fail(STORY_WRITER_ERR.FORBIDDEN_AUTHORITY_FIELD, `${path}.${key} is forbidden`);
    if (!allowed.has(key)) fail(errorCode, `${path}.${key} is not allowed`);
  }
}

function clone(value) {
  if (Array.isArray(value)) return value.map(clone);
  if (isPlainObject(value)) return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, clone(item)]));
  return value;
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  if (Array.isArray(value)) value.forEach(deepFreeze);
  else Object.values(value).forEach(deepFreeze);
  return value;
}

function textValue(value, path) {
  if (typeof value !== "string" || !value.trim()) fail(STORY_WRITER_ERR.INVALID_BRIEF, `${path} must be a non-empty string`);
  return value;
}

function normalizeSources(sources) {
  if (!Array.isArray(sources) || sources.length === 0) fail(STORY_WRITER_ERR.INVALID_BRIEF, "sources must contain at least one source URL");
  const urls = sources.map((source, index) => {
    const value = typeof source === "string" ? source : source?.url || source?.final_url;
    const url = safeHttpUrl(value);
    if (!url) fail(STORY_WRITER_ERR.INVALID_BRIEF, `sources[${index}] is not a safe HTTP(S) URL`);
    return url;
  });
  return [...new Set(urls)].sort();
}

function normalizeClaim(claim, index, { requirePhaseA = true } = {}) {
  if (!isPlainObject(claim)) fail(STORY_WRITER_ERR.INVALID_BRIEF, `claims[${index}] must be an object`);
  const claimId = textValue(claim.claim_id, `claims[${index}].claim_id`);
  const claimType = textValue(claim.claim_type, `claims[${index}].claim_type`);
  const field = textValue(claim.field, `claims[${index}].field`);
  if (requirePhaseA && claim.material !== true) fail(STORY_WRITER_ERR.INVALID_BRIEF, `${claimId} is not a material Phase A claim`);
  if (requirePhaseA && claim.support !== "supported") fail(STORY_WRITER_ERR.INVALID_BRIEF, `${claimId} is not supported`);
  if (!Object.prototype.hasOwnProperty.call(claim, "claim_value")) fail(STORY_WRITER_ERR.INVALID_BRIEF, `${claimId} has no exact claim_value`);
  assertJsonValue(claim.claim_value, `claims[${index}].claim_value`);
  const normalizedText = claim.claim_text_normalized ?? claim.text;
  const text = textValue(normalizedText, `claims[${index}].text`);
  if (claim.text !== undefined && claim.text !== normalizedText) fail(STORY_WRITER_ERR.INVALID_BRIEF, `${claimId} text aliases disagree`);
  if (claim.claim_text_normalized !== undefined && claim.claim_text_normalized !== normalizedText) fail(STORY_WRITER_ERR.INVALID_BRIEF, `${claimId} normalized text aliases disagree`);
  return { claim_id: claimId, claim_type: claimType, field, claim_value: clone(claim.claim_value), text };
}

function briefPayload({ evidenceBundle, claims, sources, editorialConstraints }) {
  if (!isPlainObject(evidenceBundle)) fail(STORY_WRITER_ERR.INVALID_BRIEF, "evidenceBundle must be an object");
  const intelId = textValue(evidenceBundle.intel_id, "evidenceBundle.intel_id");
  const eventKey = textValue(evidenceBundle.event_key, "evidenceBundle.event_key");
  const evidenceHash = textValue(evidenceBundle.evidence_bundle_sha256, "evidenceBundle.evidence_bundle_sha256").toLowerCase();
  if (!HEX_256.test(evidenceHash)) fail(STORY_WRITER_ERR.INVALID_BRIEF, "evidence_bundle_sha256 must be a SHA-256 hex digest");
  if (!Array.isArray(claims) || claims.length === 0) fail(STORY_WRITER_ERR.INVALID_BRIEF, "claims must contain supported material claims");
  const normalizedClaims = claims.map(normalizeClaim, claims);
  if (new Set(normalizedClaims.map((claim) => claim.claim_id)).size !== normalizedClaims.length) fail(STORY_WRITER_ERR.INVALID_BRIEF, "claim_id values must be unique");
  normalizedClaims.sort((a, b) => a.claim_id.localeCompare(b.claim_id));
  const sourceUrls = normalizeSources(sources);
  const constraints = editorialConstraints === undefined ? {} : clone(editorialConstraints);
  if (!isPlainObject(constraints)) fail(STORY_WRITER_ERR.INVALID_BRIEF, "editorial_constraints must be an object");
  assertJsonValue(constraints, "editorial_constraints");
  return {
    contract_version: STORY_BRIEF_CONTRACT_VERSION,
    intel_id: intelId,
    event_key: eventKey,
    evidence_bundle_sha256: evidenceHash,
    claims: normalizedClaims,
    source_urls: sourceUrls,
    editorial_constraints: constraints,
  };
}

export function createEditorialBrief({ evidenceBundle, claims, sources, editorialConstraints = {} } = {}) {
  const payload = briefPayload({ evidenceBundle, claims, sources, editorialConstraints });
  return deepFreeze({ ...payload, brief_sha256: sha256(payload) });
}

export function validateEditorialBrief(brief) {
  if (!isPlainObject(brief)) fail(STORY_WRITER_ERR.INVALID_BRIEF, "brief must be an object");
  assertNoUnknownKeys(brief, BRIEF_KEYS, "brief", STORY_WRITER_ERR.INVALID_BRIEF);
  if (brief.contract_version !== STORY_BRIEF_CONTRACT_VERSION) fail(STORY_WRITER_ERR.INVALID_BRIEF, "unsupported brief contract_version");
  const payload = {
    contract_version: STORY_BRIEF_CONTRACT_VERSION,
    intel_id: textValue(brief.intel_id, "brief.intel_id"),
    event_key: textValue(brief.event_key, "brief.event_key"),
    evidence_bundle_sha256: textValue(brief.evidence_bundle_sha256, "brief.evidence_bundle_sha256").toLowerCase(),
    claims: brief.claims.map((claim, index) => normalizeClaim(claim, index, { requirePhaseA: false })).sort((a, b) => a.claim_id.localeCompare(b.claim_id)),
    source_urls: normalizeSources(brief.source_urls),
    editorial_constraints: clone(brief.editorial_constraints),
  };
  if (!HEX_256.test(payload.evidence_bundle_sha256)) fail(STORY_WRITER_ERR.INVALID_BRIEF, "brief evidence_bundle_sha256 must be a SHA-256 hex digest");
  if (new Set(payload.claims.map((claim) => claim.claim_id)).size !== payload.claims.length) fail(STORY_WRITER_ERR.INVALID_BRIEF, "brief claim_id values must be unique");
  assertJsonValue(payload.editorial_constraints, "brief.editorial_constraints");
  if (brief.brief_sha256 !== sha256(payload)) fail(STORY_WRITER_ERR.BRIEF_HASH_MISMATCH, "brief_sha256 does not match the brief payload");
  return deepFreeze(clone(brief));
}

function validateCandidate(candidate, brief) {
  if (!isPlainObject(candidate)) fail(STORY_WRITER_ERR.CANDIDATE_INVALID, "provider must return a structured object");
  assertNoUnknownKeys(candidate, CANDIDATE_KEYS, "candidate");
  if (candidate.contract_version !== STORY_CANDIDATE_CONTRACT_VERSION) fail(STORY_WRITER_ERR.CANDIDATE_INVALID, "unsupported candidate contract_version");
  if (candidate.brief_sha256 !== brief.brief_sha256 || candidate.evidence_bundle_sha256 !== brief.evidence_bundle_sha256) fail(STORY_WRITER_ERR.CANDIDATE_BINDING, "candidate hashes do not match the exact brief/evidence bundle");
  const title = textValue(candidate.title, "candidate.title");
  const deck = textValue(candidate.deck, "candidate.deck");
  if (!Array.isArray(candidate.sections) || candidate.sections.length === 0) fail(STORY_WRITER_ERR.CANDIDATE_INVALID, "candidate.sections must be non-empty");
  const claimIds = new Set(brief.claims.map((claim) => claim.claim_id));
  const sections = candidate.sections.map((section, index) => {
    assertNoUnknownKeys(section, SECTION_KEYS, `candidate.sections[${index}]`);
    const heading = textValue(section.heading, `candidate.sections[${index}].heading`);
    const body = textValue(section.body, `candidate.sections[${index}].body`);
    if (!Array.isArray(section.claim_ids) || section.claim_ids.length === 0) fail(STORY_WRITER_ERR.CANDIDATE_INVALID, `candidate.sections[${index}].claim_ids must be non-empty`);
    const refs = [...section.claim_ids];
    if (refs.some((id) => typeof id !== "string" || !claimIds.has(id))) fail(STORY_WRITER_ERR.UNKNOWN_CLAIM, `candidate.sections[${index}] references an unknown claim`);
    if (new Set(refs).size !== refs.length) fail(STORY_WRITER_ERR.CANDIDATE_INVALID, `candidate.sections[${index}].claim_ids must be unique`);
    return { heading, body, claim_ids: refs };
  });
  const payload = {
    contract_version: STORY_CANDIDATE_CONTRACT_VERSION,
    brief_sha256: brief.brief_sha256,
    evidence_bundle_sha256: brief.evidence_bundle_sha256,
    title,
    deck,
    sections,
  };
  const expectedHash = sha256(payload);
  if (candidate.article_candidate_sha256 !== undefined && candidate.article_candidate_sha256 !== expectedHash) fail(STORY_WRITER_ERR.CANDIDATE_BINDING, "article_candidate_sha256 does not match candidate content");
  return deepFreeze({ ...payload, article_candidate_sha256: expectedHash });
}

export async function runStoryWriter({ provider, brief } = {}) {
  if (!provider) fail(STORY_WRITER_ERR.PROVIDER_REQUIRED, "provider is required");
  if (typeof provider.write !== "function") fail(STORY_WRITER_ERR.PROVIDER_INTERFACE, "provider.write(brief) is required");
  const validatedBrief = validateEditorialBrief(brief);
  const result = await provider.write(validatedBrief);
  return validateCandidate(result, validatedBrief);
}

// Deterministic local provider for contract tests and shadow-only development.
// It performs no research, network access, adjudication, or release decision.
export function createStaticStoryWriterProvider() {
  return {
    name: "static-test-provider",
    write(brief) {
      const headline = brief.claims.find((claim) => claim.field === "headline") || brief.claims[0];
      const summary = brief.claims.find((claim) => claim.field === "summary");
      const text = (claim) => claim?.text || String(claim?.claim_value ?? "");
      return {
        contract_version: STORY_CANDIDATE_CONTRACT_VERSION,
        brief_sha256: brief.brief_sha256,
        evidence_bundle_sha256: brief.evidence_bundle_sha256,
        title: text(headline),
        deck: text(summary) || "Evidence-bound draft for editorial review.",
        sections: [{
          heading: "Verified update",
          body: brief.claims.map(text).join(" "),
          claim_ids: brief.claims.map((claim) => claim.claim_id),
        }],
      };
    },
  };
}
