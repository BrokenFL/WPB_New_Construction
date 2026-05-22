#!/bin/zsh
set -euo pipefail

WORKSPACE="/Volumes/ExternalSSD/WPB_NewConstruction"
URL="http://127.0.0.1:8787"

echo "Opening Brooke Builder..."

if [[ ! -d "$WORKSPACE" ]]; then
  echo "Workspace not found: $WORKSPACE"
  echo "Confirm the ExternalSSD volume is mounted, then try again."
  exit 1
fi

cd "$WORKSPACE"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is not available in PATH."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is not available in PATH."
  exit 1
fi

(sleep 2 && open "$URL") >/dev/null 2>&1 &
echo "Local URL: $URL"
echo "Stop Brooke Builder with Control-C in this Terminal window."
npm run brooke:builder
