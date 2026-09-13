import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { buildShadowDigest, renderShadowDigestMarkdown, writeShadowDigest } from "./shadow-digest.mjs";

function result(id, article, fact, overrides = {}) {
  return {
    intel_id: id,
    article_decision: article,
    fact_change_decision: fact,
    reasons: { article: [], fact_change: [] },
    fact_mutations: [],
    review_object: { event_key: `project|${id}|construction|update|2026-09-13`, evidence_summary: { claims: [] } },
    ...overrides,
  };
}

test("shadow digest summarizes outcomes but lists only NEEDS_DECISION exceptions", () => {
  const digest = buildShadowDigest({
    dispatchId: "disp-test",
    generatedAt: "2026-09-13T15:00:00.000Z",
    results: [
      result("article-auto", "AUTO_ELIGIBLE", "NONE"),
      result("fact-auto", "HOLD", "AUTO_ELIGIBLE"),
      result("duplicate", "DUPLICATE", "NONE"),
      result("hold", "HOLD", "HOLD"),
      result("exception", "AUTO_ELIGIBLE", "NEEDS_DECISION", {
        reasons: { article: ["all_article_requirements_met"], fact_change: ["human_required_fields:deliveryTiming"] },
        fact_mutations: [{
          project_id: "alba-palm-beach", field: "deliveryTiming", current_value: "2027", proposed_value: "2028",
          effective_date: "2026-09-13", canonical_base: { expected_revision: "c".repeat(64) },
          evidence_bundle_sha256: "e".repeat(64), audit_identifier: "fact-audit-test", apply: false,
        }],
        evidence_bundle_sha256: "e".repeat(64),
        candidate_sha256: "d".repeat(64),
        review_object: {
          event_key: "project|alba-palm-beach|delivery|update|2026-09-13",
          evidence_summary: { claims: [{ source_urls: ["https://www.wpb.org/source"] }] },
        },
      }),
    ],
  });
  assert.deepEqual(digest.summary, {
    processed: 5, auto_article_candidates: 2, auto_fact_candidates: 1,
    duplicates_ignored: 1, held: 2, needs_brooke: 1,
  });
  assert.equal(digest.exceptions.length, 1);
  assert.equal(digest.exceptions[0].intel_id, "exception");
  assert.equal(digest.exceptions[0].canonical_diffs[0].apply, false);
  assert.deepEqual(digest.exceptions[0].evidence_links, ["https://www.wpb.org/source"]);
  assert.deepEqual(digest.exceptions.map((item) => item.intel_id), ["exception"]);
});

test("shadow digest writes private runtime JSON and Markdown with explicit shadow boundary", async (t) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "wpb-shadow-digest-"));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const digest = buildShadowDigest({ results: [], generatedAt: "2026-09-13T15:00:00.000Z" });
  const files = await writeShadowDigest(root, digest);
  assert.match(files.json, /\.runtime\/p2\/digests\/shadow-digest-/);
  assert.match(files.markdown, /\.runtime\/p2\/digests\/shadow-digest-/);
  const markdown = await fs.readFile(files.markdown, "utf8");
  assert.match(markdown, /Mode: SHADOW — no release or writeback/);
  assert.match(renderShadowDigestMarkdown(digest), /Needs Brooke: 0/);
  assert.equal((await fs.stat(files.json)).mode & 0o777, 0o600);
});
