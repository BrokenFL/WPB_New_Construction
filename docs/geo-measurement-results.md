# GEO Measurement Results

Run date: 2026-05-26  
Site: `https://www.wpbnewconstruction.com`

Follow-up update: later on 2026-05-26, Search Console access became available for `sc-domain:wpbnewconstruction.com`. The sitemap was submitted successfully and read by Google. Bing verification was later completed with the HTML meta tag method, and the Bing sitemap was submitted.

## Executive Summary

The recent SEO/GEO files are live and crawlable: `sitemap.xml`, `robots.txt`, and `llms.txt` all returned `200`, and the live sitemap contains 52 URLs including the priority answer, corridor, compare, and project routes.

The biggest remaining blocker is URL-level inspection execution in Google Search Console. Google Search Console is now accessible for Brooke's signed-in Google account and the sitemap has been submitted successfully. However, the URL Inspection bar accepted typed URLs but did not launch inspection results through the automated Chrome session, so priority URL indexing/request-indexing data is still not available. Bing Webmaster Tools ownership is verified, the sitemap is submitted, and Bing URL Inspection/URL Submission are now available.

Public Google discovery is partial. Google shows the homepage and at least one corridor page, but the answer hub did not appear for `site:wpbnewconstruction.com/answers`, the current Downtown canonical did not appear for the expected `/corridors/downtown-west-palm-beach/` path, and the Olara project query surfaced floorplan PDFs instead of the canonical project page. AI answer engines tested so far did not mention or cite `wpbnewconstruction.com`.

## GSC Findings

- Property checked: `sc-domain:wpbnewconstruction.com`
- Signed-in account shown: `brooke.snader@gmail.com`
- Verification/access status: accessible as of the follow-up check on May 26, 2026.
- Overview, Performance, Indexing, and Experience reports currently say "Processing data, please check again in a day or so."
- Sitemap submission:
  - Sitemap: `https://www.wpbnewconstruction.com/sitemap.xml`
  - Submitted: May 26, 2026
  - Last read: May 26, 2026
  - Status: Success
  - Discovered pages: 52
  - Discovered videos: 0
  - Submission message: "Sitemap submitted successfully. Google will periodically process it and look for changes."
- URL Inspection:
  - Attempted for the homepage first.
  - The Search Console inspection bar accepted `https://www.wpbnewconstruction.com/`, displayed the autocomplete row, and then returned to the dashboard without loading an inspection result.
  - No priority URL inspection detail could be captured in this automated session.
  - No indexing requests were submitted because the URL Inspection result screen and request-indexing button were not reached.
- Manual URL Inspection fallback checklist:

| Priority URL | URL is on Google? | Indexing allowed? | User-declared canonical | Google-selected canonical | Last crawl date | Indexing requested? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `https://www.wpbnewconstruction.com/` | Pending manual check | Pending manual check | Pending manual check | Pending manual check | Pending manual check | Pending manual check | Start here to confirm the property can inspect live URLs. |
| `https://www.wpbnewconstruction.com/answers/` | Pending manual check | Pending manual check | Pending manual check | Pending manual check | Pending manual check | Pending manual check | Public Google `site:` check did not surface this directory. |
| `https://www.wpbnewconstruction.com/answers/best-new-construction-condos-west-palm-beach/` | Pending manual check | Pending manual check | Pending manual check | Pending manual check | Pending manual check | Pending manual check | Priority answer page for buyer-intent discovery. |
| `https://www.wpbnewconstruction.com/answers/closest-new-condos-to-palm-beach/` | Pending manual check | Pending manual check | Pending manual check | Pending manual check | Pending manual check | Pending manual check | Priority answer page for Palm Beach proximity searches. |
| `https://www.wpbnewconstruction.com/compare/` | Pending manual check | Pending manual check | Pending manual check | Pending manual check | Pending manual check | Pending manual check | Comparison page was not observed in public result captures. |
| `https://www.wpbnewconstruction.com/corridors/north-flagler/` | Pending manual check | Pending manual check | Pending manual check | Pending manual check | Pending manual check | Pending manual check | Public Google showed North Flagler, but GSC canonical/crawl details are still needed. |
| `https://www.wpbnewconstruction.com/corridors/downtown-west-palm-beach/` | Pending manual check | Pending manual check | Pending manual check | Pending manual check | Pending manual check | Pending manual check | Public Google showed older `/corridors/downtown/` instead. |
| `https://www.wpbnewconstruction.com/corridors/south-flagler/` | Pending manual check | Pending manual check | Pending manual check | Pending manual check | Pending manual check | Pending manual check | Priority corridor page not observed in public result captures. |
| `https://www.wpbnewconstruction.com/projects/olara/` | Pending manual check | Pending manual check | Pending manual check | Pending manual check | Pending manual check | Pending manual check | Public Google showed Olara PDFs instead of the project page. |
| `https://www.wpbnewconstruction.com/projects/rosewood/` | Pending manual check | Pending manual check | Pending manual check | Pending manual check | Pending manual check | Pending manual check | Public Google showed a Rosewood update, not the project page. |
- Page Indexing report:
  - Still processing data.
  - No indexed/not-indexed reason table was available yet.

