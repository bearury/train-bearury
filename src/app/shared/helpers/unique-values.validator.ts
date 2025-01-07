import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { StationForm } from '@interfaces/station-form.interface';


//TODO нужна ли вообще!!!
export function uniqueValuesValidator(): ValidatorFn {
  return (control: AbstractControl<StationForm>): ValidationErrors | null => {
    const form = control as unknown as FormGroup<StationForm>;

    const uniqueValues = new Set([form.controls.city.value]);

    form.controls.connectedTo.controls.forEach(control => {
      if (control.value !== null) {
        uniqueValues.add(control.value.city);
      }
    });

    // // Если количество уникальных значений меньше, чем общее количество, значит есть повторы
    return form.controls.connectedTo.controls.length ? uniqueValues.size !== form.controls.connectedTo.controls.length + 1 ? { nonUnique: true } : null : { nonUnique: true };

  };
}
