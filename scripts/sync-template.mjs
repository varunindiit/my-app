#!/usr/bin/env node
// Syncs the dev app (repo root) into the published CLI template.
//
// The repo root is the runnable Expo app where all template code is developed
// and tested. This script mirrors it into create-expo-starter/template/, which
// is what `npx create-expo-starter` ships. Identity files that carry
// __APP_*__ placeholders (package.json name, app.json) and template-only files
// (app.config.js, env.example, eas.json, _gitignore, README.md, LICENSE,
// stubs/) are preserved — only their shared parts are updated.
//
// The sync is deterministic: running it twice produces no diff. CI asserts
// exactly that, so a hand-edited template can never reach npm.
//
// Usage: npm run sync-template

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const template = path.join(root, "create-expo-starter", "template");

// Directories mirrored verbatim (the template copy is replaced wholesale).
const SYNC_DIRS = ["src", "assets", "__mocks__"];

// Files copied verbatim. scripts/ is listed file-by-file so this sync script
// itself never leaks into scaffolded projects.
const SYNC_FILES = [
  "babel.config.js",
  "metro.config.js",
  "tsconfig.json",
  "declarations.d.ts",
  "eslint.config.js",
  "jest.config.js",
  "jest.setup.js",
  "scripts/reset-project.js",
];

// Fields of package.json kept in lockstep with the root app. The template's
// name stays "__APP_SLUG__" so the CLI can rename scaffolded projects.
const PKG_SYNC_FIELDS = ["main", "dependencies", "devDependencies", "scripts"];

// Repo-only scripts that must not reach a scaffolded project.
const REPO_ONLY_SCRIPTS = ["sync-template"];

const rel = (p) => path.relative(root, p);

// ── directories ─────────────────────────────────────────────────────────────

for (const dir of SYNC_DIRS) {
  const from = path.join(root, dir);
  if (!fs.existsSync(from)) continue;
  const to = path.join(template, dir);
  fs.rmSync(to, { recursive: true, force: true });
  fs.cpSync(from, to, { recursive: true });
  console.log(`✔ synced ${dir}/ -> ${rel(to)}/`);
}

// ── files ───────────────────────────────────────────────────────────────────

for (const file of SYNC_FILES) {
  const from = path.join(root, file);
  if (!fs.existsSync(from)) {
    console.warn(`! skipped missing ${file}`);
    continue;
  }
  const to = path.join(template, file);
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
  console.log(`✔ synced ${file}`);
}

// ── eslint config ───────────────────────────────────────────────────────────
// The dev app ignores create-expo-starter/ because the CLI is plain CommonJS
// with its own lint step. That path doesn't exist in a scaffolded project, so
// strip the entry rather than shipping a confusing dangling ignore.

const tplEslintPath = path.join(template, "eslint.config.js");
if (fs.existsSync(tplEslintPath)) {
  const original = fs.readFileSync(tplEslintPath, "utf8");
  const stripped = original.replace(/^\s*"create-expo-starter\/\*\*",\n/m, "");
  if (stripped !== original) {
    fs.writeFileSync(tplEslintPath, stripped);
    console.log("✔ pruned repo-only ignore from eslint.config.js");
  }
}

// ── jest config ─────────────────────────────────────────────────────────────
// Same story as eslint: the dev app must ignore its own generated template
// copy, but that path doesn't exist in a scaffolded project.

const tplJestPath = path.join(template, "jest.config.js");
if (fs.existsSync(tplJestPath)) {
  const original = fs.readFileSync(tplJestPath, "utf8");
  const stripped = original.replace(
    /^\s*modulePathIgnorePatterns: \["<rootDir>\/create-expo-starter\/"\],\n/m,
    "",
  );
  if (stripped !== original) {
    fs.writeFileSync(tplJestPath, stripped);
    console.log("✔ pruned repo-only ignore from jest.config.js");
  }
}

// ── package.json ────────────────────────────────────────────────────────────

const rootPkg = JSON.parse(
  fs.readFileSync(path.join(root, "package.json"), "utf8"),
);
const tplPkgPath = path.join(template, "package.json");
const tplPkg = JSON.parse(fs.readFileSync(tplPkgPath, "utf8"));

