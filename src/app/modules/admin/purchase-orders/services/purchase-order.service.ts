import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PurchaseOrder } from '../models/purchaseOrders';
import { PurchaseOrderPostDTO } from '../models/purchaseOrderPostDTO';
import { ProductDelivered } from '../models/product-delivered';
import { GRVDetailsDTO } from '../../grvs/models/grvStructuredDetails';
import { PieChartData } from '../../dashboard/pie-chart/models/pieChartData';
import { ChartMultiData } from '../../dashboard/pie-chart/models/chart-multi-data';

@Injectable({
  providedIn: 'root',
})
export class PurchaseOrderService {
  baseUrl: string = environment.baseUrl + 'purchase-orders';

  constructor(private _http: HttpClient) {}

  public getAllOrders(
    pageNo: number,
    pageSize: number,
    filters?: string,
  ): Observable<{ purchaseOrders: PurchaseOrder[]; totalElements: number }> {
    let params = new HttpParams().set('pageNo', pageNo).set('pageSize', pageSize);
    if (filters) {
      params = params.set('filters', filters);
    }
    return this._http.get<{
      purchaseOrders: PurchaseOrder[];
      totalElements: number;
    }>(`${this.baseUrl}`, { params });
  }

  public getAllGRVForPO(id: number): Observable<GRVDetailsDTO[]> {
    return this._http.get<GRVDetailsDTO[]>(`${this.baseUrl}/${id}/grvs`);
  }

  public addPurchaseOrder(createDto: PurchaseOrderPostDTO): Observable<PurchaseOrderPostDTO> {
    return this._http.post<PurchaseOrderPostDTO>(`${this.baseUrl}`, createDto);
  }

  public saveEditPurchaseOrder(po: PurchaseOrderPostDTO): Observable<PurchaseOrderPostDTO> {
    return this._http.patch<PurchaseOrderPostDTO>(`${this.baseUrl}`, po);
  }

  public getProductOnOrderForSupplier(supplierId: number): Observable<PurchaseOrder[]> {
    return this._http.get<PurchaseOrder[]>(
      `${this.baseUrl}/products-on-order-for-supplier/${supplierId}`,
    );
  }

  public getPurchaseOrdersForSupplier(supplierId: number): Observable<PurchaseOrder[]> {
    return this._http.get<PurchaseOrder[]>(`${this.baseUrl}/for-supplier/${supplierId}`);
  }

  public getPurchaseOrderById(id: number): Observable<PurchaseOrder> {
    return this._http.get<PurchaseOrder>(`${this.baseUrl}/${id}`);
  }

  public updateProductsOnOrder(products: ProductDelivered[]): Observable<ProductDelivered[]> {
    return this._http.patch<ProductDelivered[]>(
      `${this.baseUrl}/update-products-on-order`,
      products,
    );
  }

  public changePurchaseOrderStatus(
    purchaseOrderId: number,
    status: string,
  ): Observable<PurchaseOrder> {
    return this._http.patch<PurchaseOrder>(
      `${this.baseUrl}/${purchaseOrderId}/new-status/${status}`,
      {},
    );
  }

  public cancelOrder(id: number): Observable<PurchaseOrder> {
    return this._http.patch<PurchaseOrder>(`${this.baseUrl}/cancel/${id}`, {});
  }

  getConsumableSummary(startDate?: string, endDate?: string): Observable<PieChartData[]> {
    let params = new HttpParams();
    if (startDate) {
      params = params.append('startDate', startDate);
    }
    if (endDate) {
      params = params.append('endDate', endDate);
    }
    console.log('Consumable Summary ----->' + params);
    return this._http.get<PieChartData[]>(`${this.baseUrl}/consumable-summary`, { params });
  }

  getSteelCoilSummary(startDate?: string, endDate?: string): Observable<PieChartData[]> {
    let params = new HttpParams();
    if (startDate) {
      params = params.append('startDate', startDate);
    }
    if (endDate) {
      params = params.append('endDate', endDate);
    }

    return this._http.get<PieChartData[]>(`${this.baseUrl}/steel-coil-summary`, { params });
  }

  getMonthlyOrderSummary(startDate?: string, endDate?: string): Observable<ChartMultiData[]> {
    let params = new HttpParams();
    if (startDate) {
      params = params.append('startDate', startDate);
    }
    if (endDate) {
      params = params.append('endDate', endDate);
    }

    return this._http.get<ChartMultiData[]>(`${this.baseUrl}/monthly-summary`, {
      params,
    });
  }

  deleteOrder(id: number): Observable<PurchaseOrder> {
    return this._http.delete<PurchaseOrder>(`${this.baseUrl}/${id}`);
  }
}
