import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ColDef, GridApi, GridReadyEvent } from "ag-grid-enterprise";
import { getColumnDefs } from "./coil-history-column.definition";
import { AgGridModule } from "ag-grid-angular";
import { ActivatedRoute } from "@angular/router";
import { Observable, switchMap, tap } from "rxjs";
import { SteelCoilsService } from "../../../../shared/services/steel-coils.service";
import { SteelCoilDetailsDTO } from "../../../../shared/models/steelCoilDetailsDTO";
import { SteelCoilTransactionInformation } from "../../../../shared/models/steelCoilTransactionInformation";
import { COLUMN_DEFINITIONS } from "app/utilities/ag-grid/column-definitions";
import { MatIconModule } from "@angular/material/icon";
import { InterBranchTransfersTableComponent } from "../inter-branch-transfers-table/inter-branch-transfers-table.component";

@Component({
  selector: "app-steel-coil",
  standalone: true,
  imports: [
    CommonModule,
    AgGridModule,
    MatIconModule,
    InterBranchTransfersTableComponent,
  ],
  templateUrl: "./steel-coil.component.html",
  styleUrls: ["./steel-coil.component.scss"],
})
export class SteelCoilComponent {
  private router = inject(ActivatedRoute);
  private steelCoilService = inject(SteelCoilsService);

  public steelCoilId: number;
  public steelCoilDetails$: Observable<SteelCoilDetailsDTO>;
  public coilsTransactions$: Observable<SteelCoilTransactionInformation[]>;
  private estMtrOnArrival: number = 0;
  public totalWasted: number = 0;
  public totalReceived: number = 0;
  public totalRemaining: number = 0;
  public gridApi!: GridApi<any>;
  public rowData: SteelCoilTransactionInformation[] = [];
  public columnDefs: ColDef[] = [];

  public defaultColDef: ColDef = COLUMN_DEFINITIONS;

  ngOnInit(): void {
    this.steelCoilDetails$ = this.router.paramMap.pipe(
      switchMap((params) => {
        const id = +params.get("id");
        this.steelCoilId = id;
        this.coilsTransactions$ = this.getSteelCoilTransactions(id);

        return this.getSteelCoilDetails(id);
      })
    );
  }

  getSteelCoilTransactions(
    id: number
  ): Observable<SteelCoilTransactionInformation[]> {
    return this.steelCoilService.getSteelCoilTransactions(id).pipe(
      tap((transactions: SteelCoilTransactionInformation[]) => {
        this.getTotalWastage(transactions);
        console.log(transactions);
        this.rowData = transactions;
      })
    );
  }

  getSteelCoilDetails(id: number): Observable<SteelCoilDetailsDTO> {
    return this.steelCoilService.getSteelCoilDetails(id).pipe(
      tap((steelCoilDetails: SteelCoilDetailsDTO) => {
        if (steelCoilDetails) {
          console.log(steelCoilDetails);
          this.estMtrOnArrival = steelCoilDetails.estMtrsOnArrival;
          this.columnDefs = getColumnDefs(this.estMtrOnArrival);
        }
      })
    );
  }

  getTotalWastage(transactions: SteelCoilTransactionInformation[]) {
    let wastage = 0;

    transactions.forEach((transaction) => {
      if (transaction.wastageLength) {
        wastage += transaction.wastageLength;
      }
    });

    this.totalWasted = Number(wastage.toFixed(2));
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
  }

  exportToExcel() {
    this.gridApi.exportDataAsExcel();
  }
}
