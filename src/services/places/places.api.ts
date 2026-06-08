import { get } from "../api/client";
import type {
  ExplorePlaceItem,
  PlaceDetailResponse,
  PlaceSearchParams,
  PlaceExploreParams,
} from "./places.types";

export function searchPlaces(
  params: PlaceSearchParams,
): Promise<ExplorePlaceItem[]> {
  return get<ExplorePlaceItem[]>(
    "/places/search",
    params as unknown as Record<string, unknown>,
  );
}

export function explorePlaces(
  params: PlaceExploreParams,
): Promise<ExplorePlaceItem[]> {
  return get<ExplorePlaceItem[]>(
    "/places/explore",
    params as unknown as Record<string, unknown>,
  );
}

export function getPlaceDetail(
  id: string,
): Promise<PlaceDetailResponse>;

export function getPlaceDetail(
  name: string,
  lat: number,
  lng: number,
): Promise<PlaceDetailResponse>;

export function getPlaceDetail(
  idOrName: string,
  lat?: number,
  lng?: number,
): Promise<PlaceDetailResponse> {
  if (lat !== undefined && lng !== undefined) {
    return get<PlaceDetailResponse>("/places/detail", {
      name: idOrName,
      lat,
      lng,
    });
  }
  return get<PlaceDetailResponse>("/places/detail", { id: idOrName });
}

export function reverseGeocode(
  lat: number,
  lng: number,
): Promise<string> {
  return get<string>("/places/reverse", { lat, lng });
}
