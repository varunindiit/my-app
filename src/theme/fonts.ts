import { Platform } from "react-native";

/**
 * Font system — Mona Sans family.
 *
 * In Expo, fonts are registered at runtime via `expo-font` (see App.tsx) rather
 * than the native asset-linking used by bare React Native. `FONT_ASSETS` is the
 * map passed to `useFonts`; the keys become the `fontFamily` names referenced
 * through `FONTS`.
 */
export const FONTS = {
  light: "MonaSans-Light",
  regular: "MonaSans-Regular",
  italic: "MonaSans-Italic",
  medium: "MonaSans-Medium",
  semibold: "MonaSans-SemiBold",
  bold: "MonaSans-Bold",
  extraBold: "MonaSans-ExtraBold",
  black: "MonaSans-Black",
};

/** Asset map consumed by `useFonts(FONT_ASSETS)` in App.tsx. */
export const FONT_ASSETS = {
  "MonaSans-Light": require("../assets/fonts/MonaSans-Light.ttf"),
  "MonaSans-Regular": require("../assets/fonts/MonaSans-Regular.ttf"),
  "MonaSans-Italic": require("../assets/fonts/MonaSans-Italic.ttf"),
  "MonaSans-Medium": require("../assets/fonts/MonaSans-Medium.ttf"),
  "MonaSans-SemiBold": require("../assets/fonts/MonaSans-SemiBold.ttf"),
  "MonaSans-Bold": require("../assets/fonts/MonaSans-Bold.ttf"),
  "MonaSans-ExtraBold": require("../assets/fonts/MonaSans-ExtraBold.ttf"),
  "MonaSans-Black": require("../assets/fonts/MonaSans-Black.ttf"),
};

export const FONT_WEIGHTS = {
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
  extraBold: "800" as const,
};

// Fallback in case a font name fails to resolve at runtime.
export const SYSTEM_FALLBACK = Platform.select({
  ios: "System",
  android: "Roboto",
}) as string;
