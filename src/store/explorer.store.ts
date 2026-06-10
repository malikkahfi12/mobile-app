import { create } from "zustand";
import type { ExplorePlaceItem, PlaceCategory } from "@/services/places/places.types";

interface ExplorerState {
  searchQuery: string;
  selectedCategory: PlaceCategory;
  selectedPlace: ExplorePlaceItem | null;

  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: PlaceCategory) => void;
  setSelectedPlace: (place: ExplorePlaceItem | null) => void;
  clearSearch: () => void;
}

export const useExplorerStore = create<ExplorerState>((set) => ({
  searchQuery: "",
  selectedCategory: "coffee",
  selectedPlace: null,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSelectedPlace: (place) => set({ selectedPlace: place }),
  clearSearch: () => set({ searchQuery: "" }),
}));
