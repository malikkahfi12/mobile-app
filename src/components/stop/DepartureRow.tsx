import { memo, useCallback, useMemo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Departure } from "@/services/departures/departures.types";
import { colors } from "@/constants/colors";

interface DepartureRowProps {
  departure: Departure;
  onPress?: (routeId: string) => void;
}

function formatRelativeTime(seconds: number): string {
  const now = new Date();
  const nowSeconds =
    now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  let diff = seconds - nowSeconds;

  if (diff < 0) diff += 24 * 3600;
  if (diff < 60) return "now";
  if (diff < 3600) return `in ${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `in ${Math.floor(diff / 3600)}h`;
  return "";
}

export const DepartureRow = memo(function DepartureRow({
  departure,
  onPress,
}: DepartureRowProps) {
  const relativeTime = useMemo(
    () => formatRelativeTime(departure.departureSeconds),
    [departure.departureSeconds],
  );
  const isTappable = !!departure.routeId && !!onPress;

  const handlePress = useCallback(() => {
    if (departure.routeId && onPress) {
      onPress(departure.routeId);
    }
  }, [departure.routeId, onPress]);

  const content = (
    <>
      <View className="flex-1 mr-3">
        <Text
          className="text-base font-semibold text-gray-900"
          numberOfLines={1}
        >
          {departure.routeName}
        </Text>
        <Text className="mt-0.5 text-sm text-gray-500" numberOfLines={1}>
          → {departure.headsign}
        </Text>
      </View>

      <View className="items-end">
        <Text className="text-base font-bold text-gray-900">
          {departure.departureTime}
        </Text>
        <Text className="text-xs text-primary font-medium">
          {relativeTime}
        </Text>
        <View className="mt-0.5 rounded-full bg-primary/10 px-2 py-0.5">
          <Text className="text-[10px] font-semibold text-primary">
            {departure.mode}
          </Text>
        </View>
        {isTappable && (
          <Ionicons
            name="chevron-forward"
            size={14}
            color={colors.textTertiary}
            style={{ marginTop: 2 }}
          />
        )}
      </View>
    </>
  );

  if (isTappable) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        className="flex-row items-center px-4 py-3 border-b border-gray-50"
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View className="flex-row items-center px-4 py-3 border-b border-gray-50">
      {content}
    </View>
  );
});
