import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "environments/environment.development";
import { Observable } from "rxjs";
import { StocksDTO } from "../models/stockDetailsDTO";
import { StocksOnOrderDTO } from "../models/stocksOnOrderDTO";
import { SteelCoilsInStock } from "../models/steelCoilsInStock";
import { StockMovementData } from "app/modules/admin/dashboard/stock-movement/models/stockMovementData";

@Injectable({
  providedIn: "root",
})
export class StocksService {
  private readonly baseUrl = `${environment.baseUrl}stocks`;

  private readonly httpClient = inject(HttpClient);
  
  getAllStockOnHand(): Observable<StocksDTO[]> {
    return this.httpClient.get<StocksDTO[]>(`${this.baseUrl}/in-stock`);
  }

  getStockOnOrder(): Observable<StocksOnOrderDTO[]> {
    return this.httpClient.get<StocksOnOrderDTO[]>(
      `${this.baseUrl}/stock-on-order`
    );
  }

  getAllStock(): Observable<SteelCoilsInStock[]> {
    return this.httpClient.get<SteelCoilsInStock[]>(this.baseUrl);
  }

  getStockMovementData(): Observable<StockMovementData[]> {
    return this.httpClient.get<StockMovementData[]>(`${this.baseUrl}/movement`);
  }
}
