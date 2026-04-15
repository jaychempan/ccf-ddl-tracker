#!/usr/bin/env bash

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

mkdir -p "$repo_root/docs"
rsync -a --delete "$repo_root/website/" "$repo_root/docs/"

echo "Synced website/ to docs/"
