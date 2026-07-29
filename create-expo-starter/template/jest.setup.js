/**
 * Global test setup.
 *
 * Native modules have no JS implementation under Jest, so anything backed by
 * native code has to be faked here. Each mock below is a real in-memory
 * implementation rather than `jest.fn()` stubs, so tests can assert on
 * behaviour (write then read) instead of on call counts.
 */

// ── react-native-mmkv ───────────────────────────────────────────────────────
jest.mock("react-native-mmkv", () => {
  const store = new Map();
  const instance = {
    set: (k, v) => store.set(k, v),
    getString: (k) => (typeof store.get(k) === "string" ? store.get(k) : undefined),
    getBoolean: (k) =>
      typeof store.get(k) === "boolean" ? store.get(k) : undefined,
    getNumber: (k) => (typeof store.get(k) === "number" ? store.get(k) : undefined),
    remove: (k) => store.delete(k),
    delete: (k) => store.delete(k),
    clearAll: () => store.clear(),
    getAllKeys: () => Array.from(store.keys()),
    contains: (k) => store.has(k),
  };
  return {
    createMMKV: () => instance,
    MMKV: function MMKV() {
      return instance;
    },
    __store: store,
  };
});

// ── expo-secure-store ───────────────────────────────────────────────────────
jest.mock("expo-secure-store", () => {
  const store = new Map();
  return {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, v),
    getItemAsync: async (k) => (store.has(k) ? store.get(k) : null),
    setItemAsync: async (k, v) => store.set(k, v),
    deleteItemAsync: async (k) => store.delete(k),
    __store: store,
  };
});

// ── expo-constants ──────────────────────────────────────────────────────────
jest.mock("expo-constants", () => ({
  __esModule: true,
  default: { expoConfig: { extra: {} } },
}));

// ── reanimated / worklets ───────────────────────────────────────────────────
// Reanimated 4's own `mock` entry still imports the real module, which boots
// react-native-worklets and throws under Jest. See __mocks__/reanimatedMock.js.
jest.mock("react-native-reanimated", () =>
  require("./__mocks__/reanimatedMock"),
);

jest.mock("react-native-worklets", () => ({
  createRunOnJS: (fn) => fn,
  runOnJS: (fn) => fn,
  runOnUI: (fn) => fn,
  scheduleOnRN: (fn, ...args) => fn(...args),
}));

// react-native-reanimated-modal renders through reanimated; a passthrough keeps
// sheets mountable in tests.
jest.mock("react-native-reanimated-modal", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    __esModule: true,
    Modal: ({ visible, children, ...rest }) =>
      visible ? React.createElement(View, rest, children) : null,
  };
});

// ── keyboard-controller ─────────────────────────────────────────────────────
jest.mock("react-native-keyboard-controller", () =>
  require("react-native-keyboard-controller/jest"),
);
