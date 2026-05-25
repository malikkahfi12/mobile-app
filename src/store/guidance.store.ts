import { create } from "zustand";
import type { RouteOption } from "@/services/routing/routing.types";

interface GuidanceState {
  isActive: boolean;
  routeOption: RouteOption | null;
  currentLegIndex: number;

  startGuidance: (option: RouteOption) => void;
  nextStep: () => void;
  previousStep: () => void;
  endGuidance: () => void;
}

export const useGuidanceStore = create<GuidanceState>((set, get) => ({
  isActive: false,
  routeOption: null,
  currentLegIndex: 0,

  startGuidance: (option) =>
    set({ isActive: true, routeOption: option, currentLegIndex: 0 }),

  nextStep: () => {
    const { routeOption, currentLegIndex } = get();
    if (!routeOption) return;
    if (currentLegIndex < routeOption.legs.length - 1) {
      set({ currentLegIndex: currentLegIndex + 1 });
    }
  },

  previousStep: () => {
    const { currentLegIndex } = get();
    if (currentLegIndex > 0) {
      set({ currentLegIndex: currentLegIndex - 1 });
    }
  },

  endGuidance: () =>
    set({ isActive: false, routeOption: null, currentLegIndex: 0 }),
}));
