import { Injectable } from '@angular/core';
import {environment} from "@environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {RejectionReason} from "@shared/models/rejectionReason";

@Injectable({
  providedIn: 'root'
})
export class RejectionReasonService {
  private _baseUrl: string = environment.baseUrl + 'quote-rejection-reasons';

  constructor(private _http: HttpClient) {}

  public getAllReasons(): Observable<RejectionReason[]> {
    return this._http.get<RejectionReason[]>(`${this._baseUrl}/all-quote-rejection-reasons`);
  }
}
