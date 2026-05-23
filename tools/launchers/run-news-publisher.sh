#!/bin/zsh
set -euo pipefail

export PATH="/Volumes/ExternalSSD/node_storage/bin:/Users/brookesnader/.local/bin:/Users/brookesnader/.homebrew/bin:/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin"

cd /Volumes/ExternalSSD/WPB_NewConstruction
/Volumes/ExternalSSD/node_storage/bin/npm run news:daily-publisher
