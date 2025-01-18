import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatDialogRef } from "@angular/material/dialog";
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";

@Component({
  selector: "app-kp-input-modal",
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: "./coil-number-input-modal.component.html",
})
export class CoilNumberInputModalComponent {
  coilNumberForm: FormGroup = this.fb.group({
    coilNumber: ["", Validators.required],
  });

  constructor(
    public dialogRef: MatDialogRef<CoilNumberInputModalComponent>,
    private fb: FormBuilder
  ) {}

  onSubmit(kpForm: FormGroup) {
    const formValue = kpForm.getRawValue();
    console.log("formValue: ", formValue);
    if (!formValue.coilNumber) {
      this.onDialogClose();
    }
    this.dialogRef.close(formValue.coilNumber);
  }

  onDialogClose() {
    this.dialogRef.close();
  }
}
