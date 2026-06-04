import axios from "axios";
import { apiConfig } from "@/services/api/config";
import type {
  RecoveryGoogleResponse,
  RecoveryRegisterDeviceRequest,
  RecoveryRegisterDeviceResponse,
} from "@/types/auth.types";

export async function requestRecoveryToken(
  idToken: string,
): Promise<RecoveryGoogleResponse> {
  const response = await axios.post(
    `${apiConfig.apiUrl}/auth/recovery/google`,
    { idToken },
    {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiConfig.apiKey,
      },
    },
  );

  const body = response.data;
  if (body?.success) return body.data as RecoveryGoogleResponse;
  throw new Error(
    body?.error?.message || "Failed to verify your Google account.",
  );
}

export async function registerRecoveryDevice(
  recoveryToken: string,
  params: RecoveryRegisterDeviceRequest,
): Promise<RecoveryRegisterDeviceResponse> {
  const response = await axios.post(
    `${apiConfig.apiUrl}/auth/recovery/register-device`,
    params,
    {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiConfig.apiKey,
        Authorization: `Bearer ${recoveryToken}`,
      },
    },
  );

  const body = response.data;
  if (body?.success) return body.data as RecoveryRegisterDeviceResponse;
  throw new Error(
    body?.error?.message || "Failed to register your device.",
  );
}
