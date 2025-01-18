import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { ProductType } from '../models/productType';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductTypesService {
  private baseUrl = environment.baseUrl + 'product-types';

  constructor(private _http: HttpClient) {}

  public getAllProductTypes(): Observable<ProductType[]> {
    return this._http.get<ProductType[]>(this.baseUrl);
  }

  public getAllOutsourcedProductTypes(): Observable<ProductType[]> {
    return this._http.get<ProductType[]>(this.baseUrl + '/outsourced-products');
  }

  getCodeFromClientsName(clientsName: string): string | null {
    // Trim the input to remove leading/trailing whitespace
    const fullName = clientsName.trim();
    console.log('fullName: ', fullName);

    // Split the trimmed name by one or more whitespace characters
    const parts = fullName.split(/\s+/);

    let nameToUse: string;

    if (parts.length >= 2) {
      // Use the last part as the last name
      nameToUse = parts[parts.length - 1];
    } else if (parts.length === 1) {
      // Use the only part available
      nameToUse = parts[0];
    } else {
      console.log('Invalid name format');
      return null;
    }

    // Ensure the name has at least 3 characters
    if (nameToUse.length < 3) {
      console.log('Name is too short to extract 3 letters');
      return nameToUse.toUpperCase();
    }

    const firstThreeLetters = nameToUse.slice(0, 3).toUpperCase();
    console.log('firstThreeLetters: ', firstThreeLetters);
    return firstThreeLetters;
  }
}
