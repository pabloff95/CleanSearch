# Privacy Policy

Last updated: September 20, 2026

## Summary

CleanSearch respects your privacy. We do **not** collect, store, transmit, or share any of your personal data or search history.

## Data Collection

CleanSearch **does not**:
- Collect your search queries or browsing history
- Send data to external servers
- Track your activity
- Use analytics or telemetry
- Store cookies or identifiers
- Share data with third parties

## How CleanSearch Works

All processing happens locally in your browser:

1. **Request modification** — When you perform a Google search, CleanSearch modifies the request URL locally using Chrome's Declarative Net Request API
2. **State storage** — Your toggle preference (active/inactive) is stored only in your browser's local storage via `chrome.storage.local`
3. **No network requests** — CleanSearch makes no external API calls or network requests beyond the modified Google search URL

## Permissions

CleanSearch requests the following permissions:

- `declarativeNetRequest` — To modify Google search request URLs
- `storage` — To persist your toggle preference
- `host_permissions` — Limited to Google search domains (`*.google.*`)

These permissions are used **only** to implement the extension's core functionality.

## Data You Control

You have full control over your data:

- **Toggle state** — Stored locally in your browser; deleted if you uninstall the extension
- **Browser data** — Google's data collection (if any) is unchanged by CleanSearch and governed by Google's Privacy Policy
- **No sync** — Your preference is not synced across devices

## Open Source

CleanSearch is open source. You can audit the complete source code on GitHub:
[github.com/pabloff95/CleanSearch](https://github.com/pabloff95/CleanSearch)

## Third-Party Services

CleanSearch does not use any third-party services, analytics platforms, or SDKs.

## Changes to This Policy

If we update this privacy policy, we will update the "Last updated" date above. By continuing to use CleanSearch, you accept the current policy.

## Contact

For privacy questions or concerns, please open an issue on [GitHub](https://github.com/pabloff95/CleanSearch/issues).
