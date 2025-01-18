import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "filter",
  standalone: true,
})
export class FilterPipe implements PipeTransform {
  transform(value: any, search?: string): any {
    if (!value) return [];
    if (search == "") return value;

    return value.filter((it) => {
      return it.clientName.toLowerCase().startsWith(search.toLowerCase());
    });
  }
}
