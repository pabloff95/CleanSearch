import { jest } from "@jest/globals";

type Listener = (...args: any[]) => any;

export interface MockListeners {
  onInstalled: Listener[];
  onStartup: Listener[];
  onClicked: Listener[];
}

export interface ChromeMock {
  declarativeNetRequest: {
    updateDynamicRules: jest.Mock;
    getDynamicRules: jest.Mock;
  };
  storage: {
    local: {
      get: jest.Mock;
      set: jest.Mock;
    };
  };
  action: {
    setBadgeText: jest.Mock;
    setBadgeBackgroundColor: jest.Mock;
    setIcon: jest.Mock;
    onClicked: {
      addListener: jest.Mock;
    };
  };
  runtime: {
    onInstalled: {
      addListener: jest.Mock;
    };
    onStartup: {
      addListener: jest.Mock;
    };
  };
}

export function createChromeMock(): { chrome: ChromeMock; listeners: MockListeners } {
  const listeners: MockListeners = {
    onInstalled: [],
    onStartup: [],
    onClicked: [],
  };

  const chrome: ChromeMock = {
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
        addListener: jest.fn((fn: Listener) => listeners.onClicked.push(fn)),
      },
    },
    runtime: {
      onInstalled: {
        addListener: jest.fn((fn: Listener) => listeners.onInstalled.push(fn)),
      },
      onStartup: {
        addListener: jest.fn((fn: Listener) => listeners.onStartup.push(fn)),
      },
    },
  };

  return { chrome, listeners };
}
