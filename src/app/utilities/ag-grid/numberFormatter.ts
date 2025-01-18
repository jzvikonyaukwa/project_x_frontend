import { ValueFormatterParams } from "ag-grid-community";

export function numberFormatter(params: ValueFormatterParams) {
  return params.value.toFixed(3);
}
