import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { SteelCoilInterBranchTransfer } from "../models/steel-coil-interBranchTransfer";
import { Observable } from "rxjs";
import { SteelCoilInterBranchTransferDetails } from "../models/steelCoilInterBranchTransferDetails";
import { ConsumableInterBranchTransferDetails } from "../models/consumableInterBranchTransferDetails";
import { ConsumableInterBranchTransfer } from "../models/consumableInterBranchTransfer";
import { InterBranchTransferDetails } from "../models/interBranchTransferDetails";

@Injectable({
  providedIn: "root",
})
export class InterBranchTransferService {
  private baseUrl = environment.baseUrl + "inter-branch-transfers";

  constructor(private http: HttpClient) {}

  public addSteelCoilInterBranchTransfer(
    interBranch: SteelCoilInterBranchTransfer
  ): Observable<SteelCoilInterBranchTransfer> {
    return this.http.post<SteelCoilInterBranchTransfer>(
      this.baseUrl + "/steel-coil",
      interBranch
    );
  }

  public getSteelCoilInterBranchTransferDetailsForSteelCoil(
    id: number
  ): Observable<InterBranchTransferDetails[]> {
    return this.http.get<InterBranchTransferDetails[]>(
      this.baseUrl + `/steel-coil/${id}/details`
    );
  }

  public getSteelCoilInterBranchTransferDetails(): Observable<
    SteelCoilInterBranchTransferDetails[]
  > {
    return this.http.get<SteelCoilInterBranchTransferDetails[]>(
      this.baseUrl + "/steel-coils/details"
    );
  }

  public getConsumableInterBranchTransferDetails(): Observable<
    ConsumableInterBranchTransferDetails[]
  > {
    return this.http.get<ConsumableInterBranchTransferDetails[]>(
      this.baseUrl + "/consumables/details"
    );
  }

  public addConsumableInterBranchTransfer(
    interBranch: ConsumableInterBranchTransfer
  ): Observable<ConsumableInterBranchTransfer> {
    return this.http.post<ConsumableInterBranchTransfer>(
      this.baseUrl + "/consumable",
      interBranch
    );
  }
}
