import { get } from "../api/client";
import type { RoutingResult, RoutingParams } from "./routing.types";

export async function planTrip(params: RoutingParams): Promise<RoutingResult> {
  return get<RoutingResult>("/routing", params as unknown as Record<string, unknown>);
}
