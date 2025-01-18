import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { InvoicesService } from "./services/invoices.service";
import { Invoice } from "./models/invoice";
import { AgGridModule } from "ag-grid-angular";
import { PageHeadingComponent } from "@layout/common/page-heading/page-heading.component";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { Router, RouterModule } from "@angular/router";
import { AccessButtonAgGridComponent } from "../../../utilities/ag-grid/access-button-ag-grid/access-button-ag-grid.component";
import { InvoicePaidComponent } from "./renderers/invoice-paid-renderer.component";
import { InvoiceExportRendererComponent } from "./renderers/invoice-export-renderer.component";
import {
  ColDef,
  GridApi,
  GridOptions,
  GridReadyEvent,
  IServerSideDatasource,
  IServerSideGetRowsParams
} from "ag-grid-community";

@Component({
  selector: "app-invoices",
  standalone: true,
  imports: [
    CommonModule,
    AgGridModule,
    PageHeadingComponent,
    MatIconModule,
    MatButtonModule,
    RouterModule,
  ],
  templateUrl: "./invoices.component.html",
  styleUrls: ["./invoices.component.scss"],
})
export class InvoicesComponent implements OnInit {

  public gridOptions: GridOptions = {
    pagination : true,
    paginationPageSize : 20,
    cacheBlockSize : 20,
    paginationPageSizeSelector : [10, 20, 30, 50, 100],
    rowModelType : "serverSide",
    getRowId: (params) => params.data.id,
  };
  public paginationPageSize = '20';


  public defaultColDef: ColDef = {
    sortable: true,
    unSortIcon: true,
    resizable: true,
    headerClass: "ag-grid-header",
    wrapHeaderText: true,
    flex: 1,
  };

  public gridApi: GridApi;

  rowData: Invoice[];

  public columnDefs: ColDef[] = [
    { headerName: "Invoice ID", field: "id", width: 150 },
    {
      field: "dateInvoiced",
      width: 180,
    },
    {
      headerName: "Paid",
      field: "paid",
      width: 150,
      cellRenderer: InvoicePaidComponent,
      cellRendererParams: {
        onClick: (params: any) => this.updatePaidValue(params.paid, params.id),
      },
    },
    { headerName: "Quote ID", field: "quoteId", width: 150 },
    { headerName: "Client", field: "name", width: 150 },
    {
      headerName: "Export",
      field: "id",
      width: 150,
      cellRenderer: InvoiceExportRendererComponent,
      cellRendererParams: {
        onClick: (params: any) => {
          this.router.navigate(["/invoices", params.id], {
            queryParams: { export: true },
          });
        },
      },
    },
    {
      field: "id",
      headerName: "View",
      cellRenderer: AccessButtonAgGridComponent,
      cellRendererParams: {
        onClick: (quoteId: number) =>
          this.router.navigate(["/invoices", quoteId]),
      },
    },
  ];


  constructor(
    private invoicesService: InvoicesService,
    private router: Router
  ) {}

  ngOnInit(): void {
  }

  updatePaidValue(paidStatus: string, invoiceId: number) {
    const invoice = this.rowData.find((invoice) => invoice.id === invoiceId);
    paidStatus === "Yes" ? (invoice.paid = true) : (invoice.paid = false);
    this.invoicesService.updateInvoice(invoice).subscribe({
      next: (response) => {
        console.log(response);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }


  dataSource: IServerSideDatasource = {
    getRows: (params: IServerSideGetRowsParams) => {
      console.log("Requested startRow:", params.request.startRow, "endRow:", params.request.endRow);
      const startRow = params.request.startRow;
      const endRow = params.request.endRow;
      const pageSize = endRow - startRow;

      this.invoicesService.getInvoices(startRow / pageSize, pageSize).subscribe({
        next: (response) => {
          console.log("Data fetched:", response);
          if (!response || !Array.isArray(response.invoice)) {
            console.error("Expected 'invoice DTO' as an array, got:", response.invoice);
            params.fail();
            return;
          }
          this.rowData= response.invoice;

          params.success({
            rowData:  response.invoice,
            rowCount: response.totalElements
          });
        },
        error: (error) => {
          console.error("Error in data source: ", error);
          params.fail();
        }
      });
    }
  };


  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
    params.api.setGridOption("domLayout", "autoHeight");
    params.api!.setGridOption("serverSideDatasource", this.dataSource);
  }

  onPaginationChanged() {
    if (this.rowData!) {
      // Workaround for bug in events order
      if (this.gridApi!) {
        this.setText('#lbCurrentPage', this.gridApi.paginationGetCurrentPage() + 1);
        this.setText('#lbTotalPages', this.gridApi.paginationGetTotalPages());
      }
    }
  }

  onPageSizeChanged(): void {
    const value = (document.getElementById('page-size') as HTMLInputElement).value;
    this.paginationPageSize = value;
    this.gridApi.updateGridOptions({
      paginationPageSize: Number(value),
    });  }

  onBtNext() {
    this.gridApi.paginationGoToNextPage();
  }

  onBtPrevious() {
    this.gridApi.paginationGoToPreviousPage();
  }

  setText(selector: string, text: any) {
    (document.querySelector(selector) as any).innerHTML = text;
  }


  customCellRenderer(params) {
    if (params.value === true) {
      return "Yes";
    } else if (params.value === false) {
      return "No";
    } else {
      return params.value;
    }
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
