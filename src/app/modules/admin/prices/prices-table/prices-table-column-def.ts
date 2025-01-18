import {
  ColDef,
  ITextFilterParams,
  ValueFormatterParams,
} from "ag-grid-community";

export const priceColumnDefs: ColDef[] = [
  {
    field: "name",
    headerName: "Product",
    valueGetter: (params) => {
      const name = params.data.name;
      const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
      return capitalized;
    },
    filterParams: {
      caseSensitive: true,
      defaultOption: "startsWith",
    } as ITextFilterParams,
  },
  {
    field: "color",
    filterParams: {
      caseSensitive: true,
      defaultOption: "startsWith",
    } as ITextFilterParams,
  },
  {
    field: "finish",
    valueGetter: (params) => {
      const name = params.data.name;
      const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
      return capitalized;
    },
    filterParams: {
      caseSensitive: true,
      defaultOption: "startsWith",
    } as ITextFilterParams,
  },
  {
    field: "gauge",
    filterParams: {
      caseSensitive: true,
      defaultOption: "startsWith",
    } as ITextFilterParams,
  },
  {
    field: "stdPrice",
    valueFormatter: currencyFormatter,
    editable: true,
  },
  {
    field: "tradesMenPrice",
    valueFormatter: currencyFormatter,
    editable: true,
  },
];

function currencyFormatter(params: ValueFormatterParams) {
  return "$" + params.value.toFixed(2);
}
