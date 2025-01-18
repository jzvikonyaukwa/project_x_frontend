import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DeliveryNote } from "./models/delivery-note";
import { ColDef, GridApi, GridReadyEvent } from "ag-grid-enterprise";
import { AgGridModule } from "ag-grid-angular";
import { COLUMN_DEFINITIONS } from "app/utilities/ag-grid/column-definitions";
import { PageHeadingComponent } from "@layout/common/page-heading/page-heading.component";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { Observable } from "rxjs";
import { DeliveryNotesService } from "./services/delivery-notes.service";
import { AccessButtonAgGridComponent } from "app/utilities/ag-grid/access-button-ag-grid/access-button-ag-grid.component";
import { Router } from "@angular/router";

@Component({
  selector: "app-delivery-notes",
  standalone: true,
  imports: [
    CommonModule,
    AgGridModule,
    PageHeadingComponent,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: "./delivery-notes.component.html",
  styleUrls: ["./delivery-notes.component.scss"],
})
export class DeliveryNotesComponent {
  public pagination = true;
  public gridApi!: GridApi<DeliveryNote>;
  public paginationPageSize = "10";
  public paginationPageSizeSelector: number[] | boolean = [10, 20, 50];
  rowData: Observable<DeliveryNote[]> =
    this.deliveryNoteService.getAllDeliveryNotes();

  public columnDefs: ColDef[] = [
    {
      headerName: "Delivery Note ID",
      field: "id",
      width: 120,
      sortable: true,
      filter: true,
    },
    {
      headerName: "Date Created",
      field: "dateCreated",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Date Delivered",
      field: "dateDelivered",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Delivery Address",
      field: "deliveryAddress",
      sortable: true,
      filter: true,
    },
    // {
    //   headerName: "Number of Items",
    //   field: "inventories",
    //   sortable: true,
    //   filter: true,
    //   valueGetter: (params) => {
    //     if (Array.isArray(params.data.inventories)) {
    //       return params.data.inventories.length;
    //     }
    //     return 0; // or return a suitable default value if inventories is not an array
    //   },
    // },
    {
      headerName: "Status",
      field: "status",
      // cellRenderer: (params) => {
      //   const select = document.createElement("select");
      //   const statuses = ["DELIVERED", "PENDING_DELIVERY", "DELIVERY_FAILED"];
      //   statuses.forEach((status) => {
      //     const option = document.createElement("option");
      //     option.value = status;
      //     option.text = status.replace(/_/g, ' ');
      //     if (params.value === status) {
      //       option.selected = true;
      //     }
      //     select.appendChild(option);
      //   });

      //   select.addEventListener("change", (event) => {
      //     const newStatus = (event.target as HTMLSelectElement).value;
      //     params.data.status = newStatus;
      //     this.updateDeliveryNoteStatus(params.data.id, newStatus);
      //   });

      //   return select;
      // },
      // sortable: true,
      // filter: true,
    },
    {
      field: "id",
      headerName: "View Delivery Note",
      cellRenderer: AccessButtonAgGridComponent,
      width: 150,
      cellRendererParams: {
        onClick: (deliveryNodeId: number) =>
          this._router.navigate(["/delivery-note", deliveryNodeId]),
      },
    },
  ];

  public defaultColDef: ColDef = COLUMN_DEFINITIONS;

  constructor(
    private deliveryNoteService: DeliveryNotesService,
    private _router: Router
  ) {}

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

  updateDeliveryNoteStatus(id: number, status: string): void {
    this.deliveryNoteService.updateDeliveryNoteStatus(id, status).subscribe(
      () => {
        console.log("Status updated successfully");
      },
      (error) => {
        console.error("Error updating status", error);
      }
    );
  }
}
