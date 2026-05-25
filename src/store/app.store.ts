import { create } from "zustand";

interface AppState {
  isReady: boolean;
  errorMessage: string | null;
  isOnline: boolean;
  isInternetReachable: boolean | null;
  setReady: (value: boolean) => void;
  setError: (message: string) => void;
  clearError: () => void;
  setOnlineStatus: (isOnline: boolean, isInternetReachable: boolean | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isReady: false,
  errorMessage: null,
  isOnline: true,
  isInternetReachable: true,

  setReady: (value) => set({ isReady: value }),
  setError: (message) => set({ errorMessage: message }),
  clearError: () => set({ errorMessage: null }),
  setOnlineStatus: (isOnline, isInternetReachable) =>
    set({ isOnline, isInternetReachable }),
}));
