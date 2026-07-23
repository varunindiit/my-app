# create-expo-starter

A CLI that scaffolds a **production-ready Expo (SDK 56) app** in seconds. Answer
one prompt (the project name) and you get a fully wired, renamed project that
runs immediately — no extra setup.

```bash
npx @varunindiit/create-expo-starter
# or
npx @varunindiit/create-expo-starter my-cool-app --bundle-id com.acme.cool
```

## What you get

A complete, scalable architecture copied from a real app:

```
src/
├── app/                 # expo-router routes (file-based navigation)
│   ├── _layout.tsx      #   root navigator + global providers + auth guard
│   ├── (auth)/          #   auth flow (login, …) — shown when logged out
│   └── (tabs)/          #   bottom-tab app — shown when logged in
├── components/          # reusable UI: Button, Input, Text, Header, Container,
│                        # BottomSheet, ImagePickerSheet, Common/*, Icon, …
├── redux/               # Redux Toolkit store + feature slices (auth, app, …)
├── services/            # axios api client, Config, storage (MMKV), places
├── theme/               # colors, fonts, spacing, typography
├── localization/        # i18next setup + en/fr resources
├── hooks/               # shared hooks (useCurrentLocation, …)
├── utils/               # constants + helper functions
└── assets/              # fonts, images, svg icons (SVG-as-component support)
```

### Highlights

- **expo-router** file-based navigation with a declarative
  `Stack.Protected` **auth guard** — the auth flow and the tab app are mounted
  based on `state.auth.isLoggedIn`, no manual redirects.
- **Bottom tabs** via a custom `BottomTabBar`.
- **Redux Toolkit** store pre-wired with feature slices.
- **axios** API layer with token interceptor + `mocked()` helper, centralised
  `Config`, and **MMKV** storage.
- **Theme system** (colors / fonts / spacing) and **i18n** (i18next).
- **SVG support** via `react-native-svg-transformer` (import `.svg` as a
  component) — Metro + TypeScript already configured.
- **Environment config**: dynamic `app.config.js` + `.env` (auto-seeded from
  `.env.example`) with a layered, typed `Config` helper — `EXPO_PUBLIC_*` vars
  for client-safe values plus `expo.extra` (via `expo-constants`) for build-time
  config and EAS secrets.
- **EAS build** ready: `eas.json` with `development` / `preview` / `production`
  profiles wired to `APP_ENV`.
- **TypeScript strict**, path alias `@/*` → `src/*`.
- Reanimated 4, gesture-handler, safe-area, keyboard-controller, flash-message
  and other common packages preinstalled.

## CLI behaviour

When you run the CLI it:

1. **Asks for the project name** (and a bundle identifier, with a sensible
   default).
2. Creates a new project directory and copies the template.
3. **Automatically replaces the project name everywhere** —
   `package.json` name, `app.json` (`expo.name`, `slug`, `scheme`), the iOS
   `bundleIdentifier`, the Android `package`, and any other references.
4. Optionally installs dependencies and initialises git.

### Options

| Flag                 | Description                                   |
| -------------------- | --------------------------------------------- |
| `[project-name]`     | Project name (positional). Prompted if omitted |
| `--bundle-id <id>`   | Reverse-DNS identifier, e.g. `com.acme.app`   |
| `--no-install`       | Skip dependency installation                  |
| `--no-git`           | Skip git initialisation                       |
| `-y, --yes`          | Accept all defaults, no prompts               |
| `-h, --help`         | Show help                                     |

## After scaffolding

```bash
cd <project-name>
npm install      # if you skipped --install
npm start        # then press i / a / w
```

> Built for Expo SDK 56. Review the versioned docs at
> https://docs.expo.dev/versions/v56.0.0/ before upgrading.

## License

MIT
