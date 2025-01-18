import { ColDef } from 'ag-grid-enterprise';
import { decimalFormatter } from 'app/utilities/ag-grid/value-formatters';
import { weightFormatter } from 'app/utilities/ag-grid/weightFormatter';

export const GRVSTEELCOLUMNDEFS: ColDef[] = [
  {
    headerName: 'Purcahse Order ID',
    field: 'purchaseOrderId',
    cellClass: 'text-right',
    headerCheckboxSelection: true,
    checkboxSelection: true,
    width: 200,
  },
  {
    field: 'color',
    width: 130,
    floatingFilter: true,
    filter: 'agTextColumnFilter',
  },
  {
    field: 'gauge',
    cellClass: 'text-right',
    width: 130,
    floatingFilter: true,
    filter: 'agNumberColumnFilter',
    valueFormatter: decimalFormatter,
  },
  {
    field: 'isqGrade',
    width: 130,
  },
  {
    field: 'coating',
    width: 130,
  },
  {
    headerName: 'Weight',
    field: 'weightOrdered',
    width: 140,
    cellClass: 'text-right',
    valueFormatter: weightFormatter,
  },
  {
    headerName: 'Status',
    field: 'productStatus',
    width: 90,
  },
];
