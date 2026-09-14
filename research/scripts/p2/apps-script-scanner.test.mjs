import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { bindSnapshotToDispatch, verifyDispatch } from "./dispatch.mjs";

const source = [
  fs.readFileSync("tools/apps-script/incoming-intel-scanner.gs", "utf8"),
  fs.readFileSync("tools/apps-script/fast-cycle-wakeup.gs", "utf8"),
].join("\n");
const SECRET = "scanner-test-secret-012345678901234567890";
const HEADERS = ["id", "status", "headline", "record_type", "category", "source_url", "verification_status", "review_notes", "last_updated", "fact_check_handoff_json"];

function eventRow(id = "intel-1", headline = "Original", status = "queued") {
  return [id, status, headline, "event", "development", "https://example.com/source", "", "", "", ""];
}

function load(overrides = {}) {
  const state = {
    props: new Map([
      ["SCANNER_MODE", "test"],
      ["SHEET_ID", "sheet-1"],
      ["POLICY_VERSION", "p2-shadow-policy-v2"],
    ]),
    rows: [
      HEADERS,
      eventRow(),
    ],
    posts: 0,
    triggers: [],
    ...overrides,
  };
  const lock = { tryLock: () => true, releaseLock() {} };
  const sheet = {
    getDataRange: () => ({ getDisplayValues: () => state.rows.map((row) => [...row]) }),
  };
  const spreadsheet = {
    getSheetByName: () => sheet,
    getId: () => "sheet-1",
  };
  const bytes = (input) => [...input];
  const Utilities = {
    DigestAlgorithm: { SHA_256: "sha256" },
    Charset: { UTF_8: "utf8" },
    computeDigest: (_algorithm, text) => bytes(crypto.createHash("sha256").update(text).digest()),
    computeHmacSha256Signature: (text, secret) => bytes(crypto.createHmac("sha256", secret).update(text).digest()),
    getUuid: () => "nonce-1",
    sleep() {},
  };
  const context = {
    console,
    Utilities,
    LockService: { getScriptLock: () => lock },
    PropertiesService: { getScriptProperties: () => ({
      getProperty: (key) => state.props.get(key) ?? null,
      setProperty: (key, value) => state.props.set(key, value),
    }) },
    SpreadsheetApp: { getActiveSpreadsheet: () => spreadsheet },
    ScriptApp: {
      getProjectTriggers: () => state.triggers,
      deleteTrigger: (trigger) => { state.triggers = state.triggers.filter((item) => item !== trigger); },
      newTrigger: (handler) => ({
        timeBased: () => ({
          everyMinutes: (minutes) => ({
            create: () => {
              const trigger = { getHandlerFunction: () => handler, getUniqueId: () => `trigger-${minutes}` };
              state.triggers.push(trigger);
              return trigger;
            },
          }),
        }),
      }),
    },
    UrlFetchApp: { fetch: (...args) => {
      state.posts += 1;
      if (state.onFetch) state.onFetch(state, args);
      return state.response || {
        getResponseCode: () => 200,
        getContentText: () => JSON.stringify({
          contract_version: "p2-dispatch-ack-v1", ok: true, durable: true, dispatch_id: state.dispatchId,
        }),
      };
    } },
    ...overrides.context,
  };
  vm.runInNewContext(source, context, { filename: "incoming-intel-scanner.gs" });
  return { state, context };
}

test("stableJson and named field hashes are stable and exclude writeback fields", () => {
  const { context } = load();
  assert.equal(context.stableJson({ z: 1, a: [2, { d: true, c: null }] }), '{"a":[2,{"c":null,"d":true}],"z":1}');
  const headers = ["id", "headline", "status"];
  const before = context.fieldHash(["i", "Same", "queued"], headers, ["id", "headline"]);
  const after = context.fieldHash(["i", "Same", "processed"], headers, ["id", "headline"]);
  assert.equal(before, after);
  const evidenceBefore = context.fieldHash(["", ""], ["review_notes", "fact_check_handoff_json"], context.EVIDENCE_FIELDS);
  const evidenceAfter = context.fieldHash(["", "{\"contract_version\":\"p2-fact-check-handoff-v1\"}"], ["review_notes", "fact_check_handoff_json"], context.EVIDENCE_FIELDS);
  assert.notEqual(evidenceBefore, evidenceAfter);
});

test("Apps Script envelope verifies against the Node dispatch contract", () => {
  const { state, context } = load();
  state.props.set("SCANNER_MODE", "shadow");
  state.props.set("DISPATCH_ENDPOINT", "https://runner.invalid");
  state.props.set("DISPATCH_SECRET", SECRET);
  context.UrlFetchApp.fetch = (_url, options) => {
    state.envelope = JSON.parse(options.payload);
    return {
      getResponseCode: () => 200,
      getContentText: () => JSON.stringify({ contract_version: "p2-dispatch-ack-v1", ok: true, durable: true, dispatch_id: state.envelope.dispatch_id }),
    };
  };
  context.scanIncomingIntel();
  assert.equal(verifyDispatch({ envelope: state.envelope, secret: SECRET }).ok, true);
  const csv = "id,status,headline,record_type,category,source_url,verification_status,review_notes,last_updated,fact_check_handoff_json\nintel-1,queued,Original,event,development,https://example.com/source,,,,";
  assert.equal(bindSnapshotToDispatch({ dispatch: state.envelope, snapshotCsv: csv }).ok, true);
  assert.equal(Object.prototype.hasOwnProperty.call(state.envelope, "quarantined"), false);
});

