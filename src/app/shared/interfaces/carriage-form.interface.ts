import { FormControl } from '@angular/forms';

export interface CarriageForm {
  readonly name: FormControl<string | null>;
  readonly rows: FormControl<string | null>;
  readonly leftSeats: FormControl<string | null>;
  readonly rightSeats: FormControl<string | null>;
}
