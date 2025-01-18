import { Component, Inject, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import {NameEditForm} from "app/modules/admin/clients/user-form/user-form.interface";
import {Name} from "app/modules/admin/clients/user-form/models/userDTO";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

export interface UserEditNameDialogData {
  data: Name[];
}

interface MainGroup {
  name?: FormArray<FormGroup<NameEditForm>>;
}

@Component({
  selector: "app-user-edit-name-modal",
  templateUrl: "./user-edit-name-modal.component.html",
})
export class UserEditNameModalComponent implements OnInit {
  public mainFormGroup = this._fb.group<MainGroup>({
    name: this._fb.array<FormGroup<NameEditForm>>([]),
  });

  private nameForm = (name?: Name): FormGroup<NameEditForm> =>
      this._fb.group<NameEditForm>({
        id: this._fb.control((name && name.id) || null, []),
        label: this._fb.control((name && name.label) || "main", [
          Validators.required,
        ]),
        name: this._fb.control((name && name.name) || "", [
          Validators.required, Validators.maxLength(255),
        ])
      });

  constructor(
      @Inject(MAT_DIALOG_DATA) public data: UserEditNameDialogData,
      private _dialogRef: MatDialogRef<UserEditNameModalComponent>,
      private _fb: FormBuilder
  ) {}

  public ngOnInit(): void {
    if (this.data.data.length === 0) {
      this.addGroup();
    }
    this.fillForm();
  }

  public fillForm(): void {
    this.data.data.forEach((name: Name) =>
        this.mainFormGroup.controls["name"].push(this.nameForm(name))
    );
  }

  public addGroup(): void {
    this.mainFormGroup.controls["name"].push(this.nameForm());
  }

  public onDelete(index: number): void {
    const phoneGroup: FormGroup =
        this.mainFormGroup.controls["name"].at(index);
    if (phoneGroup.get("id").value) {
      phoneGroup.get("delete").setValue(true);
    } else {
      this.mainFormGroup.controls["name"].removeAt(index);
    }
  }

  public onSave(): void {
    if (this.mainFormGroup.invalid) {
      this.mainFormGroup.markAllAsTouched();
      return;
    }
    if (
        !this.mainFormGroup.dirty &&
        this.mainFormGroup.value == this.data.data
    ) {
      this._dialogRef.close();
      return;
    }
    this._dialogRef.close(this.mainFormGroup.value.name);
  }
}
