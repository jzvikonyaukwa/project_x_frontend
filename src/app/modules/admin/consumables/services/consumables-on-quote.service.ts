import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { Observable } from "rxjs";
import { ConsumableOnQuote } from "../models/consumableOnQuote";

@Injectable({
  providedIn: "root",
})
export class ConsumablesOnQuoteService {
  private baseUrl = environment.baseUrl + "consumables-on-quote";

  constructor(private http: HttpClient) {}

  saveConsumableOnQuote(
    consumableOnQuote: ConsumableOnQuote
  ): Observable<ConsumableOnQuote> {
    return this.http.post<ConsumableOnQuote>(this.baseUrl, consumableOnQuote);
  }

  deleteConsumableOnQuote(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.baseUrl}/${id}`);
  }
}
