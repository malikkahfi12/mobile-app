import { get, post } from "../api/client";
import type {
  Departure,
  BatchDeparturesRequest,
  BatchDeparturesResponse,
} from "./departures.types";

export async function getDeparturesByStop(
  stopId: string,
  limit = 10,
): Promise<Departure[]> {
  return get<Departure[]>("/departures", { stopId, limit });
}

export async function getBatchDepartures(
  params: BatchDeparturesRequest,
): Promise<BatchDeparturesResponse> {
  return post<BatchDeparturesResponse>("/departures/batch", params);
}
