/** Persistence keys (MMKV — non-sensitive preferences). */
export const IS_LOGGED_IN = "isLoggedIn";
export const LANGUAGE_KEY = "appLanguage";
export const LANGUAGE_SELECTED_KEY = "languageSelected";
export const THEME_PREFERENCE_KEY = "themePreference";

/**
 * Credential keys (SecureStore on native — Keychain / EncryptedSharedPreferences).
 * Never store these through the plain `storage` helper: MMKV is unencrypted by
 * default, so anyone with filesystem access to a rooted/jailbroken device or a
 * device backup can read it.
 */
export const TOKEN_KEY = "authToken";
export const REFRESH_TOKEN_KEY = "refreshToken";
