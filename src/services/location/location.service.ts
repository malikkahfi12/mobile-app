import * as Location from "expo-location";
import type { CurrentLocation } from "./location.types";

class LocationError extends Error {
  code: string;

  constructor(code: string) {
    super(code);
    this.code = code;
    this.name = "LocationError";
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new LocationError("TIMEOUT")), ms),
    ),
  ]);
}

export async function getLastKnownPosition(): Promise<CurrentLocation | null> {
  const position = await Location.getLastKnownPositionAsync();

  if (!position) return null;

  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy ?? null,
    timestamp: position.timestamp,
  };
}

export async function getCurrentPosition(): Promise<CurrentLocation> {
  const hasServices = await Location.hasServicesEnabledAsync();

  if (!hasServices) {
    throw new LocationError("SERVICES_DISABLED");
  }

  try {
    const position = await withTimeout(
      Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      }),
      10000,
    );

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy ?? null,
      timestamp: position.timestamp,
    };
  } catch (e) {
    if (e instanceof LocationError && e.code === "TIMEOUT") {
      const lastKnown = await withTimeout(
        Location.getLastKnownPositionAsync(),
        5000,
      );

      if (lastKnown) {
        return {
          latitude: lastKnown.coords.latitude,
          longitude: lastKnown.coords.longitude,
          accuracy: lastKnown.coords.accuracy ?? null,
          timestamp: lastKnown.timestamp,
        };
      }
    }

    throw e;
  }
}
