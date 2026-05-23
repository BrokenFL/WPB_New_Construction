# Newsroom Pipeline Audit

Date: 2026-05-23

## Current Public Path

- Homepage shows only the latest/highest-value published updates and links to `/updates/`.
- `/updates/` is the archive and filtering surface for development, construction, planning, sales, and corridor signals.
- `/updates/:slug/` is the internal article page with article depth, buyer context, Brooke's take, CTA, and the bottom-only original source link.

## Source Of Truth

- Review source: `research/news-review/approved-development-news.json`
- Public TypeScript feed: `src/data/approvedExternalNews.ts`
- Promotion command: `npm run news:promote`

The approved public record now carries richer article and newsletter fields: `slug`, `deck`, `summary`, `bodySections`, `whyItMatters`, `brookeTake`, `buyerContext`, `newsletterHeadline`, `newsletterBlurb`, `newsletterCta`, `riskLevel`, related projects, and related corridors.

## Daily Intake Path

1. GPT or Codex gathers 2-3 relevant West Palm Beach new-construction stories.
2. Drafts enter through GitHub issue intake or `npm run news:import-gpt`.
3. Drafts are stored in `content/news-drafts.json`.
4. `npm run qa:news` validates required draft fields, body sections, risk level, newsletter blurb, source URL, and image references.
5. `npm run news:publish-queued` promotes only eligible low-risk queued drafts into the approved public file.
6. `npm run news:promote` regenerates the public TypeScript feed.
7. `npm run newsletter:draft` generates a digest using published archive updates plus still-queued intake items.
8. Site QA runs before deploy.

## Guardrails

- Keep users on WPB New Construction for the primary reading path.
- Do not put original source links on homepage or archive cards.
- Medium/high-risk items remain reviewable until Brooke/Codex approves the framing.
- Every article must answer what happened, where it fits, why it matters to buyers, and what Brooke should help verify.
- Avoid backend/status language, developer press-release tone, and unsupported urgency.

## Follow-Up Checks

- Add new approved stories regularly so the archive does not stall at the initial seed set.
- Keep newsletter blurbs short enough for direct email use.
- Re-run `npm run newsletter:draft` after new published updates land.
