# Brooke Builder Remote Access Feasibility

Generated: 2026-05-22

## Current Tooling

- `cloudflared` installed: no. It was not found on the current shell `PATH` or common Homebrew paths.
- Homebrew available on current shell `PATH`: no.
- Cloudflare account/auth status: not authenticated in this shell because `cloudflared` is unavailable.
- GitHub CLI status: `/Users/brookesnader/.local/bin/gh` is installed and authenticated as `BrokenFL`; plain `gh` is not on this shell `PATH`.
- Builder local URL: `http://127.0.0.1:8787`
- Builder bind target: `127.0.0.1`

## Recommendation

- Recommended hostname: `builder.wpbnewconstruction.com`
- Alternative hostname: `brooke-builder.wpbnewconstruction.com`
- Recommended tunnel name: `brooke-builder`
- Required target service: `http://127.0.0.1:8787`

## Access Requirement

Cloudflare Access must be configured before any public hostname is routed to Brooke Builder.

Required policy:

- Allow only Brooke's approved email/account.
- Deny everyone else.
- Require login.
- No bypass policy.
- No public access.

## Risk Notes

- A tunnel without Access would expose a repo-writing local editor to the internet.
- Builder must never be copied into `public/` or production `dist/`.
- Production `/brooke-builder/` and `/content-studio/` must remain redirected or blocked.
- Desktop Mac must stay awake and connected for laptop access to work.
- Secrets and Cloudflare tunnel credentials must stay under `~/.cloudflared/`, not in the repo.

## Manual Steps Needed

`cloudflared` and Homebrew were not available in this shell, so the tunnel was not created or loaded.

When ready on the desktop Mac:

```bash
brew install cloudflared
cloudflared tunnel login
cloudflared tunnel create brooke-builder
```

Then configure Cloudflare Access in the dashboard before routing `builder.wpbnewconstruction.com` to the tunnel.
