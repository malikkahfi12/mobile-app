export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginatedMeta;
}

export interface GeoJSONPoint {
  type: "Point";
  coordinates: [number, number];
}

export interface GeoJSONLineString {
  type: "LineString";
  coordinates: [number, number][];
}
