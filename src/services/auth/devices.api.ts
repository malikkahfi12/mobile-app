import { get, del } from "../api/client";
import type { DeviceInfo } from "@/types/auth.types";

interface DevicesResponse {
  devices: DeviceInfo[];
}

export async function getDevices(): Promise<DeviceInfo[]> {
  const result = await get<DevicesResponse>("/auth/devices");
  return result.devices;
}

export async function revokeDevice(deviceId: string): Promise<void> {
  await del(`/auth/devices/${deviceId}`);
}
