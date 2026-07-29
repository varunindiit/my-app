import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { secureStorage, storage } from "@/services/storage";
import { IS_LOGGED_IN, REFRESH_TOKEN_KEY, TOKEN_KEY } from "@/utils/constants";

/** Replace with the roles your API actually returns. */
export type UserRole = "user" | "admin";

export interface Credentials {
  token: string;
  refreshToken?: string | null;
  role?: UserRole;
}

export interface AuthState {
  isLoggedIn: boolean;
  token: string | null;
  refreshToken: string | null;
  role: UserRole;
}

/**
 * Rebuild the session from disk at cold start.
 *
 * Both halves must be present: the flag alone would let a cleared keychain
 * (OS wipe, app reinstall on Android, user revoking credentials) leave the app
 * showing an authenticated shell with no way to call the API. Requiring the
 * token means the worst case is a login prompt, never a broken session.
 *
 * Reads are synchronous (MMKV + SecureStore's sync API), so the first render
 * already has the right answer and there is no auth flash.
 */
export const restoreSession = (): AuthState => {
  const token = secureStorage.get(TOKEN_KEY);
  const flagged = storage.getBoolean(IS_LOGGED_IN) ?? false;
  const isLoggedIn = Boolean(token) && flagged;

  return {
    isLoggedIn,
    token: isLoggedIn ? token : null,
    refreshToken: isLoggedIn ? secureStorage.get(REFRESH_TOKEN_KEY) : null,
    role: "user",
  };
};

const authSlice = createSlice({
  name: "auth",
  initialState: restoreSession,
  reducers: {
    /**
     * Sign in. Persistence is handled by the auth listener in
     * `@/redux/listeners` so it happens no matter which screen dispatches this.
     */
    signedIn: (state, action: PayloadAction<Credentials>) => {
      state.isLoggedIn = true;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken ?? null;
      if (action.payload.role) state.role = action.payload.role;
    },

    /** Sign out. Also dispatched automatically when the API returns 401. */
    signedOut: (state) => {
      state.isLoggedIn = false;
      state.token = null;
      state.refreshToken = null;
      state.role = "user";
    },

    /** Rotate the access token after a successful refresh. */
    tokenRefreshed: (
      state,
      action: PayloadAction<{ token: string; refreshToken?: string | null }>,
    ) => {
      state.token = action.payload.token;
      if (action.payload.refreshToken !== undefined) {
        state.refreshToken = action.payload.refreshToken;
      }
    },

    setRole: (state, action: PayloadAction<UserRole>) => {
      state.role = action.payload;
    },
  },
});

export const { signedIn, signedOut, tokenRefreshed, setRole } = authSlice.actions;
export default authSlice.reducer;
