import { memo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import type { Stop } from "@/services/stops/stops.types";
import type { SearchStopResult } from "@/services/search/search.types";
import { colors } from "@/constants/colors";

interface SearchResultCardProps {
  stop: Stop | SearchStopResult;
  onPress: () => void;
}

export const SearchResultCard = memo(function SearchResultCard({
  stop,
  onPress,
}: SearchResultCardProps) {
  const { t } = useTranslation();
  const isStation = "isStation" in stop ? stop.isStation : false;
  const code = "code" in stop ? stop.code : undefined;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center border-b border-gray-100 px-4 py-3"
    >
      <View
        className={`h-9 w-9 items-center justify-center rounded-full ${
          isStation ? "bg-primary/20" : "bg-primary/10"
        }`}
      >
        <Ionicons
          name={isStation ? "train-outline" : "bus-outline"}
          size={18}
          color={colors.primary}
        />
      </View>

      <View className="ml-3 flex-1">
        <Text
          className="text-[15px] font-semibold text-gray-900"
          numberOfLines={1}
        >
          {stop.name}
        </Text>
        {code ? (
          <Text className="text-xs text-gray-400" numberOfLines={1}>
            {code}
          </Text>
        ) : null}
      </View>

      <View className="flex-row items-center">
        <View
          className={`mr-2 rounded-full px-2 py-0.5 ${
            isStation ? "bg-primary/15" : "bg-gray-100"
          }`}
        >
          <Text
            className={`text-[10px] font-semibold ${
              isStation ? "text-primary" : "text-gray-500"
            }`}
          >
            {isStation ? t("common.station") : t("common.stop")}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
      </View>
    </TouchableOpacity>
  );
});
