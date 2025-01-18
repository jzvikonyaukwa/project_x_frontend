import { ValueFormatterParams } from "ag-grid-enterprise";

export function weightFormatter(params: ValueFormatterParams) {
  if (params.value === undefined || params.value === null) {
    return null;
  } else {
    return params.value + " KGS";
  }
}
