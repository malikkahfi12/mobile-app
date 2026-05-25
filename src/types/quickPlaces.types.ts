export type QuickPlaceIcon =
  | "home"
  | "briefcase"
  | "school"
  | "heart"
  | "location"
  | "train"
  | "bus"
  | "pin"
  | "cafe"
  | "star";

export interface QuickPlace {
  id: string;
  name: string;
  icon: QuickPlaceIcon;
  latitude: number;
  longitude: number;
  nearbyStopId?: string;
  nearbyStopName?: string;
  createdAt: number;
  updatedAt: number;
}
