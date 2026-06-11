import { create } from "zustand";
import type { MapCameraState } from "@/types/map.types";

type BottomSheetContent = "none" | "stopDetail" | "routingResult" | "planner" | "journeyDetail" | "routeDetail" | "busPicker";

interface UIState {
  bottomSheetContent: BottomSheetContent;
  mapCamera: MapCameraState | null;

  setBottomSheet: (content: BottomSheetContent) => void;
  closeBottomSheet: () => void;
  setMapCamera: (camera: MapCameraState) => void;
}

export const useUIStore = create<UIState>((set) => ({
  bottomSheetContent: "none",
  mapCamera: null,

  setBottomSheet: (content) =>
    set({ bottomSheetContent: content }),

  closeBottomSheet: () =>
    set({ bottomSheetContent: "none" }),

  setMapCamera: (camera) => set({ mapCamera: camera }),
}));
