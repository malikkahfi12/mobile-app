import { useState, useCallback } from "react";
import { getCurrentPosition } from "@/services/location/location.service";
import { useLocationStore } from "@/store/location.store";

export function useCurrentLocation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setLocation = useLocationStore((s) => s.setCurrentLocation);
  const setLoading = useLocationStore((s) => s.setLocationLoading);
  const setLocationError = useLocationStore((s) => s.setLocationError);

  const fetchLocation = useCallback(async () => {
    setIsLoading(true);
    setLoading(true);
    setError(null);
    setLocationError(null);

    try {
      const location = await getCurrentPosition();
      setLocation(location.latitude, location.longitude, location.accuracy);
      return location;
    } catch (e) {
      const rawMsg = e instanceof Error ? e.message : "";

      const msg = rawMsg === "SERVICES_DISABLED"
        ? "Location services are disabled. Enable in device Settings."
        : rawMsg === "TIMEOUT"
          ? "GPS signal too weak. Move outdoors or check location settings."
          : rawMsg || "Failed to get location.";

      setError(msg);
      setLocationError(msg);
      return null;
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  }, [setLocation, setLoading, setLocationError]);

  return { fetchLocation, isLoading, error };
}
