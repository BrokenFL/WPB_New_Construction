#!/bin/zsh
set -euo pipefail

WORKSPACE="/Volumes/ExternalSSD/WPB_NewConstruction"
SOURCE_PLIST="$WORKSPACE/launchd/com.brooke.builder-cloudflare-tunnel.plist"
TARGET_PLIST="$HOME/Library/LaunchAgents/com.brooke.builder-cloudflare-tunnel.plist"
CONFIG_FILE="$HOME/.cloudflared/brooke-builder.yml"

echo "This installer only loads the tunnel. Configure Cloudflare Access first."
echo "Required Access policy: allow Brooke only, deny everyone else, no bypass."

if [[ ! -f "$CONFIG_FILE" ]]; then
  echo "Missing $CONFIG_FILE"
  echo "Create it from config/cloudflare/brooke-builder-tunnel.example.yml after Cloudflare Access is ready."
  exit 1
fi

if ! command -v cloudflared >/dev/null 2>&1; then
  echo "cloudflared is not installed or not on PATH."
  exit 1
fi

mkdir -p "$HOME/Library/LaunchAgents"
cp "$SOURCE_PLIST" "$TARGET_PLIST"
launchctl unload "$TARGET_PLIST" 2>/dev/null || true
launchctl load "$TARGET_PLIST"
echo "Loaded com.brooke.builder-cloudflare-tunnel"
