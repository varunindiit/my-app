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

/** Human display name — preserves user's spacing/casing, falls back gracefully. */
function toDisplayName(input) {
  const s = String(input).trim();
  return s || "My App";
}

/** Default reverse-DNS bundle identifier from a slug. */
function defaultBundleId(slug) {
  const tail = slug.replace(/-/g, "").replace(/[^a-z0-9]/g, "") || "app";
  return `com.example.${tail}`;
}

/** Validate a reverse-DNS identifier (com.foo.bar). */
function isValidBundleId(id) {
  return /^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)+$/.test(id);
}

/** Validate a project/slug name. */
function isValidSlug(slug) {
  return /^[a-z0-9][a-z0-9-]*$/.test(slug) && slug.length <= 214;
}

function resolveTarget(cwd, slug) {
  return path.resolve(cwd, slug);
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
  defaultBundleId,
  isValidBundleId,
  isValidSlug,
  resolveTarget,
};