## Bing Findings

- Bing Webmaster Tools verification status: verified on May 26, 2026.
- Site shown: `https://wpbnewconstruction.com/`
- Verification method used: HTML meta tag on the homepage, `<meta name="msvalidate.01" content="4536DF263E4510BEB421D8E762573C57" />`.
- DNS was not changed.
- XML file verification was not used because Bing did not expose exact file contents in the visible UI; it only offered a `BingSiteAuth.xml` download action.
- Bing confirmation message after verification: "Site addition successful" for `https://wpbnewconstruction.com`.
- Sitemap submitted:
  - Sitemap: `https://www.wpbnewconstruction.com/sitemap.xml`
  - Submitted: May 26, 2026
  - Known sitemaps: 1
  - Status: Processing
  - Sitemaps with errors: 0
  - Sitemaps with warnings: 0
  - Total URLs discovered: 0 at initial submission time
  - Row detail: `Last submit` May 26, 2026; `Last crawl` submitted; `Status` Processing; `URLs discovered` not yet shown.
- URL Inspection and URL Submission are now available in Bing Webmaster Tools for this verified property.
- IndexNow: not enabled.

## Cloudflare Findings

- Account dashboard access: available in Brooke's Chrome profile.
- Pages project: `wpbnewconstruction`.
- Earlier production deployment visible in Cloudflare Pages before Bing verification:
  - Environment: Production
  - Source: `main`
  - Deployment label: `Fix Brooke contact phone number`
  - Deployment URL: `https://a30c0c03.wpbnewconstruction.pages.dev`
  - Deployment ID: `a30c0c03-c522-450b-b611-24604771a3c3`
  - Status: success
  - Time shown: 11:06 AM May 26, 2026; refreshed later as "an hour ago"
  - Assets uploaded: 349 files
- Latest local git commit matching the visible deployment label:
  - `8cda81e79eeb7fcc64932f54e29ad150874acfdf`
  - `Fix Brooke contact phone number`
- Bing verification deployment:
  - GitHub `main` was pushed to `12309c6293a24b451b6cada76a6f39693bccfe73`.
  - GitHub Actions deploy run `26461831192` was triggered for that commit but failed before deploy because the runner did not have the Playwright Chromium binary for `qa:homepage-visual`.
  - A separate clean worktree at `/tmp/wpb-bing-deploy` was checked out at `12309c6293a24b451b6cada76a6f39693bccfe73` to avoid deploying unrelated dirty local generated/content changes.
  - Clean worktree production deploy source: `main`, source `12309c6`.
  - Deployment URL: `https://bfc89cdc.wpbnewconstruction.pages.dev`
  - Deployment ID: `bfc89cdc-4431-4aea-841c-414130121956`
  - Live app bundle after deploy: `/assets/index-Be8GI55y.js`
  - Live stylesheet after deploy: `/assets/index-CfuGSP9t.css`
  - Live homepage meta tag check passed on both `https://www.wpbnewconstruction.com/` and `https://wpbnewconstruction.com/`.
- Web Analytics:
  - Site exists: `wpbnewconstruction.com`
  - Created: 8 days ago
  - Last 24 hours on site list: 21 page views, 16 visits
  - Overview page with `Exclude bots = Yes`: 22 page views, 17 visits
  - Available range viewed: Last 24 hours, EDT
  - Core Web Vitals rows included homepage, project, updates, downtown corridor, and builder URLs.
  - No AI/LLM referrers were visible in the dashboard text captured.
- Follow-up Cloudflare check confirmed the same production deployment and the same Last 24 hours Web Analytics view. No additional referrer table was exposed in the captured dashboard text.
- Request logs:
  - Logpush page states Logpush is available on Enterprise plans and Workers Paid plans.
  - Log Explorer / Log Search routes resolved back to the Logpush upsell/information page.
  - No request-log search was available for crawler user agents in this account view.

## Public Search Findings

### Google

Follow-up public Google checks on May 26, 2026 matched the earlier baseline:

- `site:wpbnewconstruction.com`
  - Showed homepage: `https://wpbnewconstruction.com/`
  - Showed `https://www.wpbnewconstruction.com/inquire/`
  - Showed `https://wpbnewconstruction.com/corridors/north-flagler/`
  - Showed `https://www.wpbnewconstruction.com/corridors/downtown/`
  - Showed `https://www.wpbnewconstruction.com/projects/15-cityplace/`
  - Showed market-note/update URLs including Olara vs Shorecrest and Rosewood update pages.
