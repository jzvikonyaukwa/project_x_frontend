import { Component, HostListener, Input, inject } from '@angular/core';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { Quote } from '../../quotes/models/quote';
import { AccessButtonAgGridComponent } from '../../../../utilities/ag-grid/access-button-ag-grid/access-button-ag-grid.component';
import { Router } from '@angular/router';
import {
  CellClassParams,
  GetRowIdParams,
  GridOptions,
  RowClassParams,
  RowStyle,
  ValueFormatterParams,
} from 'ag-grid-enterprise';
import { capitalizeFirstLetter } from 'app/utilities/ag-grid/capitalizeFirstLetterFormatter';
import { DateTime } from 'luxon';
import { QuoteStatus } from '@shared/enums/quote-status';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-clients-quote-list',
  templateUrl: './clients-quote-list.component.html',
  styleUrls: ['./clients-quote-list.component.scss'],
})
export class ClientsQuoteListComponent {
  public pagination = true;
  public gridApi!: GridApi<Quote>;
  public paginationPageSize = '10';
  @Input() quotes: Quote[];

  public columnDefs: ColDef[] = [
    {
      headerName: 'ID',
      field: 'id',
      width: 100,
      cellClass: 'text-right',
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponentParams: {
        suppressFloatingFilterButton: true,
      },
      filterParams: {
        filterOptions: ['startsWith'],
        debounceMs: 500,
        suppressAndOrCondition: true,
      },
    },
    {
      field: 'dateIssued',
      headerName: 'Issued',
      width: 150,
      cellClass: 'text-right',
      valueFormatter: this.agGridDateValueFormatter,
    },
    {
      field: 'dateLastModified',
      headerName: 'Last Modified',
      width: 150,
      cellClass: 'text-right',
      valueFormatter: this.agGridDateValueFormatter,
    },
    {
      headerName: 'Accepted',
      field: 'dateAccepted',
      width: 150,
      cellClass: 'text-right',
      filter: 'agDateColumnFilter',
      floatingFilter: true,
      filterParams: {
        filterOptions: ['before', 'after', 'inRange', 'equals', 'blank', 'notBlank'],
        defaultOption: 'equals',
        maxValidDate: DateTime.now().endOf('day').toJSDate(),
        debounceMs: 500,
        // suppressAndOrCondition: true,
        maxNumConditions: 1,
        // browserDatePicker: true,
        comparator: this.agGridDateComparator,
      },
      valueFormatter: this.agGridDateValueFormatter,
    },
    {
      headerName: 'Status',
      width: 150,
      field: 'status',
      cellClass: ['text-center', 'font-bold'],
      cellClassRules: {
        'text-gray-500': (params) => params.value === QuoteStatus.draft,
        'text-green-500': (params) => params.value === QuoteStatus.accepted,
        'text-red-500': (params) => params.value === QuoteStatus.rejected,
      },
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      filterParams: {
        // provide all days, even if days are missing in data!
        values: ['Draft', 'Rejected', 'Accepted'],
        debounceMs: 500,
        showTooltips: true,
        defaultToNothingSelected: true,

        // keyCreator: (params) => params.value.code,
        // valueFormatter: (params) => params.value.name,
      },
      valueFormatter: (params) => capitalizeFirstLetter(params.value),
    },
    {
      field: 'cuttingList.productType.color.color',
      headerName: 'Color',
      width: 150,
    },
    {
      field: 'cuttingList.status',
      headerName: 'Status',
      width: 150,
    },
    {
      field: 'cuttingList.productType.type',
      headerName: 'Type',
      width: 150,
    },
    {
      field: 'cuttingList.sheets',
      headerName: 'Meters',
      width: 150,
      valueGetter: (params) => {
        return params.data.cuttingList?.manufacturedProducts
          ?.reduce((acc, v) => {
            acc += v.length;
            return acc;
          }, 0)
          .toFixed(2);
      },
    },
    {
      field: 'id',
      headerName: 'Quote',
      width: 130,
      cellRenderer: AccessButtonAgGridComponent,
      cellRendererParams: {
        onClick: (id: number) => {
          this.router.navigate(['/quotes', id]);
        },
      },
    },
  ];

  public defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    unSortIcon: true,
    wrapHeaderText: true,
    autoHeaderHeight: true,
    suppressMovable: true,
    maxWidth: 300,
  };

  gridOptions: GridOptions<Quote> = {
    debug: !environment.production,
    animateRows: true,
    overlayNoRowsTemplate: '<span class="no-rows">No Quotes To Show</span>',
    localeText: { noRowsToShow: 'No Quotes To Show' },
    getRowId: (params: GetRowIdParams<Quote>) => {
      return `${params.data.id}`;
    },
  };

  readonly router = inject(Router);

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    // params.api.sizeColumnsToFit();
    // params.columnApi.autoSizeAllColumns();
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

  lastRowBorder(params: RowClassParams<Quote>): RowStyle {
    return {
      'background-color': params.node.rowIndex % 2 === 0 ? '#fff' : '#f3f7fb',
    };
  }

  agGridDateValueFormatter(params): string {
    return params.value ? DateTime.fromSQL(params.value).toLocaleString(DateTime.DATE_MED) : '';
  }

  agGridDateComparator(filterDate: Date, cellDateString?: string): -1 | 0 | 1 {
    // console.log('filterLocalDateAtMidnight', filterDate);
    // console.log('cellDateString', cellDateString);
    if (!cellDateString) {
      return 0;
    }

    const cellDateTime: DateTime = DateTime.fromSQL(cellDateString).startOf('day');
    const filterDateTime: DateTime = DateTime.fromJSDate(filterDate).startOf('day');

    if (cellDateTime < filterDateTime) {
      return -1;
    }

    if (cellDateTime > filterDateTime) {
      return 1;
    }

    return 0;
  }

  @HostListener('document:keyup.escape', ['$event']) // Escape key
  onKeydownHandler($event: KeyboardEvent) {
    setTimeout(() => {
      // clear filters
      this.gridApi.setFilterModel(null);
      // clear sort order
      this.gridApi.applyColumnState({
        state: null,
        defaultState: { sort: null },
      });
      this.gridApi.autoSizeAllColumns();
    }, 0);
  }
}
