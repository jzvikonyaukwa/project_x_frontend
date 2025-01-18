import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment.development";
import { Observable } from "rxjs";
import { ClientsDetailsDTO as ClientDetailsDTO } from "../models/clientsDetailsDTO";
import { UserDTO } from "app/modules/admin/clients/user-form/models/userDTO";
import { Contact } from "@shared/types/contact.type";

@Injectable({
  providedIn: "root",
})
export class ClientsService {
  private baseUrl = environment.baseUrl + "clients";
  private apiUrl = environment.baseUrl;

  private emailUrl = environment.baseUrl + "client-emails";
  private phoneUrl = environment.baseUrl + "client-phones";
  private addressUrl = environment.baseUrl + "client-addresses";

  constructor(private _http: HttpClient) {
  }

  getAllClientsWithDetails(): Observable<ClientDetailsDTO[]> {
    return this._http.get<ClientDetailsDTO[]>(
        this.baseUrl + "/all-clients-with-details"
    );
  }

  getAllClients(): Observable<UserDTO[]> {
    return this._http.get<UserDTO[]>(this.baseUrl + "/all-clients");
  }

  getClient(id: number): Observable<UserDTO> {
    return this._http.get<UserDTO>(`${this.baseUrl}/get-client-by-id/${id}`);
  }

  addClient(client: UserDTO): Observable<ClientDetailsDTO> {
    return this._http.post<ClientDetailsDTO>(this.baseUrl, client);
  }

  // T can be one of contact types: Address | Phone | Email | name
  editContacts<T>(items: T[], type: Contact): Observable<T[]> {
    return this._http.patch<T[]>(
        `${this.apiUrl}client-${type}/update-${type}`,
        items
    );
  }
  editName<T>(items: T): Observable<T> {
    return this._http.patch<T>(
        `${this.baseUrl}/update-client`,
        items);
  };






  deleteEmail(id: number): Observable<void> {
    return this._http.delete<void>(`${this.emailUrl}/${id}`);
  }

  deletePhone(id: number): Observable<void> {
    return this._http.delete<void>(`${this.phoneUrl}/${id}`);
  }

  deleteAdrress(id: number): Observable<void> {
    return this._http.delete<void>(`${this.addressUrl}/${id}`);
  }
}
