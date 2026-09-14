# P2 Fast Mode — Operations

Fast Mode (`p2-fast-policy-v1`, processor revision
`p2-fast-mode-v2-throughput-r3`) is the live intelligence pipeline. It
replaces the review-heavy shadow policy: credible events publish
automatically, canonical facts update independently, and humans only see
genuine conflicts.

Automated fact commits regenerate only the reviewed public project model and
the matching `siteData` fact projection. They never run the media-dependent
full site-intelligence build on a GitHub runner, so a fact update cannot erase
locally reviewed image metadata.

## Pipeline

```
Gemini scout ──> Incoming_Intel (status=new)
      │            processor emits fact-check packet (status=awaiting_fact_check)
      v
ChatGPT Fact Check ──> fact_check_handoff_json (p2-fact-check-handoff-v2)
      v
processor decision pass (decideFast)
      ├─ article: AUTO_PUBLISH | DUPLICATE | HOLD | NEEDS_DECISION
      └─ facts:   AUTO_APPLY | HOLD | NEEDS_DECISION | NONE   (independent)
      v
Story_Queue (status=ready_for_writer)
      v
ChatGPT Story Writer ──> story_package_json + status=ready_to_publish
      v
processor publish pass ──> article-publish-cli --publish
      │                    (existing publisher: normalize, QA, commit, push)
      v
push to main ──> explicit deploy-cloudflare-pages.yml dispatch
      │
      └─ canonical facts ──> content/overrides/project-fact-automated.json
                             -> generate-project-model -> derived surfaces
```

## Processing owner: GitHub Actions

`.github/workflows/intel-fast-cycle.yml` is the installed processing owner.
The matching reviewable template remains at
`tools/github-workflows/intel-fast-cycle.yml`. It runs
`npm run p2:fast:cycle` every 15 minutes and also accepts explicit
`workflow_dispatch` and `repository_dispatch` wake-ups. Workflow concurrency
serializes cycles. The Sheet is durable workflow state: packet, evidence, and
fact-commit states are idempotent and a fact is not acknowledged as committed
until its main-branch push succeeds. The GCE owner from the earlier shadow
architecture is not used.

Apps Script `wakeIntelFastCycle()` is the reliable 15-minute wake-up. Its
time-driven trigger sends only GitHub `repository_dispatch` event
`wpb-intel-scan`; GitHub Actions remains the sole processor. The workflow cron
stays enabled as a fallback. `scanBothQueues()` and `ensureStoryQueueTab()` are
manual diagnostic/schema helpers and must not be installed as triggers.

## Policy summary

Article AUTO_PUBLISH when the semantic occurrence is credible, at least one
reputable attributable source materially supports it, and a useful
buyer-facing story can be written — secondary uncertainty is qualified or
omitted, never blocking. HOLD only for core-event contradiction,
unresolvable identity, no credible source, or unsafe/corrupt material.
Literal headline text, corridor labels, internal event keys, dates embedded in
dedupe keys, buyer inference, pricing, and secondary statistics are not core
gates. The writer receives supported facts plus explicit qualify-or-omit
guidance and may rewrite the intake headline/copy. Legacy
`requires_human_review=TRUE` is ignored by Fast Mode; only
`flags_json.brooke_decision_required=true` invokes Brooke.

Facts AUTO_APPLY only for end-to-end projectable objective fields (`status`,
`name`, `residenceCount`, `address`) and projectable dynamic fields
(`priceDisplay`, `deliveryTiming`). Every automatic mutation must bind its exact
supported claim, active policy, evidence bundle, reputable fetched source, and
known prior canonical value. Dynamic facts additionally require a real as-of
date. Other fields stay human until they have an explicit canonical/public
projection contract. Manual `project-fact-overrides.json` entries always win
over automated ones.

When historical intake omitted a fact proposal, the processor conservatively
derives one from a supported claim and the reviewed public-field resolver for
`status`, `residenceCount`, `address`, `priceDisplay`, or `deliveryTiming`.
Conflicting derived values are discarded. Every synthesized proposal still
binds exact claim IDs, fetched reputable source refs, current canonical value,
event key, evidence bundle, and as-of provenance. Article dedupe/hold never
short-circuits this separate fact evaluation.

