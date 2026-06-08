# Transitribe

Move smarter. Public transport navigation, built with Expo.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in:

- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/) — press `a`
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/) — press `i`
- [Expo Go](https://expo.dev/go) — scan the QR code

## Scripts

```bash
npm start        # Start Expo dev server
npm run android  # Start on Android
npm run ios      # Start on iOS
npm run lint     # Run ESLint
```

## Tech Stack

- Expo SDK 56
- React Native 0.85.3
- TypeScript
- Expo Router

## Project Structure

```
src/
  app/          # Routes and screens
  components/   # Reusable UI
  constants/    # Theme and assets
  data/         # Static data
  hooks/        # Custom hooks
  lib/          # Service helpers
  store/        # Zustand stores
  types/        # TypeScript types
```
