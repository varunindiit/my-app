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
 *
 * Do not collapse these `??` chains to their fallback values: Expo inlines
 * `process.env.EXPO_PUBLIC_*` at build time by static substitution, so the
 * expressions must remain literally present in the source.
 *
 * SECURITY: layers 1 and 2 both end up inside the JavaScript bundle that ships
 * to devices. Neither is a secret store. Anything here can be extracted from a
 * shipped build in minutes — API keys that can be billed or that grant write
 * access belong on a server you control, behind an endpoint this app calls.
 */
type Extra = {
  appEnv?: string;
  apiUrl?: string;
  placesProxyPath?: string;
  googleMapsApiKey?: string;
  sentryDsn?: string;
  eas?: { projectId?: string };
};

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

const bool = (value: string | undefined, fallback = false): boolean => {
  if (value === undefined) return fallback;
  return value === "1" || value.toLowerCase() === "true";
};

const int = (value: string | undefined, fallback: number): number => {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const trimTrailingSlashes = (value: string): string => value.replace(/\/+$/, "");

class Config {
  /** Active environment: development | preview | production. */
  public readonly appEnv: string;

  /** Base URL for the REST API (axios `baseURL`). */
  public readonly coreAPI: string;

  /** Path appended to `coreAPI` to exchange a refresh token. */
  public readonly refreshTokenPath: string;

  /** Default axios timeout in milliseconds. */
  public readonly requestTimeoutMs: number;

  /**
   * Path on YOUR backend that proxies Google Places/Geocoding.
   * See src/services/places.ts and docs/google-places-proxy.md.
   */
  public readonly placesProxyPath: string;

  /**
   * Opt-in escape hatch that calls Google directly from the device using
   * `googleMapsKey`. Off by default because a client-side key for the Places
   * and Geocoding *web services* cannot be restricted to your app — only by
   * IP — so it is extractable and billable by anyone. Use for local
   * prototyping, never for a shipped build.
   */
  public readonly placesDirectMode: boolean;

  /**
   * Google API key. Only read when `placesDirectMode` is on. Restrict it in
   * Google Cloud and keep a low quota cap even in development.
   */
  public readonly googleMapsKey: string;

  /** Crash-reporting DSN. Empty disables reporting (see ./monitoring). */
  public readonly sentryDsn: string;

  constructor() {
    this.appEnv =
      process.env.EXPO_PUBLIC_APP_ENV ?? extra.appEnv ?? "development";

    this.coreAPI = trimTrailingSlashes(
      process.env.EXPO_PUBLIC_API_URL ?? extra.apiUrl ?? "https://api.example.com",
    );

    this.refreshTokenPath =
      process.env.EXPO_PUBLIC_REFRESH_PATH ?? "/auth/refresh";

    this.requestTimeoutMs = int(
      process.env.EXPO_PUBLIC_REQUEST_TIMEOUT_MS,
      20000,
    );

    this.placesProxyPath =
      process.env.EXPO_PUBLIC_PLACES_PROXY_PATH ??
      extra.placesProxyPath ??
      "/places";

    this.placesDirectMode = bool(
      process.env.EXPO_PUBLIC_PLACES_DIRECT_MODE,
      false,
    );

    this.googleMapsKey =
      process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ??
      extra.googleMapsApiKey ??
      "";

    this.sentryDsn = process.env.EXPO_PUBLIC_SENTRY_DSN ?? extra.sentryDsn ?? "";
  }

  public get isProduction(): boolean {
    return this.appEnv === "production";
  }

  public get isDevelopment(): boolean {
    return this.appEnv === "development";
  }
}

export default new Config();
