# PawPaw Mobile

Expo + React Native iOS client for PawPaw.

## Run

From the repo root:

```bash
npm run mobile:start:lan
```

From this directory:

```bash
npm run start -- --host lan
```

Press `i` in the Expo terminal to open the iOS Simulator, or scan the QR code with Expo Go on a physical iPhone.

## API Base URL

The app defaults to:

```txt
http://localhost:8080/api/v1
```

That works for the iOS Simulator when the Go API is running on the same Mac. For a physical iPhone, use your Mac LAN IP:

```bash
EXPO_PUBLIC_API_BASE_URL=http://YOUR_MAC_LAN_IP:8080/api/v1 npm run mobile:start:lan
```

Backend setup from repo root:

```bash
npm run db:up
npm run db:migrate
npm run db:seed
npm run api:dev
```

## Verification

```bash
npm run mobile:typecheck
cd apps/mobile && npx expo install --check
cd apps/mobile && npx expo export --platform web --output-dir /tmp/pawpaw-mobile-export
```