test("duplicate, partial, and non-event records are quarantined without a POST", () => {
  const { state, context } = load({
    rows: [
      ["id", "record_type", "headline"],
      ["dup", "event", "A"],
      ["dup", "event", "B"],
      ["", "event", "Partial edit"],
      ["note", "note", "N"],
    ],
  });
  state.props.set("SCANNER_MODE", "shadow");
  state.props.set("DISPATCH_ENDPOINT", "https://runner.invalid");
  state.props.set("DISPATCH_SECRET", SECRET);
  const result = context.scanIncomingIntel();
  assert.equal(result.dispatched, 0);
  assert.equal(result.quarantined, 4);
  assert.equal(state.posts, 0);
});

test("duplicate IDs are quarantined while an unrelated valid event continues", () => {
  const { state, context } = load({
    rows: [
      HEADERS,
      eventRow("dup", "A"),
      eventRow("dup", "B"),
      eventRow("valid", "Valid event"),
    ],
  });
  state.props.set("SCANNER_MODE", "shadow");
  state.props.set("DISPATCH_ENDPOINT", "https://runner.invalid");
  state.props.set("DISPATCH_SECRET", SECRET);
  context.UrlFetchApp.fetch = (_url, options) => {
    const envelope = JSON.parse(options.payload);
    state.envelope = envelope;
    return {
      getResponseCode: () => 200,
      getContentText: () => JSON.stringify({ contract_version: "p2-dispatch-ack-v1", ok: true, durable: true, dispatch_id: envelope.dispatch_id }),
    };
  };
  const result = context.scanIncomingIntel();
  assert.equal(result.dispatched, 1);
  assert.equal(result.quarantined, 2);
  assert.equal(state.envelope.records[0].intel_id, "valid");
});

test("missing record_type schema fails closed before dispatch", () => {
  const { state, context } = load({ rows: [["id", "headline"], ["intel-1", "Partial"]] });
  state.props.set("SCANNER_MODE", "shadow");
  state.props.set("DISPATCH_ENDPOINT", "https://runner.invalid");
  state.props.set("DISPATCH_SECRET", SECRET);
  assert.throws(() => context.scanIncomingIntel(), /missing required record_type header/);
  assert.equal(state.posts, 0);
});

test("bad ack is rejected and does not persist hashes", () => {
  const { state, context } = load();
  state.props.set("SCANNER_MODE", "shadow");
  state.props.set("DISPATCH_ENDPOINT", "https://runner.invalid");
  state.props.set("DISPATCH_SECRET", SECRET);
  state.response = { getResponseCode: () => 200, getContentText: () => JSON.stringify({ ok: true }) };
  assert.throws(() => context.scanIncomingIntel(), /dispatch failed after 3 attempts/);
  assert.equal(state.posts, 3);
  assert.equal(state.props.has("p2scan:intel-1"), false);
});

test("changed row after durable ack is not marked as processed", () => {
  const { state, context } = load();
  state.props.set("SCANNER_MODE", "shadow");
  state.props.set("DISPATCH_ENDPOINT", "https://runner.invalid");
  state.props.set("DISPATCH_SECRET", SECRET);
  state.onFetch = (current) => {
    current.rows[1][2] = "Changed while processing";
    current.response = {
      getResponseCode: () => 200,
      getContentText: () => JSON.stringify({
        contract_version: "p2-dispatch-ack-v1", ok: true, durable: true, dispatch_id: current.dispatchId,
      }),
    };
  };
  // The fetch callback needs the content-derived ID calculated by the scanner.
  const originalFetch = context.UrlFetchApp.fetch;
  context.UrlFetchApp.fetch = (...args) => {
    state.dispatchId = JSON.parse(args[1].payload).dispatch_id;
    const result = originalFetch(...args);
    return result;
  };
  const result = context.scanIncomingIntel();
  assert.equal(result.dispatched, 1);
  assert.equal(result.stale, 1);
  assert.equal(state.props.has("p2scan:intel-1"), false);
});

test("test mode never POSTs or acknowledges hashes and exposes health", () => {
  const { state, context } = load();
  const result = context.scanIncomingIntel();
  assert.equal(result.mode, "test");
  assert.equal(result.would_dispatch, 1);
  assert.equal(result.dispatched, 0);
  assert.equal(state.posts, 0);
  assert.equal(state.props.has("p2scan:intel-1"), false);
  assert.equal(context.getScannerHealth().status, "test_ok");
});

