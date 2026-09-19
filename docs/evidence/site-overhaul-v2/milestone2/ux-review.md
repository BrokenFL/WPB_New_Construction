# Fresh buyer UX review — Milestone 2

Reviewed September 19, 2026. Fresh reviewer configured as Astra extra-high, independent of implementation. Review-only: no source edits, build, commit, external leads or analytics. Initial review used base HEAD `7e894c2b14f1d0613e4464c0a58aac9cbd0db7af` plus in-progress milestone changes. Final built recheck used exact code SHA `0c36a09375dbd1cbe8fa3187aeaefcb49c8873e6`, independently confirmed with `git rev-parse HEAD`.

## Method and scope

Inspected actual Chromium desktop 1440×1000, mobile 390×844, and narrow 320×740 viewports. The initial built preview was `http://127.0.0.1:5188/`; targeted fixes were also inspected on development preview `http://127.0.0.1:5186/`. Initial Playwright CLI routing failed before task interactions; the review restarted in an isolated Playwright browser through Node REPL. Lead POSTs were fulfilled locally, analytics/tag-manager transports aborted, and other non-GET requests blocked. Test contact values use `example.test`; no real lead was sent.

Screenshots and interception evidence: `output/playwright/milestone2-ux/`. This is emulation, not a physical-device or real Safari usability study. Scores are internal task-based judgments, not conversion evidence.

## Observed buyer tasks

| Task | Observation |
|---|---|
| Understand the site | Desktop and mobile hero clearly explain independent buyer guidance, buildings, plans, and comparison. Browse and compare actions are immediately evident. Mobile latest-developments link remains within the 390px opening composition. |
| Return for news | Direct hero link reaches three readable stories: Terra/Frisbie Sep 15, La Fontana Sep 15, Alba Sep 14. Publication and source-report dates are distinguished. Three stories remain visible as ordinary content; no carousel or fake freshness. |
| Turn news into research | La Fontana's Explore North Flagler opens the corridor guide. Alba story explains the buyer implication, identifies the source date, and offers a related completed-building card. |
| Compare buildings | Selected Olara and Alba; desktop columns remain readable. At 390/320, criterion cards keep each building name beside its value. Section links help navigation. No horizontal document overflow observed on Compare at 320. Selections survived reload. |
| Inquire from comparison | Initial built CTA retained both names in the message but displayed generic request context. Final built fix verified: Compare my shortlist; For: Olara West Palm Beach · Alba Palm Beach; primary project Olara and compare intent populated. |
| Recover from a lead error | At 320, valid populated form with local test token received intercepted 503; fields and message stayed intact and retry message appeared. Correct 200 fixture with leadId produced received confirmation and cleared personal inputs. An intermediate incorrectly specified 200 fixture lacked leadId and correctly remained an error; this was test-fixture behavior, not an app failure. |
| Inspect gallery | Olara living-room image opened, ArrowRight advanced to Intracoastal View, Escape closed, and focus returned to the opener. Mobile landscape imagery fits with large letterboxing; controls remain understandable. |
| Inspect floor plans | Alba Residence A PDF viewer loaded, showed the title and Previous/Next controls, and returned focus on Escape in Chromium. Its Contact the Team CTA initially lost building/residence context; the final built repair carries both into the request summary and message (see findings). Olara Residence D entity page clearly separated interior/exterior area and availability caveats; inquiry retained Olara as the primary building. |
| Recognize restored graphic | Original skyline/bridge illustration visible at bottom of homepage at 320. Character and placement remain legible. Final built homepage document and body widths equal 320 at 320, and 390 at 390; broad QA resolution is recorded below. |

## Concrete findings sent to implementation lead

