# Store Submission Checklist

This checklist covers both Firefox Add-ons (AMO) and Chrome Web Store submission for Tab URL & Title Copier (local-only, no network).

## 1. Pre-Submission Technical Integrity
- [ ] Version synchronized (manifest.firefox.json and manifest.chrome.json have identical "version")
- [ ] README updated and free of deprecated Supabase references
- [ ] Deprecated manifest.json clearly marked (contains "[DEPRECATED STUB]")
- [ ] No Supabase or network code present in popup/popup.js
- [ ] popup.html contains only local script inclusion
- [ ] No usage of eval, new Function, inline event handlers
- [ ] CSP strict (self only; object-src none)
- [ ] Packaging script builds two clean zips
- [ ] Icons present (48, 96). Consider adding 16, 128, 256 for stores
- [ ] CSV output validated (header + rows)
- [ ] Filters persist across popup reopen
- [ ] Clipboard write succeeds in both browsers
- [ ] No background service worker (Chrome MV3) / no background page (Firefox)
- [ ] No errors in console after action

## 2. Permissions Justification
- [ ] tabs: Required to enumerate current window tabs (URL + title) for export
- [ ] storage: Required to persist filter checkbox state
- [ ] No host_permissions requested
- [ ] No "<all_urls>" present

## 3. Privacy & Security Statement
- [ ] State: No data leaves the user's machine
- [ ] No analytics, ads, tracking, or remote fetch
- [ ] Only transient processing inside popup
- [ ] No personal data collection
- [ ] CSP documented in README

## 4. Marketing / Store Listing Assets
- [ ] Short name: Tab URL & Title Copier
- [ ] Description (concise): Copy current window tab URLs and titles as CSV with smart filters. Local-only. No tracking.
- [ ] Long description (Chrome) / Summary (Firefox) includes:
  - Feature bullets (CSV export, filters, YouTube cleaning, privacy-first)
  - Minimal permissions note
  - Offline / local-only emphasis
- [ ] Icon 128x128 (recommended) created
- [ ] Optional promo images (Chrome): 440x280
- [ ] Screenshots (at least 2):
  - Popup UI (filters + button)
  - Result pasted into spreadsheet (optional)

## 5. Firefox (AMO) Specific
- [ ] Zip built from build/tab-url-copier-firefox-vX.zip
- [ ] Manifest version 2 (current file)
- [ ] No experimental APIs
- [ ] Submission metadata:
  - Category: Productivity
  - License chosen / declared
  - Source code link (GitHub) provided
- [ ] Privacy policy (inline text - can note “No data collected or transmitted”)
- [ ] Manual smoke test via about:debugging matches packaged zip behavior

## 6. Chrome Web Store Specific
- [ ] Zip built from build/tab-url-copier-chrome-vX.zip
- [ ] Manifest version 3
- [ ] No service worker needed (popup-only)
- [ ] action.default_popup defined
- [ ] No externally hosted code
- [ ] Privacy setting: “This extension does not collect or use data”
- [ ] Data disclosure form answered minimally
- [ ] Provide support link (issues page)

## 7. QA Test Matrix
| Scenario | Steps | Expected |
|----------|-------|----------|
| Basic copy | Open 5 varied tabs → click button | CSV with 5 rows + header |
| Filters active | Enable all filters with matching tabs | Excluded rows removed |
| Persistence | Toggle some filters → close popup → reopen | States match previous |
| YouTube clean | Open watch URL with extra params | Canonical watch URL in CSV |
| About pages excluded | Enable about filter w/ about:config tab | about: tab missing |
| Large title truncation | Open page with >80 char title | Title ends with ... |
| No network | Open Network tab in DevTools while copying | No requests made |

## 8. Manual Review Prep
- [ ] Provide minimal rationale for each permission in store submission form
- [ ] Provide explicit statement: “No remote code execution, no network access, no tracking”
- [ ] Confirm no references to Supabase remain except deprecated stubs in repo root
- [ ] Confirm repository contains LICENSE file (add if missing)
- [ ] Tag a release in Git: vX.Y (matches manifest)

## 9. Release Tag Procedure
1. Update version in both manifests
2. Commit changes (message: chore(release): vX.Y)
3. Tag: git tag vX.Y
4. Push tags: git push --tags
5. Build packaging script
6. Upload respective zips to stores

## 10. Post-Publish
- [ ] Verify listing displays correct icon & description
- [ ] Install from store to confirm identical behavior to local test
- [ ] Capture final screenshot for README (optional)
- [ ] Monitor initial reviews / error reports

## 11. Future Hardening (Optional)
- [ ] Add automated lint & packaging GitHub Action
- [ ] Add minimal unit tests for URL/title cleaning functions
- [ ] Add LICENSE (MIT or similar)
- [ ] Add Markdown / JSON export options behind feature flags

## 12. Submission Blockers Checklist (All Must Be True)
- [ ] No unused permissions
- [ ] No remote script includes
- [ ] No failing console errors
- [ ] Manifest versions aligned
- [ ] Icons valid PNG
- [ ] README consistent

## 13. Sign-Off
- Reviewer name:
- Date:
- Version:
- Decision: Approve / Block

---
Keep this file updated before each submission.