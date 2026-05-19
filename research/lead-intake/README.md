# Lead Intake

The site now includes a static lead form named `wpb-lead-intake`.

## Current Behavior

- The inquiry form posts URL-encoded lead data to `/`.
- Static hosts that support form capture, such as Netlify Forms, can ingest the submission automatically because the hidden form definition is present in `index.html`.
- A browser-local backup queue is stored under `localStorage.wpbLeadQueue` for debugging/fallback.
- If the form endpoint is not available, the page shows a mailto fallback link addressed to `info@wpbnewconstruction.com`.

## Captured Fields

- submitted timestamp
- name
- email
- phone
- project
- interest
- message
- consent
- source URL

## Production Decision Still Needed

Point the form to the final CRM, spreadsheet endpoint, or form service once chosen. Until then, deploy on a static host with form capture enabled or use the mailto fallback.
