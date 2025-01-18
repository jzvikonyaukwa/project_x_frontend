import { Component, Input } from '@angular/core';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { GRVDetailsDTO } from '../../grvs/models/grvStructuredDetails';

@Component({
  selector: 'app-suppliers-grvs',
  styleUrls: ['./suppliers-grvs.component.scss'],
  templateUrl: './suppliers-grvs.component.html',
})
export class SuppliersGrvsComponent {
  @Input() grvs: GRVDetailsDTO[];
  public pagination: boolean = true;
  public gridApi!: GridApi<any>;
  public paginationPageSize: string = '10';

  public columnDefs: ColDef[] = [
    { field: 'id' },
    { field: 'dateReceived' },
    { field: 'comments' },
    { field: 'supplierGRVCode' },
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
    const value = (document.getElementById('page-size1') as HTMLInputElement).value;
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
      this.setText('#lbCurrentPage1', this.gridApi.paginationGetCurrentPage() + 1);
      this.setText('#lbTotalPages1', this.gridApi.paginationGetTotalPages());
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
