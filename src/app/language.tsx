import { LOCALE_LABELS, type SupportedLocale } from "@/lib/i18n";
import { useLocaleStore } from "@/store/locale.store";
import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

const LANGUAGES: { code: SupportedLocale; nativeLabel: string }[] = [
  { code: "en", nativeLabel: LOCALE_LABELS.en },
  { code: "id", nativeLabel: LOCALE_LABELS.id },
];

export default function LanguageScreen() {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);

  return (
    <View className="flex-1 bg-gray-50">
      <View className="mx-4 mt-6 overflow-hidden rounded-xl bg-white">
        {LANGUAGES.map((lang, i) => {
          const isSelected = locale === lang.code;
          const isLast = i === LANGUAGES.length - 1;

          return (
            <View key={lang.code}>
              <TouchableOpacity
                onPress={() => setLocale(lang.code)}
                activeOpacity={0.7}
                className="flex-row items-center px-4 py-3.5"
              >
                <Text className="flex-1 text-[15px] font-semibold text-gray-900">
                  {lang.nativeLabel}
                </Text>
                {isSelected && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color="#F28500"
                  />
                )}
              </TouchableOpacity>
              {!isLast && <View className="mx-4 border-b border-gray-100" />}
            </View>
          );
        })}
      </View>
    </View>
  );
}
