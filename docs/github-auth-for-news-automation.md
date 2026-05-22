# GitHub Auth for News Automation

The news importer supports two local auth paths:

- Preferred: GitHub CLI (`gh`) authenticated in the shell that runs the automation.
- Fallback: `GITHUB_TOKEN` or `GH_TOKEN` in the environment.

The importer first tries:

```bash
gh issue list --repo BrokenFL/WPB_New_Construction --state open --search "Daily WPB News Drafts"
```

If `gh` is missing or fails, it queries the GitHub Issues API. If `GITHUB_TOKEN` or `GH_TOKEN` is present, that request is token-backed. Without a token, it is unauthenticated and may be rate-limited.

## Install gh

Current local status, checked 2026-05-22:

- Homebrew is available in the default zsh shell through `/Users/brookesnader/.local/bin/brew`.
- The standard `/opt/homebrew` installer was attempted and blocked because sudo/admin access is required.
- A user-prefix Homebrew fallback is installed at `/Users/brookesnader/.homebrew/bin/brew`.
- A local GitHub CLI binary was installed at `/Users/brookesnader/.local/bin/gh`.
- `/Users/brookesnader/.local/bin/gh auth status` reports authenticated access as `BrokenFL`.
- `/Users/brookesnader/.local/bin` and `/Users/brookesnader/.homebrew/bin` were added to zsh startup files. Add those paths to any LaunchAgent environment if automation needs `gh` or `brew` by command name.

If Homebrew is available:

```bash
brew install gh
```

If Homebrew is not available, install GitHub CLI from:

```text
https://cli.github.com/
```

Then authenticate:

```bash
gh auth login
gh auth status
gh repo view BrokenFL/WPB_New_Construction
gh issue list --repo BrokenFL/WPB_New_Construction --label news-candidate --limit 5
```

Do not paste or print tokens into terminal logs.

## Token Fallback

For LaunchAgents, put a token in the environment used by the agent process, or run the automation from a shell that exports one:

```bash
export GH_TOKEN="..."
npm run news:import-gpt
```

`GITHUB_TOKEN` is also accepted. The token needs read access to issues. If the automation should comment on imported issues or add labels through `gh`, authenticate `gh` as well.

## Test Commands

```bash
which gh || true
gh auth status || true
npm run news:import-gpt
npm run news:daily-publisher -- --dry-run
```

Brooke Builder also reports GitHub auth mode in Automation Status. It shows `gh / authenticated` when `gh auth status` works in the Builder process, `token-fallback` when `GH_TOKEN` or `GITHUB_TOKEN` is present, and `unauthenticated` when neither path is available.

## How Brooke Knows It Is Working

- `content/news-drafts.json` contains imported items with `importedFromIssue`.
- News Desk shows the imported draft and its issue/source metadata.
- Automation Status shows a GPT issue import count and latest issue number.
- `research/source-material-review/news-publisher-report.md` is updated after `npm run news:daily-publisher`.
- `research/source-material-review/daily-maintenance-report.md` is updated after `npm run daily:maintenance`.
