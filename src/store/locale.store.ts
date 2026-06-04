import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { detectDeviceLocale, setLocale, type SupportedLocale } from "@/lib/i18n";

interface LocaleState {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: detectDeviceLocale(),
      setLocale: (locale) => {
        set({ locale });
        setLocale(locale);
      },
    }),
    {
      name: "locale-store",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state?.locale) {
          setLocale(state.locale);
        }
      },
    },
  ),
);
