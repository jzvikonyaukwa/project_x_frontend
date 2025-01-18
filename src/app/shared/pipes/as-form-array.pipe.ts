import { Pipe, PipeTransform } from '@angular/core';
import {FormArray, FormGroup} from "@angular/forms";

@Pipe({
  name: 'asFormArray'
})
export class AsFormArrayPipe implements PipeTransform {
  transform(value: FormArray): FormArray<FormGroup> {
    return value as FormArray<FormGroup>;
  }
}
