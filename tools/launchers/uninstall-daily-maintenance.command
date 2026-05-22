#!/bin/zsh
set -euo pipefail

LABEL="com.brooke.wpb-daily-site-maintenance"
TARGET="$HOME/Library/LaunchAgents/$LABEL.plist"
DOMAIN="gui/$(id -u)"

launchctl bootout "$DOMAIN/$LABEL" >/dev/null 2>&1 || true
rm -f "$TARGET"
echo "Uninstalled $LABEL"
