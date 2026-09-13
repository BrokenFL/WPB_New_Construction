import { processRow } from "../intel/core.mjs";
import { readSelectedRows } from "../intel/sheet-adapter.mjs";
import { bindSnapshotToDispatch, createDispatchAck, createFileAckStore, verifyDispatch } from "./dispatch.mjs";
import { DEFAULT_REVIEWER_VERSION, toPhaseATrustedEvidence, validateEvidenceBundle } from "./evidence-review.mjs";
import { buildFactMutationsFromPhaseA } from "./fact-mutation.mjs";
import { decide, POLICY_VERSION } from "./policy-engine.mjs";
import { ReviewQueue } from "./review-queue.mjs";
import { buildEmailPreview, writeEmailPreview } from "./email-preview.mjs";
import { mintApprovalToken } from "./approval-server.mjs";
import { planRelease, planWriteback } from "./release-adapter.mjs";
import { createEditorialBrief, runStoryWriter } from "./story-writer.mjs";

export const REVIEW_OBJECT_CONTRACT_VERSION = "p2-shadow-review-object-v1";

function evidenceSummary(bundle, boundReview) {
  if (!boundReview?.bound || !bundle) return { bound: false, code: boundReview?.code || "ERR_REVIEW_BUNDLE_REQUIRED", claims: [] };
  return {
    bound: true,
    review_bundle_sha256: bundle.review_bundle_sha256,
    reviewer_type: bundle.reviewer_type,
    reviewer_identity: bundle.reviewer_identity,
    reviewer_version: bundle.reviewer_version,
    verification_timestamp: bundle.verification_timestamp,
    claims: bundle.claims.map((claim) => ({
      claim_id: claim.claim_id,
      support_verdict: claim.support_verdict,
      source_urls: claim.verification_sources.map((source) => source.verification_source_url).sort(),
    })).sort((a, b) => a.claim_id.localeCompare(b.claim_id)),
  };
}

function reviewObject({ row, result, bundle, boundReview, articleCandidate, decision, factMutations }) {
  return {
    contract_version: REVIEW_OBJECT_CONTRACT_VERSION,
    intel_id: row.id,
    intake_snapshot_sha256: result.report.row_sha256,
    event_key: result.report.derived_event_key,
    policy_version: POLICY_VERSION,
    evidence_bundle_sha256: boundReview?.review_bundle_sha256 || null,
    article: articleCandidate,
    fact_changes: factMutations,
    decisions: {
      article: decision.article_decision,
      fact_change: decision.fact_change_decision,
    },
    reasons: decision.reasons,
    evidence_summary: evidenceSummary(bundle, boundReview),
  };
}

