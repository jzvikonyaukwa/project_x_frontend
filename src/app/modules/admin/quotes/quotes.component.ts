import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnDestroy, OnInit } from '@angular/core';
import { AgGridModule } from 'ag-grid-angular';
import {
  CellClassParams,
  ColDef,
  FilterModel,
  GetRowIdParams,
  GridApi,
  GridOptions,
  GridReadyEvent,
  IDatasource,
  IGetRowsParams,
  RowClassParams,
  RowStyle,
  SortModelItem,
  StateUpdatedEvent,
  ValueFormatterParams,
} from 'ag-grid-enterprise';
import { capitalizeFirstLetter } from 'app/utilities/ag-grid/capitalizeFirstLetterFormatter';
import { AccessButtonAgGridComponent } from '../../../utilities/ag-grid/access-button-ag-grid/access-button-ag-grid.component';
import { debounceTime, fromEvent, Observable, Subject, Subscription } from 'rxjs';
import { QuotesService } from './services/quotes.service';
import { Router, RouterModule } from '@angular/router';
import { PageHeadingComponent } from '@layout/common/page-heading/page-heading.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { QuoteDetailsDTO } from './models/quoteDetailsDTO';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { AgGridResponse } from 'app/utilities/ag-grid/models/ag-grid-response';
import { AgGridRequest } from 'app/utilities/ag-grid/models/ag-grid-request';
import { MatPaginatorModule } from '@angular/material/paginator';
import { BehaviorSubject } from 'rxjs';
import { environment } from '@environments/environment';
import { DateTime } from 'luxon';
import { QuoteStatus } from '@shared/enums/quote-status';
import { dateFromSQLToMEDFormatter } from 'app/utilities/ag-grid/value-formatters';

interface IStatusType {
  name: string;
  value: string;
}

@Component({
  selector: 'app-quotes',
  styleUrls: ['./quotes.component.scss'],
  templateUrl: './quotes.component.html',
  standalone: true,
  imports: [
    CommonModule,
    AgGridModule,
    PageHeadingComponent,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatSnackBarModule,
    RouterModule,
    MatPaginatorModule,
  ],
})
export class QuotesComponent implements OnInit, OnDestroy {
  storageKeyPrefix = 'quotes';
  rowCount?: number;
  private readonly pageIndexSubject = new BehaviorSubject<number>(0);
  public readonly pageIndex$ = this.pageIndexSubject.asObservable();
  pageSize: number = 10;
  state: { [key: string]: any };
  public quotes: QuoteDetailsDTO[] = [];
  public search: string = '';
  public selectedStatus: string = 'all';
  public filteredQuotes: QuoteDetailsDTO[] = [];
  public statuses: IStatusType[] = [
    {
      name: 'All',
      value: 'all',
    },
    {
      name: 'Draft',
      value: 'draft',
    },
    {
      name: 'Accepted',
      value: 'accepted',
    },
    {
      name: 'Completed',
      value: 'completed',
    },
  ];

  private ngUnsubscribe = new Subject<void>();
  public gridApi!: GridApi<QuoteDetailsDTO>;
  public paginationPageSize = '20';

