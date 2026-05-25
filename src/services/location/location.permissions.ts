import * as Location from "expo-location";
import type { PermissionStatus } from "./location.types";

export async function requestForegroundPermission(): Promise<PermissionStatus> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status;
}

export async function getPermissionStatus(): Promise<PermissionStatus> {
  const { status } = await Location.getForegroundPermissionsAsync();
  return status;
}
