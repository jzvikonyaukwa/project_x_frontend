import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { Width } from "@shared/models/width";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class WidthService {
  private baseUrl = environment.baseUrl + "widths";

  constructor(private http: HttpClient) {}

  getAllWidths(): Observable<Width[]> {
    return this.http.get<Width[]>(`${this.baseUrl}`);
  }

  getWidthForFraemcad(widths: Width[]): Width {
    return widths.find((width) => width.width === 182);
  }
  getWidthForSheet(widths: Width[]): Width {
    return widths.find((width) => width.width === 925);
  }
  getWidthForPurlin(widths: Width[]): Width {
    return widths.find((width) => width.width === 150);
  }
  getWidthForBatten(widths: Width[]): Width {
    return widths.find((width) => width.width === 103);
  }
}
