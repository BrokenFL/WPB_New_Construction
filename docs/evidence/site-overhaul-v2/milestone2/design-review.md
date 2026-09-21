# Milestone 2: independent rendered design review

Date: September 19, 2026. Review role: Astra extra-high, delegated by the lead. This reviewer did not implement source changes. Art direction and graphic design were assessed as separate perspectives by one reviewer, not two independent people. The first pass was fresh; cycle 2 incorporated this reviewer's recommendations.

Preview: `http://127.0.0.1:5186/`. Branch: `codex/site-overhaul-v2`. Git HEAD: `7e894c2b14f1d0613e4464c0a58aac9cbd0db7af`, with uncommitted milestone work. The screenshots assess that working tree, not the committed HEAD alone. Final source fingerprints are in `design-review-source-fingerprints.txt` beside this file.

## Judgment

The discovery/news hybrid is the stronger direction for this brief. The opening still explains the site's buyer purpose and gives immediate building/compare actions. A prominent, dated Development Desk gives returning readers a clear second destination, before the existing corridor and building discovery. The original skyline/bridge illustration makes an identifiable local closing image and is preserved at desktop, 390px, and 320px.

The cycle-2 text-led news treatment is more coherent than the first photographic version. The first version repeated the hero's waterfront photograph almost immediately and stretched all three mobile stories into large illustrated cards. The final three-column editorial treatment provides contrast with the photography above and below, avoids implying that contextual photographs depict the reported development, and lets buyers compare all three headlines on desktop. All three publication dates, source-report dates, buyer implications, story links, and research links remain visible.

## Separate scores

The existing rubric defines 8 as coherent, professional and usable; above 8 requires demonstrable polish without a significant category-specific weakness. These are design judgments from the rendered preview, not measured conversion or user-study results.

| Perspective | Desktop 1440px | Mobile 390px / checked at 320px | Basis and remaining limitation |
| --- | ---: | ---: | --- |
| Web / art direction | **8.6** | **8.3** | Distinct waterfront/editorial identity; purposeful photo/text rhythm; current news appears early; original bridge closes the page. The lower homepage still repeats discovery, comparison and advisory invitations, so the total narrative is longer than its strongest sections warrant. |
| Graphic design | **8.4** | **8.2** | Strong serif/sans hierarchy, restrained palette, consistent rules, coherent project mastheads/facts, readable news cards, repaired inquiry heading and modal contrast, clear 320px header. Small metadata, dense uppercase consent labels and the long mobile news headlines remain less refined than the hero and core content. |

Both perspectives exceed the strict target after cycle 2. No additional design cycle is necessary for this bounded milestone. This does not certify buyer UX or technical QA; those require their separate review passes.

## Evidence and resolved findings

All screenshot names below are in `output/playwright/milestone2-design/`.