`discovery_sources_json` is part of the intake content hash. Each safe unique
HTTP(S) source in the list, plus the legacy `source_url`, `lead_source_url`, and
`primary_source_url` fields, is independently fetched. One fetched source is
enough to continue. If every intake URL fails, the processor retries the
reviewed canonical source URLs for an identified project. Those URLs remain
evidence candidates only and still require exact Fact Check binding; prose
notes never substitute for retrieved evidence.

## Files

- `research/scripts/p2/fast-policy.mjs` — evidence-bound policy plus V2 throughput processor
- `research/scripts/p2/fast-fact-check.mjs` — `p2-fact-check-handoff-v2`
- `research/scripts/p2/story-queue.mjs` — Story_Queue schema + idempotent enqueue
- `research/scripts/p2/story-publisher.mjs` — Story_Queue -> existing article publisher
- `research/scripts/p2/fast-facts.mjs` — automated canonical fact layer
- `research/scripts/p2/fast-cycle.mjs` — cycle orchestrator
- `research/scripts/p2/fast-cycle-cli.mjs` — CLI (`npm run p2:fast:cycle`)
- `research/scripts/p2/fast-digest.mjs` — outcome digest
- `research/scripts/p2/google-sheets-io.mjs` — Sheets read/write transport
- `.github/workflows/intel-fast-cycle.yml` — installed Actions workflow
- `tools/github-workflows/intel-fast-cycle.yml` — matching review template
- `tools/apps-script/fast-cycle-wakeup.gs` — wake-only 15-minute Apps Script dispatch
- `tools/apps-script/incoming-intel-scanner.gs` — `scanBothQueues`,
  `ensureStoryQueueTab`
- `docs/WPB_GEMINI_INTELLIGENCE_SCOUT_PROMPT.md`
- `docs/WPB_CHATGPT_FACT_CHECK_TASK_PROMPT.md`
- `docs/WPB_CHATGPT_STORY_WRITER_TASK_PROMPT.md`
- `research/scripts/p2/fast-mode.test.mjs` — `npm run test:p2:fast`

## One-time activation steps

1. GitHub: merge the installed `.github/workflows/intel-fast-cycle.yml` through
   the normal reviewed PR path.
2. Google Cloud: create a service account, share the private spreadsheet
   with its `client_email` (Editor), download the key JSON.
3. GitHub repo secret: add `P2_GOOGLE_SERVICE_ACCOUNT_JSON` (key JSON). The
   workflow uses its short-lived job token for same-repository article/fact
   pushes. If a Fast Cycle changes `main`, it explicitly dispatches
   `deploy-cloudflare-pages.yml`; no long-lived publish PAT is required.
4. Set repository variables `P2_DRY_RUN=1` and `P2_SKIP_PUBLISH=1`. Dispatch one
   real-Sheet cycle, verify sanitized Sheet counts and unchanged Git HEAD/status,
   then set both to `0` only after that cycle succeeds.
5. Apps Script: copy `tools/apps-script/fast-cycle-wakeup.gs` into the private
   spreadsheet's bound project, set `GITHUB_DISPATCH_TOKEN` as a Script
   Property, run `wakeIntelFastCycle()` once, and install exactly one
   15-minute `wakeIntelFastCycle` trigger. Follow
   `docs/P2_APPS_SCRIPT_SCANNER_INSTALL.md`; never install a scanner function
   as a recurring trigger.
6. ChatGPT: the Fact Check and Story Writer schedules are configured outside
   this repository. Their exact write contracts remain in the prompt docs.
7. Gemini: replace the current automation prompt with the scout prompt.

Do not retire `live-news-agent-task.yml` or
`biweekly-content-agent-task.yml` merely because the dry cycle passes. Remove
only their schedule triggers after the real path has (1) read the Sheet,
(2) written at least one packet, (3) accepted at least one valid handoff, and
(4) created at least one `Story_Queue` row. Historical issues remain intact.

## Digest

`writeFastDigest` reports outcomes, not a review queue: stories published,
stories returned to the writer, stories held, facts applied, duplicates
skipped, transient errors retrying, and `needs_brooke` — which defaults to 0.
