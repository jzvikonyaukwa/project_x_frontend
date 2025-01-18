import { CommonModule } from "@angular/common";
import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: "app-view-coil-modal",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./view-coil-modal.component.html",
  styleUrls: ["./view-coil-modal.component.css"],
})
export class ViewCoilModalComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<ViewCoilModalComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      steelCoilId: SteelCoilId;
    }
  ) {}

  ngOnInit() {
    console.log("ViewCoilModalComponent: ", this.data.steelCoilId);
  }
}

export interface SteelCoilId {
  steelCoilId: number;
}
