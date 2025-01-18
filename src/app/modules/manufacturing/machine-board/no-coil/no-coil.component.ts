import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { ChangeCoilModalComponent } from "../change-coil-modal/change-coil-modal.component";
import { MatDialog } from "@angular/material/dialog";
import { MachineEventsService } from "../../machines/services/machine-events.service";
import { Subject } from "rxjs";
import { Machine } from "../../machines/models/machine";
import { MachineInformation } from "../../machines/models/machineInformation";

@Component({
  selector: "app-no-coil",
  standalone: true,
  imports: [CommonModule, MatIconModule, MatMenuModule],
  templateUrl: "./no-coil.component.html",
})
export class NoCoilComponent implements OnInit, OnChanges, OnDestroy {
  @Input() productCategory: MachineInformation;
  private ngUnsubscribe = new Subject<void>();

  constructor(
    private dialog: MatDialog,
    private machineEventsService: MachineEventsService
  ) {}

  ngOnInit(): void {
    console.log(
      "In NoCoilComponent in the ngOnInit method. productCategory: ",
      this.productCategory
    );

    if (!this.productCategory) {
      console.log("No product category. Returning from ngOnInit method.");
      return;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.manufacturingInfo) {
      console.log(
        "In the ngOnChanges method changes.manufacturingInfo = ",
        changes.manufacturingInfo.currentValue
      );
      this.productCategory = changes.manufacturingInfo.currentValue;
    }
  }

  onChangeCoil(): void {
    console.log("onChangeCoil. width: ", this.productCategory.width);

    const dialogRef = this.dialog.open(ChangeCoilModalComponent, {
      data: {
        coil: null,
        machineId: this.productCategory.machineId,
        width: this.productCategory.width,
      },
      maxWidth: "96vw",
      width: "75vw",
      maxHeight: "95vh",
    });

    dialogRef.afterClosed().subscribe((res) => {
      console.log("The dialog was closed. Result: ", res);
      if (res) {
        this.getMachinesLastEvent();
      }
    });
  }

  getMachinesLastEvent(): void {
    console.log(
      "Getting last event for machine: ",
      this.productCategory.machineId
    );
    if (!this.productCategory.machineId) return;
    this.machineEventsService
      .getMachinesLastEvent(this.productCategory.machineId)
      .subscribe({
        next: (res) => {
          console.log("Last event: ", res);
        },
        error: (err) => {
          console.log(err);
        },
      });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
