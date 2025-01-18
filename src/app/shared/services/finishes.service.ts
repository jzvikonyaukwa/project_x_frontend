import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { Finish } from "@shared/models/finish";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class FinishesService {
  private baseUrl = environment.baseUrl + "finishes";

  constructor(private http: HttpClient) {}

  public getAllFinishes(): Observable<Finish[]> {
    return this.http.get<Finish[]>(`${this.baseUrl}/all-finishes`);
  }
}
