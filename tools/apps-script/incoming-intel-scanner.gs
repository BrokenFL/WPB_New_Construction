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
 *   POLICY_VERSION      — e.g. "p2-policy-v1"
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
  "created_at"
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

function hmacHex(secret, text) {
  var bytes = Utilities.computeHmacSha256Signature(text, secret, Utilities.Charset.UTF_8);
  return bytes.map(function (b) { return ("0" + (b & 0xff).toString(16)).slice(-2); }).join("");
}

function fieldHash(row, headers, fields) {
  var parts = fields.map(function (f) {
    var i = headers.indexOf(f);
    return i < 0 ? "" : String(row[i] == null ? "" : row[i]);
  });
  return sha256Hex(parts.join(""));
}

function scanIncomingIntel() {
  var props = PropertiesService.getScriptProperties();
  var endpoint = props.getProperty("DISPATCH_ENDPOINT");
  var secret = props.getProperty("DISPATCH_SECRET");
  var policyVersion = props.getProperty("POLICY_VERSION") || "p2-policy-v1";
  if (!endpoint || !secret) throw new Error("DISPATCH_ENDPOINT/DISPATCH_SECRET not configured");

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  var values = sheet.getDataRange().getValues();
  var headers = values[0].map(String);
  var idCol = headers.indexOf("id");
  var typeCol = headers.indexOf("record_type");

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
    if (!rid) continue;
    var positions = positionsById[rid];
    var contentHash = fieldHash(row, headers, CONTENT_FIELDS);
    var evidenceHash = fieldHash(row, headers, EVIDENCE_FIELDS);
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
    if (typeCol >= 0 && String(row[typeCol] || "") !== "event") {
      quarantined.push({ intel_id: rid, positions: positions, reason: "record_type!=event" });
      continue;
    }
    var prior = props.getProperty(PROP_PREFIX + rid);
    var priorObj = prior ? JSON.parse(prior) : null;
    if (!priorObj || priorObj.content_hash !== contentHash || priorObj.evidence_hash !== evidenceHash) {
      changed.push(record);
    }
  }

  if (!changed.length && !quarantined.length) return { dispatched: 0 };

  var snapshotHash = sha256Hex(values.map(function (row) { return row.join(""); }).join("\n"));
  var envelope = {
    contract_version: "p2-dispatch-v1",
    dispatch_id: "disp-" + sha256Hex(snapshotHash + ":" + Date.now()).slice(0, 16),
    sheet_id: SpreadsheetApp.getActiveSpreadsheet().getId(),
    sheet_name: SHEET_NAME,
    snapshot_sha256: snapshotHash,
    policy_version: policyVersion,
    issued_at: new Date().toISOString(),
    nonce: Utilities.getUuid(),
    records: changed,
    quarantined: quarantined
  };
  envelope.signature = hmacHex(secret, JSON.stringify(envelope));

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
      if (resp.getResponseCode() === 200) {
        // Persist hashes only after durable acknowledgment.
        changed.forEach(function (rec) {
          props.setProperty(PROP_PREFIX + rec.intel_id, JSON.stringify({
            content_hash: rec.content_hash,
            evidence_hash: rec.evidence_hash
          }));
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
