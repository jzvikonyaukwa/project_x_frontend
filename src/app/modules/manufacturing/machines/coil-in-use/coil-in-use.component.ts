import { Component, Input } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { MachineEventsService } from "../services/machine-events.service";
import { MachineEvent } from "../models/machineEvent";

@Component({
  selector: "app-coil-in-use",
  templateUrl: "./coil-in-use.component.html",
})
export class CoilInUseComponent {
  @Input() machinesLastEvent: MachineEvent;
  machineId: number;

  constructor(
    private route: ActivatedRoute,
    private machineEventsService: MachineEventsService
  ) {}
}