1. **News composition and length, resolved in cycle 2.** First pass: `home-desktop-news.png`, `home-mobile-news-top.png`, `home-mobile-news-middle.png`, `home-mobile-news-bottom.png`, `home-narrow-news.png`. Final: `cycle2-home-desktop-news.png`, `cycle2-home-mobile-news-top.png`, `cycle2-home-mobile-news-bottom.png`, `cycle2-home-narrow-news-top.png`, `cycle2-home-narrow-news-bottom.png`. Rendered section height changed from approximately 987 to 700px on desktop, 2,082 to 1,483px at 390px (29% shorter), and 2,290 to 1,795px at 320px (22% shorter). Body copy was retained at a readable scale. No document-level horizontal overflow at 390 or 320px.
2. **Original graphic, preserved.** `home-desktop-bridge.png`, `cycle2-home-mobile-bridge.png`, `cycle2-home-narrow-bridge.png`. The original pale-ivory/blue city, bridge, palms and water reflections remain legible, with the full artwork ratio retained on mobile. It works as a brand signature rather than a competing content module.
3. **Project visual consistency, retained.** `olara-desktop-cover.png`, `olara-mobile-cover.png`, `olara-mobile-facts.png`, `olara-desktop-gallery.png`, `olara-mobile-gallery.png`, `berkeley-desktop-cover.png`, `berkeley-mobile-cover.png`, `cycle2-berkeley-narrow-cover.png`. Homepage and project pages share the wordmark treatment, teal/ivory/bronze palette, serif titles, small uppercase labels and thin separators. Project imagery has sufficient scale; mobile facts become readable rows rather than cramped five-column strips.
4. **Embedded inquiry heading, resolved.** `olara-desktop-inquiry.png` and `olara-mobile-inquiry.png` show the earlier forced three-line title despite unused available width. `cycle2-olara-desktop-inquiry.png` shows the repaired one-line desktop heading; `cycle2-olara-mobile-inquiry.png` shows a natural two-line mobile heading. The desktop form still leaves a large blank area below its left introduction; this is a minor composition weakness, not an interaction blocker.
5. **Automatic Building Watch modal contrast, resolved.** Actually encountered after visiting Olara then Berkeley. `building-watch-desktop-before.png` shows the nearly invisible internal “Send Me Updates” heading. `cycle2-building-watch-desktop.png` shows it clearly in dark ink on ivory. No form was submitted.
6. **320px project header crowding, resolved.** `berkeley-narrow-cover.png` shows the previous brand/button crowding. `cycle2-berkeley-narrow-cover.png` shows separate readable brand and CTA areas, with all four navigation links retained. The CTA wraps neatly rather than clipping the brand.

Whole-page composition: `cycle2-home-desktop-full.png` and `cycle2-home-mobile-full.png`. Initial compositions are preserved in `home-desktop-full.png` and `home-mobile-full.png`.

## Explicit brief questions

- **Is the site's value obvious?** Yes. The hero names West Palm Beach new-construction research, then gives building discovery and comparison actions. The corridor and project modules substantiate that promise.
- **Is current news easy to find?** Yes. The hero has a catch-up link, and the Development Desk follows the opening navigation. The newest three are visible without a carousel or expansion control. Publication and source-report dates are distinguished honestly.
- **Do stories invite useful exploration?** Yes at the visible UI level: each story has a reading action plus building-directory, corridor, or named-building exploration. This pass assessed their hierarchy and labels; it does not substitute for the fresh buyer-task review.
- **Is the bottom graphic preserved?** Yes, visibly verified at all three widths.
- **Can buyers compare, inspect plans and inquire without losing context?** Those routes remain prominent; Olara's embedded inquiry visibly retains its building name. End-to-end context persistence, submission success/error handling and consent are outside this art/graphic score and belong to the separate UX/technical pass.

## Limits and minor remaining weaknesses

- Chromium desktop and mobile viewport emulation were used. This is not real-device iPhone/Safari or WebKit evidence.
- Analytics and lead endpoint traffic were intercepted. No lead form was submitted. Early captures additionally blocked all POST requests; that may affect Google Maps tiles/RPC behavior. The grey basemap in whole-page captures is excluded from the visual score and must not be interpreted as proof of a production map failure. Later modal/nav/form verification used narrower analytics/lead interception.
- Small date/caption/footer typography remains less comfortable than the main body copy. News long titles wrap to several lines at 320px, but remain legible and unclipped.
- The lower homepage still asks visitors to discover/compare/contact through several adjacent modules. A future content-order experiment could simplify that repetition, but this milestone should not remove those resources without evidence.
- The Building Watch modal's all-uppercase, heavy consent paragraph is visually dense, although its main contrast defect is repaired. Form placeholders on the dark project inquiry are subdued; visible field labels remain present. A quantitative contrast audit belongs to technical QA.
- The illustration's identity is strong at narrow widths, though fine skyline detail necessarily becomes small. No crop or replacement is recommended.
- No performance, traffic, conversion, CI, deployment or live-production claim is made by this report.

Read before review: updated brief, progress/evidence rubric, milestone benchmark collection, graphic/news inventory, project guides, and Codebase Memory architecture. No source edits, commits, pushes or deployments were made by this reviewer.
