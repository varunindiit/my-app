import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import Config from "./Config";
import { secureStorage } from "./storage";
import { captureError } from "./monitoring";
import { REFRESH_TOKEN_KEY, TOKEN_KEY } from "@/utils/constants";

// ── error model ─────────────────────────────────────────────────────────────

export type ApiErrorKind =
  | "network" // request never reached the server
  | "timeout"
  | "unauthorized" // 401 after refresh failed
  | "forbidden" // 403
  | "notFound" // 404
  | "validation" // 422 / 400 with field errors
  | "server" // 5xx
  | "canceled"
  | "unknown";

/**
 * Every rejection from this client is an `ApiError`.
 *
 * Callers get a stable, typed shape instead of a raw `AxiosError` whose useful
 * information is scattered across `error.response.data`, `error.code` and
 * `error.message`. Screens can branch on `kind`; forms can read `fieldErrors`.
 */
export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;
  readonly data?: unknown;
  readonly fieldErrors?: Record<string, string[]>;
  readonly cause?: unknown;

  constructor(init: {
    message: string;
    kind: ApiErrorKind;
    status?: number;
    data?: unknown;
    fieldErrors?: Record<string, string[]>;
    cause?: unknown;
  }) {
    super(init.message);
    this.name = "ApiError";
    this.kind = init.kind;
    this.status = init.status;
    this.data = init.data;
    this.fieldErrors = init.fieldErrors;
    this.cause = init.cause;
  }

  /** True for errors where retrying the same request could plausibly succeed. */
  get isRetryable(): boolean {
    return this.kind === "network" || this.kind === "timeout" || this.kind === "server";
  }
}

const kindFromStatus = (status?: number): ApiErrorKind => {
  if (!status) return "unknown";
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "notFound";
  if (status === 400 || status === 422) return "validation";
  if (status >= 500) return "server";
  return "unknown";
};

/** Pull a human message out of the many shapes APIs use. */
const messageFromPayload = (data: unknown, fallback: string): string => {
  if (typeof data === "string" && data.trim()) return data;
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    for (const key of ["message", "error", "detail", "title"]) {
      const v = d[key];
      if (typeof v === "string" && v.trim()) return v;
    }
  }
  return fallback;
};

/** Normalise `{ errors: { email: ["taken"] } }`-style validation payloads. */
const fieldErrorsFromPayload = (
  data: unknown,
): Record<string, string[]> | undefined => {
  if (!data || typeof data !== "object") return undefined;
  const raw = (data as Record<string, unknown>).errors;
  if (!raw || typeof raw !== "object") return undefined;

  const out: Record<string, string[]> = {};
  for (const [field, value] of Object.entries(raw as Record<string, unknown>)) {
    if (Array.isArray(value)) out[field] = value.map(String);
    else if (typeof value === "string") out[field] = [value];
  }
  return Object.keys(out).length ? out : undefined;
};

export const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;

  if (axios.isCancel(error)) {
    return new ApiError({ message: "Request canceled", kind: "canceled", cause: error });
  }

  if (axios.isAxiosError(error)) {
    const err = error as AxiosError;

    if (err.code === "ECONNABORTED" || err.code === "ETIMEDOUT") {
      return new ApiError({
        message: "The request timed out. Check your connection and try again.",
        kind: "timeout",
        cause: err,
      });
    }

    if (!err.response) {
      return new ApiError({
        message: "Can't reach the server. Check your connection and try again.",
        kind: "network",
        cause: err,
      });
    }

    const { status, data } = err.response;
    return new ApiError({
      message: messageFromPayload(data, err.message || "Request failed"),
      kind: kindFromStatus(status),
      status,
      data,
      fieldErrors: fieldErrorsFromPayload(data),
      cause: err,
    });
  }

  return new ApiError({
    message: error instanceof Error ? error.message : String(error),
    kind: "unknown",
    cause: error,
  });
};

// ── session bridge ──────────────────────────────────────────────────────────
// The client must be able to end the session, but importing the Redux store
// here would create a cycle (store -> apiSlice -> api -> store). The store
// registers a callback instead; see src/redux/store.ts.

type UnauthorizedHandler = () => void;
let onUnauthorized: UnauthorizedHandler | null = null;

export const setUnauthorizedHandler = (handler: UnauthorizedHandler | null) => {
  onUnauthorized = handler;
};

// ── instance ────────────────────────────────────────────────────────────────

const api: AxiosInstance = axios.create({
  baseURL: Config.coreAPI,
  timeout: Config.requestTimeoutMs,
  headers: { Accept: "application/json" },
});

api.interceptors.request.use((config) => {
  const token = secureStorage.get(TOKEN_KEY);
  if (token) config.headers.set("Authorization", `Bearer ${token}`);
  return config;
});

// ── refresh-token flow ──────────────────────────────────────────────────────

/** Requests that 401'd while a refresh was already in flight wait on this. */
let refreshPromise: Promise<string | null> | null = null;

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

/**
 * Exchange the refresh token for a new access token.
 *
 * Uses a bare axios call so it cannot recurse through this instance's
 * interceptors. Adjust the endpoint and payload to match your API.
 */
const requestNewToken = async (): Promise<string | null> => {
  const refreshToken = secureStorage.get(REFRESH_TOKEN_KEY);
  if (!refreshToken) return null;

  try {
    const { data } = await axios.post(
      `${Config.coreAPI}${Config.refreshTokenPath}`,
      { refreshToken },
      { timeout: Config.requestTimeoutMs, headers: { Accept: "application/json" } },
    );

    const token: string | undefined = data?.token ?? data?.accessToken;
    if (!token) return null;

    secureStorage.set(TOKEN_KEY, token);
    const nextRefresh: string | undefined = data?.refreshToken;
    if (nextRefresh) secureStorage.set(REFRESH_TOKEN_KEY, nextRefresh);

    return token;
  } catch {
    return null;
  }
};

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || !error.response) {
      return Promise.reject(toApiError(error));
    }

    const original = error.config as RetriableConfig | undefined;
    const isAuthFailure = error.response.status === 401;

    // Retry once, and never for the refresh call itself.
    const canRetry =
      isAuthFailure &&
      original &&
      !original._retried &&
      !original.url?.includes(Config.refreshTokenPath);

    if (canRetry) {
      original._retried = true;

      // Collapse concurrent 401s onto a single refresh round-trip.
      refreshPromise = refreshPromise ?? requestNewToken();
      const token = await refreshPromise.finally(() => {
        refreshPromise = null;
      });

      if (token) {
        original.headers.set("Authorization", `Bearer ${token}`);
        return api.request(original);
      }
    }

    const apiError = toApiError(error);

    if (apiError.kind === "unauthorized") {
      // Refresh is impossible or failed — the session is genuinely over.
      // Clearing storage here as well as in the Redux listener keeps the
      // client correct even if no store has registered a handler yet.
      secureStorage.remove(TOKEN_KEY);
      secureStorage.remove(REFRESH_TOKEN_KEY);
      onUnauthorized?.();
    }

    if (apiError.kind === "server" || apiError.kind === "unknown") {
      captureError(apiError, { url: original?.url, status: apiError.status });
    }

    return Promise.reject(apiError);
  },
);

/**
 * Mocked endpoint helper. While you don't yet have a backend, callers can use
 * `mocked(data, delay)` instead of `api.get/post/...` and get a Promise that
 * resolves with `{ data }` after a tiny delay. Replace with real api.* calls.
 */
export const mocked = <T>(data: T, ms = 350): Promise<{ data: T }> =>
  new Promise((resolve) => setTimeout(() => resolve({ data }), ms));

export type { AxiosRequestConfig };
export default api;
