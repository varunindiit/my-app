import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// Imported through the barrel, not the individual modules: with the i18n
// feature disabled the whole folder is replaced by a single stub `index.ts`,
// and deep imports would dangle.
import {
  getStoredLanguage,
  hasSelectedLanguage,
  type LanguageCode,
} from "@/localization";

/**
 * App-wide client state that isn't auth and isn't server data:
 * onboarding progress, notification preferences, connectivity, language.
 */
export interface NotificationPreferences {
  push: boolean;
  email: boolean;
  sms: boolean;
}

interface AppState {
  notificationsEnabled: NotificationPreferences;
  unreadNotificationCount: number;
  hasCompletedOnboarding: boolean;
  isOffline: boolean;
  language: LanguageCode;
  languageSelected: boolean;
}

const initialState: AppState = {
  notificationsEnabled: { push: true, email: true, sms: false },
  unreadNotificationCount: 0,
  hasCompletedOnboarding: false,
  isOffline: false,
  language: getStoredLanguage(),
  languageSelected: hasSelectedLanguage(),
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setNotificationPref: (
      state,
      action: PayloadAction<Partial<NotificationPreferences>>,
    ) => {
      state.notificationsEnabled = {
        ...state.notificationsEnabled,
        ...action.payload,
      };
    },
    setUnreadNotificationCount: (state, action: PayloadAction<number>) => {
      state.unreadNotificationCount = Math.max(0, action.payload);
    },
    setHasCompletedOnboarding: (state, action: PayloadAction<boolean>) => {
      state.hasCompletedOnboarding = action.payload;
    },
    setIsOffline: (state, action: PayloadAction<boolean>) => {
      state.isOffline = action.payload;
    },
    setLanguage: (
      state,
      action: PayloadAction<{ code: LanguageCode; selected?: boolean }>,
    ) => {
      state.language = action.payload.code;
      if (action.payload.selected) state.languageSelected = true;
    },
    resetAppState: (state) => ({
      ...initialState,
      // Preserve language choice across logout/reset — re-asking someone to
      // pick their language every time they sign out is hostile.
      language: state.language,
      languageSelected: state.languageSelected,
    }),
  },
});

export const {
  setNotificationPref,
  setUnreadNotificationCount,
  setHasCompletedOnboarding,
  setIsOffline,
  setLanguage,
  resetAppState,
} = appSlice.actions;
export default appSlice.reducer;
