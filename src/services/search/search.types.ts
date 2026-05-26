export interface SearchStopResult {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: "stop";
}

export interface SearchPlaceResult {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: "place";
  provider: string;
}

export type SearchResultItem = SearchStopResult | SearchPlaceResult;

export interface UnifiedSearchResponse {
  query: string;
  stops: SearchStopResult[];
  places: SearchPlaceResult[];
}

export interface UnifiedSearchParams {
  q: string;
  lat?: number;
  lng?: number;
  limit?: number;
}
