# Schema Audit

## Currently Present

- WebSite, RealEstateAgent, Person, FAQPage, Article, NewsArticle, ApartmentComplex, ItemList, and WebPage-style schema are generated from the application.
- `/answers/` includes prerendered FAQPage schema for crawler visibility.
- Market Notes already had Article schema and were expanded with images.

## Added Or Improved

- Route-level WebPage schema for core routes.
- BreadcrumbList schema for answers, floor plans, updates, market notes, legal/methodology pages, and project pages.
- RealEstateAgent data now includes URL, phone, and locality-level address context.
- Project ApartmentComplex schema now includes areaServed, locality containment, ImageObject where a project image is available, and buyer-resource references.
- Runtime social metadata is now synchronized with route title, description, URL, and image.

## Intentionally Avoided

- No overclaiming of offers, live inventory, guaranteed pricing, investment performance, legal advice, or direct project sponsorship.
- Organization schema for project sponsors is not expanded unless safely represented in reviewed project/team data.
- Residence detail is not asserted for pipeline pages without official public evidence.

## Validation Notes

- New QA gate: `npm run qa:seo` checks required metadata and canonical URLs on prerendered route HTML.
- `npm run build` regenerates prerendered HTML and JSON-LD for validation.
- Pricing, availability, incentives, delivery dates, and contract terms remain confirmation-only fields.
