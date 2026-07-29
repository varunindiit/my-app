#!/usr/bin/env node
"use strict";

// Unit tests for the CLI's pure functions. No filesystem, no network, no
// dependencies — just `node scripts/unit.js`. The scaffold-level behaviour is
// covered separately by scripts/smoke.js.

const assert = require("node:assert/strict");
const { test, run } = require("./harness");

const {
  toSlug,
  toScheme,
  toDisplayName,
  isValidDisplayName,
  isValidBundleId,
  isValidSlug,
  defaultBundleId,
} = require("../lib/utils");
const {
  escapeForJson,
  applyTokens,
  stripFeatureMarkers,
} = require("../lib/transform");
const { resolveFeatures, matchingPreset, PRESETS } = require("../lib/features");
const { isNewer } = require("../lib/version-check");

// ── name normalisation ──────────────────────────────────────────────────────

test("toSlug normalises to lower-kebab", () => {
  assert.equal(toSlug("My Cool App"), "my-cool-app");
  assert.equal(toSlug("  Spaces   Everywhere  "), "spaces-everywhere");
  assert.equal(toSlug("Already-Kebab"), "already-kebab");
  assert.equal(toSlug("weird!!!chars###here"), "weird-chars-here");
  assert.equal(toSlug("--leading-and-trailing--"), "leading-and-trailing");
});

test("toScheme strips every separator", () => {
  assert.equal(toScheme("my-cool-app"), "mycoolapp");
  assert.equal(toScheme("My Cool App"), "mycoolapp");
  assert.equal(toScheme("!!!"), "app", "empty result falls back to 'app'");
});

test("toDisplayName preserves casing and collapses whitespace", () => {
  assert.equal(toDisplayName("  My   Cool App "), "My Cool App");
  assert.equal(toDisplayName(""), "My App");
});

test("isValidSlug accepts npm-safe names only", () => {
  assert.ok(isValidSlug("my-app"));
  assert.ok(isValidSlug("app123"));
  assert.ok(!isValidSlug("-leading-hyphen"));
  assert.ok(!isValidSlug("Upper"));
  assert.ok(!isValidSlug("has space"));
  assert.ok(!isValidSlug("a".repeat(215)), "npm caps names at 214 characters");
});

test("isValidBundleId requires reverse-DNS with letter-led segments", () => {
  assert.ok(isValidBundleId("com.acme.app"));
  assert.ok(isValidBundleId("com.acme.my_app"));
  assert.ok(!isValidBundleId("app"), "needs at least two segments");
  assert.ok(!isValidBundleId("com..app"));
  assert.ok(!isValidBundleId("com.1acme.app"), "segments can't start with a digit");
  assert.ok(!isValidBundleId("com.acme.app-name"), "hyphens are not valid in Java packages");
});

test("defaultBundleId derives a valid identifier from any slug", () => {
  assert.equal(defaultBundleId("my-cool-app"), "com.example.mycoolapp");
  assert.ok(isValidBundleId(defaultBundleId("my-cool-app")));
  assert.ok(isValidBundleId(defaultBundleId("123")), "digit-only slug still yields a valid id");
});

test("isValidDisplayName rejects characters that would corrupt app.json", () => {
  assert.ok(isValidDisplayName("My App"));
  assert.ok(isValidDisplayName("Café ☕"));
  assert.ok(!isValidDisplayName(""));
  assert.ok(!isValidDisplayName('My "Cool" App'), "double quotes break JSON");
  assert.ok(!isValidDisplayName("My \\ App"), "backslashes break JSON");
  assert.ok(!isValidDisplayName("My\nApp"), "control characters break JSON");
  assert.ok(!isValidDisplayName("a".repeat(101)));
});

// ── token substitution ──────────────────────────────────────────────────────

test("escapeForJson escapes quotes and control characters", () => {
  assert.equal(escapeForJson('a"b'), 'a\\"b');
  assert.equal(escapeForJson("a\\b"), "a\\\\b");
  assert.equal(escapeForJson("a\nb"), "a\\nb");
});

test("applyTokens does not interpret $ patterns in the replacement", () => {
  // The regression: String.replace expands `$&` to the matched text, so a
  // project named "My $& App" used to inject the placeholder back into itself.
  const out = applyTokens("name: __APP_DISPLAY_NAME__", {
    __APP_DISPLAY_NAME__: "My $& App",
  });
  assert.equal(out, "name: My $& App");

  assert.equal(
    applyTokens("__APP_SLUG__", { __APP_SLUG__: "$1-$`-$'" }),
    "$1-$`-$'",
  );
});

