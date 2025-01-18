import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { Gauge } from "@shared/models/gauge";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class GaugesService {
  private baseUrl = environment.baseUrl + "gauges";

  constructor(private _http: HttpClient) {}

  public getAllGauges(): Observable<Gauge[]> {
    return this._http.get<Gauge[]>(this.baseUrl);
  }
}
