import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { useLocationStore } from "@/store/location.store";
import { useUIStore } from "@/store/ui.store";
import { useExplorerStore } from "@/store/explorer.store";
import { resolveToStop } from "@/hooks/search/resolveToStop";
import type { PlaceDetailResponse } from "@/services/places/places.types";

export function usePlannerFromPlace(place: PlaceDetailResponse | null) {
  const { t } = useTranslation();
  const [isRouting, setIsRouting] = useState(false);
  const setOrigin = useLocationStore((s) => s.setOrigin);
  const setDestination = useLocationStore((s) => s.setDestination);
  const setBottomSheet = useUIStore((s) => s.setBottomSheet);

  const handleRouteHere = useCallback(async () => {
    if (!place || isRouting) return;
    setIsRouting(true);

    const currentLocation = useLocationStore.getState().currentLocation;

    if (currentLocation) {
      setOrigin({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        name: t("planner.currentLocation"),
        type: "currentLocation",
      });

      resolveToStop(currentLocation.latitude, currentLocation.longitude).then(
        (nearest) => {
          const origin = useLocationStore.getState().origin;
          if (origin?.type !== "currentLocation") return;
          if (nearest) {
            setOrigin({
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
              name: t("planner.currentLocation"),
              stopId: nearest.id,
              resolvedStopName: nearest.name,
              type: "currentLocation",
            });
          }
        },
      );
    }

    setDestination({
      latitude: place.lat,
      longitude: place.lng,
      name: place.name,
      address: place.address,
      type: "place",
    });

    resolveToStop(place.lat, place.lng).then((nearest) => {
      const dest = useLocationStore.getState().destination;
      if (dest?.name !== place.name) return;
      if (nearest) {
        setDestination({
          latitude: place.lat,
          longitude: place.lng,
          name: place.name,
          address: place.address,
          stopId: nearest.id,
          resolvedStopName: nearest.name,
          type: "place",
        });
      }
    });

    useExplorerStore.getState().setSelectedPlace(null);
    setBottomSheet("planner");
    router.replace("/home" as any);
    setIsRouting(false);
  }, [place, isRouting, setOrigin, setDestination, setBottomSheet, t]);

  return { handleRouteHere, isRouting };
}
