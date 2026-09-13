import { processRow, sha256, stableJson } from "../intel/core.mjs";
import { buildRepositoryIndexes } from "../intel/repo-index.mjs";
import { decideFast, FAST_MODE_POLICY_VERSION } from "./fast-policy.mjs";
import { ingestFactCheckHandoff } from "./fact-check-handoff.mjs";
import { buildFastFactCheckPacket, FAST_FACT_CHECK_HANDOFF_VERSION, ingestFastFactCheckHandoff } from "./fast-fact-check.mjs";
import { toPhaseATrustedEvidence, DEFAULT_REVIEWER_VERSION } from "./evidence-review.mjs";
import {
  STORY_QUEUE_COLUMNS,
  STORY_QUEUE_SHEET,
  STORY_STATUS,
  enqueueStory,
  storyRowToCells,
  storySeedFields,
} from "./story-queue.mjs";
import { applyAutomatedFacts, readAutomatedFacts, readManualFacts, writeAutomatedFacts } from "./fast-facts.mjs";
import { buildFastDigest, writeFastDigest } from "./fast-digest.mjs";

export const FAST_CYCLE_CONTRACT_VERSION = "p2-fast-cycle-v1";
export const INCOMING_INTEL_SHEET = "Incoming_Intel";
export const MAX_PUBLISH_ATTEMPTS = 5;

// Writeback columns the cycle owns on Incoming_Intel. They extend the
// scanner's WRITEBACK_FIELDS and are excluded from change detection.
export const INTEL_WRITEBACK_COLUMNS = Object.freeze([
  "status", "processed_at", "processor_version", "output_decision",
  "site_update_id", "canonical_update_url", "published_at",
  "p2_packet_json", "p2_row_sha256", "p2_event_key",
  "p2_content_hash", "p2_evidence_hash",
]);

// Mirror of the scanner's intake/evidence field lists — keep in sync with
// tools/apps-script/incoming-intel-scanner.gs.
export const INTEL_CONTENT_FIELDS = Object.freeze([
  "id", "headline", "project_name", "related_project_slug", "corridor",
  "article_type", "category", "summary", "material_updates", "why_it_matters",
  "buyer_angle", "source_name", "source_url", "source_published_date",
  "source_quality", "confidence_score", "recommended_status", "flags_json",
  "requires_human_review", "article_body", "seo_title", "seo_description",
  "social_copy", "record_type", "event_key", "lead_source_url",
  "primary_source_url", "related_project_ids", "related_corridor_ids",
  "created_at", "event_date", "effective_date", "fact_proposals_json",
  "project_fact_proposals_json", "fact_proposal_json", "proposed_facts_json",
  "project_fact_field", "project_fact_project_id", "project_fact_old_value",
  "project_fact_new_value", "project_fact_effective_date",
]);
export const INTEL_EVIDENCE_FIELDS = Object.freeze([
  "verification_status", "verification_summary", "review_notes", "fact_check_handoff_json",
]);

export function intelRowHashes(row) {
  const pick = (fields) => Object.fromEntries(fields.map((field) => [field, String(row[field] ?? "")]));
  return {
    content_hash: sha256(stableJson(pick(INTEL_CONTENT_FIELDS))),
    evidence_hash: sha256(stableJson(pick(INTEL_EVIDENCE_FIELDS))),
  };
}

function valuesToRows(values) {
  if (!Array.isArray(values) || !values.length) return { headers: [], rows: [] };
  const headers = values[0].map(String);
  const rows = [];
  for (let index = 1; index < values.length; index += 1) {
    const cells = values[index] || [];
    const row = {};
    headers.forEach((header, column) => { row[header] = cells[column] ?? ""; });
    row.__rowNumber = index + 1;
    rows.push(row);
  }
  return { headers, rows };
}

function writebackCells(headers, rowNumber, values, tab) {
  const updates = [];
  for (const [name, value] of Object.entries(values)) {
    const columnIndex = headers.indexOf(name) + 1;
    if (columnIndex > 0) updates.push({ tab, rowNumber, columnIndex, value: value ?? "" });
  }
  return updates;
}

function quarantineReason(row) {
  if (!String(row.id || "").trim()) return "missing_id";
  if (String(row.record_type || "") !== "event") return "record_type!=event";
  for (const field of ["status", "headline", "category", "source_url"]) {
    if (!String(row[field] ?? "").trim()) return `missing:${field}`;
  }
  return null;
}

