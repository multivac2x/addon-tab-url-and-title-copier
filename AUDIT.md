# Cross-Browser Extension Audit (Firefox MV2 → Firefox MV2 + Chrome MV3)

Date: 2025-09-26  
Scope: Current repository readiness for publishing to BOTH Firefox Add-ons (AMO) and Chrome Web Store.  
Objective: Identify required changes to support dual packaging with a single shared codebase.

---

## 1. Repository Snapshot

Current key files:
- manifest.json (Manifest V2, Firefox-focused)
- popup/popup.html / popup.js / popup.css
- supabase-config.js (plain object, exposes anon key placeholder)
- package.sh (single Firefox-oriented ZIP build)
- No background scripts / service workers
- No build tooling
- No vendored third-party libraries; Supabase loaded via CDN

---

## 2. Manifest Analysis

Current manifest.json (MV2 specifics):
- "manifest_version": 2
- Uses "browser_action" (Firefox-compatible; Chrome MV2 OK but Chrome is deprecating MV2)
- Permissions: ["tabs","storage","<all_urls>"] (the <all_urls> wildcard broad — may be reducible)
- CSP: inline string with script-src self + https://*.supabase.co + https://unpkg.com
- No background section (good simplification)
- No host_permissions separation (MV3 will need explicit host permissions)
- No default locale / default icons only (OK for now)

Chrome MV3 Requirements & Impact:
- Must use "manifest_version": 3
- Replace "browser_action" with "action"
- Remote hosted script tags (CDN) are disallowed for production (must vendor Supabase)
- CSP format differs: In MV3 use "content_security_policy": { "extension_pages": "..." } if custom needed
- Need "host_permissions": ["https://*.supabase.co/"] (instead of global <all_urls> unless truly required)
- Avoid unnecessary wildcards—will need permission rationale in store listing
- Service worker required only if background logic is needed (currently not). We can stay popup-only.

Firefox MV2 Considerations:
- MV2 still supported but long-term deprecation likely (strategy note)
- Current CSP allows remote script (accepted now) but we will align with local bundle
- Optional: Add "browser_specific_settings": { "gecko": { "id": "your-addon-id@example.com" } } for self-distribution signing (future step)

---

## 3. popup.js API Usage Audit

API Calls Detected:
- browser.storage.local.set / get
- browser.tabs.query
All are part of standard WebExtensions API.

Chrome Compatibility:
- Chrome does not define window.browser by default.
Mitigation: Introduce a lightweight namespace shim:
const api = (typeof browser !== 'undefined') ? browser : chrome;
Then replace browser.* with api.* OR add conditional assignment:
if (typeof browser === 'undefined') { var browser = chrome; }
(Prefer first form for clarity.)

Clipboard:
- Uses navigator.clipboard.writeText inside a user gesture (button click) — acceptable in both browsers (no extra permission needed).

Anonymous Supabase Auth:
- Works via fetch; requires connect permission via CSP / host permissions.

---

## 4. Supabase Integration Audit

Current Issues:
- Loaded via remote CDN: <script src="https://unpkg.com/@supabase/supabase-js@2"> (BLOCKER for Chrome MV3)
- Potential future risk if CDN version shifts unexpectedly
- No integrity attribute (subresource integrity not supported for MV3 remote anyway)

Planned Remediation:
- Vendor the UMD build (e.g., download @supabase/supabase-js v2.x dist/umd/supabase.min.js)
- Store locally at /vendor/supabase.min.js (new directory)
- Update popup.html to reference local script BEFORE popup.js
- Remove unpkg domain from CSP (tighten policy)

---

## 5. Content Security Policy (CSP)

Current MV2 CSP:
script-src 'self' https://*.supabase.co https://unpkg.com; connect-src 'self' https://*.supabase.co; object-src 'self'

Issues:
- Remote script source (unpkg) not allowed in MV3
- object-src rarely needed; can likely remove
- Can restrict connect-src to only Supabase + self

Proposed Updated CSPs:

Firefox (MV2) after vendoring:
"content_security_policy": "script-src 'self'; connect-src 'self' https://*.supabase.co; object-src 'none'"

Chrome (MV3) extension_pages CSP:
"content_security_policy": {
  "extension_pages": "default-src 'self'; connect-src 'self' https://*.supabase.co; script-src 'self'; object-src 'none'"
}

---

## 6. Permissions Rationalization

Currently:
- "tabs" (needed to enumerate open tabs)
- "storage" (needed for local preference persistence)
- "<all_urls>" (broad; not strictly required unless reading tab favicons/content scripts — here only reading tab URL/title via tabs API)

Optimization:
- For read-only access to tab URL/title, Chrome MV3 may still prompt if host permissions are broad.
- Strategy: Replace "<all_urls>" with explicit host permissions only if needed:
  - We only need to query open tabs (returns URL) — no additional host permissions required unless future content scripts.
