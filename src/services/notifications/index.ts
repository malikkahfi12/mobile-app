export { setupNotifications } from "./notifications.service";
export { requestPermissions, getPermissionStatus } from "./notifications.service";
export { registerTripCategory, onTripAction } from "./notifications.service";
export type { TripAction } from "./notifications.service";
export {
  notifyTripStarted,
  notifyTripEnded,
  updateTripNotification,
} from "./notifications.trip";
export { notifyUpcomingTransfer, notifyNearDestination } from "./notifications.trip";
export type {
  NotificationPermissionStatus,
  TripNotificationData,
} from "./notifications.types";
export {
  TRIP_NOTIFICATION_ID,
  CATEGORY_TRIP,
  ACTION_END_TRIP,
  ACTION_NEXT_STEP,
} from "./notifications.types";
