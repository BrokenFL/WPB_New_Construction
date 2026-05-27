# Asset Workflow

The iCloud asset library is the human review and staging area. Project-specific folders such as `hero`, `residences`, `amenities`, `neighborhood`, `source-docs`, `00-review`, `needs-review`, and `rejected` are not production sources.

For website work, the approved source is the project `approved-for-website` folder. Only files in that folder should be copied into the repo for production use.

Repo-local production assets live under `public/assets`. The website registry points only to these repo-local approved assets, not to iCloud paths.

New asset folders and filenames must use lowercase dash/kebab-case names. Do not introduce underscores, accidental spaces, uppercase words, or source-library naming artifacts in new public asset paths.

GitHub should receive only final selected, approved website assets. Do not commit the full iCloud asset library, review folders, rejected files, source folders, or oversized source packages unless a specific public website feature requires them.

The deterministic registry lives in `data/project_assets.json`, with TypeScript lookup helpers in `src/data/projectAssets.ts`. Current lookup priority is:

1. Approved registry asset for the requested placement.
2. Existing project image fields from the generated/current site data.
3. Existing project-intelligence and editorial fallbacks.

Use `npm run check:assets` before committing registry changes. It verifies that every approved `/assets/...` registry path exists under `public/`, warns on missing alt text, and warns when a registry project has no hero asset.
