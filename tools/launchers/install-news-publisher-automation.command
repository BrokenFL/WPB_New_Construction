#!/bin/zsh
set -euo pipefail

WORKSPACE="/Volumes/ExternalSSD/WPB_NewConstruction"
LABEL="com.brooke.wpb-news-publisher"
SOURCE="$WORKSPACE/launchd/$LABEL.plist"
TARGET="$HOME/Library/LaunchAgents/$LABEL.plist"
DOMAIN="gui/$(id -u)"

if [[ ! -d "$WORKSPACE" ]]; then
  echo "Workspace not found: $WORKSPACE"
  exit 1
fi

if [[ ! -f "$SOURCE" ]]; then
  echo "LaunchAgent source not found: $SOURCE"
  exit 1
fi

mkdir -p "$HOME/Library/LaunchAgents"
cp "$SOURCE" "$TARGET"
launchctl bootout "$DOMAIN/$LABEL" >/dev/null 2>&1 || true
launchctl bootstrap "$DOMAIN" "$TARGET"
launchctl enable "$DOMAIN/$LABEL"
echo "Installed and loaded $LABEL"
echo "Manual run: cd $WORKSPACE && npm run news:publish-queued"
