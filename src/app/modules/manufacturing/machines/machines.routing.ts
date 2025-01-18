import { Route } from "@angular/router";
import { MachineSelectionComponent } from "./machine-selection/machine-selection.component";
import { MachineBoardComponent } from "../machine-board/machine-board.component";
import { MachineComponent } from "../machine/machine.component";

export const machinesRoutes: Route[] = [
  {
    path: "",
    component: MachineSelectionComponent,
  },
  {
    path: "coil-board/:id",
    component: MachineBoardComponent,
  },
  {
    path: ":id",
    component: MachineComponent,
  },
];
