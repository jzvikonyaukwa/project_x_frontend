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
import { MissingMetresInput } from "./missing-metresInput";
import { CommonModule } from "@angular/common";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";

@Component({
  selector: "app-add-wastage-modal",
  templateUrl: "./add-missing-metres-modal.component.html",
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
export class AddMissingMetresModalComponent implements OnInit {
  missingMetresForm: FormGroup;
  constructor(
    public dialogRef: MatDialogRef<AddMissingMetresModalComponent>,
    @Inject(MAT_DIALOG_DATA) public coil: SteelCoilDetailsDTO,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.missingMetresForm = this.fb.group({
      missingMetres: ["", Validators.required],
      reason: ["", Validators.required],
      date: [new Date(), Validators.required],
    });
  }

  onDialogClose(): void {
    this.dialogRef.close();
  }

  onSubmit(missingMetresForm: FormGroup) {
    const missingMetres: MissingMetresInput = missingMetresForm.value;

    console.log("In onSubmit and missingMetresForm: ", missingMetres);

    this.dialogRef.close(missingMetres);
  }
}
