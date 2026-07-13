# Lead capture

Lead forms use the same same-origin `POST /api/leads` endpoint:

- `inquiry` — the main inquiry page
- `email_updates` — update cards and the building-watch popup
- `project_inquiry` — full project-page contact cards

The endpoint validates the request, consent, origin, Turnstile, honeypot, and a short IP-hash rate limit. It inserts the lead into D1 before attempting either email. The browser never stores a failed lead in `localStorage`; attribution is limited to non-PII `sessionStorage` context.

## Required Cloudflare Pages configuration

The current Cloudflare account has no D1 database, Turnstile widget, Pages variables, or Pages bindings configured for this project. Production setup is therefore still a separate operator step.

1. Create a D1 database named `wpbnewconstruction-leads`.
2. Apply `migrations/0001_leads.sql`.
3. Bind it to Pages Production as `LEADS_DB`.
4. Create a Turnstile widget for `wpbnewconstruction.com` and set the public build variable `VITE_TURNSTILE_SITE_KEY`.
5. Verify `wpbnewconstruction.com` in Resend and set the Pages secrets `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`, and `LEAD_RETRY_TOKEN`.
6. Set `LEAD_HASH_SALT` to a random secret. Optional overrides are `LEAD_NOTIFICATION_EMAIL`, `LEAD_FROM_EMAIL`, `LEAD_REPLY_TO_EMAIL`, and `LEAD_ALLOWED_ORIGINS`.

Use `wrangler.toml.example` as the binding shape. It intentionally contains a placeholder database ID and is not a production configuration.

## Email delivery and retries

Resend sends a notification to Brooke and a visitor acknowledgment from `WPB New Construction Concierge <concierge@wpbnewconstruction.com>`. Both deliveries are recorded on `leads`, with each attempt recorded in `lead_delivery_attempts`. A failed email does not erase the durable lead or produce a false browser success; `/api/leads/retry` can retry pending/failed deliveries with `Authorization: Bearer $LEAD_RETRY_TOKEN`, up to five attempts per delivery type.

Production verification should submit a real test lead, confirm the D1 row, Brooke's notification, the visitor acknowledgment, provider IDs, and a forced Resend failure before any live deployment is approved.