1. **Homepage status contradiction.** Alba latest story and article card said completed/move-in ready while the homepage Collection card said Under Construction. Olara Collection completion 2027 also contradicted the homepage map 2028. Lead traced the consumer to legacy card hydration. Dev recheck confirmed Alba COMPLETED / 2Q 2026, Olara 2028 DELIVERY, and Shorecrest CONFIRM WITH SALES TEAM without changing approved facts. Existing Olara numeric narrative conflict (275 versus Compare 257) was separately flagged for removal of the stale legacy numeric phrase. Final built recheck passed.
2. **Comparison inquiry presented generic context.** Both selected names reached the message, but request summary and intent said current availability and generic WPB inquiry. Targeted dev fix independently verified as described above. Final built recheck passed.
3. **Library plan CTA loses the selected plan.** `/floorplans/` → Alba Residence A PDF dialog → Contact the Team used only `/inquire/?interest=floorplans`; destination project and message were blank. Dev repair verified: dialog title and inquiry message identify Alba Residence A, project populated, dialog closes. Display-name correction independently verified: For: Alba Palm Beach · Residence A. Final built recheck passed.
4. **A prior success confirmation persists into a different inquiry.** After intercepted success for Alba Residence A, navigated Floor plans → Alba Residence B → Contact the Team. The new message correctly named Residence B, but `.form-status` still said the request was received without any additional POST. Reproduced on dev. Dev correction independently verified: submitted Residence A successfully, then opened Residence B inquiry; summary/message identify Residence B, status is empty, and exactly zero new POSTs occurred. Final built recheck passed.

## Scores

Initial built review: desktop **8.3/10**, mobile **8.0/10** before the context/status repairs.

Final independent buyer UX score, after exercising the repairs on the development preview and exact built preview: desktop **8.5/10**, mobile **8.2/10**. The higher scores reflect demonstrated task improvements: visible shortlist/plan identity, consistent Alba completion status, successful error recovery, and clearing a prior receipt when starting a different inquiry. Both exceed the existing eight-point rubric. These scores remain reviewer judgments and do not replace technical QA or real-user measurements.

The main residual usability tradeoff is length: the mobile comparison exposes 50 criteria and the form asks for roughly 10 fields plus substantial consent copy. Both are readable; cards and section navigation materially improve use, but this is not a frictionless short task. Desktop inquiry retains considerable empty space beside the lower form. These are bounded polish limitations, not a request for an additional redesign cycle.

## Existing regression evidence reviewed

`output/playwright/milestone2-qa.json`, generated `2026-09-19T14:14:39.757Z`, reports 53/60 passed across Chromium/WebKit 1440/390/320. Seven failures: homepage body scrollWidth exceeds viewport at 390/320 in both engines; floorplan Escape focus return in WebKit at all three widths. Independent Chromium focus-return checks passed. These initial failures were not waived by UX scores; they were subsequently resolved in the final regression report below.

## Final built recheck

Passed on `http://127.0.0.1:5188/` at exact SHA `0c36a09375dbd1cbe8fa3187aeaefcb49c8873e6`.

- Homepage: Alba COMPLETED; desktop delivery guidance 2Q 2026; Olara 2028 DELIVERY; Shorecrest confirmation wording; stale 275-residence legacy phrase removed.
- Comparison: selected Olara and Alba; visible summary names both; primary project and compare intent match the selection.
- Plan library at 320: dialog names Alba Palm Beach · Residence A; inquiry closes the dialog and carries building, residence, packet intent and message.
- Final intercepted lead sequence: 503 then 200; error retained name/plan message, successful retry cleared personal fields.
- After success for Residence A, opening Residence B inquiry changed summary/message, cleared receipt status, and caused **exactly zero new POSTs**.
- Restored graphic visible; homepage body/document width 390 at 390 and 320 at 320.

Evidence is in `output/playwright/milestone2-ux/final-recheck.json`, final-prefixed screenshots, and `intercepted-leads.json`. No real leads or analytics were sent. No additional UX cycle recommended.

The final cross-browser regression report was read after these task checks: `output/playwright/milestone2-qa.json`, generated `2026-09-19T14:31:36.919Z`, **72/72 passed, zero failed**. This supersedes the initial seven failures recorded above. Those are the QA agent's checks; the independent UX reviewer directly exercised Chromium only.
