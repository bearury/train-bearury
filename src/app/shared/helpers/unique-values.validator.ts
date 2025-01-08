import { AbstractControl, FormArray, FormControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { StationForm } from '@interfaces/station-form.interface';
import { Station } from '@interfaces/station.interface';


export function uniqueValuesValidator(): ValidatorFn {
  return (control: AbstractControl<StationForm>): ValidationErrors | null => {
    const form = control.root as unknown as FormGroup<StationForm>;

    if (!form || !form.controls) {
      return null;
    }

    const uniqueValues = new Set<string>();

    const cityValue = form.controls.city.value;
    if (typeof cityValue === 'string' && cityValue.trim()) {
      uniqueValues.add(cityValue.trim());
    }

    const connectedToArray = form.controls.connectedTo as FormArray<FormControl<Station | null>>;

    connectedToArray.controls.forEach(control => {
      const connectedCity = control.value?.city;
      if (typeof connectedCity === 'string' && connectedCity.trim()) {
        uniqueValues.add(connectedCity.trim());
      }
    });

    const isUnique = uniqueValues.size === connectedToArray.controls.length + (cityValue ? 1 : 0);

    return isUnique ? null : { nonUnique: true };
  };
}
