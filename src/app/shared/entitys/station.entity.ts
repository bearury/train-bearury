export interface StationEntity {
  readonly id: string;
  readonly city: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly connectedTo: { id: string; distance: number }[];
}
