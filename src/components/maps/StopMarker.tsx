import { memo } from "react";
import { StyleSheet, View } from "react-native";
import { Marker } from "@maplibre/maplibre-react-native";
import { Ionicons } from "@expo/vector-icons";
import type { NearbyStop } from "@/services/stops/stops.types";
import { colors } from "@/constants/colors";

interface StopMarkerProps {
  stop: NearbyStop;
  isSelected: boolean;
  onPress: (stop: NearbyStop) => void;
}

export const StopMarker = memo(function StopMarker({
  stop,
  isSelected,
  onPress,
}: StopMarkerProps) {
  const size = isSelected ? 40 : 36;
  const bg = stop.isStation
    ? isSelected
      ? colors.primary
      : colors.primaryDark
    : isSelected
      ? colors.primary
      : colors.white;
  const iconColor = stop.isStation || isSelected ? colors.white : colors.primary;
  const borderColor = isSelected ? colors.white : colors.borderLight;

  return (
    <Marker
      id={stop.id}
      lngLat={[stop.longitude, stop.latitude]}
      anchor="center"
      onPress={() => onPress(stop)}
    >
      <View
        style={[
          styles.marker,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: bg,
            borderColor,
            borderWidth: isSelected ? 2 : 1.5,
            transform: [{ scale: isSelected ? 1.1 : 1 }],
          },
        ]}
      >
        <Ionicons
          name={stop.isStation ? "train-outline" : "bus-outline"}
          size={size * 0.5}
          color={iconColor}
        />
      </View>
    </Marker>
  );
});

const styles = StyleSheet.create({
  marker: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
});
