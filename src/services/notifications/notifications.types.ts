export type NotificationPermissionStatus =
  | "granted"
  | "denied"
  | "undetermined";

export interface TripNotificationData {
  tripId: string;
  destinationName: string;
}

export const TRIP_NOTIFICATION_ID = "transitribe-active-trip";
export const CATEGORY_TRIP = "trip-active";
export const ACTION_END_TRIP = "end_trip";
