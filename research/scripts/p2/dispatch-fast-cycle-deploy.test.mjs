import assert from "node:assert/strict";
import test from "node:test";
import { dispatchAfterContentPush } from "./dispatch-fast-cycle-deploy.mjs";

const before = "a".repeat(40);
const after = "b".repeat(40);
const readRemote = () => `${after}\trefs/heads/main\n`;

test("deployment dispatch: unchanged main needs neither a token nor an API call", async () => {
  const result = await dispatchAfterContentPush({ triggerSha: before,
    readRemote: () => `${before}\trefs/heads/main\n`, request: () => assert.fail("Unexpected dispatch") });
  assert.deepEqual(result, { dispatched: false, remoteSha: before });
});

test("deployment dispatch: changed main uses the fixed workflow, main ref and job token once", async () => {
  for (const status of [204, 200]) {
    let calls = 0;
    const result = await dispatchAfterContentPush({ triggerSha: before, token: "fixture-token", readRemote,
      request: async (url, options) => {
        calls++;
        assert.equal(url, "https://api.github.com/repos/BrokenFL/WPB_New_Construction/actions/workflows/deploy-cloudflare-pages.yml/dispatches");
        assert.equal(options.method, "POST");
        assert.equal(options.redirect, "error");
        assert.equal(options.headers["Content-Type"], "application/json");
        assert.equal(options.headers.Authorization, "Bearer fixture-token");
        assert.equal(options.headers["X-GitHub-Api-Version"], "2022-11-28");
        assert.deepEqual(JSON.parse(options.body), { ref: "main" });
        assert.ok(options.signal instanceof AbortSignal);
        return { status };
      } });
    assert.equal(calls, 1);
    assert.deepEqual(result, { dispatched: true, remoteSha: after });
  }
});

test("deployment dispatch: invalid revisions and missing token fail before HTTP", async () => {
  for (const options of [
    { triggerSha: "", readRemote },
    { triggerSha: before, readRemote: () => "" },
    { triggerSha: before, readRemote: () => `${after}\trefs/heads/other` },
    { triggerSha: before, readRemote: () => `${after}\trefs/heads/main\n${before}\trefs/heads/main` },
    { triggerSha: before, readRemote },
  ]) await assert.rejects(dispatchAfterContentPush({ ...options, request: () => assert.fail("Unexpected HTTP") }));
});

test("deployment dispatch: denied, server and uncertain outcomes never retry or expose a token", async () => {
  for (const status of [403, 500, "network"]) {
    let calls = 0;
    await assert.rejects(dispatchAfterContentPush({ triggerSha: before, token: "private-fixture-token", readRemote,
      request: async () => { calls++; if (status === "network") throw new Error("private-fixture-token"); return { status }; } }),
    error => {
      assert.doesNotMatch(error.message, /private-fixture-token/);
      assert.match(error.message, status === "network" ? /outcome uncertain/ : new RegExp(`HTTP ${status}`));
      return true;
    });
    assert.equal(calls, 1);
  }
});
