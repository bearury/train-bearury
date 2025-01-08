import { FormArray, FormControl } from '@angular/forms';
import { Station } from '@interfaces/station.interface';

export interface StationForm {
  readonly city: FormControl<string | null>;
  readonly latitude: FormControl<string | null>;
  readonly longitude: FormControl<string | null>;
  readonly connectedTo: FormArray<FormControl<Station | null>>;
}