// Columns that are workflow state, not intake content. The intake snapshot
// hash must be stable across the packet -> handoff -> decision lifecycle, so
// processing always sees this stripped view (status normalized to the value
// it had at intake) and the handoff cell the verifier writes is excluded.
const WORKFLOW_STATE_COLUMNS = new Set([
  ...INTEL_WRITEBACK_COLUMNS,
  "processing_started_at", "claimed_by", "claim_token", "lease_expires_at",
  "last_updated", "pr_url", "fact_check_handoff_json",
]);

export function intakeSnapshotRow(row) {
  const cleaned = {};
  for (const [key, value] of Object.entries(row)) {
    if (!WORKFLOW_STATE_COLUMNS.has(key)) cleaned[key] = value;
  }
  cleaned.status = "new"; // status is workflow state; validateRow needs it non-empty
  return cleaned;
}

// Normalize v1/v2 ingest results into one bound-review shape for policy use.
function normalizeBoundReview(ingest) {
  if (!ingest?.bound) return { bound: false, code: ingest?.code || "ERR_FACT_CHECK_HANDOFF_MALFORMED", claims_all_supported: false };
  const bundle = ingest.bundle;
  return {
    bound: true,
    review_bundle_sha256: bundle?.review_bundle_sha256 || ingest.evidence_bundle_sha256,
    claims_all_supported: ingest.claims_all_supported ?? ingest.validation?.claims_all_supported ?? false,
    bundle,
    provenance: ingest.validation?.provenance || null,
  };
}

function ingestHandoff({ handoff, preliminary, row, reviewerVersion, now }) {
  const base = {
    expectedClaims: preliminary.claims,
    expectedSources: preliminary.verificationSources,
    intelId: row.id,
    intakeSnapshotSha256: preliminary.report.row_sha256,
    eventKey: preliminary.report.derived_event_key,
    policyVersion: FAST_MODE_POLICY_VERSION,
    reviewerVersion,
    now,
  };
  const ingest = handoff?.contract_version === FAST_FACT_CHECK_HANDOFF_VERSION
    ? ingestFastFactCheckHandoff({ handoff, ...base })
    : ingestFactCheckHandoff({ handoff, ...base });
  return { ingest, boundReview: normalizeBoundReview(ingest) };
}

async function safeFetchSources(fetchSources, row) {
  if (typeof fetchSources !== "function") return [];
  try { return await fetchSources(row); } catch { return []; }
}

async function defaultApplyFacts({ root, mutations, intelId, now }) {
  const automated = await readAutomatedFacts(root, FAST_MODE_POLICY_VERSION);
  const manual = await readManualFacts(root);
  const outcome = applyAutomatedFacts({ automated, manual, mutations, intelId, now });
  if (outcome.changed) await writeAutomatedFacts(root, outcome.automated);
  return outcome;
}

const STATUS_BY_ARTICLE_DECISION = Object.freeze({
  AUTO_PUBLISH: "queued_writer",
  DUPLICATE: "duplicate",
  HOLD: "held",
  NEEDS_DECISION: "needs_decision",
});

/**
 * One full Fast Mode cycle. All side effects go through injected providers:
 *   sheets.readValues(tab) / sheets.updateCells(tab, updates) /
 *   sheets.appendRow(tab, cells) / sheets.ensureTab(tab, headers)
 *   fetchSources(row) -> verification sources for processRow
 *   publish(story) -> { ok, liveUrl, commitSha, error }
 *   applyFacts({root, mutations, intelId, now}) -> { changed, applied, skipped }
 *     (default writes project-fact-automated.json; regeneration/commit is the
 *     caller's job via the returned `factsChanged` flag)
 */
