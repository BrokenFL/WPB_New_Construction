import { bindSnapshotToDispatch, createDispatchAck, createFileAckStore, verifyDispatch } from "./dispatch.mjs";
import { POLICY_VERSION } from "./policy-engine.mjs";
import { RELEASE_DISABLED } from "./release-adapter.mjs";
import { shadowRun } from "./shadow-run.mjs";

export const PROCESSING_OWNER_CONTRACT_VERSION = "p2-shadow-owner-v1";

function errorResponse(status, code) {
  return {
    status,
    body: {
      contract_version: PROCESSING_OWNER_CONTRACT_VERSION,
      ok: false,
      mode: "shadow",
      production_side_effects: false,
      code,
    },
  };
}

function assertProvider(provider, name) {
  if (typeof provider !== "function") throw new Error(`ERR_SHADOW_OWNER_${name}_PROVIDER_REQUIRED`);
}

function noEnabledSideEffects(results = []) {
  return results.every((result) => result.release_plan?.enabled === false
    && result.release_plan?.article?.enabled === false
    && result.release_plan?.fact_change?.enabled === false
    && result.writeback_plan?.enabled === false
    && (result.fact_mutations || []).every((mutation) => mutation.apply === false));
}

// Repository-owned, host-neutral processing boundary. A future cloud host
// supplies private snapshot/evidence providers and durable storage. The owner
// does not accept private Sheet rows in the dispatch and returns only an ack
// plus aggregate shadow status.
export function createShadowProcessingOwner({
  root,
  secret,
  snapshotProvider,
  reviewInputsProvider = async () => ({}),
  indexesProvider,
  ackStore = createFileAckStore(root),
  now = () => Date.now(),
  seenNonces = new Set(),
}) {
  if (!root || !secret) throw new Error("ERR_SHADOW_OWNER_CONFIGURATION");
  assertProvider(snapshotProvider, "SNAPSHOT");
  assertProvider(reviewInputsProvider, "REVIEW_INPUTS");
  assertProvider(indexesProvider, "INDEXES");

  return {
    async handle(envelope) {
      const currentTime = now();
      const verified = verifyDispatch({ envelope, secret, now: currentTime, seenNonces: new Set() });
      if (!verified.ok) {
        const status = verified.code === "ERR_DISPATCH_SIGNATURE" ? 401 : 400;
        return errorResponse(status, verified.code);
      }
      if (verified.dispatch.policy_version !== POLICY_VERSION) return errorResponse(409, "ERR_DISPATCH_POLICY_MISMATCH");
      if (await ackStore.isAcked(verified.dispatch.dispatch_id)) {
        return {
          status: 200,
          body: {
            ...createDispatchAck({ dispatchId: verified.dispatch.dispatch_id, replayed: true }),
            mode: "shadow",
            production_side_effects: false,
            processing_owner_contract_version: PROCESSING_OWNER_CONTRACT_VERSION,
            summary: { processed: 0, auto_article_candidates: 0, auto_fact_candidates: 0, duplicates_ignored: 0, held: 0, needs_brooke: 0 },
            digest_sha256: null,
          },
        };
      }

      let snapshotCsv;
      let reviewInputs;
      let indexes;
      try {
        snapshotCsv = await snapshotProvider({
          sheetId: verified.dispatch.sheet_id,
          sheetName: verified.dispatch.sheet_name,
          records: verified.dispatch.records,
          dispatchId: verified.dispatch.dispatch_id,
        });
      } catch {
        return errorResponse(503, "ERR_SHADOW_OWNER_PRIVATE_INPUT_UNAVAILABLE");
      }
      if (typeof snapshotCsv !== "string") return errorResponse(503, "ERR_SHADOW_OWNER_PRIVATE_INPUT_UNAVAILABLE");
      const boundSnapshot = bindSnapshotToDispatch({ dispatch: verified.dispatch, snapshotCsv });
      if (!boundSnapshot.ok) return errorResponse(409, boundSnapshot.code);
      try {
        [reviewInputs, indexes] = await Promise.all([
          reviewInputsProvider({
            dispatchId: verified.dispatch.dispatch_id,
            intelIds: verified.dispatch.records.map((record) => record.intel_id),
            snapshotCsv,
          }),
          indexesProvider(),
        ]);
      } catch {
        return errorResponse(503, "ERR_SHADOW_OWNER_PRIVATE_INPUT_UNAVAILABLE");
      }

      const output = await shadowRun({
        root,
        envelope,
        secret,
        snapshotCsv,
        evidenceBundles: reviewInputs?.evidenceBundles || {},
        factCheckHandoffs: reviewInputs?.factCheckHandoffs || {},
        verificationSources: reviewInputs?.verificationSources || {},
        storyWriterProviders: reviewInputs?.storyWriterProviders || {},
        factTestResults: reviewInputs?.factTestResults || {},
        indexes,
        ackStore,
        seenNonces,
        now: currentTime,
      });
      if (!output.ok) {
        const status = output.stage === "snapshot" ? 409 : 400;
        return errorResponse(status, output.code || "ERR_SHADOW_OWNER_PROCESSING");
      }
      if (RELEASE_DISABLED !== true || !noEnabledSideEffects(output.results)) {
        return errorResponse(500, "ERR_SHADOW_OWNER_SIDE_EFFECT_BOUNDARY");
      }
      return {
        status: 200,
        body: {
          ...output.ack,
          mode: "shadow",
          production_side_effects: false,
          processing_owner_contract_version: PROCESSING_OWNER_CONTRACT_VERSION,
          summary: output.digest?.summary || {
            processed: 0,
            auto_article_candidates: 0,
            auto_fact_candidates: 0,
            duplicates_ignored: 0,
            held: 0,
            needs_brooke: 0,
          },
          digest_sha256: output.digest?.digest_sha256 || null,
        },
      };
    },
  };
}
