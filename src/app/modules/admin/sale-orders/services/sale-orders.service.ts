import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@environments/environment.development";
import { BehaviorSubject, Observable, tap } from "rxjs";
import { SaleOrder } from "../models/salesOrder";
import { ProductsTotalLengthOnOrder } from "../../dashboard/reserved-sales-stock-overview/models/productsTotalLengthOnOrder";
import { SalesOrderOverview } from "../models/salesOrderOverview";

@Injectable({
  providedIn: "root",
})
export class SaleOrdersService {
  private baseUrl = environment.baseUrl + "sale-orders";

  private currentSaleOrderSubject = new BehaviorSubject<SaleOrder | null>(null);

  public currentSaleOrder$ = this.currentSaleOrderSubject.asObservable();

  constructor(private http: HttpClient) {}

  getAllSaleOrders(): Observable<SaleOrder[]> {
    return this.http.get<SaleOrder[]>(this.baseUrl);
  }

  getAllSaleOrderSummaries(): Observable<SalesOrderOverview[]> {
    return this.http.get<SalesOrderOverview[]>(`${this.baseUrl}/overview`);
  }

  getSaleOrderById(id: number): Observable<SaleOrder> {
    return this.http.get<SaleOrder>(`${this.baseUrl}/${id}`).pipe(
      tap((saleOrder: SaleOrder) => {
        this.currentSaleOrderSubject.next(saleOrder);
      })
    );
  }

  getTotalLengthOnOrderReserved(): Observable<ProductsTotalLengthOnOrder[]> {
    return this.http.get<ProductsTotalLengthOnOrder[]>(
      `${this.baseUrl}/total-length-on-order/reserved`
    );
  }

  getTotalLengthOnOrderNotReserved(): Observable<ProductsTotalLengthOnOrder[]> {
    return this.http.get<ProductsTotalLengthOnOrder[]>(
      `${this.baseUrl}/total-length-on-order/not-reserved`
    );
  }

  getTotalLengthOnOrder(): Observable<ProductsTotalLengthOnOrder[]> {
    return this.http.get<ProductsTotalLengthOnOrder[]>(
      `${this.baseUrl}/total-length-on-order`
    );
  }
}
