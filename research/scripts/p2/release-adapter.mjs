import { stableJson } from "../intel/core.mjs";

// Release + writeback adapters — DISABLED/MOCKED. They produce the exact plan
// and payloads a future approved release would execute, but perform no writes.
// The real path must reuse the existing repository generation and publishing
// libraries (article-publish-workflow.mjs); no direct Sheet-to-public-HTML
// writes and no second publisher.

export const RELEASE_DISABLED = true;

// Approved release plan (design/test only):
//   candidate -> allowlisted content diff -> required tests ->
//   exact-revision approval/policy check -> controlled merge ->
//   one normal deployment -> live verification -> status writeback.
export function planRelease({ entry }) {
  return {
    enabled: false,
    reason: "release adapter disabled — design/test only",
    steps: [
      { step: "content_diff", detail: "generate allowlisted article/update files via existing publisher libraries", status: "mocked" },
      { step: "required_tests", detail: "npm run test + qa:launch:no-write + qa:gatekeeper", status: "mocked" },
      { step: "approval_check", detail: `verify approval binds to candidate_sha256 ${entry.candidate_sha256} under ${entry.policy_version}`, status: "mocked" },
      { step: "controlled_merge", detail: "human-approved merge of the content PR", status: "mocked" },
      { step: "deploy", detail: "one normal Cloudflare Pages deployment via existing workflow", status: "mocked" },
      { step: "live_verify", detail: "qa:live against the deployed URL", status: "mocked" },
      { step: "writeback", detail: "status writeback limited to approved workflow fields", status: "mocked" },
    ],
    note: "A push made with GITHUB_TOKEN may not trigger the normal deployment workflow — the GitHub auth/event chain must be tested before activation.",
  };
}

// Writeback payload: limited to approved workflow fields, never overwrites
// original research, and "published" is marked only after live acceptance.
export const WRITEBACK_FIELDS = Object.freeze(["status", "output_decision", "site_update_id", "canonical_update_url", "published_at", "processed_at", "processor_version"]);

export function planWriteback({ entry, liveVerifiedUrl }) {
  const payload = {
    status: liveVerifiedUrl ? "published" : "processed",
    output_decision: entry.decision,
    site_update_id: entry.candidate?.update_id || "",
    canonical_update_url: liveVerifiedUrl || "",
    published_at: liveVerifiedUrl ? new Date().toISOString() : "",
    processed_at: new Date().toISOString(),
    processor_version: entry.policy_version,
  };
  return {
    enabled: false,
    allowed_fields: WRITEBACK_FIELDS,
    payload: Object.fromEntries(Object.entries(payload).filter(([k]) => WRITEBACK_FIELDS.includes(k))),
    guard: "never writes headline/summary/source/research fields; published_at and canonical_update_url stay empty until live acceptance",
    stable: stableJson(payload),
  };
}
