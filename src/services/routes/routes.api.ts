import { get } from "../api/client";
import type { Route, RouteStop } from "./routes.types";

export async function getRouteById(id: string): Promise<Route> {
  return get<Route>(`/routes/${id}`);
}

export async function getRouteStops(id: string): Promise<RouteStop[]> {
  return get<RouteStop[]>(`/routes/${id}/stops`);
}
