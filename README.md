# Firefox Tab URL Copier

A Firefox extension that allows you to quickly copy all open tab URLs from the current window to your clipboard.

## Features

- Copy URLs of all open tabs in the current window with a single click
- Simple and lightweight interface
- Visual confirmation when URLs are copied
- Works with any number of tabs

## Installation Instructions

### Development/Testing Installation

1. Open Firefox and navigate to `about:debugging`
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
5. In Firefox, go to `about:addons`
6. Click the gear icon and select "Install Add-on From File"
7. Select the generated ZIP file from the `build` directory

## Usage

1. Click the extension icon in the Firefox toolbar
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