- `site:wpbnewconstruction.com/answers`
  - No results.
- `site:wpbnewconstruction.com/corridors`
  - Showed one Downtown corridor result at `https://www.wpbnewconstruction.com/corridors/downtown/`.
  - Expected canonical `/corridors/downtown-west-palm-beach/` did not appear in this visible result set.
- `site:wpbnewconstruction.com/projects/olara`
  - Showed Olara floorplan PDFs, including `olara-residence-plan-c.pdf` and `olara-residence-plan-z-209.pdf`.
  - Canonical `https://www.wpbnewconstruction.com/projects/olara/` did not appear in the visible result set.
- `"wpbnewconstruction.com" "best new construction condos in West Palm Beach"`
  - No results.
- `"wpbnewconstruction.com" "Olara"`
  - Showed an Olara update URL.
  - Showed Olara floorplan PDFs.
  - Showed homepage.
  - Also showed an unrelated Instagram result.

### Bing

- Follow-up Bing public checks remained challenge-blocked for the four `site:` queries.
- Phrase checks loaded but showed ads/recommendations and no organic `wpbnewconstruction.com` result.
- Several Bing public search result pages showed a "One last step / Please solve the challenge below to continue" human-verification challenge.
- I did not attempt to solve the challenge.
- The query `"wpbnewconstruction.com" "best new construction condos in West Palm Beach"` loaded without normal organic WPB results; visible content was mainly videos and query-expansion text.
- The query `"wpbnewconstruction.com" "Olara"` returned "There are no results for..." plus ads/recommendations.

## AI Answer-Engine Prompt-Test Findings

Detailed rows are in `research/geo/ai-answer-engine-tests.csv`.

No new answer-engine prompt rows were added in the follow-up pass. The same-day baseline already covered ChatGPT, Perplexity, Gemini, and Copilot/Bing; Copilot remained human-verification blocked.

- ChatGPT: tested in Temporary Chat in Brooke's Chrome profile. No captured response cited `wpbnewconstruction.com`. Several answers cited or referenced other sources such as Related Ross, South Flagler House, Zillow, Realtor.com, Forbes, and WSJ. Three ChatGPT readbacks hit a duplicate-body UI extraction error; no WPB citation was captured for those.
- Perplexity: all eight prompts completed. No response mentioned or cited `wpbnewconstruction.com`. Common competitors/sources included `luxlifemiamiblog`, `millionluxury`, `jalexandergroup`, `floridayimby`, `palmbeachpost`, official project sites, and listing/news sources.
- Gemini: all eight prompts completed. No response mentioned or cited `wpbnewconstruction.com`. Common sources included real-estate brokerage/blog sites, official project sites, Google local/hotel modules, CondoBlackBook, David Siddons Group, and similar sources.
- Copilot/Bing: prompts were submitted, but Copilot stopped at a "Verify you are human" challenge before answer output. Results are recorded as unknown rather than negative.

## Indexed/Cited Wins

- Google visibly indexes the homepage.
- Google visibly indexes at least one corridor page: North Flagler.
- Google visibly indexes updates/market-note content, including Olara-related and Rosewood-related update pages.
- Google visibly indexes some project-adjacent floorplan PDF assets.
- Cloudflare confirms the production deployment is current and successful.

## Missing/Not-Indexed Priority Pages

Unable to confirm via GSC URL Inspection because the inspection result screen did not load through the automated Chrome session. From public Google checks, these priority areas need attention:

- `/answers/` did not appear for the answer-directory site query.
- `/answers/best-new-construction-condos-west-palm-beach/` did not appear in the exact branded phrase query.
- `/answers/closest-new-condos-to-palm-beach/` was not observed in visible public results.
- `/compare/` was not observed in the captured public result set.
- `/corridors/downtown-west-palm-beach/` was not observed; Google showed `/corridors/downtown/` instead.
- `/corridors/south-flagler/` was not observed in the captured public result set.
- `/projects/olara/` was not observed for the Olara project site query; PDFs appeared instead.
- `/projects/rosewood/` was not observed as a canonical project page, though a Rosewood update appeared.

## Weird URL/Canonical Issues

- Google surfaced `https://www.wpbnewconstruction.com/corridors/downtown/` while the current priority URL is `https://www.wpbnewconstruction.com/corridors/downtown-west-palm-beach/`.
- Google surfaced Olara floorplan PDFs for `site:wpbnewconstruction.com/projects/olara` instead of the canonical Olara project page.
- A broader search result source surfaced a very deep generated HTML floorplan route under `projects/nora-house/docs/floorplans/...` as a top result. This should be reviewed after GSC access is available.
- Some public snippets still showed `561-891-0816` in AI/search captures from indexed or generated content, even though the latest deployment label indicates a phone-number fix. Confirm with URL Inspection after GSC access is restored.

