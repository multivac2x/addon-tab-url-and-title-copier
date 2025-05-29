# Firefox Tab URL Copier

A Firefox extension that allows you to quickly copy all open tab URLs from the current window to your clipboard.

## Features

- Copy URLs of all open tabs in the current window with a single click
- Simple and lightweight interface
- Visual confirmation when URLs are copied
- Works with any number of tabs

## Installation Instructions

### Development/Testing Installation

1. Open Firefox and navigate to [`about:debugging#/runtime/this-firefox`](about:debugging#/runtime/this-firefox)  
   *(You can copy and paste this link into your Firefox address bar)*
2. Click on "This Firefox" in the left sidebar
3. Click the "Load Temporary Add-on" button
4. Navigate to your extension's directory and select the `manifest.json` file
5. The extension icon should appear in your browser toolbar

### Manual Installation (for personal use)

1. Download or clone this repository
2. Create an `icons` directory in the project root if it doesn't exist
3. Add placeholder icons:
   - Create `icons/icon-48.png` (48x48 pixels)
   - Create `icons/icon-96.png` (96x96 pixels)
4. Run the packaging script:
   ```bash
   ./package.sh
   ```
   This will create a ZIP file in the `build` directory.
5. In Firefox, go to `about:debugging`
6. Click "This Firefox" in the left sidebar
7. Click "Load Temporary Add-on"
8. Select the generated ZIP file from the `build` directory

**Note**: Extensions installed this way are temporary and will be removed when Firefox restarts. This is Firefox's security requirement for unsigned extensions.

## Usage

1. Click the extension icon in the Firefox toolbar
## Extension Signing and Permanent Installation

### Why "Load Temporary Add-on" is Required

Firefox requires all extensions to be **digitally signed** by Mozilla before they can be installed permanently. Unsigned extensions (like this one) can only be loaded temporarily for development and testing purposes.

**Limitations of temporary installation:**
- Extension is removed when Firefox restarts
- Must be reloaded manually each time
- Only intended for development/testing

### Options for Permanent Installation

#### Option 1: Submit to Mozilla Add-ons (AMO) - Public Distribution
1. Create an account at https://addons.mozilla.org/developers/
2. Upload your extension package
3. Mozilla will review your extension (can take days to weeks)
4. Once approved, users can install it normally from the Firefox Add-ons store
5. Extension will auto-update and persist across Firefox restarts

#### Option 2: Self-distribution with Signing - Private Distribution
1. Go to https://addons.mozilla.org/developers/
2. Upload your extension for **signing only** (choose "unlisted")
3. Mozilla will sign it without publishing to the public store
4. Download the signed `.xpi` file (usually ready within minutes to hours)
5. Distribute the signed `.xpi` file to users
6. Users can install it normally and it will persist across restarts

#### Option 3: Developer/Enterprise Installation
- **Firefox Developer Edition**: Can load unsigned extensions permanently
- **Firefox ESR with policies**: Organizations can disable signature requirements
- **about:config modifications**: Advanced users can disable signature checking (not recommended for security)

### For Development and Personal Use
The "Load Temporary Add-on" method is the standard and recommended approach for:
- Extension development and testing
- Personal use extensions
- Prototyping and experimentation

Your extension works perfectly with this method - it's Firefox's intended workflow for unsigned extensions.
2. Click the "Copy Tab URLs" button in the popup
3. A confirmation message will appear when the URLs are copied
4. Paste the URLs anywhere you need them (each URL will be on a new line)

## Development

To modify or enhance the extension:

1. Clone this repository
2. Make your changes to the source files
3. Test the extension using the development installation steps above
4. Package the extension using the `package.sh` script when ready

## Packaging the Extension

The extension comes with a packaging script that creates a ZIP file ready for distribution:

1. Ensure all files are in place (manifest.json, popup files, and icons)
2. Make the script executable (if not already):
   ```bash
   chmod +x package.sh
   ```
3. Run the packaging script:
   ```bash
   ./package.sh
   ```
4. The packaged extension will be created in the `build` directory as `firefox-tab-url-copier-v{version}.zip`

## Project Structure

```
├── manifest.json         # Extension configuration
├── popup/
│   ├── popup.html       # Popup interface
│   ├── popup.css        # Popup styles
│   └── popup.js         # Popup functionality
├── icons/
│   ├── icon-48.png      # Small icon
│   └── icon-96.png      # Large icon
├── package.sh           # Packaging script
└── build/               # Generated extension packages