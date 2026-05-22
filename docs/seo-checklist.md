# Editorial SEO Checklist

Use this checklist before publishing WPB New Construction market updates, project refreshes, or buyer guides. The goal is clean search visibility without weakening the site's source discipline.

## Search Intent

- Define the buyer question before drafting: timing, pricing signal, construction status, floorplan depth, corridor comparison, or district context.
- Prefer one clear primary query per article, such as `West Palm Beach new construction condos`, `North Flagler condos`, or `[Project] West Palm Beach update`.
- Match the article angle to a real buyer decision. Do not publish a post just because a press release exists.
- Keep sponsor/project sales pages out of the public call to action unless the user explicitly changes the site policy.

## Fact Discipline

- Use only source-backed facts from `research/source-material-review/project-source-catalog.json`, official project materials, city records, or reputable reporting.
- Separate confirmed facts from buyer interpretation. If a source conflict exists, preserve it in notes and use conservative public wording.
- Do not infer live availability, incentives, pricing, delivery timing, or construction status without current evidence.
- Recheck any article older than 30 days before treating it as current market guidance.

## On-Page Basics

- Title tag: keep it specific, buyer-facing, and under roughly 60 characters when practical.
- Meta description: summarize the buyer consequence in 145-160 characters; avoid hype and unsupported superlatives.
- H1: describe the actual topic, not a generic "market update."
- Intro: lead with what changed and why a buyer should care.
- Internal links: route readers to relevant WPB New Construction project, corridor, floorplan, answer, or inquiry pages.
- Image: use only authorized or user-provided media. Caption as `Building Name | Corridor` when the image is building-specific.

## Article Quality

- Keep short update posts focused: one material change, one buyer consequence, one verification list.
- Use bullets for "what to confirm next" when the post depends on evolving sales-office details.
- Avoid copied source language. Rewrite in the site's advisory voice.
- Avoid claims like "best," "only," "guaranteed," or "sold out" unless current source evidence supports the exact statement.
- Include a source trail in internal metadata even when public cards hide outbound sponsor links.

## Structured Data And Feeds

- Confirm each article has a stable slug/id, publish date, modified date, source name, source URL, and related project ids.
- Keep `dateModified` current only when meaningful content or source verification changed.
- Rebuild generated site data after changing source-backed feeds.
- Check `/updates/`, the homepage update module, and generated `NewsArticle` schema after publication.

## Final Gate

- Run the normal build and QA gates from the repo root.
- Review the rendered homepage and `/updates/` page for public-facing wording.
- Record changed stories, skipped leads, source conflicts, and blockers in the launch QA or handoff notes.
