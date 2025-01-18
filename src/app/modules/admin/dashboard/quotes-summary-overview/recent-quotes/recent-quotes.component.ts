import { Component, inject, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AgGridModule } from "ag-grid-angular";
import { QuoteDetailsDTO } from "app/modules/admin/quotes/models/quoteDetailsDTO";
import { CellClassParams, ColDef, GridApi, GridOptions, GridReadyEvent } from "ag-grid-enterprise";
import { AccessButtonAgGridComponent } from "app/utilities/ag-grid/access-button-ag-grid/access-button-ag-grid.component";
import { Router } from "@angular/router";
import { dateFromISOToMEDFormatter } from "app/utilities/ag-grid/value-formatters";
import { QuoteStatus } from "@shared/enums/quote-status";
import { environment } from "@environments/environment";
import getRowStyle from "app/utilities/ag-grid/defaultRowStyle";

@Component({
  selector: 'app-recent-quotes',
  standalone: true,
  imports: [CommonModule, AgGridModule],
  templateUrl: './recent-quotes.component.html',
  styleUrls: ['./recent-quotes.component.scss'],
})
export class RecentQuotesComponent {
  @Input() latestQuotes: QuoteDetailsDTO[];

  defaultColDef: ColDef = {
    resizable: true,
    sortable: true,
    filter: true,
    flex: 1,
    minWidth: 140,
  };

  columnDefs: ColDef[] = [
    { field: 'clientName', headerName: 'Client Name', minWidth: 160 },
    {
      field: 'dateIssued',
      headerName: 'Date Issued',
      minWidth: 140,
      cellClass: 'text-right',
      valueFormatter: dateFromISOToMEDFormatter,
    },
    { field: 'projectName', headerName: 'Project Name' },
    {
      field: 'dateLastModified',
      headerName: 'Date Last Modified',
      cellClass: 'text-right',
      valueFormatter: dateFromISOToMEDFormatter,
    },
    {
      field: 'dateAccepted',
      headerName: 'Date Accepted',
      cellClass: 'text-right',
      valueFormatter: dateFromISOToMEDFormatter,
    },
    {
      field: 'status',
      headerName: 'Status',
      cellClassRules: {
        'text-gray-500': (params: CellClassParams<QuoteDetailsDTO, QuoteStatus>) =>
          params.value === QuoteStatus.draft,
        'text-green-500': (params: CellClassParams<QuoteDetailsDTO, QuoteStatus>) =>
          params.value === QuoteStatus.accepted,
        'text-red-500': (params: CellClassParams<QuoteDetailsDTO, QuoteStatus>) =>
          params.value === QuoteStatus.rejected,
      },
      valueFormatter: (params) => {
        if (!params.value) return '';
        let status: string = QuoteStatus[params.value];
        status = status.charAt(0).toUpperCase() + status.slice(1);
        return status.replace(/_/g, ' ');
      },
    },
    { field: 'notes', headerName: 'Notes' },
    {
      field: 'id',
      headerName: 'View Quote',
      cellRenderer: AccessButtonAgGridComponent,
      width: 150,
      cellRendererParams: {
        onClick: (quoteId: number) => this._router.navigate(['/quotes', quoteId]),
      },
    },
  ];

  gridOptions: GridOptions = {
    debug: !environment.production,
    animateRows: true,
    copyHeadersToClipboard: true,
    enableRangeSelection: true,
    getRowStyle,
    pagination: false,
    paginationPageSize: 10,
    defaultColDef: this.defaultColDef,
    columnDefs: this.columnDefs,
    overlayNoRowsTemplate: '<span class="no-rows">No Recent Quotes</span>',
    localeText: { noRowsToShow: 'No Recent Quotes' },
  };

  gridApi: GridApi;

  private readonly _router = inject(Router);

  constructor() {}

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridApi.setGridOption('domLayout', 'autoHeight');
    this.gridApi.sizeColumnsToFit();
  }
}
