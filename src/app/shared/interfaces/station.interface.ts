import { StationEntity } from '@entitys/station.entity';

export interface Station extends Omit<StationEntity, 'connectedTo'> {
  connectedTo: {
    name: string,
    distance: number,
  }[];
}
