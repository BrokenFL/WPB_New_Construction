# Analytics Events

The site uses `src/lib/analytics.ts` as a vendor-neutral wrapper. It dispatches a local `wpb:analytics` browser event, appends to `window.wpbAnalyticsQueue`, and can forward the same sanitized event to GA4 when a valid `VITE_GA4_MEASUREMENT_ID` is present in a production build.

No event may include a visitor's name, email address, phone number, sensitive financial details, full message text, or private client notes. `analyticsSafety.ts` enforces an explicit field allowlist, drops strings that resemble email addresses or phone numbers, and removes query strings and fragments from analytics paths. GA4 automatic pageviews and advertising-personalization signals are disabled. Without a valid production measurement ID, the wrapper remains local-only and loads no Google script.

## Production setup and verification

1. Configure the approved GA4 web-stream ID as `VITE_GA4_MEASUREMENT_ID` in the Cloudflare Pages production environment. Never commit the real ID to a source file.
2. Confirm the Privacy page and any required consent mechanism for the production audience before enabling the variable.
3. Deploy a verified build and use GA4 DebugView or Tag Assistant plus browser network tools to confirm the clean page location and custom events.
4. Verify that no request contains form fields, message content, query strings, email addresses, or phone numbers.

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
