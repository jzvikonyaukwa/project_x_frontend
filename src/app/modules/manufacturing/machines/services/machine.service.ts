import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment.development";
import { Observable } from "rxjs";
import { Machine } from "../models/machine";

@Injectable({
  providedIn: "root",
})
export class MachineService {
  private baseUrl = environment.baseUrl + "machines";

  constructor(private httpClient: HttpClient) {}

  getMachine(machineId: number): Observable<Machine> {
    return this.httpClient.get<Machine>(this.baseUrl + "/machine/" + machineId);
  }

  getAllMachines(): Observable<Machine[]> {
    return this.httpClient.get<Machine[]>(
      this.baseUrl + "/all-machines-details"
    );
  }
}
