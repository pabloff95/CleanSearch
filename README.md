# CleanSearch

A lightweight, open-source Chrome extension that gives you control over Google's AI Overview in search results.

## What is CleanSearch?

CleanSearch is a Chrome extension that lets you toggle Google's AI Overview on and off. When enabled, it hides AI Overviews and shows traditional web search results. When disabled, it displays Google's default search experience with AI Overviews.

**Why use it?**

- 🎯 **Privacy-focused** — No data collection, no tracking, no analytics
- ⚡ **Lightweight** — Plain JavaScript, zero dependencies at runtime
- 🔒 **Open source** — Audit the code yourself
- 🎨 **Simple** — One-click toggle, no configuration needed

## Features

- **One-click toggle** — Click the toolbar icon to activate/deactivate
- **Persistent state** — Your preference is saved and restored after browser restart
- **No popups** — Clean, distraction-free UI with just the toolbar icon
- **Tab-aware** — Works seamlessly with image search, video search, news, shopping, and other Google tabs

## Installation

### From Chrome Web Store

[CleanSearch on Chrome Web Store](https://chrome.google.com/webstore)

1. Click "Add to Chrome"
2. Confirm the permissions
3. The extension is ready to use — click the toolbar icon to toggle

## How It Works

CleanSearch uses Chrome's **Declarative Net Request (DNR)** API to modify Google search requests:

- **When active:** Adds `udm=14` parameter to Google search URLs, which forces the "Web" results tab (excluding AI Overviews)
- **When inactive:** Strips the `udm` parameter, restoring Google's default behavior with AI Overviews
- **Tab-safe:** Never modifies image search, video search, news, shopping, or other specialized tabs

All modifications happen at the network level — no content scripts, no page injection, minimal performance impact.

### Manual Installation (for development)

1. Clone the repository:

   ```bash
   git clone https://github.com/pabloff95/CleanSearch.git
   cd CleanSearch
   ```

2. Install dependencies:

   ```bash
   yarn install
   ```

3. Build the extension:

   ```bash
   yarn build-app
   ```

4. Load in Chrome:
   - Open `chrome://extensions/` in your browser
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `extension/dist` folder
   - Done! The extension is now active

## Contributing

We welcome contributions! Here's how to get started:

### Prerequisites

- Node.js 18+
- Yarn
- Chrome/Chromium browser

### Project Structure

```
clean-search/
├── extension/
│   ├── src/
│   │   ├── main.ts        # Service worker — Chrome event handling
│   │   ├── utils.ts       # DNR rule building and state management
│   │   └── constants.ts   # Shared constants (regex patterns, storage keys)
│   ├── manifest.json      # Extension manifest (MV3)
│   └── icons/             # Toolbar icons (active/inactive, multiple sizes)
├── test/                  # Jest test suites
└── package.json           # Dependencies and scripts
```

### Development Guidelines

- **No build step at runtime** — The extension ships as plain JavaScript
- **TypeScript for development** — Compile to ES modules (checked in `extension/dist`)
- **DNR rules** — All URL modifications use Chrome's declarative net request API
- **Storage** — Extension state is persisted in `chrome.storage.local`
- **No external dependencies** — Zero runtime libraries

### Making Changes

1. Edit files in `extension/src/`
2. Run `yarn build-app` to compile
3. Reload the extension in `chrome://extensions/` (click the reload button)
4. Test in Chrome
5. Add tests in `test/` if appropriate
6. Run `yarn test` and `yarn typecheck` before submitting a PR

## Privacy & Security

- **No data collection** — CleanSearch doesn't collect, store, or transmit any user data
- **No external calls** — All processing happens locally in your browser
- **Limited permissions** — Only requests permissions for Google search domains and local storage
- **Open source** — You can audit the entire codebase on GitHub

For detailed information, see our [Privacy Policy](PRIVACY.md).

## License

This project is licensed under the [MIT License](LICENSE).

## Support

Found a bug or have a feature request? Please open an [issue on GitHub](https://github.com/pabloff95/CleanSearch/issues).
