import {
  Component,
  DestroyRef,
  Input,
  OnDestroy,
  OnInit,
  inject,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { AgGridModule } from "ag-grid-angular";
import { ColDef, GridApi, GridReadyEvent } from "ag-grid-enterprise";
import { Router } from "@angular/router";
import { AccessButtonAgGridComponent } from "../../../../utilities/ag-grid/access-button-ag-grid/access-button-ag-grid.component";
import { COLUMN_DEFINITIONS } from "app/utilities/ag-grid/column-definitions";
import "ag-grid-enterprise";
import { MatIconModule } from "@angular/material/icon";
import { FormControl } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { getFirstTwoWords } from "app/utilities/ag-grid/GetFirstTwoWords";
import { StocksDTO } from "@shared/models/stockDetailsDTO";
import { MatButtonModule } from "@angular/material/button";
import { WarehouseService } from "../../warehouses/warehouse.service";
import { formatQuantityWithDecimals } from "app/utilities/ag-grid/formatQuantityWithDecimals";
import { StatusCellRenderer } from "app/utilities/ag-grid/cell-render/status-cell-renderer.component";

@Component({
  selector: "app-product-coils",
  standalone: true,
  imports: [CommonModule, AgGridModule, MatIconModule, MatButtonModule],
  templateUrl: "./product-coils.component.html",
  styleUrls: ["./product-coils.component.scss"],
})
export class ProductCoilsComponent implements OnInit, OnDestroy {
  private warehouseService = inject(WarehouseService);
  private _router = inject(Router);

  @Input() productName: string;
  @Input("searchValue") searchValue: FormControl<string>;

  public pagination = true;
  public paginationPageSize = "20";
  public paginationPageSizeSelector = [10, 20, 50, 100];
  public totalReceived: number = 0;
  public totalRemaining: number = 0;
  public gridApi!: GridApi<any>;
  public rowData: StocksDTO[];
  public columnDefs: ColDef[] = [
    {
      headerName: "COLOR",
      field: "color",
      width: 140,
      floatingFilter: true,
      filter: "agMultiColumnFilter",
      suppressFloatingFilterButton: true,
    },
    {
      headerName: "SUPPLIER",
      field: "supplierName",
      onCellClicked: (event) => {
        this._router.navigate(["stocks", event.node.data.coilNumber]);
      },
      width: 150,
      valueGetter: (params) => getFirstTwoWords(params.data.supplier),
    },
    {
      headerName: "GAUGE",
      field: "gauge",
      width: 110,
      floatingFilter: true,
      filter: "agMultiColumnFilter",
      suppressFloatingFilterButton: true,
    },
    {
      headerName: "WIDTH",
      field: "width",
      width: 110,
      floatingFilter: true,
      filter: "agMultiColumnFilter",
      suppressFloatingFilterButton: true,
    },
    {
      headerName: "CARD NUMBER",
      field: "cardNumber",
      width: 130,
      floatingFilter: true,
      filter: "agMultiColumnFilter",
      suppressFloatingFilterButton: true,
      
    },
    {
      headerName: "COIL NUMBER",
      field: "coilNumber",
      width: 160,
      floatingFilter: true,
      filter: "agMultiColumnFilter",
      suppressFloatingFilterButton: true,
    },
    {
      headerName: 'STATUS',
      field: 'status',
      width: 120,
      cellRenderer: StatusCellRenderer,
      cellRendererParams: {
        estMtrsOnArrival: 'estMtrsOnArrival',
        meterRemaining: 'meterRemaining'
      },
      filter: 'agSetColumnFilter',
      valueGetter: (params) => { 
        const estMtrsOnArrival = params.data.estMtrsOnArrival;
        const meterRemaining = params.data.meterRemaining;
        const status = estMtrsOnArrival === meterRemaining ? 'UNOPENED' : 'OPENED';
        return status;
      },
      headerClass: 'header-status',
    },
    {
      headerName: "METERS RECEIVED",
      field: "estMtrsOnArrival",
      valueFormatter: (params) => {
        return formatQuantityWithDecimals(params);
      },
      width: 130,
    },
    {
      headerName: "METERS USED",
      field: "metersUsed",
      width: 130,
      cellClass: 'text-orange-500',
      valueGetter: (params) => {
        const estMtrsOnArrival = params.data.estMtrsOnArrival;
        const meterRemaining = params.data.meterRemaining;
        return estMtrsOnArrival - meterRemaining;
      },
      valueFormatter: (params) => {
        return formatQuantityWithDecimals(params);
      },
    },
    {
      headerName: "METERS REMAINING",
      width: 130,
      field: "meterRemaining",
      cellClass: 'text-green-500',
      aggFunc: "sum",
      chartDataType: "category",
      valueFormatter: (params) => {
        return formatQuantityWithDecimals(params);
      },
    },
    {
      field: "steelCoilId",
      headerName: "ACCESS",
      width: 110,
      cellRenderer: AccessButtonAgGridComponent,
      cellRendererParams: {
        onClick: (id: number) => this._router.navigate(["/stocks", id]),
      },
    },
  ];
  public defaultColDef: ColDef = COLUMN_DEFINITIONS;

  statuses = {
    all: 'All',
    OPENED: 'Opened',
    UNOPENED: 'Unopened'
  };
  statusEntries = Object.entries(this.statuses);
  activeTab = 'all';

  constructor(private destroyRef: DestroyRef) {}

  ngOnInit(): void {
    this.warehouseService
      .getAllSteelCoilsForProduct(this.productName)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
        this.rowData = data;
        this.stockCalculations(data);
      });

    this.searchValue?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value: string) => {
        if (this.gridApi && !this.gridApi?.isDestroyed()) {
          this.gridApi.setGridOption("quickFilterText", value);
        }
      });
  }

  stockCalculations(rowData: StocksDTO[]) {
    console.log("rowData: ", rowData);
    if (rowData && rowData.length) {
      rowData.map((data) => {
        this.totalReceived += data.estMtrsOnArrival;
        this.totalRemaining += data.meterRemaining;
      });
    }
    console.log(this.totalReceived, this.totalRemaining);
      
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
    this.gridApi.setGridOption("domLayout", "autoHeight");
  }

  exportToExcel() {
    this.gridApi.exportDataAsExcel();
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

  handleTabClick(status: string) {
    const filterModel = this.gridApi.getFilterModel() || {};
    if (status === 'all') {
      delete filterModel['status'];
    } else {
      filterModel['status'] = {
        filterType: 'set',
        values: [status],
      };
    }

    this.gridApi.setFilterModel(filterModel);
    this.gridApi.onFilterChanged();
    this.activeTab = status;
  }

  ngOnDestroy(): void {
    this.searchValue?.reset("");
  }

  trackByFn(index: number, item: any): any {
    return item[0]; // Assuming the first element of the status array is unique
  }

  statusFormatter(params: any) {
    if (params.value === 'OPENED') return 'Opened';
    if (params.value === 'UNOPENED') return 'Unopened';
    return params.value ? params.value : '';
  }
}
