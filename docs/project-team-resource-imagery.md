# Project Team Resource Imagery

Team resources are managed through `src/data/projectTeamResources.ts` and local review overrides in `content/overrides/team-resource-overrides.json`.

Supported roles:

- Developer
- Builder
- Architect
- Interior Designer
- Landscape Architect
- Brand Partner
- Sales
- Other

If no approved image is available, public pages should show a clean placeholder or omit the image. Do not publish fake people, unverifiable portraits, or backend labels such as `needs_review`.

Preferred image path:

```text
public/team-resources/{projectId}/{role-slug}-{name-slug}.jpg
```

Every uploaded resource should include a caption, source URL, rights/source note, and review status.
