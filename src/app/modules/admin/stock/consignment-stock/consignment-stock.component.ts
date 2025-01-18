import {
  Component,
  DestroyRef,
  Input,
  OnDestroy,
  OnInit,
  inject,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { WarehouseService } from "../../warehouses/warehouse.service";
import { StocksDTO } from "../../../../shared/models/stockDetailsDTO";
import {
  ColDef,
  FirstDataRenderedEvent,
  GridApi,
  GridReadyEvent,
} from "ag-grid-enterprise";
import { AgGridModule } from "ag-grid-angular";
import { AccessButtonAgGridComponent } from "../../../../utilities/ag-grid/access-button-ag-grid/access-button-ag-grid.component";
import { InterBranchTransferService } from "../../inter-branch-transfers/services/inter-branch-transfer.service";
import { SteelCoilInterBranchTransfer } from "../../inter-branch-transfers/models/steel-coil-interBranchTransfer";
import { weightFormatter } from "app/utilities/ag-grid/weightFormatter";
import { AmountModalComponent } from "../../inter-branch-transfers/amount-modal/amount-modal.component";
import { ModalService } from "@shared/services/modal.service";
import { AmountDate } from "../../inter-branch-transfers/models/amountDate";
import { FormControl, FormsModule } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { MatIconModule } from "@angular/material/icon";
import { ConsumablesInWarehouseTableComponent } from "../../consumables/consumables-in-warehouse-table/consumables-in-warehouse-table.component";
import { Router } from "@angular/router";
import { getFirstTwoWords } from "app/utilities/ag-grid/GetFirstTwoWords";
import "ag-grid-enterprise";
import { currencyFormatter } from "app/utilities/ag-grid/currencyFormatter";
import { FuseAlertComponent, FuseAlertType } from "@fuse/components/alert";
import { MatButtonModule } from "@angular/material/button";

@Component({
  selector: "app-consignment-stock",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AgGridModule,
    MatIconModule,
    ConsumablesInWarehouseTableComponent,
    FuseAlertComponent,
    MatButtonModule,
  ],
  templateUrl: "./consignment-stock.component.html",
  styleUrls: ["./consignment-stock.component.scss"],
})
export class ConsignmentStockComponent implements OnInit, OnDestroy {
  refreshTable: boolean = false;
  @Input("searchValue") searchValue: FormControl<string>;
  public pagination = true;
  public paginationPageSize = "20";
  public paginationPageSizeSelector = [10, 20, 50, 100];
  private _router = inject(Router);

  rowData: StocksDTO[];
  public gridApi!: GridApi<StocksDTO[]>;
  public defaultColDef: ColDef = {
    wrapHeaderText: true,
    editable: true,
    minWidth: 100,
    resizable: true,
    filter: true,
    floatingFilter: true,
  };

  public columnDefs: ColDef[] = [
    {
      headerName: "ID",
      field: "steelCoilId",
      width: 90,
    },
    {
      headerName: "Supplier",
      field: "supplier",
      enableRowGroup: true,
      width: 180,
      valueGetter: (params) => getFirstTwoWords(params.data?.supplier),
    },
    {
      headerName: "CONSIGNOR",
      field: "consignor",
      enableRowGroup: true,
      valueGetter: (params) => getFirstTwoWords(params.data?.consignor),
      width: 220,
    },
    {
      headerName: "Coil Number",
      field: "coilNumber",
      width: 200,
    },
    {
      headerName: "ISQ Grade",
      field: "isqgrade",
      enableRowGroup: true,
      width: 140,
    },
    {
      headerName: "Color",
      field: "color",
      enableRowGroup: true,
      chartDataType: "category",
      width: 140,
    },
    {
      headerName: "Width",
      field: "width",
      enableRowGroup: true,
      // rowGroup: true,
      hide: true,
      chartDataType: "category",
      width: 120,
    },
    {
      headerName: "Coating",
      field: "coating",
      chartDataType: "category",
      enableRowGroup: true,
      width: 120,
    },
    {
      headerName: "Gauge",
      field: "gauge",
      enableRowGroup: true,
      chartDataType: "category",
      width: 120,
    },
    {
      headerName: "Weight On Arrival",
      field: "weightOnArrival",
      valueFormatter: weightFormatter,
      width: 150,
    },
    {
      headerName: "Landed Cost per Mtr",
      field: "landedCostPerMtr",
      width: 140,
      // format to currency
      valueFormatter: currencyFormatter,
    },
    {
      headerName: "Balance",
      field: "meterRemaining",
      chartDataType: "series",
      // aggFunc: this.sumAndRound,
      aggFunc: "sum",
      width: 150,
    },
    {
      headerName: "VIEW SHEET",
      field: "steelCoilId",
      cellRenderer: AccessButtonAgGridComponent,
      cellRendererParams: {
        onClick: (id: number) => this._router.navigate(["/stocks", id]),
      },
      width: 130,
    },
    {
      headerName: "Move to Owned Stock",
      field: "steelCoilId",
      filter: false,
      cellRenderer: AccessButtonAgGridComponent,
      cellRendererParams: {
        onClick: (steelCoilId: number) => {
          this.createInterBranchTransfer(steelCoilId);
        },
        isConsignment: true,
      },
      width: 130,
    },
  ];

