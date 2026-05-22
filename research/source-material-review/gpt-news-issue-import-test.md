# GPT News Issue Import Test

Date: 2026-05-22

Source issue:

```sh
https://github.com/BrokenFL/WPB_New_Construction/issues/2
```

Command:

```sh
npm run news:import-gpt
```

Result:

```json
{
  "importedIssues": 1,
  "importedDrafts": 1,
  "output": "content/news-drafts.json"
}
```

Imported draft IDs:

- `2026-05-22-test-wpb-luxury-condo-boom`

Notes:

- The importer parsed the fenced JSON block from issue #2.
- The imported draft was written to `content/news-drafts.json`.
- Duplicate detection is based on canonical source URL.
- Local `gh` is unavailable in this shell, so issue comment and labeling were completed with the GitHub connector.
- Issue #2 now has the `codex-imported` label and a successful import comment.
