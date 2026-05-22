#!/bin/zsh
set -euo pipefail

TARGET_PLIST="$HOME/Library/LaunchAgents/com.brooke.builder-cloudflare-tunnel.plist"

if [[ -f "$TARGET_PLIST" ]]; then
  launchctl unload "$TARGET_PLIST" 2>/dev/null || true
  rm "$TARGET_PLIST"
fi

echo "Unloaded com.brooke.builder-cloudflare-tunnel"
