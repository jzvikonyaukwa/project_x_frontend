import { ColDef } from "ag-grid-enterprise";

export function getColumnDefs(startBalance: number): ColDef[] {
  let runningBalance = startBalance;
  return [
    {
      headerName: "DATE",
      field: "date",
      floatingFilter: true,
      minWidth: 130,
    },
    {
      headerName: "CLIENT",
      field: "client",
      floatingFilter: true,
      minWidth: 180,
      valueFormatter: (params) => {
        // If the client is null, return 'ON HAND STOCK'
        return params.value ? params.value : "OTHER";
      },
    },
    {
      headerName: "TRANSACTION ID",
      field: "productTransactionId",
      floatingFilter: true,
      width: 150,
    },
    {
      headerName: "PRODUCT ID",
      field: "manufacturedProductId",
      floatingFilter: true,
      width: 130,
    },
    {
      headerName: "STOCK ID",
      field: "stockOnHandId",
      floatingFilter: true,
      width: 130,
    },
    {
      headerName: "TYPE",
      field: "balance",
      floatingFilter: true,
      width: 130,
      valueGetter: (params) => {
        if (params.data.stockOnHandLength) {
          return "STOCK";
        }
        if (params.data.manufacturedProductLength) {
          return "PRODUCT";
        }
        if (params.data.wastageLength) {
          return "WASTE";
        }
      },
    },
    {
      headerName: "LENGTH",
      width: 130,
      floatingFilter: true,
      valueGetter: (params) => {
        if (params.data.stockOnHandLength) {
          return -params.data.stockOnHandLength;
        }
        if (params.data.manufacturedProductLength) {
          return -params.data.manufacturedProductLength;
        }
        if (params.data.wastageLength) {
          return -params.data.wastageLength;
        }
      },
    },
    {
      headerName: "PLAN NAME",
      field: "planName",
      width: 150,
      floatingFilter: true,
    },
    {
      headerName: "FRAME TYPE",
      field: "frameType",
      width: 150,
      floatingFilter: true,
    },
    {
      headerName: "FRAME NAME",
      field: "frameName",
      width: 150,
      floatingFilter: true,
    },
    {
      headerName: "BALANCE",
      field: "balance",
      width: 130,
      valueGetter: (params) => {
        if (params.data.stockOnHandLength) {
          runningBalance -= params.data.stockOnHandLength;
        }
        if (params.data.manufacturedProductLength) {
          runningBalance -= params.data.manufacturedProductLength;
        }
        if (params.data.wastageLength) {
          runningBalance -= params.data.wastageLength;
        }
        return runningBalance.toFixed(2);
      },
    },
  ];
}
