import { ColDef } from "ag-grid-enterprise";
import { dateFromISOToMEDFormatter } from "app/utilities/ag-grid/value-formatters";

export const SUPPLIESPURCHASEORDERSCOLUMNDEFS: ColDef[] = [
  {
    headerName: 'PO ID',
    field: 'id',
    // headerCheckboxSelection: true,
    checkboxSelection: true,
    width: 120,
  },
  {
    headerName: 'Date Issued',
    field: 'dateIssued',
    cellClass: 'text-right',
    valueFormatter: dateFromISOToMEDFormatter,
    width: 150,
  },
  {
    headerName: 'Exp Delivery Dtae',
    field: 'expectedDeliveryDate',
    cellClass: 'text-right',
    valueFormatter: dateFromISOToMEDFormatter,
    width: 150,
  },
  {
    headerName: 'Supplier Name',
    field: 'supplier.name',
    width: 150,
  },
  {
    headerName: 'Status',
    field: 'status',
    width: 90,
    maxWidth: 200,
    valueGetter: (params) => {
      if (params.data.status && typeof params.data.status === 'string') {
        return params.data.status.charAt(0).toUpperCase() + params.data.status.slice(1);
      }
      return null;
    },
  },
] as ColDef[];