export async function runFastCycle({
  root,
  sheets,
  indexes,
  fetchSources,
  publish,
  applyFacts,
  reviewerVersion = DEFAULT_REVIEWER_VERSION,
  now = Date.now(),
  maxPublishAttempts = MAX_PUBLISH_ATTEMPTS,
} = {}) {
  const startedAt = new Date(now).toISOString();
  const results = [];
  const storyActions = [];
  const publishActions = [];
  const cellUpdates = [];
  const dirtyStories = new Set();

  await sheets.ensureTab(STORY_QUEUE_SHEET, [...STORY_QUEUE_COLUMNS]);

  const intel = valuesToRows(await sheets.readValues(INCOMING_INTEL_SHEET));
  const queue = valuesToRows(await sheets.readValues(STORY_QUEUE_SHEET));
  const stories = queue.rows;
  const indexesValue = indexes || await buildRepositoryIndexes(root);

  // ---- Pass A + B: intake rows ------------------------------------------
  const seenIds = new Set();
  for (const rawRow of intel.rows) {
    const rowNumber = rawRow.__rowNumber;
    const row = { ...rawRow };
    delete row.__rowNumber;
    const id = String(row.id || "").trim();
    if (!id || seenIds.has(id)) continue;
    seenIds.add(id);
    if (quarantineReason(row)) continue;

    const { content_hash, evidence_hash } = intelRowHashes(row);
    const hasHandoff = String(row.fact_check_handoff_json || "").trim().length > 0;

    if (!hasHandoff) {
      // Packet already emitted for this exact content — wait for the verifier.
      if (String(row.p2_content_hash || "") === content_hash && String(row.p2_packet_json || "").trim()) {
        results.push({ intel_id: id, stage: "awaiting_fact_check", event_key: String(row.p2_event_key || "") });
        continue;
      }
      const sources = await safeFetchSources(fetchSources, row);
      const preliminary = processRow({ row: intakeSnapshotRow(row), verificationSources: sources, indexes: indexesValue });
      const packet = buildFastFactCheckPacket({ result: preliminary, policyVersion: FAST_MODE_POLICY_VERSION, reviewerVersion });
      cellUpdates.push(...writebackCells(intel.headers, rowNumber, {
        status: "awaiting_fact_check",
        p2_packet_json: JSON.stringify(packet),
        p2_row_sha256: packet.intake_snapshot_sha256,
        p2_event_key: packet.event_key,
        p2_content_hash: content_hash,
        processor_version: FAST_MODE_POLICY_VERSION,
      }, INCOMING_INTEL_SHEET));
      results.push({ intel_id: id, stage: "awaiting_fact_check", event_key: packet.event_key });
      continue;
    }

    if (String(row.p2_content_hash || "") === content_hash && String(row.p2_evidence_hash || "") === evidence_hash) continue;

    // ---- decision pass ----
    // The intake snapshot must not include the verifier's own handoff cell or
    // any writeback/workflow columns — the packet's row hash was computed over
    // the stripped intake view before they existed.
    const intakeRow = intakeSnapshotRow(row);
    const sources = await safeFetchSources(fetchSources, row);
    const preliminary = processRow({ row: intakeRow, verificationSources: sources, indexes: indexesValue });
    let handoff = null;
    try { handoff = JSON.parse(row.fact_check_handoff_json); } catch { handoff = null; }
    const { ingest, boundReview } = handoff
      ? ingestHandoff({ handoff, preliminary, row: intakeRow, reviewerVersion, now })
      : { ingest: null, boundReview: { bound: false, code: "ERR_FACT_CHECK_HANDOFF_MALFORMED", claims_all_supported: false } };

    const result = boundReview.bound
      ? processRow({ row: intakeRow, verificationSources: sources, indexes: indexesValue, trustedEvidence: toPhaseATrustedEvidence(boundReview.bundle, preliminary.verificationSources) })
      : preliminary;
    if (handoff && !boundReview.bound) result.report.warnings.push({ code: boundReview.code, message: ingest?.errors?.join("; ") || "fact-check handoff rejected" });

    const decision = decideFast({ row: intakeRow, result, boundReview });
    const outcome = {
      intel_id: id,
      stage: "decided",
      event_key: result.report.derived_event_key,
      article_decision: decision.article_decision,
      fact_change_decision: decision.fact_change_decision,
      reasons: decision.reasons,
    };

    if (decision.article_decision === "AUTO_PUBLISH") {
      const { row: story, created, reused } = enqueueStory(stories, {
        eventKey: result.report.derived_event_key,
        intelIds: [id],
        fields: storySeedFields({ row, result, boundReview, decision }),
        now: new Date(now),
      });
      dirtyStories.add(story);
      storyActions.push({ action: created ? "queued_for_writer" : `reused_${reused}`, story_id: story.story_id, event_key: story.event_key });
      outcome.story_id = story.story_id;
    }

    // Facts are independent from the article decision.
    if (decision.fact_change_decision === "AUTO_APPLY" && decision.fact_mutations.length) {
      const apply = applyFacts || defaultApplyFacts;
      const applied = await apply({ root, mutations: decision.fact_mutations, intelId: id, now: new Date(now) });
      outcome.applied_facts = applied.applied;
      outcome.skipped_facts = applied.skipped;
    }

    cellUpdates.push(...writebackCells(intel.headers, rowNumber, {
      status: STATUS_BY_ARTICLE_DECISION[decision.article_decision] || "processed",
      output_decision: `ARTICLE:${decision.article_decision}|FACT:${decision.fact_change_decision}`,
      processed_at: startedAt,
      processor_version: FAST_MODE_POLICY_VERSION,
      p2_content_hash: content_hash,
      p2_evidence_hash: evidence_hash,
    }, INCOMING_INTEL_SHEET));
    results.push(outcome);
  }

  // ---- Pass C: publish ready stories -------------------------------------
  const publishedEventKeys = new Set(stories.filter((story) => story.status === STORY_STATUS.PUBLISHED).map((story) => story.event_key));
  for (const story of stories) {
    if (![STORY_STATUS.READY_TO_PUBLISH, STORY_STATUS.ERROR].includes(story.status)) continue;
    if (publishedEventKeys.has(story.event_key)) {
      story.status = STORY_STATUS.DUPLICATE;
      story.error = "event already published by another story row";
      story.updated_at = new Date(now).toISOString();
      dirtyStories.add(story);
      publishActions.push({ story_id: story.story_id, ok: true, deduplicated: true });
      continue;
    }
    const attempts = Number(story.publish_attempts || 0);
    if (attempts >= maxPublishAttempts) continue;
    if (typeof publish !== "function") continue;
    const outcome = await publish({ root, story });
    story.publish_attempts = String(attempts + 1);
    story.updated_at = new Date(now).toISOString();
    if (outcome.ok) {
      story.status = STORY_STATUS.PUBLISHED;
      story.publish_status = "published";
      story.published_url = outcome.liveUrl || "";
      story.commit_sha = outcome.commitSha || "";
      story.error = "";
      publishedEventKeys.add(story.event_key);
      publishActions.push({ story_id: story.story_id, ok: true, url: outcome.liveUrl });
    } else {
      story.status = STORY_STATUS.ERROR;
      story.publish_status = "error";
      story.error = String(outcome.error || "publish failed").slice(0, 500);
      publishActions.push({ story_id: story.story_id, ok: false, error: story.error });
    }
    dirtyStories.add(story);
  }

  // ---- persist Story_Queue changes ---------------------------------------
  const queueHeaders = queue.headers.length ? queue.headers : [...STORY_QUEUE_COLUMNS];
  for (const story of dirtyStories) {
    if (!story.story_id || !story.event_key) continue;
    const cells = storyRowToCells(story);
    if (story.__rowNumber) {
      const updates = {};
      cells.forEach((value, index) => { updates[STORY_QUEUE_COLUMNS[index]] = value; });
      cellUpdates.push(...writebackCells(queueHeaders, story.__rowNumber, updates, STORY_QUEUE_SHEET));
    } else {
      await sheets.appendRow(STORY_QUEUE_SHEET, cells);
    }
  }

  // Flush cell updates grouped per tab.
  if (cellUpdates.length) {
    const byTab = new Map();
    for (const update of cellUpdates) {
      const list = byTab.get(update.tab) || [];
      list.push({ rowNumber: update.rowNumber, columnIndex: update.columnIndex, value: update.value });
      byTab.set(update.tab, list);
    }
    for (const [tab, list] of byTab) await sheets.updateCells(tab, list);
  }

  const digest = buildFastDigest({ results, storyActions, publishActions, generatedAt: startedAt });
  const digestFiles = await writeFastDigest(root, digest);
  return {
    ok: true,
    contract_version: FAST_CYCLE_CONTRACT_VERSION,
    policy_version: FAST_MODE_POLICY_VERSION,
    results,
    storyActions,
    publishActions,
    factsChanged: results.some((result) => result.applied_facts?.length),
    digest,
    digest_files: digestFiles,
  };
}
