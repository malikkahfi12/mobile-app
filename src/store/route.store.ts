import { create } from "zustand";
import type { NearbyStop } from "@/services/stops/stops.types";
import type { RoutingResult } from "@/services/routing/routing.types";

interface RouteState {
  selectedStop: NearbyStop | null;
  selectedRouteId: string | null;
  journeyResult: RoutingResult | null;
  selectedRouteOptionIndex: number | null;

  setSelectedStop: (stop: NearbyStop | null) => void;
  setSelectedRouteId: (id: string | null) => void;
  setJourneyResult: (result: RoutingResult | null) => void;
  setSelectedRouteOptionIndex: (index: number | null) => void;
  clearSelection: () => void;
}

export const useRouteStore = create<RouteState>((set) => ({
  selectedStop: null,
  selectedRouteId: null,
  journeyResult: null,
  selectedRouteOptionIndex: null,

  setSelectedStop: (stop) => set({ selectedStop: stop }),
  setSelectedRouteId: (id) => set({ selectedRouteId: id }),
  setJourneyResult: (result) => set({ journeyResult: result }),
  setSelectedRouteOptionIndex: (index) =>
    set({ selectedRouteOptionIndex: index }),
  clearSelection: () =>
    set({
      selectedStop: null,
      selectedRouteId: null,
      journeyResult: null,
      selectedRouteOptionIndex: null,
    }),
}));
