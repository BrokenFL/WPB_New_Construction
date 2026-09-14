/**
 * WPB Incoming_Intel change scanner — Apps Script source (NOT DEPLOYED).
 *
 * Manual diagnostic helper only. GitHub Actions `Intel Fast Cycle` remains the
 * only processor. The separately installed `fast-cycle-wakeup.gs` dispatches
 * the reliable 15-minute wake without reading Sheet rows.
 *
 * Change detection uses two per-record hashes stored in Script Properties:
 *   content_hash  — intake-authored fields only
 *   evidence_hash — reviewer/fact-check fields only
 * Processor writeback fields are excluded from both so our own writeback can
 * never self-trigger a new dispatch.
 *
 * Ambiguous IDs and invalid records are quarantined (reported, never selected);
 * unrelated valid records remain eligible. Dispatches carry identifiers and
 * hashes only — never private research text or credentials.
 *
 * Required Script Properties (set manually, never committed):
 *   SCANNER_MODE        — "test" (no network) or "shadow" (dispatch only)
 *   SHEET_ID            — expected private spreadsheet ID
 *   POLICY_VERSION      — "p2-fast-policy-v1" for Fast Mode
 *   DISPATCH_ENDPOINT   — private ingest URL on the runner (shadow only)
 *   DISPATCH_SECRET     — HMAC shared secret (shadow only; 32+ chars)
 *
 * Test mode is the safe installation check: it reads and validates the
 * configured tab, computes the exact would-dispatch envelope, records health,
 * and performs no POST or hash acknowledgment. There is no release mode.
 */

var SHEET_NAME = "Incoming_Intel";
var PROP_PREFIX = "p2scan:";
var HEALTH_PROPERTY = PROP_PREFIX + "health";
var MIN_SECRET_LENGTH = 32;
var REQUIRED_EVENT_FIELDS = ["id", "status", "headline", "record_type", "category", "source_url"];

// Intake-authored fields (content hash).
var CONTENT_FIELDS = [
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
  "project_fact_new_value", "project_fact_effective_date"
];

// Reviewer/fact-check fields (evidence hash). Changes here re-dispatch for
// re-review but never alone authorize output.
var EVIDENCE_FIELDS = [
  "verification_status", "verification_summary", "review_notes",
  "fact_check_handoff_json"
];

// Processor writeback fields — excluded from change detection entirely so a
// writeback can never self-trigger another scan/dispatch cycle.
var WRITEBACK_FIELDS = [
  "status", "processed_at", "pr_url", "output_decision", "site_update_id",
  "canonical_update_url", "published_at", "processor_version",
  "processing_started_at", "claimed_by", "claim_token", "lease_expires_at",
  "last_updated"
];

function sha256Hex(text) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text, Utilities.Charset.UTF_8);
  return bytes.map(function (b) { return ("0" + (b & 0xff).toString(16)).slice(-2); }).join("");
}

// Stable JSON is deliberately small and ES5-compatible so the same payload
// hashes can be reproduced by the Node-side contract tests/processor.
function stableJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return "[" + value.map(stableJson).join(",") + "]";
  return "{" + Object.keys(value).sort().map(function (key) {
    return JSON.stringify(key) + ":" + stableJson(value[key]);
  }).join(",") + "}";
}

function hmacHex(secret, text) {
  var bytes = Utilities.computeHmacSha256Signature(text, secret, Utilities.Charset.UTF_8);
  return bytes.map(function (b) { return ("0" + (b & 0xff).toString(16)).slice(-2); }).join("");
}

function fieldHash(row, headers, fields) {
  var named = {};
  fields.forEach(function (f) {
    var i = headers.indexOf(f);
    named[f] = i < 0 ? "" : String(row[i] == null ? "" : row[i]);
  });
  return sha256Hex(stableJson(named));
}

function recordHashes(row, headers) {
  return {
    content_hash: fieldHash(row, headers, CONTENT_FIELDS),
    evidence_hash: fieldHash(row, headers, EVIDENCE_FIELDS)
  };
}

function dispatchSnapshotHash(sheetId, sheetName, records) {
  var sorted = records.slice().sort(function (a, b) {
    return a.intel_id < b.intel_id ? -1 : a.intel_id > b.intel_id ? 1 : 0;
  });
  return sha256Hex(stableJson({
    sheet_id: sheetId,
    sheet_name: sheetName,
    records: sorted
  }));
}

function dispatchId(snapshotHash, records, policyVersion) {
  var ids = records.map(function (record) { return record.intel_id; }).sort();
  return "disp-" + sha256Hex(stableJson({
    snapshotSha256: snapshotHash,
    recordIds: ids,
    policyVersion: policyVersion
  })).slice(0, 16);
}

