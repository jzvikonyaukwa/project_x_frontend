import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";
import { MachineEventsService } from "../services/machine-events.service";
import { Observable } from "rxjs";
import { ColDef, GridReadyEvent } from "ag-grid-community";
import { MachineEventDTO } from "../models/machineEventDTO";

@Component({
  selector: "app-machine-events-table",
  templateUrl: "./machine-events-table.component.html",
  styleUrls: ["./machine-events-table.component.scss"],
})
export class MachineEventsTableComponent implements OnInit {
  machineId: number | undefined;
  machinesEvents$: Observable<MachineEventDTO[]> | undefined;

  public columnDefs: ColDef[] = [
    { headerName: "Event ID", field: "id" },
    { headerName: "COIL ID", field: "steelCoilId" },
    { headerName: "Loaded", field: "loadedTime" },
    { headerName: "unloaded", field: "unloadedTime" },
    { headerName: "Cuts Made", field: "cutsMade" },
    { headerName: "Total Meters Cut", field: "totalMetersCut" },
    { headerName: "Steel Coil ID", field: "steelCoilId" },
  ];

  public defaultColDef: ColDef = {
    flex: 1,
    minWidth: 100,
    sortable: true,
    filter: true,
  };

  constructor(
    private route: ActivatedRoute,
    private machineEventService: MachineEventsService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.machineId = parseInt(params["id"]);

      if (isNaN(this.machineId)) {
        console.log(
          "URL did not contain a number. machineId was not added to URL"
        );
      } else {
        console.log("machineId = ", this.machineId);
        this.machinesEvents$ = this.machineEventService.getAllMachinesEvents(
          this.machineId
        );
      }
    });
  }

  onGridReady(params: GridReadyEvent<MachineEventDTO>) {
    // this.gridApi = params.api;
  }
}
