import { jest } from "@jest/globals";

export function createChromeMock() {
  const listeners = {
    onInstalled: [],
    onStartup: [],
    onClicked: [],
  };

  const chrome = {
    declarativeNetRequest: {
      updateDynamicRules: jest.fn(async () => undefined),
      getDynamicRules: jest.fn(async () => []),
    },
    storage: {
      local: {
        get: jest.fn(async () => ({})),
        set: jest.fn(async () => undefined),
      },
    },
    action: {
      setBadgeText: jest.fn(async () => undefined),
      setBadgeBackgroundColor: jest.fn(async () => undefined),
      setIcon: jest.fn(async () => undefined),
      onClicked: {
        addListener: jest.fn((fn) => listeners.onClicked.push(fn)),
      },
    },
    runtime: {
      onInstalled: {
        addListener: jest.fn((fn) => listeners.onInstalled.push(fn)),
      },
      onStartup: {
        addListener: jest.fn((fn) => listeners.onStartup.push(fn)),
      },
    },
  };

  return { chrome, listeners };
}
