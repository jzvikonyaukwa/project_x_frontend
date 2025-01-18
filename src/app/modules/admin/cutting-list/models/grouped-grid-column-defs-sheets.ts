import { ColDef, ISelectCellEditorParams } from 'ag-grid-enterprise';
import { EmptyButtonComponent } from 'app/utilities/ag-grid/empty-button/empty-button.component';
import { ManufacturedButtonComponent } from 'app/utilities/ag-grid/manufactured-button/manufactured-button.component';
import { GroupedSheetMPs } from './groupedSheetProducts';

export function createGroupedColDefsForSheets(
  manufacture: boolean,
  statusFormatter: (params: any) => string,
  productPickedCallback: (id: number) => void,
  manufactureGroupProductsCallback: (groupData: GroupedSheetMPs) => void,
): ColDef[] {
  const colDefs: ColDef[] = [
    {
      field: 'length',
      width: 130,
      headerName: 'INDIVIDUAL LENGTH',
    },
    { field: 'qty', width: 120, headerName: 'QTY' },
    {
      field: 'totalLength',
      width: 120,
      headerName: 'TOTAL LENGTH',
    },
    {
      headerName: 'STATUS',
      field: 'status',
      valueFormatter: (params) => statusFormatter(params),
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: () =>
        ({
          values: ['completed', 'scheduled', 'picked'],
        } as ISelectCellEditorParams),
      width: 150,
    },
    {
      headerName: 'PICKABLE',
      field: 'id',
      cellRendererSelector: (params) => {
        if (!params || !params.data) {
          return {};
        }

        if (!params.data.pickable) {
          return {
            component: EmptyButtonComponent,
          };
        }

        if (params.data.status === 'completed') {
          return {
            component: EmptyButtonComponent,
          };
        } else if (params.data.status === 'scheduled') {
          return {
            component: ManufacturedButtonComponent,
          };
        } else {
          return { component: EmptyButtonComponent };
        }
      },
      cellRendererParams: {
        clicked: (id: number) => {
          productPickedCallback(id);
        },
      },
      hide: !manufacture,
      width: 150,
    },
    {
      headerName: 'MANUFACTURED',
      field: 'length',
      cellRendererSelector: (params) => {
        if (!params || !params.data) {
          return {};
        }

        if (params.data.pickable || params.data.status === 'completed') {
          return {
            component: EmptyButtonComponent,
          };
        } else {
          return {
            component: ManufacturedButtonComponent,
          };
        }
      },
      cellRendererParams: {
        clicked: (rowData: any) => {
          const groupData = rowData.data;
          manufactureGroupProductsCallback(groupData);
        },
      },
      hide: !manufacture,
    },
  ];

  return colDefs;
}
