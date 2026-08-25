import { applyState, getIsExtensionActive } from "../extension/utils.js";
import { createChromeMock } from "./mocks/chrome.js";

describe("applyState", () => {
  let chrome;

  beforeEach(() => {
    const mock = createChromeMock();
    global.chrome = mock.chrome;
    chrome = mock.chrome;
  });

  test("removes all rule IDs before adding (idempotent)", async () => {
    await applyState(true);
    const { removeRuleIds } =
      chrome.declarativeNetRequest.updateDynamicRules.mock.calls[0][0];
    expect(removeRuleIds).toEqual(expect.arrayContaining([1, 2, 3]));
  });

  test("active state adds REDIRECT + ALLOW rules", async () => {
    await applyState(true);
    const { addRules } =
      chrome.declarativeNetRequest.updateDynamicRules.mock.calls[0][0];
    expect(addRules).toHaveLength(2);

    // REDIRECT rule (id 1, priority 1)
    expect(addRules[0].id).toBe(1);
    expect(addRules[0].priority).toBe(1);
    expect(addRules[0].action.type).toBe("redirect");
    expect(
      addRules[0].action.redirect.transform.queryTransform.addOrReplaceParams
    ).toEqual([{ key: "udm", value: "14" }]);
    expect(addRules[0].condition.resourceTypes).toEqual(["main_frame"]);

    // ALLOW rule (id 2, priority 2)
    expect(addRules[1].id).toBe(2);
    expect(addRules[1].priority).toBe(2);
    expect(addRules[1].action.type).toBe("allow");
    expect(addRules[1].condition.resourceTypes).toEqual(["main_frame"]);
  });

  test("inactive state adds STRIP + ALLOW rules", async () => {
    await applyState(false);
    const { addRules } =
      chrome.declarativeNetRequest.updateDynamicRules.mock.calls[0][0];
    expect(addRules).toHaveLength(2);

    // STRIP rule (id 3, priority 1)
    expect(addRules[0].id).toBe(3);
    expect(addRules[0].priority).toBe(1);
    expect(addRules[0].action.type).toBe("redirect");
    expect(
      addRules[0].action.redirect.transform.queryTransform.removeParams
    ).toEqual(["udm"]);
    expect(addRules[0].condition.resourceTypes).toEqual(["main_frame"]);

    // ALLOW rule (id 2, priority 2)
    expect(addRules[1].id).toBe(2);
    expect(addRules[1].priority).toBe(2);
    expect(addRules[1].action.type).toBe("allow");
  });

  test("ALLOW rule always has higher priority than redirect/strip", async () => {
    await applyState(true);
    const { addRules: activeRules } =
      chrome.declarativeNetRequest.updateDynamicRules.mock.calls[0][0];
    const activeAllow = activeRules.find((r) => r.action.type === "allow");
    const activeRedirect = activeRules.find((r) => r.action.type === "redirect");
    expect(activeAllow.priority).toBeGreaterThan(activeRedirect.priority);

    const mock2 = createChromeMock();
    global.chrome = mock2.chrome;
    await applyState(false);
    const { addRules: inactiveRules } =
      mock2.chrome.declarativeNetRequest.updateDynamicRules.mock.calls[0][0];
    const inactiveAllow = inactiveRules.find((r) => r.action.type === "allow");
    const inactiveRedirect = inactiveRules.find(
      (r) => r.action.type === "redirect"
    );
    expect(inactiveAllow.priority).toBeGreaterThan(inactiveRedirect.priority);
  });

  test("active state sets ON badge with blue color", async () => {
    await applyState(true);
    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: "ON" });
    expect(chrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith({
      color: "#1a73e8",
    });
  });

  test("inactive state sets OFF badge with grey color", async () => {
    await applyState(false);
    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: "OFF" });
    expect(chrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith({
      color: "#5f6368",
    });
  });

  test("active state sets active icons", async () => {
    await applyState(true);
    expect(chrome.action.setIcon).toHaveBeenCalledWith({
      path: {
        16: "icons/active-16.png",
        32: "icons/active-32.png",
        48: "icons/active-48.png",
        128: "icons/active-128.png",
      },
    });
  });

  test("inactive state sets inactive icons", async () => {
    await applyState(false);
    expect(chrome.action.setIcon).toHaveBeenCalledWith({
      path: {
        16: "icons/inactive-16.png",
        32: "icons/inactive-32.png",
        48: "icons/inactive-48.png",
        128: "icons/inactive-128.png",
      },
    });
  });
});

describe("getIsExtensionActive", () => {
  let chrome;

  beforeEach(() => {
    const mock = createChromeMock();
    global.chrome = mock.chrome;
    chrome = mock.chrome;
  });

  test("returns true when storage has active=true", async () => {
    chrome.storage.local.get.mockResolvedValue({ active: true });
    expect(await getIsExtensionActive()).toBe(true);
  });

  test("returns true by default when storage is undefined (never set)", async () => {
    chrome.storage.local.get.mockResolvedValue({ active: undefined });
    expect(await getIsExtensionActive()).toBe(true);
  });

  test("returns false when storage has active=false", async () => {
    chrome.storage.local.get.mockResolvedValue({ active: false });
    expect(await getIsExtensionActive()).toBe(false);
  });
});
