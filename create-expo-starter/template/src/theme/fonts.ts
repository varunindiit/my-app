/**
 * Font system — Mona Sans family (SIL OFL 1.1, see src/assets/fonts/OFL.txt).
 *
 * In Expo, fonts are registered at runtime via `expo-font` (see app/_layout.tsx)
 * rather than the native asset-linking used by bare React Native. `FONT_ASSETS`
 * is the map passed to `useFonts`; the keys become the `fontFamily` names
 * referenced through `FONTS`.
 *
 * Only four weights ship by default. Every weight is ~100 KB that must be
 * downloaded, bundled and parsed before the first frame renders, so the set is
 * deliberately small. To add another weight (Light, Italic, ExtraBold, Black …):
 *
 *   1. Drop the .ttf into src/assets/fonts/
 *   2. Add it to FONTS and FONT_ASSETS below
 *   3. Add the key to `FontKey` in src/components/Text/RNText.tsx
 */
export const FONTS = {
  regular: "MonaSans-Regular",
  medium: "MonaSans-Medium",
  semibold: "MonaSans-SemiBold",
  bold: "MonaSans-Bold",
} as const;

/** Weight names available to `<RNText font="…">`. */
export type FontWeight = keyof typeof FONTS;

/** Asset map consumed by `useFonts(FONT_ASSETS)` in app/_layout.tsx. */
export const FONT_ASSETS = {
  "MonaSans-Regular": require("@/assets/fonts/MonaSans-Regular.ttf"),
  "MonaSans-Medium": require("@/assets/fonts/MonaSans-Medium.ttf"),
  "MonaSans-SemiBold": require("@/assets/fonts/MonaSans-SemiBold.ttf"),
  "MonaSans-Bold": require("@/assets/fonts/MonaSans-Bold.ttf"),
};
