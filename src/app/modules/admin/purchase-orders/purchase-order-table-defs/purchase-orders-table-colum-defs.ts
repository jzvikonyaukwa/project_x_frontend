import { ColDef } from 'ag-grid-enterprise';
import { DeleteButtonAgGridComponent } from '@shared/components/delete-button-ag-grid/delete-button-ag-grid.component';
import { EditButtonComponent } from 'app/utilities/ag-grid/edit-button/edit-button.component';
import { getFirstTwoWords } from 'app/utilities/ag-grid/GetFirstTwoWords';
import { EmptyButtonComponent } from 'app/utilities/ag-grid/empty-button/empty-button.component';
import { AccessButtonAgGridComponent } from 'app/utilities/ag-grid/access-button-ag-grid/access-button-ag-grid.component';
import { DispatchButtonComponent } from 'app/utilities/ag-grid/dispatch-button/dispatch-button.component';
import { Router } from '@angular/router';

export function createColumnDefs(
  router: Router,
  deletePurchaseOrder: (id: number) => void,
): ColDef[] {
  return [
    {
      headerName: 'ID',
      field: 'id',
      cellRenderer: 'agGroupCellRenderer',
      width: 100,
    },
    {
      headerName: 'Order Created',
      field: 'dateIssued',
      width: 150,
      // valueFormatter: agGridDateFormatter,
    },
    {
      headerName: 'Exp Delivery',
      field: 'expectedDeliveryDate',
      // valueFormatter: agGridDateFormatter,
      width: 150,
    },
    {
      headerName: 'Comments',
      field: 'notes',
      width: 150,
    },
    {
      field: 'status',
      headerName: 'Status',
      filter: 'agSetColumnFilter',
      filterParams: {
        values: ['Completed', 'Pending'],
        defaultFilter: ['Pending'],
      },
      valueFormatter: (params) => {
        if (!params.value || params.value === null) {
          return;
        }
        return params.value.charAt(0).toUpperCase() + params.value.slice(1);
      },
      width: 120,
      cellClassRules: {
        'text-orange-500': (params) => params.value === 'pending',
        'text-green-500': (params) => params.value === 'complete',
      },
    },
    {
      headerName: 'Supplier Name',
      field: 'supplierName',
      filter: 'agTextColumnFilter',
      valueFormatter: (params) => getFirstTwoWords(params.data.supplierName),
      width: 150,
    },
    {
      field: 'id',
      headerName: 'Edit',
      cellRendererSelector: (params) => {
        if (params.data.status === 'pending') {
          return {
            component: EditButtonComponent,
          };
        } else {
          return { component: EmptyButtonComponent };
        }
      },
      cellRendererParams: {
        onClick: (id: number) => {
          editPurchaseOrder(id, router);
        },
      },
      width: 100,
    },
    {
      field: 'id',
      headerName: 'View',
      cellRenderer: AccessButtonAgGridComponent,
      cellRendererParams: {
        onClick: (id: number) => {
          router.navigate(['/purchase-orders', 'export-document', id]);
        },
      },
      width: 100,
    },
    {
      field: 'id',
      headerName: 'Deliveries',
      cellRenderer: DispatchButtonComponent,
      cellRendererParams: {
        onClick: (id: number) => {
          router.navigate(['/purchase-orders', 'deliveries', id]);
        },
      },
      width: 120,
    },
    {
      field: 'id',
      headerName: 'Cancel',
      cellRendererSelector: (params) => {
        if (params.data.status === 'pending' && !params.data.hasGrv) {
          return {
            component: DeleteButtonAgGridComponent,
          };
        } else {
          return { component: EmptyButtonComponent };
        }
      },
      cellRendererParams: {
        onClick: (id: string) => {
          deletePurchaseOrder(Number(id));
        },
      },
      width: 100,
    },
  ];
}
function editPurchaseOrder(id: number, router: Router) {
  router.navigate([`purchase-orders/edit/${id}`]);
}
