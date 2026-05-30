import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { QuickPlace } from "@/types/quickPlaces.types";

let _idCounter = 0;

function generateId(): string {
  _idCounter++;
  return `qp_${Date.now()}_${_idCounter}`;
}

interface QuickPlacesState {
  _hasHydrated: boolean;
  places: QuickPlace[];

  addPlace: (place: Omit<QuickPlace, "id" | "createdAt" | "updatedAt">) => QuickPlace;
  updatePlace: (id: string, updates: Partial<Omit<QuickPlace, "id" | "createdAt">>) => void;
  removePlace: (id: string) => void;
}

export const useQuickPlacesStore = create<QuickPlacesState>()(
  persist(
    (set, get) => ({
      _hasHydrated: false,
      places: [],

      addPlace: (input) => {
        const now = Date.now();
        const place: QuickPlace = {
          ...input,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          places: [...state.places, place],
        }));
        return place;
      },

      updatePlace: (id, updates) => {
        set((state) => ({
          places: state.places.map((p) =>
            p.id === id
              ? { ...p, ...updates, updatedAt: Date.now() }
              : p,
          ),
        }));
      },

      removePlace: (id) => {
        set((state) => ({
          places: state.places.filter((p) => p.id !== id),
        }));
      },
    }),
    {
      name: "transitribe-quick-places",
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      migrate: () => ({ places: [] }),
      partialize: (state) => ({ places: state.places }),
      onRehydrateStorage: () => () => {
        useQuickPlacesStore.setState({ _hasHydrated: true });
      },
    },
  ),
);
