import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { COLUMN_DEFINITIONS } from "app/utilities/ag-grid/column-definitions";
import { ColDef, GridApi, GridReadyEvent } from "ag-grid-enterprise";
import { AgGridModule } from "ag-grid-angular";
import { InventoryItem } from "app/modules/admin/inventory/models/inventoryItem";
import { QuotePrice } from "@shared/models/quotePrice";

@Component({
  selector: "app-items-in-inventory",
  standalone: true,
  imports: [CommonModule, AgGridModule],
  templateUrl: "./items-in-inventory.component.html",
  styleUrls: ["./items-in-inventory.component.scss"],
})
export class ItemsInInventoryComponent {
  public defaultColDef: ColDef = COLUMN_DEFINITIONS;
  public pagination = true;
  public gridApi!: GridApi<InventoryItem>;
  public paginationPageSize = "10";

  rowData: InventoryItem[] = [

  ];

  public columnDefs: ColDef[] = [
    { headerName: "ID", field: "id", width: 150 },
    { headerName: "DATE IN", field: "date_in", width: 150 },
    { headerName: "DATE OUT", field: "date_out", width: 150 },
    {
      headerName: "Type",
      field: "id",
      valueFormatter: (params) => {
        if (params.data.manufacturedProduct) {
          return "Manufactured Product";
        } else if (params.data.consumableOnQuote) {
          return "Consumable";
        }
      },
      width: 150,
    },
    {
      headerName: "Name",
      field: "id",
      valueFormatter: (params) => {
        if (params.data.manufacturedProduct) {
          return (
            params.data.manufacturedProduct.frameName +
            " " +
            params.data.manufacturedProduct.frameType
          );
        } else if (params.data.consumableOnQuote) {
          return params.data.consumableOnQuote.consumable.name;
        }
      },
      width: 150,
    },
    {
      headerName: "Length/Quantity",
      field: "id",
      valueFormatter: (params) => {
        if (params.data.manufacturedProduct) {
          return params.data.manufacturedProduct.length;
        } else if (params.data.consumableOnQuote) {
          return params.data.consumableOnQuote.qty;
        }
      },
      width: 150,
    },
    {
      headerName: "Delivery Note ID",
      field: "deliveryNoteId",
      width: 150,
    },
  ];

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
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
}
