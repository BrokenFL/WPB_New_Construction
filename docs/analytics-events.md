# Analytics Events

The site uses `src/lib/analytics.ts` as a vendor-neutral wrapper. It dispatches a local `wpb:analytics` browser event, appends to `window.wpbAnalyticsQueue`, and can forward the same sanitized event to GA4 when a valid `VITE_GA4_MEASUREMENT_ID` is present in a production build **and the visitor has allowed optional analytics**.

No event may include a visitor's name, email address, phone number, sensitive financial details, full message text, or private client notes. `analyticsSafety.ts` enforces an explicit field allowlist, drops strings that resemble email addresses or phone numbers, and removes query strings and fragments from analytics paths. GA4 automatic pageviews and advertising-personalization signals are disabled.

## Analytics consent

WPB New Construction uses a basic, privacy-conservative analytics consent model:

- Google Analytics does not load or send collection requests before analytics consent is granted.
- The visitor can choose `Allow analytics` or `No thanks` from the first-party consent prompt.
- The choice is stored in browser local storage under `wpbAnalyticsConsentV1`.
- When granted, `analytics_storage` is granted while `ad_storage`, `ad_user_data`, and `ad_personalization` remain denied.
- When denied, GA4 remains inactive.
- The site does not use this integration for Google Ads or advertising personalization.
- The strict PII allowlist remains in force after consent.

## Production setup and verification

The site is built in GitHub Actions before the generated `dist/` directory is deployed to Cloudflare Pages, so the GA4 measurement ID must be present in the GitHub Actions **Build site** environment. The approved GA4 web-stream measurement ID is public browser configuration, not an authentication secret, and is wired in the deployment workflow as `VITE_GA4_MEASUREMENT_ID`.

Before and after production release:

1. Build and run the analytics safety QA plus the full launch/gatekeeper suite.
2. Confirm no Google Analytics script or collection request appears before optional analytics consent.
3. Accept analytics and use GA4 Realtime/DebugView or Tag Assistant plus browser network tools to confirm clean page locations and approved custom events.
4. Reject analytics in a fresh browser/session and confirm GA4 remains inactive.
5. Verify no request contains form fields, message content, query strings, email addresses, or phone numbers.
6. Do not enable a second Google/Cloudflare tag installation path unless it is deliberately integrated with the same consent model and proven not to double-count events.

| Event | Where Triggered | Payload | Purpose |
| --- | --- | --- | --- |
| `page_view` | Route changes | `route`, `path`, optional `projectId`, optional `corridorKey` | Basic route engagement |
| `building_view` | Building detail route | `buildingSlug`, `buildingName`, `category`, `salesStatus` | Building interest |
| `second_building_view` | Second distinct building in one session | `buildingSlug`, `buildingName`, `viewedBuildings` | Lead-intent threshold |
| `cta_click` | Buyer-facing CTAs across header, mobile nav, home, compare, corridor, project, and article flows | `location`, `pageType`, `path`, optional `projectSlug`, optional `projectName`, optional `corridor`, optional `ctaText`, optional `leadCaptureContext` | Standard intent click |
| `lead_capture_shown` | Timed building-watch modal display | `viewedBuildingCount`, `viewedBuildings`, `location`, `pageType`, `path` | Modal exposure |
| `lead_capture_dismissed` | Timed building-watch modal dismissal | `viewedBuildingCount`, `location`, `pageType`, `path` | Respectful dismissal |
| `lead_capture_cta_click` | Timed building-watch modal CTA or email signup submit intent | `location`, `pageType`, `path`, optional `projectSlug`, optional `projectName`, optional `corridor`, optional `ctaText`, optional `leadCaptureContext` | Lead-capture intent click |
| `contact_form_start` | Inquiry form first focus/interaction | Form location and page/project/corridor context; optional originating `articleId` | Form reach |
| `contact_form_submit` | Inquiry form submit begins after browser validation | Form context, `interest`, `hasPhone`, `hasMessage`, `viewedBuildingCount`; optional originating `articleId` | Lead submission intent without PII |
| `lead_form_submit_success` | Inquiry endpoint accepts the submission | Form context and optional originating `articleId` | App-side submission success |
| `lead_form_submit_failure` | Inquiry endpoint rejects or cannot accept the submission | `location`, `pageType`, `path`, optional project/corridor/article context, `interest`, `leadCaptureContext`, `errorCode` | App-side submission failure without sending the submitted values |
| `phone_click` | Phone links | Page/project/article context | Direct contact intent |
| `email_click` | Email links | Page/project/article context | Direct contact intent |
| `map_opened` | Links to the map route | `path`, `sourcePath` | Map engagement |
| `compare_opened` | Links to the compare route | `path`, `sourcePath`, optional `projectSlug` | Comparison intent |
| `floor_plan_click` | Floorplan viewer buttons and project-to-library links | `buildingSlug`, `planName`, `path` | Project-to-floorplan intent without transmitting a source URL |
| `article_to_project_click` | An article links into a project page | `articleId`, `projectSlug`, `path` | Article-to-buyer journey |
| `source_click` | External reviewed-source cards | `buildingSlug`, `sourceHost`, `path` | Trust/source engagement without transmitting a full external URL |
| `update_article_view` | Updates route anchors | `articleId` | News engagement |
| `blog_article_view` | Market Notes article route | `articleSlug` | Editorial engagement |
| `newsletter_signup` | Future signup form | `source` | Subscription intent |
