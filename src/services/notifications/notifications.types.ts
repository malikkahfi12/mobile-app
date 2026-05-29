export type NotificationPermissionStatus =
  | "granted"
  | "denied"
  | "undetermined";

export interface TripNotificationData {
  tripId: string;
  destinationName: string;
}

export const TRIP_NOTIFICATION_ID = "patheo-active-trip";
export const CATEGORY_TRIP = "trip-active";
export const ACTION_END_TRIP = "end_trip";
export const ACTION_NEXT_STEP = "next_step";
