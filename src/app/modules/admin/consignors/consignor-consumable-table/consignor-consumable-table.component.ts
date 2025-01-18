import { CommonModule } from "@angular/common";
import { Component, DestroyRef } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Params } from "@angular/router";
import { ColDef, GridApi, GridReadyEvent } from "ag-grid-enterprise";
import { DEFAULTCOLUMNDEF } from "app/utilities/ag-grid/defaultColumnDef";
import { forkJoin } from "rxjs";
import { ConsignorConsumable } from "../models/consignor-consumables";
import { ConsignorSteelCoil } from "../models/consignor-steel-coils";
import { ConsignorsService } from "../services/consignors.service";
import { AgGridModule } from "ag-grid-angular";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: "app-consignor-consumable-table",
  templateUrl: "./consignor-consumable-table.component.html",
  styleUrls: ["./consignor-consumable-table.component.scss"],
  standalone: true,
  imports: [CommonModule, AgGridModule, MatIconModule],
})
export class ConsignorConsumableTableComponent {
  public pagination = true;
  public paginationPageSize = "10";
  public defaultColDef: ColDef = DEFAULTCOLUMNDEF;
  public consignorConsumables: ConsignorConsumable[];
  public consignorSteelCoils: ConsignorSteelCoil[];
  public consignorId: number;

  private gridApi: GridApi;

  public consumableColDefs: ColDef[] = [
    { headerName: "CONSUMABLE ID", field: "consumable.id", width: 150 },
    { headerName: "CONSUMABLE NAME", field: "consumable.name", width: 150 },
    { headerName: "CONSIGNOR", field: "consignor", width: 150 },
    { headerName: "QUANTITY", field: "qty", width: 150 },
    { headerName: "AVERAGE LANDED PRICE", field: "avgLandedPrice", width: 150 },
    {
      headerName: "SERIAL NUMBER",
      field: "consumable.serialNumber",
      width: 150,
    },
    { headerName: "UNIT OF MEASURE", field: "consumable.uom", width: 150 },
    {
      headerName: "MIN QTY ALERT OWNED",
      field: "consumable.minQtyAlertOwned",
      width: 150,
    },
    {
      headerName: "MIN QTY ALERT CONSIGNMENT",
      field: "consumable.minQtyAlertConsignment",
      width: 150,
    },
    {
      headerName: "SOURCE COUNTRY",
      field: "consumable.sourceCountry.country",
      width: 150,
    },
    {
      headerName: "CATEGORY NAME",
      field: "consumable.category.name",
      width: 150,
    },
    { headerName: "WAREHOUSE NAME", field: "warehouse.name", width: 150 },
  ];

  constructor(
    private _consignorsService: ConsignorsService,
    private _activatedRoute: ActivatedRoute,
    private _destroyRef: DestroyRef
  ) {
    _activatedRoute.paramMap
      .pipe(takeUntilDestroyed(_destroyRef))
      .subscribe((par: Params) => (this.consignorId = par.params.id));
    _consignorsService.getConsignorConsumables(this.consignorId).subscribe({
      next: (consumable) => {
        this.consignorConsumables = consumable;
      },
      error: (err) => {
        throw new Error(err);
      },
    });
  }

  onGridReady(params: GridReadyEvent<any>) {
    this.gridApi = params.api;
    params.api.setGridOption("domLayout", "autoHeight");
  }

  onPaginationChanged() {
    if (this.gridApi!) {
      this.setText(
        "#lbCurrentPage",
        this.gridApi.paginationGetCurrentPage() + 1
      );
      this.setText("#lbTotalPages", this.gridApi.paginationGetTotalPages());
    }
  }

  onBtNext() {
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

  public onPageSizeChanged(): void {
    const value = (document.getElementById("page-size") as HTMLInputElement)
      .value;
    this.paginationPageSize = value;
    this.gridApi.paginationSetPageSize(Number(value));
  }
}
