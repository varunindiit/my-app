#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const {
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
} = require("../lib/utils");
const { createPrompter } = require("../lib/prompt");
const {
  copyDir,
  applyReplacements,
  restoreDotfiles,
  prepareEnv,
  detectPackageManager,
  installDeps,
  gitInit,
} = require("../lib/scaffold");

const TEMPLATE_DIR = path.join(__dirname, "..", "template");

// ── arg parsing ──────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const opts = {
    name: undefined,
    bundleId: undefined,
    install: undefined, // undefined = ask
    git: undefined,
    yes: false,
  };
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") opts.help = true;
    else if (a === "--version" || a === "-v") opts.version = true;
    else if (a === "--yes" || a === "-y") opts.yes = true;
    else if (a === "--no-install") opts.install = false;
    else if (a === "--install") opts.install = true;
    else if (a === "--no-git") opts.git = false;
    else if (a === "--git") opts.git = true;
    else if (a === "--bundle-id") opts.bundleId = argv[++i];
    else if (a.startsWith("--bundle-id=")) opts.bundleId = a.split("=")[1];
    else if (a.startsWith("--")) warn(`Ignoring unknown flag: ${a}`);
    else positional.push(a);
  }
  if (positional.length) opts.name = positional[0];
  return opts;
}

function printHelp() {
  log(`
${c.bold("create-expo-starter")} — scaffold a production-ready Expo app

${c.bold("Usage")}
  npx create-expo-starter ${c.dim("[project-name] [options]")}

${c.bold("Options")}
  --bundle-id <id>   Reverse-DNS app identifier (e.g. com.acme.myapp)
  --no-install       Skip dependency installation
  --no-git           Skip git repository initialisation
  -y, --yes          Accept all defaults, no prompts
  -h, --help         Show this help
  -v, --version      Show version

${c.bold("Example")}
  npx create-expo-starter awesome-app --bundle-id com.acme.awesome
`);
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (opts.help) return printHelp();
  if (opts.version) {
    const pkg = require("../package.json");
    return log(pkg.version);
  }

  log("");
  log(`${c.magenta(c.bold("◆ create-expo-starter"))}`);
  log(c.dim("  Expo SDK 56 · expo-router · Redux Toolkit · TypeScript\n"));

  if (!fs.existsSync(TEMPLATE_DIR)) {
    err("Bundled template/ directory is missing — the package is corrupt.");
    process.exit(1);
  }

  const prompter = createPrompter();
  let projectName;
  let slug;
  let bundleId;

  try {
    // ── project name ──────────────────────────────────────────────────────
    projectName =
      opts.name ||
      (opts.yes
        ? "my-expo-app"
        : await prompter.ask("Project name", {
            defaultValue: "my-expo-app",
            validate: (v) =>
              isValidSlug(toSlug(v))
                ? true
                : "Use letters, numbers, spaces or hyphens.",
          }));

    slug = toSlug(projectName);
    if (!isValidSlug(slug)) {
      err(`Could not derive a valid project slug from "${projectName}".`);
      process.exit(1);
    }

    const target = resolveTarget(process.cwd(), slug);
    if (fs.existsSync(target) && fs.readdirSync(target).length > 0) {
      err(`Directory "${slug}" already exists and is not empty.`);
      process.exit(1);
    }

    // ── bundle id ─────────────────────────────────────────────────────────
    const bundleDefault = defaultBundleId(slug);
    bundleId =
      opts.bundleId ||
      (opts.yes
        ? bundleDefault
        : await prompter.ask("Bundle / package identifier", {
            defaultValue: bundleDefault,
            validate: (v) =>
              isValidBundleId(v)
                ? true
                : "Must be reverse-DNS, e.g. com.acme.myapp",
          }));

    if (!isValidBundleId(bundleId)) {
      err(`Invalid bundle identifier: ${bundleId}`);
      process.exit(1);
    }

    const displayName = toDisplayName(projectName);
    const scheme = toScheme(slug);

    // ── install / git decisions ───────────────────────────────────────────
    const wantInstall =
      opts.install !== undefined
        ? opts.install
        : opts.yes
        ? true
        : await prompter.confirm("Install dependencies now?", true);

    const wantGit =
      opts.git !== undefined
        ? opts.git
        : opts.yes
        ? true
        : await prompter.confirm("Initialise a git repository?", true);

    prompter.close();

    // ── summary ───────────────────────────────────────────────────────────
    log("");
    log(c.bold("  Creating project with:"));
    log(`    ${c.dim("name        ")} ${displayName}`);
    log(`    ${c.dim("slug        ")} ${slug}`);
    log(`    ${c.dim("scheme      ")} ${scheme}`);
    log(`    ${c.dim("bundle id   ")} ${bundleId}`);
    log(`    ${c.dim("location    ")} ${path.relative(process.cwd(), target) || "."}`);
    log("");

    // ── scaffold ──────────────────────────────────────────────────────────
    step("Copying template files…");
    copyDir(TEMPLATE_DIR, target);

    step("Applying project name everywhere…");
    const tokens = {
      // explicit placeholders (config files)
      "__APP_DISPLAY_NAME__": displayName,
      "__APP_SLUG__": slug,
      "__APP_SCHEME__": scheme,
      "__APP_BUNDLE_ID__": bundleId,
      // safety net for any literal leftovers from the source app
      "com.anonymous.my-app": bundleId,
      "my-app": slug,
      "myapp": scheme,
    };
    const changed = applyReplacements(target, tokens);
    restoreDotfiles(target);
    ok(`Updated ${changed} file${changed === 1 ? "" : "s"}.`);

    step("Setting up environment files…");
    prepareEnv(target);
    ok("Created .env from .env.example.");

    // ── deps ──────────────────────────────────────────────────────────────
    const pm = detectPackageManager();
    if (wantInstall) {
      step(`Installing dependencies with ${pm}… (this can take a minute)`);
      const installed = installDeps(target, pm);
      if (installed) ok("Dependencies installed.");
      else warn(`"${pm} install" failed — run it manually after.`);
    } else {
      warn("Skipped dependency installation.");
    }

    // ── git ───────────────────────────────────────────────────────────────
    if (wantGit) {
      step("Initialising git repository…");
      if (gitInit(target)) ok("Git repository initialised.");
      else warn("git init failed or git is not installed — skipped.");
    }

    // ── next steps ────────────────────────────────────────────────────────
    const rel = path.relative(process.cwd(), target) || ".";
    log("");
    log(c.green(c.bold("  ✔ Done! Your Expo app is ready.\n")));
    log(c.bold("  Next steps:"));
    log(`    ${c.cyan("cd")} ${rel}`);
    if (!wantInstall) log(`    ${c.cyan(pm)} install`);
    log(`    ${c.dim("# edit .env with your API URL / keys")}`);
    log(`    ${c.cyan(pm === "npm" ? "npm run" : pm)} start`);
    log("");
    log(c.dim("  Then press i (iOS), a (Android) or w (web) in the Expo CLI."));
    log(c.dim("  For native builds: npx eas-cli init && eas build --profile development\n"));
  } catch (e) {
    try {
      prompter.close();
    } catch {}
    err(e && e.message ? e.message : String(e));
    process.exit(1);
  }
}

main();
