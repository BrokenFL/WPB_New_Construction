# Tool Inventory

Updated: 2026-05-22

## GitHub CLI

- System `gh`: not found before this branch; now available through the user PATH as `/Users/brookesnader/.local/bin/gh`.
- Local install completed at: `/Users/brookesnader/.local/bin/gh`
- Installed version: `gh version 2.92.0 (2026-04-28)`
- Auth status: authenticated to `github.com` as `BrokenFL` using keychain storage.
- Default shell status: `which gh` resolves in a fresh zsh login shell.

Test commands:

```bash
/Users/brookesnader/.local/bin/gh --version
/Users/brookesnader/.local/bin/gh auth status
/Users/brookesnader/.local/bin/gh repo view BrokenFL/WPB_New_Construction
```

## Homebrew

- `brew`: installed in a user-writable prefix at `/Users/brookesnader/.homebrew/bin/brew`.
- Shell path: `/Users/brookesnader/.local/bin/brew` symlinks to the user-prefix install, and zsh startup files now add both `/Users/brookesnader/.local/bin` and `/Users/brookesnader/.homebrew/bin`.
- Install attempt: `NONINTERACTIVE=1` official Homebrew installer.
- Result: blocked because the installer requires sudo/admin access on macOS.
- Fallback install: completed without sudo by unpacking Homebrew into `/Users/brookesnader/.homebrew`.
- `brew doctor`: command runs, but warns that the prefix is not `/opt/homebrew`; this is a Homebrew Tier 3 configuration and bottles may be limited.

Optional standard-prefix install still needs admin authorization:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install gh
gh auth status
```

Current test commands:

```bash
which brew
brew --version
brew doctor
which gh
gh auth status
```

## GitHub Connector Fallback

- GitHub connector is available in Codex and remains the fallback for PR/repo operations.
- News automation still supports `GH_TOKEN` or `GITHUB_TOKEN` when `gh` is unavailable to a LaunchAgent process.

## Site QA Tooling

```bash
node --version
npm --version
npm run typecheck
npm run build
npm run qa:launch
npm run qa:live
```
