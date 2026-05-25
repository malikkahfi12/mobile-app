import { memo, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { Marker } from "@maplibre/maplibre-react-native";
import type { Leg } from "@/services/routing/routing.types";
import { parseCoordinatePair } from "@/lib/map.helpers";
import { colors } from "@/constants/colors";

interface TransferStopMarkerProps {
  legs: Leg[];
}

const SIZE = 16;
const HALF = SIZE / 2;

interface TransferPoint {
  index: number;
  coord: [number, number];
}

export const TransferStopMarker = memo(function TransferStopMarker({
  legs,
}: TransferStopMarkerProps) {
  const points = useMemo<TransferPoint[]>(() => {
    if (legs.length <= 1) return [];
    return legs
      .slice(0, -1)
      .map((leg, i) => {
        const coord = parseCoordinatePair(leg.toCoordinates);
        return coord ? { index: i, coord } : null;
      })
      .filter((p): p is TransferPoint => p !== null);
  }, [legs]);

  if (points.length === 0) return null;

  return (
    <>
      {points.map((point) => (
        <Marker
          key={`transfer-${point.index}`}
          id={`transfer-${point.index}`}
          lngLat={point.coord}
          anchor="center"
        >
          <View
            style={[
              styles.marker,
              { backgroundColor: colors.textTertiary },
            ]}
          >
            <View style={styles.dot} />
          </View>
        </Marker>
      ))}
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
    borderWidth: 2,
    borderColor: colors.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.white,
  },
});
