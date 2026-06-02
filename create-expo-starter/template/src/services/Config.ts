import Constants from "expo-constants";

/**
 * Centralised, typed runtime configuration.
 *
 * Values resolve with a layered strategy (see .env.example + app.config.js):
 *   1. `EXPO_PUBLIC_*` env vars — inlined into the bundle by Expo. Best for
 *      client-safe values; read directly from `process.env`.
 *   2. `expo.extra` from app.config.js — build-time config read here via
 *      expo-constants. Inject real secrets through EAS env/secrets in CI.
 *   3. Hardcoded fallbacks so the app runs out of the box with zero setup.
 */
type Extra = {
  appEnv?: string;
  apiUrl?: string;
  googleMapsApiKey?: string;
  eas?: { projectId?: string };
};

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

class Config {
  /** Active environment: development | preview | production. */
  public readonly appEnv: string;

  /** Base URL for the REST API (axios `baseURL`). */
  public readonly coreAPI: string;

  /** Google API key — shared with the native Maps SDK (Android manifest / iOS AppDelegate). */
  public readonly googleMapsKey: string;

  constructor() {
    this.appEnv =
      process.env.EXPO_PUBLIC_APP_ENV ?? extra.appEnv ?? "development";

    this.coreAPI =
      process.env.EXPO_PUBLIC_API_URL ??
      extra.apiUrl ??
      "http://13.134.217.35/api/v1";

    this.googleMapsKey =
      process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ??
      extra.googleMapsApiKey ??
      "";
  }

  public get isProduction(): boolean {
    return this.appEnv === "production";
  }
}

export default new Config();
