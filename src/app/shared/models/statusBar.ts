import { StatusPanelDef } from "ag-grid-community";

export const statusBar: {
  statusPanels: StatusPanelDef[];
} = {
  statusPanels: [
    {
      statusPanel: "agTotalAndFilteredRowCountComponent",
      align: "left",
    },
    { statusPanel: "agAggregationComponent" },
  ],
};
