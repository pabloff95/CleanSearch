# Chrome Extension: CleanSearch — Google AI Overview Toggle

## Goal

A Manifest V3 Chrome extension that hides Google's AI Overview results by
appending `udm=14` to Google search requests when active, and restores
normal results when inactive. Toggled by clicking the toolbar icon
(no popup). Default state on install: **active**.

Name of the extension: CleanSearch

## Mechanism

- `declarativeNetRequest` — redirects/modifies Google search requests to
  append `udm=14`, forcing the "Web" results tab (which excludes AI
  Overviews). No content-script scraping required.
- `chrome.action.onClicked` — toggles state on icon click, updates the
  badge text (`ON` / `OFF`) and icon.
- `chrome.storage.local` — persists toggle state across browser restarts.

## Tech Stack

- Plain JS + manifest.json — no build step, no frontend framework.

## File Structure

extension/
├── manifest.json
├── main.js
├── icons/
│ ├── active-16.png
│ ├── active-32.png
│ ├── active-48.png
│ ├── active-128.png
│ ├── inactive-16.png
│ ├── inactive-32.png
│ ├── inactive-48.png
│ └── inactive-128.png

## Build Steps

### 1. Scaffold the project

Set up the folder structure above. No build tooling needed.

### 2. Write manifest.json

- Manifest V3
- Permissions: `declarativeNetRequest`, `storage`, `action`
- `host_permissions` scoped narrowly to `*://www.google.com/search*`
  (not all of google.com) — keeps Web Store review simpler.

### 3. Implement main.js (service worker)

- On install: set `active = true` in `chrome.storage.local`, register a
  dynamic `declarativeNetRequest` rule appending `udm=14` to matching
  requests.
- On icon click: flip stored state, add/remove the rule accordingly,
  update badge text and icon to match.

### 4. Design two icon states

- Active (AI hidden): normal/highlighted icon. This is the classic star icon.
- Inactive: greyed-out or crossed-out version.This is the classic star icon crossed with a diagonal line

### 5. Local testing

- Load unpacked via `chrome://extensions`.
- Verify: AI Overview disappears when active, reappears when toggled off,
  state survives browser restart, non-search Google pages unaffected.

### 6. Prep for Chrome Web Store

- Short privacy policy (no data collection, only request-URL modification).
- Single-purpose description.
- 1–2 before/after screenshots for the listing.

### 7. Package and submit

- Zip the extension folder.
- Create a one-time $5 Chrome Web Store developer account (if needed).
- Upload, complete the listing, submit for review (typically a few days
  to ~2 weeks for first-time review).
