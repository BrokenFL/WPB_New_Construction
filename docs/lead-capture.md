# Lead capture

Lead forms use the same same-origin `POST /api/leads` endpoint:

- `inquiry` — the main inquiry page
- `email_updates` — update cards and the building-watch popup
- `project_inquiry` — full project-page contact cards

The endpoint validates the request, consent, origin, Turnstile, honeypot, and a short IP-hash rate limit. It inserts the lead into D1 before attempting either email. The browser never stores a failed lead in `localStorage`; attribution is limited to non-PII `sessionStorage` context.

## Cloudflare Pages configuration

The production D1 database has been created as `wpb-leads`, migrated with `migrations/0001_leads.sql`, and is defined in the repository's `wrangler.toml` as the `LEADS_DB` Pages binding. The Turnstile widget, Pages variables/secrets, Resend sender, and email-routing state still require verification before production lead testing.

1. Keep `wrangler.toml` aligned with the Pages project and `LEADS_DB` binding.
2. Create a Turnstile widget for `wpbnewconstruction.com` and `www.wpbnewconstruction.com`, then set the public build variable `VITE_TURNSTILE_SITE_KEY`.
3. Verify `wpbnewconstruction.com` in Resend and set the Pages secrets `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`, and `LEAD_RETRY_TOKEN`.
4. Set `LEAD_HASH_SALT` to a random secret. Optional overrides are `LEAD_NOTIFICATION_EMAIL`, `LEAD_FROM_EMAIL`, `LEAD_REPLY_TO_EMAIL`, and `LEAD_ALLOWED_ORIGINS`.

Use `wrangler.toml.example` as the sanitized template. `wrangler.toml` contains the non-secret production D1 identifier and is the Pages binding source of truth.

## Email delivery and retries

Resend sends a notification to Brooke and a visitor acknowledgment from `WPB New Construction Concierge <concierge@wpbnewconstruction.com>`. Both deliveries are recorded on `leads`, with each attempt recorded in `lead_delivery_attempts`. A failed email does not erase the durable lead or produce a false browser success; `/api/leads/retry` can retry pending/failed deliveries with `Authorization: Bearer $LEAD_RETRY_TOKEN`, up to five attempts per delivery type.

Production verification should submit a real test lead, confirm the D1 row, Brooke's notification, the visitor acknowledgment, provider IDs, and a forced Resend failure before any live deployment is approved.
