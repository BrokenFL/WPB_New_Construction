# Lead Capture QA

## Scope

Progressive lead capture should support free browsing while identifying high-intent users who compare more than one building.

## Test Cases

| Case | Expected result | Status |
| --- | --- | --- |
| First building detail page view | No modal appears; `building_view` event records the building | Pass, local browser QA |
| Second distinct building detail page view | Modal appears with current-pricing/current-lines copy | Pass, local browser QA |
| Dismiss modal | Modal closes and does not reappear in the same session | Pass, local browser QA |
| Primary CTA | Opens `/inquire/?lead_capture_context=second_building_view`; viewed buildings remain in session storage | Pass, route and storage behavior verified |
| Direct `/inquire/` visit | Form works without building context | Pass, local route QA |
| Mobile sticky CTA | Call, Email, and Request buttons are present and use tel/mailto/inquiry links | Pass, local browser QA |
| Desktop floating CTA | Request CTA is visible and links to inquiry flow | Pass, local browser QA |

## Manual Browser Notes

- Use a fresh browser session or clear `sessionStorage`.
- Open `/projects/olara/`; confirm no modal.
- Open `/projects/ritz-carlton-wpb/`; confirm modal.
- Click Keep Browsing; revisit another building and confirm suppression.
- Repeat in a fresh session and click Request Current Availability; confirm the inquiry page opens.

## Latest Local QA Result

- First building modal visible: false
- Second distinct building modal visible: true
- Session viewed-building count after second view: 2
- Keep Browsing sets `wpbLeadModalDismissed=dismissed`
- Third building after dismissal: modal suppressed
- Inquiry hidden viewed-building field populated from session context
- Mobile CTA visible at 390px width
- Mobile call href: `tel:+15618910186`
- Mobile email href: `mailto:brooke.snader@gmail.com`

## Analytics Events

- `building_view`
- `second_building_view`
- `lead_modal_shown`
- `lead_modal_dismissed`
- `lead_modal_submitted`
- `contact_form_submit`

## Open QA Items

- Add automated browser assertions if this behavior starts changing frequently.
- Continue checking sticky CTA overlap on smaller iPhone widths.
