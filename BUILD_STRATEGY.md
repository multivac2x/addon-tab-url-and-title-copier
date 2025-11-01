# Build & Packaging Strategy: Dual Firefox (MV2) + Chrome (MV3) (Updated After Supabase Removal)

Date: 2025-09-26  
Status: Active strategy (post-refactor)  
Related Docs: AUDIT.md

---

## 1. Objectives

1. Single repository produces two distributable artifacts:
   - build/tab-url-copier-firefox-v<version>.zip (Manifest V2)
   - build/tab-url-copier-chrome-v<version>.zip (Manifest V3)
2. Zero duplication of business logic (shared popup code & assets).
3. No external runtime dependencies (pure WebExtension + clipboard + storage).
4. Minimize tooling (pure POSIX shell packaging).
5. MV3-ready code (namespace shim ensures Chrome compatibility now; future Firefox MV3 migration trivial).
6. Reduced permission surface (removed <all_urls> and any network connectivity need).

---

## 2. Current Repository Assets (Post-Removal)

Essential:
- manifest.firefox.json (MV2)
- manifest.chrome.json (MV3)
- popup/ (popup.html, popup.js, popup.css)
- icons/
- package.sh (dual build)
- BUILD_STRATEGY.md (this file)
- AUDIT.md (historical analysis)

Deprecated / Legacy handled:
- Supabase-related files overwritten with single-line deprecation markers to avoid distribution.

---

## 3. Manifest Design (Final)

### 3.1 Firefox (MV2)

Key fields:
- manifest_version: 2
- browser_action present
- permissions: ["tabs","storage"]
- CSP: "script-src 'self'; object-src 'none'"
- No network/connect-src needed (no outbound requests)
- Removed <all_urls>

### 3.2 Chrome (MV3)

Key fields:
- manifest_version: 3
- action (toolbar popup)
- permissions: ["tabs","storage"]
- content_security_policy:
  {
    "extension_pages": "script-src 'self'; object-src 'none'"
  }
- No host_permissions (no remote fetches)
- No background/service worker required (popup-only functionality)

Result: Minimal, review-friendly manifests.

---

## 4. Removed Supabase Integration (Rationale)

Original plan included optional cloud persistence via Supabase with:
- External script from unpkg
- Anonymous auth
- JSONB inserts

Issues / Trade-offs prompting removal:
- Increased CSP complexity (remote script + connect-src)
- Additional review scrutiny (persistent remote data)
- Unnecessary for core user value (CSV copy workflow)
- Introduced failure states (auth/network) degrading UX

Decision: Remove Supabase entirely now. All related runtime logic and UI removed. Artifacts retained only as inert single-line placeholder files to signal deprecation without risking accidental reintroduction in packaged zips.

Benefits:
- Smaller attack surface
- Faster popup initialization
- Simplified manifests & CSP
- Easier cross-store review

---

## 5. Namespace Compatibility

Implemented minimal shim (top of popup.js):

if (typeof browser === 'undefined' && typeof chrome !== 'undefined') {
  var browser = chrome;
}

Outcome:
- No duplicated logic
- Chrome API compatibility achieved
- Future removal trivial if adopting MV3-only baseline

---

## 6. Packaging Script (package.sh) Summary

Features:
- Validates presence of manifest.firefox.json & manifest.chrome.json
- Extracts version from Firefox manifest
- Creates build/firefox and build/chrome staging directories
- Copies shared assets
- Renames target manifest to manifest.json per bundle
- Excludes legacy Supabase artefacts from zips implicitly (they are not copied)
- Produces:
  - build/tab-url-copier-firefox-v<version>.zip
  - build/tab-url-copier-chrome-v<version>.zip
- Provides file count summary

No dependency on jq or Node.

---

## 7. Security & Permissions Post-Refactor

- Permissions: ["tabs","storage"] only (minimal required)
- No host permissions (Chrome) nor optional permissions
- CSP hardened: script-src 'self'; object-src 'none'
- No remote network surfaces (fetch / connect usage absent)
- Clipboard write via user gesture (button click) remains compliant
- Local storage (browser.storage.local) used solely for filter state persistence

---

## 8. Future-Proof Notes

Planned potential evolutions:
- If background logic introduced (e.g., periodic snapshotting), add MV3 service worker (Chrome) and evaluate event page migration (Firefox when MV3-mandated).
- If optional cloud sync reconsidered: implement as opt-in modular feature with:
  - Separate optional JS module loaded after explicit user enable
  - Explicit permission disclosure
  - Clear privacy documentation
- Possible consolidation later: derive both manifests from a manifest.base.json + transform script (currently unnecessary given simplicity).

---

## 9. Testing Procedure (Updated)

1. Build
   - Run: bash package.sh
2. Firefox
   - about:debugging → This Firefox → Load Temporary Add-on → select build/firefox/manifest.json (after unzipping or load entire staging dir)
   - Open popup, verify:
     - Filters present
     - Click Copy Tabs as CSV → clipboard includes header + rows
     - State persistence: toggle a filter, close & reopen popup, state remains
3. Chrome
   - chrome://extensions → Developer mode → Load unpacked → build/chrome directory
   - Open popup; confirm no console errors (browser shim working)
   - Perform CSV copy, validate clipboard, toggle persistence
4. Edge Cases
   - No tabs open (besides internal) → CSV only header row or minimal entries
   - about: pages filtered when checkbox active
5. Regression
   - Multi-window scenario: specification currently queries currentWindow only (intentional)
6. Optional Manual Inspection
   - Inspect packaged zips for absence of deprecated Supabase files

---

## 10. Implementation Delta (Before → After)

| Aspect | Before | After |
|--------|--------|-------|
| Cloud dependency | Supabase required | None |
| Remote scripts | unpkg CDN | None |
| CSP | Included external domains | Self-only |
| Permissions | tabs, storage, <all_urls> | tabs, storage |
| Manifests | Single MV2 | Dual MV2 + MV3 |
| Packaging | Single zip | Dual zips |
| Namespace | browser only | browser + chrome shim |
| Failure modes | Network/auth errors | None (local only) |

---

## 11. Open Decisions (Now Closed)

| Decision | Final |
|----------|-------|
| Remove Supabase | Yes (fully) |
| Keep deprecated docs | Overwritten stubs |
| Add gecko id now | No |
| Add background worker | No |
| Maintain legacy manifest.json | Pending deprecation (to mark as legacy) |

---

## 12. Outstanding Follow-up Tasks

(See todo list system for live status; summarized here)

1. Mark legacy manifest.json as deprecated or remove.
2. Update README (reflect local-only design, usage instructions).
3. Add submission checklist (AMO + Chrome Web Store) focusing on minimal permissions rationale.

---

## 13. Acceptance Criteria (Revised)

- Both produced zips load without warnings (Firefox & Chrome).
- Clipboard export works identically in both browsers.
- No network requests emitted (verify via DevTools Network: none on popup open + button action).
- No console errors or CSP violations.
- Only required permissions appear in install prompt.
- Source tree free of active Supabase logic.

---

## 14. Migration Guidance (If Reintroducing Cloud Later)

1. Create feature branch (feature/cloud-sync).
2. Add cloud-sync module (e.g., /features/cloud-sync.js).
3. Introduce dynamic import triggered by explicit user toggle.
4. Expand permissions + CSP incrementally with justification.
5. Provide privacy note in README.
6. Re-run store packaging with separated optional assets.

---

## 15. Summary

Core extension simplified to its essential value proposition: fast, reliable tab metadata export with configurable filtering, available cross-browser with minimal maintenance overhead and a future-proof path toward MV3 convergence.
