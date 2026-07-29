/**
 * Colour palettes.
 *
 * `light` and `dark` are structurally identical — the `ThemeColors` type is
 * derived from `light`, so TypeScript fails the build if a token is added to
 * one palette and forgotten in the other. That invariant is what makes dark
 * mode safe to maintain: you cannot half-implement it.
 *
 * Components should never import these directly. Use `useThemeColors()` (or
 * the `makeStyles` helper) from `@/theme/useTheme` so colours follow the
 * device appearance and any in-app override.
 */

export const light = {
  // Brand
  primary: "rgba(232, 124, 62, 1)",
  primaryDark: "rgba(196, 82, 26, 1)",
  primaryLight: "#FCE4D2",
  primaryFaint: "#FFF3EA",

  // Backgrounds
  background: "#FBE9D6",
  backgroundAlt: "#FFF6EC",
  surface: "rgba(255, 251, 249, 1)",
  surfaceMuted: "#FAF7F4",
  overlay: "rgba(0,0,0,0.45)",

  // Text
  text: "rgba(44, 26, 14, 1)",
  textSecondary: "#5C5C5C",
  textMuted: "#9A9A9A",
  textPlaceholder: "#BDBDBD",
  textOnPrimary: "#FFFFFF",

  // Borders / lines
  border: "#F2DDC8",
  divider: "#F0EAE3",
  inputBorder: "#EADFD2",

  // Status
  success: "#1FA971",
  successLight: "#E7F8F0",
  warning: "#F4B400",
  warningLight: "#FFF6DA",
  danger: "#E5484D",
  dangerLight: "#FDECEC",
  info: "#2D7FF9",
  infoLight: "#E8F1FE",

  // Misc
  star: "#F4B400",
  unselectedStar: "#E5DAC9",
  shadow: "rgba(28, 22, 14, 0.10)",
  skeleton: "#EFE3D6",

  // Tab bar
  tabActive: "#F26B2A",
  tabInactive: "#9A9A9A",
  tabBg: "#FFFFFF",
};

/** Every key in `light` must exist here — enforced by the type annotation. */
export const dark: ThemeColors = {
  // Brand
  primary: "rgba(240, 143, 88, 1)",
  primaryDark: "rgba(214, 106, 48, 1)",
  primaryLight: "#4A2E1C",
  primaryFaint: "#2A1B10",

  // Backgrounds
  background: "#171310",
  backgroundAlt: "#1F1A15",
  surface: "#241E19",
  surfaceMuted: "#2B241E",
  overlay: "rgba(0,0,0,0.65)",

  // Text
  text: "#F5EDE5",
  textSecondary: "#C2B6AA",
  textMuted: "#8C8079",
  textPlaceholder: "#6B615A",
  textOnPrimary: "#1A1108",

  // Borders / lines
  border: "#3A312A",
  divider: "#332C26",
  inputBorder: "#463C33",

  // Status
  success: "#3DD598",
  successLight: "#123027",
  warning: "#F7C948",
  warningLight: "#332B12",
  danger: "#FF6369",
  dangerLight: "#3A1D1E",
  info: "#5AA0FF",
  infoLight: "#152535",

  // Misc
  star: "#F7C948",
  unselectedStar: "#4A403A",
  shadow: "rgba(0, 0, 0, 0.45)",
  skeleton: "#2E2721",

  // Tab bar
  tabActive: "#F08F58",
  tabInactive: "#8C8079",
  tabBg: "#241E19",
};

/** The full colour-token contract. Both palettes satisfy it. */
export type ThemeColors = typeof light;

export const PALETTES = { light, dark } as const;

export type ColorSchemeName = keyof typeof PALETTES;