Recommendation: Remove "<all_urls>" unless a future feature needs activeTab or host matches.

Chrome MV3 host_permissions:
["https://*.supabase.co/"]

Optional: Use "optional_host_permissions" if wanting lazy grant (probably overkill here).

---

## 7. Packaging Script Assessment

Current package.sh:
- Assumes single manifest.json
- Creates build/firefox-tab-url-copier-v<version>.zip
- Includes icons, popup folder
- Does not include supabase-config.js? (ZIP command includes manifest.json popup icons only — supabase-config.js is EXCLUDED inadvertently → This is a functional issue for Supabase feature.)

Required Changes:
- Include supabase-config.js (and future vendor/ directory)
- Produce two builds:
  - dist/firefox-extension-v<version>.zip (using manifest.firefox.json renamed to manifest.json inside temp build dir)
  - dist/chrome-extension-v<version>.zip (using manifest.chrome.json)
- Exclude test HTML like test-supabase-connection.html from final zips (unless intentionally distributed)
- Add fail-fast if version mismatch or missing vendor file

---

## 8. Directory / Structural Adjustments

Add:
- manifest.firefox.json (clone of current manifest with naming update)
- manifest.chrome.json (new MV3)
- vendor/supabase.min.js
- shim/browser-api.js (optional; or inline small snippet in popup.js)
- AUDIT.md (this file)
- CHECKLIST_STORES.md (future story)

No restructuring of popup/ folder required.

---

## 9. Risk Summary (Ranked)

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Remote CDN disallowed (Chrome MV3 rejection) | High | High | Vendor Supabase locally |
| Missing supabase-config.js in packaged ZIP | Medium | High | Update packaging script include list |
| Namespace (browser vs chrome) causes runtime errors in Chrome | Medium | Medium | Add shim before usage |
| Overbroad "<all_urls>" permission triggers review friction | Medium | Medium | Remove / minimize permissions |
| Future Firefox MV2 sunset | Medium | Medium | Document migration path; optional MV3 manifest for Firefox later |
| CSP misconfiguration blocks network calls | High | Low | Explicit connect-src tested in both builds |

---

## 10. Recommended Implementation Sequence (Stories Alignment)

1. STORY-1 Audit & Report (THIS DOCUMENT) ✅
2. STORY-2 Dual Manifests & Shim
3. STORY-3 Vendor Supabase & Remove CDN
4. STORY-4 Packaging Script Upgrade
5. STORY-5 Validation & Smoke Test
6. STORY-6 Documentation & Submission Checklist

---

## 11. Acceptance Traceability

Success Criteria Mapping:
- Dual manifests → Story 2
- No remote scripts → Story 3
- Two zips with correct contents → Story 4
- Functional parity & Supabase insert in both browsers → Story 5
- Documentation & submission checklist → Story 6
- No duplicated business logic → Maintained (only manifests + minor shim differences)

---

## 12. Open Clarifications (Need Yes/No Later)

| Question | Default Assumption |
|----------|--------------------|
| Remove "<all_urls>" permission? | Yes |
| Add gecko id for Firefox self-signing now? | Defer |
| Provide optional MV3 manifest for Firefox early? | Not now |
| Use pre-built UMD (no bundler)? | Yes |
| Include test-supabase-connection.html in packages? | No |

---

## 13. Next Immediate Actions

Proceed with Story 2:
- Create manifest.firefox.json (clone + tightened CSP)
- Create manifest.chrome.json (MV3)
- Introduce API shim
- Adjust popup.html to reference vendor file placeholder (will finalize in Story 3)

---

## 14. Quick Diff Guidance (Manifest Core Differences Outline)

Firefox (MV2):
{
  "manifest_version": 2,
  "browser_action": { ... },
  "permissions": ["tabs","storage"],
  "content_security_policy": "script-src 'self'; connect-src 'self' https://*.supabase.co; object-src 'none'"
}

Chrome (MV3):
{
  "manifest_version": 3,
  "action": { ... },
  "permissions": ["tabs","storage"],
  "host_permissions": ["https://*.supabase.co/"],
  "content_security_policy": {
    "extension_pages": "default-src 'self'; connect-src 'self' https://*.supabase.co; script-src 'self'; object-src 'none'"
  }
}

---

## 15. Validation Plan Outline

Firefox:
- Load temporary add-on with manifest.firefox.json (renamed to manifest.json in temp build directory)
- Exercise: copy tabs; ensure Supabase connect after credentials

Chrome:
- Load unpacked with MV3 manifest
- Console: verify no ReferenceError for browser.*
- Execute copy tabs; verify Supabase call network request (pending keys)

---

Audit Complete.