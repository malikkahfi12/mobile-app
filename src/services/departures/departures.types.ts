export interface Departure {
  tripId: string;
  routeId: string;
  routeName: string;
  headsign: string;
  departureTime: string;
  departureSeconds: number;
  mode: string;
}

export interface BatchDeparturesRequest {
  stops: string[];
  limit?: number;
}

export type BatchDeparturesResponse = Record<string, Departure[]>;
