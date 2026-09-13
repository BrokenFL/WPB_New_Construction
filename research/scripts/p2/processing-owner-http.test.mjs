import assert from "node:assert/strict";
import test from "node:test";
import { createProcessingOwnerServer } from "./processing-owner-http.mjs";

async function serverFor(t, owner) {
  const server = createProcessingOwnerServer({ owner });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => server.close());
  return `http://127.0.0.1:${server.address().port}`;
}

test("processing-owner HTTP boundary exposes non-sensitive health and forwards JSON dispatch", async (t) => {
  let received;
  const base = await serverFor(t, { handle: async (envelope) => {
    received = envelope;
    return { status: 200, body: { contract_version: "p2-dispatch-ack-v1", ok: true, durable: true, dispatch_id: envelope.dispatch_id } };
  } });
  const health = await fetch(`${base}/healthz`);
  assert.equal(health.status, 200);
  assert.deepEqual(await health.json(), { contract_version: "p2-shadow-owner-v1", ok: true, mode: "shadow", release_disabled: true });
  const response = await fetch(`${base}/v1/intel-shadow/dispatch`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ dispatch_id: "disp-http" }),
  });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).durable, true);
  assert.deepEqual(received, { dispatch_id: "disp-http" });
});

test("processing-owner HTTP boundary rejects wrong routes, content types, and invalid JSON", async (t) => {
  const base = await serverFor(t, { handle: async () => { throw new Error("must not run"); } });
  assert.equal((await fetch(`${base}/other`)).status, 404);
  assert.equal((await fetch(`${base}/v1/intel-shadow/dispatch`, { method: "POST", body: "{}" })).status, 415);
  assert.equal((await fetch(`${base}/v1/intel-shadow/dispatch`, { method: "POST", headers: { "content-type": "application/json" }, body: "{" })).status, 400);
});
