import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'enumToArray',
  pure: true
})
export class EnumToArrayPipe implements PipeTransform {
  transform(value: Object): string[] {
    return  Object.values(value);
  }
}
