#!/bin/zsh
set -euo pipefail

WORKSPACE="/Volumes/ExternalSSD/WPB_NewConstruction"
LAUNCHER_SOURCE="$WORKSPACE/tools/launchers/Open Brooke Builder.command"
LAUNCHER_HELPER="$WORKSPACE/tools/launchers/open-brooke-builder.sh"
DESKTOP_LAUNCHER="$HOME/Desktop/Open Brooke Builder.command"
URL="http://127.0.0.1:8787"

echo "Installing Brooke Builder launcher..."

if [[ ! -d "$WORKSPACE" ]]; then
  echo "Workspace not found: $WORKSPACE"
  echo "Mount ExternalSSD, then run this installer again."
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is not available in PATH."
  echo "Install Node.js or open a shell where node is available."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is not available in PATH."
  echo "Install npm or open a shell where npm is available."
  exit 1
fi

chmod +x "$LAUNCHER_SOURCE" "$LAUNCHER_HELPER"
cp "$LAUNCHER_SOURCE" "$DESKTOP_LAUNCHER"
chmod +x "$DESKTOP_LAUNCHER"

echo "Installed: $DESKTOP_LAUNCHER"
echo "Opening $URL"
open "$URL" >/dev/null 2>&1 || true
echo ""
echo "Troubleshooting:"
echo "1. If the page does not load, double-click Open Brooke Builder.command on the Desktop."
echo "2. If Terminal says the workspace is missing, mount ExternalSSD."
echo "3. If npm is missing, install Node.js or open from a shell with npm in PATH."
echo "4. Brooke Builder is local-only at $URL."
