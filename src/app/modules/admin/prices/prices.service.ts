import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { Observable } from "rxjs";
import { PricesAndProductDTO } from "./models/pricesAndProductDTO";
import { Price } from "@shared/models/price";

@Injectable({
  providedIn: "root",
})
export class PricesService {
  private baseUrl = environment.baseUrl + "prices";

  constructor(private httpClient: HttpClient) {}

  getAllPrices(): Observable<Price[]> {
    return this.httpClient.get<Price[]>(`${this.baseUrl}/all-prices`);
  }

  public getAllPricesAndTheirProducts(): Observable<PricesAndProductDTO[]> {
    return this.httpClient.get<PricesAndProductDTO[]>(
      `${this.baseUrl}/all-prices-with-products`
    );
  }

  updatePrice(price: Price): Observable<PricesAndProductDTO> {
    return this.httpClient.put<PricesAndProductDTO>(
      `${this.baseUrl}/update-price`,
      price
    );
  }
}
