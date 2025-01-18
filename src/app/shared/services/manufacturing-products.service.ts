import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "@environments/environment";
import {ProductDTO} from "@shared/models/productDTO";

@Injectable({
    providedIn: 'root'
})
export class ManufacturingProductsService {
    private baseUrl = environment.baseUrl + 'manufacturing-products';
    constructor(private _http: HttpClient) {}

    public getAllManufacturingProducts(): Observable<ProductDTO[]> {
        return this._http.get<ProductDTO[]>(this.baseUrl + '/all-manufacturing-products')
    }
}