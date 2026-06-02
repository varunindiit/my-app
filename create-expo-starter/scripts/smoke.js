#!/usr/bin/env node
"use strict";

// End-to-end smoke test: scaffold a project into a temp dir (no install / git)
// and assert the rename + env setup happened correctly. Used by `npm test`
// and CI. Exits non-zero on the first failed assertion.

const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

let failures = 0;
function assert(cond, msg) {
  if (cond) {
    console.log(`  \x1b[32m✔\x1b[0m ${msg}`);
  } else {
    console.error(`  \x1b[31m✖ ${msg}\x1b[0m`);
    failures += 1;
  }
}

const cli = path.join(__dirname, "..", "bin", "index.js");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "ces-smoke-"));

try {
  const res = spawnSync(
    process.execPath,
    [
      cli,
      "Smoke Test App",
      "--bundle-id",
      "com.smoke.testapp",
      "--no-install",
      "--no-git",
    ],
    { cwd: tmp, stdio: "inherit" }
  );
  assert(res.status === 0, "CLI exited successfully");

  const proj = path.join(tmp, "smoke-test-app");
  assert(fs.existsSync(proj), "project directory created from slug");

  const pkg = JSON.parse(fs.readFileSync(path.join(proj, "package.json"), "utf8"));
  assert(pkg.name === "smoke-test-app", "package.json name renamed");

  const appJsonRaw = fs.readFileSync(path.join(proj, "app.json"), "utf8");
  const app = JSON.parse(appJsonRaw).expo;
  assert(app.name === "Smoke Test App", "app.json display name set");
  assert(app.slug === "smoke-test-app", "app.json slug set");
  assert(app.scheme === "smoketestapp", "app.json scheme set");
  assert(
    app.ios.bundleIdentifier === "com.smoke.testapp",
    "iOS bundleIdentifier set"
  );
  assert(app.android.package === "com.smoke.testapp", "Android package set");

  assert(fs.existsSync(path.join(proj, "app.config.js")), "app.config.js present");
  assert(fs.existsSync(path.join(proj, "eas.json")), "eas.json present");
  assert(fs.existsSync(path.join(proj, ".gitignore")), ".gitignore restored");
  assert(!fs.existsSync(path.join(proj, "_gitignore")), "_gitignore removed");
  assert(fs.existsSync(path.join(proj, ".env.example")), ".env.example restored");
  assert(fs.existsSync(path.join(proj, ".env")), ".env seeded");
  assert(!fs.existsSync(path.join(proj, "env.example")), "env.example renamed");

  // No leftover placeholders or original app identifiers anywhere.
  const leftovers = [];
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        walk(full);
      } else if (/\.(ts|tsx|js|jsx|json|md)$/.test(e.name)) {
        const t = fs.readFileSync(full, "utf8");
        if (/__APP_[A-Z_]+__|com\.anonymous\.my-app|"my-app"/.test(t)) {
          leftovers.push(path.relative(proj, full));
        }
      }
    }
  })(proj);
  assert(
    leftovers.length === 0,
    `no leftover placeholders/old names${
      leftovers.length ? " (found: " + leftovers.join(", ") + ")" : ""
    }`
  );
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

if (failures > 0) {
  console.error(`\n\x1b[31mSmoke test FAILED (${failures} assertion(s)).\x1b[0m`);
  process.exit(1);
}
console.log("\n\x1b[32mSmoke test passed.\x1b[0m");
