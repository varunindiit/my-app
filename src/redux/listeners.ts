import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import { secureStorage, storage } from "@/services/storage";
import { IS_LOGGED_IN, REFRESH_TOKEN_KEY, TOKEN_KEY } from "@/utils/constants";
import { signedIn, signedOut, tokenRefreshed } from "./slice/auth";

/**
 * Side effects that must happen whenever auth state changes, wherever it is
 * changed from.
 *
 * Persistence lives here rather than in the screens that dispatch, because a
 * reducer is pure and a screen is easy to forget. Any future code path that
 * dispatches `signedOut` — a 401 interceptor, a "delete account" flow, a deep
 * link — gets correct cleanup for free.
 */
export const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening({
  matcher: isAnyOf(signedIn, tokenRefreshed),
  effect: (_action, api) => {
    const { token, refreshToken } = (api.getState() as { auth: { token: string | null; refreshToken: string | null } }).auth;

    if (token) {
      secureStorage.set(TOKEN_KEY, token);
      storage.set(IS_LOGGED_IN, true);
    }
    if (refreshToken) {
      secureStorage.set(REFRESH_TOKEN_KEY, refreshToken);
    } else {
      secureStorage.remove(REFRESH_TOKEN_KEY);
    }
  },
});

listenerMiddleware.startListening({
  actionCreator: signedOut,
  effect: () => {
    secureStorage.remove(TOKEN_KEY);
    secureStorage.remove(REFRESH_TOKEN_KEY);
    storage.set(IS_LOGGED_IN, false);
  },
});
