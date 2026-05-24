# No-Write QA Mode Audit

Generated: 2026-05-24

## Baseline Finding

Running `npm run qa:launch` from a clean checkout rewrote tracked generated report files:

- `research/source-material-review/homepage-visual-flow-report.md`
- `research/source-material-review/image-repetition-audit.md`
- `research/source-material-review/launch-qa-report.md`

`git diff --stat` showed 3 files changed, with 59 insertions and 55 deletions. The homepage visual report rewrote rendered image-order content, while the image repetition and launch reports rewrote generated timestamps.

## Classification

### 1. Public/source files

- `src/**`
- `public/**`
- `content/**`
- `research/news-review/approved-development-news.json`

These files can change only when a run imports, publishes, or intentionally updates buyer-facing site content.

### 2. Useful human reports

- `research/source-material-review/launch-qa-report.md`
- `research/source-material-review/homepage-visual-flow-report.md`
- `research/source-material-review/image-repetition-audit.md`

These are useful for manual launch or visual audits and should remain available in tracked Markdown form when explicitly requested.

### 3. Generated runtime reports

- `research/source-material-review/news-issue-importer-last-run.json`
- QA output produced by scheduled no-change automation runs

These files describe a run rather than source truth. Scheduled automation should not dirty the repo by refreshing them.

### 4. Should be written only on explicit audit

- `research/source-material-review/launch-qa-report.md`
- `research/source-material-review/homepage-visual-flow-report.md`
- `research/source-material-review/image-repetition-audit.md`

Use `npm run qa:launch:write-reports` or the default `npm run qa:launch` when the goal is a tracked audit artifact.

### 5. Should write to untracked runtime path

- `.runtime/qa/launch-qa-report.md`
- `.runtime/qa/homepage-visual-flow-report.md`
- `.runtime/qa/image-repetition-audit.md`
- `.runtime/qa/news-issue-importer-last-run.json`

`.runtime/` is gitignored. Automation mode uses `QA_NO_WRITE=1` so generated reports remain available locally without changing tracked files.

## Implemented Mode

`QA_NO_WRITE=1` or `--no-write` redirects supported generated reports to `.runtime/qa/` while preserving the QA checks and exit codes. The scheduled GPT issue processor runs in no-write mode by default through `npm run news:process-gpt-issues`. `npm run test`, daily maintenance, and deploy preflight also use no-write launch QA so verification does not create tracked timestamp churn.

The GPT issue processor also skips write-capable publish and newsletter steps when no GPT issues matched and no queued draft is eligible for publication. That keeps no-change scheduled runs clean while still running QA and live QA.
