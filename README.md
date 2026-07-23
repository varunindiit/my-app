# create-expo-starter (development repo)

This repository contains two things:

1. **The dev app** (repo root) — a runnable Expo SDK 56 app where all template
   code lives and is developed/tested. Run it like any Expo project.
2. **The published CLI** — [`create-expo-starter/`](create-expo-starter/), the
   npm package (`@varunindiit/create-expo-starter`) that scaffolds new projects
   from a bundled copy of this app.

```
.
├── src/                     # dev app source — the single source of truth
├── assets/                  # app icons / splash
├── scripts/
│   ├── sync-template.mjs    # mirrors the dev app into the CLI template
│   └── reset-project.js     # blank-slate helper (shipped with the template)
└── create-expo-starter/     # the npm package
    ├── bin/ lib/            # CLI (zero runtime dependencies)
    └── template/            # scaffolded output — generated, do not edit by hand
```

## Development workflow

```bash
npm install
npm start                 # develop and test in the root app (i / a / w)

npm run sync-template     # mirror src/, assets/ and configs into the template
cd create-expo-starter
npm test                  # scaffold smoke test (rename, env seeding, tokens)
```

**Always edit template code in the root app, then run `npm run sync-template`.**
The sync preserves the template's `__APP_*__` identity placeholders
(package.json name, app.json name/slug/scheme/bundle ids) and template-only
files (`app.config.js`, `env.example`, `eas.json`, `_gitignore`, README).

## Testing the CLI end-to-end

```bash
cd create-expo-starter
node bin/index.js my-test-app --no-install --no-git
```

## Publishing

Publishing is automated: create a GitHub Release whose tag matches the version
in `create-expo-starter/package.json` (e.g. `v1.1.0`) and the
[publish workflow](create-expo-starter/.github/workflows/publish.yml) pushes to
npm with provenance. Bump the version, sync, smoke-test, then release.

> Built for Expo SDK 56 — review https://docs.expo.dev/versions/v56.0.0/ before
> changing app code or upgrading dependencies.