export async function shadowRun({
  root,
  envelope,
  secret,
  snapshotCsv,
  evidenceBundles = {},
  storyWriterProviders = {},
  factTestResults = {},
  indexes = {},
  verificationSources = {},
  seenNonces = new Set(),
  ackStore = createFileAckStore(root),
  reviewerVersion = DEFAULT_REVIEWER_VERSION,
  now = Date.now(),
  approver = "brooke",
  approvalBaseUrl = "http://127.0.0.1:8790",
  approvalSecret = secret,
}) {
  const verified = verifyDispatch({ envelope, secret, seenNonces, now });
  if (!verified.ok) return { ok: false, stage: "dispatch", ...verified };
  if (verified.dispatch.policy_version !== POLICY_VERSION) return { ok: false, stage: "dispatch", code: "ERR_DISPATCH_POLICY_MISMATCH" };
  seenNonces.add(verified.dispatch.nonce);

  if (await ackStore.isAcked(verified.dispatch.dispatch_id)) {
    return {
      ok: true,
      replayed: true,
      dispatch_id: verified.dispatch.dispatch_id,
      results: [],
      ack: createDispatchAck({ dispatchId: verified.dispatch.dispatch_id, replayed: true }),
    };
  }

  const boundSnapshot = bindSnapshotToDispatch({ dispatch: verified.dispatch, snapshotCsv });
  if (!boundSnapshot.ok) return { ok: false, stage: "snapshot", ...boundSnapshot };
  const queue = await new ReviewQueue(root).load();
  const ids = verified.dispatch.records.map((record) => record.intel_id);
  const rows = await readSelectedRows({ ids, csvText: snapshotCsv });
  const results = [];
  const tokens = new Map();

  for (const row of rows) {
    const sources = verificationSources[row.id] || [];
    const preliminary = processRow({ row, verificationSources: sources, indexes });
    const bundle = evidenceBundles[row.id];
    const boundReview = bundle ? validateEvidenceBundle({
      bundle,
      intelId: row.id,
      intakeSnapshotSha256: preliminary.report.row_sha256,
      eventKey: preliminary.report.derived_event_key,
      claims: preliminary.claims,
      sources: preliminary.verificationSources,
      policyVersion: POLICY_VERSION,
      reviewerVersion,
      now,
    }) : { bound: false, code: "ERR_REVIEW_BUNDLE_REQUIRED", claims_all_supported: false };

    const result = boundReview.bound
      ? processRow({ row, verificationSources: sources, indexes, trustedEvidence: toPhaseATrustedEvidence(bundle, preliminary.verificationSources) })
      : preliminary;
    if (bundle && !boundReview.bound) result.report.warnings.push({ code: boundReview.code, message: boundReview.errors?.join("; ") || "Trusted evidence bundle rejected" });

    let articleCandidate = null;
    let storyError = null;
    const provider = storyWriterProviders[row.id];
    if (provider && boundReview.bound) {
      try {
        const brief = createEditorialBrief({
          evidenceBundle: {
            intel_id: bundle.intel_id,
            event_key: bundle.event_key,
            evidence_bundle_sha256: bundle.review_bundle_sha256,
          },
          claims: result.claims.filter((claim) => claim.material && claim.support === "supported"),
          sources: result.verificationSources.filter((source) => !source.error),
          editorialConstraints: {
            research_scope: "prohibited",
            output_scope: "copy_only",
            release_control: "external_policy_engine",
            preserve_historical_articles: true,
          },
        });
        articleCandidate = await runStoryWriter({ provider, brief });
      } catch (error) {
        storyError = { code: error.code || "ERR_STORY_WRITER", message: String(error.message || error) };
      }
    }

    const factMutations = buildFactMutationsFromPhaseA({
      result,
      boundReview,
      policyVersion: POLICY_VERSION,
      factTestResults: factTestResults[row.id] || {},
    });
    const decision = decide({ row, result, boundReview, factMutations, articleCandidate });
    if (storyError) {
      decision.article_decision = "HOLD";
      decision.reasons.article = [storyError.code];
    }
    const candidate = reviewObject({ row, result, bundle, boundReview, articleCandidate, decision, factMutations });
    const { entry, created } = queue.enqueue({
      eventKey: result.report.derived_event_key,
      policyVersion: POLICY_VERSION,
      intelId: row.id,
      articleDecision: decision.article_decision,
      factChangeDecision: decision.fact_change_decision,
      reviewObject: candidate,
      binding: boundReview,
      provenance: boundReview.provenance || null,
    });

    let previewFile = null;
    const needsExceptionReview = [decision.article_decision, decision.fact_change_decision].includes("NEEDS_DECISION");
    if (created && needsExceptionReview && boundReview.bound) {
      const token = mintApprovalToken({ secret: approvalSecret, entry, approver, now });
      tokens.set(token.token_id, token);
      const preview = buildEmailPreview({ entry, approvalBaseUrl, approvalToken: token });
      previewFile = await writeEmailPreview(root, entry, preview);
    }

    results.push({
      intel_id: row.id,
      created,
      article_decision: decision.article_decision,
      fact_change_decision: decision.fact_change_decision,
      reasons: decision.reasons,
      article_state: entry.article_state,
      fact_change_state: entry.fact_change_state,
      queue_state: entry.state,
      evidence_bundle_sha256: entry.evidence_bundle_sha256,
      candidate_sha256: entry.candidate_sha256,
      article_candidate: articleCandidate,
      fact_mutations: factMutations,
      review_object: candidate,
      preview_file: previewFile,
      release_plan: planRelease({ entry }),
      writeback_plan: planWriteback({ entry, liveVerifiedUrl: null }),
    });
  }

  await queue.save();
  const persistedAck = await ackStore.ack(verified.dispatch.dispatch_id);
  return {
    ok: true,
    dispatch_id: verified.dispatch.dispatch_id,
    results,
    queue_stats: queue.stats(),
    tokens,
    ack: createDispatchAck({ dispatchId: verified.dispatch.dispatch_id, replayed: persistedAck.duplicate, ackedAt: persistedAck.acked_at }),
  };
}
