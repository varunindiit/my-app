"use strict";

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const { FEATURES } = require("./features");
const {
  applyTokens,
  stripFeatureMarkers,
  tidyBlankLines,
} = require("./transform");

// File extensions we treat as text and run transforms on. Everything else
// (fonts, images, binary blobs) is copied byte-for-byte.
const TEXT_EXT = new Set([
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".ts",
  ".tsx",
  ".json",
  ".md",
  ".txt",
  ".html",
  ".css",
  ".yml",
  ".yaml",
]);

// Files without a useful extension that should still be treated as text.
const TEXT_BASENAMES = new Set([
  "_gitignore",
  ".gitignore",
  "env.example",
  ".env.example",
  "LICENSE",
]);

function isTextFile(filePath) {
  const base = path.basename(filePath);
  if (TEXT_BASENAMES.has(base)) return true;
  return TEXT_EXT.has(path.extname(filePath).toLowerCase());
}

const isJsonFile = (filePath) =>
  path.extname(filePath).toLowerCase() === ".json";

/** Recursively copy a directory tree. */
function copyDir(src, dest, { skip = () => false } = {}) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (skip(from)) continue;

    if (entry.isDirectory()) {
      copyDir(from, to, { skip });
    } else if (entry.isSymbolicLink()) {
      fs.symlinkSync(fs.readlinkSync(from), to);
    } else {
      fs.copyFileSync(from, to);
    }
  }
}

/** Walk every file under `dir`, yielding absolute paths. */
function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

/**
 * Substitute `__APP_*__` placeholders and strip disabled feature blocks.
 *
 * Only the explicit placeholders are replaced. An earlier version also
 * blanket-replaced the literal strings `my-app` and `myapp` across every text
 * file as a "safety net", which silently rewrote any legitimate occurrence of
 * those substrings in user-facing copy. If a placeholder is missing from the
 * template, the smoke test catches it — a blind find-and-replace is not a
 * safety net, it is a second bug.
 */
function transformTree(root, tokens, features) {
  let changedFiles = 0;

  for (const file of walk(root)) {
    if (!isTextFile(file)) continue;

    let content;
    try {
      content = fs.readFileSync(file, "utf8");
    } catch {
      continue; // unreadable / binary disguised as text — skip safely
    }

    const relative = path.relative(root, file);
    let next = stripFeatureMarkers(content, features, relative);
    if (next !== content) next = tidyBlankLines(next);
    next = applyTokens(next, tokens, { json: isJsonFile(file) });

    if (next !== content) {
      fs.writeFileSync(file, next);
      changedFiles += 1;
    }
  }

  return changedFiles;
}

/**
 * Remove the files, dependencies and native config belonging to disabled
 * features, and swap in any dependency-free stubs.
 */
function applyFeatures(root, features) {
  const removed = [];

  for (const [name, spec] of Object.entries(FEATURES)) {
    if (features[name]) continue;

    for (const relative of spec.files ?? []) {
      const target = path.join(root, relative);
      if (fs.existsSync(target)) {
        fs.rmSync(target, { recursive: true, force: true });
        removed.push(relative);
      }
    }

    for (const [from, to] of Object.entries(spec.swap ?? {})) {
      const source = path.join(root, from);
      if (fs.existsSync(source)) {
        fs.mkdirSync(path.dirname(path.join(root, to)), { recursive: true });
        fs.renameSync(source, path.join(root, to));
      }
    }
  }

  pruneManifest(root, features);
  pruneAppConfig(root, features);

  // `stubs/` only ever holds replacements for disabled features; whatever is
  // left after the swaps above is dead weight in the generated project.
  fs.rmSync(path.join(root, "stubs"), { recursive: true, force: true });

  return removed;
}

