// Dynamic Expo config — extends app.json and injects environment values.
// https://docs.expo.dev/versions/v56.0.0/config/app/
//
// Static identity (name, slug, scheme, icons, plugins) lives in app.json and is
// passed in here as `config`. Anything environment-driven is layered on top.
//
// Two layers of configuration (see .env.example):
//   1. EXPO_PUBLIC_* vars are inlined into the JS bundle automatically by Expo
//      and read directly via process.env in app code. Use for client-safe
//      values (public API base URL, publishable keys).
//   2. Values placed on `extra` below are embedded at build time and read via
//      expo-constants (see src/services/Config.ts). Inject real secrets through
//      EAS env/secrets in CI rather than committing them.

const APP_ENV = process.env.APP_ENV ?? "development";

module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...(config.extra ?? {}),
    appEnv: APP_ENV,
    apiUrl:
      process.env.API_URL ?? config.extra?.apiUrl ?? "http://13.134.217.35/api/v1",
    googleMapsApiKey:
      process.env.GOOGLE_MAPS_API_KEY ?? config.extra?.googleMapsApiKey ?? "",
    eas: {
      ...(config.extra?.eas ?? {}),
      projectId: process.env.EAS_PROJECT_ID ?? config.extra?.eas?.projectId,
    },
  },
});
