import {HttpClient, HttpParams} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { Observable } from "rxjs";
import { ProductTransactionDetails } from "../models/productTransactionDetails";
import { TransactionDTO } from "../models/transactionDTO";

@Injectable({
  providedIn: "root",
})
export class ProductTransactionService {
  private baseUrl = environment.baseUrl + "product-transactions";

  constructor(private _http: HttpClient) {}

  public getAllProductTransactionsDetails(pageNo: number, pageSize: number, filters: string): Observable<{ productTransactionDetails: ProductTransactionDetails[], totalElements: number }> {
    let params = new HttpParams()
        .set('pageNo', pageNo)
        .set('pageSize', pageSize);
    if (filters) {
      params = params.set('filters', filters);
    }

    console.log(params+ "filters ---->" +filters);

    return this._http.get<{productTransactionDetails: ProductTransactionDetails[], totalElements: number }>(`${this.baseUrl}/details`, {params});
  }

  public getAllProductTransactionDetails(): Observable<ProductTransactionDetails[]> {
    return this._http.get<ProductTransactionDetails[]>(
      `${this.baseUrl}/details`
    );
  }

  public getProductTransactionsForThisWidth(width: number): Observable<TransactionDTO[]> {
    return this._http.get<TransactionDTO[]>(`${this.baseUrl}/width/${width}`);
  }


}


