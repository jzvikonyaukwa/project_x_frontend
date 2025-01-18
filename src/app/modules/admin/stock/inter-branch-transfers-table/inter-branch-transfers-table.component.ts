import { Component, Input, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { InterBranchTransferService } from "../../inter-branch-transfers/services/inter-branch-transfer.service";
import { ColDef, GridApi, GridReadyEvent } from "ag-grid-enterprise";
import { COLUMN_DEFINITIONS } from "app/utilities/ag-grid/column-definitions";
import { InterBranchTransferDetails } from "../../inter-branch-transfers/models/interBranchTransferDetails";
import { AgGridModule } from "ag-grid-angular";
import { Observable, tap } from "rxjs";

@Component({
  selector: "app-inter-branch-transfers-table",
  standalone: true,
  imports: [CommonModule, AgGridModule],
  templateUrl: "./inter-branch-transfers-table.component.html",
  styleUrls: ["./inter-branch-transfers-table.component.scss"],
})
export class InterBranchTransfersTableComponent implements OnInit {
  @Input() public steelCoilId: number;
  private interBranchTransferService = inject(InterBranchTransferService);

  public gridApi!: GridApi<any>;
  public rowData$: Observable<InterBranchTransferDetails[]>;
  private rowData: InterBranchTransferDetails[] = [];
  public columnDefs: ColDef[] = [
    {
      headerName: "INTER BRANCH TRANSFER ID",
      field: "interBranchTransferId",
    },
    {
      headerName: "DATE",
      field: "dateTransferred",
    },
    {
      headerName: "FROM ID",
      field: "steelCoilIdFrom",
    },
    {
      headerName: "FROM COIL NUMBER",
      field: "coilNumberFrom",
    },
    {
      headerName: "FROM CARD NUMBER",
      field: "cardNumberFrom",
    },
    {
      headerName: "TO ID",
      field: "steelCoilIdTo",
    },
    {
      headerName: "TO COIL NUMBER",
      field: "coilNumberTo",
    },
    {
      headerName: "TO CARD NUMBER",
      field: "cardNumberTo",
    },
    {
      headerName: "MTRS TRANSFERRED",
      field: "mtrsTransferred",
    },
  ];
  public pagination = true;
  public paginationPageSize = "10";
  public defaultColDef: ColDef = COLUMN_DEFINITIONS;

  ngOnInit(): void {
    if (this.steelCoilId) {
      this.rowData$ = this.getIntercBranchTransferDetails(
        this.steelCoilId
      ).pipe(
        tap((data: InterBranchTransferDetails[]) => {
          this.rowData = data;
        })
      );
    } else {
      console.log("No steel coil id");
    }
  }

  getIntercBranchTransferDetails(
    id: number
  ): Observable<InterBranchTransferDetails[]> {
    return this.interBranchTransferService.getSteelCoilInterBranchTransferDetailsForSteelCoil(
      id
    );
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.onPaginationChanged();
    params.api.sizeColumnsToFit();
    params.api.setGridOption("domLayout", "autoHeight");
  }

  onPaginationChanged() {
    if (this.rowData!) {
      // Workaround for bug in events order
      this.setText(
        "#lbCurrentPage",
        this.gridApi?.paginationGetCurrentPage() + 1
      );
      this.setText("#lbTotalPages", this.gridApi?.paginationGetTotalPages());
    }
  }

  onPageSizeChanged(): void {
    const value = (document.getElementById("page-size") as HTMLInputElement)
      .value;
    this.paginationPageSize = value;
    this.gridApi.paginationSetPageSize(Number(value));
  }

  onBtNext() {
    if (
      this.gridApi.paginationGetTotalPages() ===
      this.gridApi.paginationGetCurrentPage()
    )
      return;
    this.gridApi.paginationGoToNextPage();
  }

  onBtPrevious() {
    this.gridApi.paginationGoToPreviousPage();
  }

  setText(selector: string, text: any) {
    (document.querySelector(selector) as any).innerHTML = text;
  }

  lastRowBorder(params) {
    if (params.node.rowIndex % 2 !== 0) {
      return {
        "background-color": "#EFF7FC",
      };
    } else {
      return {
        "background-color": "#FFFFFF",
      };
    }
  }
}
