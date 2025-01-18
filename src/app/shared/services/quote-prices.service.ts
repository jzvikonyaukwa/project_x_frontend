import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@environments/environment.development";
import { QuotePrice } from "@shared/models/quotePrice";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class QuotePricesService {
  private baseUrl = environment.baseUrl + "quote-prices";

  constructor(private http: HttpClient) {}

  public getAllQuotePrices(): Observable<QuotePrice[]> {
    return this.http.get<QuotePrice[]>(this.baseUrl);
  }

  public addQuotePrice(quotePrice: QuotePrice): Observable<QuotePrice> {
    return this.http.post<QuotePrice>(this.baseUrl, quotePrice);
  }

  public updateQuotePrice(quotePrice: QuotePrice): Observable<QuotePrice> {
    return this.http.put<QuotePrice>(this.baseUrl, quotePrice);
  }
}
