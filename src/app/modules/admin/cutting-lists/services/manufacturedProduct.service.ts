import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment.development';
import { ProductManufacturedDTO } from '../../../manufacturing/manufacture-product/models/productManufacturedDTO';
import { ManufacturedProduct } from '../models/manufacturedProduct';
import { Observable } from 'rxjs';
import { ManufacturedResponse } from '../../cutting-list/models/manufacturedResponse';
import {
  ManufacturedProductCountDTO,
  ManufacturedProductStatusCountDTO,
  MonthlyManufacturedProductCountDTO,
} from '../../../manufacturing/manufacturing-dashboard/manufacturing-summary-overview/models/manufacturing-summary';

@Injectable({
  providedIn: 'root',
})
export class ManufacturedProductService {
  private baseUrl = environment.baseUrl + 'manufactured-products';

  constructor(private httpClient: HttpClient) {}

  // productManufactured(
  //   productManufacturedDTO: ProductManufacturedDTO,
  // ): Observable<ManufacturedProduct> {
  //   return this.httpClient.patch<ManufacturedProduct>(
  //     this.baseUrl + '/product-manufactured',
  //     productManufacturedDTO,
  //   );
  // }

  // productManufactured(
  //   productManufacturedDTO: ProductManufacturedDTO,
  // ): Observable<ManufacturedProduct> {
  //   console.log(productManufacturedDTO);
  //   return this.httpClient.patch<ManufacturedProduct>(
  //     environment.baseUrl + 'products' + '/product-manufactured',
  //     productManufacturedDTO,
  //   );
  // }

  productManufactured(
    productManufacturedDTO: ProductManufacturedDTO,
  ): Observable<ManufacturedProduct> {
    console.log(productManufacturedDTO);
    return this.httpClient.patch<ManufacturedProduct>(
      environment.baseUrl + 'products' + '/product-manufactured',
      productManufacturedDTO,
    );
  }

  groupOfSheetsManufactured(
    productManufacturedDTO: ProductManufacturedDTO[],
  ): Observable<ManufacturedResponse> {
    console.log('+++++>', productManufacturedDTO);
    return this.httpClient.patch<ManufacturedResponse>(
      environment.baseUrl + 'products' + '/group-of-sheet-to-manufacture',
      productManufacturedDTO,
    );
  }

  getManufacturedProductCount(
    startDate?: string,
    endDate?: string,
  ): Observable<ManufacturedProductCountDTO[]> {
    let params = new HttpParams();
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }

    return this.httpClient.get<ManufacturedProductCountDTO[]>(`${this.baseUrl}/count-by-type`, {
      params,
    });
  }

  getManufacturedProductStatusCount(
    startDate?: string,
    endDate?: string,
  ): Observable<ManufacturedProductStatusCountDTO[]> {
    let params = new HttpParams();
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }

    return this.httpClient.get<ManufacturedProductStatusCountDTO[]>(
      `${this.baseUrl}/status-count`,
      { params },
    );
  }

  getManufacturedProductMonthlyCount(
    year?: number,
  ): Observable<MonthlyManufacturedProductCountDTO[]> {
    let params = new HttpParams();
    if (year) {
      params = params.set('year', year);
    }
    return this.httpClient.get<MonthlyManufacturedProductCountDTO[]>(
      `${this.baseUrl}/monthly-count-by-type`,
      { params },
    );
  }

  changeManufacturedProductStatus(
    mpdId: number,
    newStatus: string,
  ): Observable<ManufacturedProduct> {
    return this.httpClient.patch<ManufacturedProduct>(
      `${environment.baseUrl + 'products'}/${mpdId}/change-status/${newStatus}`,
      {},
    );
  }
}