for (const field of PKG_SYNC_FIELDS) tplPkg[field] = rootPkg[field];

tplPkg.scripts = { ...tplPkg.scripts };
for (const script of REPO_ONLY_SCRIPTS) delete tplPkg.scripts[script];

fs.writeFileSync(tplPkgPath, JSON.stringify(tplPkg, null, 2) + "\n");
console.log(`✔ synced package.json fields: ${PKG_SYNC_FIELDS.join(", ")}`);

// ── lockfile ────────────────────────────────────────────────────────────────
// Shipped so `npm install` in a scaffolded project resolves the exact tree this
// starter was tested against. Stored as `_package-lock.json` because npm strips
// `package-lock.json` from published tarballs; the CLI renames it back. The
// root `name` is swapped for the placeholder so the lock matches the renamed
// project rather than claiming to be "my-app".

const rootLockPath = path.join(root, "package-lock.json");
if (fs.existsSync(rootLockPath)) {
  const lock = JSON.parse(fs.readFileSync(rootLockPath, "utf8"));
  lock.name = "__APP_SLUG__";
  if (lock.packages?.[""]) {
    lock.packages[""].name = "__APP_SLUG__";
    delete lock.packages[""].scripts;
  }
  fs.writeFileSync(
    path.join(template, "_package-lock.json"),
    JSON.stringify(lock, null, 2) + "\n",
  );
  console.log("✔ synced _package-lock.json (name placeholdered)");
} else {
  console.warn("! no package-lock.json at the repo root — template ships none");
}

// ── app.json ────────────────────────────────────────────────────────────────
// Sync everything except the placeholder identity fields.

const rootApp = JSON.parse(fs.readFileSync(path.join(root, "app.json"), "utf8"));
const tplAppPath = path.join(template, "app.json");
const tplApp = JSON.parse(fs.readFileSync(tplAppPath, "utf8"));

const keep = {
  name: tplApp.expo.name,
  slug: tplApp.expo.slug,
  scheme: tplApp.expo.scheme,
  iosBundleIdentifier: tplApp.expo.ios?.bundleIdentifier,
  androidPackage: tplApp.expo.android?.package,
};

tplApp.expo = JSON.parse(JSON.stringify(rootApp.expo));
tplApp.expo.name = keep.name;
tplApp.expo.slug = keep.slug;
tplApp.expo.scheme = keep.scheme;
tplApp.expo.ios = { ...tplApp.expo.ios, bundleIdentifier: keep.iosBundleIdentifier };
delete tplApp.expo.ios.appleTeamId; // never ship a real team id
tplApp.expo.android = { ...tplApp.expo.android, package: keep.androidPackage };

fs.writeFileSync(tplAppPath, JSON.stringify(tplApp, null, 2) + "\n");
console.log("✔ synced app.json (identity placeholders preserved)");

// ── guard: no leftover source identity in the template ──────────────────────
// The scaffolder only substitutes `__APP_*__` placeholders. If a literal from
// the dev app survives into the template, every generated project inherits it.

const OFFENDERS = [/\bmy-app\b/, /\bcom\.anonymous\./];
const SKIP_DIRS = new Set(["node_modules", ".expo", "ios", "android", "dist"]);
const TEXT_EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".json", ".md", ".txt"]);

const leaked = [];
const scan = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scan(full);
      continue;
    }
    // The lockfile legitimately references package names; identity lives in
    // its `name` field, which is placeholdered above.
    if (entry.name === "_package-lock.json") continue;
    if (!TEXT_EXT.has(path.extname(entry.name))) continue;

    const content = fs.readFileSync(full, "utf8");
    if (OFFENDERS.some((re) => re.test(content))) {
      leaked.push(path.relative(template, full));
    }
  }
};
scan(template);

if (leaked.length) {
  console.error(
    `\n✖ Template still contains dev-app identity strings:\n  ${leaked.join("\n  ")}\n` +
      "  Replace them with __APP_SLUG__ / __APP_BUNDLE_ID__ placeholders.",
  );
  process.exit(1);
}

console.log(
  "\nTemplate is in sync. Run `npm run test:all` inside create-expo-starter/ to verify the CLI.",
);
