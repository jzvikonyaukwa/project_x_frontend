import {
  Component,
  DestroyRef,
  Input,
  OnDestroy,
  OnInit,
  inject,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  ColDef,
  GridApi,
  GridReadyEvent,
  ValueFormatterParams,
} from "ag-grid-enterprise";
import "ag-grid-enterprise";
import { gridColumnDef } from "../../../../utilities/ag-grid/gridColumnDef";
import { InterBranchTransferService } from "../services/inter-branch-transfer.service";
import { AgGridModule } from "ag-grid-angular";
import { SteelCoilInterBranchTransferDetails } from "../models/steelCoilInterBranchTransferDetails";
import { Observable, tap } from "rxjs";
import { AccessButtonAgGridComponent } from "../../../../utilities/ag-grid/access-button-ag-grid/access-button-ag-grid.component";
import { Router } from "@angular/router";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { FormControl } from "@angular/forms";


@Component({
  selector: "app-steel-coils-inter-branch-transfers",
  standalone: true,
  imports: [CommonModule, AgGridModule, MatIconModule, MatButtonModule],
  templateUrl: "./steel-coils-inter-branch-transfers.component.html",
  styleUrls: ["./steel-coils-inter-branch-transfers.component.scss"],
})
export class SteelCoilInterBranchTransfersComponent
  implements  OnDestroy
{
  @Input("searchValue") searchValue: FormControl<string>;
  public pagination = true;
  public paginationPageSize = "30";
  public gridApi: GridApi;
  public rowData: SteelCoilInterBranchTransferDetails[];

  public defaultColDef: ColDef = gridColumnDef;

  public columnDefs: ColDef[] = [
    {
      headerName: "Transfer ID",
      field: "interBranchTransferId",
      width: 130,
    },
    {
      headerName: "Transfer Date",
      field: "dateTransferred",
      width: 180,
    },
    {
      headerName: "Coil Number From",
      field: "coilNumberFrom",
      width: 230,
    },
    {
      headerName: "Card Number From",
      field: "cardNumberFrom",
      width: 180,
    },
    {
      headerName: "Coil Number To",
      field: "coilNumberTo",
      width: 230,
    },
    {
      headerName: "Card Number To",
      field: "cardNumberTo",
      width: 180,
    },
    {
      headerName: "Meters Transferred",
      field: "mtrsTransferred",
      width: 180,
    },
    {
      headerName: "Landed Cost per Mtr",
      field: "landedCostPerMtrFrom",
      width: 130,
    },
    {
      headerName: "Color",
      field: "color",
      width: 160,
    },
    {
      headerName: "Width",
      field: "width",
      width: 130,
    },
    {
      headerName: "Gauge",
      field: "gauge",
      width: 130,
    },
    {
      headerName: "Total Cost",
      valueGetter: (params) => {
        const totalCost =
          params.data.landedCostPerMtrFrom * params.data.mtrsTransferred;
        return `$${totalCost.toFixed(2)}`;
      },
      width: 180,
    },
    {
      field: "steelCoilIdFrom",
      headerName: "VIEW",
      cellRenderer: AccessButtonAgGridComponent,
      cellRendererParams: {
        onClick: (id: number) => this._router.navigate(["/stocks", id]),
      },
      width: 100,
    },
  ];

  private _router = inject(Router);

  public interBranchTransfer$: Observable<
    SteelCoilInterBranchTransferDetails[]
  > = this.interBranchTransferService
    .getSteelCoilInterBranchTransferDetails()
    .pipe(
      tap((data: SteelCoilInterBranchTransferDetails[]) => {
        console.log(data);
      })
    );

  constructor(
    private interBranchTransferService: InterBranchTransferService,
    private destroyRef: DestroyRef
  ) {

    this.interBranchTransferService.getSteelCoilInterBranchTransferDetails()
        .subscribe({ next :
              (data) => {
                this.rowData = data;
                error: (err) => {
                  console.error('Error getting quotes', err);
                }
              }

        });

    // Initialize the search filter after gridApi is ready
    this.searchValue?.valueChanges
        .subscribe((value: string) => {
          if (this.gridApi) {
            this.gridApi.setQuickFilter(value);
          }
        });
  }







  weightFormatter(params: ValueFormatterParams) {
    return params.value + " KGS";
  }

  onGridReady(params:  GridReadyEvent<any>) {
    this.gridApi = params.api;
    params.api.setGridOption("domLayout", "autoHeight");
  }

  onBtExport() {
    this.gridApi.exportDataAsExcel();
  }
  ngOnDestroy(): void {
    this.searchValue?.reset("");
  }
}

