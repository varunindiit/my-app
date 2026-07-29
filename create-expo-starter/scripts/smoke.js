#!/usr/bin/env node
"use strict";

// End-to-end smoke tests: scaffold projects into temp dirs (no install / git)
// and assert on the result. Covers renaming, env setup, feature pruning,
// argument validation and — most importantly — that every relative import in
// the generated tree still resolves after files are pruned.
//
// A full `npm install && tsc --noEmit` of the generated project is the real
// proof; CI does that separately per preset (see .github/workflows/ci.yml).
// This suite stays dependency-free so it can run anywhere in seconds.

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const { test, run } = require("./harness");

const CLI = path.join(__dirname, "..", "bin", "index.js");
const tmpRoots = [];

/** Run the CLI in a fresh temp dir and return { status, stdout, dir }. */
function scaffold(args, { expectFailure = false } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ces-smoke-"));
  tmpRoots.push(dir);

  const result = spawnSync(process.execPath, [CLI, ...args], {
    cwd: dir,
    encoding: "utf8",
    env: { ...process.env, CES_DISABLE_UPDATE_CHECK: "1", NO_COLOR: "1" },
  });

  if (!expectFailure && result.status !== 0) {
    throw new Error(
      `CLI exited ${result.status}\n--- stdout ---\n${result.stdout}\n--- stderr ---\n${result.stderr}`,
    );
  }

  return { ...result, dir, output: `${result.stdout}${result.stderr}` };
}

const read = (...segments) => fs.readFileSync(path.join(...segments), "utf8");
const readJson = (...segments) => JSON.parse(read(...segments));
const exists = (...segments) => fs.existsSync(path.join(...segments));

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".git") continue;
      walk(full, out);
    } else {
      out.push(full);
    }
  }
  return out;
}

const SOURCE_EXT = /\.(ts|tsx|js|jsx)$/;
const RESOLVE_EXT = ["", ".ts", ".tsx", ".js", ".jsx", ".json", ".svg", ".png", ".ttf"];

/**
 * Verify every import in the generated tree points at a file that exists.
 *
 * This is the check that makes feature pruning safe: deleting a file the rest
 * of the app still imports is exactly the failure mode a structural test can
 * catch without installing 1,100 packages.
 */
