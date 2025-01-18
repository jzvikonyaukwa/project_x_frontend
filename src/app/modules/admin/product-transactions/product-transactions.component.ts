import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  ColDef,
  GridApi, GridOptions,
  GridReadyEvent,
  IServerSideDatasource, IServerSideGetRowsParams,
   StatusPanelDef
} from "ag-grid-community";
import { ProductTransactionService } from "./services/product-transaction.service";
import { MatIconModule } from "@angular/material/icon";
import { AgGridModule } from "ag-grid-angular";
import { PageHeadingComponent } from "@layout/common/page-heading/page-heading.component";
import { MatButtonModule } from "@angular/material/button";
import { ProductTransactionGridData } from "./models/productTransactionDetails";
import {formatDate} from "@shared/utils/format-date";

@Component({
  selector: "app-product-transactions",
  standalone: true,
  imports: [
    CommonModule,
    AgGridModule,
    MatIconModule,
    PageHeadingComponent,
    MatButtonModule,
  ],
  templateUrl: "./product-transactions.component.html",
  styleUrls: ["./product-transactions.component.scss"],
})
export class ProductTransactionsComponent implements OnInit {
  public gridOptions: GridOptions = {
    pagination : true,
    paginationPageSize : 10,
    // cacheBlockSize : 10, // HERE BE DRAGONS
    paginationPageSizeSelector : [10, 20, 30, 50, 100],
    rowModelType : "serverSide",
    getRowId: (params) => params.data.id,
  };

  public defaultColDef: ColDef = {
    sortable: true,
    unSortIcon: true,
    floatingFilter: true,
    resizable: true,
    headerClass: "ag-grid-header",
    wrapHeaderText: true,
    filter: true,
    flex: 1,
  };
  public rowSelection: "single" | "multiple" = "multiple";
  public statusBar: {
    statusPanels: StatusPanelDef[];
  } = {
    statusPanels: [
      { statusPanel: "agSelectedRowCountComponent" },
      { statusPanel: "agAggregationComponent" },
    ],
  };

  public productTransactions: ProductTransactionGridData[];

  private gridApi: GridApi;

  public productTransactionColDefs: ColDef[] = [
    {
      headerName: "Transaction ID",
      field: "id",
      width: 130,
      filter: "agNumberColumnFilter",
    },
    {
      headerName: "Date",
      field: "date",
      width: 150,
      filter: "agDateColumnFilter",
    },
    {
      headerName: "Type",
      field: "type",
      width: 150,
      filter: "agTextColumnFilter",
    },
    {
      headerName: "Steel Coil ID",
      field: "steelCoilId",
      width: 150,
      filter: "agNumberColumnFilter",
    },
    {
      headerName: "Coil Number",
      field: "coilNumber",
      width: 150,
      filter: "agTextColumnFilter",
    },
    {
      headerName: "Product ID",
      field: "productId",
      width: 150,
      filter: "agNumberColumnFilter",
    },
    {
      headerName: "Product Length",
      field: "productLength",
      width: 150,
      filter: "agNumberColumnFilter",
    },
    {
      headerName: "Steel coil width",
      field: "steelCoilWidth",
      width: 150,
      filter: "agNumberColumnFilter",
    },
    {
      headerName: "Gauge",
      field: "gauge",
      width: 150,
      filter: "agNumberColumnFilter",
    },
    {
      headerName: "Color",
      field: "color",
      width: 150,
      filter: "agNumberColumnFilter",
    },
    {
      headerName: "Product type ",
      field: "productType",
      width: 150,
      filter: "agNumberColumnFilter",
    },

  ];

  constructor(private productTransactionService: ProductTransactionService) {}

  ngOnInit(): void {

  }

  transformData(data: any[]): ProductTransactionGridData[] {
    if (!data) {
      console.warn('Received undefined data for transformation');
      return [];
    }

    return data.map((item) => {
      let type = "";
      let productId = 0;
      let productLength = 0;

      console.log("item", item.manufacturedProductId);
      if (item.manufacturedProductId) {
        type = "Manufactured Product";
        productId = item.manufacturedProductId;
        productLength = item.length;
      } else if (item.wastageId) {
        type = "Wastage";
        productId = item.wastageId;
        productLength = item.mtrsWasted;
      } else if (item.stockOnHandId) {
        type = "Stock On Hand";
        productId = item.stockOnHandId;
        productLength = item.stockOnHandLength;
      }
      else {
        type ="Manufactured Product"
        productId = item.productId;
        productLength =item.length

      }

      return {
        id: item.id,
        date: (item.date),
        type,
        steelCoilId: item.steelCoilId,
        coilNumber: item.coilNumber,
        productId,
        productLength,
        steelCoilWidth: item.steelCoilWidth,
        gauge:item.gauge,
        color:item.color,
        productType:item.productType

      };
    });
  }

  onGridReady(params: GridReadyEvent<any>) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
    params.api.setGridOption("domLayout", "autoHeight");
    params.api!.setGridOption("serverSideDatasource", this.dataSource);

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
    const element = document?.querySelector(selector);
    if (element) {
      element.innerHTML = text;
    } else {
      console.warn(`Element not found for selector: ${selector}`);
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

  dataSource: IServerSideDatasource = {
    getRows: (params: IServerSideGetRowsParams) => {

      const request = params.request;
      const filters = request.filterModel;

      const filterParams = Object.keys(filters).map(key => {
        const filter = filters[key];
        if (filter.filterType === 'date') {
          const dateFilter = new Date(filter.dateFrom);
          const formattedDate = `${dateFilter.getFullYear()}`+"-"+`${(dateFilter.getMonth() + 1).toString().padStart(2, '0')}`+"-"+`${dateFilter.getDate().toString().padStart(2, '0')}`;
          return `${key}:date:${filter.type}:${formattedDate}`;
        }
        return `${key}:${filter.filterType}:${filter.type}:${filter.filter}`;
      }).join(',');

      console.log("Requested startRow:", params.request.startRow, "endRow:", params.request.endRow);
      const startRow = params.request.startRow;
      const endRow = params.request.endRow;
      const pageSize = endRow - startRow;

      this.productTransactionService.getAllProductTransactionsDetails(startRow / pageSize, pageSize, filterParams).subscribe({
        next: (response) => {
          console.log("Data fetched:", response);
          if (!response || !Array.isArray(response.productTransactionDetails)) {
            console.error("Expected 'productTransactionsDetails' as an array, got:", response.productTransactionDetails);
            params.fail();
            return;
          }
          const transformedData = this.transformData(response.productTransactionDetails);
          console.log("Transformed Data Length:", transformedData.length);

          params.success({
            rowData: transformedData,
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


  public onPageSizeChanged(): void {}

  onBtExport() {
    this.gridApi.exportDataAsExcel();
  }
}