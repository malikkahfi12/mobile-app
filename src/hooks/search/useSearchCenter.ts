import { useMemo } from "react";
import { useUIStore } from "@/store/ui.store";
import { useLocationStore } from "@/store/location.store";

export function useSearchCenter(): { lat: number; lng: number } | null {
  const mapCamera = useUIStore((s) => s.mapCamera);
  const currentLocation = useLocationStore((s) => s.currentLocation);

  return useMemo(() => {
    if (mapCamera) {
      const [lng, lat] = mapCamera.center;
      return { lat, lng };
    }

    if (currentLocation) {
      return {
        lat: currentLocation.latitude,
        lng: currentLocation.longitude,
      };
    }

    return null;
  }, [mapCamera, currentLocation]);
}