function validateAck(resp, expectedDispatchId) {
  if (!resp || resp.getResponseCode() !== 200) return false;
  var body;
  try { body = JSON.parse(resp.getContentText()); } catch (e) { return false; }
  return body && body.contract_version === "p2-dispatch-ack-v1" &&
    body.ok === true && body.durable === true && body.dispatch_id === expectedDispatchId;
}

function scannerConfig(props, actualSheetId) {
  var mode = String(props.getProperty("SCANNER_MODE") || "test").toLowerCase();
  if (mode !== "test" && mode !== "shadow") throw new Error("SCANNER_MODE must be test or shadow");
  var expectedSheetId = String(props.getProperty("SHEET_ID") || "");
  if (!expectedSheetId || expectedSheetId !== actualSheetId) throw new Error("SHEET_ID does not match active spreadsheet");
  var policyVersion = String(props.getProperty("POLICY_VERSION") || "");
  if (!policyVersion) throw new Error("POLICY_VERSION not configured");
  var endpoint = String(props.getProperty("DISPATCH_ENDPOINT") || "");
  var secret = String(props.getProperty("DISPATCH_SECRET") || "");
  if (mode === "shadow") {
    // Keep credentials and ambiguous/whitespace-bearing URLs out of the
    // network boundary. Apps Script's URL parser is not exposed as a strict
    // validation primitive, so accept only an ordinary HTTPS origin/path.
    if (!/^https:\/\/[A-Za-z0-9.-]+(?::[0-9]+)?(?:[/?#]|$)/i.test(endpoint) || /\s|@/.test(endpoint)) {
      throw new Error("DISPATCH_ENDPOINT must be a credential-free HTTPS URL in shadow mode");
    }
    if (secret.length < MIN_SECRET_LENGTH) throw new Error("DISPATCH_SECRET must be at least 32 characters in shadow mode");
  }
  return { mode: mode, endpoint: endpoint, secret: secret, policyVersion: policyVersion };
}

function healthErrorCode(error) {
  var message = String(error && error.message || error || "unknown");
  if (/configured|SCANNER_MODE|SHEET_ID|POLICY_VERSION|HTTPS|characters/.test(message)) return "configuration_error";
  if (/missing required|header|partial/.test(message)) return "schema_error";
  if (/dispatch failed|ack/.test(message)) return "dispatch_error";
  if (/already in progress/.test(message)) return "busy";
  return "runtime_error";
}

function writeHealth(props, values) {
  var previous = {};
  try { previous = JSON.parse(props.getProperty(HEALTH_PROPERTY) || "{}"); } catch (e) { previous = {}; }
  var health = {
    status: values.status || previous.status || "unknown",
    mode: values.mode || previous.mode || null,
    last_scan_at: values.last_scan_at || previous.last_scan_at || null,
    last_success_at: values.last_success_at || previous.last_success_at || null,
    last_error_code: values.last_error_code || null,
    dispatched: Number(values.dispatched == null ? previous.dispatched || 0 : values.dispatched),
    would_dispatch: Number(values.would_dispatch == null ? previous.would_dispatch || 0 : values.would_dispatch),
    quarantined: Number(values.quarantined == null ? previous.quarantined || 0 : values.quarantined),
    stale: Number(values.stale == null ? previous.stale || 0 : values.stale),
    attempts: Number(values.attempts == null ? previous.attempts || 0 : values.attempts)
  };
  props.setProperty(HEALTH_PROPERTY, JSON.stringify(health));
  return health;
}

function getScannerHealth() {
  var raw = PropertiesService.getScriptProperties().getProperty(HEALTH_PROPERTY);
  if (!raw) return { status: "never_run", mode: null, last_scan_at: null, last_success_at: null, last_error_code: null, dispatched: 0, would_dispatch: 0, quarantined: 0, stale: 0, attempts: 0 };
  try { return JSON.parse(raw); } catch (e) { return { status: "health_corrupt" }; }
}

function missingRequiredFields(row, headers) {
  return REQUIRED_EVENT_FIELDS.filter(function (field) {
    var index = headers.indexOf(field);
    return index < 0 || String(row[index] == null ? "" : row[index]).trim() === "";
  });
}

function scanIncomingIntel() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) {
    writeHealth(PropertiesService.getScriptProperties(), { status: "busy", last_scan_at: new Date().toISOString(), last_error_code: "busy" });
    throw new Error("scan already in progress");
  }
  try {
    var result = scanIncomingIntelLocked();
    var now = new Date().toISOString();
    writeHealth(PropertiesService.getScriptProperties(), {
      status: result.mode === "test" ? "test_ok" : "ok",
      mode: result.mode,
      last_scan_at: now,
      last_success_at: now,
      last_error_code: null,
      dispatched: result.dispatched || 0,
      would_dispatch: result.would_dispatch || 0,
      quarantined: result.quarantined || 0,
      stale: result.stale || 0,
      attempts: result.attempts || 0
    });
    return result;
  } catch (error) {
    writeHealth(PropertiesService.getScriptProperties(), {
      status: "error",
      last_scan_at: new Date().toISOString(),
      last_error_code: healthErrorCode(error)
    });
    throw error;
  } finally {
    lock.releaseLock();
  }
}

