You are an expert React Native + Expo engineer helping build Transitribe, a public transport navigation app.

You write clean, simple, maintainable code. You prioritize clarity over unnecessary abstraction.

---

## Project Overview

Transitribe is a public transport navigation app built with Expo.

The app helps users navigate cities using public transport. Features will include:

- interactive maps with transit routes
- real-time bus/train tracking
- trip planning
- saved routes and stops
- local favorites and history

---

## Tech Stack

- Expo (latest stable)
- React Native
- TypeScript
- Expo Router
- NativeWind / Tailwind CSS
- Zustand
- AsyncStorage
- react-native-maps or @rnmapbox/maps (for map integration)
- i18next (v26) + react-i18next (v17) — localization
- expo-localization — device locale detection

Do not introduce new major libraries unless there is a strong reason.

---

## Development Philosophy

1. Understand the user request.
2. Check this file before coding.
3. Keep the implementation simple.
4. Avoid overengineering.
5. Prefer readable code over clever code.
6. Build the smallest useful version first.
7. Refactor only when repetition or complexity appears.

---

## Architecture Guidelines

```txt
src/
  app/            # Routes and screens only
  components/     # Reusable UI components
  constants/      # Colors, theme, image imports
  data/           # Static data (transit stops, mock routes)
  hooks/          # Custom hooks
  lib/            # External service helpers (maps, API)
  store/          # Zustand stores
  types/          # TypeScript type definitions
assets/           # Images, icons, fonts
```

---

## UI Implementation Rules

When building UI:

- Match the provided design exactly — pixel-perfectly
- Match layout, spacing, padding, fonts, colors, border radius, shadows
- Do not approximate or simplify unless explicitly asked

## Styling Rules

Use NativeWind tailwindcss classes strictly. Do not use `StyleSheet` unless the component or scenario is listed as an exception.

### StyleSheet Exceptions

Use `StyleSheet` or inline styles for:

| Component / Scenario | Why |
|---|---|
| SafeAreaView | className not supported |
| Button | Only supports `title` and `onPress` |
| KeyboardAvoidingView | Behavior props not supported by className |
| Modal | `visible`, `transparent` props |
| ScrollView | `contentContainerStyle`, `indicatorStyle` |
| Animated.View | Animated style values |
| Dynamic styles | Calculated at runtime |
| Platform-specific styles | iOS-only or Android-only props |
| Shadow (iOS/Android) | Different syntax per platform |

### SafeAreaView Example

```tsx
import { SafeAreaView } from "react-native-safe-area-context";

function MyScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* content */}
    </SafeAreaView>
  );
}
```

---

## Image Rule

Use centralized image imports.

1. Check if `constants/images.ts` exists.
2. If it does not, create it.
3. Import and export all app images from `constants/images.ts`.
4. Use images through the centralized object.

---

## State Management (Zustand)

### Store Structure

- One store per domain — small, focused stores. No giant monolith.
- File naming: `*.store.ts` under `src/store/`
- Each store exports a single hook: `export const useXStore = create<XState>((set) => ({...}))`
- Use a single `State` interface combining state fields + actions (Zustand v5 pattern)
- Import shared types from `@/services/` — never redefine types locally

### Reading State (Selectors)

Always use a selector function to avoid unnecessary re-renders:

```ts
// ✅ Good — single value selector
const isReady = useAppStore((s) => s.isReady);

// ✅ Good — action selector
const setReady = useAppStore((s) => s.setReady);

// ❌ Bad — destructuring (re-renders on any state change)
const { isReady, setReady } = useAppStore();
```

For selecting multiple values from the same store, use `useShallow`:

```ts
import { useShallow } from "zustand/shallow";

const { lat, lng } = useLocationStore(
  useShallow((s) => ({
    lat: s.currentLocation?.latitude,
    lng: s.currentLocation?.longitude,
  })),
);
```

### Writing State

`set()` performs a shallow merge (like `Object.assign`). Always pass a partial state object:

