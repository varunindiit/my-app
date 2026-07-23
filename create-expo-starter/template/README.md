# __APP_DISPLAY_NAME__

An [Expo](https://expo.dev) (SDK 56) app scaffolded with
[`create-expo-starter`](https://www.npmjs.com/package/@varunindiit/create-expo-starter).

## Get started

```bash
npm install        # if you skipped it during scaffolding
npm start          # then press i (iOS), a (Android) or w (web)
```

Environment values live in `.env` (seeded from `.env.example` for you). Edit it
to point at your API and add keys — see `src/services/Config.ts` for how values
resolve (`EXPO_PUBLIC_*` → `expo.extra` → fallbacks).

## Project structure

```
src/
├── app/             # expo-router routes (file-based navigation)
│   ├── _layout.tsx  #   root providers + declarative auth guard
│   ├── (auth)/      #   login flow — shown while logged out
│   └── (tabs)/      #   bottom-tab app — shown while logged in
├── components/      # reusable UI (Button, Input, Sheets, Cards, icons, …)
├── redux/           # Redux Toolkit store + feature slices
├── services/        # axios client, Config, MMKV storage, Google Places
├── theme/           # colors, fonts, spacing tokens
├── localization/    # i18next setup + en/fr resources
├── hooks/           # shared hooks (useCurrentLocation, …)
└── utils/           # constants + helpers
```

## Native builds (EAS)

`eas.json` ships with `development` / `preview` / `production` profiles wired
to `APP_ENV`:

```bash
npx eas-cli init
eas build --profile development
```

## Start from a blank slate

```bash
npm run reset-project
```

Moves the starter code to `example/` (or deletes it) and leaves a minimal
`src/app` to build on.

## Learn more

- [Expo SDK 56 docs](https://docs.expo.dev/versions/v56.0.0/)
- [expo-router file-based routing](https://docs.expo.dev/router/introduction/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
