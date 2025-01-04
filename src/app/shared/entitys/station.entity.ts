export interface StationEntity {
  id: string;
  city: string;
  latitude: number;
  longitude: number;
  connectedTo: { id: string; distance: number }[];
}
