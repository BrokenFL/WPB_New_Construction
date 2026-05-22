# Analytics Events

The site uses `src/lib/analytics.ts` as a vendor-neutral wrapper. It dispatches a local `wpb:analytics` browser event and appends to `window.wpbAnalyticsQueue` for any future provider adapter.

No event should include names, emails, phone numbers, sensitive financial details, full message text, or private client notes. The wrapper does not set cookies, fingerprint visitors, or load third-party analytics scripts.

| Event | Where Triggered | Payload | Purpose |
| --- | --- | --- | --- |
| `page_view` | Route changes | `route`, `path`, optional `projectId`, optional `corridorKey` | Basic route engagement |
| `building_view` | Building detail route | `buildingSlug`, `buildingName`, `category`, `salesStatus` | Building interest |
| `second_building_view` | Second distinct building in one session | `buildingSlug`, `buildingName`, `viewedBuildings` | Lead-intent threshold |
| `lead_modal_shown` | Soft lead modal display | `viewedBuildingCount`, `viewedBuildings` | Modal exposure |
| `lead_modal_dismissed` | Keep Browsing click | `viewedBuildingCount` | Respectful dismissal |
| `lead_modal_submitted` | Modal primary CTA or accepted inquiry | `viewedBuildingCount`, optional `project`, optional `interest`, optional `leadCaptureContext` | Lead-intent CTA |
| `inquiry_cta_click` | Inquiry links/buttons | `source`, optional `buildingSlug` | CTA engagement |
| `contact_form_open` | Inquiry route | `path`, `viewedCount` | Form reach |
| `lead_form_submit_success` | Inquiry endpoint accepts the submission | `project`, `interest` | App-side submission success |
| `lead_form_submit_fallback` | Endpoint is unavailable and email fallback is shown | `project`, `interest` | Delivery fallback |
| `lead_queue_local_save` | Failed endpoint submission is saved in this browser | `project`, `interest` | Manual recovery path without sending PII to analytics |
| `contact_form_submit` | Inquiry form submit begins after browser validation | `project`, `interest`, `hasPhone`, `hasMessage`, `leadCaptureContext`, `viewedBuildingCount` | Lead submission intent without PII |
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
