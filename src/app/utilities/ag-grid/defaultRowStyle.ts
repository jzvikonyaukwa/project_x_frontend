import { RowClassParams, RowStyle } from "ag-grid-enterprise";

const getRowStyle = (params: RowClassParams): RowStyle => {
  return {
    'background-color': params.node.rowIndex % 2 === 0 ? '#fff' : '#f3f7fb',
  };
}

export default getRowStyle;