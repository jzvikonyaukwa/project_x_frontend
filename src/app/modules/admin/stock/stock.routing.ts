import { Routes } from "@angular/router";
import { StockComponent } from "./stock.component";

export const STOCK_ROUTES: Routes = [
  {
    path: "",
    component: StockComponent,
    children: [
      {
        path: "",
        data: { breadcrumb: "Stock Overview" },
        loadComponent: () =>
          import(
            "app/modules/admin/stock/stock-overview/stock-overview.component"
          ).then((c) => c.StockOverviewComponent),
      },
      {
        path: ":id",
        data: { breadcrumb: "Coil" },
        loadComponent: () =>
          import(
            "app/modules/admin/stock/steel-coil/steel-coil.component"
          ).then((c) => c.SteelCoilComponent),
      },
    ],
  },
  {
    path: "history/:warehouseID/:consumableID", 
    loadComponent: () =>
      import(
        "app/modules/admin/consumables/consumable-history/consumable-history.component"
      ).then((c) => c.ConsumableHistoryComponent),
  },
];
