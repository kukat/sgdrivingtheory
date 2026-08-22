# Release

Store binaries go through EAS production. Sideload APKs and device smoke tests are local.

## Identity

- App: Driving Bible
- Expo project: `@kukat/btt` (`36eb122e-190d-43d6-ba90-8a6432f2e9cf`)
- Bundle / package: `me.cyao.sgdrivingtheory`
- App Store Connect: `6767448356`
- Support: https://driving-bible.cyao.win/
- Privacy: https://driving-bible.cyao.win/privacy/

`app.json` `version` is `1.0.0`. iOS `buildNumber` and Android `versionCode` come from EAS (`appVersionSource: remote`, production `autoIncrement`). Do not set those by hand.

Listing copy lives in `store.config.json` (Apple) and `store/play.json` (Play). Credentials for signing and submit sit on EAS, not in this repo.

`ios/` and `android/` are generated and gitignored.

## Local

Use this for a phone on the desk. Not TestFlight, not Play.

Debug (dev client, Metro):

```bash
npm install
npx expo run:ios
npx expo run:android
```

Sideload Android APK, same keystore as EAS, `preview` profile (`distribution: internal`):

```bash
npx eas-cli build --platform android --profile preview --local --non-interactive --output dist/driving-bible.apk
```

Install that APK over a previous preview build. Uninstall first if the signature or package data disagrees.

A local production AAB is possible (`--profile production --local`) but Play still needs `eas submit`. Prefer cloud production for store uploads.

## EAS (TestFlight and Play internal)

Logged in as `kukat`. Production profile. Submit profile of the same name sends iOS to TestFlight and Android to Play internal (`track: internal`, `releaseStatus: completed`).

```bash
npx eas-cli whoami
npm run lint
npx tsc --noEmit
```

Build both and queue submit:

```bash
EXPO_NO_KEYCHAIN=1 npx eas-cli build --platform all --profile production --auto-submit --non-interactive --no-wait
```

`EXPO_NO_KEYCHAIN=1` avoids a local Keychain error (36) on this machine.

Do not pass `--what-to-test`. Changelog on submit needs an Enterprise plan and the iOS submit will fail.

If iOS auto-submit fails after the builds are already queued, wait for the iOS build to finish, then:

```bash
npx eas-cli submit --platform ios --id <ios-build-id> --profile production --non-interactive --no-wait
```

One platform:

```bash
EXPO_NO_KEYCHAIN=1 npx eas-cli build --platform ios --profile production --auto-submit --non-interactive --no-wait
EXPO_NO_KEYCHAIN=1 npx eas-cli build --platform android --profile production --auto-submit --non-interactive --no-wait
```

Status:

```bash
npx eas-cli build:list --limit 5
npx eas-cli submit:list --limit 5
```

Builds: https://expo.dev/accounts/kukat/projects/btt/builds

Apple still processes a TestFlight binary after EAS submit shows `finished`. Play internal with `completed` is available to internal testers once Google finishes processing.

## After a listing change

Support and privacy URLs must stay on `driving-bible.cyao.win`. Rebuild is not required for copy-only listing edits. A new binary is required when `app.json` or native config changes.
