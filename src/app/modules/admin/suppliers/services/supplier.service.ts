import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "@environments/environment";
import { SupplierDto, SupplierWithDetailsDTO } from "../models/supplierDto";
import { UserDTO } from "app/modules/admin/clients/user-form/models/userDTO";
import { Contact } from "@shared/types/contact.type";
import { Supplier } from "../models/supplier";

@Injectable({
  providedIn: "root",
})
export class SupplierService {
  private baseUrl = environment.baseUrl + "suppliers";
  private emailUrl = environment.baseUrl + "supplier-emails";
  private phoneUrl = environment.baseUrl + "supplier-phones";
  private addressUrl = environment.baseUrl + "supplier-addresses";
  private apiUrl = environment.baseUrl;
  constructor(private _http: HttpClient) {}

  getAllSuppliersWithDetails(): Observable<SupplierWithDetailsDTO[]> {
    return this._http.get<SupplierWithDetailsDTO[]>(
      `${this.baseUrl}/all-suppliers-with-details`
    );
  }

  // SupplierDto
  getAllSuppliers(): Observable<Supplier[]> {
    return this._http.get<Supplier[]>(`${this.baseUrl}/all-suppliers`);
  }

  getSupplier(id: number): Observable<SupplierDto> {
    return this._http.get<SupplierDto>(
      `${this.baseUrl}/get-supplier-by-id/${id}`
    );
  }

  addSupplier(supplierDTO: UserDTO): Observable<SupplierDto> {
    return this._http.post<SupplierDto>(`${this.baseUrl}`, supplierDTO);
  }

  // T can be one of contact types: Address | Phone | Email
  editContacts<T>(items: T[], type: Contact): Observable<T[]> {
    return this._http.patch<T[]>(
      `${this.apiUrl}supplier-${type}/update-${type}`,
      items
    );
  }

  deleteEmail(id: number): Observable<void> {
    console.log(id);
    return this._http.delete<void>(`${this.emailUrl}/${id}`);
  }

  deletePhone(id: number): Observable<void> {
    console.log(id);
    return this._http.delete<void>(`${this.phoneUrl}/${id}`);
  }

  deleteAdrress(id: number): Observable<void> {
    console.log(id);
    return this._http.delete<void>(`${this.addressUrl}/${id}`);
  }
}
