import { makeStore } from "@/redux/store";
import { restoreSession, signedIn, signedOut } from "@/redux/slice/auth";
import { secureStorage, storage } from "@/services/storage";
import { IS_LOGGED_IN, REFRESH_TOKEN_KEY, TOKEN_KEY } from "@/utils/constants";

/**
 * These guard the exact defect this starter used to ship with: the login flag
 * was written to storage but never read back, so every cold start silently
 * signed the user out, and the auth token was never persisted at all.
 */
describe("auth session persistence", () => {
  beforeEach(() => {
    storage.clearAll();
    secureStorage.remove(TOKEN_KEY);
    secureStorage.remove(REFRESH_TOKEN_KEY);
  });

  it("starts signed out on a clean install", () => {
    expect(restoreSession()).toEqual({
      isLoggedIn: false,
      token: null,
      refreshToken: null,
      role: "user",
    });
  });

  it("persists the token and flag when signing in", () => {
    const store = makeStore();
    store.dispatch(signedIn({ token: "access-1", refreshToken: "refresh-1" }));

    expect(store.getState().auth.isLoggedIn).toBe(true);
    expect(secureStorage.get(TOKEN_KEY)).toBe("access-1");
    expect(secureStorage.get(REFRESH_TOKEN_KEY)).toBe("refresh-1");
    expect(storage.getBoolean(IS_LOGGED_IN)).toBe(true);
  });

  it("restores the session on the next cold start", () => {
    makeStore().dispatch(signedIn({ token: "access-1" }));

    // A fresh store models relaunching the app.
    const relaunched = makeStore();
    expect(relaunched.getState().auth.isLoggedIn).toBe(true);
    expect(relaunched.getState().auth.token).toBe("access-1");
  });

  it("clears credentials when signing out", () => {
    const store = makeStore();
    store.dispatch(signedIn({ token: "access-1", refreshToken: "refresh-1" }));
    store.dispatch(signedOut());

    expect(store.getState().auth.isLoggedIn).toBe(false);
    expect(secureStorage.get(TOKEN_KEY)).toBeNull();
    expect(secureStorage.get(REFRESH_TOKEN_KEY)).toBeNull();
    expect(makeStore().getState().auth.isLoggedIn).toBe(false);
  });

  it("stays signed out when the flag survives but the credential does not", () => {
    // e.g. the OS keychain was cleared, or the app was reinstalled on Android
    // where MMKV data can be restored from backup but the keystore cannot.
    storage.set(IS_LOGGED_IN, true);

    expect(restoreSession().isLoggedIn).toBe(false);
  });
});
