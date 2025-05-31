# Tab URL & Title Copier

A Firefox extension that allows you to quickly copy all open tab URLs and titles from the current window to your clipboard in CSV format, with optional cloud storage via Supabase.

## Features

- **CSV Export**: Copy URLs and titles of all open tabs in CSV format with a single click
- **Smart Filtering**: Configurable filters to exclude specific websites (Google Drive, WhatsApp, GitHub profile, Claude AI, browser internal pages)
- **YouTube URL Cleaning**: Automatically removes tracking parameters from YouTube URLs
- **Cloud Storage**: Optional integration with Supabase for persistent storage of your tab collections
- **Anonymous Authentication**: No registration required - uses anonymous user sessions
- **Real-time Status**: Connection indicator shows cloud storage status
- **Simple Interface**: Clean, intuitive popup design
- **Local Storage**: Remembers your filter preferences

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

## Quick Start

1. **Basic Usage (Clipboard Only)**:
   - Load the extension using the installation steps below
   - Click the extension icon in the Firefox toolbar
   - Click "Copy Tabs as CSV" to copy all tab data to clipboard
   - Paste the CSV data wherever you need it

2. **With Cloud Storage** (Optional):
   - Follow the [Supabase Setup Guide](SUPABASE_SETUP.md) to enable cloud storage
   - Configure your Supabase credentials in [`supabase-config.js`](supabase-config.js)
   - The extension will automatically save your tab collections to the cloud

## Detailed Usage

1. **Open the Extension**: Click the extension icon in the Firefox toolbar
2. **Configure Filters**: Use the checkboxes to exclude specific types of websites:
   - Google Drive home pages
   - WhatsApp Web
   - Your GitHub profile
   - Claude AI conversations
   - Browser internal pages (about: URLs)
3. **Cloud Storage** (if configured):
   - Check "Save to Cloud" to automatically save tab collections to Supabase
   - Monitor the connection status indicator
4. **Copy Tabs**: Click "Copy Tabs as CSV"
5. **Use the Data**: Paste the CSV data into spreadsheets, documents, or other applications

## Cloud Storage Setup

To enable cloud storage features, see the comprehensive [Supabase Setup Guide](SUPABASE_SETUP.md).

**Benefits of Cloud Storage**:
- Persistent storage of your tab collections
- Access data across different browser sessions
- Backup of your browsing research
- Anonymous and secure (no personal info required)

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
├── manifest.json            # Extension configuration
├── popup/
│   ├── popup.html          # Popup interface
│   ├── popup.css           # Popup styles
│   └── popup.js            # Popup functionality with Supabase integration
├── icons/
│   ├── icon-48.png         # Small icon
│   └── icon-96.png         # Large icon
├── supabase-config.js      # Supabase configuration (update with your credentials)
├── supabase-setup.sql      # Database schema for Supabase
├── SUPABASE_SETUP.md       # Comprehensive setup guide for cloud storage
├── database_integration_plan.md  # Technical implementation details
├── package.sh              # Packaging script
└── build/                  # Generated extension packages
```

## Data Format

The extension exports data in CSV format with two columns:
- **URL**: Cleaned and normalized web addresses
- **Title**: Page titles with YouTube notification numbers removed

**Example Output**:
```csv
"URL","Title"
"https://www.youtube.com/watch?v=dQw4w9WgXcQ","Never Gonna Give You Up"
"https://github.com/microsoft/vscode","Visual Studio Code"
"https://www.mozilla.org/","Mozilla"
```

## Technical Details

- **Framework**: Vanilla JavaScript with WebExtensions API
- **Database**: PostgreSQL via Supabase (optional)
- **Authentication**: Supabase Anonymous Auth
- **Security**: Row Level Security (RLS) policies
- **Storage**: Local browser storage for preferences, cloud for data collections
- **Permissions**: Tabs, storage, and external connections to Supabase

## Privacy & Security

- **Anonymous Usage**: No personal information required or collected
- **Data Isolation**: Each anonymous user session has isolated data
- **Secure Storage**: Data encrypted in transit and at rest via Supabase
- **Local Control**: Cloud storage is entirely optional
- **Content Security Policy**: Restricts external connections to trusted domains only