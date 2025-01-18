import { Component, Inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { RejectionReason } from "@shared/models/rejectionReason";
import { MatDatepickerModule } from '@angular/material/datepicker';
import { LuxonDateModule } from "@angular/material-luxon-adapter";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatSelectModule } from "@angular/material/select";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from "@angular/material/dialog";

@Component({
  selector: "app-rejected-pop-up",
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    LuxonDateModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatDialogModule,
  ],
  templateUrl: "./rejected-pop-up.component.html",
  styleUrls: ["./rejected-pop-up.component.scss"],
})
export class RejectedPopUpComponent {
  todaysDate: Date = new Date();
  rejectedReasons: RejectionReason[] = [];

  public rejectedReasonForm: FormGroup = this.fb.group({
    date: [this.todaysDate, [Validators.required]],
    reason: ["", [Validators.required]],
  });

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RejectedPopUpComponent>,
    @Inject(MAT_DIALOG_DATA) data: RejectionReason[]
  ) {
    this.rejectedReasons = data;
  }

  public onSubmit(): void {
    const quoteRejectedObject: RejectedData = {
      ...this.rejectedReasonForm.value,
    };
    console.log("quoteRejectedObject: ", quoteRejectedObject);
    this.dialogRef.close(quoteRejectedObject);
  }

  cancel() {
    console.log("cancel");
    this.rejectedReasonForm.reset();
    this.dialogRef.close();
  }
}

interface RejectedData {
  date: Date;
  reason: RejectionReason;
}
