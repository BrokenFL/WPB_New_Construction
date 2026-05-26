# GEO Measurement Results

Run date: 2026-05-26  
Site: `https://www.wpbnewconstruction.com`

Follow-up update: later on 2026-05-26, Search Console access became available for `sc-domain:wpbnewconstruction.com`. The sitemap was submitted successfully and read by Google. Bing remained unverified and required a verification change or Google-import consent.

## Executive Summary

The recent SEO/GEO files are live and crawlable: `sitemap.xml`, `robots.txt`, and `llms.txt` all returned `200`, and the live sitemap contains 52 URLs including the priority answer, corridor, compare, and project routes.

The biggest remaining blockers are URL-level inspection execution and Bing verification. Google Search Console is now accessible for Brooke's signed-in Google account and the sitemap has been submitted successfully. However, the URL Inspection bar accepted typed URLs but did not launch inspection results through the automated Chrome session, so priority URL indexing/request-indexing data is still not available. Bing Webmaster Tools shows the site as not verified and requires either a site/DNS/code change or Google-import consent before sitemap and URL tools can be used.

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
- Page Indexing report:
  - Still processing data.
  - No indexed/not-indexed reason table was available yet.

## Bing Findings

- Bing Webmaster Tools is accessible enough to show the pending site record, but the site is not verified.
- Site shown: `https://wpbnewconstruction.com/`
- Status: Not verified
- Modified: 58 minutes ago at the time of the follow-up check.
- Google Search Console import remains available, but using it would require Google/Bing consent and was not used.
- Verification methods shown:
  - XML file: download `BingSiteAuth.xml` and upload it to `https://wpbnewconstruction.com/BingSiteAuth.xml`. Bing currently says it cannot access that XML file.
  - HTML meta tag: `<meta name="msvalidate.01" content="4536DF263E4510BEB421D8E762573C57" />`
  - DNS CNAME: name `18fed6d8ed16ba6c11e95db76e51a826`, value `verify.bing.com.`
- No verification action was taken because all available manual methods require a site, code, file, DNS, or consent change.
- Sitemap submission and URL inspection: not available until verification is completed.
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
  - Time shown: 11:06 AM May 26, 2026; refreshed later as "an hour ago"
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

## Top 5 Next Actions

1. In GSC, manually use URL Inspection for the priority URLs now that the sitemap is submitted; request indexing for missing answer, compare, corridor, Olara, and Rosewood pages where available.
2. Re-check GSC Page Indexing after the dashboard finishes processing data.
3. Complete Bing Webmaster Tools verification with Brooke's approval, then submit the sitemap and inspect priority URLs. Do not enable IndexNow yet.
4. Investigate why Google is showing `/corridors/downtown/` and Olara PDFs instead of the preferred canonical pages.
5. Re-run AI prompt tests after GSC/Bing indexing requests have had time to process; current answer engines are citing competitors and official/listing sources, not WPB New Construction.

## What Brooke Must Do Manually

- In GSC, manually run URL Inspection if the automation bar continues not to execute inspections.
- Approve a Bing verification path: upload `BingSiteAuth.xml`, add the HTML meta tag, add the DNS CNAME, or approve Google Search Console import consent.
- Solve Bing/Copilot human-verification challenges if Brooke wants public Bing/Copilot checks completed in the same browser profile.
- Decide later whether request logs/Logpush are worth a paid Cloudflare plan path; do not change billing just for this measurement run.
