import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface GoogleRecoveryState {
  googleEmail: string | null;
  isConnected: boolean;
  setGoogleEmail: (email: string) => void;
  clearGoogleEmail: () => void;
}

export const useGoogleRecoveryStore = create<GoogleRecoveryState>()(
  persist(
    (set) => ({
      googleEmail: null,
      isConnected: false,
      setGoogleEmail: (email) => set({ googleEmail: email, isConnected: true }),
      clearGoogleEmail: () =>
        set({ googleEmail: null, isConnected: false }),
    }),
    {
      name: "google-recovery-store",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
