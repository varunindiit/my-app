"use strict";

const path = require("path");

// ── tiny ANSI helpers ───────────────────────────────────────────────────────
const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const wrap = (code) => (s) => (useColor ? `\x1b[${code}m${s}\x1b[0m` : String(s));
const c = {
  bold: wrap(1),
  dim: wrap(2),
  red: wrap(31),
  green: wrap(32),
  yellow: wrap(33),
  blue: wrap(34),
  magenta: wrap(35),
  cyan: wrap(36),
};

const log = (...a) => console.log(...a);
const step = (msg) => log(`${c.cyan("›")} ${msg}`);
const ok = (msg) => log(`${c.green("✔")} ${msg}`);
const warn = (msg) => log(`${c.yellow("!")} ${msg}`);
const err = (msg) => log(`${c.red("✖")} ${msg}`);

// ── name normalisation ───────────────────────────────────────────────────────

/** Lower-kebab slug suitable for package.json `name` and the app `slug`. */
function toSlug(input) {
  return String(input)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // non-alnum → hyphen
    .replace(/^-+|-+$/g, "") // trim hyphens
    .replace(/-{2,}/g, "-"); // collapse repeats
}

/** Alphanumeric, lowercase deep-link scheme (no separators allowed). */
function toScheme(input) {
  const s = String(input)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  return s || "app";
}

/** Human display name — preserves the user's spacing and casing. */
function toDisplayName(input) {
  const s = String(input).trim().replace(/\s+/g, " ");
  return s || "My App";
}

/**
 * Validate a display name.
 *
 * The value is interpolated into app.json (JSON-escaped) and into the LICENSE,
 * so control characters and quote-adjacent trickery are rejected up front
 * rather than relied on to escape cleanly. Emoji and accented letters are fine.
 */
function isValidDisplayName(name) {
  const s = String(name);
  if (!s.trim()) return false;
  if (s.length > 100) return false;
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001F\u007F]/.test(s)) return false;
  if (/["\\<>]/.test(s)) return false;
  return true;
}

/**
 * Default reverse-DNS bundle identifier from a slug.
 *
 * The final segment is prefixed when it would otherwise start with a digit:
 * Android package segments are Java identifiers, so `com.example.123` is
 * rejected by the native build long after scaffolding.
 */
function defaultBundleId(slug) {
  let tail = String(slug).replace(/[^a-z0-9]/gi, "").toLowerCase();
  if (!tail) tail = "app";
  if (/^[0-9]/.test(tail)) tail = `app${tail}`;
  return `com.example.${tail}`;
}

/**
 * Validate a reverse-DNS identifier (com.foo.bar).
 *
 * Each segment must start with a letter: Android package segments are Java
 * identifiers, so `com.1foo.bar` produces a build failure much later, at native
 * compile time, with a far less obvious message.
 */
function isValidBundleId(id) {
  return /^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)+$/.test(String(id));
}

/** Validate a project/slug name. */
function isValidSlug(slug) {
  return /^[a-z0-9][a-z0-9-]*$/.test(String(slug)) && String(slug).length <= 214;
}

function resolveTarget(cwd, slug) {
  return path.resolve(cwd, slug);
}

/** Current year, for the generated LICENSE. */
function currentYear() {
  return String(new Date().getFullYear());
}

module.exports = {
  c,
  log,
  step,
  ok,
  warn,
  err,
  toSlug,
  toScheme,
  toDisplayName,
  isValidDisplayName,
  defaultBundleId,
  isValidBundleId,
  isValidSlug,
  resolveTarget,
  currentYear,
};
