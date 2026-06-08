export interface ExplorePlaceItem {
  id: string;
  source: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

export interface PlaceDetailResponse extends ExplorePlaceItem {
  nearestStop: {
    id: string;
    name: string;
    distanceMeters: number;
  } | null;
  actions: {
    canRoute: boolean;
  };
}

export type PlaceCategory =
  | "place"
  | "food"
  | "coffee"
  | "shopping"
  | "parks"
  | "hotels";

export interface PlaceSearchParams {
  q: string;
  bbox?: string;
  lat?: number;
  lng?: number;
  limit?: number;
  lang?: string;
}

export interface PlaceExploreParams {
  bbox: string;
  category?: PlaceCategory;
  limit?: number;
}

export interface PlaceSearchMeta {
  query: string;
  count: number;
}

export interface PlaceExploreMeta {
  bbox: string;
  count: number;
}
