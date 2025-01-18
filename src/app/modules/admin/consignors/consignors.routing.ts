import { Route } from "@angular/router";
import { ConsignorsComponent } from "./consignors.component";
import { ConsignorComponent } from "./consignor/consignor.component";

export const CONSIGNORS_ROUTES: Route[] = [
  {
    path: "",
    component: ConsignorsComponent,
  },
  {
    path: ":id",
    component: ConsignorComponent,
  },
];
