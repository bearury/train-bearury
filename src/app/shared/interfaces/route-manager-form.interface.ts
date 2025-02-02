import { FormArray, FormControl } from '@angular/forms';
import { CarriageEntity } from '@interfaces/carriage.interface';
import { Station } from '@interfaces/station.interface';


export interface RouteManagerForm {
  readonly stations: FormArray<FormControl<Station | null>>;
  readonly carriages: FormArray<FormControl<CarriageEntity | null>>;
}
