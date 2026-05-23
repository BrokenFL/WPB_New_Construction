# Brooke Builder Remote Access Live QA

## Summary
- Date/time: 2026-05-22 21:07 EDT
- Branch: codex/route-protected-builder-tunnel-and-qa
- Remote hostname: builder.wpbnewconstruction.com
- Tunnel: brooke-builder
- Allowed identity: brooke.snader@gmail.com
- Safety decision: protected remote access is active, with Cloudflare Access required before Builder loads.

## DNS Route Result
- Route command result: Cloudflare reported that builder.wpbnewconstruction.com routes to tunnel 3012974a-a14d-4bbd-8896-a884fd2b0b78.
- Public resolver result: 1.1.1.1 and Cloudflare authoritative nameservers resolved builder.wpbnewconstruction.com to Cloudflare edge IPs.
- Local network note: the Mac's default resolver intermittently returned NXDOMAIN shortly after route creation, likely due to upstream DNS cache propagation. Direct Cloudflare resolution verified the route and Access challenge.

## LaunchAgent Result
- LaunchAgent: loaded.
- Label: com.brooke.builder-cloudflare-tunnel
- Running process: cloudflared tunnel --config /Users/brookesnader/.cloudflared/brooke-builder.yml run
- Binary observed from running process: /Users/brookesnader/.homebrew/Cellar/cloudflared/2026.5.0/bin/cloudflared
- Tunnel connections: cloudflared reported active edge connections after loading the agent.

## Unauthenticated Test
- Method: unauthenticated request to https://builder.wpbnewconstruction.com through Cloudflare edge resolution.
- Result: Cloudflare returned HTTP 302 to the Access login application.
- Builder exposure: no Builder HTML was returned before authentication.
- Access metadata header: present.

## Authenticated Test
- Method: Cloudflare Access login as brooke.snader@gmail.com with user-provided one-time code.
- Result: Brooke Builder loaded at https://builder.wpbnewconstruction.com/.
- Page title: Brooke Builder.
- Browser blocker note: Chrome on this Mac showed ERR_BLOCKED_BY_CLIENT for the builder hostname, so authenticated proof was completed with Playwright using the same Cloudflare Access flow and Cloudflare edge resolution.

## Remote Mode Safeguards
- Remote Mode banner: present.
- Remote state API: isRemote true, host builder.wpbnewconstruction.com, accessRequired true.
- Update Site without remote confirmation: blocked with "Remote Builder Mode requires the remote confirmation checkbox before this workflow can run."
- Builder route binding: service still points to http://127.0.0.1:8787 through the tunnel config.

## Remote Feature Checks
- Dashboard: loaded.
- Reports tab: loaded.
- Homepage editor: loaded.
- Image picker: available.
- Focal point controls: focalPointX and focalPointY controls present.
- Automation Status panel: loaded.

## Public Site Safety
- https://www.wpbnewconstruction.com/brooke-builder/: HTTP 302 to /
- https://www.wpbnewconstruction.com/content-studio/: HTTP 302 to /
- Result: public site editor routes remain blocked.

## QA Commands
- npm run qa:builder-remote: pass
- npm run qa:content-studio: pass
- npm run qa:live: pass
- npm run typecheck: pass
- npm run build: pass
- npm run test: pass
- npm run lint: pass
- npm run check:updates: pass
- npm run qa:copy: pass
- npm run qa:news: pass
- npm run qa:public-json: pass
- npm run qa:a11y-forms: pass
- npm run qa:performance: pass
- npm run qa:gatekeeper: pass
- npm run qa:image-mapping: pass
- npm run qa:image-repetition: pass
- npm run qa:homepage-visual: pass
- npm run qa:map: pass
- npm run qa:untracked-assets: pass
- npm run qa:launch: pass
- npm run assets:duplicates: pass

## Remaining Risks
- The desktop Mac must stay awake.
- Brooke Builder must remain running at http://127.0.0.1:8787 for the tunnel to reach the editor.
- Local ISP/router DNS may need propagation time before this Mac's default resolver stops returning NXDOMAIN for the new builder hostname.
- Chrome extensions or privacy tooling on this Mac may block the builder hostname; authenticated Access was verified through Playwright.
