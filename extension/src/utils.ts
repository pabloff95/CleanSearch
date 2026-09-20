import {
  GOOGLE_REGEX,
  CHROME_LOCAL_STORAGE_EXTENSION_KEY,
} from "./constants.js";

const RULE_IDS = {
  REDIRECT: 1, // ON:  add udm=14 to /search URLs
  ALLOW: 2, // both: pass through tbm= (tab) URLs untouched
  STRIP: 3, // OFF: remove udm= from /search URLs
} as const;

function buildActiveRules(): chrome.declarativeNetRequest.Rule[] {
  return [
    {
      id: RULE_IDS.REDIRECT,
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
        regexFilter: GOOGLE_REGEX.SEARCH,
        resourceTypes: ["main_frame"],
      },
    },
    {
      id: RULE_IDS.ALLOW,
      priority: 2,
      action: { type: "allow" },
      condition: {
        regexFilter: GOOGLE_REGEX.TAB,
        resourceTypes: ["main_frame"],
      },
    },
  ];
}

function buildInactiveRules(): chrome.declarativeNetRequest.Rule[] {
  return [
    {
      id: RULE_IDS.STRIP,
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
        regexFilter: GOOGLE_REGEX.UDM,
        resourceTypes: ["main_frame"],
      },
    },
    {
      id: RULE_IDS.ALLOW,
      priority: 2,
      action: { type: "allow" },
      condition: {
        regexFilter: GOOGLE_REGEX.TAB,
        resourceTypes: ["main_frame"],
      },
    },
  ];
}

/** Apply the DNR rules and the toolbar UI to match the active state. */
export async function applyState(active: boolean): Promise<void> {
  try {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: Object.values(RULE_IDS),
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
      16: `icons/${active ? "active" : "inactive"}-16.png`,
      32: `icons/${active ? "active" : "inactive"}-32.png`,
      48: `icons/${active ? "active" : "inactive"}-48.png`,
      128: `icons/${active ? "active" : "inactive"}-128.png`,
    },
  });
}

/** Read persisted state, defaulting to active if never set. */
export async function getIsExtensionActive(): Promise<boolean> {
  const { [CHROME_LOCAL_STORAGE_EXTENSION_KEY]: active } =
    await chrome.storage.local.get(CHROME_LOCAL_STORAGE_EXTENSION_KEY);
  return active !== false;
}
