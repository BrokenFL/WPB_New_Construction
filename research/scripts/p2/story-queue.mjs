import { parseSheetCsv } from "../intel/sheet-adapter.mjs";
import { sha256, stableJson } from "../intel/core.mjs";

// Story_Queue is the handoff tab between verified intelligence and article
// publication in the primary private spreadsheet. One row per story event;
// the Sheet is the durable workflow state so retries stay idempotent.
export const STORY_QUEUE_SHEET = "Story_Queue";

export const STORY_QUEUE_COLUMNS = Object.freeze([
  "story_id",
  "status",
  "created_at",
  "updated_at",
  "intel_ids",
  "event_key",
  "project_ids",
  "corridor_ids",
  "headline",
  "deck",
  "summary",
  "article_body",
  "seo_title",
  "seo_description",
  "social_copy",
  "sources_json",
  "verified_facts_json",
  "qualified_facts_json",
  "canonical_fact_proposals_json",
  "story_package_json",
  "writer_name",
  "writer_version",
  "policy_version",
  "article_decision",
  "publish_status",
  "published_url",
  "commit_sha",
  "error",
  "publish_attempts",
]);

export const STORY_STATUS = Object.freeze({
  READY_FOR_WRITER: "ready_for_writer",
  READY_TO_PUBLISH: "ready_to_publish",
  PUBLISHED: "published",
  DUPLICATE: "duplicate",
  ERROR: "error",
  HELD: "held",
});

const VALID_STATUSES = new Set(Object.values(STORY_STATUS));

export function storyIdFor({ eventKey, intelIds = [] } = {}) {
  return `story-${sha256(stableJson({ event_key: eventKey, intel_ids: [...intelIds].sort() })).slice(0, 16)}`;
}

export function parseStoryQueueCsv(csv) {
  const records = parseSheetCsv(csv);
  return records.map((record) => ({ ...record }));
}

export function storyRowToCells(row) {
  return STORY_QUEUE_COLUMNS.map((column) => {
    const value = row[column];
    if (value === undefined || value === null) return "";
    if (typeof value === "object") return stableJson(value);
    return String(value);
  });
}

export function cellToRow(cells) {
  const row = {};
  STORY_QUEUE_COLUMNS.forEach((column, index) => { row[column] = cells[index] ?? ""; });
  return row;
}

/**
 * Idempotent enqueue. A story with the same event_key (or story_id) in any
 * status is reused rather than duplicated — an `error` row is reopened for
 * retry instead of spawning a second row. Returns { row, created, reused }.
 */
export function enqueueStory(existingRows, { eventKey, intelIds = [], fields = {}, now = new Date() } = {}) {
  const storyId = storyIdFor({ eventKey, intelIds });
  const existing = existingRows.find((row) => row.story_id === storyId || (eventKey && row.event_key === eventKey));
  const timestamp = now.toISOString();
  if (existing) {
    if (existing.status === STORY_STATUS.ERROR) {
      existing.status = STORY_STATUS.READY_FOR_WRITER;
      existing.error = "";
      existing.updated_at = timestamp;
      Object.assign(existing, fields);
      return { row: existing, created: false, reused: "error_retry" };
    }
    return { row: existing, created: false, reused: existing.status };
  }
  const row = {
    story_id: storyId,
    status: STORY_STATUS.READY_FOR_WRITER,
    created_at: timestamp,
    updated_at: timestamp,
    intel_ids: intelIds.join(","),
    event_key: eventKey || "",
    publish_status: "",
    published_url: "",
    commit_sha: "",
    error: "",
    publish_attempts: "0",
    ...fields,
  };
  existingRows.push(row);
  return { row, created: true, reused: null };
}

export function validateStoryRow(row) {
  const errors = [];
  if (!row.story_id) errors.push("missing story_id");
  if (!VALID_STATUSES.has(row.status)) errors.push(`invalid status: ${row.status}`);
  if (!row.event_key) errors.push("missing event_key");
  return errors;
}

/** Columns the pipeline may write back; intake-style fields stay owned by
 * the writer package so a status write can never corrupt article content. */
export const STORY_QUEUE_WRITEBACK_COLUMNS = Object.freeze([
  "status", "updated_at", "publish_status", "published_url", "commit_sha", "error", "publish_attempts",
]);

/**
 * Build the Story_Queue seed fields for an AUTO_PUBLISH intel result. The
 * writer task fills headline/deck/article_body/seo/social/story_package_json;
 * the processor seeds the factual record it must not contradict.
 */
export function storySeedFields({ row, result, boundReview, decision, now = new Date() }) {
  const verifiedFacts = (result.claims || [])
    .filter((claim) => claim.support === "supported")
    .map((claim) => ({
      claim_id: claim.claim_id,
      field: claim.field,
      value: claim.claim_value,
      source_ref_ids: claim.supporting_source_ref_ids || [],
    }));
  const sources = (result.verificationSources || [])
    .filter((source) => !source.error && source.url)
    .map((source) => ({ source_ref_id: source.source_ref_id, url: source.url, name: source.source_name || null, tier: source.source_tier ?? null }));
  const packageSeed = {
    destination: "news",
    title: String(row.headline || ""),
    deck: String(row.summary || ""),
    summary: String(row.summary || ""),
    sourceName: String(row.source_name || ""),
    sourceUrl: String(row.source_url || ""),
    sourceLinks: sources.map((source) => ({ label: source.name || source.url, url: source.url, type: "news" })),
    relatedProjectIds: result.candidate?.related_project_ids || [],
    relatedCorridorIds: result.candidate?.related_corridor_ids || [],
    eventDate: result.candidate?.event_date || String(row.event_date || ""),
    category: result.candidate?.category || String(row.category || ""),
    buyerContext: result.candidate?.buyer_context || String(row.buyer_angle || ""),
    whyItMatters: String(row.why_it_matters || ""),
  };
  return {
    project_ids: (result.candidate?.related_project_ids || []).join(","),
    corridor_ids: (result.candidate?.related_corridor_ids || []).join(","),
    headline: String(row.headline || ""),
    deck: String(row.summary || ""),
    summary: String(row.summary || ""),
    sources_json: stableJson(sources),
    verified_facts_json: stableJson(verifiedFacts),
    qualified_facts_json: stableJson(decision.qualified_claims || []),
    canonical_fact_proposals_json: stableJson(decision.fact_mutations || []),
    story_package_json: stableJson(packageSeed),
    writer_name: "",
    writer_version: "",
    policy_version: decision.policy_version,
    article_decision: decision.article_decision,
  };
}
