# Contributing

Thanks for helping improve `create-expo-starter`.

## Repository layout

This repo holds two things:

```
.
├── src/, assets/, app.json …   the DEV APP — a runnable Expo project.
│                               This is the single source of truth for
│                               everything the template ships.
├── scripts/sync-template.mjs   mirrors the dev app into the CLI template
└── create-expo-starter/        the published npm package
    ├── bin/, lib/              the CLI (zero runtime dependencies)
    ├── scripts/                unit + smoke tests
    └── template/               GENERATED — never edit by hand
```

**Never edit `create-expo-starter/template/` directly.** It is regenerated from
the repo root, and CI fails if it has drifted. Edit the dev app, then run
`npm run sync-template`.

## Getting set up

```bash
npm install
npm start                 # run the dev app (press i / a / w)
npm run verify            # typecheck + lint + tests
```

## The change loop

```bash
# 1. Edit the dev app under src/
# 2. Prove it still works
npm run verify

# 3. Mirror it into the template
npm run sync-template

# 4. Prove the CLI still produces a working project
cd create-expo-starter
npm run test:all          # lint + unit + scaffold smoke tests
```

For anything touching dependencies or generated code, also do the real check:

```bash
node create-expo-starter/bin/index.js /tmp/probe --preset full -y --no-git
cd /tmp/probe && npm install && npm run verify
```

CI runs exactly this for all three presets.

## Adding an optional feature

Features live in `create-expo-starter/lib/features.js`. To add one:

1. Add an entry declaring its `files`, `deps`, `plugins`, `androidPermissions`
   and `infoPlistKeys`.
2. Add it to the `PRESETS` that should include it.
3. Guard any code that references it with markers so the tree still compiles
   when it is off:

   ```ts
   // #if myfeature
   import { thing } from "@/services/thing";
   // #endif
   ```

   In JSX, wrap the marker in braces: `{/* #if myfeature */}`. `// #else` is
   supported.

4. If disabling the feature would leave a dangling import, provide a stub in
   `create-expo-starter/template/stubs/` and declare it under `swap` — see how
   `i18n` swaps in a dependency-free `localization.ts`.
5. Add smoke-test coverage in `create-expo-starter/scripts/smoke.js`.

The `findDanglingImports` check in the smoke tests is what makes pruning safe:
it walks every generated file and asserts each relative and `@/` import
resolves. If you break the tree, it tells you which import and in which file.

## Conventions

- **Imports**: `@/*` for anything crossing a top-level `src/` folder, relative
  within one. ESLint enforces this.
- **Colours**: never import a palette directly. Use `useThemeColors()` or
  `makeStyles()` so components follow the active scheme. Both palettes must
  define the same tokens — the type system enforces it and a test double-checks.
- **Accessibility**: every interactive element needs a role, an accessible name
  and its state (`disabled`, `busy`, `checked`, `selected`).
- **Tests**: `render` from React Native Testing Library v14 is **async** — it
  must be awaited.

## Commits and releases

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/).

Releases are automated:

1. Bump the version in `create-expo-starter/package.json`.
2. Update `CHANGELOG.md`.
3. Run `npm run sync-template` and commit.
4. Create a GitHub Release whose tag matches the version (e.g. `v2.0.0`).

The publish workflow verifies the tag matches, the template is in sync, the
LICENSE ships in the tarball, and all tests pass — then publishes with npm
provenance. Use the workflow's `workflow_dispatch` trigger for a dry run.

## Reporting bugs

Include the CLI version (`npx @varunindiit/create-expo-starter --version`), your
Node version, your OS, and the exact command you ran. For scaffolding issues,
`--dry-run` output helps.