  public chartThemes: string[] = ["ag-vivid"];
  groupDisplayType = "singleColumn";
  chart: string = "consignmentChart";

  public autoGroupColumnDef: ColDef = {
    minWidth: 200,
  };

  public rowGroupPanelShow: "always" | "onlyWhenGrouping" | "never" = "always";

  showAlert: boolean = false;
  alert: { type: FuseAlertType; message: string } = {
    type: "success",
    message: "",
  };

  constructor(
    private warehouseService: WarehouseService,
    private modalService: ModalService,
    private interBranchTransferService: InterBranchTransferService,
    private destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    this.getWarehouseStock(2);
    this.searchValue?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value: string) => {
        if (this.gridApi && !this.gridApi?.isDestroyed()) {
          this.gridApi.setGridOption("quickFilterText", value);
        }
      });
  }

  getWarehouseStock(warehouseId: number) {
    this.warehouseService.getWarehouseStock(2).subscribe({
      next: (data: StocksDTO[]) => {
        this.rowData = data;
      },
      error: (error) => {
        console.error("There was an error!", error);
      },
    });
  }

  createInterBranchTransfer(steelCoilId: number) {
    this.showAlert = false;
    const dialog = this.modalService.open<AmountModalComponent>(
      AmountModalComponent,
      { data: { steel: true } }
    );

    dialog.afterClosed().subscribe((mtrsDateFormInput: AmountDate) => {
      if (!mtrsDateFormInput) {
        return;
      }

      const consignmentStock = this.rowData.find(
        (stock) => stock.steelCoilId === steelCoilId
      );

      if (mtrsDateFormInput.mtrs > consignmentStock.meterRemaining) {
        this.alert = {
          type: "warning",
          message:
            "This amount would put the steel coil into negative balance. Please enter a valid amount.",
        };

        this.showAlert = true;
        return;
      }

      const interBranchTransfer: SteelCoilInterBranchTransfer = {
        date: mtrsDateFormInput.date,
        steelCoilIdFrom: steelCoilId,
        mtrs: mtrsDateFormInput.mtrs,
      };

      this.interBranchTransferService
        .addSteelCoilInterBranchTransfer(interBranchTransfer)
        .subscribe({
          next: (data) => {
            this.getWarehouseStock(2);
          },
          error: (error) => {
            console.error("There was an error!", error);
          },
        });
    });
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    params.api.setGridOption("domLayout", "autoHeight");
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

  exportToExcel() {
    this.gridApi.exportDataAsExcel();
  }

  onFirstDataRendered(params: FirstDataRenderedEvent) {
    params.api.createCrossFilterChart({
      chartType: "column",
      cellRange: {
        columns: ["color", "meterRemaining"],
      },
      aggFunc: "sum",
      chartThemeOverrides: {
        common: {
          title: {
            enabled: true,
            text: "Product Type Quantities",
          },
        },
        pie: {
          series: {
            title: {
              enabled: false,
            },
            calloutLabel: {
              enabled: false,
            },
          },
        },
      },
      chartContainer: document.getElementById(this.chart),
    });
  }

  sumAndRound(values) {
    const sum = values.reduce((acc, value) => acc + (value || 0), 0);
    return Math.round(sum * 100) / 100;
  }

  ngOnDestroy(): void {
    this.searchValue?.reset("");
  }
}
