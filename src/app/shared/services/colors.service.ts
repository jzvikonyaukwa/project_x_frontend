import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { Color } from '@shared/models/color';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ColorsService {
  private baseUrl = environment.baseUrl + 'colors';

  constructor(private http: HttpClient) {}

  public getAllColors(): Observable<Color[]> {
    return this.http.get<Color[]>(`${this.baseUrl}/all-colors`);
  }

  public getGalvanizeColor(): Observable<Color> {
    return this.http.get<Color>(`${this.baseUrl}/galvanize`);
  }
}
