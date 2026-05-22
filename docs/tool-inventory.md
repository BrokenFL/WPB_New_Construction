# Tool Inventory

Updated: 2026-05-22

## GitHub CLI

- System `gh`: not found in the default Codex shell before this branch.
- Local install completed at: `/Users/brookesnader/.local/bin/gh`
- Installed version: `gh version 2.92.0 (2026-04-28)`
- Auth status: authenticated to `github.com` as `BrokenFL` using keychain storage.
- Default shell note: add `/Users/brookesnader/.local/bin` to `PATH` if `which gh` does not find it in a new shell.

Test commands:

```bash
/Users/brookesnader/.local/bin/gh --version
/Users/brookesnader/.local/bin/gh auth status
/Users/brookesnader/.local/bin/gh repo view BrokenFL/WPB_New_Construction
```

## Homebrew

- `brew`: not found in the default Codex shell.
- Install attempt: `NONINTERACTIVE=1` official Homebrew installer.
- Result: blocked because the installer requires sudo/admin access on macOS.

Manual authorization still needed:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install gh
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
