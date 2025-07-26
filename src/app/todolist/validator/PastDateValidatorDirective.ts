import { Directive } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl, ValidationErrors } from '@angular/forms';

@Directive({
  selector: '[appPastDate]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: PastDateValidatorDirective,
      multi: true
    }
  ]
})
export class PastDateValidatorDirective implements Validator {

  validate(control: AbstractControl): ValidationErrors | null {
    const inputDate = new Date(control.value);
    const today = new Date();

    // Normalize time to avoid time-of-day mismatches
    inputDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (!control.value) return null; // Skip if field is empty (handled by required)

    return inputDate < today ? null : { notPastDate: true };
  }
}
