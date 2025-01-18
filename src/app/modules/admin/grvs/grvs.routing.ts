import { Route } from "@angular/router";
import { AddGrvComponent } from "./add-grv/add-grv.component";
import { DetailsComponent } from "./details/details.component";
import { GvrsListComponent } from "./gvrs-list/gvrs-list.component";

export const GRV_ROUTES: Route[] = [
  {
    path: "",
    component: GvrsListComponent,
  },
  {
    path: "add",
    component: AddGrvComponent,
  },
  {
    path: ":id",
    component: DetailsComponent,
  },
];
