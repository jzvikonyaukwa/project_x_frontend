import { ColDef, ValueFormatterParams } from "ag-grid-enterprise";
import { AccessButtonAgGridComponent } from "../../../../../utilities/ag-grid/access-button-ag-grid/access-button-ag-grid.component";
import { currencyFormatter } from "app/utilities/ag-grid/currencyFormatter";
import { formatQuantityWithDecimals } from "app/utilities/ag-grid/formatQuantityWithDecimals";
export const stockTableColumnDefs: (actionCallback?) => ColDef[] = (actionCallback?) => [
  {
    headerName: 'Color',
    field: 'color',
    chartDataType: 'category',
    width: 180,
    floatingFilter: true,
    filter: 'agMultiColumnFilter',
    suppressFloatingFilterButton: true,
  },
  {
    headerName: 'Width',
    field: 'width',
    cellClass: 'text-right',
    chartDataType: 'category',
    width: 120,
    floatingFilter: true,
    filter: 'agMultiColumnFilter',
    suppressFloatingFilterButton: true,
    valueFormatter: (params) => {
      if (!params.value) return '';
      const formattedValue = new Intl.NumberFormat('en-US', {
        style: 'decimal',
      }) //
        .format(params.value);
      return `${formattedValue} mm`;
    },
  },
  {
    headerName: 'Gauge',
    field: 'gauge',
    cellClass: 'text-right',
    chartDataType: 'category',
    width: 140,
    floatingFilter: true,
    filter: 'agMultiColumnFilter',
    suppressFloatingFilterButton: true,
    valueFormatter: (params: ValueFormatterParams) => {
      if (!params.value) return '';
      const formattedValue = new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) //
        .format(params.value);
      return `${formattedValue}`;
    },
  },
  {
    headerName: 'ISQ Grade',
    field: 'isqgrade',
    cellClass: 'text-right',
    width: 140,
    floatingFilter: true,
    filter: 'agMultiColumnFilter',
    suppressFloatingFilterButton: true,
  },
  {
    headerName: 'Coating',
    field: 'coating',
    cellClass: 'text-right',
    width: 140,
    floatingFilter: true,
    filter: 'agMultiColumnFilter',
    suppressFloatingFilterButton: true,
  },
  {
    headerName: 'Cost per Metre',
    field: 'landedCostPerMtr',
    cellClass: 'text-right',
    valueFormatter: (params) => {
      return currencyFormatter(params);
    },
  },
  {
    headerName: 'Meters Remaining',
    field: 'estMtrsRemaining',
    cellClass: 'text-right',
    valueFormatter: (params) => {
      return formatQuantityWithDecimals(params);
    },
  },
  {
    headerName: 'Total Cost',
    field: 'totalCost',
    cellClass: 'text-right',
    valueGetter: (params) => {
      if (params.node.rowPinned) {
        return params.data.totalCost;
      }

      if (
        params.data &&
        params.data.estMtrsRemaining !== undefined &&
        params.data.landedCostPerMtr !== undefined
      ) {
        return params.data.estMtrsRemaining * params.data.landedCostPerMtr;
      }
      return null;
    },
    valueFormatter: (params) => {
      if (params.value !== null && params.value !== undefined) {
        return currencyFormatter({ ...params, value: params.value });
      }
      return '';
    },
  },
  {
    headerName: 'Details',
    field: 'steelCoilId',
    filter: false,
    cellRendererSelector: function (params) {
      if (params.node.rowPinned) {
        return { component: null };
      } else {
        return { component: AccessButtonAgGridComponent };
      }
    },
    cellRendererParams: {
      onClick: actionCallback,
    },
  },
];
