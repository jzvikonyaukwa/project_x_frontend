import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { Observable } from "rxjs";
import { Consignor } from "../models/consignor";
import { SteelCoilPostDTO } from "@shared/models/steelCoilPostDTO";
import { ConsumablePostDTO } from "../../consumables/models/consumablePostDTO";
import { ConsignorSteelCoil } from "../models/consignor-steel-coils";
import { ConsignorConsumable } from "../models/consignor-consumables";

@Injectable({
  providedIn: "root",
})
export class ConsignorsService {
  private baseUrl = environment.baseUrl + "consignors";

  constructor(private _http: HttpClient) {}

  public getAllConsignors(): Observable<Consignor[]> {
    return this._http.get<Consignor[]>(`${this.baseUrl}`);
  }

  public createConsignor(consignor: Partial<Consignor>): Observable<Consignor> {
    return this._http.post<Consignor>(`${this.baseUrl}`, consignor);
  }

  public getConsignorSteelCoils(consignorId: number): Observable<ConsignorSteelCoil[]> {
    return this._http.get<ConsignorSteelCoil[]>(`${this.baseUrl}/consignor/${consignorId}/steel`);
  }

  public getConsignorConsumables(consignorId: number): Observable<ConsignorConsumable[]> {
    return this._http.get<ConsignorConsumable[]>(`${this.baseUrl}/consignor/${consignorId}/consumables`);
  }
}
