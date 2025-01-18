import { CommonModule } from "@angular/common";
import { Component, DestroyRef, OnInit } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { AgGridModule } from "ag-grid-angular";
import { ColDef, GridApi, GridReadyEvent } from "ag-grid-enterprise";
import { ConsignorsService } from "../services/consignors.service";
import { ActivatedRoute, Params } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ConsignorSteelCoil } from "../models/consignor-steel-coils";
import { DEFAULTCOLUMNDEF } from "app/utilities/ag-grid/defaultColumnDef";
import { getFirstTwoWords } from "app/utilities/ag-grid/GetFirstTwoWords";

@Component({
  selector: "app-consignor-steel-coil-table",
  templateUrl: "./consignor-steel-coil-table.component.html",
  styleUrls: ["./consignor-steel-coil-table.component.scss"],
  standalone: true,
  imports: [CommonModule, AgGridModule, MatIconModule],
})
export class ConsignorSteelCoilTableComponent {
  public pagination = true;
  public paginationPageSize = "10";
  public defaultColDef: ColDef = DEFAULTCOLUMNDEF;
  public consignorSteelCoils: ConsignorSteelCoil[];
  public consignorId: number;

  private gridApi: GridApi;

  public steelCoilColDefs: ColDef[] = [
    { headerName: "COIL ID", field: "steelCoilId", width: 140 },
    { headerName: "COIL NUMBER", field: "coilNumber", width: 150 },
    { headerName: "CARD NUMBER", field: "cardNumber", width: 150 },
    { headerName: "CONSIGNOR", field: "consignor", width: 150 },
    { headerName: "COLOR", field: "color", width: 150 },
    { headerName: "GAUGE", field: "gauge", width: 130 },
    { headerName: "WIDTH", field: "width", width: 130 },
    { headerName: "COATING", field: "coating", width: 150 },
    { headerName: "ISQ GRADE", field: "isqGrade", width: 130 },
    { headerName: "METERS REMAINING", field: "estMtrsRemaining", width: 170 },
    { headerName: "METERS ON ARRIVAL", field: "estMtrsOnArrival", width: 170 },
    {
      headerName: "SUPPLIER NAME",
      field: "supplierName",
      width: 150,
      valueFormatter: (params) => getFirstTwoWords(params.value),
    },
    { headerName: "WEIGHT ARRIVAL", field: "weightInKgsOnArrival", width: 150 },
    {
      headerName: "LANDING COST PER MTR",
      field: "landedCostPerMtr",
      width: 150,
      valueFormatter: (params) => {
        return params.value.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        });
      },
    },
    {
      headerName: "Total Landed Cost",
      field: "landedCostPerMtr",
      width: 150,
      valueFormatter: function (params) {
        const rowData = params.data;
        const totalCost =
          rowData.weightInKgsOnArrival * rowData.landedCostPerMtr;
        return totalCost.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        });
      },
    },
    {
      headerName: "Remaining Cost",
      field: "landedCostPerMtr",
      width: 150,
      valueFormatter: function (params) {
        const rowData = params.data;
        const totalCost = rowData.estMtrsRemaining * rowData.landedCostPerMtr;
        return totalCost.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        });
      },
    },
  ];

  constructor(
    private _consignorsService: ConsignorsService,
    private _activatedRoute: ActivatedRoute,
    private _destroyRef: DestroyRef
  ) {
    _activatedRoute.paramMap
      .pipe(takeUntilDestroyed(_destroyRef))
      .subscribe((par: Params) => (this.consignorId = par.params.id));
    _consignorsService.getConsignorSteelCoils(this.consignorId).subscribe({
      next: (steelCoils) => {
        console.log(steelCoils);
        this.consignorSteelCoils = steelCoils;
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
        "#lbCurrentPage1",
        this.gridApi.paginationGetCurrentPage() + 1
      );
      this.setText("#lbTotalPages1", this.gridApi.paginationGetTotalPages());
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
