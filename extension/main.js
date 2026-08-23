// CleanSearch — service worker (MV3)
// Hides Google's AI Overview by redirecting default "All" searches to the
// Web results tab (udm=14) when active. Other Google result tabs
// (Images/Videos/News/Shopping, identified by tbm=) are left untouched.

const REDIRECT_RULE_ID = 1;
const ALLOW_RULE_ID = 2;
const STORAGE_KEY = "active";

// Match any Google /search URL with a query string, on any google.* TLD.
const SEARCH_REGEX =
  "^https?://(?:[a-z0-9-]+\\.)*google\\.[a-z.]+/search\\?";

// Match Google /search URLs that target a specific tab (Images, Videos,
// News, Shopping, Books, …). These use tbm= and must be left untouched.
const TAB_REGEX =
  "^https?://(?:[a-z0-9-]+\\.)*google\\.[a-z.]+/search\\?.*tbm=";

/** @returns {chrome.declarativeNetRequest.Rule[]} */
function buildRules() {
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

/** Apply the DNR rules and the toolbar UI to match the active state. */
async function applyState(active) {
  try {
    if (active) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [REDIRECT_RULE_ID, ALLOW_RULE_ID],
        addRules: buildRules(),
      });
    } else {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [REDIRECT_RULE_ID, ALLOW_RULE_ID],
      });
    }
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
