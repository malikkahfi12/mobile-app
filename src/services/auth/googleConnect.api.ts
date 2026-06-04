import { post } from "@/services/api/client";
import type { GoogleIdentityInfo } from "@/types/google.types";

export async function connectGoogleAccount(
  idToken: string,
): Promise<GoogleIdentityInfo> {
  return post<GoogleIdentityInfo>("/auth/identities/google/connect", {
    idToken,
  });
}
