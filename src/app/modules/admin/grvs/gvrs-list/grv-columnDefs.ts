import { Router } from '@angular/router';
import { ColDef } from 'ag-grid-enterprise';
import { AccessButtonAgGridComponent } from 'app/utilities/ag-grid/access-button-ag-grid/access-button-ag-grid.component';
import { EditButtonComponent } from 'app/utilities/ag-grid/edit-button/edit-button.component';
import { dateFromJSToMEDFormatter } from 'app/utilities/ag-grid/value-formatters';
import { DateTime } from 'luxon';

export function getGrvColumnDefs(_router: Router, accessGrvFn?: (grvId: number) => void): ColDef[] {
  return [
    {
      headerName: 'ID',
      field: 'grvId',
      cellRenderer: 'agGroupCellRenderer',
      width: 100,
      maxWidth: 100,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponentParams: {
        suppressFloatingFilterButton: true,
      },
      filterParams: {
        filterOptions: ['startsWith'],
        debounceMs: 500,
        maxNumConditions: 1,
      },
    },
    {
      headerName: 'Received',
      field: 'dateReceived',
      cellClass: 'text-right',
      width: 130,
      maxWidth: 130,
      valueFormatter: dateFromJSToMEDFormatter,
      filter: 'agDateColumnFilter',
      floatingFilter: true,
      filterParams: {
        filterOptions: ['before', 'after', 'inRange', 'equals'],
        defaultOption: 'equals',
        maxValidDate: DateTime.local().endOf('day').toJSDate(),
        debounceMs: 500,
        maxNumConditions: 1,
        comparator: agGridDateComparator,
      },
    },
    {
      headerName: 'Warehouse',
      field: 'warehouse',
      valueFormatter: (params) => capitalizeCellRenderer(params.value),
      width: 120,
      maxWidth: 150,
    },
    {
      headerName: 'Supplier',
      field: 'supplierName',
      tooltipField: 'supplierName',
      width: 180,
      maxWidth: 400,
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
      headerName: 'Comments',
      field: 'grvComments',
      tooltipField: 'grvComments',
      width: 180,
      maxWidth: 400,
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
      enableRowGroup: false,
    },
    {
      headerName: 'PO ID',
      field: 'purchaseOrderId',
      width: 100,
      maxWidth: 100,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponentParams: {
        suppressFloatingFilterButton: true,
      },
      filterParams: {
        filterOptions: ['startsWith'],
        debounceMs: 500,
        maxNumConditions: 1,
      },
    },
    {
      headerName: 'Supplier GRV Code',
      field: 'supplierGrvCode',
      tooltipField: 'supplierGrvCode',
      cellClass: 'text-right',
      width: 180,
      maxWidth: 200,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponentParams: {
        suppressFloatingFilterButton: true,
      },
      filterParams: {
        filterOptions: ['contains'],
        debounceMs: 500,
        maxNumConditions: 1,
      },
      enableRowGroup: false,
    },
    {
      field: 'grvId',
      headerName: 'View/Edit',
      width: 90,
      maxWidth: 120,
      editable: false,
      cellRenderer: EditButtonComponent,
      cellRendererParams: {
        onClick: accessGrvFn,
        params: {
          field: 'grvId',
        },
      },
    },
    {
      headerName: 'Details',
      field: 'grvId',
      width: 90,
      maxWidth: 120,
      cellRenderer: AccessButtonAgGridComponent,
      cellRendererParams: {
        onClick: (id: number) => {
          this._router.navigate(['/grv', id]);
        },
      },
    },
  ];
}

function agGridDateComparator(filterDate: Date, cellDateString?: string): -1 | 0 | 1 {
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

function capitalizeCellRenderer(name: string) {
  if (name === null) return null;
  return name?.toUpperCase();
}
