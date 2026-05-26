# GEO Measurement

This document tracks the measurement layer for WPB New Construction answer-engine visibility. It is limited to measurement setup, indexing workflows, crawl verification, and manual prompt-test tracking.

## Live Crawl Files

- Sitemap: `https://www.wpbnewconstruction.com/sitemap.xml`
- Robots: `https://www.wpbnewconstruction.com/robots.txt`
- LLM guide: `https://www.wpbnewconstruction.com/llms.txt`

Current deployment note: Cloudflare Pages is published through direct Wrangler uploads for the `wpbnewconstruction` project. Confirm the live deployment source before treating GitHub branch state as live state.

## Priority URLs

Inspect and monitor these first in Google Search Console and Bing Webmaster Tools:

- `https://www.wpbnewconstruction.com/`
- `https://www.wpbnewconstruction.com/compare/`
- `https://www.wpbnewconstruction.com/buildings/`
- `https://www.wpbnewconstruction.com/floorplans/`
- `https://www.wpbnewconstruction.com/answers/`
- `https://www.wpbnewconstruction.com/answers/best-new-construction-condos-west-palm-beach/`
- `https://www.wpbnewconstruction.com/answers/closest-new-condos-to-palm-beach/`
- `https://www.wpbnewconstruction.com/corridors/north-flagler/`
- `https://www.wpbnewconstruction.com/corridors/downtown-west-palm-beach/`
- `https://www.wpbnewconstruction.com/corridors/south-flagler/`
- `https://www.wpbnewconstruction.com/projects/olara/`
- `https://www.wpbnewconstruction.com/projects/shorecrest/`
- `https://www.wpbnewconstruction.com/projects/south-flagler-house/`
- `https://www.wpbnewconstruction.com/projects/ritz-carlton-wpb/`
- `https://www.wpbnewconstruction.com/projects/berkeley/`
- `https://www.wpbnewconstruction.com/projects/rosewood/`

## Google Search Console Checklist

- Verify the domain or URL-prefix property for `wpbnewconstruction.com`.
- Submit `https://www.wpbnewconstruction.com/sitemap.xml`.
- Confirm the submitted sitemap is discovered and processed without fetch errors.
- Use URL Inspection on the priority URLs.
- Request indexing manually for priority pages that are not indexed or have stale discovered content.
- Review Pages indexing, Crawl stats, Sitemaps, and Search results reports weekly during the first post-launch measurement period.
- Track impressions, clicks, average position, indexed status, last crawl, referring query, and canonical chosen by Google.

## Bing Webmaster Tools Checklist

- Add and verify `wpbnewconstruction.com`.
- Submit `https://www.wpbnewconstruction.com/sitemap.xml`.
- Inspect the priority URLs with URL Inspection.
- Review Indexing, Crawl information, Site Explorer, and Search Performance.
- Decide later whether to add IndexNow after sitemap and crawl health are stable.
- Do not add IndexNow code until it is approved as a separate phase.

## Cloudflare Analytics And Logs Checklist

- Confirm Cloudflare Pages project: `wpbnewconstruction`.
- Confirm production domains: `wpbnewconstruction.com` and `www.wpbnewconstruction.com`.
- Check whether the account plan exposes request logs, Instant Logs, or Logpush.
- If request logs are available, monitor these user agents:
  - `GPTBot`
  - `OAI-SearchBot`
  - `PerplexityBot`
  - `Perplexity-User`
  - `ClaudeBot`
  - `Claude-SearchBot`
  - `GoogleOther`
  - `Googlebot`
  - `Bingbot`
  - `Applebot`
- If request logs are not available, use Cloudflare Web Analytics plus Search Console, Bing Webmaster Tools, and manual prompt-test results as the practical fallback.
- Keep crawler-file checks focused on the live URLs, not only local `public/` or `dist/` output.

## GA4 Decision Notes

- GA4 code is not installed in this phase.
- Current site analytics are routed through the vendor-neutral wrapper in `src/lib/analytics.ts`.
- Before GA4 implementation, decide:
  - GA4 property and measurement ID.
  - Whether analytics requires a consent banner or Consent Mode setup.
  - Which events should be sent to GA4 and which should remain local only.
  - How AI referrer classification should appear in reports.
- Future GA4 setup should use an environment variable such as `VITE_GA4_MEASUREMENT_ID`.
- Do not record names, emails, phone numbers, message text, private client notes, or buyer-sensitive financial details in analytics payloads.

## AI Referrer Domains To Monitor

Monitor source/referrer values and landing pages for:

- `chatgpt.com`
- `openai.com`
- `perplexity.ai`
- `claude.ai`
- `anthropic.com`
- `gemini.google.com`
- `bard.google.com`
- `copilot.microsoft.com`
- `bing.com/chat`
- `bing.com/copilot`
- `bing.com`
- other clear answer-engine or AI-assistant referrers as they appear

Google AI Overview traffic may not always appear as a distinct referrer. Treat it as detectable only when reporting exposes a reliable signal.

## AI Prompt Testing Workflow

Use `research/geo/ai-answer-engine-tests.csv` for manual answer-engine checks.

For each run:

- Use a fresh browser/session where practical.
- Record the date in `YYYY-MM-DD` format.
- Run the same prompt across ChatGPT, Perplexity, Gemini, and Copilot/Bing.
- Record whether `wpbnewconstruction.com` is mentioned.
- Record whether it is cited with a clickable source.
- Record the cited URL if present.
- Record competing cited URLs.
- Note personalization, location, logged-in state, or answer caveats.

Prompt categories:

- best new construction condos in West Palm Beach
- closest new condos to Palm Beach
- Olara vs Shorecrest
- North Flagler vs South Flagler
- West Palm Beach condo floor plans
- condo fees buyers should verify
- new construction condos near downtown West Palm Beach
- Palm Beach vs West Palm Beach new construction

## Future Contact And Schema Note

For future schema, contact, or analytics work, Brooke Snader's confirmed phone number is:

- `561-891-0816`

Do not use `561-891-0186`.
