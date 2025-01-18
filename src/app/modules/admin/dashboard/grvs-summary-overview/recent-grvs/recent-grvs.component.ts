import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridModule } from 'ag-grid-angular';
import { CellClassParams, ColDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-enterprise';
import { AccessButtonAgGridComponent } from 'app/utilities/ag-grid/access-button-ag-grid/access-button-ag-grid.component';
import { Router } from '@angular/router';
import {
  accountingCurrencyFormatter,
  dateFromISOToMEDFormatter,
} from 'app/utilities/ag-grid/value-formatters';
import { environment } from '@environments/environment';
import getRowStyle from 'app/utilities/ag-grid/defaultRowStyle';
import { GrvTotal } from 'app/modules/admin/grvs/models/grv';

@Component({
  selector: 'app-recent-grvs',
  standalone: true,
  imports: [CommonModule, AgGridModule],
  templateUrl: './recent-grvs.component.html',
  styleUrls: ['./recent-grvs.component.scss'],
})
export class RecentGrvsComponent {
  @Input() latestGrvs: GrvTotal[];

  paginationPageSize = 5;

  columnDefs = [
    {
      field: 'id',
      headerName: 'GRV ID',
      cellClass: 'text-right',
    },
    {
      field: 'dateReceived',
      headerName: 'Received',
      cellClass: 'text-right',
      valueFormatter: dateFromISOToMEDFormatter,
    },
    {
      field: 'grvTotal',
      headerName: 'Total ($)',
      cellClass: 'text-right',
      cellClassRules: {
        // 'text-green-500': (params: CellClassParams) => params.value >= 0,
        'text-red-500': (params: CellClassParams) => params.value < 0,
      },
      valueFormatter: accountingCurrencyFormatter,
    },
    {
      field: 'id',
      headerName: 'View GRV',
      cellRenderer: AccessButtonAgGridComponent,
      width: 150,
      cellRendererParams: {
        onClick: (id: number) => this._router.navigate(['/grv', id]),
      },
      sortable: false,
    },
  ] as ColDef[];

  defaultColDef: ColDef = {
    resizable: true,
    sortable: true,
    filter: false,
    flex: 1,
    minWidth: 140,
  };

  gridApi: GridApi<GrvTotal>;

  gridOptions: GridOptions<GrvTotal> = {
    debug: !environment.production,
    animateRows: true,
    copyHeadersToClipboard: true,
    enableRangeSelection: true,
    getRowStyle,
    pagination: false,
    paginationPageSize: this.paginationPageSize,
    defaultColDef: this.defaultColDef,
    overlayNoRowsTemplate: '<span class="no-rows">No Recent GRVs</span>',
    localeText: { noRowsToShow: 'No Recent GRVs' },
  };

  private readonly _router = inject(Router);

  constructor() {}

  onGridReady(params: GridReadyEvent<GrvTotal>) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
    this.gridApi.setGridOption('domLayout', 'autoHeight');
  }
}