## Deep Document and Floorplan Indexing Review

Investigation-only status as of May 26, 2026. No noindex, robots, canonical, sitemap, or internal-link changes were made in this pass.

- Public generated document/floorplan assets found under `public/projects/*/docs/*`: 165 total.
- File types: 90 PDFs, 32 HTML floorplan page copies, and 43 image floorplan/site-plan files.
- Live sample checks returned `200` for an Olara PDF, a NORA House HTML floorplan copy, and a Berkeley floorplan image. The sampled responses did not include an `X-Robots-Tag` noindex header.
- `robots.txt` allows all crawlers and does not disallow `/projects/*/docs/`, so these files are crawlable if discovered.
- `sitemap.xml` does not list the generated document/floorplan asset URLs directly.
- Internal discovery exists through `public/data/floorplans.json` and `src/generated/siteData.ts`; 163 of 165 generated document/floorplan assets are referenced there. The two unreferenced files are the larger Olara all-floorplans PDF and Olara rack brochure PDF under `/projects/olara/docs/`.
- PDF and image assets cannot declare HTML canonicals themselves. In the current static setup they are indexable standalone assets unless blocked by headers or robots rules.
- The 32 NORA House HTML floorplan page copies include canonical tags pointing to the official `https://norahouse.com/floorplan/...` source pages, not to WPB New Construction parent pages. They do not include `noindex`.

Project-level public asset counts:

| Project | Total docs assets | PDFs | HTML pages | Images | Referenced internally | In sitemap | Canonical/noindex notes |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Alba Palm Beach | 9 | 9 | 0 | 0 | 9 | 0 | PDFs have no HTML canonical mechanism. |
| The Berkeley Palm Beach | 8 | 0 | 0 | 8 | 8 | 0 | Images have no HTML canonical mechanism. |
| Forte on Flagler | 3 | 3 | 0 | 0 | 3 | 0 | PDFs have no HTML canonical mechanism. |
| Maison d'Or | 1 | 1 | 0 | 0 | 1 | 0 | PDF has no HTML canonical mechanism. |
| Mr. C Hotel & Residences West Palm Beach | 32 | 32 | 0 | 0 | 32 | 0 | PDFs have no HTML canonical mechanism. |
| NORA House | 64 | 0 | 32 | 32 | 64 | 0 | HTML copies canonicalize to `norahouse.com`; no `noindex` found. Images have no HTML canonical mechanism. |
| Olara | 28 | 28 | 0 | 0 | 26 | 0 | PDFs have no HTML canonical mechanism; Google already surfaced at least two. |
| The Ritz-Carlton Residences, West Palm Beach | 13 | 13 | 0 | 0 | 12 | 0 | PDFs have no HTML canonical mechanism. |
| Shorecrest | 4 | 4 | 0 | 0 | 4 | 0 | PDFs have no HTML canonical mechanism. |
| South Flagler House | 3 | 0 | 0 | 3 | 3 | 0 | Images have no HTML canonical mechanism. |

Recommended decision path for a later implementation:

1. Keep the buyer-facing `/floorplans/` library and project pages indexable.
2. Treat local PDF/image/HTML document copies as support assets rather than landing pages.
3. For PDFs/images that should not rank independently, prefer an `X-Robots-Tag: noindex` header or equivalent static-host header rule, because file-level HTML canonicals are unavailable.
4. For NORA House HTML copies, either noindex them or replace their public discovery path with links to the parent NORA project/floorplan library page; do not leave them as indexable WPB-hosted pages canonicalizing to another domain without a clear reason.
5. If any document asset is intentionally indexable, document the rights basis and the intended parent route so it does not compete with `/projects/<project>/` or `/floorplans/`.

## Top 5 Next Actions

1. In GSC, manually use URL Inspection for the priority URLs now that the sitemap is submitted; request indexing for missing answer, compare, corridor, Olara, and Rosewood pages where available.
2. Re-check GSC Page Indexing after the dashboard finishes processing data.
3. Re-check the Bing sitemap after processing completes; then use Bing URL Inspection/URL Submission for the same priority pages if needed. Do not enable IndexNow yet.
4. Investigate why Google is showing `/corridors/downtown/` and Olara PDFs instead of the preferred canonical pages.
5. Re-run AI prompt tests after GSC/Bing indexing requests have had time to process; current answer engines are citing competitors and official/listing sources, not WPB New Construction.

## What Brooke Must Do Manually

- In GSC, manually run URL Inspection if the automation bar continues not to execute inspections.
- In Bing Webmaster Tools, re-check the submitted sitemap after processing finishes and record discovered URL counts or crawl warnings.
- Solve Bing/Copilot human-verification challenges if Brooke wants public Bing/Copilot checks completed in the same browser profile.
- Decide later whether request logs/Logpush are worth a paid Cloudflare plan path; do not change billing just for this measurement run.
