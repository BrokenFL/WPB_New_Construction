import assert from "node:assert/strict";
import crypto from "node:crypto";
import test from "node:test";
import { classifySource, fetchPublic, resolvePublicAddresses, verifySourceHint } from "./source-verifier.mjs";
import { isPrivateOrReservedAddress, normalizeVerificationSources, safeHttpUrl } from "./normalizer.mjs";

const headers = (values = {}) => new Headers(values);
const stubResponse = ({ status = 200, body = "public source body", url, values = { "content-type": "text/html" } } = {}) => ({
  status,
  url,
  headers: headers({ ...values, "content-length": String(Buffer.byteLength(body)) }),
  text: async () => body,
});

test("classification uses exact host boundaries and ignores source labels", () => {
  assert.equal(classifySource("https://relatedross.com/story", "claimed city record").source_tier, 1);
  assert.equal(classifySource("https://sub.relatedross.com/story").source_tier, 1);
  assert.equal(classifySource("https://evilrelatedross.com/story").source_tier, 3);
  assert.equal(classifySource("https://relatedross.com.evil/story").source_tier, 3);
  assert.equal(classifySource("https://example.com/story", "Official Tier 1").source_tier, 3);
});

test("safe URL policy rejects credentials and private/transition address forms", () => {
  for (const url of [
    "file:///etc/passwd",
    "https://user:pass@example.com/story",
    "http://127.0.0.1/story",
    "http://10.0.0.1/story",
    "http://169.254.169.254/latest",
    "http://[::1]/story",
    "http://[fc00::1]/story",
    "http://[::ffff:8.8.8.8]/story",
    "http://[2002:c000:0204::1]/story",
  ]) assert.equal(safeHttpUrl(url), null, url);
  assert.equal(isPrivateOrReservedAddress("8.8.8.8"), false);
  assert.equal(safeHttpUrl("https://example.com/story"), "https://example.com/story");
});

test("HTTP success and matching text remain unadjudicated and cannot carry claimed support", async () => {
  let calls = 0;
  const body = "South Flagler House reaches the roofline.";
  const result = await verifySourceHint({
    url: "https://example.com/story",
    claims_supported: ["claim-forged"],
    fetchImpl: async () => { calls += 1; return stubResponse({ body }); },
    accessed_at: "2026-09-10T12:00:00Z",
  });
  assert.equal(calls, 1);
  assert.equal(result.reachable, true);
  assert.equal(result.http_status, 200);
  assert.equal(result.verification_status, "unadjudicated");
  assert.equal(result.verified, false);
  assert.deepEqual(result.claims_supported, []);
  assert.equal(result.content_hash, crypto.createHash("sha256").update(body).digest("hex"));
  assert.equal(result.retrieval_status, "fetched");
  assert.equal(result.retrieval_attested, true);
});

test("unsafe redirects are rejected before a private target is fetched", async () => {
  let calls = 0;
  const result = await verifySourceHint({
    url: "https://example.com/start",
    fetchImpl: async () => {
      calls += 1;
      return { status: 302, headers: headers({ location: "http://127.0.0.1/private" }), text: async () => "" };
    },
  });
  assert.equal(calls, 1);
  assert.equal(result.verification_error, "ERR_UNSAFE_SOURCE");
  assert.equal(result.claims_supported.length, 0);
});

test("redirects are bounded and reclassified at the final host", async () => {
  let calls = 0;
  const result = await verifySourceHint({
    url: "https://relatedross.com/start",
    maxRedirects: 1,
    fetchImpl: async (url) => {
      calls += 1;
      return stubResponse({ status: 302, url, body: "", values: { location: "https://example.com/next" } });
    },
  });
  assert.equal(calls, 2);
  assert.equal(result.verification_error, "ERR_SOURCE_REDIRECT_LIMIT");
  assert.equal(result.claims_supported.length, 0);
});

test("a safe redirect changes provenance tier and preserves the original hint", async () => {
  let calls = 0;
  const body = "final public source";
  const result = await verifySourceHint({
    url: "https://relatedross.com/start",
    fetchImpl: async (url) => {
      calls += 1;
      if (calls === 1) return stubResponse({ status: 302, url, body: "", values: { location: "https://example.com/final" } });
      return stubResponse({ status: 200, url, body });
    },
  });
  assert.equal(result.source_tier, 3);
  assert.equal(result.source_type, "aggregator");
  assert.equal(result.url, "https://example.com/final");
  assert.equal(result.hint_url, "https://relatedross.com/start");
});

test("a persisted redirect snapshot is classified from its final URL", () => {
  const [source] = normalizeVerificationSources([{
    url: "https://relatedross.com/start",
    final_url: "https://example.com/final",
    source_tier: 1,
    source_type: "developer",
  }], { classifySource });
  assert.equal(source.url, "https://example.com/final");
  assert.equal(source.hint_url, "https://relatedross.com/start");
  assert.equal(source.source_tier, 3);
  assert.equal(source.source_type, "aggregator");
});

test("timeouts and oversized responses fail closed", async () => {
  const timeout = await verifySourceHint({
    url: "https://example.com/slow",
    timeoutMs: 10,
    fetchImpl: () => new Promise(() => {}),
  });
  assert.equal(timeout.verification_error, "ERR_SOURCE_TIMEOUT");
  const oversized = await verifySourceHint({
    url: "https://example.com/large",
    maxBytes: 4,
    fetchImpl: async () => ({ status: 200, headers: headers({ "content-length": "5" }), text: async () => "12345" }),
  });
  assert.equal(oversized.verification_error, "ERR_SOURCE_TOO_LARGE");
  const slowStream = await verifySourceHint({
    url: "https://example.com/stream",
    timeoutMs: 10,
    fetchImpl: async () => ({
      status: 200,
      headers: headers(),
      body: {
        async *[Symbol.asyncIterator]() {
          yield Buffer.from("part");
          await new Promise((resolve) => setTimeout(resolve, 50));
          yield Buffer.from("late");
        },
      },
    }),
  });
  assert.equal(slowStream.verification_error, "ERR_SOURCE_TIMEOUT");
});

test("DNS validation rejects private answers before the pinned request", async () => {
  await assert.rejects(
    resolvePublicAddresses("rebound.example", { lookupImpl: async () => [{ address: "192.168.1.10", family: 4 }] }),
    (error) => error.code === "ERR_UNSAFE_SOURCE",
  );
  const publicAnswers = await resolvePublicAddresses("public.example", { lookupImpl: async () => [{ address: "8.8.8.8", family: 4 }] });
  assert.deepEqual(publicAnswers, [{ address: "8.8.8.8", family: 4 }]);
  await assert.rejects(
    fetchPublic("https://stalled.example", { timeoutMs: 10, lookupImpl: () => new Promise(() => {}) }),
    (error) => error.code === "ERR_SOURCE_TIMEOUT",
  );
});