/** Drop dependencies belonging to disabled features from package.json. */
function pruneManifest(root, features) {
  const manifestPath = path.join(root, "package.json");
  if (!fs.existsSync(manifestPath)) return;

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

  for (const [name, spec] of Object.entries(FEATURES)) {
    if (features[name]) continue;
    for (const dep of spec.deps ?? []) delete manifest.dependencies?.[dep];
    for (const dep of spec.devDeps ?? []) delete manifest.devDependencies?.[dep];
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
}

/** Drop plugins, permissions and usage strings for disabled features. */
function pruneAppConfig(root, features) {
  const appJsonPath = path.join(root, "app.json");
  if (!fs.existsSync(appJsonPath)) return;

  const config = JSON.parse(fs.readFileSync(appJsonPath, "utf8"));
  const expo = config.expo ?? {};

  for (const [name, spec] of Object.entries(FEATURES)) {
    if (features[name]) continue;

    if (spec.plugins?.length && Array.isArray(expo.plugins)) {
      expo.plugins = expo.plugins.filter((plugin) => {
        const id = Array.isArray(plugin) ? plugin[0] : plugin;
        return !spec.plugins.includes(id);
      });
    }

    if (spec.androidPermissions?.length && Array.isArray(expo.android?.permissions)) {
      expo.android.permissions = expo.android.permissions.filter(
        (permission) => !spec.androidPermissions.includes(permission),
      );
    }

    // Shipping a usage description for a permission the app never requests is
    // a common App Store review rejection.
    if (spec.infoPlistKeys?.length && expo.ios?.infoPlist) {
      for (const key of spec.infoPlistKeys) delete expo.ios.infoPlist[key];
    }
  }

  config.expo = expo;
  fs.writeFileSync(appJsonPath, JSON.stringify(config, null, 2) + "\n");
}

/**
 * Restore files stored under a non-dot name in the package.
 *
 * npm silently drops some dotfiles from published tarballs, so the template
 * ships `_gitignore` / `env.example` / `_package-lock.json` and they are
 * renamed here.
 */
function restoreDotfiles(root) {
  const renames = [
    ["_gitignore", ".gitignore"],
    ["_npmrc", ".npmrc"],
    ["_package-lock.json", "package-lock.json"],
    ["env.example", ".env.example"],
  ];

  for (const [from, to] of renames) {
    const source = path.join(root, from);
    if (fs.existsSync(source)) fs.renameSync(source, path.join(root, to));
  }
}

/** Seed a working `.env` from `.env.example` so the app runs immediately. */
function prepareEnv(root) {
  const example = path.join(root, ".env.example");
  const env = path.join(root, ".env");
  if (fs.existsSync(example) && !fs.existsSync(env)) {
    fs.copyFileSync(example, env);
  }
}

/**
 * A lockfile generated for the full template lists packages that a pruned
 * project no longer depends on. npm reconciles this on install, but leaving
 * the stale entries makes `npm ci` fail with a confusing "lock file does not
 * satisfy package.json" error, so drop it when the manifest was pruned.
 */
function dropStaleLockfile(root, prunedAnything) {
  if (!prunedAnything) return false;
  const lock = path.join(root, "package-lock.json");
  if (!fs.existsSync(lock)) return false;
  fs.rmSync(lock);
  return true;
}

// ── package manager ─────────────────────────────────────────────────────────

const SUPPORTED_PMS = new Set(["npm", "yarn", "pnpm", "bun"]);

/** Pick a package manager from the user agent that invoked us, default npm. */
function detectPackageManager() {
  const ua = process.env.npm_config_user_agent || "";
  if (ua.startsWith("yarn")) return "yarn";
  if (ua.startsWith("pnpm")) return "pnpm";
  if (ua.startsWith("bun")) return "bun";
  return "npm";
}

/**
 * Run a package manager command.
 *
 * On Windows, npm/yarn/pnpm are `.cmd` shims. Since Node's fix for
 * CVE-2024-27980, spawning a `.cmd` without a shell throws EINVAL, which is
 * why dependency installation used to fail on every Windows machine. Enabling
 * the shell there is safe because `pm` is checked against a fixed allowlist —
 * no user input reaches the command line.
 */
function runPackageManager(pm, args, cwd) {
  if (!SUPPORTED_PMS.has(pm)) {
    throw new Error(`Unsupported package manager: ${pm}`);
  }

  const result = spawnSync(pm, args, {
    cwd,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  return result.status === 0;
}

function installDeps(root, pm) {
  return runPackageManager(pm, ["install"], root);
}

function gitInit(root) {
  if (fs.existsSync(path.join(root, ".git"))) return true;

  const init = spawnSync("git", ["init", "-q"], { cwd: root, stdio: "ignore" });
  if (init.status !== 0) return false;

  spawnSync("git", ["add", "-A"], { cwd: root, stdio: "ignore" });
  const commit = spawnSync(
    "git",
    ["commit", "-q", "-m", "chore: bootstrap from create-expo-starter"],
    { cwd: root, stdio: "ignore" },
  );

  // A missing user.name/user.email makes the commit fail while `git init`
  // succeeded. The repo is still usable, so report success and let the caller
  // mention that nothing was committed.
  return commit.status === 0 ? true : "no-commit";
}

module.exports = {
  copyDir,
  walk,
  isTextFile,
  transformTree,
  applyFeatures,
  pruneManifest,
  pruneAppConfig,
  restoreDotfiles,
  prepareEnv,
  dropStaleLockfile,
  detectPackageManager,
  runPackageManager,
  installDeps,
  gitInit,
  SUPPORTED_PMS,
};
