import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SaleOrder } from "../models/salesOrder";
import { COLUMN_DEFINITIONS } from "app/utilities/ag-grid/column-definitions";
import { ColDef, GridApi, GridReadyEvent } from "ag-grid-enterprise";
import { Invoice } from "../../invoices/models/invoice";
import { AgGridModule } from "ag-grid-angular";
import { AccessButtonAgGridComponent } from "app/utilities/ag-grid/access-button-ag-grid/access-button-ag-grid.component";
import { Router, RouterModule } from "@angular/router";
import { DeleteButtonAgGridComponent } from "@shared/components/delete-button-ag-grid/delete-button-ag-grid.component";
import { InvoicesService } from "../../invoices/services/invoices.service";
import { SaleOrdersService } from "../services/sale-orders.service";

@Component({
  selector: "app-invoices-on-sale-order-table",
  standalone: true,
  imports: [CommonModule, AgGridModule, RouterModule],
  templateUrl: "./invoices-on-sale-order-table.component.html",
  styleUrls: ["./invoices-on-sale-order-table.component.scss"],
})
export class InvoicesOnSaleOrderTableComponent {
  @Input() saleOrder: SaleOrder;
  private gridApi: GridApi;
  public defaultColDef: ColDef = COLUMN_DEFINITIONS;

  public columnDefs: ColDef[] = [
    { headerName: "ID", field: "id", width: 90 },
    { headerName: "Date Issued", field: "dateInvoiced", width: 150 },
    {
      field: "id",
      headerName: "View Quote",
      width: 90,
      cellRenderer: AccessButtonAgGridComponent,
      cellRendererParams: {
        onClick: (invoiceId: number) =>
          this._router.navigate(["/invoices", invoiceId]),
      },
    },
    {
      field: "id",
      headerName: "Delete",
      width: 90,
      cellRenderer: DeleteButtonAgGridComponent,
      cellRendererParams: {
        onClick: (invocieId: string) => {
          this.delete(Number(invocieId));
        },
      },
    },
  ];

  constructor(
    private _router: Router,
    private invoiceService: InvoicesService,
    private saleOrdersService: SaleOrdersService
  ) {}

  onGridReady(params: GridReadyEvent<Invoice[]>) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
    params.api.setGridOption("domLayout", "autoHeight");
  }

  delete(invocieId: number): void {
    this.invoiceService.deleteInvoice(invocieId).subscribe(() => {
      console.log("Invoice deleted");
      this.saleOrdersService.getSaleOrderById(this.saleOrder.id).subscribe();
    });
  }
}
