#!/bin/bash
set -euo pipefail

# Dual packaging script (Firefox MV2 + Chrome MV3)
# Assumptions:
#  - manifest.firefox.json & manifest.chrome.json exist in repo root
#  - popup/ and icons/ contain shared assets
#  - Supabase artifacts are deprecated and excluded
# Output:
#  build/tab-url-copier-firefox-v<version>.zip
#  build/tab-url-copier-chrome-v<version>.zip

FIREFOX_MANIFEST="manifest.firefox.json"
CHROME_MANIFEST="manifest.chrome.json"

if [[ ! -f "$FIREFOX_MANIFEST" ]]; then
  echo "Missing $FIREFOX_MANIFEST" >&2
  exit 1
fi

if [[ ! -f "$CHROME_MANIFEST" ]]; then
  echo "Missing $CHROME_MANIFEST" >&2
  exit 1
fi

VERSION=$(grep -m1 '"version"' "$FIREFOX_MANIFEST" | cut -d'"' -f4)

echo "Packaging Tab URL & Title Copier version $VERSION"

# Clean build directory
rm -rf build
mkdir -p build/firefox build/chrome

# Copy shared assets
cp -R popup build/firefox/
cp -R icons build/firefox/
cp -R popup build/chrome/
cp -R icons build/chrome/

# Place manifests
cp "$FIREFOX_MANIFEST" build/firefox/manifest.json
cp "$CHROME_MANIFEST" build/chrome/manifest.json

# Exclusion patterns (supabase legacy artifacts)
EXCLUDES=(
  "supabase-config.js"
  "supabase-setup.sql"
  "SUPABASE_SETUP.md"
  "test-supabase-connection.html"
)

# Function to build zip
build_zip () {
  local target=$1
  local zipname=$2
  pushd "build/$target" >/dev/null
  # Construct exclusion args for zip (if files exist they won't be added)
  EX_ARGS=()
  for f in "${EXCLUDES[@]}"; do
    EX_ARGS+=(-x "$f")
  done
  zip -r "../$zipname" . -x ".*" "*/.*" "__MACOSX*" "*.DS_Store*" "${EX_ARGS[@]}"
  popd >/dev/null
}

FIREFOX_ZIP="tab-url-copier-firefox-v${VERSION}.zip"
CHROME_ZIP="tab-url-copier-chrome-v${VERSION}.zip"

build_zip "firefox" "$FIREFOX_ZIP"
build_zip "chrome" "$CHROME_ZIP"

echo "Created build/$FIREFOX_ZIP"
echo "Created build/$CHROME_ZIP"

# Summary
echo
echo "File counts:"
echo " Firefox: $(find build/firefox -type f | wc -l) files (pre-zip staging)"
echo " Chrome : $(find build/chrome -type f | wc -l) files (pre-zip staging)"

echo "Done."