import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@environments/environment.development";
import { Observable } from "rxjs";
import { Consumable } from "../models/consumable";
import { ConsumableDetailsDTO } from "../models/consumableDetailsDTO";
import { ConsumableLowStockData } from "../models/consumableLowStockData";
import { ConsumableStockLevelToBeChecked } from "../models/consumableStockLevelToBeChecked";

@Injectable({
  providedIn: "root",
})
export class ConsumablesService {
  private baseUrl = environment.baseUrl + "consumables";

  constructor(private http: HttpClient) {}

  getAllConsumables(): Observable<Consumable[]> {
    return this.http.get<Consumable[]>(this.baseUrl);
  }

  getComsumableById(id: number): Observable<Consumable> {
    return this.http.get<Consumable>(`${this.baseUrl}/${id}`);
  }

  getConsumablesLowStock(): Observable<ConsumableLowStockData[]> {
    return this.http.get<ConsumableLowStockData[]>(`${this.baseUrl}/low-stock`);
  }

  getAllConsumablesInWarehouse(
    warehouseId: number
  ): Observable<ConsumableDetailsDTO[]> {
    return this.http.get<ConsumableDetailsDTO[]>(
      `${this.baseUrl}/warehouse/${warehouseId}`
    );
  }

  getAllConsumableDetails(): Observable<Consumable[]> {
    return this.http.get<Consumable[]>(`${this.baseUrl}/details`);
  }

  checkConsumableStockLevelIsEnough(
    consumablesToCheck: ConsumableStockLevelToBeChecked[]
  ): Observable<ConsumableStockLevelToBeChecked[]> {
    return this.http.post<ConsumableStockLevelToBeChecked[]>(
      `${this.baseUrl}/check-stock-level`,
      consumablesToCheck
    );
  }

  addConsumable(consumable: Consumable): Observable<Consumable> {
    return this.http.post<Consumable>(this.baseUrl, consumable);
  }

  updateConsumable(consumable: Consumable): Observable<Consumable> {
    return this.http.put<Consumable>(this.baseUrl + "/update", consumable);
  }
}
