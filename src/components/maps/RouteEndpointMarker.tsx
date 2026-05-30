import { memo, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { Marker } from "@maplibre/maplibre-react-native";
import { Ionicons } from "@expo/vector-icons";
import type { RouteOption } from "@/services/routing/routing.types";
import { parseCoordinatePair } from "@/lib/map.helpers";
import { colors } from "@/constants/colors";

interface RouteEndpointMarkerProps {
  option: RouteOption;
}

const SIZE = 28;
const HALF = SIZE / 2;

export const RouteEndpointMarker = memo(function RouteEndpointMarker({
  option,
}: RouteEndpointMarkerProps) {
  const legs = option.legs;

  const originCoord = useMemo(() => {
    if (legs.length === 0) return null;
    return parseCoordinatePair(legs[0].fromCoordinates);
  }, [legs]);

  const destCoord = useMemo(() => {
    if (legs.length === 0) return null;
    const lastLeg = legs[legs.length - 1];
    return parseCoordinatePair(lastLeg.toCoordinates);
  }, [legs]);

  return (
    <>
      {originCoord && (
        <Marker
          id="route-origin"
          lngLat={originCoord}
          anchor="center"
        >
          <View
            style={[
              styles.marker,
              { backgroundColor: colors.success },
            ]}
          >
            <Ionicons
              name="location"
              size={16}
              color={colors.white}
            />
          </View>
        </Marker>
      )}
      {destCoord && (
        <Marker
          id="route-destination"
          lngLat={destCoord}
          anchor="center"
        >
          <View
            style={[
              styles.marker,
              { backgroundColor: colors.error },
            ]}
          >
            <Ionicons
              name="flag"
              size={14}
              color={colors.white}
            />
          </View>
        </Marker>
      )}
    </>
  );
});

const styles = StyleSheet.create({
  marker: {
    width: SIZE,
    height: SIZE,
    borderRadius: HALF,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});
