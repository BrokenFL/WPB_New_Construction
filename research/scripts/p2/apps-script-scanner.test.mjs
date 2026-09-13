import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { bindSnapshotToDispatch, verifyDispatch } from "./dispatch.mjs";

const source = fs.readFileSync("tools/apps-script/incoming-intel-scanner.gs", "utf8");

function load(overrides = {}) {
  const state = {
    props: new Map(),
    rows: [
      ["id", "record_type", "headline", "status"],
      ["intel-1", "event", "Original", "queued"],
    ],
    posts: 0,
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
});

test("Apps Script envelope verifies against the Node dispatch contract", () => {
  const { state, context } = load();
  state.props.set("DISPATCH_ENDPOINT", "https://runner.invalid");
  state.props.set("DISPATCH_SECRET", "secret");
  context.UrlFetchApp.fetch = (_url, options) => {
    state.envelope = JSON.parse(options.payload);
    return {
      getResponseCode: () => 200,
      getContentText: () => JSON.stringify({ contract_version: "p2-dispatch-ack-v1", ok: true, durable: true, dispatch_id: state.envelope.dispatch_id }),
    };
  };
  context.scanIncomingIntel();
  assert.equal(verifyDispatch({ envelope: state.envelope, secret: "secret" }).ok, true);
  const csv = "id,record_type,headline,status\nintel-1,event,Original,queued";
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
  state.props.set("DISPATCH_ENDPOINT", "https://runner.invalid");
  state.props.set("DISPATCH_SECRET", "secret");
  const result = context.scanIncomingIntel();
  assert.equal(result.dispatched, 0);
  assert.equal(result.quarantined, 4);
  assert.equal(state.posts, 0);
});

test("missing record_type schema fails closed before dispatch", () => {
  const { state, context } = load({ rows: [["id", "headline"], ["intel-1", "Partial"]] });
  state.props.set("DISPATCH_ENDPOINT", "https://runner.invalid");
  state.props.set("DISPATCH_SECRET", "secret");
  assert.throws(() => context.scanIncomingIntel(), /missing required record_type header/);
  assert.equal(state.posts, 0);
});

test("bad ack is rejected and does not persist hashes", () => {
  const { state, context } = load();
  state.props.set("DISPATCH_ENDPOINT", "https://runner.invalid");
  state.props.set("DISPATCH_SECRET", "secret");
  state.response = { getResponseCode: () => 200, getContentText: () => JSON.stringify({ ok: true }) };
  assert.throws(() => context.scanIncomingIntel(), /dispatch failed after 3 attempts/);
  assert.equal(state.posts, 3);
  assert.equal(state.props.has("p2scan:intel-1"), false);
});

test("changed row after durable ack is not marked as processed", () => {
  const { state, context } = load();
  state.props.set("DISPATCH_ENDPOINT", "https://runner.invalid");
  state.props.set("DISPATCH_SECRET", "secret");
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
  assert.equal(state.props.has("p2scan:intel-1"), false);
});
