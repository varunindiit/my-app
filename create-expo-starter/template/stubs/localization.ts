/**
 * Localisation stub — scaffolded in place of `src/localization/` when the i18n
 * feature is turned off.
 *
 * It keeps the exact surface the rest of the app imports (`useLanguage`,
 * `getStoredLanguage`, `hasSelectedLanguage`, `LanguageCode`) so no call site
 * needs conditional code, but carries no i18next dependency: `t()` is a lookup
 * into the English strings below with `{{placeholder}}` interpolation.
 *
 * To add real translations later:
 *   npx expo install i18next react-i18next
 * then restore src/localization/ from the starter repo, or scaffold a new
 * project with the i18n feature enabled and copy the folder across.
 */

export type LanguageCode = "en";

export interface LanguageOption {
  code: LanguageCode;
  nativeLabel: string;
  englishLabel: string;
  region: string;
  flag: string;
}

export const DEFAULT_LANGUAGE: LanguageCode = "en";

export const LANGUAGES: LanguageOption[] = [
  {
    code: "en",
    nativeLabel: "English",
    englishLabel: "English",
    region: "English",
    flag: "🇬🇧",
  },
];

export const SUPPORTED_CODES: LanguageCode[] = ["en"];

export const isSupportedLanguage = (code?: string | null): code is LanguageCode =>
  code === "en";

export const getLanguageOption = (_code?: LanguageCode): LanguageOption =>
  LANGUAGES[0];

export const getStoredLanguage = (): LanguageCode => DEFAULT_LANGUAGE;
export const setStoredLanguage = (_code: LanguageCode): void => {};
export const hasSelectedLanguage = (): boolean => true;
export const markLanguageSelected = (): void => {};
export const getDeviceLanguage = (): LanguageCode => DEFAULT_LANGUAGE;

const STRINGS: Record<string, string> = {
  "common.cancel": "Cancel",
  "common.confirm": "Confirm",
  "common.retry": "Retry",
  "common.close": "Close",
  "common.today": "Today",
  "common.tomorrow": "Tomorrow",
  "common.selectDate": "Select date",
  "common.loading": "Loading…",
  "common.somethingWrong": "Something went wrong. Please try again.",
  "common.uploadImage": "Upload image",
  "common.uploadFormatsHint": "Supports JPG, PNG and PDF",

  "imagePicker.title": "Add photo",
  "imagePicker.updatePhoto": "Update photo",
  "imagePicker.subtitle": "Choose how you'd like to set your picture",
  "imagePicker.openCamera": "Open camera",
  "imagePicker.openCameraCaption": "Take a new photo",
  "imagePicker.chooseFromGallery": "Choose from gallery",
  "imagePicker.galleryCaption": "Pick from your library",
  "imagePicker.removePhoto": "Remove photo",
  "imagePicker.permissionDenied":
    "Permission denied. Enable access in Settings.",
};

type Interpolations = Record<string, string | number>;

/**
 * Look up a key, falling back to the key itself so a missing string is visible
 * during development rather than rendering as an empty element.
 */
export const t = (key: string, options?: Interpolations): string => {
  const template = STRINGS[key] ?? key;
  if (!options) return template;

  return template.replace(/\{\{(\w+)\}\}/g, (match, name: string) =>
    options[name] === undefined ? match : String(options[name]),
  );
};

export const useLanguage = () => ({
  t,
  current: DEFAULT_LANGUAGE,
  currentOption: LANGUAGES[0],
  languages: LANGUAGES,
  changeLanguage: (_code: LanguageCode) => {},
});

export default useLanguage;
