#!/usr/bin/env node
// Syncs the dev app (repo root) into the published CLI template.
//
// The repo root is the runnable Expo app where all template code is developed
// and tested. This script mirrors it into create-expo-starter/template/, which
// is what `npx create-expo-starter` ships. Identity files that carry
// __APP_*__ placeholders (package.json name, app.json) and template-only files
// (app.config.js, env.example, eas.json, _gitignore, README.md, LICENSE) are
// preserved — only their shared parts are updated.
//
// Usage: npm run sync-template

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const template = path.join(root, "create-expo-starter", "template");

// Directories mirrored verbatim (template copy is replaced wholesale).
const SYNC_DIRS = ["src", "assets"];

// Files copied verbatim. scripts/ is listed file-by-file so this sync script
// itself never leaks into scaffolded projects.
const SYNC_FILES = [
  "babel.config.js",
  "metro.config.js",
  "tsconfig.json",
  "declarations.d.ts",
  "scripts/reset-project.js",
];

// Fields of package.json kept in lockstep with the root app. The template's
// name stays "__APP_SLUG__" so the CLI can rename scaffolded projects.
const PKG_SYNC_FIELDS = ["main", "dependencies", "devDependencies", "scripts"];

const rel = (p) => path.relative(root, p);

for (const dir of SYNC_DIRS) {
  const from = path.join(root, dir);
  const to = path.join(template, dir);
  fs.rmSync(to, { recursive: true, force: true });
  fs.cpSync(from, to, { recursive: true });
  console.log(`✔ synced ${dir}/ -> ${rel(to)}/`);
}

for (const file of SYNC_FILES) {
  const to = path.join(template, file);
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(path.join(root, file), to);
  console.log(`✔ synced ${file}`);
}

const rootPkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const tplPkgPath = path.join(template, "package.json");
const tplPkg = JSON.parse(fs.readFileSync(tplPkgPath, "utf8"));
for (const field of PKG_SYNC_FIELDS) tplPkg[field] = rootPkg[field];
delete tplPkg.scripts["sync-template"]; // repo-only tooling, not for scaffolded apps
fs.writeFileSync(tplPkgPath, JSON.stringify(tplPkg, null, 2) + "\n");
console.log(`✔ synced package.json fields: ${PKG_SYNC_FIELDS.join(", ")}`);

// app.json: sync everything except the placeholder identity fields.
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

console.log("\nTemplate is in sync. Run `npm test` inside create-expo-starter/ to smoke-test the CLI.");
