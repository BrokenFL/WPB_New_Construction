import assert from "node:assert/strict";
import crypto from "node:crypto";
import test from "node:test";
import { createGoogleMetadataAccessTokenProvider, createGoogleSheetsSnapshotProvider, GOOGLE_SHEETS_READ_SCOPE, valuesToCsv } from "./google-sheets-snapshot.mjs";

function credentials() {
  const { privateKey } = crypto.generateKeyPairSync("rsa", { modulusLength: 2048 });
  return {
    type: "service_account",
    client_email: "wpb-shadow@example.iam.gserviceaccount.com",
    private_key: privateKey.export({ type: "pkcs8", format: "pem" }),
    token_uri: "https://oauth2.googleapis.com/token",
  };
}

test("Google Sheets provider uses read-only service-account scope and returns display-value CSV", async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url: String(url), options });
    if (calls.length === 1) return { ok: true, json: async () => ({ access_token: "private-token", expires_in: 3600 }) };
    return { ok: true, json: async () => ({ values: [["id", "headline"], ["intel-1", "One, quoted"]] }) };
  };
  const provider = createGoogleSheetsSnapshotProvider({
    serviceAccountJson: credentials(),
    expectedSheetId: "sheet-1",
    fetchImpl,
    now: () => Date.parse("2026-09-13T15:00:00.000Z"),
  });
  const csv = await provider({ sheetId: "sheet-1", sheetName: "Incoming_Intel" });
  assert.equal(csv, 'id,headline\nintel-1,"One, quoted"');
  const assertion = new URLSearchParams(calls[0].options.body).get("assertion");
  const claims = JSON.parse(Buffer.from(assertion.split(".")[1], "base64url").toString("utf8"));
  assert.equal(claims.scope, GOOGLE_SHEETS_READ_SCOPE);
  assert.match(calls[1].url, /sheets\.googleapis\.com\/v4\/spreadsheets\/sheet-1\/values/);
  assert.equal(calls[1].options.headers.authorization, "Bearer private-token");
});

test("Google Sheets provider rejects a dispatch for another private Sheet before network access", async () => {
  let calls = 0;
  const provider = createGoogleSheetsSnapshotProvider({
    serviceAccountJson: credentials(),
    expectedSheetId: "sheet-1",
    fetchImpl: async () => { calls += 1; },
  });
  await assert.rejects(provider({ sheetId: "different-sheet", sheetName: "Incoming_Intel" }), /ERR_GOOGLE_SHEETS_TARGET/);
  assert.equal(calls, 0);
});

test("display-value CSV conversion rejects malformed or wider data rows", () => {
  assert.throws(() => valuesToCsv([]), /ERR_GOOGLE_SHEETS_VALUES/);
  assert.throws(() => valuesToCsv([["id"], ["one", "unexpected"]]), /ERR_GOOGLE_SHEETS_VALUES/);
});

test("Google Compute metadata auth avoids a long-lived service-account key", async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url: String(url), options });
    return { ok: true, json: async () => ({ access_token: "metadata-token", expires_in: 3600 }) };
  };
  const provider = createGoogleMetadataAccessTokenProvider({ fetchImpl, now: () => 1_000 });
  assert.equal(await provider(), "metadata-token");
  assert.equal(await provider(), "metadata-token");
  assert.equal(calls.length, 1);
  assert.match(calls[0].url, /metadata\.google\.internal/);
  assert.equal(calls[0].options.headers["metadata-flavor"], "Google");
});