test("applyTokens escapes values when writing JSON", () => {
  const out = applyTokens('{"name": "__APP_DISPLAY_NAME__"}', {
    __APP_DISPLAY_NAME__: 'My "Cool" App',
  }, { json: true });

  assert.equal(out, '{"name": "My \\"Cool\\" App"}');
  assert.doesNotThrow(() => JSON.parse(out), "result must still parse as JSON");
});

test("applyTokens replaces every occurrence", () => {
  assert.equal(
    applyTokens("__APP_SLUG__/__APP_SLUG__", { __APP_SLUG__: "x" }),
    "x/x",
  );
});

// ── feature markers ─────────────────────────────────────────────────────────

test("stripFeatureMarkers keeps enabled blocks and drops the markers", () => {
  const src = ["before", "// #if gallery", "kept", "// #endif", "after"].join("\n");
  assert.equal(stripFeatureMarkers(src, { gallery: true }), "before\nkept\nafter");
});

test("stripFeatureMarkers removes disabled blocks entirely", () => {
  const src = ["before", "// #if gallery", "dropped", "// #endif", "after"].join("\n");
  assert.equal(stripFeatureMarkers(src, { gallery: false }), "before\nafter");
});

test("stripFeatureMarkers handles JSX-wrapped markers", () => {
  const src = ["<A />", "{/* #if gallery */}", "<B />", "{/* #endif */}"].join("\n");
  assert.equal(stripFeatureMarkers(src, { gallery: false }), "<A />");
  assert.equal(stripFeatureMarkers(src, { gallery: true }), "<A />\n<B />");
});

test("stripFeatureMarkers supports #else", () => {
  const src = ["// #if i18n", "real", "// #else", "stub", "// #endif"].join("\n");
  assert.equal(stripFeatureMarkers(src, { i18n: true }), "real");
  assert.equal(stripFeatureMarkers(src, { i18n: false }), "stub");
});

test("stripFeatureMarkers handles nesting", () => {
  const src = [
    "// #if a",
    "a-only",
    "// #if b",
    "a-and-b",
    "// #endif",
    "// #endif",
  ].join("\n");

  assert.equal(stripFeatureMarkers(src, { a: true, b: true }), "a-only\na-and-b");
  assert.equal(stripFeatureMarkers(src, { a: true, b: false }), "a-only");
  assert.equal(stripFeatureMarkers(src, { a: false, b: true }), "");
});

test("stripFeatureMarkers throws on unbalanced blocks", () => {
  assert.throws(() => stripFeatureMarkers("// #if a\nx", { a: true }), /unclosed/i);
  assert.throws(() => stripFeatureMarkers("// #endif", {}), /without a matching/i);
  assert.throws(() => stripFeatureMarkers("// #else", {}), /outside of an/i);
});

test("stripFeatureMarkers leaves marker-free content untouched", () => {
  const src = "const x = 1;\n// a normal comment\n";
  assert.equal(stripFeatureMarkers(src, {}), src);
});

// ── presets ─────────────────────────────────────────────────────────────────

test("resolveFeatures applies preset defaults", () => {
  assert.deepEqual(resolveFeatures("minimal"), {
    i18n: false,
    location: false,
    gallery: false,
  });
  assert.deepEqual(resolveFeatures("full"), {
    i18n: true,
    location: true,
    gallery: true,
  });
});

test("resolveFeatures lets explicit flags override the preset", () => {
  assert.equal(resolveFeatures("minimal", { gallery: true }).gallery, true);
  assert.equal(resolveFeatures("full", { location: false }).location, false);
});

test("resolveFeatures ignores unknown feature names", () => {
  const resolved = resolveFeatures("minimal", { nope: true });
  assert.equal(resolved.nope, undefined);
});

test("resolveFeatures falls back to the default preset for unknown names", () => {
  assert.deepEqual(resolveFeatures("bogus"), PRESETS.standard);
});

test("matchingPreset names an exact match and null for a custom mix", () => {
  assert.equal(matchingPreset(resolveFeatures("full")), "full");
  assert.equal(matchingPreset({ i18n: true, location: true, gallery: false }), null);
});

// ── version comparison ──────────────────────────────────────────────────────

test("isNewer compares semver correctly", () => {
  assert.ok(isNewer("2.0.0", "1.9.9"));
  assert.ok(isNewer("1.10.0", "1.9.0"), "minor is numeric, not lexical");
  assert.ok(isNewer("1.0.2", "1.0.1"));
  assert.ok(!isNewer("1.0.0", "1.0.0"));
  assert.ok(!isNewer("1.0.0", "2.0.0"));
  assert.ok(!isNewer("2.0.0-beta.1", "2.0.0"), "prerelease is not newer than release");
});

run("CLI unit tests");
