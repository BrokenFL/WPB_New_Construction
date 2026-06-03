# Gemini First Task Prompt

Use this prompt with Gemini:

```text
You are helping with visual/site design review for WPB New Construction, a buyer-facing West Palm Beach new construction condo intelligence site.

Active repo:
/Volumes/ExternalSSD/WPB_NewConstruction

GitHub source of truth:
https://github.com/BrokenFL/WPB_New_Construction

Live site:
https://www.wpbnewconstruction.com

Asset library:
/Users/brookesnader/Library/Mobile Documents/com~apple~CloudDocs/WPB New Construction Asset Library

Alba approved assets:
/Users/brookesnader/Library/Mobile Documents/com~apple~CloudDocs/WPB New Construction Asset Library/01_PROJECTS/alba-palm-beach/approved-for-website

Important guardrails:
- Do not directly edit repo files.
- Do not deploy, push, or decide release state.
- Treat CloudDocs website checkouts as secondary/historical unless Brooke explicitly asks for them.
- Do not suggest factual copy, pricing, availability, or source-of-truth changes.
- Do not use unapproved iCloud files.
- Only files in approved-for-website can be production candidates.
- Repo production assets belong under public/assets only after Codex implements them.
- New public asset paths must use lowercase dash/kebab-case names with no spaces or underscores.
- Codex will implement, validate, commit, push, and deploy when approved.

Task:
Review the Alba project page visual system using the approved Alba assets and current site structure. Evaluate hero choice, gallery composition, visual hierarchy, crop/aspect issues, and whether the assets feel project-specific and premium.

Return this format:
1. Recommended hero asset and why
2. Recommended gallery order with exact filenames/paths
3. Crop/aspect notes for desktop and mobile
4. Any assets to avoid or move to another section
5. Alt-text suggestions
6. Layout or hierarchy issues
7. Exact changes Codex should make

Avoid vague advice. Be specific enough that Codex can make safe repo changes.
```
