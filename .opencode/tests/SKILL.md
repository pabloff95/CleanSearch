# Skill: Write Jest Tests for CleanSearch

Use this skill when adding or modifying unit tests in the CleanSearch Chrome extension repo.

## Stack constraints

- Jest runs in **native ESM mode** (no Babel). The `package.json` at repo root sets `"type": "module"` and the test script is `node --experimental-vm-modules node_modules/jest/bin/jest.js`.
- `jest.config.js` picks up `testMatch: ["**/test/**/*.test.js"]` and sets `transform: {}` (no transform).
- Run the suite with `npm test` from the repo root.

## File layout

```
test/
├── mocks/
│   └── chrome.js          # createChromeMock() factory — shared by all suites
├── regex.test.js          # constants.js patterns
├── utils.test.js          # utils.js (applyState, getIsExtensionActive)
└── main.test.js           # main.js event-listener wiring
```

New test files go directly under `test/` and must end in `.test.js`.

## Rules

1. **Import `jest` from `@jest/globals` in any non-test helper module.** ESM helper modules (like `mocks/chrome.js`) do not receive Jest's injected globals — only `*.test.js` files do. Without this import, `jest.fn()` throws `ReferenceError: jest is not defined`.

   ```js
   import { jest } from "@jest/globals";
   ```

2. **Test files get globals for free.** In `*.test.js` files, `describe`, `it`, `test`, `expect`, `beforeEach`, `beforeAll` are available as globals — no import needed.

3. **Mock the `chrome` global per test.** Call `createChromeMock()` in `beforeEach`, assign `global.chrome = mock.chrome`, and keep a local reference for assertions.

   ```js
   let chrome;

   beforeEach(() => {
     const mock = createChromeMock();
     global.chrome = mock.chrome;
     chrome = mock.chrome;
   });
   ```

4. **Inspect mock calls via `chrome.<api>.mock.calls`.** Example:

   ```js
   const { addRules } =
     chrome.declarativeNetRequest.updateDynamicRules.mock.calls[0][0];
   expect(addRules).toHaveLength(2);
   ```

5. **For `main.js` tests, import once in `beforeAll`.** `main.js` registers Chrome listeners at module top level, so it must be imported after `global.chrome` is set. Capture the listener callbacks from `mock.listeners` and invoke them with a fresh mock per test.

   ```js
   let listeners;

   beforeAll(async () => {
     const mock = createChromeMock();
     global.chrome = mock.chrome;
     listeners = mock.listeners;
     await import("../extension/main.js");
   });
   ```

6. **Use `test.each` for parameterized cases** (e.g. regex match/no-match over many URLs).

   ```js
   test.each([
     "https://www.google.com/search?q=cats",
     "https://google.com/search?q=cats",
   ])("matches %s", (url) => {
     expect(re.test(url)).toBe(true);
   });
   ```

7. **Import source modules with relative paths from `test/`.**

   ```js
   import { applyState, getIsExtensionActive } from "../extension/utils.js";
   import { GOOGLE_REGEX } from "../extension/constants.js";
   ```

8. **Keep async handlers async.** Event callbacks and `applyState` return promises — always `await` them in tests.

## What to test

Each piece of business logic should have a corresponding test suite. This must include all the edge cases that can be found in the targeted code.

## Verification

After writing or changing tests, run:

```bash
npm test
```

All suites must pass with exit code 0 before considering the work done.
