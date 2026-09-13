/**
 * WPB Incoming_Intel change scanner — Apps Script source (NOT DEPLOYED).
 *
 * Design: a time-driven trigger every ~15 minutes calls scanIncomingIntel().
 * onEdit alone is NOT sufficient — API/script writes do not reliably fire it.
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
 *   DISPATCH_ENDPOINT   — private ingest URL on the runner
 *   DISPATCH_SECRET     — HMAC shared secret
 *   POLICY_VERSION      — e.g. "p2-shadow-policy-v2"
 */

var SHEET_NAME = "Incoming_Intel";
var SCAN_INTERVAL_MINUTES = 15;
var PROP_PREFIX = "p2scan:";

// Intake-authored fields (content hash).
var CONTENT_FIELDS = [
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
  "project_fact_new_value", "project_fact_effective_date"
];

// Reviewer/fact-check fields (evidence hash). Changes here re-dispatch for
// re-review but never alone authorize output.
var EVIDENCE_FIELDS = [
  "verification_status", "verification_summary", "review_notes"
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

function dispatchId(snapshotHash, records) {
  var ids = records.map(function (record) { return record.intel_id; }).sort();
  return "disp-" + sha256Hex(stableJson({
    snapshotSha256: snapshotHash,
    recordIds: ids
  })).slice(0, 16);
}

function validateAck(resp, expectedDispatchId) {
  if (!resp || resp.getResponseCode() !== 200) return false;
  var body;
  try { body = JSON.parse(resp.getContentText()); } catch (e) { return false; }
  return body && body.contract_version === "p2-dispatch-ack-v1" &&
    body.ok === true && body.durable === true && body.dispatch_id === expectedDispatchId;
}

function scanIncomingIntel() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) throw new Error("scan already in progress");
  try {
    return scanIncomingIntelLocked();
  } finally {
    lock.releaseLock();
  }
}

function scanIncomingIntelLocked() {
  var props = PropertiesService.getScriptProperties();
  var endpoint = props.getProperty("DISPATCH_ENDPOINT");
  var secret = props.getProperty("DISPATCH_SECRET");
  var policyVersion = props.getProperty("POLICY_VERSION") || "p2-shadow-policy-v2";
  if (!endpoint || !secret) throw new Error("DISPATCH_ENDPOINT/DISPATCH_SECRET not configured");

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  var values = sheet.getDataRange().getDisplayValues();
  if (!values.length) return { dispatched: 0 };
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
      quarantined.push({ intel_id: rid, positions: positions });
      continue; // ambiguous — never dispatched
    }
    if (String(row[typeCol] || "") !== "event") {
      quarantined.push({ intel_id: rid, positions: positions, reason: "record_type!=event" });
      continue;
    }
    var prior = props.getProperty(PROP_PREFIX + rid);
    var priorObj = prior ? JSON.parse(prior) : null;
    if (!priorObj || priorObj.content_hash !== contentHash || priorObj.evidence_hash !== evidenceHash) {
      changed.push(record);
    }
  }

  if (!changed.length) return { dispatched: 0, quarantined: quarantined.length };

  changed.sort(function (a, b) {
    return a.intel_id < b.intel_id ? -1 : a.intel_id > b.intel_id ? 1 : 0;
  });
  var sheetId = SpreadsheetApp.getActiveSpreadsheet().getId();
  var snapshotHash = dispatchSnapshotHash(sheetId, SHEET_NAME, changed);
  var envelope = {
    contract_version: "p2-dispatch-v1",
    dispatch_id: dispatchId(snapshotHash, changed),
    sheet_id: sheetId,
    sheet_name: SHEET_NAME,
    snapshot_sha256: snapshotHash,
    policy_version: policyVersion,
    issued_at: new Date().toISOString(),
    nonce: Utilities.getUuid(),
    records: changed
  };
  envelope.signature = hmacHex(secret, stableJson(envelope));

  // Bounded retries with durable ack: the runner returns the dispatch_id it
  // persisted; a retry of an already-acked dispatch is a no-op server-side.
  var attempts = 0;
  var maxAttempts = 3;
  while (attempts < maxAttempts) {
    attempts++;
    try {
      var resp = UrlFetchApp.fetch(endpoint, {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify(envelope),
        muteHttpExceptions: true
      });
      if (validateAck(resp, envelope.dispatch_id)) {
        // Persist only the version that was actually dispatched. A row may
        // have changed while the endpoint was processing the envelope.
        changed.forEach(function (rec) {
          var currentRow = sheet.getDataRange().getDisplayValues()[rec.record_position - 1];
          if (!currentRow) return;
          var currentId = String(currentRow[idCol] || "");
          var currentHashes = recordHashes(currentRow, headers);
          if (currentId === rec.intel_id &&
              currentHashes.content_hash === rec.content_hash &&
              currentHashes.evidence_hash === rec.evidence_hash) {
            props.setProperty(PROP_PREFIX + rec.intel_id, JSON.stringify({
              content_hash: rec.content_hash,
              evidence_hash: rec.evidence_hash
            }));
          }
        });
        return { dispatched: changed.length, quarantined: quarantined.length, attempts: attempts };
      }
    } catch (e) {
      // fall through to retry
    }
    Utilities.sleep(2000 * attempts);
  }
  throw new Error("dispatch failed after " + maxAttempts + " attempts");
}

// Install manually when activating — NOT installed by this source file:
//   ScriptApp.newTrigger("scanIncomingIntel").timeBased()
//     .everyMinutes(SCAN_INTERVAL_MINUTES).create();
