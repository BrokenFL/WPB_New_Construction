# Google Sheet Tracker

- Title: WPB New Construction Project Asset Tracker - Current
- URL: https://docs.google.com/spreadsheets/d/1307fMyEUsTRNMOoHePGf4tIiqUTXSEzkC9M5WtXWjDM
- Source export: `research/source-material-review/wpb-project-asset-tracker.csv`
- Source data:
  - `public/data/project-asset-status.json`
  - `public/data/floorplans.json`
  - `public/data/published-floorplan-assets.json`

The Sheet is generated from public project-page and asset-routing data. Re-run `npm run research:site-intelligence` and `node research/scripts/export-drive-asset-tracker.mjs`, then re-import the CSV when project status changes.
