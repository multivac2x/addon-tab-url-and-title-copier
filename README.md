# Tab URL & Title Copier

A lightweight cross‑browser (Firefox MV2 & Chrome MV3) extension that copies all open tab URLs and titles from the current window to the clipboard in CSV format, with smart filtering and YouTube URL cleaning. Fully local (no network / cloud storage).

## Features

- **CSV Export**: Copy tab URLs and titles with one click
- **Smart Filtering**: Toggle exclusion of:
  - Google Drive home
  - WhatsApp Web
  - Your GitHub profile
  - Claude AI
  - Browser internal pages (about: URLs)
- **YouTube URL Cleaning**: Normalizes watch/channel URLs (removes extraneous parameters)
- **State Persistence**: Remembers filter preferences via browser storage
- **Minimal Permissions**: Only `tabs` and `storage`
- **Cross-Browser Ready**: Single codebase, dual manifests
- **No External Calls**: Runs entirely offline (better privacy + faster reviews)

## Current Scope

Cloud storage (previously Supabase) has been removed. All former cloud-related files are deprecated stubs and excluded from packaged builds.

## Installation (Development / Testing)

### Firefox (Temporary Load)

1. Open: `about:debugging#/runtime/this-firefox`
2. Click “Load Temporary Add-on”
3. Select `manifest.firefox.json` (or after packaging, load the unzipped build/firefox directory)
4. Click the extension icon → press “Copy Tabs as CSV”

Note: Temporary add-ons are removed on browser restart (normal for unsigned development extensions).

### Chrome (Unpacked Load)

1. Go to `chrome://extensions`
2. Enable “Developer mode”
3. Click “Load unpacked”
4. Select `build/chrome` (after running the packaging script) or the repository root with `manifest.chrome.json`
5. Use the toolbar icon

## Usage

1. Open the popup
2. (Optional) Adjust filter checkboxes
3. Click “Copy Tabs as CSV”
4. Paste into a spreadsheet or text editor (first row is a header)

CSV Columns:
- URL
- Title (cleaned, truncated at 80 chars, embedded quotes escaped)

## Packaging (Dual Builds)

The `package.sh` script produces Firefox + Chrome bundles.

```bash
chmod +x package.sh
./package.sh
```

Outputs (in `build/`):
- `tab-url-copier-firefox-v<version>.zip`
- `tab-url-copier-chrome-v<version>.zip`

Version is read from `manifest.firefox.json`.

## Project Structure (Simplified)

```
├── manifest.firefox.json        # Firefox MV2 manifest
├── manifest.chrome.json         # Chrome MV3 manifest
├── manifest.json                # (Legacy / not used in packaging)
├── popup/
│   ├── popup.html               # UI (filters + action button)
│   ├── popup.css                # Styles
│   └── popup.js                 # Logic (clipboard + filtering + namespace shim)
├── icons/
│   ├── icon-48.png
│   └── icon-96.png
├── package.sh                   # Dual packaging script
├── BUILD_STRATEGY.md            # Technical build & rationale
├── AUDIT.md                     # Original audit (historical context)
├── supabase-config.js           # Deprecated (stub)
├── supabase-setup.sql           # Deprecated (stub)
├── SUPABASE_SETUP.md            # Deprecated (stub)
├── test-supabase-connection.html# Deprecated (stub)
```

## Privacy & Security

- No remote network requests
- No analytics or tracking
- Only `tabs` (to read current window tab metadata) and `storage` (to persist filter state)
- No background script or service worker (popup-only execution)
- Content Security Policy (self-only scripts; no remote script execution)

## Permissions Justification

| Permission | Reason |
|------------|--------|
| tabs       | Enumerate current window tabs (URL + title) |
| storage    | Persist user filter preferences |

No host permissions or broad URL access required.

## Testing Checklist

1. Load in Firefox & Chrome
2. Open various tabs (YouTube, GitHub, Drive, WhatsApp, about:preferences)
3. Toggle filters → copy CSV → verify excluded entries
4. Reopen popup → confirm filter states persisted
5. Inspect DevTools Network tab (popup) → no network requests
6. Console free of errors (e.g. no `chrome is not defined` / `browser is not defined`)

## YouTube Normalization Rules (Summary)

- Watch URLs reduced to canonical `https://www.youtube.com/watch?v=<id>`
- Channel / user / handle paths retained (`/channel/...`, `/c/...`, `/@handle`)
- Unrecognized formats passed unchanged

## Contributing

1. Fork / clone
2. Modify code in `popup/`
3. Adjust manifests if needed
4. Run `./package.sh` and test both builds
5. Submit PR describing change & justification

## Future Enhancements (Potential)

- Optional background history snapshot
- Custom exclusion patterns (user-defined regex)
- Export formats (Markdown table, JSON)
- Bulk window / profile aggregation
- (If reintroduced) Optional modular sync backend with explicit opt‑in

## Legacy Notice

Cloud sync (Supabase) was removed to streamline scope and improve privacy. Reintroduction (if desired) would follow a modular, opt‑in architecture (see BUILD_STRATEGY.md section “Migration Guidance”).

## Licensing

(Insert license statement here if/when a license is chosen—currently unspecified.)

## Support

Open an issue describing:
- Browser & version
- Steps to reproduce
- Console errors (if any)
- Expected vs actual behavior

Clear reports help rapid resolution.

---
Lean, private, and cross‑browser from a single codebase.