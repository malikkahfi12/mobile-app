import { useQuery, skipToken } from "@tanstack/react-query";
import {
  getDeparturesByStop,
  getBatchDepartures,
} from "@/services/departures/departures.api";
import { queryKeys } from "@/hooks/queryKeys";
import type {
  Departure,
  BatchDeparturesRequest,
  BatchDeparturesResponse,
} from "@/services/departures/departures.types";

export function useDeparturesByStop(stopId: string | null, limit = 10) {
  return useQuery<Departure[]>({
    queryKey: queryKeys.departures.byStop(stopId ?? "", limit),
    queryFn: stopId ? () => getDeparturesByStop(stopId, limit) : skipToken,
    enabled: !!stopId,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 3,
  });
}

export function useBatchDepartures(params: BatchDeparturesRequest | null) {
  return useQuery<BatchDeparturesResponse>({
    queryKey: queryKeys.departures.batch(params?.stops ?? [], params?.limit),
    queryFn: params ? () => getBatchDepartures(params) : skipToken,
    enabled: !!params && params.stops.length > 0,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 3,
  });
}
