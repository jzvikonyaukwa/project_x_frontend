import { ColumnVO, FilterModel } from 'ag-grid-enterprise';
import { AgColumnSort } from './ag-column-sort';

export interface AgGridRequest {
  sortModel: AgColumnSort[];
  filterModel: FilterModel;
  startRow: number;
  endRow: number;
  rowGroupCols?: ColumnVO[];
  valueCols?: ColumnVO[];
  pivotCols?: ColumnVO[];
  pivotMode?: boolean;
  groupKeys?: Array<string>;
}
