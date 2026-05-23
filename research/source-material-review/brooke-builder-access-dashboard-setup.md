# Brooke Builder Cloudflare Access Setup

Generated: 2026-05-22 20:52:47 EDT

## Access App

- Exists: yes
- Hostname: `builder.wpbnewconstruction.com`
- App name: `Brooke Builder`
- App type: Self-hosted
- Session duration: 24 hours

## Policy

- Policy name: `Allow Brooke only`
- Policy action: Allow
- Allowed identity: `brooke.snader@gmail.com`
- Everyone else denied: yes, by Cloudflare Access default-deny behavior for users who do not match the allow policy
- Bypass policy present: no
- Public access present: no
- Service-token bypass present: no

## Dashboard Verification

- Verified by: Chrome dashboard inspection in Cloudflare One > Access controls > Applications and policy detail view
- Date/time: 2026-05-22 20:52:47 EDT
- Application list showed `Brooke Builder`, destination `builder.wpbnewconstruction.com`, policy `Allow Brooke only`, type `Self-hosted`.
- Policy detail showed include selector `Emails` with value `brooke.snader@gmail.com` and action `Allow`.
- Remaining manual steps:
  1. Route DNS for `builder.wpbnewconstruction.com` to tunnel `brooke-builder`.
  2. Verify unauthenticated/private browser sees Cloudflare Access before Builder.
  3. Verify authenticated Brooke login reaches Builder.
  4. Create `~/.cloudflared/brooke-builder-access-confirmed.txt`.
  5. Load `tools/launchers/install-builder-remote-tunnel.command`.
  6. Re-run remote Builder and public-route QA.

## Safety Decision

- Safe to route DNS? yes
- Reason: The Cloudflare Access self-hosted application exists for `builder.wpbnewconstruction.com` and the only observed allow policy is email-specific for `brooke.snader@gmail.com`. No bypass, public, or service-token policy was observed.

## Exposure Status

- DNS routed in this pass: no
- Tunnel LaunchAgent loaded in this pass: no
- `builder.wpbnewconstruction.com` resolution after setup: not resolving
- Tunnel `brooke-builder` active connections after setup: none shown by `cloudflared tunnel list`
