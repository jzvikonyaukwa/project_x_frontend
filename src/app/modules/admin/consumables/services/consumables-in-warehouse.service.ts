import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { ConsumableInWarehouse } from '../models/consumableInWarehouse';
import { Observable } from 'rxjs';
import { InventoryBalance } from '../models/inventory-balance';
import { DateTime } from 'luxon';
import { Consumable } from '../models/consumable';

@Injectable({
  providedIn: 'root',
})
export class ConsumablesInWarehouseService {
  private readonly baseUrl = `${environment.baseUrl}consumables-in-warehouse`;

  private readonly http = inject(HttpClient);

  getAllConsumablesInWarehouse(warehouseId: number): Observable<ConsumableInWarehouse[]> {
    return this.http.get<ConsumableInWarehouse[]>(`${this.baseUrl}/warehouse/${warehouseId}`);
  }

  fetchConsumableHistory(
    warehouseID: number,
    consumableID: number,
    startDate: Date | null = null,
  ): Observable<InventoryBalance[]> {
    // build request get params
    let request = new HttpParams();
    // add startDate as a query parameter if it is not null
    if (startDate) {
      request = request.set('startDate', DateTime.fromJSDate(startDate).toISODate());
    }
    return this.http.get<InventoryBalance[]>(
      `${environment.baseUrl}consumables/${warehouseID}/history/${consumableID}`,
      {
        params: request,
      },
    );
  }

  fetchConsumableDetails(consumableID: number): Observable<Consumable> {
    return this.http.get<Consumable>(`${environment.baseUrl}consumables/${consumableID}/details`);
  }
}
