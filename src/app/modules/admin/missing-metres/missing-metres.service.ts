import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { AddMissingMetresDTO } from "@shared/models/addMissingMetresDTO";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class MissingMetresService {
  private baseUrl = environment.baseUrl + "missing-metres";

  constructor(private http: HttpClient) {}

  public logMissingMetres(missingMetres: AddMissingMetresDTO): Observable<String> {
    return this.http.post<String>(this.baseUrl+'/log-missing-meters', missingMetres);
  }
}