function scanIncomingIntelLocked() {
  var props = PropertiesService.getScriptProperties();
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheetId = spreadsheet.getId();
  var config = scannerConfig(props, sheetId);

  var sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error("Incoming_Intel sheet tab not found");
  var values = sheet.getDataRange().getDisplayValues();
  if (!values.length) return { mode: config.mode, dispatched: 0, would_dispatch: 0, quarantined: 0 };
  var headers = values[0].map(String);
  var idCol = headers.indexOf("id");
  var typeCol = headers.indexOf("record_type");
  if (idCol < 0) throw new Error("Incoming_Intel is missing required id header");
  if (typeCol < 0) throw new Error("Incoming_Intel is missing required record_type header");

  // Pass 1: index IDs across ALL records. Ambiguous IDs are quarantined as a
  // set — never silently resolved to first or last.
  var positionsById = {};
  for (var r = 1; r < values.length; r++) {
    var id = String(values[r][idCol] || "");
    if (!id) continue;
    (positionsById[id] = positionsById[id] || []).push(r + 1); // 1-based incl. header
  }

  var changed = [];
  var quarantined = [];
  for (var r2 = 1; r2 < values.length; r2++) {
    var row = values[r2];
    var rid = String(row[idCol] || "");
    if (!rid) {
      quarantined.push({ intel_id: null, positions: [r2 + 1], reason: "missing_id" });
      continue;
    }
    var positions = positionsById[rid];
    var hashes = recordHashes(row, headers);
    var contentHash = hashes.content_hash;
    var evidenceHash = hashes.evidence_hash;
    var record = {
      intel_id: rid,
      record_position: r2 + 1,
      content_hash: contentHash,
      evidence_hash: evidenceHash
    };
    if (positions.length > 1) {
      quarantined.push({ intel_id: rid, positions: positions, reason: "duplicate_id" });
      continue; // ambiguous — never dispatched
    }
    if (String(row[typeCol] || "") !== "event") {
      quarantined.push({ intel_id: rid, positions: positions, reason: "record_type!=event" });
      continue;
    }
    var missing = missingRequiredFields(row, headers);
    if (missing.length) {
      quarantined.push({ intel_id: rid, positions: positions, reason: "partial_row", missing_fields: missing });
      continue;
    }
    var prior = props.getProperty(PROP_PREFIX + rid);
    var priorObj = null;
    try { priorObj = prior ? JSON.parse(prior) : null; } catch (e) { priorObj = null; }
    if (!priorObj || priorObj.content_hash !== contentHash || priorObj.evidence_hash !== evidenceHash || priorObj.policy_version !== config.policyVersion) {
      changed.push(record);
    }
  }

  if (!changed.length) return { mode: config.mode, dispatched: 0, would_dispatch: 0, quarantined: quarantined.length };

  changed.sort(function (a, b) {
    return a.intel_id < b.intel_id ? -1 : a.intel_id > b.intel_id ? 1 : 0;
  });
  var snapshotHash = dispatchSnapshotHash(sheetId, SHEET_NAME, changed);
  var envelope = {
    contract_version: "p2-dispatch-v1",
    dispatch_id: dispatchId(snapshotHash, changed, config.policyVersion),
    sheet_id: sheetId,
    sheet_name: SHEET_NAME,
    snapshot_sha256: snapshotHash,
    policy_version: config.policyVersion,
    issued_at: new Date().toISOString(),
    nonce: Utilities.getUuid(),
    records: changed
  };
  envelope.signature = hmacHex(config.secret || "test-mode-no-dispatch", stableJson(envelope));

  if (config.mode === "test") {
    return {
      mode: "test",
      dispatched: 0,
      would_dispatch: changed.length,
      quarantined: quarantined.length,
      snapshot_sha256: snapshotHash,
      dispatch_id: envelope.dispatch_id
    };
  }

  // Bounded retries with durable ack: the runner returns the dispatch_id it
  // persisted; a retry of an already-acked dispatch is a no-op server-side.
  var attempts = 0;
  var maxAttempts = 3;
  while (attempts < maxAttempts) {
    attempts++;
    try {
      var resp = UrlFetchApp.fetch(config.endpoint, {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify(envelope),
        muteHttpExceptions: true
      });
      if (validateAck(resp, envelope.dispatch_id)) {
        // Persist only the version that was actually dispatched. A row may
        // have changed while the endpoint was processing the envelope.
        var stale = 0;
        changed.forEach(function (rec) {
          var currentRow = sheet.getDataRange().getDisplayValues()[rec.record_position - 1];
          if (!currentRow) { stale++; return; }
          var currentId = String(currentRow[idCol] || "");
          var currentHashes = recordHashes(currentRow, headers);
          if (currentId === rec.intel_id &&
              currentHashes.content_hash === rec.content_hash &&
              currentHashes.evidence_hash === rec.evidence_hash) {
            props.setProperty(PROP_PREFIX + rec.intel_id, JSON.stringify({
              content_hash: rec.content_hash,
              evidence_hash: rec.evidence_hash,
              policy_version: config.policyVersion
            }));
          } else stale++;
        });
        return { mode: "shadow", dispatched: changed.length, quarantined: quarantined.length, stale: stale, attempts: attempts };
      }
    } catch (e) {
      // fall through to retry
    }
    Utilities.sleep(2000 * attempts);
  }
  throw new Error("dispatch failed after " + maxAttempts + " attempts");
}

