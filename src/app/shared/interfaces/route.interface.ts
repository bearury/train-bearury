import { Station } from '@interfaces/station.interface';
import { Carriage } from '@interfaces/carriage.interface';

export interface Route {
  readonly id: string;
  name: string;
  readonly stations: Station[];
  readonly carriages: Carriage[];
}
