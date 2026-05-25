import { UserLocation } from "@maplibre/maplibre-react-native";

export function UserLocationMarker() {
  return <UserLocation animated accuracy heading minDisplacement={1} />;
}
