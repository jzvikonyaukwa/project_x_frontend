import { Route } from "@angular/router";
import { ClientsComponent } from "./clients.component";
import { ClientsTableComponent } from "./clients-table/clients-table.component";
import { AddClientComponent } from "./add-client/add-client.component";
import { CustomerComponent } from "./customer/customer.component";

export const clientsRoutes: Route[] = [
  {
    path: "",
    component: ClientsComponent,
    children: [
      {
        path: "",
        pathMatch: "full",
        redirectTo: "all-clients",
      },
      {
        path: "all-clients",
        component: ClientsTableComponent,
      },
      {
        path: "add",
        component: AddClientComponent,
      },
      {
        path: ":id",
        component: CustomerComponent,
      },
    ],
  },
];
