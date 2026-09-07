# PR #76 — corridor release verification

Recorded September 7, 2026 UTC. Repository: `BrokenFL/WPB_New_Construction`.

## Outcome

**Brooke approved PR #76. It is merged, deployed and live-verified. Search/lead growth is not yet measured.** PR #75 and analytics settings remain parked and untouched. Approval and deployment apply to the corridor batch only, not Batch 2.

| Identity | Value |
|---|---|
| Approved implementation | `04544146bc0187c46ec7fd1c90247fbffc5aee0d` |
| Documentation-only release head | `ef5cf83136f43e85c417fd141b126b933bb978b9` |
| Merge / deployed application SHA | `8128f7a5a24706a8fc743f156f2f1d0505f1b462` |
| Production workflow | [34152334484](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34152334484), normal main push, attempt 1, SUCCESS |
| Production job | `101837007547`: build, launch QA, gatekeeper and actual Cloudflare deployment all SUCCESS |
| Live audit workflow | [34153465427](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34153465427), audit-only branch, SUCCESS |
| Live audit script revision | `1b776d2d1813efcc0f809275fa3f1134d921676d` on `p2-76-live-verification`; application source equals deployed SHA |
| Completed live evidence timestamp | `2026-09-07T18:57:28.444Z` |

Before merge, the current diff was reviewed and the successor was confirmed to change only the two documentation files. Both current-head candidate jobs and aggregate gate passed in run [34150578884](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34150578884). Branch-protection administration could not be read with the connector's permissions; the ordinary expected-head GitHub merge succeeded without an override. PR #76 was marked ready and merged normally. The automatic deployment ran once; no manual deployment was started.

## Live routes and evidence

Production origin: `https://www.wpbnewconstruction.com`.

- `/corridors/downtown-west-palm-beach/`
- `/corridors/south-flagler/`
- `/corridors/palm-beach/`
- `/sitemap.xml`, plus linked project/answer/plan/research routes and `/inquire/` in the journeys.

Results: **3/3 live static corridor checks; 12/12 desktop/mobile JavaScript-on/off views; 18/18 intercepted inquiry submissions; 33 internal links/assets healthy.** Titles, descriptions, single H1s, clean canonicals and matching collection/breadcrumb/project-list schema passed. Each corridor's sitemap `lastmod` is `2026-09-07`. Desktop/mobile screenshots were inspected. Images loaded, layout containment and minimum CTA target checks passed. Native project navigation and back navigation retained corridor metadata.

The six corridor request products and switches to/from Olara Residence D and commercial requests preserved selected project, corridor, request intent and first-touch landing page in the actual client POST payload. Contact values were absent from the local analytics/dataLayer inspection; submissions emitted one local submit/success event. All lead POSTs and third-party analytics requests were intercepted. **No real leads were sent. Production CAPTCHA validation and CRM delivery were not tested or certified.** This does not resolve or retest parked GA4 transport.

Alba Residence D HTML returns **404** and is excluded from the live sitemap. Existing PDF assets and Olara's published plan/discovery remain unchanged.

[Final live artifact 10030217258](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34153465427/artifacts/10030217258), downloaded SHA-256 verified:
`0ec881f1095640bf0a59243e0ffb9b8b63fb9ca90ad2f341a7d4fd9906aed13b`.
The archive contains safe screenshots and results, not raw lead payloads, compiled key-bearing bundles or HARs.

## Test-readiness correction and boundaries

Initial live audits exposed a test readiness error: static prerender content is also inside `#app`. Waiting for `#app [data-corridor-growth]` did not establish that click listeners were installed; very early native clicks could reach a generic or previously remembered inquiry context. A read-only trace confirmed absent request-store writes on those early clicks. No website code was changed to force the test green.

The final audit waits for the actual `.site-shell` corridor/commercial enhancement; the standalone Olara page waits for its local initialization event. All original payload, privacy, canonical and event-count assertions remain. The complete matrix then passed against the same deployed source. The audit-only harness does not certify attribution before JavaScript initialization or with JavaScript disabled; those modes retain ordinary crawlable navigation. Preserve this distinction in future tests, and track early-click attribution hardening independently rather than claiming that boundary was fixed by a harness change.

## Next

Batch 2 may now branch from updated production main. Improve the existing North/South comparison and implement only a source-supported Olara/Ritz-Carlton/Shorecrest comparison with a selected-building shortlist flow. It requires its own tested draft PR and separate release approval. No further production deployment is authorized by the corridor approval.
