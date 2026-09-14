import { processRow, sha256, stableJson } from "../intel/core.mjs";
import { buildRepositoryIndexes } from "../intel/repo-index.mjs";
import { decideFast, FAST_MODE_POLICY_VERSION } from "./fast-policy.mjs";
import { ingestFactCheckHandoff } from "./fact-check-handoff.mjs";
import { buildFastFactCheckPacket, FAST_FACT_CHECK_HANDOFF_VERSION, ingestFastFactCheckHandoff } from "./fast-fact-check.mjs";
import { toPhaseATrustedEvidence, DEFAULT_REVIEWER_VERSION } from "./evidence-review.mjs";
import {
  STORY_QUEUE_COLUMNS,
  STORY_QUEUE_SEED_WRITEBACK_COLUMNS,
  STORY_QUEUE_SHEET,
  STORY_STATUS,
  STORY_QUEUE_WRITEBACK_COLUMNS,
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

export const REQUIRED_INTEL_HEADERS = Object.freeze([
  "id", "status", "headline", "project_name", "record_type", "source_url",
  "category", "summary", "material_updates", "source_published_date",
  "event_date", "related_project_ids", "related_corridor_ids",
  "requires_human_review", "flags_json", "fact_proposals_json",
  "discovery_sources_json", "fact_check_handoff_json",
  ...INTEL_WRITEBACK_COLUMNS,
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
  "primary_source_url", "discovery_sources_json", "related_project_ids", "related_corridor_ids",
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

export function validateSheetHeaders(headers, expected, { exact = false, tab = "sheet" } = {}) {
  if (!Array.isArray(headers) || headers.some((header) => !String(header || "").trim())) {
    throw new Error(`ERR_SHEET_SCHEMA:${tab}:blank_header`);
  }
  const duplicates = [...new Set(headers.filter((header, index) => headers.indexOf(header) !== index))];
  if (duplicates.length) throw new Error(`ERR_SHEET_SCHEMA:${tab}:duplicate:${duplicates.join(",")}`);
  const missing = expected.filter((header) => !headers.includes(header));
  if (missing.length) throw new Error(`ERR_SHEET_SCHEMA:${tab}:missing:${missing.join(",")}`);
  if (exact && (headers.length !== expected.length || expected.some((header, index) => headers[index] !== header))) {
    throw new Error(`ERR_SHEET_SCHEMA:${tab}:header_order_or_extra_columns`);
  }
  return true;
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

function fetchedEvidenceCount(sources = []) {
  return sources.filter((source) => !source.error
    && source.retrieval_status === "fetched"
    && source.retrieval_attested === true
    && source.reachable === true).length;
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

const FACT_COMMIT_PENDING = "PENDING_COMMIT";
const FACT_COMMIT_COMPLETE = "COMMITTED";

function outputDecisionValue(decision, factState) {
  return `ARTICLE:${decision.article_decision}|FACT:${decision.fact_change_decision}|FACT_STATE:${factState}`;
}

function rowNeedsFactRetry(row) {
  const decision = String(row.output_decision || "");
  return decision.includes(`FACT_STATE:${FACT_COMMIT_PENDING}`)
    || decision.includes("PROCESS_STATE:REVIEW_RETRY");
}

function cellsForColumns(row, columns) {
  return Object.fromEntries(columns.map((column) => [column, row[column] ?? ""]));
}

function rawFactProposals(row) {
  for (const field of ["fact_proposals_json", "project_fact_proposals_json", "fact_proposal_json", "proposed_facts_json"]) {
    const raw = row[field];
    if (!String(raw || "").trim()) continue;
    try {
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      return Array.isArray(parsed) ? parsed : parsed && typeof parsed === "object" ? [parsed] : [];
    } catch {
      return [];
    }
  }
  return [];
}

function durableFactAlreadyPresent(indexes, row, intelId) {
  return rawFactProposals(row).some((proposal) => {
    const projectId = String(proposal.project_id || proposal.projectId || "").trim();
    const field = String(proposal.field || proposal.project_fact_field || "").trim();
    const value = Object.prototype.hasOwnProperty.call(proposal, "new_value") ? proposal.new_value : proposal.proposed_value;
    const entry = indexes?.reviewed_facts?.projects?.[projectId]?.[field];
    const expected = typeof value === "string" ? value : stableJson(value);
    return entry?.source === "automated_intel"
      && entry.intelId === intelId
      && entry.policyVersion === FAST_MODE_POLICY_VERSION
      && stableJson(entry.value) === stableJson(expected);
  });
}

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
  const createdStories = new Set();
  const reseededStories = new Set();
  const publishDirtyStories = new Set();
  const reopenedStoryIds = new Set();
  const pendingFactApplications = [];
  const pendingDecisionWritebacks = [];
  const pendingPublishedIntelWritebacks = [];

  const intel = valuesToRows(await sheets.readValues(INCOMING_INTEL_SHEET));
  validateSheetHeaders(intel.headers, REQUIRED_INTEL_HEADERS, { tab: INCOMING_INTEL_SHEET });
  // Validate Incoming_Intel before even creating/repairing Story_Queue so a
  // malformed intake tab causes no Sheet mutation.
  await sheets.ensureTab(STORY_QUEUE_SHEET, [...STORY_QUEUE_COLUMNS]);
  const queue = valuesToRows(await sheets.readValues(STORY_QUEUE_SHEET));
  validateSheetHeaders(queue.headers, STORY_QUEUE_COLUMNS, { exact: true, tab: STORY_QUEUE_SHEET });
  const stories = queue.rows;
  const indexesValue = indexes || await buildRepositoryIndexes(root);

  // ---- Pass A + B: intake rows ------------------------------------------
  const positionsById = new Map();
  for (const rawRow of intel.rows) {
    const id = String(rawRow.id || "").trim();
    if (!id) continue;
    const positions = positionsById.get(id) || [];
    positions.push(rawRow.__rowNumber);
    positionsById.set(id, positions);
  }
  const reportedQuarantineIds = new Set();
  for (const rawRow of intel.rows) {
    const rowNumber = rawRow.__rowNumber;
    const row = { ...rawRow };
    delete row.__rowNumber;
    const id = String(row.id || "").trim();
    if (!id) {
      results.push({ stage: "quarantined", quarantine_reason: "missing_id", row_numbers: [rowNumber] });
      cellUpdates.push(...writebackCells(intel.headers, rowNumber, {
        status: "quarantined", processed_at: startedAt, processor_version: FAST_MODE_POLICY_VERSION,
        output_decision: "QUARANTINE:MISSING_ID",
      }, INCOMING_INTEL_SHEET));
      continue;
    }
    const duplicatePositions = positionsById.get(id) || [];
    if (duplicatePositions.length > 1) {
      if (!reportedQuarantineIds.has(id)) {
        results.push({ intel_id: id, stage: "quarantined", quarantine_reason: "duplicate_id", row_numbers: duplicatePositions });
        for (const duplicateRowNumber of duplicatePositions) {
          cellUpdates.push(...writebackCells(intel.headers, duplicateRowNumber, {
            status: "quarantined", processed_at: startedAt, processor_version: FAST_MODE_POLICY_VERSION,
            output_decision: "QUARANTINE:DUPLICATE_ID",
          }, INCOMING_INTEL_SHEET));
        }
        reportedQuarantineIds.add(id);
      }
      continue;
    }
    const quarantine = quarantineReason(row);
    if (quarantine) {
      results.push({ intel_id: id, stage: "quarantined", quarantine_reason: quarantine, row_numbers: [rowNumber] });
      cellUpdates.push(...writebackCells(intel.headers, rowNumber, {
        status: "quarantined", processed_at: startedAt, processor_version: FAST_MODE_POLICY_VERSION,
        output_decision: `QUARANTINE:${quarantine.toUpperCase()}`,
      }, INCOMING_INTEL_SHEET));
      continue;
    }

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
      if (preliminary.report.errors.length) {
        const codes = preliminary.report.errors.map((error) => error.code);
        cellUpdates.push(...writebackCells(intel.headers, rowNumber, {
          status: "held",
          output_decision: `INTAKE_HOLD:${codes.join(",")}`,
          processed_at: startedAt,
          processor_version: FAST_MODE_POLICY_VERSION,
        }, INCOMING_INTEL_SHEET));
        results.push({ intel_id: id, stage: "held", reasons: codes });
        continue;
      }
      const fetchedCount = fetchedEvidenceCount(preliminary.verificationSources);
      if (!fetchedCount) {
        cellUpdates.push(...writebackCells(intel.headers, rowNumber, {
          status: "source_retry",
          output_decision: "SOURCE_RETRY:NO_FETCHED_SOURCE",
          processed_at: startedAt,
          processor_version: FAST_MODE_POLICY_VERSION,
        }, INCOMING_INTEL_SHEET));
        results.push({ intel_id: id, stage: "source_retry" });
        continue;
      }
      const packet = buildFastFactCheckPacket({ result: preliminary, policyVersion: FAST_MODE_POLICY_VERSION, reviewerVersion });
      cellUpdates.push(...writebackCells(intel.headers, rowNumber, {
        status: "awaiting_fact_check",
        p2_packet_json: JSON.stringify(packet),
        p2_row_sha256: packet.intake_snapshot_sha256,
        p2_event_key: packet.event_key,
        p2_content_hash: content_hash,
        processor_version: FAST_MODE_POLICY_VERSION,
      }, INCOMING_INTEL_SHEET));
      results.push({
        intel_id: id,
        stage: "awaiting_fact_check",
        event_key: packet.event_key,
        packet_emitted: true,
      });
      continue;
    }

    const hashesMatch = String(row.p2_content_hash || "") === content_hash
      && String(row.p2_evidence_hash || "") === evidence_hash;
    if (hashesMatch
      && String(row.output_decision || "").includes(`FACT_STATE:${FACT_COMMIT_PENDING}`)
      && durableFactAlreadyPresent(indexesValue, row, id)) {
      cellUpdates.push(...writebackCells(intel.headers, rowNumber, {
        output_decision: String(row.output_decision).replace(`FACT_STATE:${FACT_COMMIT_PENDING}`, `FACT_STATE:${FACT_COMMIT_COMPLETE}`),
        processed_at: startedAt,
        processor_version: FAST_MODE_POLICY_VERSION,
      }, INCOMING_INTEL_SHEET));
      results.push({ intel_id: id, stage: "fact_commit_reconciled" });
      continue;
    }
    if (hashesMatch && !rowNeedsFactRetry(row)) continue;

    // ---- decision pass ----
    // The intake snapshot must not include the verifier's own handoff cell or
    // any writeback/workflow columns — the packet's row hash was computed over
    // the stripped intake view before they existed.
    const intakeRow = intakeSnapshotRow(row);
    const sources = await safeFetchSources(fetchSources, row);
    const preliminary = processRow({ row: intakeRow, verificationSources: sources, indexes: indexesValue });
    if (!fetchedEvidenceCount(preliminary.verificationSources)) {
      cellUpdates.push(...writebackCells(intel.headers, rowNumber, {
        status: "source_retry",
        output_decision: "SOURCE_RETRY:NO_FETCHED_SOURCE",
        processed_at: startedAt,
        processor_version: FAST_MODE_POLICY_VERSION,
      }, INCOMING_INTEL_SHEET));
      results.push({ intel_id: id, stage: "source_retry" });
      continue;
    }
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
      review_retry: !boundReview.bound,
    };

    if (decision.article_decision === "AUTO_PUBLISH") {
      const { row: story, created, reused } = enqueueStory(stories, {
        eventKey: result.report.derived_event_key,
        intelIds: [id],
        fields: storySeedFields({ row, result, boundReview, decision }),
        now: new Date(now),
      });
      if (created) createdStories.add(story);
      else if (reused === "error_retry") {
        reseededStories.add(story);
        reopenedStoryIds.add(story.story_id);
      }
      storyActions.push({ action: created ? "queued_for_writer" : `reused_${reused}`, story_id: story.story_id, event_key: story.event_key });
      outcome.story_id = story.story_id;
    }

    // Facts are independent from the article decision.
    if (["AUTO_APPLY", "NEEDS_DECISION"].includes(decision.fact_change_decision) && decision.fact_mutations.length) {
      pendingFactApplications.push({ outcome, mutations: decision.fact_mutations, intelId: id });
    }

    pendingDecisionWritebacks.push({
      rowNumber,
      decision,
      outcome,
      content_hash,
      evidence_hash,
      retryPacket: !boundReview.bound
        ? buildFastFactCheckPacket({ result: preliminary, policyVersion: FAST_MODE_POLICY_VERSION, reviewerVersion })
        : null,
    });
    results.push(outcome);
  }

  // ---- Pass C: publish ready stories -------------------------------------
  // Re-read immediately before publishing so a writer update that landed
  // during intake processing is not overwritten from the stale snapshot.
  const freshQueue = valuesToRows(await sheets.readValues(STORY_QUEUE_SHEET));
  validateSheetHeaders(freshQueue.headers, STORY_QUEUE_COLUMNS, { exact: true, tab: STORY_QUEUE_SHEET });
  const publishedEventKeys = new Set(freshQueue.rows
    .filter((story) => story.status === STORY_STATUS.PUBLISHED)
    .map((story) => story.event_key));
  for (const story of freshQueue.rows) {
    if (![STORY_STATUS.READY_TO_PUBLISH, STORY_STATUS.ERROR].includes(story.status)) continue;
    if (reopenedStoryIds.has(story.story_id)) continue;
    if (publishedEventKeys.has(story.event_key)) {
      story.status = STORY_STATUS.DUPLICATE;
      story.error = "event already published by another story row";
      story.updated_at = new Date(now).toISOString();
      publishDirtyStories.add(story);
      publishActions.push({ story_id: story.story_id, ok: true, outcome: "deduplicated", deduplicated: true });
      continue;
    }
    const attempts = Number(story.publish_attempts || 0);
    if (attempts >= maxPublishAttempts) {
      story.status = STORY_STATUS.HELD;
      story.publish_status = "held_max_attempts";
      story.error = `maximum publish attempts reached (${maxPublishAttempts})`;
      story.updated_at = new Date(now).toISOString();
      publishDirtyStories.add(story);
      publishActions.push({ story_id: story.story_id, ok: true, outcome: "held", reason: "max_attempts" });
      continue;
    }
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
      publishActions.push({
        story_id: story.story_id,
        ok: true,
        outcome: "published",
        published: true,
        recovered: outcome.alreadyPublished === true,
        url: outcome.liveUrl,
      });
      const publishedAt = new Date(now).toISOString();
      for (const intelId of String(story.intel_ids || "").split(",").map((value) => value.trim()).filter(Boolean)) {
        const rowNumbers = positionsById.get(intelId) || [];
        if (rowNumbers.length !== 1) continue;
        pendingPublishedIntelWritebacks.push(...writebackCells(intel.headers, rowNumbers[0], {
          status: "published",
          site_update_id: `intel-${story.story_id}`,
          canonical_update_url: outcome.liveUrl || "",
          published_at: publishedAt,
        }, INCOMING_INTEL_SHEET));
      }
    } else if (outcome.retryable === false && outcome.disposition === "rewrite") {
      story.status = STORY_STATUS.READY_FOR_WRITER;
      story.publish_status = "needs_rewrite";
      story.error = String(outcome.error || "story package needs rewrite").slice(0, 500);
      publishActions.push({ story_id: story.story_id, ok: true, outcome: "rewrite", reason: story.error });
    } else if (outcome.retryable === false) {
      story.status = STORY_STATUS.HELD;
      story.publish_status = "held";
      story.error = String(outcome.error || "story is not publishable").slice(0, 500);
      publishActions.push({ story_id: story.story_id, ok: true, outcome: "held", reason: story.error });
    } else {
      story.status = STORY_STATUS.ERROR;
      story.publish_status = "error";
      story.error = String(outcome.error || "publish failed").slice(0, 500);
      publishActions.push({ story_id: story.story_id, ok: false, outcome: "retrying", error: story.error });
    }
    publishDirtyStories.add(story);
  }

  // Apply facts only after article publishing has finished. The existing
  // publisher requires a clean main checkout; writing the automated fact layer
  // first would make every ready story fail its clean-worktree preflight.
  for (const pending of pendingFactApplications) {
    const apply = applyFacts || defaultApplyFacts;
    const applied = await apply({ root, mutations: pending.mutations, intelId: pending.intelId, now: new Date(now) });
    pending.outcome.applied_facts = applied.applied || [];
    pending.outcome.skipped_facts = applied.skipped || [];
  }

  const factCommitWritebacks = [];
  for (const pending of pendingDecisionWritebacks) {
    const { decision, outcome } = pending;
    const applied = outcome.applied_facts || [];
    const skipped = outcome.skipped_facts || [];
    const hasDryRunSkip = skipped.some((item) => item.reason === "dry_run_no_fact_write");
    let factState = "NONE";
    if (applied.length || hasDryRunSkip) factState = FACT_COMMIT_PENDING;
    else if (decision.fact_mutations.length) factState = "RESOLVED_NO_COMMIT";
    else if (decision.fact_change_decision === "NEEDS_DECISION") factState = "HUMAN_REQUIRED";
    else if (decision.fact_change_decision === "HOLD") factState = "HELD";
    const outputDecision = `${outputDecisionValue(decision, factState)}${outcome.review_retry ? "|PROCESS_STATE:REVIEW_RETRY" : ""}`;
    outcome.fact_commit_state = factState;
    cellUpdates.push(...writebackCells(intel.headers, pending.rowNumber, {
      status: outcome.review_retry ? "awaiting_fact_check" : STATUS_BY_ARTICLE_DECISION[decision.article_decision] || "processed",
      output_decision: outputDecision,
      processed_at: startedAt,
      processor_version: FAST_MODE_POLICY_VERSION,
      ...(pending.retryPacket ? {
        p2_packet_json: JSON.stringify(pending.retryPacket),
        p2_row_sha256: pending.retryPacket.intake_snapshot_sha256,
        p2_event_key: pending.retryPacket.event_key,
      } : {}),
      p2_content_hash: pending.content_hash,
      p2_evidence_hash: pending.evidence_hash,
    }, INCOMING_INTEL_SHEET));
    if (factState === FACT_COMMIT_PENDING) {
      factCommitWritebacks.push({
        rowNumber: pending.rowNumber,
        columnIndex: intel.headers.indexOf("output_decision") + 1,
        value: outputDecision.replace(`FACT_STATE:${FACT_COMMIT_PENDING}`, `FACT_STATE:${FACT_COMMIT_COMPLETE}`),
      });
    }
  }
  cellUpdates.push(...pendingPublishedIntelWritebacks);

  // ---- persist Story_Queue changes ---------------------------------------
  const queueHeaders = freshQueue.headers;
  for (const story of createdStories) {
    if (story.story_id && story.event_key) await sheets.appendRow(STORY_QUEUE_SHEET, storyRowToCells(story));
  }
  for (const story of reseededStories) {
    if (!story.story_id || !story.event_key || !story.__rowNumber) continue;
    cellUpdates.push(...writebackCells(
      queueHeaders,
      story.__rowNumber,
      cellsForColumns(story, STORY_QUEUE_SEED_WRITEBACK_COLUMNS),
      STORY_QUEUE_SHEET,
    ));
  }
  for (const story of publishDirtyStories) {
    if (!story.story_id || !story.event_key || !story.__rowNumber) continue;
    cellUpdates.push(...writebackCells(
      queueHeaders,
      story.__rowNumber,
      cellsForColumns(story, STORY_QUEUE_WRITEBACK_COLUMNS),
      STORY_QUEUE_SHEET,
    ));
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
    ok: publishActions.every((action) => action.ok),
    contract_version: FAST_CYCLE_CONTRACT_VERSION,
    policy_version: FAST_MODE_POLICY_VERSION,
    results,
    storyActions,
    publishActions,
    factsChanged: results.some((result) => result.applied_facts?.length),
    factCommitWritebacks,
    story_queue_row_count: freshQueue.rows.length + createdStories.size,
    digest,
    digest_files: digestFiles,
  };
}
