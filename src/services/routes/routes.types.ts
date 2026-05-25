export interface Route {
  id: string;
  agencyId?: string;
  shortName: string;
  longName: string;
  color?: string;
  textColor?: string;
  isActive: boolean;
}

export interface RouteStop {
  id: string;
  name: string;
  code: string;
  latitude: number;
  longitude: number;
  isStation: boolean;
  sequence?: number;
}
