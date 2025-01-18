import { inject, Injectable } from '@angular/core';
import {
  BehaviorSubject,
  debounceTime,
  distinctUntilChanged,
  Observable,
  share,
  tap,
  timeout,
} from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@environments/environment';
import { Quote } from '../models/quote';
import { QuotePostDTO } from '../models/quotePostDTO';
import { TotalValues } from '../../invoices/models/invoice';
import { QuoteDetailsDTO } from '../models/quoteDetailsDTO';
import {
  QuotesPerDayDTO,
  QuoteStatusCountDTO,
  QuoteSummaryDTO,
} from '../../dashboard/quotes-summary-overview/models/quote-summary';
import { AgGridRequest } from 'app/utilities/ag-grid/models/ag-grid-request';
import { AgGridResponse } from 'app/utilities/ag-grid/models/ag-grid-response';
import { ProductDTO } from '../../cutting-lists/models/productDTO';

@Injectable({
  providedIn: 'root',
})
export class QuotesService {
  private baseUrl = `${environment.baseUrl}quotes`;

  private currentQuoteSubject = new BehaviorSubject<Quote | null>(null);

  public currentQuote$ = this.currentQuoteSubject.asObservable();

  private readonly http = inject(HttpClient);

  private quotes$ = this.http.get<Quote[]>(`${this.baseUrl}/all-quotes`);

  public getQuote(quoteId: number): Observable<Quote> {
    return this.http.get<Quote>(`${this.baseUrl}/get-quote/${quoteId}`).pipe(
      tap((quote: Quote) => {
        this.currentQuoteSubject.next(quote);
      }),
    );
  }

  getAllQuotes(
    pageNo: number = 0,
    pageSize?: number,
    sortOrder?: string,
  ): Observable<AgGridResponse<QuoteDetailsDTO[]>> {
    let params = new HttpParams().set('pageNo', pageNo.toString());

    if (pageSize !== undefined) {
      params = params.set('pageSize', pageSize.toString());
    }
    if (sortOrder) {
      params = params.set('sort', sortOrder);
    }

    return this.http
      .get<AgGridResponse<QuoteDetailsDTO[]>>(`${this.baseUrl}/all-quotes`, { params })
      .pipe(share(), debounceTime(140), distinctUntilChanged());
  }

  fetchQuoteDetails = (
    gridRequest: AgGridRequest,
  ): Observable<AgGridResponse<QuoteDetailsDTO[]>> => {
    return this.http
      .post<AgGridResponse<QuoteDetailsDTO[]>>(`${this.baseUrl}/get-rows`, gridRequest)
      .pipe(
        debounceTime(140),
        distinctUntilChanged(),
        timeout(environment.DEFAULT_HTTP_TIMEOUT),
        // catchError((error) => {
        //   console.error('Error fetching', error);
        //   return of([]); // Return an empty array if there’s an error
        // }),
        share(),
      );
  };

  // fetchQuoteQuotePrices = (quoteID: number): Observable<QuotePrice[]> => {
  //   return this.http.get<QuotePrice[]>(`${this.baseUrl}/${quoteID}/get-quote-prices`);
  // };

  public createQuote(quoteDTO: QuotePostDTO): Observable<Quote> {
    return this.http.post<Quote>(this.baseUrl + '/add-quote', quoteDTO);
  }

  public updateQuoteSections(quoteDTO: Quote): Observable<Quote> {
    return this.http.patch<Quote>(this.baseUrl + '/update-quote', quoteDTO).pipe(
      tap((updatedQuote: Quote) => {
        this.currentQuoteSubject.next(updatedQuote);
      }),
    );
  }

  public changeQuoteStatus(quoteId: number, status: string): Observable<Quote> {
    return this.http
      .patch<Quote>(this.baseUrl + '/change-quote-status/' + quoteId + '/' + status, {})
      .pipe(
        tap((updatedQuote: Quote) => {
          console.log('updatedQuote: ', updatedQuote);
          this.currentQuoteSubject.next(updatedQuote);
        }),
      );
  }

  public fetchQuotesForClientWithId(clientId: number): Observable<AgGridResponse<Quote[]>> {
    const request = {
      startRow: 0,
      endRow: 1_000_000,
      sortModel: [
        {
          colId: 'id',
          sort: 'desc',
        },
      ],
      filterModel: {
        clientId: {
          filterType: 'number',
          type: 'equals',
          filter: +clientId,
        },
      } as any,
    } as AgGridRequest;
    return this.http.post<AgGridResponse<Quote[]>>(`${this.baseUrl}/all-quotes`, request);
  }

