import { create } from "zustand";
import type { RouteOption } from "@/services/routing/routing.types";

interface GuidanceState {
  isActive: boolean;
  routeOption: RouteOption | null;
  currentLegIndex: number;
  contextualMessage: string | null;
  followMode: boolean;
  isDeviated: boolean;
  rerouteWalkLine: { from: [number, number]; to: [number, number] } | null;

  startGuidance: (option: RouteOption) => void;
  nextStep: () => void;
  previousStep: () => void;
  endGuidance: () => void;
  setContextualMessage: (message: string | null) => void;
  setFollowMode: (value: boolean) => void;
  setDeviated: (value: boolean) => void;
  setRerouteWalkLine: (line: { from: [number, number]; to: [number, number] } | null) => void;
}

export const useGuidanceStore = create<GuidanceState>((set, get) => ({
  isActive: false,
  routeOption: null,
  currentLegIndex: 0,
  contextualMessage: null,
  followMode: false,
  isDeviated: false,
  rerouteWalkLine: null,

  startGuidance: (option) =>
    set({
      isActive: true,
      routeOption: option,
      currentLegIndex: 0,
      contextualMessage: null,
      followMode: true,
      isDeviated: false,
      rerouteWalkLine: null,
    }),

  nextStep: () => {
    const { routeOption, currentLegIndex } = get();
    if (!routeOption) return;
    if (currentLegIndex < routeOption.legs.length - 1) {
      set({ currentLegIndex: currentLegIndex + 1, contextualMessage: null });
    }
  },

  previousStep: () => {
    const { currentLegIndex } = get();
    if (currentLegIndex > 0) {
      set({ currentLegIndex: currentLegIndex - 1, contextualMessage: null });
    }
  },

  endGuidance: () =>
    set({
      isActive: false,
      routeOption: null,
      currentLegIndex: 0,
      contextualMessage: null,
      followMode: false,
      isDeviated: false,
      rerouteWalkLine: null,
    }),

  setContextualMessage: (message) => set({ contextualMessage: message }),
  setFollowMode: (value) => set({ followMode: value }),
  setDeviated: (value) => set({ isDeviated: value }),
  setRerouteWalkLine: (line) => set({ rerouteWalkLine: line }),
}));
