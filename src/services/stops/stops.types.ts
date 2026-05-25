export interface Stop {
  id: string;
  name: string;
  code: string;
  latitude: number;
  longitude: number;
  locationType?: number;
  isStation: boolean;
}

export interface NearbyStop extends Stop {
  distance_meters: number;
}

export interface StopWithDepartures extends Stop {
  departures: import("../departures/departures.types").Departure[];
}

export interface StopsSearchParams {
  q?: string;
  regionId?: string;
  isActive?: boolean;
}
