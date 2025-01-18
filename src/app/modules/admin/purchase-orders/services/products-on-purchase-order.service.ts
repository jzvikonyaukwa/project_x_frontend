import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";

@Injectable({
  providedIn: "root",
})
export class ProductsOnPurchaseOrderService {
  baseUrl: string = environment.baseUrl + "products-on-purchase-orders";

  constructor(private _http: HttpClient) {}

  public changeProductStatus(newStatus: string, id: number) {
    return this._http.patch(
      `${this.baseUrl}/change-status/${id}/new-status/${newStatus}`,
      {}
    );
  }
}
