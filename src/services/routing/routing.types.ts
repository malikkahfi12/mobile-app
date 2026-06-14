export type LegType = "WALK" | "TRANSIT" | "TRANSFER";

export interface Leg {
  type: LegType;
  fromStopId: string;
  toStopId: string;
  fromStopName: string;
  toStopName: string;
  fromCoordinates?: string;
  toCoordinates?: string;
  durationSeconds: number;
  distanceMeters?: number;
  routeId?: string | null;
  routeName?: string | null;
  tripId?: string;
  headsign?: string;
  departureTimeSeconds?: number;
  arrivalTimeSeconds?: number;
  alternativeRoutes?: { routeId: string; routeName: string }[];
  geometry?: { type: "LineString"; coordinates: [number, number][] };
}

export interface RouteOption {
  strategy: string;
  totalDurationSeconds: number;
  walkingDurationSeconds: number;
  waitingDurationSeconds: number;
  transferCount: number;
  legs: Leg[];
}

export interface RoutingResult {
  fromStopId: string;
  toStopId: string;
  fromStopName: string;
  toStopName: string;
  warnings?: string[];
  options: RouteOption[];
}

export interface RoutingParams {
  fromStopId: string;
  toStopId: string;
  departureTimeSeconds?: number;
}
