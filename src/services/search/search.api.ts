import { get } from "../api/client";
import type { UnifiedSearchResponse, UnifiedSearchParams } from "./search.types";

export async function unifiedSearch(
  params: UnifiedSearchParams,
): Promise<UnifiedSearchResponse> {
  return get<UnifiedSearchResponse>(
    "/search",
    params as unknown as Record<string, unknown>,
  );
}
