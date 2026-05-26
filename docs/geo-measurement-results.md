# GEO Measurement Results

Run date: 2026-05-26  
Site: `https://www.wpbnewconstruction.com`

## Executive Summary

The recent SEO/GEO files are live and crawlable: `sitemap.xml`, `robots.txt`, and `llms.txt` all returned `200`, and the live sitemap contains 52 URLs including the priority answer, corridor, compare, and project routes.

The biggest blocker is account-level access. Google Search Console is not available to Brooke's signed-in Google account for the domain property, so sitemap submission, URL inspection, and indexing requests could not be performed. Bing Webmaster Tools also required a Google sign-in consent step before the account dashboard could be reached; that step was paused because it would share Brooke's Google profile/email with Bing.

Public Google discovery is partial. Google shows the homepage and at least one corridor page, but the answer hub did not appear for `site:wpbnewconstruction.com/answers`, the current Downtown canonical did not appear for the expected `/corridors/downtown-west-palm-beach/` path, and the Olara project query surfaced floorplan PDFs instead of the canonical project page. AI answer engines tested so far did not mention or cite `wpbnewconstruction.com`.

## GSC Findings

- Property checked: `sc-domain:wpbnewconstruction.com`
- Signed-in account shown: `brooke.snader@gmail.com`
- Verification/access status: not accessible to this Google account.
- GSC message: "Oops, you don't have access to this property."
- Verification options shown:
  - Verify domain ownership via DNS record for `wpbnewconstruction.com`.
  - Instructions for any DNS provider, with a Cloudflare.com start-verification flow.
  - Alternate note: for more verification methods, try a URL-prefix property instead.
- Sitemap submission: not performed because the property is not accessible.
- URL Inspection: not performed because the property is not accessible.
- Indexing requests: not performed because URL Inspection is unavailable.

## Bing Findings

- Bing Webmaster Tools opened at the public/about page, not the verified dashboard.
- A Bing sign-in flow offered Google sign-in and then a Google consent screen for `bing.com`.
- The consent screen would share Brooke Snader's name/profile picture and `brooke.snader@gmail.com` email address with Bing.
- I paused before clicking Continue.
- Verification status: unknown until Brooke approves sign-in or uses another Bing/Microsoft account.
- Sitemap submission and URL inspection: not performed because the dashboard was not reached.
- IndexNow: not enabled.

## Cloudflare Findings

- Account dashboard access: available in Brooke's Chrome profile.
- Pages project: `wpbnewconstruction`.
- Current production deployment visible in Cloudflare Pages:
  - Environment: Production
  - Source: `main`
  - Deployment label: `Fix Brooke contact phone number`
  - Deployment URL: `https://a30c0c03.wpbnewconstruction.pages.dev`
  - Deployment ID: `a30c0c03-c522-450b-b611-24604771a3c3`
  - Status: success
  - Time shown: 11:06 AM May 26, 2026
  - Assets uploaded: 349 files
- Latest local git commit matching the visible deployment label:
  - `8cda81e79eeb7fcc64932f54e29ad150874acfdf`
  - `Fix Brooke contact phone number`
- Web Analytics:
  - Site exists: `wpbnewconstruction.com`
  - Created: 8 days ago
  - Last 24 hours on site list: 21 page views, 16 visits
  - Overview page with `Exclude bots = Yes`: 22 page views, 17 visits
  - Available range viewed: Last 24 hours, EDT
  - Core Web Vitals rows included homepage, project, updates, downtown corridor, and builder URLs.
  - No AI/LLM referrers were visible in the dashboard text captured.
- Request logs:
  - Logpush page states Logpush is available on Enterprise plans and Workers Paid plans.
  - Log Explorer / Log Search routes resolved back to the Logpush upsell/information page.
  - No request-log search was available for crawler user agents in this account view.

## Public Search Findings

### Google

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

- Several Bing public search result pages showed a "One last step / Please solve the challenge below to continue" human-verification challenge.
- I did not attempt to solve the challenge.
- The query `"wpbnewconstruction.com" "best new construction condos in West Palm Beach"` loaded without normal organic WPB results; visible content was mainly videos and query-expansion text.
- The query `"wpbnewconstruction.com" "Olara"` returned "There are no results for..." plus ads/recommendations.

## AI Answer-Engine Prompt-Test Findings

Detailed rows are in `research/geo/ai-answer-engine-tests.csv`.

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

Unable to confirm via GSC URL Inspection because the property is not accessible. From public Google checks, these priority areas need attention:

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

## Top 5 Next Actions

1. Restore Google Search Console access for Brooke, either by granting `brooke.snader@gmail.com` access or completing ownership verification with a method Brooke approves.
2. After GSC access, submit/confirm `https://www.wpbnewconstruction.com/sitemap.xml`, inspect every priority URL, and request indexing for missing answer, compare, corridor, Olara, and Rosewood pages where available.
3. Complete Bing Webmaster Tools sign-in/verification with Brooke's approval, then submit the sitemap and inspect priority URLs. Do not enable IndexNow yet.
4. Investigate why Google is showing `/corridors/downtown/` and Olara PDFs instead of the preferred canonical pages.
5. Re-run AI prompt tests after GSC/Bing indexing requests have had time to process; current answer engines are citing competitors and official/listing sources, not WPB New Construction.

## What Brooke Must Do Manually

- Approve or perform GSC ownership verification. The visible GSC option is a DNS/Cloudflare verification flow; do not start it casually because it touches ownership verification.
- Approve whether to continue the Bing Google sign-in consent screen, or provide/use a Microsoft/Bing account that already owns the property.
- Solve Bing/Copilot human-verification challenges if Brooke wants public Bing/Copilot checks completed in the same browser profile.
- Decide later whether request logs/Logpush are worth a paid Cloudflare plan path; do not change billing just for this measurement run.
