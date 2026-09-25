#!/bin/sh
# Renders icons/ from tools/icon.html with headless Chrome.
set -e
cd "$(dirname "$0")/.."
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
mkdir -p icons
for s in 180 192 512 1024; do
  "$CHROME" --headless --disable-gpu --hide-scrollbars --allow-file-access-from-files \
    --force-device-scale-factor=1 --window-size=$s,$s \
    --screenshot="$PWD/icons/icon-$s.png" "file://$PWD/tools/icon.html?size=$s" 2>/dev/null
done
ls -l icons
