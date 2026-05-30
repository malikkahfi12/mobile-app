import { memo } from "react";
import { StyleSheet, View } from "react-native";
import { Marker } from "@maplibre/maplibre-react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/colors";

interface PlaceMarkerProps {
  id: string;
  coordinate: [number, number];
}

export const PlaceMarker = memo(function PlaceMarker({
  id,
  coordinate,
}: PlaceMarkerProps) {
  return (
    <Marker id={id} lngLat={coordinate} anchor="center">
      <View style={styles.marker}>
        <Ionicons name="location" size={18} color={colors.white} />
      </View>
    </Marker>
  );
});

const SIZE = 32;

const styles = StyleSheet.create({
  marker: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: colors.warning,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});
