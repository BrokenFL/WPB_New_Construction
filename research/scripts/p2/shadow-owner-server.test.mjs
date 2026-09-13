import assert from "node:assert/strict";
import crypto from "node:crypto";
import test from "node:test";
import { configuredOwnerFromEnv } from "./shadow-owner-server.mjs";

function credentialJson() {
  const { privateKey } = crypto.generateKeyPairSync("rsa", { modulusLength: 2048 });
  return JSON.stringify({
    type: "service_account",
    client_email: "wpb-shadow@example.iam.gserviceaccount.com",
    private_key: privateKey.export({ type: "pkcs8", format: "pem" }),
  });
}

function env(overrides = {}) {
  return {
    P2_RUNTIME_ROOT: "/private/wpb-p2-runtime",
    P2_REVIEW_INBOX_DIR: "/private/wpb-p2-review-inbox",
    P2_DISPATCH_SECRET: "owner-secret-012345678901234567890",
    P2_GOOGLE_SERVICE_ACCOUNT_JSON: credentialJson(),
    P2_GOOGLE_AUTH_MODE: "service_account_json",
    P2_GOOGLE_SHEET_ID: "1gVDZbH632Gmghea2eCXZFvAvcyJrDj7o6zjsQsRJ6a8",
    P2_GOOGLE_SHEET_NAME: "Incoming_Intel",
    P2_REPO_ROOT: process.cwd(),
    ...overrides,
  };
}

test("configured shadow owner accepts only the fixed private Sheet target and strong dispatch secret", () => {
  const owner = configuredOwnerFromEnv({ env: env(), fetchImpl: async () => { throw new Error("not called during setup"); } });
  assert.equal(typeof owner.handle, "function");
  assert.throws(() => configuredOwnerFromEnv({ env: env({ P2_GOOGLE_SHEET_ID: "another-sheet" }) }), /ERR_SHADOW_OWNER_SHEET_TARGET/);
  assert.throws(() => configuredOwnerFromEnv({ env: env({ P2_DISPATCH_SECRET: "short" }) }), /ERR_SHADOW_OWNER_DISPATCH_SECRET/);
  assert.throws(() => configuredOwnerFromEnv({ env: env({ P2_RUNTIME_ROOT: "relative" }) }), /ERR_SHADOW_OWNER_PRIVATE_PATH/);
});
