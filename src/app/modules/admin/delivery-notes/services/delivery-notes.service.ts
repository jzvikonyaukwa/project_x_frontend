import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { DeliveryNote } from '../models/delivery-note';
import { Client } from '@bugsnag/js';
import { Quote } from '../../quotes/models/quote';
import { DeliverNoteDTO } from '../models/delivery-notes-dto';
import { InventoryItemDTO } from '../../inventory/models/inventoryItemDTO';
import { ProjectInformation } from '../models/projectInformation';
import { AgGridRequest } from 'app/utilities/ag-grid/models/ag-grid-request';
import { AgGridResponse } from 'app/utilities/ag-grid/models/ag-grid-response';

@Injectable({
  providedIn: 'root',
})
export class DeliveryNotesService {
  private apiUrl = `${environment.baseUrl}delivery-notes`;

  readonly http = inject(HttpClient);

  getAllDeliveryNotes(): Observable<DeliveryNote[]> {
    return this.http.get<DeliveryNote[]>(this.apiUrl);
  }

  getDeliveryNotesByProjectId(projectId: number): Observable<DeliveryNote[]> {
    return this.http.get<DeliveryNote[]>(`${this.apiUrl}/project/${projectId}`);
  }

  getDeliveryNoteById(id: number): Observable<DeliveryNote> {
    return this.http.get<DeliveryNote>(`${this.apiUrl}/${id}`);
  }

  updateDeliveryNote(id: number, deliveryNote: DeliveryNote): Observable<DeliveryNote> {
    return this.http.put<DeliveryNote>(`${this.apiUrl}/${id}`, deliveryNote);
  }

  updateDeliveryNoteStatus(id: number, newStatus: string): Observable<DeliveryNote> {
    return this.http.put<DeliveryNote>(`${this.apiUrl}/${id}/status`, newStatus);
  }

  createDeliveryNote(deliveryNote: DeliverNoteDTO): Observable<DeliveryNote> {
    return this.http.post<DeliveryNote>(this.apiUrl, deliveryNote);
  }

  getClientInfoByDeliveryNoteId(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/${id}/client-info`);
  }

  getProjectInfoByDeliveryNoteId(id: number): Observable<ProjectInformation> {
    return this.http.get<ProjectInformation>(`${this.apiUrl}/${id}/project-info`);
  }

  getQuoteByDeliveryNoteId(id: number): Observable<Quote> {
    return this.http.get<Quote>(`${this.apiUrl}/${id}/quote`);
  }

  isEditableDeliveryNote(deliveryNoteId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/${deliveryNoteId}/is-editable-delivery-note`);
  }

  getDeliveryNoteItemsForUpdate(id: number): Observable<InventoryItemDTO> {
    return this.http.get<InventoryItemDTO>(`${this.apiUrl}/${id}/items`);
  }

  removeItemsFromDeliveryNote(removeItemsDTO: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/remove-items`, removeItemsDTO);
  }

  addItemsToDeliveryNote(addItemsDTO: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/add-delivery-note-items`, addItemsDTO);
  }

  fetchDeliveryNotesForClientWithId(clientId: number): Observable<AgGridResponse<DeliveryNote[]>> {
    const request = {
      startRow: 0,
      endRow: 1_000_000,
      sortModel: [
        {
          colId: 'id',
          sort: 'desc',
        },
      ],
      filterModel: {
        clientId: {
          filterType: 'number',
          type: 'equals',
          filter: +clientId,
        },
      } as any,
    } as AgGridRequest;
    return this.http.post<AgGridResponse<DeliveryNote[]>>(`${this.apiUrl}/get-rows`, request);
  }
}
