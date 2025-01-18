import { ColDef, CellClassParams } from 'ag-grid-enterprise';
import { currencyFormatter, decimalFormatter } from 'app/utilities/ag-grid/value-formatters';

export const GRVS_CONSUMABLE_COLUMNDEFS: ColDef[] = [
  {
    field: 'PO ID',
    headerCheckboxSelection: true,
    checkboxSelection: true,
    width: 110,
  },
  {
    field: 'productName',
    headerCheckboxSelection: true,
    width: 240,
    floatingFilter: true,
    filter: 'agTextColumnFilter',
  },
  {
    headerName: 'Qty Ordered',
    field: 'qtyOrdered',
    width: 130,
    cellClass: 'text-right',
    cellClassRules: {
      // 'text-green-500': (params: CellClassParams) => params.value >= 0,
      'text-red-500': (params: CellClassParams) => params.value < 0,
    },
    valueFormatter: decimalFormatter,
  },
  {
    field: 'costPerUnit',
    cellClass: 'text-right',
    cellClassRules: {
      // 'text-green-500': (params: CellClassParams) => params.value >= 0,
      'text-red-500': (params: CellClassParams) => params.value < 0,
    },
    width: 130,
    valueFormatter: currencyFormatter,
  },
  { field: 'consumableId', width: 130 },
] as ColDef[];
