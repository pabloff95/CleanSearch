// CleanSearch — service worker (MV3)
// Hides Google's AI Overview by redirecting default "All" searches to the
// Web results tab (udm=14) when active. Other Google result tabs
// (Images/Videos/News/Shopping, identified by tbm=) are left untouched.
//
// When inactive, any udm= param (e.g. udm=14 from a prior active session,
// preserved by Google while on the Web tab) is actively stripped so the
// default "All" results with AI Overview are restored.

const REDIRECT_RULE_ID = 1; // ON:  add udm=14 to /search URLs
const ALLOW_RULE_ID = 2; // both: pass through tbm= (tab) URLs untouched
const STRIP_RULE_ID = 3; // OFF: remove udm= from /search URLs

const STORAGE_KEY = "active";

// Match any Google /search URL with a query string, on any google.* TLD.
const SEARCH_REGEX =
  "^https?://(?:[a-z0-9-]+\\.)*google\\.[a-z.]+/search\\?";

// Match Google /search URLs that target a specific tab (Images, Videos,
// News, Shopping, Books, …). These use tbm= and must be left untouched.
const TAB_REGEX =
  "^https?://(?:[a-z0-9-]+\\.)*google\\.[a-z.]+/search\\?.*tbm=";

// Match Google /search URLs that carry a udm= param (strip target when OFF).
const UDM_REGEX =
  "^https?://(?:[a-z0-9-]+\\.)*google\\.[a-z.]+/search\\?.*udm=";

/** @returns {chrome.declarativeNetRequest.Rule[]} */
function buildActiveRules() {
  return [
    {
      id: REDIRECT_RULE_ID,
      priority: 1,
      action: {
        type: "redirect",
        redirect: {
          transform: {
            queryTransform: {
              addOrReplaceParams: [{ key: "udm", value: "14" }],
            },
          },
        },
      },
      condition: {
        regexFilter: SEARCH_REGEX,
        resourceTypes: ["main_frame"],
      },
    },
    {
      id: ALLOW_RULE_ID,
      priority: 2,
      action: { type: "allow" },
      condition: {
        regexFilter: TAB_REGEX,
        resourceTypes: ["main_frame"],
      },
    },
  ];
}

/** @returns {chrome.declarativeNetRequest.Rule[]} */
function buildInactiveRules() {
  return [
    {
      id: STRIP_RULE_ID,
      priority: 1,
      action: {
        type: "redirect",
        redirect: {
          transform: {
            queryTransform: {
              removeParams: ["udm"],
            },
          },
        },
      },
      condition: {
        regexFilter: UDM_REGEX,
        resourceTypes: ["main_frame"],
      },
    },
    {
      id: ALLOW_RULE_ID,
      priority: 2,
      action: { type: "allow" },
      condition: {
        regexFilter: TAB_REGEX,
        resourceTypes: ["main_frame"],
      },
    },
  ];
}

const ALL_RULE_IDS = [REDIRECT_RULE_ID, ALLOW_RULE_ID, STRIP_RULE_ID];

/** Apply the DNR rules and the toolbar UI to match the active state. */
async function applyState(active) {
  try {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: ALL_RULE_IDS,
      addRules: active ? buildActiveRules() : buildInactiveRules(),
    });
  } catch (err) {
    console.error("[CleanSearch] DNR rule update failed:", err);
  }

  await chrome.action.setBadgeText({ text: active ? "ON" : "OFF" });
  await chrome.action.setBadgeBackgroundColor({
    color: active ? "#1a73e8" : "#5f6368",
  });
  await chrome.action.setIcon({
    path: {
      "16": `icons/${active ? "active" : "inactive"}-16.png`,
      "32": `icons/${active ? "active" : "inactive"}-32.png`,
      "48": `icons/${active ? "active" : "inactive"}-48.png`,
      "128": `icons/${active ? "active" : "inactive"}-128.png`,
    },
  });
}

/** Read persisted state, defaulting to active if never set. */
async function getActive() {
  const { [STORAGE_KEY]: active } = await chrome.storage.local.get(STORAGE_KEY);
  return active !== false; // undefined -> true (default active)
}

// --- Default state on install only (not on update) -------------------------
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === "install") {
    await chrome.storage.local.set({ [STORAGE_KEY]: true });
  }
  const active = await getActive();
  await applyState(active);
});

// --- Re-sync UI after a browser restart (badge/icon reset; rules persist) --
chrome.runtime.onStartup.addListener(async () => {
  const active = await getActive();
  await applyState(active);
});

// --- Toggle on icon click --------------------------------------------------
chrome.action.onClicked.addListener(async () => {
  const active = await getActive();
  const next = !active;
  await chrome.storage.local.set({ [STORAGE_KEY]: next });
  await applyState(next);
});