// ---------------------------------------------------------------------------
// Story_Queue — publication pickup scanner (Fast Mode, p2-fast-policy-v1)
//
// An optional manual diagnostic/wake-up can call scanBothQueues(), which runs
// the Incoming_Intel scan and the Story_Queue scan under one lock. Story_Queue
// rows are dispatched when the writer marks status="ready_to_publish" or a
// prior publish attempt failed (status="error") — the processor owns retry
// bookkeeping, the scanner only signals "this story row needs a cycle".
// ---------------------------------------------------------------------------

var STORY_SHEET_NAME = "Story_Queue";
var STORY_PROP_PREFIX = "p2story:";

// Authoritative Story_Queue schema — keep in sync with
// research/scripts/p2/story-queue.mjs STORY_QUEUE_COLUMNS.
var STORY_QUEUE_COLUMNS = [
  "story_id", "status", "created_at", "updated_at", "intel_ids", "event_key",
  "project_ids", "corridor_ids", "headline", "deck", "summary",
  "article_body", "seo_title", "seo_description", "social_copy",
  "sources_json", "verified_facts_json", "qualified_facts_json",
  "canonical_fact_proposals_json", "story_package_json",
  "writer_name", "writer_version", "policy_version", "article_decision",
  "publish_status", "published_url", "commit_sha", "error", "publish_attempts"
];

// Story fields that constitute publishable content. Status and publish-*
// columns are workflow state and excluded so publisher writeback cannot
// self-trigger another dispatch.
var STORY_CONTENT_FIELDS = [
  "headline", "deck", "summary", "article_body", "seo_title",
  "seo_description", "social_copy", "story_package_json",
  "verified_facts_json", "qualified_facts_json", "sources_json",
  "canonical_fact_proposals_json", "writer_name", "writer_version"
];

// Story statuses that mean "the processor should look at this row now".
var STORY_ACTIONABLE = { ready_to_publish: true, error: true };

/**
 * Idempotent Story_Queue tab installer/validator. Creates the tab with the
 * exact schema header if absent; verifies the header matches when present.
 * Safe to run manually from the editor or from scan setup — it never touches
 * existing data rows.
 */
function ensureStoryQueueTab() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(STORY_SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(STORY_SHEET_NAME);
    sheet.getRange(1, 1, 1, STORY_QUEUE_COLUMNS.length)
      .setValues([STORY_QUEUE_COLUMNS.slice()]);
    sheet.setFrozenRows(1);
    return { created: true, headerWritten: true, rows: 0 };
  }
  var existing = sheet.getRange(1, 1, 1, STORY_QUEUE_COLUMNS.length).getDisplayValues()[0];
  var mismatch = [];
  STORY_QUEUE_COLUMNS.forEach(function (column, index) {
    if (String(existing[index] || "") !== column) mismatch.push({ index: index + 1, expected: column, actual: existing[index] });
  });
  if (mismatch.length) {
    throw new Error("Story_Queue header mismatch — refusing to alter existing data: " + JSON.stringify(mismatch));
  }
  return { created: false, headerWritten: false, rows: Math.max(0, sheet.getLastRow() - 1) };
}

