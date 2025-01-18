import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridModule } from 'ag-grid-angular';
import { ProductService } from '../../product/product.service';
import { PageHeadingComponent } from '@layout/common/page-heading/page-heading.component';
import { MatIconModule } from '@angular/material/icon';
import { AccessButtonAgGridComponent } from 'app/utilities/ag-grid/access-button-ag-grid/access-button-ag-grid.component';
import { Router } from '@angular/router';
import { ProductDTO } from '../models/productDTO';
import {
  ColDef,
  GridApi, GridOptions,
  GridReadyEvent,
  IServerSideDatasource, IServerSideGetRowsParams
} from "ag-grid-community";

@Component({
  selector: 'app-completed-cutting-lists',
  standalone: true,
  imports: [CommonModule, AgGridModule, PageHeadingComponent, MatIconModule],
  templateUrl: './completed-cutting-lists.component.html',
  styleUrls: ['./completed-cutting-lists.component.scss'],
})
export class CompletedCuttingListsComponent {
  private _router = inject(Router);
  private cuttingListService = inject(ProductService);

  public gridOptions: GridOptions = {
    pagination : true,
    paginationPageSize : 20,
    // cacheBlockSize : 10, // HERE BE DRAGONS
    paginationPageSizeSelector : [10, 20, 30, 50, 100],
    rowModelType : "serverSide",
    getRowId: (params) => params.data.id,
  };

  public pagination = true;
  public paginationPageSize = '20';
  public gridApi: GridApi;
  rowData: ProductDTO[];


  public columnDefs: ColDef[] = [
    { headerName: 'ID', field: 'id',  filter: "agNumberColumnFilter",},
    {
      headerName: 'STATUS',
      field: 'status',
      valueFormatter: (params) => {
        return params.value ? params.value.toString().toUpperCase() : '';
      }
    },
    { headerName: 'STARTED WORK', field: 'dateWorkBegan',   filter: "agDateColumnFilter", },
    { headerName: 'COMPLETED', field: 'dateWorkCompleted',   filter: "agDateColumnFilter", },
    { headerName: 'PLAN NAME', field: 'planName',     },
    { headerName: 'COLOR', field: 'color.color',     },
    { headerName: 'GAUGE', field: 'gauge.gauge' ,     },
    { headerName: 'WIDTH', field: 'width.width' ,    },
    {
      headerName: 'PRICE PER MTR',
      field: 'productPrice.pricePerMeter',
      // valueFormatter: currencyFormatter,
    },
    {
      headerName: 'TOTAL LENGTH',
      field: 'totalLength',
      // valueFormatter: this.totalLengthValueFormatter.bind(this),
    },
    {
      field: 'id',
      headerName: 'VIEW',
      width: 130,
      cellRenderer: AccessButtonAgGridComponent,
      cellRendererParams: {
        onClick: (id: number) => this._router.navigate(['/completed-cutting-list', id]),
      },
    },
  ];

  public defaultColDef: ColDef = {
    sortable: true,
    floatingFilter: true,
    resizable: true,
    headerClass: "ag-grid-header",
    filter: true,
    flex: 1,
  };

  calculateTotalLength(manufacturedProducts) {
    return manufacturedProducts.reduce((total, product) => total + product.length, 0);
  }

  totalLengthValueFormatter(params) {
    if (params.data && params.data.products) {
      const totalLength = this.calculateTotalLength(params.data.products);
      return totalLength.toFixed(2) + ' m';
    }
    return '0 m';
  }

  onGridReady(params: GridReadyEvent<any>) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
    params.api.setGridOption('domLayout', 'autoHeight');
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


  dataSource: IServerSideDatasource = {
    getRows: (params: IServerSideGetRowsParams) => {

      const filters =params.request.filterModel;

      const filterParams = Object.keys(filters).map(key => {
        const filter = filters[key];
        if (filter.filterType === 'date') {
          const dateFilter = new Date(filter.dateFrom);
          const formattedDate = `${dateFilter.getFullYear()}`+"-"+`${(dateFilter.getMonth() + 1).toString().padStart(2, '0')}`+"-"+`${dateFilter.getDate().toString().padStart(2, '0')}`;
          return `${key}:date:${filter.type}:${formattedDate}`;
        }
        return `${key}:${filter.filterType}:${filter.type}:${filter.filter}`;
      }).join(',');


      console.log("Requested startRow:", params.request.startRow, "endRow:", params.request.endRow,filterParams);
      const startRow = params.request.startRow;
      const endRow = params.request.endRow;
      const pageSize = endRow - startRow;

      this.cuttingListService.getCompletedProducts(startRow / pageSize, pageSize,filterParams).subscribe({
        next: (response) => {
          console.log("Data fetched:", response);
          if (!response || !Array.isArray(response.productDTO)) {
            console.error("Expected 'product DTO' as an array, got:", response.productDTO);
            params.fail();
            return;
          }
          this.rowData= response.productDTO;

          params.success({
            rowData:  response.productDTO,
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



  lastRowBorder(params) {
    if (params.node.rowIndex % 2 !== 0) {
      return {
        'background-color': '#EFF7FC',
      };
    } else {
      return {
        'background-color': '#FFFFFF',
      };
    }
  }
}