test("event rows missing Phase A required fields are quarantined", () => {
  const { state, context } = load({ rows: [HEADERS, eventRow("partial", "", "queued").map((value, index) => index === 5 ? "" : value)] });
  const result = context.scanIncomingIntel();
  assert.equal(result.would_dispatch, 0);
  assert.equal(result.quarantined, 1);
  assert.equal(state.posts, 0);
});

test("shadow mode rejects weak secrets and records configuration health", () => {
  const { state, context } = load();
  state.props.set("SCANNER_MODE", "shadow");
  state.props.set("DISPATCH_ENDPOINT", "https://runner.invalid");
  state.props.set("DISPATCH_SECRET", "short");
  assert.throws(() => context.scanIncomingIntel(), /at least 32 characters/);
  assert.equal(context.getScannerHealth().last_error_code, "configuration_error");
});

test("shadow mode rejects malformed or credential-bearing dispatch endpoints", () => {
  for (const endpoint of ["https://", "https://user@example.com/dispatch", "https://runner.invalid/has space", "http://runner.invalid/dispatch"]) {
    const { state, context } = load();
    state.props.set("SCANNER_MODE", "shadow");
    state.props.set("DISPATCH_ENDPOINT", endpoint);
    state.props.set("DISPATCH_SECRET", SECRET);
    assert.throws(() => context.scanIncomingIntel(), /credential-free HTTPS URL/);
    assert.equal(state.posts, 0);
  }
});

test("policy version changes force a new dispatch instead of reusing an old acknowledgment", () => {
  const { state, context } = load();
  state.props.set("SCANNER_MODE", "shadow");
  state.props.set("DISPATCH_ENDPOINT", "https://runner.invalid/dispatch");
  state.props.set("DISPATCH_SECRET", SECRET);
  const ids = [];
  context.UrlFetchApp.fetch = (_url, options) => {
    const envelope = JSON.parse(options.payload);
    ids.push(envelope.dispatch_id);
    return {
      getResponseCode: () => 200,
      getContentText: () => JSON.stringify({ contract_version: "p2-dispatch-ack-v1", ok: true, durable: true, dispatch_id: envelope.dispatch_id }),
    };
  };
  assert.equal(context.scanIncomingIntel().dispatched, 1);
  assert.equal(context.scanIncomingIntel().dispatched, 0);
  state.props.set("POLICY_VERSION", "p2-shadow-policy-v3");
  assert.equal(context.scanIncomingIntel().dispatched, 1);
  assert.equal(ids.length, 2);
  assert.notEqual(ids[0], ids[1]);
});

test("15-minute wake sends only a repository_dispatch to the Fast Cycle workflow", () => {
  const { state, context } = load();
  state.props.set("GITHUB_DISPATCH_TOKEN", "github-token-kept-in-script-properties");
  context.UrlFetchApp.fetch = (url, options) => {
    state.wake = { url, options };
    return { getResponseCode: () => 204, getContentText: () => "" };
  };
  const result = context.wakeIntelFastCycle();
  assert.equal(result.ok, true);
  assert.equal(state.wake.url, "https://api.github.com/repos/BrokenFL/WPB_New_Construction/dispatches");
  assert.deepEqual(JSON.parse(state.wake.options.payload), {
    event_type: "wpb-intel-scan",
    client_payload: {
      source: "apps-script-15-minute-wake",
      requested_at: JSON.parse(state.props.get("p2wake:health")).last_attempt_at,
    },
  });
  assert.match(state.wake.options.headers.Authorization, /^Bearer /);
  assert.equal(state.wake.options.payload.includes("github-token"), false);
  assert.equal(context.getFastCycleWakeHealth().status, "ok");
});

test("wake trigger installation is idempotent and targets only the wake handler", () => {
  const { state, context } = load();
  state.props.set("GITHUB_DISPATCH_TOKEN", "github-token-kept-in-script-properties");
  const first = context.installFastCycleWakeupTrigger();
  const second = context.installFastCycleWakeupTrigger();
  assert.equal(first.cadence_minutes, 15);
  assert.equal(second.replaced, 1);
  assert.equal(state.triggers.length, 1);
  assert.equal(state.triggers[0].getHandlerFunction(), "wakeIntelFastCycle");
});

test("wake fails closed without a Script Property token or on a non-204 response", () => {
  const missing = load();
  assert.throws(() => missing.context.wakeIntelFastCycle(), /not configured/);
  assert.equal(missing.state.posts, 0);

  const rejected = load();
  rejected.state.props.set("GITHUB_DISPATCH_TOKEN", "github-token-kept-in-script-properties");
  rejected.context.UrlFetchApp.fetch = () => ({ getResponseCode: () => 403, getContentText: () => "forbidden" });
  assert.throws(() => rejected.context.wakeIntelFastCycle(), /HTTP 403/);
  assert.equal(rejected.context.getFastCycleWakeHealth().error_code, "github_dispatch_rejected");
});
