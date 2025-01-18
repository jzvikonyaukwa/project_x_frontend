import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { Observable } from "rxjs";
import { ConsumableSource } from "../models/consumableSource";

@Injectable({
  providedIn: "root",
})
export class ConsumableSourcesService {
  private baseUrl = environment.baseUrl + "consumable-sources";

  constructor(private http: HttpClient) {}

  getAllConsumableSources(): Observable<ConsumableSource[]> {
    return this.http.get<ConsumableSource[]>(this.baseUrl);
  }
}
