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

Currently **no store uses persistence** — all state is in-memory.

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

---

## Before Every Feature

- Read this file
- Follow it strictly
- Build clean, simple, maintainable code
