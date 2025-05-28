#!/bin/bash

# Create a clean build directory
rm -rf build
mkdir -p build

# Create the package name with version from manifest.json
VERSION=$(grep '"version"' manifest.json | cut -d'"' -f4)
PACKAGE_NAME="firefox-tab-url-copier-v$VERSION.zip"

# Create the ZIP file
zip -r "build/$PACKAGE_NAME" \
    manifest.json \
    popup \
    icons \
    -x ".*" \
    -x "__MACOSX" \
    -x "node_modules/*"

echo "Extension packaged as build/$PACKAGE_NAME"