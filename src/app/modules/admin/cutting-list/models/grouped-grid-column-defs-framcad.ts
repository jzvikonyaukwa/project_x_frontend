import { ColDef, ISelectCellEditorParams } from 'ag-grid-enterprise';
import { EmptyButtonComponent } from 'app/utilities/ag-grid/empty-button/empty-button.component';
import { ManufacturedButtonComponent } from 'app/utilities/ag-grid/manufactured-button/manufactured-button.component';
import { GroupedFramecadMPs } from './groupedFramecadManufacturedProducts';

export function createGroupedColDefsForFramecad(
  manufacture: boolean,
  statusFormatter: (params: any) => string,
  productPickedCallback: (id: number) => void,
  manufactureGroupProductsCallback: (frameName: GroupedFramecadMPs) => void,
): ColDef[] {
  const colDefs: ColDef[] = [
    {
      field: 'planName',
      width: 110,
      headerName: 'Product Type',
    },
    {
      field: 'frameType',
      width: 130,
      headerName: 'FRAME TYPE',
    },
    {
      field: 'frameName',
      width: 130,
      headerName: 'FRAME NAME',
    },
    { field: 'remainingQty', width: 130, headerName: 'PARTS REMAINING' },
    { field: 'completedQty', width: 130, headerName: 'PARTS COMPLETED' },
    {
      field: 'lengthRemaining',
      width: 120,
      valueFormatter: (params) => {
        const value = params.value;
        return value !== undefined && value !== null ? `${value.toFixed(2)}` : '';
      },
      headerName: 'Mtrs to Complete',
    },
    {
      headerName: 'STATUS',
      field: 'mp.status',
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
      field: 'mp.totalLength',
      // field: 'mp.frameName',
      width: 150,
      cellRendererSelector: (params) => {
        if (!params || !params.data) {
          return {};
        }

        if (params.data.pickable || params.data?.mp?.status === 'completed') {
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
          const groupedData: GroupedFramecadMPs = rowData.data;
          manufactureGroupProductsCallback(groupedData);
        },
      },
      hide: !manufacture,
    },
  ];

  return colDefs;
}
