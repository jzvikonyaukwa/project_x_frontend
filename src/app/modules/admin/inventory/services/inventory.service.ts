import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { InventoryItem } from '../models/inventoryItem';
import { Observable } from 'rxjs';
import { InventoryItemDTO } from '../models/inventoryItemDTO';

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  private baseUrl = `${environment.baseUrl}inventory`;

  constructor(private _http: HttpClient) {}

  getInventoryItems(): Observable<InventoryItem[]> {
    return this._http.get<InventoryItem[]>(`${this.baseUrl}`);
  }

  getAllInventoryItemsInStock(): Observable<InventoryItem[]> {
    return this._http.get<InventoryItem[]>(`${this.baseUrl}/items-in-stock`);
  }

  getProjectInventoryInStock(projectId: number): Observable<InventoryItemDTO[]> {
    return this._http.get<InventoryItemDTO[]>(`${this.baseUrl}/items-for-project/${projectId}`);
  }

  getCreditNoteProjectInventory(projectId: number): Observable<InventoryItemDTO[]> {
    return this._http.get<InventoryItemDTO[]>(
      `${this.baseUrl}/items-for-credit-note-project/${projectId}`,
    );
  }
  getInventoryStockForProject(projectId: number): Observable<InventoryItem[]> {
    return this._http.get<InventoryItem[]>(`${this.baseUrl}/items-in-stock/${projectId}`);
  }
}
