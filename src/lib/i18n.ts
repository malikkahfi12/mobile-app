import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { getLocales } from "expo-localization";
import en from "./i18n/resources/en.json";
import id from "./i18n/resources/id.json";

const SUPPORTED_LOCALES = ["en", "id"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

const LOCALE_LABELS: Record<SupportedLocale, string> = {
  en: "English",
  id: "Indonesian",
};

export { LOCALE_LABELS };

export function isSupportedLocale(value: string): value is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export function detectDeviceLocale(): SupportedLocale {
  const code = getLocales()[0]?.languageCode ?? "en";
  return isSupportedLocale(code) ? code : "en";
}

i18n.use(initReactI18next).init({
  resources: {
    en: { common: en },
    id: { common: id },
  },
  lng: detectDeviceLocale(),
  fallbackLng: "en",
  ns: ["common"],
  defaultNS: "common",
  interpolation: {
    escapeValue: false,
  },
});

export function setLocale(locale: SupportedLocale): void {
  i18n.changeLanguage(locale);
}

export function getLocale(): SupportedLocale {
  return isSupportedLocale(i18n.language) ? i18n.language : "en";
}

export default i18n;
