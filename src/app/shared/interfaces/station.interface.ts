import { StationEntity } from '@entitys/station.entity';

export interface Station extends Omit<StationEntity, 'connectedTo'> {
  readonly connectedTo: {
    readonly name: string,
    readonly distance: number,
  }[];
}
