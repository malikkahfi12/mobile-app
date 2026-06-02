import { create } from "zustand";
import type { MapCameraState } from "@/types/map.types";

type BottomSheetContent = "none" | "stopDetail" | "routingResult" | "planner" | "journeyDetail" | "routeDetail";

interface UIState {
  bottomSheetIndex: number;
  bottomSheetContent: BottomSheetContent;
  mapCamera: MapCameraState | null;

  setBottomSheet: (index: number, content?: BottomSheetContent) => void;
  closeBottomSheet: () => void;
  setMapCamera: (camera: MapCameraState) => void;
}

export const useUIStore = create<UIState>((set) => ({
  bottomSheetIndex: -1,
  bottomSheetContent: "none",
  mapCamera: null,

  setBottomSheet: (index, content) =>
    set((state) => ({
      bottomSheetIndex: index,
      bottomSheetContent: content ?? state.bottomSheetContent,
    })),

  closeBottomSheet: () =>
    set({ bottomSheetIndex: -1, bottomSheetContent: "none" }),

  setMapCamera: (camera) => set({ mapCamera: camera }),
}));
