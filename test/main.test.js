import { createChromeMock } from "./mocks/chrome.js";

describe("main events", () => {
  let chrome;
  let listeners;

  beforeAll(async () => {
    const mock = createChromeMock();
    global.chrome = mock.chrome;
    listeners = mock.listeners;
    await import("../extension/main.js");
  });

  beforeEach(() => {
    const mock = createChromeMock();
    global.chrome = mock.chrome;
    chrome = mock.chrome;
  });

  test("registers exactly one onInstalled listener", () => {
    expect(listeners.onInstalled).toHaveLength(1);
  });

  test("registers exactly one onStartup listener", () => {
    expect(listeners.onStartup).toHaveLength(1);
  });

  test("registers exactly one onClicked listener", () => {
    expect(listeners.onClicked).toHaveLength(1);
  });

  test("onInstalled with 'install' reason sets active=true in storage", async () => {
    chrome.storage.local.get.mockResolvedValue({ active: undefined });
    await listeners.onInstalled[0]({ reason: "install" });
    expect(chrome.storage.local.set).toHaveBeenCalledWith({ active: true });
  });

  test("onInstalled with 'install' reason applies active state", async () => {
    chrome.storage.local.get.mockResolvedValue({ active: undefined });
    await listeners.onInstalled[0]({ reason: "install" });
    expect(chrome.declarativeNetRequest.updateDynamicRules).toHaveBeenCalled();
  });

  test("onInstalled with 'update' reason does not write storage", async () => {
    chrome.storage.local.get.mockResolvedValue({ active: true });
    await listeners.onInstalled[0]({ reason: "update" });
    expect(chrome.storage.local.set).not.toHaveBeenCalled();
  });

  test("onInstalled with 'update' reason still applies current state", async () => {
    chrome.storage.local.get.mockResolvedValue({ active: true });
    await listeners.onInstalled[0]({ reason: "update" });
  });

  test("onStartup applies current persisted state", async () => {
    chrome.storage.local.get.mockResolvedValue({ active: false });
    await listeners.onStartup[0]();
    expect(chrome.declarativeNetRequest.updateDynamicRules).toHaveBeenCalled();
  });

  test("onClicked toggles active -> inactive", async () => {
    chrome.storage.local.get.mockResolvedValue({ active: true });
    await listeners.onClicked[0]();
    expect(chrome.storage.local.set).toHaveBeenCalledWith({ active: false });
  });

  test("onClicked toggles inactive -> active", async () => {
    chrome.storage.local.get.mockResolvedValue({ active: false });
    await listeners.onClicked[0]();
    expect(chrome.storage.local.set).toHaveBeenCalledWith({ active: true });
  });

  test("onClicked toggles default (undefined) -> inactive", async () => {
    chrome.storage.local.get.mockResolvedValue({ active: undefined });
    await listeners.onClicked[0]();
    expect(chrome.storage.local.set).toHaveBeenCalledWith({ active: false });
  });
});
