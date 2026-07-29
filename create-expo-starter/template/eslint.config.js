// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    // The CLI package is plain Node CommonJS with its own `npm run lint`
    // (node --check); the template mirror is generated from this repo.
    ignores: [
      "dist/*",
      "coverage/*",
      "example/*",
      "__mocks__/*",
    ],
  },
  {
    rules: {
      // `axios.create()` / `i18n.use()` on default exports are idiomatic;
      // this rule only produces noise here.
      "import/no-named-as-default-member": "off",

      // Deep relative imports are the thing the `@/*` alias exists to prevent.
      // Anything that needs to climb two levels has left its own module and
      // should say so explicitly.
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../../*"],
              message:
                "Use the '@/' alias for cross-module imports (e.g. '@/services/api').",
            },
            {
              group: ["@/theme/palette"],
              importNames: ["light", "dark"],
              message:
                "Import colours through useTheme()/useThemeColors() so they follow the active scheme.",
            },
          ],
        },
      ],
    },
  },
  {
    // Tests reach across modules by design and run outside the React tree.
    files: ["**/__tests__/**", "**/*.test.{ts,tsx}", "jest.setup.js"],
    languageOptions: {
      globals: {
        jest: "readonly",
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
      },
    },
    rules: {
      "no-restricted-imports": "off",
    },
  },
]);
