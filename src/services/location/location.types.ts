export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface CurrentLocation {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  timestamp: number;
}

export interface WatchedLocation {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  heading: number | null;
  speed: number | null;
  altitude: number | null;
  timestamp: number;
}

export interface WatchConfig {
  guidanceMode?: boolean;
}

export type PermissionStatus = "granted" | "denied" | "undetermined";
