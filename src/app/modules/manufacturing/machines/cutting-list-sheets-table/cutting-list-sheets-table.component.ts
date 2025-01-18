import { Component, Input, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AgGridModule } from "ag-grid-angular";
import { ProductSummaryDTO } from "../../../admin/cutting-lists/models/productSummaryDTO";
import { ColDef, GridReadyEvent } from "ag-grid-community";

@Component({
  selector: "app-cutting-list-sheets-table",
  standalone: true,
  imports: [CommonModule, AgGridModule],
  templateUrl: "./cutting-list-sheets-table.component.html",
})
export class CuttingListSheetsTableComponent implements OnInit {
  @Input() sheetRowData: ProductSummaryDTO[];

  public columnDefs: ColDef[] = [
    { headerName: "Code", field: "sheetCode" },
    { headerName: "Length", field: "length" },
    { headerName: "Amount", field: "amount" },
    { headerName: "Status", field: "sheetStatus" },
  ];

  public defaultColDef: ColDef = {
    sortable: true,
  };

  public autoGroupColumnDef: ColDef = {
    minWidth: 200,
  };

  ngOnInit(): void {
    console.log("sheetRowData ", this.sheetRowData);
  }

  onGridReady(params: GridReadyEvent) {
    params.api.sizeColumnsToFit();
  }
}
