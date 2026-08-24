## What this project is

CleanSearch is a Manifest V3 Chrome extension that hides Google's AI Overview from search results. When active, it appends `udm=14` to Google search requests, forcing the "Web" results tab (which excludes AI Overviews). When inactive, it strips any `udm` param so normal "All" results with AI Overview are restored. The user toggles the extension by clicking the toolbar icon, there is no popup. Default state on install: **active**.

## Tech stack

- Plain JavaScript — no build step, no bundler, no framework, no transpilation.
- Chrome Extension Manifest V3.
- ES modules.
- `declarativeNetRequest` (DNR) for request modification — no content scripts.
- `chrome.storage.local` for persisted toggle state.

## Repository structure

```
clean-search/
├── AGENTS.md                # This file
└── extension/
    ├── manifest.json        # MV3 manifest
    ├── main.js              # Service worker — Chrome event wiring only
    ├── constants.js         # Shared constants (regex patterns, storage key)
    ├── utils.js             # Rule building + state logic (applyState, getIsExtensionActive)
    ├── package.json         # {"type":"module"} — tells Node to treat .js as ESM
    └── icons/               # active-{16,32,48,128}.png, inactive-{16,32,48,128}.png
```

## Architecture

The logic is split across three JS files with a clear separation of concerns. Preserve this split when adding features:

- **`main.js`** — Chrome event listeners only. No business logic here.
- **`constants.js`** — Single source of truth for values shared across files. When you add a new constant, export it from `constants.js` and import it where needed. Never duplicate a constant across files.
- **`utils.js`** — DNR rule construction and state application. When you add a new utility function, export it from `utils.js` and call it from `main.js`.

## DNR rules — the core mechanism

Three dynamic DNR rules, swapped based on active/inactive state:

| State | Rule ID        | Type     | Condition                                  | Action                                            |
| ----- | -------------- | -------- | ------------------------------------------ | ------------------------------------------------- |
| ON    | `REDIRECT` (1) | redirect | `GOOGLE_REGEX.SEARCH` (any `/search?` URL) | `addOrReplaceParams: [{key: "udm", value: "14"}]` |
| ON    | `ALLOW` (2)    | allow    | `GOOGLE_REGEX.TAB` (URLs with `tbm=`)      | pass through untouched                            |
| OFF   | `STRIP` (3)    | redirect | `GOOGLE_REGEX.UDM` (URLs with `udm=`)      | `removeParams: ["udm"]`                           |
| OFF   | `ALLOW` (2)    | allow    | `GOOGLE_REGEX.TAB` (URLs with `tbm=`)      | pass through untouched                            |

Key design decisions:

- **Rule IDs are stable integers** (1, 2, 3). `applyState` removes all of them then re-adds the ones for the current state — this is idempotent.
- **`tbm=` URLs are always allowed** (Images, Videos, News, Shopping). The `ALLOW` rule has priority 2 to override the `REDIRECT`/`STRIP` rules at priority 1.
- **When OFF, the extension actively strips `udm`** rather than doing nothing. Google preserves `udm=14` on subsequent searches while you're on the Web tab, so passive removal (just deleting rules) leaves the AI Overview hidden. Active stripping restores it.
- **All rules target `resourceTypes: ["main_frame"]`** only — never modify sub-resource requests.

## Critical rules for agents

1. **Keep regexes as strings in `constants.js`.** DNR's `regexFilter` requires RE2 string syntax. Do not convert them to `RegExp` objects in the extension code.
2. **Always import what you use.** After any refactor, confirm every file imports its dependencies and references current names.
3. **The `ALLOW` rule (priority 2) must outrank the redirect/strip rules (priority 1).** Do not flatten priorities — the `tbm=` pass-through depends on priority ordering.
4. **Never modify `tbm=` tab URLs.** Images, Videos, News, Shopping, and Books searches must be left untouched in both states.
5. **Default state is active.** `getIsExtensionActive()` returns `true` when storage is `undefined` (never set). On `onInstalled` with reason `install`, set the key to `true` explicitly.
6. **Do not add a popup.** The toggle is the toolbar icon click only. `manifest.json` has no `default_popup`.
7. **Scope `host_permissions` to Google search domains.** Do not request `<all_urls>` or broaden permissions beyond what's needed.

## Chrome Web Store considerations

- Permissions must match the single purpose (hide AI Overview). `declarativeNetRequest` + `storage` only.
- No data collection, no analytics, no remote code. The extension only modifies request URLs.
