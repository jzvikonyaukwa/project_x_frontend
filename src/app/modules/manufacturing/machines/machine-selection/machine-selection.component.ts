import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { RouterModule } from "@angular/router";
import { PageHeadingComponent } from "@layout/common/page-heading/page-heading.component";
import { DateTime } from "luxon";
import { MACHINE_INFORMATION } from "../models/machinesInformations";
import { MachineInformation } from "../models/machineInformation";

@Component({
  selector: "app-machine-selection",
  templateUrl: "./machine-selection.component.html",
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    PageHeadingComponent,
    MatButtonModule,
    RouterModule,
  ],
})
export class MachineSelectionComponent {
  now = DateTime.now();

  machinesInformation: MachineInformation[] = MACHINE_INFORMATION;

  formatDateAsRelative(date: string): string {
    return DateTime.fromISO(date).toRelative();
  }
}
