# Analytics Events

The site uses `src/lib/analytics.ts` as a vendor-neutral wrapper. It dispatches a local `wpb:analytics` browser event and appends to `window.wpbAnalyticsQueue` for any future provider adapter.

No event should include names, emails, phone numbers, sensitive financial details, full message text, or private client notes. The wrapper does not set cookies, fingerprint visitors, or load third-party analytics scripts.

| Event | Where Triggered | Payload | Purpose |
| --- | --- | --- | --- |
| `page_view` | Route changes | `route`, `path`, optional `projectId`, optional `corridorKey` | Basic route engagement |
| `building_view` | Building detail route | `buildingSlug`, `buildingName`, `category`, `salesStatus` | Building interest |
| `second_building_view` | Second distinct building in one session | `buildingSlug`, `buildingName`, `viewedBuildings` | Lead-intent threshold |
| `cta_click` | Buyer-facing CTAs across header, mobile nav, home, compare, corridor, project, and article flows | `location`, `pageType`, `path`, optional `projectSlug`, optional `projectName`, optional `corridor`, optional `ctaText`, optional `leadCaptureContext` | Standard intent click |
| `lead_capture_shown` | Timed building-watch modal display | `viewedBuildingCount`, `viewedBuildings`, `location`, `pageType`, `path` | Modal exposure |
| `lead_capture_dismissed` | Timed building-watch modal dismissal | `viewedBuildingCount`, `location`, `pageType`, `path` | Respectful dismissal |
| `lead_capture_cta_click` | Timed building-watch modal CTA or email signup submit intent | `location`, `pageType`, `path`, optional `projectSlug`, optional `projectName`, optional `corridor`, optional `ctaText`, optional `leadCaptureContext` | Lead-capture intent click |
| `contact_form_start` | Inquiry form first focus/interaction | `location`, `pageType`, `path`, optional `projectSlug`, optional `projectName`, optional `corridor`, optional `leadCaptureContext` | Form reach |
| `contact_form_submit` | Inquiry form submit begins after browser validation | `location`, `pageType`, `path`, optional `projectSlug`, optional `projectName`, optional `corridor`, `interest`, `hasPhone`, `hasMessage`, `leadCaptureContext`, `viewedBuildingCount` | Lead submission intent without PII |
| `lead_form_submit_success` | Inquiry endpoint accepts the submission | `location`, `pageType`, `path`, optional `projectSlug`, optional `projectName`, optional `corridor`, `interest`, `leadCaptureContext` | App-side submission success |
| `lead_form_submit_fallback` | Endpoint is unavailable and email fallback is shown | `location`, `pageType`, `path`, optional `projectSlug`, optional `projectName`, optional `corridor`, `interest`, `leadCaptureContext` | Delivery fallback |
| `lead_queue_local_save` | Failed endpoint submission is saved in this browser | `location`, `pageType`, `path`, optional `projectSlug`, optional `projectName`, optional `corridor`, `interest` | Manual recovery path without sending PII to analytics |
| `phone_click` | Phone links | `source` | Direct contact intent |
| `email_click` | Email links | `source` | Direct contact intent |
| `map_opened` | Atlas route/hash | `path` | Map engagement |
| `compare_opened` | Compare/project index hash | `path` | Comparison intent |
| `floor_plan_click` | Floorplan/resource links | `buildingSlug`, `planName`, `sourceUrl` | Floorplan intent |
| `source_click` | Source/resource links | `buildingSlug`, `sourceUrl` | Trust/source engagement |
| `official_media_click` | Official/rendering/media links | `buildingSlug`, `sourceUrl` | Media engagement |
| `update_article_view` | Updates route anchors | `articleId` | News engagement |
| `blog_article_view` | Market Notes article route | `articleSlug` | Editorial engagement |
| `newsletter_signup` | Future signup form | `source` | Subscription intent |
