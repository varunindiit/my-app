/**
 * Design tokens.
 *
 * `THEME` is the *light* palette exposed as a plain object. It exists so
 * non-reactive call sites (module-scope constants, utilities outside the React
 * tree, tests) still have something to read.
 *
 * Anything rendered on screen should use `useThemeColors()` / `makeStyles()`
 * from `@/theme/useTheme` instead, so it follows the device appearance.
 * Palettes and their types live in `./palette`.
 */
import { light, type ThemeColors } from "./palette";

export const THEME = light;

/** @deprecated Use `ThemeColors` from `./palette`. */
export type ThemeType = ThemeColors;
