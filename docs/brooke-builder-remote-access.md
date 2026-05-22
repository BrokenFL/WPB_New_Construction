# Brooke Builder Remote Access

Brooke Builder remains a local-only tool by default. The desktop Mac stays as the single operational brain for the repo, GitHub auth, Cloudflare deploys, LaunchAgents, image assets, and Builder server.

## Recommended Hostname

- Primary: `builder.wpbnewconstruction.com`
- Alternative: `brooke-builder.wpbnewconstruction.com`

## Safe Architecture

1. Start Brooke Builder on the desktop Mac:
   `npm run brooke:builder`
2. Keep the Builder bound to:
   `http://127.0.0.1:8787`
3. Create a Cloudflare Tunnel hostname:
   `builder.wpbnewconstruction.com`
4. Point tunnel ingress only to:
   `http://127.0.0.1:8787`
5. Put Cloudflare Access in front of the hostname before routing traffic.

## Required Cloudflare Access Policy

- Application: `builder.wpbnewconstruction.com`
- Policy action: allow only Brooke's approved email/account.
- Deny everyone else.
- Require login.
- No bypass rule.
- No public access.
- Session duration should be short enough for travel use.

Do not expose the tunnel until the Access policy has been verified in the Cloudflare dashboard.

## Production Website Safety

The production website must not serve Builder as a normal public route.

These routes remain blocked or redirected:

- `/brooke-builder/`
- `/content-studio/`

The public site should redirect those routes to `/`, return `404`, or otherwise avoid exposing an editor.

## Builder Remote Mode

Builder detects remote mode when:

- `Host` or `X-Forwarded-Host` is `builder.wpbnewconstruction.com` or `brooke-builder.wpbnewconstruction.com`
- Cloudflare headers are present for the approved hostname
- `BROOKE_BUILDER_REMOTE_MODE=true` is set for simulation/testing

Remote mode shows this banner:

`Remote Builder Mode - secure access through Cloudflare. Confirm carefully before publishing.`

Remote mode requires an extra confirmation checkbox for Update Site, publishing, and queued-news publish workflows.

## Desktop Requirements

- Desktop Mac must remain awake and online.
- Brooke Builder must keep running.
- Cloudflare tunnel LaunchAgent must be loaded only after Access is configured.
- Do not clone the full repo or duplicate automations to the laptop.

## Tunnel Template

Use `config/cloudflare/brooke-builder-tunnel.example.yml` as the starting point after Cloudflare Access is ready.

The template routes:

```yaml
hostname: builder.wpbnewconstruction.com
service: http://127.0.0.1:8787
```

## Install/Uninstall Helpers

- Install helper: `tools/launchers/install-builder-remote-tunnel.command`
- Uninstall helper: `tools/launchers/uninstall-builder-remote-tunnel.command`
- LaunchAgent template: `launchd/com.brooke.builder-cloudflare-tunnel.plist`

The installer intentionally refuses to load when `~/.cloudflared/brooke-builder.yml` is missing. Create that file only after the Cloudflare Access policy exists.

## Manual Cloudflare Dashboard Steps

1. Install `cloudflared` on the desktop Mac if needed.
2. Authenticate `cloudflared` to the correct Cloudflare account.
3. Create tunnel `brooke-builder`.
4. Add public hostname `builder.wpbnewconstruction.com`.
5. Route service to `http://127.0.0.1:8787`.
6. Create a Cloudflare Access application for `builder.wpbnewconstruction.com`.
7. Add an allow policy for Brooke's approved email/account.
8. Confirm there is no bypass policy and no public allow policy.
9. Test from a private/incognito browser before using the laptop.
10. Only then install/load the LaunchAgent.
