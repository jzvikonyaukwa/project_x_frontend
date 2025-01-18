import { Component, Inject, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { PhoneEditForm } from "app/modules/admin/clients/user-form/user-form.interface";
import { Phone } from "app/modules/admin/clients/user-form/models/userDTO";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

export interface UserEditPhoneDialogData {
  data: Phone[];
}

interface MainGroup {
  phones?: FormArray<FormGroup<PhoneEditForm>>;
}

@Component({
  selector: "app-user-edit-phones-modal",
  templateUrl: "./user-edit-phones-modal.component.html",
})
export class UserEditPhonesModalComponent implements OnInit {
  public mainFormGroup = this._fb.group<MainGroup>({
    phones: this._fb.array<FormGroup<PhoneEditForm>>([]),
  });

  private phoneForm = (phone?: Phone): FormGroup<PhoneEditForm> =>
    this._fb.group<PhoneEditForm>({
      id: this._fb.control((phone && phone.id) || null, []),
      label: this._fb.control((phone && phone.label) || "main", [
        Validators.required,
      ]),
      phone: this._fb.control((phone && phone.phone) || "", [
        Validators.required,
      ]),
      delete: this._fb.control(false),
    });

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: UserEditPhoneDialogData,
    private _dialogRef: MatDialogRef<UserEditPhonesModalComponent>,
    private _fb: FormBuilder
  ) {}

  public ngOnInit(): void {
    if (this.data.data.length === 0) {
      this.addGroup();
    }
    this.fillForm();
  }

  public fillForm(): void {
    this.data.data.forEach((phone: Phone) =>
      this.mainFormGroup.controls["phones"].push(this.phoneForm(phone))
    );
  }

  public addGroup(): void {
    this.mainFormGroup.controls["phones"].push(this.phoneForm());
  }

  public onDelete(index: number): void {
    const phoneGroup: FormGroup =
      this.mainFormGroup.controls["phones"].at(index);
    if (phoneGroup.get("id").value) {
      phoneGroup.get("delete").setValue(true);
    } else {
      this.mainFormGroup.controls["phones"].removeAt(index);
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
    this._dialogRef.close(this.mainFormGroup.value.phones);
  }
}
