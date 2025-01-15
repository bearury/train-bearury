import { FormControl } from '@angular/forms';

export interface CarriageForm {
  readonly name: FormControl<string | null>;
  readonly rows: FormControl<number | null>;
  readonly leftSeats: FormControl<number | null>;
  readonly rightSeats: FormControl<number | null>;
  readonly backLeftSeats: FormControl<number[] | null>;
  readonly backRightSeats: FormControl<number[] | null>;
}
