import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PageHeadingComponent } from "@layout/common/page-heading/page-heading.component";
import { SteelCoilInterBranchTransfersComponent } from "../steel-coils-inter-branch-transfers/steel-coils-inter-branch-transfers.component";
import { ConsumableInterBranchTransferComponent } from "../consumable-inter-branch-transfer/consumable-inter-branch-transfer.component";
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";

@Component({
  selector: "app-inter-branch-transfers",
  standalone: true,
  imports: [
    CommonModule,
    PageHeadingComponent,
    SteelCoilInterBranchTransfersComponent,
    ConsumableInterBranchTransferComponent,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: "./inter-branch-transfers.component.html",
})
export class InterBranchTransfersComponent {
  formGroup = new FormGroup({
    search: new FormControl(""),
  });
}
