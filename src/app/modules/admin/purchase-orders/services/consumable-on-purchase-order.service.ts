import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { Observable } from "rxjs";
import { PurchaseOrder } from "../models/purchaseOrders";

@Injectable({
  providedIn: "root",
})
export class ConsumableOnPurchaseOrderService {
  baseUrl: string = environment.baseUrl + "consumable-on-purchase-order";

  constructor(private _http: HttpClient) {}

  public changeConsumableOnPurchaseOrderStatus(
    newStatus: string,
    id: number
  ): Observable<PurchaseOrder> {
    return this._http.patch<PurchaseOrder>(
      `${this.baseUrl}/change-status/${id}/new-status/${newStatus}`,
      {}
    );
  }
}