function findDanglingImports(projectDir) {
  const dangling = [];
  const srcRoot = path.join(projectDir, "src");

  const resolves = (candidate) => {
    for (const ext of RESOLVE_EXT) {
      if (fs.existsSync(candidate + ext) && fs.statSync(candidate + ext).isFile()) {
        return true;
      }
    }
    // Directory with an index file.
    for (const ext of RESOLVE_EXT.slice(1)) {
      if (fs.existsSync(path.join(candidate, "index" + ext))) return true;
    }
    return false;
  };

  for (const file of walk(projectDir)) {
    if (!SOURCE_EXT.test(file)) continue;

    // Strip comments first so a commented-out import isn't reported as broken.
    const content = fs
      .readFileSync(file, "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^[ \t]*\/\/.*$/gm, "");

    const specifiers = [...content.matchAll(/(?:from\s+|require\(\s*)["']([^"']+)["']/g)]
      .map((m) => m[1])
      .filter((spec) => spec.startsWith(".") || spec.startsWith("@/"));

    for (const spec of specifiers) {
      const target = spec.startsWith("@/")
        ? path.join(srcRoot, spec.slice(2))
        : path.resolve(path.dirname(file), spec);

      if (!resolves(target)) {
        dangling.push(`${path.relative(projectDir, file)} -> ${spec}`);
      }
    }
  }

  return dangling;
}

/** Any `__APP_*__` placeholder left behind means a token was never substituted. */
function findLeftoverPlaceholders(projectDir) {
  const leftovers = [];
  for (const file of walk(projectDir)) {
    if (!/\.(ts|tsx|js|jsx|json|md|txt)$/.test(file)) continue;
    if (path.basename(file) === "package-lock.json") continue;
    const content = fs.readFileSync(file, "utf8");
    if (/__APP_[A-Z_]+__/.test(content)) {
      leftovers.push(path.relative(projectDir, file));
    }
  }
  return leftovers;
}

// ── the default (standard) scaffold ─────────────────────────────────────────

let standard;

test("scaffolds a project with the default preset", () => {
  standard = scaffold([
    "Smoke Test App",
    "--bundle-id",
    "com.smoke.testapp",
    "--no-install",
    "--no-git",
  ]);
  assert.equal(standard.status, 0);
  standard.project = path.join(standard.dir, "smoke-test-app");
  assert.ok(fs.existsSync(standard.project), "project directory created from slug");
});

test("renames package.json", () => {
  assert.equal(readJson(standard.project, "package.json").name, "smoke-test-app");
});

test("renames app.json identity fields", () => {
  const app = readJson(standard.project, "app.json").expo;
  assert.equal(app.name, "Smoke Test App");
  assert.equal(app.slug, "smoke-test-app");
  assert.equal(app.scheme, "smoketestapp");
  assert.equal(app.ios.bundleIdentifier, "com.smoke.testapp");
  assert.equal(app.android.package, "com.smoke.testapp");
});

test("ships the expected top-level files", () => {
  for (const file of [
    "app.config.js",
    "eas.json",
    "tsconfig.json",
    "jest.config.js",
    "jest.setup.js",
    "eslint.config.js",
    "LICENSE",
    "README.md",
  ]) {
    assert.ok(exists(standard.project, file), `${file} present`);
  }
});

test("restores dotfiles and seeds .env", () => {
  assert.ok(exists(standard.project, ".gitignore"), ".gitignore restored");
  assert.ok(!exists(standard.project, "_gitignore"), "_gitignore removed");
  assert.ok(exists(standard.project, ".env.example"), ".env.example restored");
  assert.ok(exists(standard.project, ".env"), ".env seeded");
  assert.ok(!exists(standard.project, "env.example"), "env.example renamed");
  assert.ok(
    !exists(standard.project, "_package-lock.json"),
    "_package-lock.json never ships under its packaged name",
  );
});

test("substitutes the LICENSE copyright", () => {
  const license = read(standard.project, "LICENSE");
  assert.ok(license.includes("Smoke Test App"), "display name in LICENSE");
  assert.match(license, /Copyright \(c\) \d{4} /, "year substituted");
});

test("leaves no unsubstituted placeholders", () => {
  const leftovers = findLeftoverPlaceholders(standard.project);
  assert.deepEqual(leftovers, [], `leftover placeholders in: ${leftovers.join(", ")}`);
});

test("leaves no feature markers in the output", () => {
  const withMarkers = walk(standard.project)
    .filter((f) => SOURCE_EXT.test(f))
    .filter((f) => /#(if|else|endif)\b/.test(fs.readFileSync(f, "utf8")))
    .map((f) => path.relative(standard.project, f));
  assert.deepEqual(withMarkers, [], `markers left in: ${withMarkers.join(", ")}`);
});

test("has no dangling imports", () => {
  const dangling = findDanglingImports(standard.project);
  assert.deepEqual(dangling, [], `dangling imports:\n  ${dangling.join("\n  ")}`);
});

test("omits location by default but keeps i18n and the gallery", () => {
  assert.ok(!exists(standard.project, "src/services/places.ts"), "places removed");
  assert.ok(!exists(standard.project, "src/redux/slice/location.ts"), "location slice removed");
  assert.ok(exists(standard.project, "src/localization/i18n.ts"), "i18n kept");
  assert.ok(exists(standard.project, "src/app/(tabs)/components.tsx"), "gallery kept");

  const pkg = readJson(standard.project, "package.json");
  assert.ok(!pkg.dependencies["expo-location"], "expo-location dependency pruned");
  assert.ok(pkg.dependencies["i18next"], "i18next dependency kept");
});

test("prunes the location plugin, permissions and usage string", () => {
  const expo = readJson(standard.project, "app.json").expo;
  const pluginIds = expo.plugins.map((p) => (Array.isArray(p) ? p[0] : p));
  assert.ok(!pluginIds.includes("expo-location"), "plugin removed");
  assert.deepEqual(expo.android.permissions, [], "android permissions removed");
  assert.ok(
    !("NSLocationWhenInUseUsageDescription" in expo.ios.infoPlist),
    "iOS usage string removed",
  );
});

test("drops the lockfile when dependencies were pruned", () => {
  // `standard` prunes expo-location, so the bundled lock no longer matches
  // package.json. Keeping it would make `npm ci` fail with a confusing
  // "lock file does not satisfy package.json"; dropping it makes the first
  // `npm install` regenerate a correct one.
  assert.ok(!readJson(standard.project, "package.json").dependencies["expo-location"]);
  assert.ok(
    !exists(standard.project, "package-lock.json"),
    "stale lockfile removed after pruning",
  );
});

test("removes the stubs directory", () => {
  assert.ok(!exists(standard.project, "stubs"), "stubs/ not shipped to the project");
});

// ── full preset ─────────────────────────────────────────────────────────────

let full;

test("scaffolds with --preset full", () => {
  full = scaffold(["full-app", "--preset", "full", "--no-install", "--no-git"]);
  full.project = path.join(full.dir, "full-app");
  assert.ok(fs.existsSync(full.project));
});

test("full keeps every optional feature", () => {
  assert.ok(exists(full.project, "src/services/places.ts"));
  assert.ok(exists(full.project, "src/hooks/useCurrentLocation.ts"));
  assert.ok(exists(full.project, "src/redux/slice/location.ts"));
  assert.ok(exists(full.project, "src/localization/i18n.ts"));
  assert.ok(exists(full.project, "src/app/(tabs)/components.tsx"));

  const pkg = readJson(full.project, "package.json");
  assert.ok(pkg.dependencies["expo-location"]);
  assert.ok(pkg.dependencies["i18next"]);
});

test("full keeps the lockfile and names it correctly", () => {
  assert.ok(exists(full.project, "package-lock.json"), "lockfile restored");
  assert.ok(!exists(full.project, "_package-lock.json"), "packaged name renamed");
  assert.equal(
    readJson(full.project, "package-lock.json").name,
    "full-app",
    "lockfile name matches the project",
  );
});

test("full has no dangling imports", () => {
  const dangling = findDanglingImports(full.project);
  assert.deepEqual(dangling, [], `dangling imports:\n  ${dangling.join("\n  ")}`);
});

// ── minimal preset ──────────────────────────────────────────────────────────

let minimal;

test("scaffolds with --preset minimal", () => {
  minimal = scaffold(["tiny-app", "--preset", "minimal", "--no-install", "--no-git"]);
  minimal.project = path.join(minimal.dir, "tiny-app");
  assert.ok(fs.existsSync(minimal.project));
});

test("minimal removes i18n, location and the gallery", () => {
  assert.ok(!exists(minimal.project, "src/localization/i18n.ts"));
  assert.ok(!exists(minimal.project, "src/localization/languages.ts"));
  assert.ok(!exists(minimal.project, "src/localization/resources"));
  assert.ok(!exists(minimal.project, "src/services/places.ts"));
  assert.ok(!exists(minimal.project, "src/app/(tabs)/components.tsx"));

  const pkg = readJson(minimal.project, "package.json");
  assert.ok(!pkg.dependencies["i18next"]);
  assert.ok(!pkg.dependencies["react-i18next"]);
  assert.ok(!pkg.dependencies["expo-location"]);
});

test("minimal swaps in the localisation stub", () => {
  assert.ok(exists(minimal.project, "src/localization/index.ts"), "stub in place");
  const stub = read(minimal.project, "src/localization/index.ts");
  assert.ok(stub.includes("useLanguage"), "stub exports useLanguage");
  assert.ok(
    !/(?:from|require\()\s*["']i18next/.test(stub),
    "stub imports nothing from i18next",
  );
  assert.ok(
    !/(?:from|require\()\s*["']react-i18next/.test(stub),
    "stub imports nothing from react-i18next",
  );
});

test("minimal has no dangling imports", () => {
  const dangling = findDanglingImports(minimal.project);
  assert.deepEqual(dangling, [], `dangling imports:\n  ${dangling.join("\n  ")}`);
});

test("minimal drops the gallery tab from the layout", () => {
  const layout = read(minimal.project, "src/app/(tabs)/_layout.tsx");
    assert.ok(!layout.includes('name="components"'), "gallery tab removed");
  assert.ok(layout.includes('name="profile"'), "other tabs intact");
});

// ── explicit feature overrides ──────────────────────────────────────────────

test("--location adds the feature on top of a minimal preset", () => {
  const run = scaffold([
    "mixed-app",
    "--preset",
    "minimal",
    "--location",
    "--no-install",
    "--no-git",
  ]);
  const project = path.join(run.dir, "mixed-app");

  assert.ok(exists(project, "src/services/places.ts"), "location kept");
  assert.ok(!exists(project, "src/localization/i18n.ts"), "i18n still removed");
  assert.deepEqual(findDanglingImports(project), []);
});

test("--no-gallery removes the gallery from the full preset", () => {
  const run = scaffold([
    "nogallery-app",
    "--preset",
    "full",
    "--no-gallery",
    "--no-install",
    "--no-git",
  ]);
  const project = path.join(run.dir, "nogallery-app");

  assert.ok(!exists(project, "src/app/(tabs)/components.tsx"));
  assert.ok(exists(project, "src/services/places.ts"), "location still present");
  assert.deepEqual(findDanglingImports(project), []);
});

// ── flags ───────────────────────────────────────────────────────────────────

test("--yes runs without prompting", () => {
  const run = scaffold(["-y", "--no-install", "--no-git"]);
  assert.ok(fs.existsSync(path.join(run.dir, "my-expo-app")));
});

test("--dir places the project at an explicit path", () => {
  const run = scaffold([
    "some-app",
    "--dir",
    "nested/custom-location",
    "--no-install",
    "--no-git",
  ]);
  assert.ok(fs.existsSync(path.join(run.dir, "nested/custom-location/package.json")));
});

test("--dry-run writes nothing", () => {
  const run = scaffold(["dry-app", "--dry-run", "-y"]);
  assert.ok(!fs.existsSync(path.join(run.dir, "dry-app")), "no directory created");
  assert.match(run.output, /Dry run/i);
});

test("--version prints just the version", () => {
  const run = scaffold(["--version"]);
  assert.match(run.stdout.trim(), /^\d+\.\d+\.\d+$/);
});

test("--help lists presets and features", () => {
  const run = scaffold(["--help"]);
  assert.match(run.stdout, /Presets/);
  assert.match(run.stdout, /minimal/);
  assert.match(run.stdout, /--no-location/);
  assert.match(run.stdout, /@varunindiit\/create-expo-starter/, "advertises the real package name");
});

// ── validation ──────────────────────────────────────────────────────────────

test("rejects an unknown preset", () => {
  const run = scaffold(["app", "--preset", "nope", "-y"], { expectFailure: true });
  assert.notEqual(run.status, 0);
  assert.match(run.output, /Unknown preset/);
});

test("rejects an unknown package manager", () => {
  const run = scaffold(["app", "--pm", "cargo", "-y"], { expectFailure: true });
  assert.notEqual(run.status, 0);
  assert.match(run.output, /Unknown package manager/);
});

test("rejects an invalid bundle id", () => {
  const run = scaffold(["app", "--bundle-id", "notreverse", "-y"], {
    expectFailure: true,
  });
  assert.notEqual(run.status, 0);
  assert.match(run.output, /Invalid bundle identifier/);
});

test("rejects an unknown flag", () => {
  const run = scaffold(["app", "--turbo", "-y"], { expectFailure: true });
  assert.notEqual(run.status, 0);
  assert.match(run.output, /Unknown option/);
});

test("rejects a flag with a missing value", () => {
  const run = scaffold(["app", "--bundle-id"], { expectFailure: true });
  assert.notEqual(run.status, 0);
  assert.match(run.output, /Missing value/);
});

test("rejects a project name that would corrupt app.json", () => {
  const run = scaffold(['My "Cool" App', "-y"], { expectFailure: true });
  assert.notEqual(run.status, 0);
  assert.match(run.output, /Invalid project name/);
});

test("refuses to overwrite a non-empty directory", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ces-smoke-"));
  tmpRoots.push(dir);
  fs.mkdirSync(path.join(dir, "taken-app"));
  fs.writeFileSync(path.join(dir, "taken-app", "keep.txt"), "important");

  const result = spawnSync(
    process.execPath,
    [CLI, "taken-app", "-y", "--no-install", "--no-git"],
    { cwd: dir, encoding: "utf8", env: { ...process.env, NO_COLOR: "1" } },
  );

  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}${result.stderr}`, /already exists and is not empty/);
  assert.equal(
    fs.readFileSync(path.join(dir, "taken-app", "keep.txt"), "utf8"),
    "important",
    "existing files untouched",
  );
});

test("creates the project in an existing but empty directory", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ces-smoke-"));
  tmpRoots.push(dir);
  fs.mkdirSync(path.join(dir, "empty-app"));

  const result = spawnSync(
    process.execPath,
    [CLI, "empty-app", "-y", "--no-install", "--no-git"],
    { cwd: dir, encoding: "utf8", env: { ...process.env, NO_COLOR: "1" } },
  );

  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.ok(fs.existsSync(path.join(dir, "empty-app", "package.json")));
});

// ── cleanup ─────────────────────────────────────────────────────────────────

process.on("exit", () => {
  for (const dir of tmpRoots) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

run("CLI scaffold smoke tests");