```ts
// Simple update
setPermission: (value) => set({ hasPermission: value }),

// Derived update (depends on previous state)
swapOriginDestination: () =>
  set((state) => ({
    origin: state.destination,
    destination: state.origin,
  })),
```

- Use `set({ key: value })` for direct updates
- Use `set((state) => ({...}))` when the new value depends on previous state
- Never mutate state directly — `set()` creates a new reference
- Atomic updates: set all related fields in one `set()` call (e.g., location + accuracy together)

### Setting State Outside Components

Use `store.getState()` + `store.setState()` outside React components (e.g., in services, callbacks):

```ts
import { useLocationStore } from "@/store/location.store";

// In a non-React callback/service function:
useLocationStore.getState().setCurrentLocation(lat, lng, accuracy);
```

Never call `getState()` inside a component render — use a selector instead.

### Server vs Client State

| Type | Tool | Example |
|---|---|---|
| Server data | `@tanstack/react-query` | Stops, departures, routing results |
| Client UI state | Zustand | Selected stop, search query, bottom sheet index |
| Transient UI | React `useState` | Input focus, animation values, local toggle |

- Never duplicate server data in Zustand — React Query IS the cache
- Zustand owns UI selections (which stop is tapped, which route is selected)
- If a value comes from an API, it belongs in `useQuery`

### Store Inventory

| Store | Purpose | Key Fields |
|---|---|---|
| `app.store.ts` | App lifecycle | `isReady`, `errorMessage` |
| `location.store.ts` | GPS + trip locations | `currentLocation`, `origin`, `destination`, `hasPermission` |
| `search.store.ts` | Search bar state | `query`, `isOpen` |
| `route.store.ts` | Selected stop/route | `selectedStop`, `selectedRouteId` |
| `ui.store.ts` | Bottom sheet + map camera | `bottomSheetIndex`, `mapCamera` |
| `locale.store.ts` | Language preference | `locale`, `setLocale` |

### When to Create a New Store

Create a new store when:
- The state domain is unrelated to existing stores
- Existing stores would exceed 15 fields/actions
- The state has distinct consumers (different UI surfaces)

Do NOT create a new store when:
- The state is temporary (use `useState`)
- The data comes from an API (use `useQuery`)
- A single boolean or string (add to the closest related store)

### Persistence (Future)

When persistence is needed, wrap with `persist` middleware:

```ts
import { persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useAppStore = create(
  persist(
    (set) => ({...}),
    { name: "app-store", storage: createJSONStorage(() => AsyncStorage) },
  ),
);
```

Stores using persistence via AsyncStorage: `locale.store.ts`, `googleRecovery.store.ts`, `favorites.store.ts`, `quickPlaces.store.ts`.

---

## Internationalization (i18n)

### Tech Stack

- **i18next** (v26) — framework-agnostic i18n engine
- **react-i18next** (v17) — React bindings, `useTranslation()` hook
- **expo-localization** — device locale detection

### Architecture

```
src/
  lib/
    i18n.ts                        # initI18n(), setLocale(), isSupportedLocale(), helpers
    i18n/
      resources/
        en.json                     # English strings (~227 keys, 20 namespaces)
        id.json                     # Indonesian translations
  store/
    locale.store.ts                 # Persisted locale preference (AsyncStorage)
  types/
    i18n.d.ts                       # TypeScript augmentation for t() autocomplete
```

### Initialization

i18next is initialized **explicitly** in `_layout.tsx`'s boot sequence — no module-level side effects:

```ts
import { detectDeviceLocale, initI18n } from "@/lib/i18n";

useEffect(() => {
  initI18n(detectDeviceLocale());
  // ... configureGoogleSignIn, boot, etc
}, []);
```

The persisted locale (from AsyncStorage) syncs to i18next via `persist.onRehydrateStorage` in the locale store. This handles the case where the user previously selected a language different from their device locale.

### Translation Key Structure

All keys live under the `common` namespace, organized by domain:

| Namespace | Purpose |
|---|---|
| `common` | Shared buttons, labels, badges, generic errors |
| `navigation` | Tab/screen titles |
| `onboarding` | Onboarding flow |
| `settings` | Settings screen rows |
| `language` | Language picker strings |
| `recovery` | Recovery & Security screen |
| `devices` | Device management |
| `logout` | Logout dialog |
| `explorer` | Explorer placeholder |
| `home` | Home screen messages |
| `planner` | Route planning UI |
| `routes` | Route options, details |
| `stops` | Stop detail, nearby stops |
| `journey` | Journey detail sheet |
| `guidance` | Navigation guidance, instruction templates |
| `quickPlaces` | Quick places, icon picker |
| `location` | GPS / permission error messages |
| `time` | Relative time formatting |
| `errors` | Error boundary, fallbacks |
| `accessibility` | Accessibility labels |

### Adding a New String

Follow this 3-step rule in order:

1. Add the key to `src/lib/i18n/resources/en.json` under the appropriate namespace
2. Add the translation to `src/lib/i18n/resources/id.json` (same key, Indonesian text)
3. Use it in code:

```tsx
// React components — useTranslation() hook
import { useTranslation } from "react-i18next";

function MyScreen() {
  const { t } = useTranslation();
  return <Text>{t("common.cancel")}</Text>;
}
```

```ts
// Non-React code (hooks, libs, services) — i18n singleton
import i18n from "@/lib/i18n";

export function someHelper() {
  return i18n.t("time.justNow");
}
```

### Template Interpolation

Use `{{variableName}}` syntax for dynamic values:

```json
{ "boardToward": "Board {{routeName}} toward {{headsign}}" }
{ "minutesAgo": "{{count}} minutes ago" }
```

```ts
i18n.t("time.minutesAgo", { count: 5 });              // "5 minutes ago"
i18n.t("guidance.boardToward", { routeName: "B12", headsign: "Central" });
// "Board B12 toward Central"
```

### TypeScript Autocomplete

`src/types/i18n.d.ts` augments react-i18next's types by reading all keys from `en.json`. After adding a new key, TypeScript automatically provides autocompletion for `t("...")` across the entire codebase.

### Changing Language

```tsx
// From the language picker
const setLocale = useLocaleStore((s) => s.setLocale);
setLocale("id"); // switches to Indonesian, persists to AsyncStorage via Zustand persist
```

The locale store's `setLocale` calls `i18n.changeLanguage()` internally. On app restart, `persist.onRehydrateStorage` re-syncs the stored locale to i18next.

### Adding a New Language

1. Create `src/lib/i18n/resources/<code>.json` — mirror `en.json` structure
2. Add to `SUPPORTED_LOCALES` in `src/lib/i18n.ts`
3. Add to `LOCALE_LABELS` in `src/lib/i18n.ts`
4. Add to `resources` in `initI18n()` in `src/lib/i18n.ts`
5. Add to `LANGUAGES` array in `src/app/language.tsx`

### Rules

- Always add keys to **both** `en.json` and `id.json` simultaneously — never add to just one
- Use `useTranslation()` in React components; `i18n.t()` (singleton import) in non-React code
- Add `t` to dependency arrays of `useCallback`/`useMemo`/`useEffect` when used inside them
- Do NOT translate API error messages shown directly to the user (they're already user-facing from the server)
- Do NOT translate developer-facing strings (log messages, console output, storybook labels)

---

## TypeScript Rules

- Strict mode enabled
- Avoid `any`
- Keep types simple and readable

---

## Code Simplicity

- Avoid overengineering
- Refactor only when needed
- Do not create one-off components too early

---

## Linting and Validation

Run:

```bash
npm run lint
npm run typecheck
```

Fix errors before finishing.

---

## Important Constraints

- No database for this version
- Use hardcoded data for transit stops/routes initially
- Use Zustand for state
- Use AsyncStorage for persistence
- Use server/API only for secure operations
- Never read `.env` — it contains secrets. To understand environment variables, read `.env.example` instead

---

## Before Every Feature

- Read this file
- Follow it strictly
- Build clean, simple, maintainable code
