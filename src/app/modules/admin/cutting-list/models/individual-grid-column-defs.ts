import { EmptyButtonComponent } from 'app/utilities/ag-grid/empty-button/empty-button.component';
import { ManufacturedButtonComponent } from 'app/utilities/ag-grid/manufactured-button/manufactured-button.component';
import { ColDef as OriginalColDef } from 'ag-grid-enterprise';

interface ColDef extends OriginalColDef {
  cellEditorFramework?: any;
}

export function createProductColDefs(
  manufacture: boolean,
  statusFormatter: (params: any) => string,
  productPickedCallback: (id: number) => void,
  productManufacturedCallback: (id: number, dateManufactured: Date | null) => void,
): ColDef[] {
  return [
    { field: 'id', width: 100, headerName: 'ID', filter: 'agTextColumnFilter' },
    {
      field: 'code',
      width: 100,
      headerName: 'CODE',
      filter: 'agTextColumnFilter',
    },
    {
      headerName: 'PRODUCT STATUS',
      field: 'productStatus',
      valueFormatter: (params) => statusFormatter(params),
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: () => ({
        values: ['completed', 'scheduled', 'picked'],
      }),
      width: 150,
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
    {
      field: 'stick',
      width: 130,
      headerName: 'STICK',
    },
    {
      field: 'stickType',
      width: 120,
      headerName: 'TYPE',
    },
    { field: 'length', width: 130, headerName: 'LENGTH' },
    {
      headerName: 'AGG PROD STATUS',
      field: 'aggProdStatus',
      valueFormatter: (params) => statusFormatter(params),
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: () => ({
        values: ['completed', 'scheduled', 'picked'],
      }),
      width: 150,
    },
    {
      headerName: 'PICK',
      field: 'id',
      cellRendererSelector: (params: any) => {
        if (!params || !params.data) {
          return { component: EmptyButtonComponent };
        }
        if (params.data.status === 'completed') {
          return { component: EmptyButtonComponent };
        } else if (params.data.pickable) {
          return { component: ManufacturedButtonComponent };
        } else {
          return { component: EmptyButtonComponent };
        }
      },
      cellRendererParams: {
        clicked: (params: any) => {
          if (params && params.data) {
            productPickedCallback(params.data.id);
          }
        },
      },
      hide: !manufacture,
      width: 140,
    },
    {
      headerName: 'PRODUCED',
      field: 'id',
      cellRendererSelector: (params: any) => {
        if (!params || !params.data) {
          return { component: EmptyButtonComponent };
        }
        if (params.data.pickable || params.data.aggProdStatus === 'completed') {
          return { component: EmptyButtonComponent };
        } else {
          return { component: ManufacturedButtonComponent };
        }
      },
      cellRendererParams: {
        clicked: (params: any) => {
          if (params && params.data) {
            const dateManufactured = params.data.manufacturedOn || null;
            productManufacturedCallback(params.data.id, dateManufactured);
          }
        },
      },
      hide: !manufacture,
      width: 150,
    },
  ];
}
