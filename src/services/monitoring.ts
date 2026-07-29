import Config from "./Config";

/**
 * Crash / error reporting adapter.
 *
 * Deliberately dependency-free: every app wants reporting, but forcing one
 * vendor's native SDK on every scaffolded project is a big, opinionated
 * install that many teams immediately rip out. This module is the seam. Wire
 * your provider in `initMonitoring` and the rest of the codebase — the error
 * boundary, the axios interceptor, your own try/catch blocks — needs no
 * changes.
 *
 * Sentry, for example:
 *
 *   npx expo install @sentry/react-native
 *
 *   import * as Sentry from "@sentry/react-native";
 *
 *   export const initMonitoring = () => {
 *     if (!Config.sentryDsn) return;
 *     Sentry.init({ dsn: Config.sentryDsn, environment: Config.appEnv });
 *     transport = {
 *       captureError: (e, ctx) => Sentry.captureException(e, { extra: ctx }),
 *       captureMessage: (m, ctx) => Sentry.captureMessage(m, { extra: ctx }),
 *       setUser: (u) => Sentry.setUser(u),
 *     };
 *   };
 */

export type MonitoringContext = Record<string, unknown>;

export interface MonitoringTransport {
  captureError(error: unknown, context?: MonitoringContext): void;
  captureMessage(message: string, context?: MonitoringContext): void;
  setUser(user: { id: string; email?: string } | null): void;
}

/**
 * Default transport: log in development, stay silent in production.
 *
 * Silence matters — without a real provider configured, forwarding every
 * handled error to `console.error` in a release build just fills the device
 * log and can leak request payloads.
 */
const consoleTransport: MonitoringTransport = {
  captureError(error, context) {
    if (!Config.isProduction) {
      console.error("[monitoring]", error, context ?? "");
    }
  },
  captureMessage(message, context) {
    if (!Config.isProduction) {
      console.warn("[monitoring]", message, context ?? "");
    }
  },
  setUser() {},
};

let transport: MonitoringTransport = consoleTransport;

/** Swap in a real provider. Call from `initMonitoring`, or from tests. */
export const setMonitoringTransport = (next: MonitoringTransport | null) => {
  transport = next ?? consoleTransport;
};

/** Called once from the root layout. Safe to call when nothing is configured. */
export const initMonitoring = () => {
  // Intentionally empty by default — see the module comment for wiring.
};

export const captureError = (error: unknown, context?: MonitoringContext) =>
  transport.captureError(error, context);

export const captureMessage = (message: string, context?: MonitoringContext) =>
  transport.captureMessage(message, context);

/** Associate subsequent reports with a user. Pass `null` on sign-out. */
export const setMonitoringUser = (user: { id: string; email?: string } | null) =>
  transport.setUser(user);
