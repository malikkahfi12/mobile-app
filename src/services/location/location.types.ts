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

export type PermissionStatus = "granted" | "denied" | "undetermined";
