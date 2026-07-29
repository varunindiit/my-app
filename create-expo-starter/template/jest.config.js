/**
 * Jest configuration.
 *
 * `jest-expo` supplies the React Native preset (Metro-style module resolution,
 * the RN transformer, and the standard Expo module mocks). Everything below is
 * the delta this project needs on top of it.
 */
module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

  // Only the app's own source. Without this the repo's generated template copy
  // is discovered too and every suite runs twice against duplicate modules. In
  // a scaffolded project there is no second copy, so this is simply correct.
  roots: ["<rootDir>/src"],

  // node_modules ships untranspiled ESM/Flow in the RN ecosystem, so the
  // default "don't transform node_modules" rule has to be inverted for them.
  // `immer` (a Redux Toolkit dependency) is listed explicitly: it publishes an
  // ESM build that Node cannot parse without transformation.
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|react-native-mmkv|react-native-size-matters|react-native-keyboard-controller|react-native-flash-message|react-native-reanimated-modal|immer|redux|@reduxjs/toolkit|react-redux)",
  ],

  // Mirrors the `@/*` alias from tsconfig.json so tests import the same way
  // application code does.
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.svg$": "<rootDir>/__mocks__/svgMock.js",
  },

  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/app/**", // routes are covered by integration tests, not units
    "!src/assets/**",
  ],

  testMatch: ["**/__tests__/**/*.test.{ts,tsx}"],
};
