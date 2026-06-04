import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

export default function ExplorerScreen() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-white justify-center items-center px-8">
      <Ionicons name="compass-outline" size={64} color={colors.textTertiary} />
      <View className="h-6" />
      <Text className="text-2xl font-bold text-gray-800">
        {t("explorer.title")}
      </Text>
      <View className="h-2" />
      <Text className="text-base text-gray-400 text-center">
        {t("explorer.comingSoon")}
      </Text>
    </View>
  );
}
