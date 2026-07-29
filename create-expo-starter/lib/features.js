"use strict";

/**
 * Optional feature manifest.
 *
 * The template ships with everything enabled; scaffolding *removes* what the
 * user didn't ask for. Subtraction beats composition here — the dev app at the
 * repo root is a single runnable project that is type-checked, linted and
 * tested with every feature on, so there is exactly one code path to maintain
 * instead of one per combination.
 *
 * Each feature declares:
 *   files    Paths deleted when the feature is off.
 *   deps     package.json `dependencies` keys removed when the feature is off.
 *   devDeps  Same, for devDependencies.
 *   plugins  Expo config plugin names stripped from app.json.
 *   swap     { from -> to } template files renamed in when the feature is off,
 *            used to substitute a dependency-free stub for a real module.
 *
 * Source files gate feature-specific lines with markers the transformer
 * understands:
 *
 *   // #if location
 *   import { reverseGeocode } from "@/services/places";
 *   // #endif
 *
 * `// #else` is supported. In JSX, wrap the marker in braces:
 * `{/* #if gallery *\/}`.
 */

const FEATURES = {
  i18n: {
    label: "Internationalisation (i18next, en/fr)",
    files: [
      "src/localization/i18n.ts",
      "src/localization/i18next.d.ts",
      "src/localization/languages.ts",
      "src/localization/languageStorage.ts",
      "src/localization/useLanguage.ts",
      "src/localization/resources",
    ],
    deps: ["i18next", "react-i18next"],
    // Swapped in so every `useLanguage()` call site keeps compiling against a
    // dependency-free English implementation.
    swap: { "stubs/localization.ts": "src/localization/index.ts" },
  },

  location: {
    label: "Device location + Google Places/geocoding",
    files: [
      "src/services/places.ts",
      "src/hooks/useCurrentLocation.ts",
      "src/redux/slice/location.ts",
    ],
    deps: ["expo-location"],
    plugins: ["expo-location"],
    androidPermissions: [
      "android.permission.ACCESS_COARSE_LOCATION",
      "android.permission.ACCESS_FINE_LOCATION",
    ],
    infoPlistKeys: ["NSLocationWhenInUseUsageDescription"],
  },

  gallery: {
    label: "Component gallery screen",
    files: ["src/app/(tabs)/components.tsx"],
  },
};

/**
 * Named bundles. `standard` is the default: a complete app shell without the
 * two things most projects replace immediately (a demo gallery screen and a
 * Google-billed location stack).
 */
const PRESETS = {
  minimal: { i18n: false, location: false, gallery: false },
  standard: { i18n: true, location: false, gallery: true },
  full: { i18n: true, location: true, gallery: true },
};

const DEFAULT_PRESET = "standard";

const featureNames = () => Object.keys(FEATURES);

const isPreset = (name) => Object.prototype.hasOwnProperty.call(PRESETS, name);

/** Resolve a preset name plus explicit overrides into a flat feature map. */
function resolveFeatures(presetName, overrides = {}) {
  const base = PRESETS[presetName] ?? PRESETS[DEFAULT_PRESET];
  const resolved = { ...base };
  for (const [name, value] of Object.entries(overrides)) {
    if (value !== undefined && Object.prototype.hasOwnProperty.call(FEATURES, name)) {
      resolved[name] = value;
    }
  }
  return resolved;
}

/** The preset whose feature map matches exactly, or null for a custom mix. */
function matchingPreset(features) {
  for (const [name, preset] of Object.entries(PRESETS)) {
    const same = featureNames().every((f) => Boolean(preset[f]) === Boolean(features[f]));
    if (same) return name;
  }
  return null;
}

module.exports = {
  FEATURES,
  PRESETS,
  DEFAULT_PRESET,
  featureNames,
  isPreset,
  resolveFeatures,
  matchingPreset,
};
