// CleanSearch — shared constants
// Regex patterns are stored as strings because the declarativeNetRequest
// API requires regexFilter to be a string (RE2 syntax). Tests can wrap
// them with new RegExp() to verify matching behavior.

// DNR rule IDs. Each unique rule must have a stable ID so it can be
// removed/replaced idempotently when toggling state.
export const REDIRECT_RULE_ID = 1; // ON:  add udm=14 to /search URLs
export const ALLOW_RULE_ID = 2; // both: pass through tbm= (tab) URLs untouched
export const STRIP_RULE_ID = 3; // OFF: remove udm= from /search URLs

export const STORAGE_KEY = "active";

// Match any Google /search URL with a query string, on any google.* TLD.
export const SEARCH_REGEX =
  "^https?://(?:[a-z0-9-]+\\.)*google\\.[a-z.]+/search\\?";

// Match Google /search URLs that target a specific tab (Images, Videos,
// News, Shopping, Books, …). These use tbm= and must be left untouched.
export const TAB_REGEX =
  "^https?://(?:[a-z0-9-]+\\.)*google\\.[a-z.]+/search\\?.*tbm=";

// Match Google /search URLs that carry a udm= param (strip target when OFF).
export const UDM_REGEX =
  "^https?://(?:[a-z0-9-]+\\.)*google\\.[a-z.]+/search\\?.*udm=";
