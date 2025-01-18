import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { Warehouse } from "./warehouse";
import { Observable, tap } from "rxjs";
import { StocksDTO } from "../../../shared/models/stockDetailsDTO";

@Injectable({
  providedIn: "root",
})
export class WarehouseService {
  private baseUrl = environment.baseUrl + "warehouses";

  constructor(private http: HttpClient) {}

  public getAllWarehouses(): Observable<Warehouse[]> {
    return this.http.get<Warehouse[]>(this.baseUrl + "/all-warehouses");
  }

  public getStockFromConsignmentWarehouse(
    warehouseeId
  ): Observable<StocksDTO[]> {
    return this.http.get<StocksDTO[]>(
      this.baseUrl + "/warehouse-stock/" + warehouseeId
    );
  }

  getWarehouseStock(warehouseId: number): Observable<StocksDTO[]> {
    return this.http.get<StocksDTO[]>(
      `${this.baseUrl}/warehouse-stock/${warehouseId}`
    );
  }

    getAllSteelCoilsForProduct(
      productName: string
    ): Observable<StocksDTO[]> {
      let width: number;

      console.log(productName);

      switch (productName) {
        case 'sheet':
          width = 925;
          break;
        case 'purlin':
          width = 150;
          break;
        case 'batten':
          width = 103;
          break;
        case 'framecad':
          width = 182;
          break;
        default:
          throw new Error('Invalid product name');
      }

      return this.http.get<StocksDTO[]>(
          `${this.baseUrl}/stock/product/1/${width}`
      );
    }
}
