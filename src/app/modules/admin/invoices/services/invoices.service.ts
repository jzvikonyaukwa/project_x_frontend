import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';
import { Invoice } from '../models/invoice';
import { IssueInvoiceDTO } from '../models/issueInvoiceDTO';
import { QuotePrice } from '@shared/models/quotePrice';
import { Client } from '@bugsnag/js';
import { QuoteCalculationsService } from '../../quotes/services/quote-calculations.service';
import { QuoteTotals } from '../../quotes/models/quoteTotals';
import {
  InvoiceDetailsDTO,
  InvoiceMonthlySummaryDTO,
} from '../../dashboard/invoices-summary-overview/models/invoices-summary';
import { ChartMultiData } from '../../dashboard/pie-chart/models/chart-multi-data';
import BigNumber from 'bignumber.js';

@Injectable({
  providedIn: 'root',
})
export class InvoicesService {
  private readonly baseUrl = `${environment.baseUrl}invoices`;

  private readonly _http = inject(HttpClient);
  private readonly quoteCalculationService = inject(QuoteCalculationsService);

  public getInvoices(pageNo: number, pageSize: number): Observable<{invoice:Invoice[], totalElements:number}> {
    let params = new HttpParams()
        .set('pageNo', pageNo)
        .set('pageSize', pageSize);
    return this._http.get<{invoice:Invoice[], totalElements:number}>(`${this.baseUrl}`,{params});
  }

  public getInvoice(invoiceId: number): Observable<Invoice> {
    return this._http.get<Invoice>(`${this.baseUrl}/${invoiceId}`);
  }

  public updateInvoice(invoice: Invoice): Observable<Invoice> {
    return this._http.patch<Invoice>(`${this.baseUrl}/up-invoice`, invoice);
  }

  public issueInvoice(issueInvoiceDTO: IssueInvoiceDTO): Observable<Invoice> {
    return this._http.post<Invoice>(`${this.baseUrl}/issue-invoice`, issueInvoiceDTO);
  }


  public getClientForInvoice(invoiceId: number): Observable<Client> {
    return this._http.get<Client>(`${this.baseUrl}/${invoiceId}/client`);
  }

  public deleteInvoice(invoiceId: number): Observable<void> {
    return this._http.delete<void>(`${this.baseUrl}/${invoiceId}`);
  }

  public calculateInvoiceTotals(invoice: Invoice): QuoteTotals {
    const rawProductsCostTotal: number = this.quoteCalculationService.calculateProductsCostTotal(invoice.productDTOList);
    console.debug('rawProductsCostTotal: ', rawProductsCostTotal);

    const consumablesFinalCostTotal: number = this.quoteCalculationService.calculateConsumablesTotalCostWithMarkup(
      invoice.consumablesOnQuote,
    );

    if (!rawProductsCostTotal && !consumablesFinalCostTotal) {
      return {
        totalRawMaterialCost: 0,
        externalCost: 0,
        markUpCharged: 0,
        totalExcVat: 0,
        totalVat: 0,
        totalIncVat: 0,
      };
    }

      const consumablesMarkupAmount: number = this.quoteCalculationService.calculateConsumablesMarkup(invoice.consumablesOnQuote);
      console.debug('consumablesMarkupAmount: ', consumablesMarkupAmount);
  
      const rawConsumablesCostTotal: number = BigNumber(consumablesFinalCostTotal).minus(consumablesMarkupAmount).decimalPlaces(2).toNumber();
      console.debug('rawConsumablesCostTotal: ', rawConsumablesCostTotal);
  
      const productsCostWithMarkup: number = this.quoteCalculationService.totalCostWithMarkUpProducts(invoice.productDTOList);
      console.debug('productsCostWithMarkup: ', productsCostWithMarkup);
  
      const productsTotalMarkupAmount: number = BigNumber(productsCostWithMarkup).minus(rawProductsCostTotal).decimalPlaces(2).toNumber();
      console.debug('productsTotalMarkupAmount: ', productsTotalMarkupAmount);
  
      const materialsCostTotal: number = BigNumber(rawProductsCostTotal).plus(BigNumber(rawConsumablesCostTotal))
        .decimalPlaces(2).toNumber();
      console.debug('materialsCostTotal: ', materialsCostTotal);
  
      const materialsTotalMarkup: number = BigNumber(productsTotalMarkupAmount).plus(BigNumber(consumablesMarkupAmount)).decimalPlaces(2).toNumber();
      console.debug('materialsTotalMarkup: ', materialsTotalMarkup);
  
      const materialsCostWithMarkupTotal: number = BigNumber(materialsCostTotal).plus(materialsTotalMarkup).decimalPlaces(2).toNumber();
      console.debug('materialsCostWithMarkupTotal: ', materialsCostWithMarkupTotal);

    return {
      totalRawMaterialCost: materialsCostTotal,
      externalCost: 0,
      markUpCharged: materialsTotalMarkup,
      totalExcVat: materialsCostWithMarkupTotal,
      totalVat: BigNumber(materialsCostWithMarkupTotal).times(0.15).decimalPlaces(2).toNumber(),
      totalIncVat: BigNumber(materialsCostWithMarkupTotal).times(1.15).decimalPlaces(2).toNumber(),
    } as QuoteTotals;
  }

  getInvoiceMonthlySummary(
    startDate?: string,
    endDate?: string,
  ): Observable<InvoiceMonthlySummaryDTO[]> {
    // console.log("getInvoiceMonthlySummary: ", startDate, endDate);
    let params = new HttpParams();
    if (startDate) {
      params = params.append('startDate', startDate);
    }
    if (endDate) {
      params = params.append('endDate', endDate);
    }

    return this._http.get<InvoiceMonthlySummaryDTO[]>(`${this.baseUrl}/monthly-summary-details`, {
      params,
    });
  }

  getInvoiceWeeklySummary(startDate: string, endDate: string): Observable<ChartMultiData[]> {
    // console.log("getInvoiceWeeklySummary: ", startDate, endDate);
    let params = new HttpParams();
    if (startDate) {
      params = params.append('startDate', startDate);
    }
    if (endDate) {
      params = params.append('endDate', endDate);
    }

    return this._http.get<ChartMultiData[]>(`${this.baseUrl}/weekly-summary`, {
      params,
    });
  }

  getInvoicedProductsSummary(startDate: string, endDate: string): Observable<InvoiceDetailsDTO[]> {
    // console.log("getInvoicedProductsSummary: ", startDate, endDate);
    let params = new HttpParams();
    if (startDate) {
      params = params.append('startDate', startDate);
    }
    if (endDate) {
      params = params.append('endDate', endDate);
    }

    return this._http.get<InvoiceDetailsDTO[]>(`${this.baseUrl}/invoiced-products`, { params });
  }
}
