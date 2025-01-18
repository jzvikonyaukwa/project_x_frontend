import { Component, Inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatIconModule } from "@angular/material/icon";
import { AmountDate } from "../models/amountDate";

@Component({
  selector: "app-amount-modal",
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatDatepickerModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
  ],
  templateUrl: "./amount-modal.component.html",
})
export class AmountModalComponent {
  mtrsInputted: number;
  mtrsForm: FormGroup = this.fb.group({
    mtrs: ["", Validators.required],
    date: [new Date(), Validators.required],
  });

  constructor(
    private dialogRef: MatDialogRef<AmountModalComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { steel: boolean },
    private fb: FormBuilder
  ) {}

  onDialogClose(): void {
    this.dialogRef.close();
  }

  onSubmit(mtrsForm: FormGroup) {
    if (mtrsForm.invalid) {
      return;
    }

    const mtrsInputted: AmountDate = mtrsForm.value;

    if (mtrsInputted.mtrs < 0) {
      return;
    }

    this.dialogRef.close(mtrsInputted);
  }
}
