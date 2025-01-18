import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { AddWastageDTO } from "@shared/models/addWastageDTO";
import { SteelCoil } from "@shared/models/steelCoil";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class WastageService {
  private baseUrl = environment.baseUrl + "wastage";

  constructor(private http: HttpClient) {}

  public addWastage(wastageInfo: AddWastageDTO): Observable<SteelCoil> {
    return this.http.post<SteelCoil>(this.baseUrl, wastageInfo);
  }
}
