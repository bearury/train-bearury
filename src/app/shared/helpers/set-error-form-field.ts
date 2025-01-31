import { AbstractControl, FormGroup } from '@angular/forms';

export const setErrorFormFieldError = <T extends { [K in keyof T]: AbstractControl<unknown, unknown> }>(form: FormGroup<T>): void => {
  Object.keys(form.controls).forEach(key => {
    if (form.get(key)?.valid) {
      form.get(key)?.markAsUntouched();
    } else {
      form.get(key)?.markAsTouched();
    }
  });
};

