# AGENTS.md — WPB New Construction Start Here

> Read the map before touching the bulldozer.

This file is a stable navigation and safety map. Durable implementation detail
belongs in the linked documents, not here.

## Before any edit

Read both project guides:

- `docs/AI_PROJECT_GUIDE.md`
- root `AI_PROJECT_GUIDE.md` (`WPB New Construction - Required AI Project Guide`)

Use the SSD checkout when available; the laptop path is the approved fallback:

```text
/Volumes/ExternalSSD/WPB_NewConstruction
/Users/brookesnader/Documents/WPB_New_Consrtuction_Git
```

Then verify the checkout before editing:

```bash
pwd
git remote -v
git branch --show-current
git status --short --branch
```

Required remote: `BrokenFL/WPB_New_Construction`. Required base branch: `main`.
Fetch and verify current refs; start new work from current `origin/main`, and
summarize any dirty files before touching them.
Never reset, stash, clean, overwrite, force-push, commit, push, merge, or deploy
unrelated work. Do not use historical repo `BrokenFL/WestPalmNewConstruction`
unless Brooke explicitly authorizes a migration.

## Architecture map

| Area | Authoritative document |
|---|---|
| Whole-project operating guide | `docs/AI_PROJECT_GUIDE.md` |
| Current program handoff | `docs/WPB_CODEX_MASTER_HANDOFF.md` |
| Phase A intelligence processor | `docs/P2_INTELLIGENCE_PROCESSOR_PHASE_A.md` |
| P2 convergence and policy direction | `docs/P2_INTELLIGENCE_CONVERGENCE_DESIGN.md` |
| P2 trusted evidence, shadow runner, scanner, approval, StoryWriter | `docs/P2_CLOUD_HANDOFF_APPROVAL.md` |
| Canonical project intelligence and Builder review | `docs/project-intelligence-architecture.md` |
| Existing automation and issue producers | `docs/automation-inventory.md` |
| News/update source pipeline | `docs/news-update-pipeline.md` |
| Article publishing | `docs/article-publisher-workflow.md` |
| Visual Editor | `docs/AI_PROJECT_GUIDE.md` → Visual Editor |

Current code and current remote refs outrank stale prose. Update a focused
handoff document when implementation changes its contract.

## Codebase Memory MCP

Before routing/page, generated-data, slug/alias, compare, build, QA/deploy, or
broad refactor work, use codebase-memory MCP for an architecture overview,
relevant files, dependencies, generated/source-of-truth boundaries, and impact
paths. Confirm the map with direct reads, targeted search, tests, and builds.

## Sources of truth and generated files

Do not hand-edit generated outputs.

| Content | Source of truth | Generated/consumer examples |
|---|---|---|
| Approved news | `research/news-review/approved-development-news.json` | `src/data/approvedExternalNews.ts`, feeds, sitemap |
| Canonical project facts | existing reviewed canonical project model/overrides | project pages, cards, compare, maps, schema |
| Buyer/downtown notes | `src/data/marketNotes.ts` | article routes |
| Content Studio project overrides | `research/content-editor/site-overrides.json` | `src/generated/editorOverrides.ts` |

Do not migrate `marketNotes.ts`, create a second article pipeline, or create a
competing project database without Brooke's explicit approval. Historical
articles are snapshots and must not be silently rewritten when canonical facts
change.

## Content Studio / Article Manager

Start locally with:

```bash
node tools/content-studio/server.mjs
# http://127.0.0.1:8787/
```

Restart after `server.mjs` changes; hard refresh for `app.js`/`style.css`.
Content Studio and Project Intelligence Review are local-only, unlinked, and
noindex. `qa:content-studio` guards public exposure.

Key boundaries:

- Draft/import/preview writes only `.runtime/`; it never publishes, commits,
  pushes, deploys, or dirties tracked change logs.
- Publishing reuses `research/scripts/article-publish-workflow.mjs`.
- Do not invent facts, choose compare data for Brooke, or set `schemaSafe: true`
  without Brooke's explicit confirmation.
- Project-fact overrides and their changelogs move together.
- Published market notes archive; approved-news JSON items may be deleted by
  the existing destination-specific workflow.
- Publish/delete/archive paths use documented allowlists and refuse unrelated
  dirty files. A local commit is not proof of GitHub push or deployment.
- Never strip `//` comments from TypeScript using a naive regex; it corrupts
  URLs inside strings.

The complete import schema, route aliases, allowlists, delete behavior,
one-click flow, Buyer Intelligence fields, iframe editor, and image limits are
in `docs/AI_PROJECT_GUIDE.md`.

## Intelligence automation boundary

Phase A remains no-mutation. P2 remains shadow-only until separately activated:

- private snapshots and evidence stay out of git;
- ambiguous IDs fail closed;
- Sheet status, HTTP 200, confidence, source tier, model agreement, and prose
  notes do not constitute claim evidence;
- article and canonical-fact decisions are independent;
- `AUTO_ELIGIBLE` is not release authorization;
- no Sheet writes, live fact application, publication, email, merge, or deploy;
- approvals bind exact candidate/evidence/policy revisions and mutate only via
  authenticated POST;
- PR #95's canonical propagation path is the only future fact-application path.

See `docs/P2_CLOUD_HANDOFF_APPROVAL.md` for contracts and activation stages.

## Git and release proof

Before any commit:

```bash
git status --short
git diff --stat
```

Classify every changed file as intended code/content, generated output,
runtime/report/log, or unrelated user work. Stage only the authorized scope.
Inspect Content Studio log diffs before asking Brooke whether to restore or
commit them.

Before claiming GitHub or release state, verify independently:

```bash
git rev-parse HEAD
git ls-remote origin main
git log --oneline -5
git status --short
```

Commit, push, CI, merge, deploy, live health, and installed-user/device use are
separate states. Report each precisely. Never deploy without Brooke's explicit
authorization.

## Common verification

Choose the focused subset while iterating; run broad gates at integration
boundaries:

```bash
npm run typecheck
npm run build
npm run test:intel:phase-a
npm run test:p2:shadow
npm run qa:project-intelligence
npm run qa:content-studio
npm run qa:approved-news
npm run qa:news
npm run qa:image-alt
npm run qa:launch:no-write
npm run qa:gatekeeper
```

At handoff report branch, exact HEAD, status, files changed, tests, push result,
CI state, and any intentionally unperformed release/activation step.
