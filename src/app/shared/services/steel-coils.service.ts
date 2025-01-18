import {HttpClient, HttpParams} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { Observable } from "rxjs";
import { SteelCoilDetailsDTO } from "../models/steelCoilDetailsDTO";
import { SteelCoil } from "../models/steelCoil";
import { SteelCoilTransactionInformation } from "../models/steelCoilTransactionInformation";
import { ProductsTotalLengthOnOrder } from "../../modules/admin/dashboard/reserved-sales-stock-overview/models/productsTotalLengthOnOrder";

@Injectable({
  providedIn: "root",
})
export class SteelCoilsService {
  private baseUrl = environment.baseUrl + "steel-coils/";

  constructor(private _http: HttpClient) {}

  public getAllSteelCoilsInStock(): Observable<SteelCoilDetailsDTO[]> {
    return this._http.get<SteelCoilDetailsDTO[]>(this.baseUrl);
  }

  getSteelCoil(steelCoilId: number): Observable<SteelCoil> {
    return this._http.get<any>(this.baseUrl + steelCoilId);
  }

  getSteelCoilDetails(steelCoilId: number): Observable<SteelCoilDetailsDTO> {
    return this._http.get<SteelCoilDetailsDTO>(
      this.baseUrl + steelCoilId + "/details"
    );
  }

  getAPriceForSteelCoil(
    color: string,
    gauge: number,
    mtrsRequired: number
  ): Observable<number> {
    return this._http.get<any>(
      `${this.baseUrl}price/${color}/${gauge}/${mtrsRequired}`
    );
  }



  getAvailableSteelCoilsForMachine(
      width: number
  ): Observable<SteelCoilDetailsDTO[]> {
    return this._http.get<SteelCoilDetailsDTO[]>(
      `${this.baseUrl}available/for-machine/width/${width}`
    );
  }

  getAvailableSteelCoilsForProduct(
    productName: string
  ): Observable<SteelCoilDetailsDTO[]> {
    return this._http.get<SteelCoilDetailsDTO[]>(
      `${this.baseUrl}available/product/${productName}`
    );
  }

  getSteelCoilTransactions(
    steelCoilId: number
  ): Observable<SteelCoilTransactionInformation[]> {
    return this._http.get<SteelCoilTransactionInformation[]>(
      `${this.baseUrl}${steelCoilId}/transactions`
    );
  }

  getStockLevelsForSteelType(
    gauge: number,
    color: string,
    width: number
  ): Observable<number> {
    return this._http.get<number>(
      `${this.baseUrl}stock-levels/${width}/${gauge}/${color}`
    );
  }

  getAllStockLevels(): Observable<ProductsTotalLengthOnOrder[]> {
    return this._http.get<ProductsTotalLengthOnOrder[]>(
      `${this.baseUrl}total-products-lengths`
    );
  }

  getFilteredAvailableSteelCoils(width:number,gauge?: number, color?: string): Observable<SteelCoilDetailsDTO[]> {
    let params = new HttpParams();
    if (gauge != null) {
      params = params.set('gauge', gauge.toString());
    }
    if (color) {
      params = params.set('color', color);
    }
    return this._http.get<SteelCoilDetailsDTO[]>(`${this.baseUrl}filter/${width}`, { params });
  }

  getFilteredAvailableSteelCoilsPaginated(gauge: number | null, color?: string | null,pageNo: number =0 , pageSize: number =10 ): Observable< { steelCoilDetailsDTO:SteelCoilDetailsDTO []  ,totalElements: number   }> {
    let params = new HttpParams().set('pageNo', pageNo.toString())
        .set('pageSize', pageSize.toString());

    if (gauge != null) {
      params = params.set('gauge', gauge.toString());
    }
    if (color) {
      params = params.set('color', color);
    }


    return this._http.get<{steelCoilDetailsDTO: SteelCoilDetailsDTO []  , totalElements:number }>(`${this.baseUrl}filter`, { params });
  }
}
