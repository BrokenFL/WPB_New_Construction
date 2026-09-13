# P2 Fast Mode — Operations

Fast Mode (`p2-fast-policy-v1`) is the live intelligence pipeline. It
replaces the review-heavy shadow policy: credible events publish
automatically, canonical facts update independently, and humans only see
genuine conflicts.

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
push to main ──> deploy-cloudflare-pages.yml (normal deploy)
      │
      └─ canonical facts ──> content/overrides/project-fact-automated.json
                             -> generate-project-model -> derived surfaces
```

## Processing owner: GitHub Actions

`tools/github-workflows/intel-fast-cycle.yml` is the prepared workflow —
staged outside `.github/workflows/` because the push token lacks the OAuth
`workflow` scope. Activation copies it to
`.github/workflows/intel-fast-cycle.yml` (web UI or a `workflow`-scoped
token — one-time step). Once installed it runs `npm run p2:fast:cycle`
every 15 minutes (plus `repository_dispatch` / `workflow_dispatch`). The
Sheet is the durable workflow state — a missed or failed run self-heals
because non-terminal rows stay actionable until the next cycle. The GCE
owner from the shadow architecture is not required: dispatches are
advisory pokes, all idempotency lives in Sheet columns and Story_Queue
rows.

Apps Script `scanBothQueues()` remains available as an optional dispatcher
(`p2-story-dispatch-v1` envelopes) but the cron schedule alone is
sufficient.

## Policy summary

Article AUTO_PUBLISH when the core event is credible, at least one
reputable attributable source materially supports it, and a useful
buyer-facing story can be written — secondary uncertainty is qualified or
omitted, never blocking. HOLD only for core-event contradiction,
unresolvable identity, no credible source, or unsafe/corrupt material.
Pricing, delivery, financing, approvals, zoning, buyouts, and sales pace
do not gate publication — they gate only the canonical fact update, and
only via evidence strength.

Facts AUTO_APPLY for objective fields (status, constructionStage,
toppingOut, groundbreaking, completion, moveInStatus, name,
residenceCount, floorCount, address, developer) and for dynamic fields
(pricing, priceDisplay, startingPrice, deliveryTiming, inventory,
availability, salesPace) when they carry a source URL and as-of date.
Legal, termination, buyout, zoning conclusions, and unknown fields stay
human. Manual `project-fact-overrides.json` entries always win over
automated ones.

## Files

- `research/scripts/p2/fast-policy.mjs` — `p2-fast-policy-v1` decisions
- `research/scripts/p2/fast-fact-check.mjs` — `p2-fact-check-handoff-v2`
- `research/scripts/p2/story-queue.mjs` — Story_Queue schema + idempotent enqueue
- `research/scripts/p2/story-publisher.mjs` — Story_Queue -> existing article publisher
- `research/scripts/p2/fast-facts.mjs` — automated canonical fact layer
- `research/scripts/p2/fast-cycle.mjs` — cycle orchestrator
- `research/scripts/p2/fast-cycle-cli.mjs` — CLI (`npm run p2:fast:cycle`)
- `research/scripts/p2/fast-digest.mjs` — outcome digest
- `research/scripts/p2/google-sheets-io.mjs` — Sheets read/write transport
- `tools/github-workflows/intel-fast-cycle.yml` — staged Actions workflow
  (copy to `.github/workflows/` at activation)
- `tools/apps-script/incoming-intel-scanner.gs` — `scanBothQueues`,
  `ensureStoryQueueTab`
- `docs/WPB_GEMINI_INTELLIGENCE_SCOUT_PROMPT.md`
- `docs/WPB_CHATGPT_FACT_CHECK_TASK_PROMPT.md`
- `docs/WPB_CHATGPT_STORY_WRITER_TASK_PROMPT.md`
- `research/scripts/p2/fast-mode.test.mjs` — `npm run test:p2:fast`

## One-time activation steps

1. GitHub: install the workflow — copy
   `tools/github-workflows/intel-fast-cycle.yml` to
   `.github/workflows/intel-fast-cycle.yml` on main (web UI commit, or
   `gh auth refresh -h github.com -s workflow` then a normal push).
2. Google Cloud: create a service account, share the private spreadsheet
   with its `client_email` (Editor), download the key JSON.
3. GitHub repo secrets: add `P2_GOOGLE_SERVICE_ACCOUNT_JSON` (key JSON)
   and `P2_PUBLISH_PAT` (a token that can push to main and trigger the
   push-event deploy; `GITHUB_TOKEN` pushes don't fire it — without the
   PAT the cycle falls back to `workflow_dispatch` on the deploy
   workflow).
4. Apps Script (optional dispatcher): run `ensureStoryQueueTab()` once,
   set Script Properties `SCANNER_MODE=shadow`, `SHEET_ID`,
   `POLICY_VERSION=p2-fast-policy-v1`, `DISPATCH_ENDPOINT`,
   `DISPATCH_SECRET` (32+ chars), then install the 15-minute
   `scanBothQueues` trigger. Skippable — the Actions cron suffices.
   Note: the first `p2:fast:cycle` run also auto-creates Story_Queue via
   `ensureTab`, so the Apps Script step is belt-and-suspenders.
5. ChatGPT: create the two scheduled tasks from the prompt docs.
   Fact Check every ~2 hours in the day; Story Writer on the half-hour
   offset.
6. Gemini: replace the current automation prompt with the scout prompt.

## Digest

`writeFastDigest` reports outcomes, not a review queue: stories published,
facts applied, duplicates skipped, errors retrying, holds, and
`needs_brooke` — which defaults to 0.
