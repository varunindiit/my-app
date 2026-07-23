// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    // The CLI package is plain Node CommonJS with its own `npm run lint`
    // (node --check); the template mirror is generated from this repo.
    ignores: ["dist/*", "create-expo-starter/**"],
  },
  {
    rules: {
      // `axios.create()` / `i18n.use()` on default exports are idiomatic;
      // this rule only produces noise here.
      "import/no-named-as-default-member": "off",
    },
  },
]);
