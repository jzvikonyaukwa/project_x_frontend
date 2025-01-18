import { ColDef } from "ag-grid-enterprise";
import { AccessButtonAgGridComponent } from "../../../../utilities/ag-grid/access-button-ag-grid/access-button-ag-grid.component";
import { Router } from "@angular/router";

export function getColumnDefs(router: Router): ColDef[] {
  return [
    { field: "clientId", headerName: "ID" },
    { field: "clientName", headerName: "NAME" },
    { field: "phone", headerName: "PHONE" },
    { field: "email", headerName: "EMAIL" },
    { field: "street", headerName: "STREET" },
    { field: "suburb", headerName: "SUBURB" },
    { field: "country", headerName: "COUNTRY" },
    {
      field: "clientId",
      headerName: "DETAILS",
      cellRenderer: AccessButtonAgGridComponent,
      cellRendererParams: {
        onClick: (id: number) => {
          router.navigate(["/clients", id]);
        },
      },
    },
  ];
}
