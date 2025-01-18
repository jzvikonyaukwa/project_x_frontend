import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { SteelSpecification } from "../models/steelSpecification";

@Injectable({
  providedIn: "root",
})
export class SteelSpecificationsService {
  private baseUrl = environment.baseUrl + "steel-specifications";
  constructor(private _http: HttpClient) {}

  getProductsBySupplier(supplierId: number): Observable<SteelSpecification[]> {
    return this._http.get<SteelSpecification[]>(
      `${this.baseUrl}/supplied-by/supplier/${supplierId}`
    );
  }
}
