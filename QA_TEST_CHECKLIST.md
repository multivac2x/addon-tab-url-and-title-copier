# QA Test Checklist (Firefox MV2 & Chrome MV3)

Objective: Validate functional parity, privacy (no network), permissions minimization, and packaging integrity for Tab URL & Title Copier v1.2.

## 0. Artifacts
1. Run:
   ```bash
   ./package.sh
   ```
2. Produced files (verify existence):
   - build/tab-url-copier-firefox-v1.2.zip
   - build/tab-url-copier-chrome-v1.2.zip

## 1. Environment Prep
Open a fresh browser window (each) with these tabs:
1. https://www.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=RickAstley&utm_source=test
2. https://drive.google.com/drive/home
3. https://web.whatsapp.com/
4. https://github.com/multivac2x
5. https://claude.ai/
6. about:config (Firefox) / chrome://extensions (Chrome) (for internal page filtering test)
7. https://www.mozilla.org/

Total baseline tabs: 7 (Firefox may not allow programmatic capture of some internal pages—acceptable).

## 2. Load Extension
Firefox:
- about:debugging#/runtime/this-firefox → Load Temporary Add-on → select build/firefox/manifest.json (or zip)
Chrome:
- chrome://extensions → Developer Mode → Load unpacked → build/chrome/

Confirm icon appears.

## 3. Baseline Copy (All Filters Default = Checked)
Action:
- Open popup → Click “Copy Tabs as CSV”
Validate:
- CSV header first line: "URL","Title"
- YouTube URL canonical: https://www.youtube.com/watch?v=dQw4w9WgXcQ
- Excluded rows (Drive home, WhatsApp, GitHub profile, Claude, about:/chrome: internal) absent
- Remaining rows count: 2 (YouTube + Mozilla) (Internal page may or may not be enumerated; if excluded, still 2)

## 4. Toggle Filters Test
a. Uncheck all filters
b. Copy again
Expect:
- Rows now include previously excluded (except internal pages if browser blocks enumeration)
- Count increases (goal: 6–7 lines after header)
- GitHub profile URL matches https://github.com/multivac2x (no trailing slash variance issues)
c. Reopen popup
- All previously unchecked boxes persist (storage test)

## 5. Persistence Edge
- Change only Claude & GitHub back to checked
- Close popup, wait 5+ seconds, reopen
- Only those two reverted to checked (others remain unchecked)

## 6. Title Cleaning
Add a tab with very long title (>120 chars). Copy.
- Title in CSV truncated to <=80 chars and ends with ...
- Quotes inside any title doubled (" becomes "")

## 7. YouTube Parameter Stripping
Open another watch URL with extra params:
- https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s&pp=abc
Result line must NOT contain &t= or &pp=.

## 8. Internal Pages Filter
- Ensure “Browser Pages” checked
- Firefox: about:config not present in CSV
- Chrome: chrome://extensions never included (Chrome typically omits chrome:// anyway)

## 9. Clipboard Integrity
Paste output into a spreadsheet:
- Proper two-column separation
- No stray commas outside quotes
- Line endings Unix (\n) acceptable on all platforms

## 10. Error Handling (Negative)
Close all normal tabs leaving only an internal page + extension store page (if possible).
- Copy still produces valid CSV with header + 0 data rows (or minimal rows)
- Status message reflects 0 tab(s) gracefully (no error)

## 11. Console / Network Audit
While clicking “Copy Tabs as CSV”:
- Open DevTools (popup context)
- Console: No errors (ignore benign extension framework warnings)
- Network panel: No requests fired

## 12. Permissions Verification
Check:
- No prompts beyond install
- Manifest in each build contains only: "tabs", "storage"
- No host_permissions array present

## 13. CSP Verification
Firefox:
- content_security_policy = script-src 'self'; object-src 'none'
Chrome:
- extension_pages CSP object with same policy
No inline event handlers in popup.html.

## 14. Zip Contents Integrity
Inspect each zip:
- Contains manifest.json, popup/*, icons/*
- Does NOT contain: supabase-config.js, supabase-setup.sql, SUPABASE_SETUP.md, test-supabase-connection.html

## 15. Version Consistency
- Both manifests version = 1.2
- README references current architecture (local-only)

## 16. Final Acceptance Criteria
Pass if:
- All functional steps succeed
- No unexpected network traffic
- CSV formatting valid and deterministic
- Filter persistence correct
- No console errors
- Permissions minimal

## 17. Sign-Off Record
| Item | Result | Notes |
|------|--------|-------|
| Functional core |  |  |
| Filters |  |  |
| Persistence |  |  |
| URL cleaning |  |  |
| Title truncation |  |  |
| Clipboard |  |  |
| No network calls |  |  |
| Zips clean |  |  |
| CSP ok |  |  |
| Permissions minimal |  |  |
| Version sync |  |  |

Reviewer:  
Date:  
Decision: Approve / Block

---
Execute this checklist for both browsers before store submission.