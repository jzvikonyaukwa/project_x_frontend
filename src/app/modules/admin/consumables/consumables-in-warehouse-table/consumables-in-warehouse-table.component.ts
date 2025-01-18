import {
  Component,
  DestroyRef,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from "@angular/core";
import { ColDef, GridApi, GridReadyEvent, RowClassParams, RowStyle } from "ag-grid-enterprise";
import { AgGridModule } from "ag-grid-angular";
import { CommonModule } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { capitalizeFirstLetter } from "app/utilities/ag-grid/capitalizeFirstLetterFormatter";
import { FormControl } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { currencyFormatter } from "app/utilities/ag-grid/currencyFormatter";
import { AccessButtonAgGridComponent } from "app/utilities/ag-grid/access-button-ag-grid/access-button-ag-grid.component";
import { ModalService } from "@shared/services/modal.service";
import { AmountModalComponent } from "../../inter-branch-transfers/amount-modal/amount-modal.component";
import { AmountDate } from "../../inter-branch-transfers/models/amountDate";
import { ConsumableInterBranchTransfer } from "../../inter-branch-transfers/models/consumableInterBranchTransfer";
import { InterBranchTransferService } from "../../inter-branch-transfers/services/inter-branch-transfer.service";
import { ConsumablesInWarehouseService } from "../services/consumables-in-warehouse.service";
import { ConsumableInWarehouse } from "../models/consumableInWarehouse";
import { DEFAULTCOLUMNDEF } from "app/utilities/ag-grid/defaultColumnDef";
import { MatButtonModule } from "@angular/material/button";
import { formatWholeQuantity } from "app/utilities/ag-grid/formatWholeQuantity";
import { Router } from "@angular/router";

@Component({
  selector: "app-consumable-in-warehouse-table",
  templateUrl: "./consumables-in-warehouse-table.component.html",
  styleUrls: ["./consumables-in-warehouse-table.component.scss"],
  standalone: true,
  imports: [CommonModule, AgGridModule, MatIconModule, MatButtonModule],
})
export class ConsumablesInWarehouseTableComponent
  implements OnChanges, OnDestroy {
  public pagination = true;
  public paginationPageSize = "20";
  public paginationPageSizeSelector = [10, 20, 50, 100];
  @Input("searchValue") searchValue: FormControl<string>;
  @Input() refreshTable: boolean = false;
  @Input() warehouseId: number;

  private gridApi: GridApi;
  consumables: ConsumableInWarehouse[];
  rowData: ConsumableInWarehouse[];

  public columnDefs: ColDef[] = [];

  public defaultColDef: ColDef = DEFAULTCOLUMNDEF;

  private readonly _router = inject(Router);
  private readonly consumableInWarehouseService = inject(ConsumablesInWarehouseService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly interBranchTransferService = inject(InterBranchTransferService);
  private readonly modalService = inject(ModalService);

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.warehouseId) {
      this.warehouseId = changes.warehouseId.currentValue;
      console.log("warehouseId: ", this.warehouseId);

      this.getConsumablesForOwnedWarehouse();
      this.initializeColumnDefs();
    }
  }

  private initializeColumnDefs(): void {
    let isConsignment: boolean = false;

    if (this.warehouseId === 1) {
      console.log("Not consignment");
      isConsignment = false;
    } else {
      console.log("consignment");
      isConsignment = true;
    }

    this.columnDefs = [
      { headerName: "ID", field: "id", width: 110, cellClass: "text-right", },
      {
        headerName: "SERIAL #",
        field: "consumable.serialNumber",
        tooltipField: "consumable.serialNumber",
        cellClass: "text-right",
        width: 110,
      },
      { headerName: "NAME", field: "consumable.name", tooltipField: 'consumable.name', width: 300 },
      {
        headerName: "CATEGORY",
        valueFormatter: (params) => capitalizeFirstLetter(params.value),
        field: "consumable.category.name",
        tooltipField: "consumable.category.name",
        width: 110,
      },
      {
        headerName: "UOM",
        field: "consumable.uom",
        cellClass: "text-center",
        width: 110,
        valueFormatter: (params) => capitalizeFirstLetter(params.value),
      },
      {
        headerName: "AVG LANDED PRICE",
        field: "avgLandedPrice",
        cellClass: "text-right",
        width: 130,
        valueFormatter: currencyFormatter,
      },
      {
        headerName: "AVAILABLE STOCK",
        field: "qty",
        editable: true,
        width: 130,
        cellClass: (params: any) => {
          const qty = params.value;
          const minQtyAlertOwned = params.data.consumable.minQtyAlertOwned;
          return qty < minQtyAlertOwned ? ['text-right', 'text-red-500']: 'text-right';
        },
        valueFormatter: (params) => {
          return formatWholeQuantity(params);
        },
      },
      {
        headerName: "STOCK VALUE",
        cellClass: "text-right",
        valueGetter: (value) => this.getTotalCost(value.data),
        valueFormatter: currencyFormatter,
        width: 150,
      },
      {
        headerName: "SOURCE",
        field: "consumable.sourceCountry.country",
        width: 130,
        valueFormatter: (params) => capitalizeFirstLetter(params.value),
      },
      // Move to Owned Stock
      {
        headerName: "TRANSFER TO OWNED",
        field: "id",
        width: 180,
        filter: false,
        cellRenderer: AccessButtonAgGridComponent,
        cellRendererParams: {
          onClick: (consumableInWarehouseId: number) => {
            this.createInterBranchConsumableTransfer(consumableInWarehouseId);
          },
        },
        hide: !isConsignment,
      },
      {
        field: "consumable.id",
        headerName: "HISTORY",
        width: 110,
        filter: false,
        cellRenderer: AccessButtonAgGridComponent,
        cellRendererParams: {
          onClick: (consumableID: number) => this._router.navigate(["stocks/history", this.warehouseId, consumableID]),
        },
      },
    ];
  }

  getConsumablesForOwnedWarehouse() {
    if (!this.warehouseId) return;
    this.consumableInWarehouseService
      .getAllConsumablesInWarehouse(this.warehouseId)
      .subscribe((consumables: ConsumableInWarehouse[]) => {
        this.consumables = consumables;
        this.rowData = consumables;
      });

    this.searchValue?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value: string) => {
        if (this.gridApi && !this.gridApi?.isDestroyed()) {
          this.gridApi.setGridOption("quickFilterText", value);
        }
      });
  }

  createInterBranchConsumableTransfer(consumableInWarehouseId: number) {
    const dialog = this.modalService.open<AmountModalComponent>(
      AmountModalComponent,
      {
        data: { steel: false },
      }
    );

    dialog.afterClosed().subscribe((mtrsDateFormInput: AmountDate) => {
      if (!mtrsDateFormInput) {
        return;
      }

      const interBranchTransfer: ConsumableInterBranchTransfer = {
        date: mtrsDateFormInput.date,
        consumableInWarehouseFromId: consumableInWarehouseId,
        qty: mtrsDateFormInput.mtrs,
      };

      this.interBranchTransferService
        .addConsumableInterBranchTransfer(interBranchTransfer)
        .subscribe({
          next: (data) => {
            this.getConsumablesForOwnedWarehouse();
          },
          error: (error) => {
            console.error("There was an error!", error);
          },
        });
    });
  }

  onGridReady(params: GridReadyEvent<any>) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
    params.api.setGridOption("domLayout", "autoHeight");
  }

  exportToExcel() {
    this.gridApi.exportDataAsExcel();
  }

  getTotalCost(consumable: ConsumableInWarehouse): string {
    switch (consumable.consumable.uom) {
      case "each":
        return (consumable.qty * consumable.avgLandedPrice).toFixed(2);
    }
  }

  lastRowBorder(params: RowClassParams): RowStyle {
    return {
        "background-color": params.node.rowIndex % 2 !== 0 ? "#EFF7FC" : "#FFFFFF",
    };
  }

  public onPageSizeChanged(): void {
    const value = (document.getElementById("page-size") as HTMLInputElement)
      .value;
    this.paginationPageSize = value;
    this.gridApi.paginationSetPageSize(Number(value));
  }

  ngOnDestroy(): void {
    this.searchValue?.reset("");
  }
}
