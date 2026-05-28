import { create } from "zustand";
import type { Coordinates } from "@/services/location/location.types";

export interface TripLocation extends Coordinates {
  name: string;
  stopId?: string;
  address?: string;
  type: "stop" | "place" | "currentLocation";
  resolvedStopName?: string;
}

interface LocationState {
  currentLocation: Coordinates | null;
  hasPermission: boolean;
  isWatching: boolean;
  locationAccuracy: number | null;
  locationLoading: boolean;
  locationError: string | null;
  heading: number | null;
  speed: number | null;
  altitude: number | null;
  lastUpdateTimestamp: number | null;
  origin: TripLocation | null;
  destination: TripLocation | null;

  setCurrentLocation: (
    lat: number,
    lng: number,
    accuracy?: number | null,
  ) => void;
  setFullLocation: (
    lat: number,
    lng: number,
    accuracy: number | null,
    heading: number | null,
    speed: number | null,
    altitude: number | null,
    timestamp: number,
  ) => void;
  setPermission: (value: boolean) => void;
  setWatching: (value: boolean) => void;
  setLocationLoading: (value: boolean) => void;
  setLocationError: (value: string | null) => void;
  setOrigin: (location: TripLocation | null) => void;
  setDestination: (location: TripLocation | null) => void;
  swapOriginDestination: () => void;
  clearTrip: () => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  currentLocation: null,
  hasPermission: false,
  isWatching: false,
  locationAccuracy: null,
  locationLoading: false,
  locationError: null,
  heading: null,
  speed: null,
  altitude: null,
  lastUpdateTimestamp: null,
  origin: null,
  destination: null,

  setCurrentLocation: (lat, lng, accuracy) =>
    set({
      currentLocation: { latitude: lat, longitude: lng },
      locationAccuracy: accuracy ?? null,
    }),

  setFullLocation: (lat, lng, accuracy, heading, speed, altitude, timestamp) =>
    set({
      currentLocation: { latitude: lat, longitude: lng },
      locationAccuracy: accuracy,
      heading,
      speed,
      altitude,
      lastUpdateTimestamp: timestamp,
    }),

  setPermission: (value) => set({ hasPermission: value }),
  setWatching: (value) => set({ isWatching: value }),

  setLocationLoading: (value) => set({ locationLoading: value }),
  setLocationError: (value) => set({ locationError: value }),

  setOrigin: (location) => set({ origin: location }),
  setDestination: (location) => set({ destination: location }),

  swapOriginDestination: () =>
    set((state) => ({
      origin: state.destination,
      destination: state.origin,
    })),

  clearTrip: () => set({ origin: null, destination: null }),
}));
