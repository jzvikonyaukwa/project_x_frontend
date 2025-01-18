import { Component, Input } from '@angular/core';
import { SteelSpecification } from '../../../../shared/models/steelSpecification';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';

@Component({
  selector: 'app-suppliers-products',
  styleUrls: ['./suppliers-products.component.scss'],
  templateUrl: './suppliers-products.component.html',
})
export class SuppliersProductsComponent {
  @Input() products: SteelSpecification[] = [];
  public pagination: boolean = true;
  public gridApi!: GridApi<any>;
  public paginationPageSize: string = '10';

  public columnDefs: ColDef[] = [
    { field: 'id' },
    { field: 'finish' },
    { field: 'color' },
    { field: 'width' },
    { field: 'coating' },
    { field: 'gauge' },
    { field: 'isqgrade' },
  ];

  public defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    unSortIcon: true,
    headerClass: 'ag-grid-header',
  };

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
    params.api.setGridOption('domLayout', 'autoHeight');
  }

  onBtNext() {
    this.gridApi.paginationGoToNextPage();
  }

  onBtPrevious() {
    this.gridApi.paginationGoToPreviousPage();
  }

  public onPageSizeChanged(): void {
    const value = (document.getElementById('page-size') as HTMLInputElement).value;
    this.paginationPageSize = value;
    // this.gridApi.paginationSetPageSize(Number(value));
  }

  setText(selector: string, text: any) {
    (document.querySelector(selector) as any).innerHTML = text;
  }

  onPaginationChanged() {
    console.log('onPaginationPageLoaded');
    // Workaround for bug in events order
    if (this.gridApi!) {
      this.setText('#lbCurrentPage', this.gridApi.paginationGetCurrentPage() + 1);
      this.setText('#lbTotalPages', this.gridApi.paginationGetTotalPages());
    }
  }

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