  // Being used in the quote-document/quote-document.component.ts:59:38
  public calculateQuoteTotals(quote: Quote): TotalValues {
    const totals = {
      subTotal: 0,
      taxedPrice: 0,
      totalPrice: 0,
    };

    if (quote.products && quote.products.length) {
      quote.products.forEach((list) => {
        const totalLength = list.aggregatedProducts.reduce((accumulator, currentValue) => {
          //todo: check this
          return accumulator + currentValue.length;
        }, 0);

        totals.subTotal += totalLength * list.productPrice.pricePerMeter;
      });
    }

    if (quote.consumablesOnQuote && quote.consumablesOnQuote.length) {
      quote.consumablesOnQuote.forEach((consumable) => {
        const totalLength = consumable.qty;
        totals.subTotal += totalLength * consumable.sellPrice;
      });
    }

    totals.subTotal = totals.subTotal * quote.quotePrice.markUp;
    totals.taxedPrice += totals.subTotal * 0.15;
    totals.totalPrice += totals.subTotal * 1.15;

    return totals;
  }

  groupByLength(cuttingList: ProductDTO): GroupedProduct[] {
    const grouped: Record<number, GroupedProduct> = {};

    // fix this: error after changing to productDTO
    // cuttingList.aggregatedProducts.forEach((product) => {
    //   const key = product.totalLength;
    //   if (!grouped[key]) {
    //     grouped[key] = {
    //       frameName: product.frameName,
    //       frameType: product.frameType,
    //       length: product.totalLength,
    //       qty: 0,
    //     };
    //   }
    //   grouped[key].qty += 1;
    // });

    return Object.values(grouped);
  }

  getQuoteSummary(startDate?: string, endDate?: string): Observable<QuoteSummaryDTO> {
    let params = new HttpParams();

    if (startDate) {
      params = params.set('startDate', startDate);
    }

    if (endDate) {
      params = params.set('endDate', endDate);
    }

    return this.http.get<QuoteSummaryDTO>(`${this.baseUrl}/summary`, { params });
  }

  getQuoteStatusCount(startDate: string, endDate: string): Observable<QuoteStatusCountDTO> {
    let params = new HttpParams();
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    return this.http.get<QuoteStatusCountDTO>(`${this.baseUrl}/status-count`, { params });
  }

  getQuotesCountPerDay(startDate: string, endDate: string): Observable<QuotesPerDayDTO[]> {
    let params = new HttpParams();
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    return this.http.get<QuotesPerDayDTO[]>(`${this.baseUrl}/per-day`, { params });
  }

  rejectQuote(
    quoteID: number,
    rejectDetails: { date: any; rejectionReason: { id: number; reason: string } },
  ): Observable<Quote> {
    return this.http.patch<Quote>(`${this.baseUrl}/${quoteID}/reject`, rejectDetails).pipe(share());
  }

  requestQuoteApproval(quoteID: number): Observable<Quote> {
    return this.http
      .patch<Quote>(`${this.baseUrl}/${quoteID}/submit-for-approval`, {})
      .pipe(share());
  }

  approveQuote(quoteID: number): Observable<Quote> {
    return this.http.patch<Quote>(`${this.baseUrl}/${quoteID}/approve`, {}).pipe(share());
  }

  acceptQuote(quoteID: number): Observable<Quote> {
    return this.http.patch<Quote>(`${this.baseUrl}/${quoteID}/accept`, {}).pipe(share());
  }

  getLatestQuotes(): Observable<QuoteDetailsDTO[]> {
    return this.http.get<QuoteDetailsDTO[]>(`${this.baseUrl}/latest`);
  }

  // getQuoteTotals(startDate: string, endDate: string): Observable<QuoteTotalPriceDTO> {
  //   return this.http.get<QuoteTotalPriceDTO>(`${this.baseUrl}/totals?startDate=${startDate}&endDate=${endDate}`);
  // }

  getQuoteTotals(startDate: string, endDate: string): Observable<any> {
    let params = new HttpParams();

    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    return this.http.get<any>(`${this.baseUrl}/totals`, { params });
  }
}

export interface GroupedProduct {
  frameName: string;
  frameType: string;
  length: number;
  qty: number;
}
