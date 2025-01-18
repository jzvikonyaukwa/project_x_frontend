import { Component, HostListener, inject, Input } from '@angular/core';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-enterprise';
import { AccessButtonAgGridComponent } from '../../../../utilities/ag-grid/access-button-ag-grid/access-button-ag-grid.component';
import { Router } from '@angular/router';
import { DeliveryNote } from '../../delivery-notes/models/delivery-note';
import {
  GetRowIdParams,
  GridOptions,
  RowClassParams,
  RowStyle,
  ValueFormatterParams,
} from 'ag-grid-enterprise';
import { environment } from '@environments/environment';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-clients-delivery-note-list',
  templateUrl: './clients-delivery-note-list.component.html',
  styleUrls: ['./clients-delivery-note-list.component.scss'],
})
export class ClientsDeliveryNoteListComponent {
  public pagination = true;
  public gridApi!: GridApi<DeliveryNote>;
  public paginationPageSize = '10';
  @Input() deliveryNotes: DeliveryNote[];

  public columnDefs: ColDef[] = [
    {
      headerName: 'ID',
      field: 'id',
      width: 120,
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
      headerName: 'Date Created',
      field: 'dateCreated',
      width: 180,
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
      valueFormatter: this.agGridDateValueFormatter as any,
    },
    {
      headerName: 'Date Delivered',
      field: 'dateDelivered',
      width: 180,
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
      valueFormatter: this.agGridDateValueFormatter,
    },
    {
      headerName: 'Delivery Address',
      field: 'deliveryAddress',
      tooltipField: 'deliveryAddress',
      sortable: true,
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
      headerName: 'Status',
      field: 'status',
    },
    {
      field: 'id',
      headerName: 'View',
      width: 130,
      cellRenderer: AccessButtonAgGridComponent,
      cellRendererParams: {
        onClick: (id: number) => {
          this.router.navigate(['/delivery-note', id]);
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
    headerClass: 'ag-grid-header',
  };

  gridOptions: GridOptions<DeliveryNote> = {
    debug: !environment.production,
    animateRows: true,
    overlayNoRowsTemplate: '<span class="no-rows">No Delivery Notes To Show</span>',
    localeText: { noRowsToShow: 'No Delivery Notes To Show' },
    getRowId: (params: GetRowIdParams<DeliveryNote>) => {
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

  lastRowBorder(params: RowClassParams<DeliveryNote>): RowStyle {
    return {
      'background-color': params.node.rowIndex % 2 === 0 ? '#fff' : '#f3f7fb',
    };
  }

  agGridDateValueFormatter(params: ValueFormatterParams): string {
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
