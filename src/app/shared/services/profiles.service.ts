import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@environments/environment.development";
import { Profile } from "@shared/models/profile";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class ProfilesService {
  private baseUrl = environment.baseUrl + "profiles";

  constructor(private http: HttpClient) {}

  public getAllProfiles(): Observable<Profile[]> {
    return this.http.get<Profile[]>(this.baseUrl);
  }
}