  public columnDefs: ColDef[] = [
    {
      headerName: 'ID',
      field: 'id',
      width: 100,
      maxWidth: 100,
      cellClass: 'text-right',
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponentParams: {
        suppressFloatingFilterButton: true,
      },
      filterParams: {
        filterOptions: ['startsWith'],
        debounceMs: 500,
        // suppressAndOrCondition: true,
        maxNumConditions: 1,
      },
    },
    {
      headerName: 'Client',
      field: 'clientName',
      // headerClass: ["ag-grid-header", "text-center", "w-full"],
      // headerClass: 'text-center', // Add this line
      // headerClass: 'ag-header-cell-label',
      width: 220,
      tooltipField: 'clientName',
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponentParams: {
        suppressFloatingFilterButton: true,
      },
      filterParams: {
        filterOptions: ['contains'],
        debounceMs: 500,
        // suppressAndOrCondition: true,
        maxNumConditions: 1,
      },
    },
    {
      headerName: 'Project',
      field: 'projectName',
      width: 220,
      tooltipField: 'projectName',
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponentParams: {
        suppressFloatingFilterButton: true,
      },
      filterParams: {
        filterOptions: ['contains'],
        debounceMs: 500,
        // suppressAndOrCondition: true,
        maxNumConditions: 1,
      },
    },
    {
      headerName: 'Issued',
      field: 'dateIssued',
      width: 150,
      cellClass: 'text-right',
      filter: 'agDateColumnFilter',
      floatingFilter: true,
      filterParams: {
        filterOptions: ['before', 'after', 'inRange', 'equals'],
        defaultOption: 'equals',
        maxValidDate: DateTime.local().endOf('day').toJSDate(),
        debounceMs: 500,
        // suppressAndOrCondition: true,
        maxNumConditions: 1,
        // browserDatePicker: true,
        comparator: this.agGridDateComparator,
      },
      valueFormatter: dateFromSQLToMEDFormatter,
      maxWidth: 200,
    },
    {
      headerName: 'Last Modified',
      field: 'dateLastModified',
      cellClass: 'text-right',
      valueFormatter: dateFromSQLToMEDFormatter,
      width: 150,
      maxWidth: 200,
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
        maxValidDate: DateTime.local().endOf('day').toJSDate(),
        debounceMs: 500,
        // suppressAndOrCondition: true,
        maxNumConditions: 1,
        // browserDatePicker: true,
        comparator: this.agGridDateComparator,
      },
      valueFormatter: dateFromSQLToMEDFormatter,
      maxWidth: 200,
    },
    {
      field: 'status',
      headerClass: 'text-center',
      cellClass: ['text-center', 'font-semibold'],
      cellClassRules: {
        'text-gray-500': (params: CellClassParams<QuoteDetailsDTO, QuoteStatus>) =>
          params.value === QuoteStatus.draft,
        'text-green-500': (params: CellClassParams<QuoteDetailsDTO, QuoteStatus>) =>
          params.value === QuoteStatus.accepted,
        'text-red-500': (params: CellClassParams<QuoteDetailsDTO, QuoteStatus>) =>
          params.value === QuoteStatus.rejected,
      },
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      filterParams: {
        // provide all days, even if options are missing in data!
        values: ['Draft', 'Rejected', 'Accepted'],
        debounceMs: 500,
        showTooltips: true,
        defaultToNothingSelected: true,

        // keyCreator: (params) => params.value.code,
        // valueFormatter: (params) => params.value.name,
      },
      valueFormatter: (params: ValueFormatterParams<QuoteDetailsDTO, QuoteStatus>) =>
        params.value ? capitalizeFirstLetter(params.value) : '',
      width: 150,
      maxWidth: 150,
    },
    { field: 'notes', width: 120 },
    {
      field: 'id',
      headerName: 'View',
      sortable: false,
      // pinned: 'right',
      cellRenderer: AccessButtonAgGridComponent,
      width: 100,
      maxWidth: 100,
      cellRendererParams: {
        onClick: (quoteId: number) => this._router.navigate(['/quotes', quoteId]),
      },
    },
  ];

  public defaultColDef: ColDef<QuoteDetailsDTO> = {
    sortable: true,
    filter: false,
    unSortIcon: true,
    headerClass: 'text-center', // This will center header text for all columns
    suppressMovable: true,
    minWidth: 100,
    maxWidth: 300,
  };

  paginationPageSizeSelector = [10, 20, 50, 100];

  gridOptions: GridOptions<QuoteDetailsDTO> = {
    // columnMenu: "new",
    debug: !environment.production,
    animateRows: true,
    copyHeadersToClipboard: true,
    enableRangeSelection: true,
    pagination: true,
    paginationPageSize: this.pageSize,
    paginationPageSizeSelector: this.paginationPageSizeSelector,
    cacheBlockSize: 10, // HERE BE DRAGONS
    rowModelType: 'infinite',
    // rowModelType: 'serverSide', // watch out for lastRow must only be set on last page
    // blockLoadDebounceMillis: 140,
    // suppressPaginationPanel: true,
    overlayNoRowsTemplate: '<span class="no-rows">No Quotes To Show</span>',
    localeText: { noRowsToShow: 'No Quotes To Show' },
    getRowId: (params: GetRowIdParams<QuoteDetailsDTO>) => {
      return params.data ? `${params.data.id}` : '';
    },
  };

  private readonly _quotesService = inject(QuotesService);
  private readonly _router = inject(Router);
  private readonly _snackBar = inject(MatSnackBar);

  resizeObservable$: Observable<Event>;
  resizeSubscription$: Subscription;

  // EVENT HANDLERS
  getAllQuotesSubscription: Subscription;

  ngOnInit(): void {
    console.log('Quotes::ngOnInit');
    //  this.gridOptions.isExternalFilterPresent = this.isExternalFilterPresent;
    //  this.gridOptions.doesExternalFilterPass = this.doesExternalFilterPass;
     this.resizeObservable$ = fromEvent(window, 'resize');
     this.resizeSubscription$ = this.resizeObservable$
     .pipe(debounceTime(500))
     .subscribe((evt) => {
      //  this.gridApi.sizeColumnsToFit();
       this.gridApi.autoSizeAllColumns();
     });
  }

  onGridReady(params: GridReadyEvent<QuoteDetailsDTO>) {
    this.gridApi = params.api;
    // restore user filters
    const model = this.filterModel;
    if (model) {
      console.info('Filter Model: ', model);
      this.gridApi.setFilterModel(model);
    }
    // restore user sort order
    const state = this.sortModel;
    if (state) {
      console.info('Sort Model: ', state);
      params.api.applyColumnState({
        state,
        defaultState: { sort: null },
      });
    }
    // restore user hidden columns
    const hiddenColumns = this.hiddenColumns;
    if (hiddenColumns) {
      console.info('Hidden Columns: ', hiddenColumns);
      this.gridApi.setColumnsVisible(hiddenColumns, false);
    }
    this.gridApi.sizeColumnsToFit();
    params.api.setGridOption('domLayout', 'autoHeight');
    // params.api.setGridOption('serverSideDatasource', this.dataSource);
    params.api.setGridOption('datasource', this.dataSource);
    params.api.setGridOption('onStateUpdated', this.updateGridState);
  }

  statusTrackBy = (index: number, object: IStatusType): string => {
    return object.value;
  };

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.getAllQuotesSubscription?.unsubscribe();
    this.resizeSubscription$?.unsubscribe();
  }

  getRowStyle(params: RowClassParams): RowStyle {
    return {
      'background-color': params.node.rowIndex % 2 === 0 ? '#fff' : '#f3f7fb',
    };
  }

  dataSource: IDatasource = {
    getRows: (params: IGetRowsParams) => {
      const gridRequest = params as AgGridRequest;

      // Unsubscribe from previous request if exists
      this.getAllQuotesSubscription?.unsubscribe();
      this.getAllQuotesSubscription = this._quotesService.fetchQuoteDetails(gridRequest).subscribe({
        next: (response: AgGridResponse<QuoteDetailsDTO[]>) => {
          if (null != response?.lastRow) {
            this.rowCount = response.lastRow;
          }
          params.successCallback(response.data, response.lastRow);
        },
        error: (error: unknown) => {
          this.rowCount = undefined;
          params.failCallback();

          const detailedErrorMessage =
            error instanceof HttpErrorResponse
              ? error.error.message || error.statusText
              : 'Unknown error';
          this._snackBar.open(`Error fetching quotes: ${detailedErrorMessage}`, null, {
            duration: environment.DEFAULT_SNACKBAR_TIMEOUT,
          } as MatSnackBarConfig);
          console.error('Error fetching quotes', error);
        },
      });
    },
    rowCount: this.rowCount ?? 0,
  };
 
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

  set hiddenColumns(columnsToHide: string[] | null) {
    if (!columnsToHide || columnsToHide.length === 0) {
      this.clearHiddenColumns();
      return;
    }

    const hiddenColumnsString = JSON.stringify(columnsToHide);
    console.log('set Hidden Columns String: ', hiddenColumnsString);
    localStorage.setItem(`${this.storageKeyPrefix}_hiddenColumns`, hiddenColumnsString);
  }

  get hiddenColumns(): string[] | null {
    const hiddenColumnsString = localStorage.getItem(`${this.storageKeyPrefix}_hiddenColumns`);
    return hiddenColumnsString ? JSON.parse(hiddenColumnsString) : null;
  }

  set filterModel(filterModel: FilterModel | null) {
    if (!filterModel) {
      this.clearFilters();
      return;
    }

    const filterModelString = JSON.stringify(filterModel);
    console.log('set Filter Model String: ', filterModelString);
    sessionStorage.setItem(`${this.storageKeyPrefix}_filterModel`, filterModelString);
  }

  get filterModel(): FilterModel | null {
    const filterModelString = sessionStorage.getItem(`${this.storageKeyPrefix}_filterModel`);
    return filterModelString ? JSON.parse(filterModelString) : null;
  }

  set sortModel(sortModel: SortModelItem[] | null) {
    if (!sortModel || sortModel.length === 0) {
      this.clearSortOrder();
      return;
    }

    const sortModelString = JSON.stringify(sortModel);
    console.log('set Sort model String: ', sortModelString);
    sessionStorage.setItem(`${this.storageKeyPrefix}_sortModel`, sortModelString);
  }

  get sortModel(): SortModelItem[] | null {
    const sortModelString = sessionStorage.getItem(`${this.storageKeyPrefix}_sortModel`);
    return sortModelString ? JSON.parse(sortModelString) : null;
  }

  clearFilters = () => sessionStorage.removeItem(`${this.storageKeyPrefix}_filterModel`);

  clearSortOrder = () => sessionStorage.removeItem(`${this.storageKeyPrefix}_sortModel`);

  clearHiddenColumns = () => localStorage.removeItem(`${this.storageKeyPrefix}_hiddenColumns`);

  updateGridState = (event: StateUpdatedEvent) => {
    // console.debug('State Updated: ', event);
    const gridState = event.state;
    const columnState = gridState?.columnVisibility;
    this.hiddenColumns = columnState?.hiddenColIds;

    const filterState = gridState?.filter;
    const filterModel: FilterModel | null = filterState?.filterModel;
    this.filterModel = filterModel;

    const sortState = gridState?.sort;
    const sortModel: SortModelItem[] | null = sortState?.sortModel;
    this.sortModel = sortModel;
  };

  @HostListener('document:keyup.escape', ['$event']) // Escape key
  onKeydownHandler($event: KeyboardEvent) {
    setTimeout(() => {
      this.clearFilters();
      this.clearHiddenColumns();
      this.clearSortOrder();
    }, 0);
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
