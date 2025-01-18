import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, Subject, tap } from "rxjs";
import { environment } from "@environments/environment";
import { Client } from "@bugsnag/js";
import {CreditNoteDetailsDto, CreditNotesDto} from "../create-credit-note-dialog/models/credit-notes-dto";


@Injectable({
  providedIn: "root",
})
export class CreditNotesService {
  private apiUrl = `${environment.baseUrl}credit-notes`;

  constructor(private http: HttpClient) {}

  getAllCreditNotes(): Observable<CreditNotesDto[]> {
    return this.http.get<CreditNotesDto[]>(this.apiUrl);
  }

  getCreditNotesByProjectId(projectId: number): Observable<CreditNotesDto[]> {
    return this.http.get<CreditNotesDto[]>(`${this.apiUrl}/project/${projectId}`);
  }

  getCreditNoteById(id: number): Observable<CreditNotesDto> {
    return this.http.get<CreditNotesDto>(`${this.apiUrl}/${id}`);
  }


  createCreditNote(creditNote: CreditNotesDto): Observable<CreditNotesDto> {

    console.log(creditNote);
    return this.http.post<CreditNotesDto>(this.apiUrl, creditNote);
  }

  getCreditNoteDetailsById(id: number): Observable<CreditNoteDetailsDto[]> {
    return this.http.get<CreditNoteDetailsDto[]>(`${this.apiUrl}/${id}/details`);
  }

  getClientInfoByCreditNoteId(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/${id}/client-info`);
  }




}
