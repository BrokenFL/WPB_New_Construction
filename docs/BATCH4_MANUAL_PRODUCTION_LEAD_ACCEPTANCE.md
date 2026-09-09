# Batch 4 — one controlled real production lead acceptance

Perform this **once**, manually, when Brooke is ready. This is intentionally separate from automated/intercepted QA.

## Before submitting

- Pick one live project CTA and write down the expected **project** and **interest** before testing.
- Use a fresh private/incognito browser session with normal production JavaScript and no QA stubs or request interception.
- Land first on the page you want treated as the first-touch source, then use the intended live CTA.

## One intentional submission

- Complete the inquiry form with clearly identifiable test contact information.
- Confirm the **production Turnstile challenge succeeds normally**.
- Click **Submit exactly once**. Do not double-click or intentionally retry.
- Record the test timestamp and the expected project/interest.

## Acceptance checks

- [ ] The browser shows one normal success confirmation.
- [ ] Exactly **one** lead record is created.
- [ ] The lead has the expected **project** and **interest**.
- [ ] The expected email/notification arrives exactly once.
- [ ] The database/CRM destination receives exactly one corresponding record.
- [ ] `source_page` sensibly identifies the explicit inquiry/request route and current request context.
- [ ] First-touch / `landing_page` attribution sensibly reflects the first page of this fresh session rather than being overwritten by the later inquiry route.
- [ ] Searching the destination and notifications by test identity/timestamp finds **no duplicate submission**.

## Result

Record **PASS** only if every item above is verified. If any item fails, preserve the timestamp, lead identifier and observed values for diagnosis; do not create repeated production submissions while troubleshooting.