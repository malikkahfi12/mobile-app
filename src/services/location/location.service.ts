import * as Location from "expo-location";
import type { CurrentLocation, WatchConfig, WatchedLocation } from "./location.types";
import { WATCH_INTERVAL_MS, WATCH_INTERVAL_MS_GUIDANCE } from "@/constants/location";

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

export async function startLocationWatch(
  config: WatchConfig,
  callback: (location: WatchedLocation) => void,
): Promise<Location.LocationSubscription> {
  const isGuidance = config.guidanceMode ?? false;
  const interval = isGuidance ? WATCH_INTERVAL_MS_GUIDANCE : WATCH_INTERVAL_MS;
  const accuracy = isGuidance
    ? Location.Accuracy.BestForNavigation
    : Location.Accuracy.Balanced;

  return Location.watchPositionAsync(
    {
      accuracy,
      timeInterval: interval,
      distanceInterval: 1,
      mayShowUserSettingsDialog: false,
    },
    (position) => {
      callback({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy ?? null,
        heading: position.coords.heading ?? null,
        speed: position.coords.speed ?? null,
        altitude: position.coords.altitude ?? null,
        timestamp: position.timestamp,
      });
    },
  );
}

export async function stopLocationWatch(
  subscription: Location.LocationSubscription | null,
): Promise<void> {
  if (subscription) {
    subscription.remove();
  }
}
