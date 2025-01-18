import { Component, Inject, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { SteelCoilDetailsDTO } from "@shared/models/steelCoilDetailsDTO";
import { WastageInput } from "./wastageInput";
import { CommonModule } from "@angular/common";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";

@Component({
  selector: "app-add-wastage-modal",
  templateUrl: "./add-wastage-modal.component.html",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
  ],
})
export class AddWastageModalComponent implements OnInit {
  wastageForm: FormGroup;
  constructor(
    public dialogRef: MatDialogRef<AddWastageModalComponent>,
    @Inject(MAT_DIALOG_DATA) public coil: SteelCoilDetailsDTO,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.wastageForm = this.fb.group({
      wastage: ["", Validators.required],
      date: [new Date(), Validators.required],
    });
  }

  onDialogClose(): void {
    this.dialogRef.close();
  }

  onSubmit(wastageForm: FormGroup) {
    const wastage: WastageInput = wastageForm.value;

    console.log("In onSubmit and wastageForm: ", wastage);

    this.dialogRef.close(wastage);
  }
}
