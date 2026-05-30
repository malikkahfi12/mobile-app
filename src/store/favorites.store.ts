import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface SavedStop {
  id: string;
  name: string;
  code: string | null;
  latitude: number;
  longitude: number;
  isStation: boolean;
  savedAt: number;
}

interface FavoritesState {
  _hasHydrated: boolean;
  stops: SavedStop[];
  addStop: (stop: SavedStop) => void;
  removeStop: (id: string) => void;
  isSaved: (id: string) => boolean;
  toggle: (stop: SavedStop) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      _hasHydrated: false,
      stops: [],

      addStop: (stop) =>
        set((state) => {
          if (state.stops.some((s) => s.id === stop.id)) return state;
          return {
            stops: [...state.stops, { ...stop, savedAt: Date.now() }],
          };
        }),

      removeStop: (id) =>
        set((state) => ({
          stops: state.stops.filter((s) => s.id !== id),
        })),

      isSaved: (id) => get().stops.some((s) => s.id === id),

      toggle: (stop) => {
        if (get().isSaved(stop.id)) {
          get().removeStop(stop.id);
        } else {
          get().addStop(stop);
        }
      },
    }),
    {
      name: "patheo-favorites",
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      migrate: () => ({ stops: [] }),
      partialize: (state) => ({ stops: state.stops }),
      onRehydrateStorage: () => () => {
        useFavoritesStore.setState({ _hasHydrated: true });
      },
    },
  ),
);
