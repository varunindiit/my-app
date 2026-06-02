"use strict";

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

// File extensions we treat as text and run token replacement on. Everything
// else (fonts, png, svg binary blobs handled as assets, etc.) is copied as-is.
const TEXT_EXT = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".json",
  ".md",
  ".txt",
  ".html",
  ".css",
  ".yml",
  ".yaml",
  ".env",
  ".d.ts",
]);

// Files without a useful extension that should still be scanned for tokens.
const TEXT_BASENAMES = new Set(["_gitignore", ".gitignore", "app.config.js"]);

function isTextFile(filePath) {
  const base = path.basename(filePath);
  if (TEXT_BASENAMES.has(base)) return true;
  return TEXT_EXT.has(path.extname(filePath).toLowerCase());
}

/** Recursively copy a directory tree. */
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(from, to);
    } else if (entry.isSymbolicLink()) {
      fs.symlinkSync(fs.readlinkSync(from), to);
    } else {
      fs.copyFileSync(from, to);
    }
  }
}

/** Walk every file under `dir`, yielding absolute paths. */
function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Replace all project-name tokens across the scaffolded tree.
 *
 * `tokens` maps a search string → replacement. Longer keys are applied first so
 * `com.anonymous.my-app` is handled before the bare `my-app`.
 */
function applyReplacements(root, tokens) {
  const ordered = Object.keys(tokens).sort((a, b) => b.length - a.length);
  const patterns = ordered.map((key) => ({
    re: new RegExp(escapeRegExp(key), "g"),
    value: tokens[key],
  }));

  let changedFiles = 0;
  for (const file of walk(root)) {
    if (!isTextFile(file)) continue;
    let content;
    try {
      content = fs.readFileSync(file, "utf8");
    } catch {
      continue; // unreadable / binary disguised as text — skip safely
    }
    let next = content;
    for (const { re, value } of patterns) next = next.replace(re, value);
    if (next !== content) {
      fs.writeFileSync(file, next);
      changedFiles += 1;
    }
  }
  return changedFiles;
}

/** Rename the bundled `_gitignore` back to `.gitignore` in the new project. */
function restoreDotfiles(root) {
  const from = path.join(root, "_gitignore");
  const to = path.join(root, ".gitignore");
  if (fs.existsSync(from)) fs.renameSync(from, to);
}

/**
 * Restore the env template (`env.example` → `.env.example`) and seed a working
 * `.env` from it so the app runs immediately. Stored without a leading dot in
 * the package to avoid npm's dotfile-publishing quirks (same trick as gitignore).
 */
function prepareEnv(root) {
  const bundled = path.join(root, "env.example");
  const example = path.join(root, ".env.example");
  if (fs.existsSync(bundled)) fs.renameSync(bundled, example);
  const env = path.join(root, ".env");
  if (fs.existsSync(example) && !fs.existsSync(env)) {
    fs.copyFileSync(example, env);
  }
}

/** Pick a package manager from the user agent that invoked us, default npm. */
function detectPackageManager() {
  const ua = process.env.npm_config_user_agent || "";
  if (ua.startsWith("yarn")) return "yarn";
  if (ua.startsWith("pnpm")) return "pnpm";
  if (ua.startsWith("bun")) return "bun";
  return "npm";
}

function run(cmd, args, cwd) {
  const res = spawnSync(cmd, args, { cwd, stdio: "inherit", shell: false });
  return res.status === 0;
}

function installDeps(root, pm) {
  return run(pm, ["install"], root);
}

function gitInit(root) {
  if (fs.existsSync(path.join(root, ".git"))) return true;
  const init = spawnSync("git", ["init", "-q"], { cwd: root, stdio: "ignore" });
  if (init.status !== 0) return false;
  spawnSync("git", ["add", "-A"], { cwd: root, stdio: "ignore" });
  spawnSync(
    "git",
    ["commit", "-q", "-m", "chore: bootstrap from create-expo-starter"],
    { cwd: root, stdio: "ignore" }
  );
  return true;
}

module.exports = {
  copyDir,
  applyReplacements,
  restoreDotfiles,
  prepareEnv,
  detectPackageManager,
  installDeps,
  gitInit,
};
