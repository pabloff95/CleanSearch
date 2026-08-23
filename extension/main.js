import {
  GOOGLE_REGEX,
  CHROME_LOCAL_STORAGE_EXTENSION_KEY,
} from "./constants.js";
import { getIsExtensionActive, applyState } from "./utils.js";

// ------------------ CHROME EVENT LISTENERS -------------------------------------------------
// --- Default state on install only (not on update) -------------------------
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === "install") {
    await chrome.storage.local.set({ [CHROME_LOCAL_STORAGE_EXTENSION_KEY]: true });
  }
  const active = await getIsExtensionActive();
  await applyState(active);
});

// --- Re-sync UI after a browser restart (badge/icon reset; rules persist) --
chrome.runtime.onStartup.addListener(async () => {
  const active = await getIsExtensionActive();
  await applyState(active);
});

// --- Toggle on icon click --------------------------------------------------
chrome.action.onClicked.addListener(async () => {
  const active = await getIsExtensionActive();
  const next = !active;
  await chrome.storage.local.set({ [CHROME_LOCAL_STORAGE_EXTENSION_KEY]: next });
  await applyState(next);
});
