# WPB New Construction

A Vite site for West Palm Beach new-construction condo research, corridor comparison, floorplan indexing, buyer Q&A, and private advisory inquiries.

## Current Site Areas

- `./` - stylized West Palm Beach corridor map with project cards for North Flagler, Downtown, and South Flagler.
- `?view=floorplans` - public floorplan library grouped by project and source status.
- `?view=answers` - buyer Q&A with structured FAQ data and source citations.
- `?view=news` - research updates with RSS and JSON Feed exports.
- `?view=methodology` - public source hierarchy and verification policy.
- `?view=inquire` - advisory packet request flow.

## Data Refresh

The generated site data is built from the source-material catalog and asset library:

```bash
npm run research:site-intelligence
```

That refreshes:

- `src/generated/siteData.ts`
- `public/data/*.json`
- `public/feed.json`
- `public/rss.xml`
- `public/llms.txt`
- `public/robots.txt`
- `public/sitemap.xml`
- `research/source-material-review/*.md`

## Local Development

```bash
npm install
npm run dev
```

## Private Local Editor

Run the no-code project editor on this Mac:

```bash
npm run editor
```

Then open `http://127.0.0.1:4179`. The editor saves friendly project-card and project-page edits into `research/content-editor/site-overrides.json` and generates `src/generated/editorOverrides.ts` for the site build. It is intended for private local editing, not as a public admin login.

Build before publishing:

```bash
npm run build
```

## Live Publishing

Any site change should end with the live publish flow, not just a local build:

```bash
npm run ship:live
```

`npm run ship:live` runs the production build, launch QA, and publishes `dist/` to the Cloudflare Pages project `wpbnewconstruction`, which serves `wpbnewconstruction.com` and `www.wpbnewconstruction.com`.

If the hosting target changes, override the deploy command without editing the script:

```bash
LIVE_DEPLOY_COMMAND="your production deploy command" npm run ship:live
```

GitHub Actions also builds and launch-QA checks every push to `main`. To let GitHub publish the live site automatically, add these repository secrets:

- `CLOUDFLARE_API_TOKEN` - Cloudflare API token with Pages write access.
- `CLOUDFLARE_ACCOUNT_ID` - `ab879f86c65cb8bcb1a2fcf0e815b008`.

## Launch Checklist

- Brokerage/contact/legal pages are scaffolded with Douglas Elliman Real Estate Palm Beach, Brooke Matthew Snader, The Scott Gordon Group, mobile, license, Fair Housing, Privacy, and Terms references.
- Lead intake is scaffolded as static form `wpb-lead-intake`; connect the final CRM/spreadsheet/form provider before production lead volume.
- Verify pricing, availability, residence counts, and delivery timing with current developer or sales-team material.
- Keep project images and PDFs limited to official links or documented usage approvals.
- `npm run build` prerenders route-specific HTML shells with canonical, title, description, and OG metadata.
- `npm run ship:live` is the default closeout command after approved code, content, image, or research-feed changes.
