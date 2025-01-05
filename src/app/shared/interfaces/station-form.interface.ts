import { FormArray, FormControl } from '@angular/forms';
import { Station } from '@interfaces/station.interface';

export interface StationForm {
  city: FormControl<string | null>;
  latitude: FormControl<string | null>;
  longitude: FormControl<string | null>;
  connectedTo: FormArray<FormControl<Station | null>>;
}
