import { Component, Input, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { AgGridModule } from "ag-grid-angular";
import { Router } from "@angular/router";
import {
  ColDef,
  GridApi,
  GridReadyEvent,
  ValueFormatterParams,
} from "ag-grid-enterprise";
import { gridColumnDef } from "app/utilities/ag-grid/gridColumnDef";
import { Observable, tap } from "rxjs";
import { InterBranchTransferService } from "../services/inter-branch-transfer.service";
import { ConsumableInterBranchTransferDetails } from "../models/consumableInterBranchTransferDetails";
import { FormControl } from "@angular/forms";

@Component({
  selector: "app-consumable-inter-branch-transfer",
  standalone: true,
  imports: [CommonModule, AgGridModule, MatIconModule, MatButtonModule],
  templateUrl: "./consumable-inter-branch-transfer.component.html",
  styleUrls: ["./consumable-inter-branch-transfer.component.scss"],
})
export class ConsumableInterBranchTransferComponent {
  @Input("searchValue") searchValue: FormControl<string>;
  private _router = inject(Router);

  public pagination = true;
  public paginationPageSize = "30";
  public gridApi!: GridApi<ConsumableInterBranchTransferDetails[]>;
  public rowData: ConsumableInterBranchTransferDetails[];

  public defaultColDef: ColDef = gridColumnDef;

  public columnDefs: ColDef[] = [
    {
      headerName: "Transfer ID",
      field: "interBranchTransferId",
      width: 180,
    },
    {
      headerName: "Consumable ",
      field: "consumableName",
      width: 180,
    },
    {
      headerName: "Serial Number ",
      field: "serialNumber",
      width: 180,
    },
    {
      headerName: "Transfer Date",
      field: "dateTransferred",
      width: 180,
    },
    {
      headerName: "QTY Transferred",
      field: "qtyTransferred",
      width: 160,
    },
    {
      headerName: "Consignment Avg Landed Price",
      field: "consumableInWarehouseFromAvgLandedPrice",
      width: 180,
    },
    {
      headerName: "Total Cost",
      valueGetter: (params) => {
        const totalCost =
          params.data.consumableInWarehouseFromAvgLandedPrice *
          params.data.qtyTransferred;
        return `$${totalCost.toFixed(2)}`;
      },
      width: 180,
    },
    // {
    //   field: "steelCoilIdFrom",
    //   headerName: "VIEW CONSIGMENT STOCK",
    //   cellRenderer: AccessButtonAgGridComponent,
    //   cellRendererParams: {
    //     // onClick: (id: number) => this._router.navigate(["/stocks", id]),
    //   },
    //   width: 100,
    // },
    // {
    //   field: "steelCoilIdFrom",
    //   headerName: "VIEW OWNED STOCK",
    //   cellRenderer: AccessButtonAgGridComponent,
    //   cellRendererParams: {
    //     // onClick: (id: number) => this._router.navigate(["/stocks", id]),
    //   },
    //   width: 100,
    // },
  ];

  public consumableInterBranchTransfer$: Observable<
    ConsumableInterBranchTransferDetails[]
  > = this.interBranchTransferService
    .getConsumableInterBranchTransferDetails()
    .pipe(
      tap((data: ConsumableInterBranchTransferDetails[]) => {
        console.log(data);
      })
    );

  constructor(private interBranchTransferService: InterBranchTransferService) {
    this.consumableInterBranchTransfer$.subscribe({
      next: (data: ConsumableInterBranchTransferDetails[]) => {
        this.rowData = data;
        console.log('Data received:', data);
      },
      error: (error) => {
        console.error('Error fetching data:', error);
      }
    });
  }
  weightFormatter(params: ValueFormatterParams) {
    return params.value + " KGS";
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
    params.api.setGridOption("domLayout", "autoHeight");
  }

  onBtExport() {
    this.gridApi.exportDataAsExcel();
  }
}