function scanStoryQueue() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) {
    throw new Error("story scan already in progress");
  }
  try {
    return scanStoryQueueLocked();
  } finally {
    lock.releaseLock();
  }
}

function scanStoryQueueLocked() {
  var props = PropertiesService.getScriptProperties();
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheetId = spreadsheet.getId();
  var config = scannerConfig(props, sheetId);

  var sheet = spreadsheet.getSheetByName(STORY_SHEET_NAME);
  if (!sheet) return { mode: config.mode, queue: "story", dispatched: 0, would_dispatch: 0, note: "Story_Queue tab absent" };
  var values = sheet.getDataRange().getDisplayValues();
  if (values.length < 2) return { mode: config.mode, queue: "story", dispatched: 0, would_dispatch: 0 };
  var headers = values[0].map(String);
  var idCol = headers.indexOf("story_id");
  var statusCol = headers.indexOf("status");
  var eventCol = headers.indexOf("event_key");
  if (idCol < 0 || statusCol < 0 || eventCol < 0) throw new Error("Story_Queue missing story_id/status/event_key headers");

  var changed = [];
  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    var sid = String(row[idCol] || "");
    var status = String(row[statusCol] || "");
    if (!sid || !STORY_ACTIONABLE[status]) continue;
    var contentHash = fieldHash(row, headers, STORY_CONTENT_FIELDS);
    var record = {
      story_id: sid,
      event_key: String(row[eventCol] || ""),
      status: status,
      record_position: r + 1,
      content_hash: contentHash
    };
    var priorKey = STORY_PROP_PREFIX + sid;
    var priorObj = null;
    try { priorObj = JSON.parse(props.getProperty(priorKey) || "null"); } catch (e) { priorObj = null; }
    if (!priorObj || priorObj.content_hash !== contentHash || priorObj.status !== status) {
      changed.push(record);
    }
  }

  if (!changed.length) return { mode: config.mode, queue: "story", dispatched: 0, would_dispatch: 0 };

  changed.sort(function (a, b) {
    return a.story_id < b.story_id ? -1 : a.story_id > b.story_id ? 1 : 0;
  });
  var snapshotHash = sha256Hex(stableJson({ sheet_id: sheetId, sheet_name: STORY_SHEET_NAME, records: changed }));
  var envelope = {
    contract_version: "p2-story-dispatch-v1",
    dispatch_id: "story-" + dispatchId(snapshotHash, changed.map(function (rec) {
      return { intel_id: rec.story_id };
    }), config.policyVersion),
    sheet_id: sheetId,
    sheet_name: STORY_SHEET_NAME,
    snapshot_sha256: snapshotHash,
    policy_version: config.policyVersion,
    issued_at: new Date().toISOString(),
    nonce: Utilities.getUuid(),
    records: changed
  };
  envelope.signature = hmacHex(config.secret || "test-mode-no-dispatch", stableJson(envelope));

  if (config.mode === "test") {
    return { mode: "test", queue: "story", dispatched: 0, would_dispatch: changed.length, dispatch_id: envelope.dispatch_id };
  }

  var attempts = 0;
  var maxAttempts = 3;
  while (attempts < maxAttempts) {
    attempts++;
    try {
      var resp = UrlFetchApp.fetch(config.endpoint, {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify(envelope),
        muteHttpExceptions: true
      });
      if (validateAck(resp, envelope.dispatch_id)) {
        var stale = 0;
        changed.forEach(function (rec) {
          var currentRow = sheet.getDataRange().getDisplayValues()[rec.record_position - 1];
          if (!currentRow) { stale++; return; }
          if (String(currentRow[idCol] || "") === rec.story_id &&
              String(currentRow[statusCol] || "") === rec.status &&
              fieldHash(currentRow, headers, STORY_CONTENT_FIELDS) === rec.content_hash) {
            props.setProperty(STORY_PROP_PREFIX + rec.story_id, JSON.stringify({
              content_hash: rec.content_hash,
              status: rec.status
            }));
          } else stale++;
        });
        return { mode: "shadow", queue: "story", dispatched: changed.length, stale: stale, attempts: attempts };
      }
    } catch (e) {
      // fall through to retry
    }
    Utilities.sleep(2000 * attempts);
  }
  throw new Error("story dispatch failed after " + maxAttempts + " attempts");
}

/** Optional manual diagnostic for both queues. Never install it as a trigger. */
function scanBothQueues() {
  var intel = scanIncomingIntel();
  var story;
  try { story = scanStoryQueue(); } catch (e) { story = { error: String(e && e.message || e) }; }
  return { incoming_intel: intel, story_queue: story };
}
