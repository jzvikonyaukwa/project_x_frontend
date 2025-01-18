import { CommonModule } from "@angular/common";
import { Component, Inject, Optional } from "@angular/core";
import { GrvFormComponent } from "./grv-form/grv-form.component";
import { FuseCardComponent } from "@fuse/components/card";
import { PageHeadingComponent } from "@layout/common/page-heading/page-heading.component";
import { MAT_DIALOG_DATA, MatDialogModule } from "@angular/material/dialog";
import { GrvSummaryRowData } from "../models/grvSummaryRowData";

@Component({
  selector: "app-add-grv",
  templateUrl: "./add-grv.component.html",
  standalone: true,
  imports: [
    CommonModule,
    GrvFormComponent,
    PageHeadingComponent,
    FuseCardComponent,
    MatDialogModule,
  ],
})
export class AddGrvComponent {
  constructor(
    @Optional()
    @Inject(MAT_DIALOG_DATA)
    public data: { rowData: GrvSummaryRowData; edit?: boolean }
  ) {}
}
