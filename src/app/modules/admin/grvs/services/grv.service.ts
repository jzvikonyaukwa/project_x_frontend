import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, Observable, share, timeout } from 'rxjs';
import { environment } from '@environments/environment';
import { GRVDetailsDTO } from '../models/grvStructuredDetails';
import {
  ConsumableSummaryDetailsDTO,
  MonthlyOrderSummaryDTO,
} from '../../dashboard/grvs-summary-overview/models/grvs-summary';
import { GrvTotal } from '../models/grv';
import { GRVPaginatedDetailsDTO } from '../models/GRVPaginatedDetails';
import { PieChartData } from '../../dashboard/pie-chart/models/pieChartData';
import { AgGridRequest } from 'app/utilities/ag-grid/models/ag-grid-request';
import { AgGridResponse } from 'app/utilities/ag-grid/models/ag-grid-response';

@Injectable({
  providedIn: 'root',
})
export class GrvService {
  private baseUrl = `${environment.baseUrl}grvs`;

  private readonly _http = inject(HttpClient);

  getGrvsWithDetails(
    gridRequest: AgGridRequest,
  ): Observable<AgGridResponse<GRVPaginatedDetailsDTO[]>> {
    return this._http
      .post<AgGridResponse<GRVPaginatedDetailsDTO[]>>(`${this.baseUrl}/get-rows`, gridRequest)
      .pipe(
        debounceTime(140),
        distinctUntilChanged(),
        timeout(environment.DEFAULT_HTTP_TIMEOUT),
        share(),
      );
  }

  getAllGrvsWithDetails(
    page: number,
    size: number,
  ): Observable<{ grvDetails: GRVPaginatedDetailsDTO[]; totalElements: number }> {
    let params = new HttpParams().set('pageNo', page.toString()).set('pageSize', size.toString());

    return this._http.get<{ grvDetails: GRVPaginatedDetailsDTO[]; totalElements: number }>(
      `${this.baseUrl}/details`,
      { params },
    );
  }

  public getGrvDetails(grvId: number): Observable<GRVDetailsDTO> {
    return this._http.get<GRVDetailsDTO>(`${this.baseUrl}/${grvId}/details`);
  }

  public createGrv(createDto: GRVDetailsDTO): Observable<GRVDetailsDTO> {
    return this._http.post<GRVDetailsDTO>(`${this.baseUrl}/add`, createDto);
  }

  public getGrvsBySupplier(supplierId: number): Observable<GRVDetailsDTO[]> {
    return this._http.get<GRVDetailsDTO[]>(
      `${this.baseUrl}/get-all-grvs-for-supplier/${supplierId}`,
    );
  }

  public updateGrv(grv: GRVDetailsDTO): Observable<GRVDetailsDTO> {
    return this._http.put<GRVDetailsDTO>(`${this.baseUrl}/update`, grv);
  }

  getConsumableSummaryDetails(
    startDate: string,
    endDate: string,
  ): Observable<ConsumableSummaryDetailsDTO[]> {
    let params = new HttpParams();
    if (startDate) {
      params = params.append('startDate', startDate);
    }
    if (endDate) {
      params = params.append('endDate', endDate);
    }

    return this._http.get<ConsumableSummaryDetailsDTO[]>(
      `${this.baseUrl}/consumables-summary-details`,
      { params },
    );
  }

  getCSteelCoilSummaryDetails(startDate?: string, endDate?: string): Observable<PieChartData[]> {
    let params = new HttpParams();

    if (startDate) {
      params = params.append('startDate', startDate);
    }

    if (endDate) {
      params = params.append('endDate', endDate);
    }

    return this._http.get<PieChartData[]>(`${this.baseUrl}/steel-coil-summary-details`, { params });
  }

  getLatestGrvs(): Observable<GrvTotal[]> {
    return this._http.get<GrvTotal[]>(`${this.baseUrl}/latest`);
  }
}
