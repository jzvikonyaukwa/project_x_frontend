import { Component, Inject, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AddressEditForm } from "app/modules/admin/clients/user-form/user-form.interface";
import { Address } from "app/modules/admin/clients/user-form/models/userDTO";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

export interface UserEditAddressDialogData {
  data: Address[];
}

interface MainGroup {
  addresses?: FormArray<FormGroup<AddressEditForm>>;
}
@Component({
  selector: "app-user-edit-addresses",
  templateUrl: "./user-edit-addresses-modal.component.html",
})
export class UserEditAddressesModalComponent implements OnInit {
  public mainFormGroup = this._fb.group<MainGroup>({
    addresses: this._fb.array<FormGroup<AddressEditForm>>([]),
  });

  private addressForm = (address?: Address): FormGroup<AddressEditForm> =>
    this._fb.group<AddressEditForm>({
      id: this._fb.control((address && address.id) || null, []),
      label: this._fb.control((address && address.label) || "main", [
        Validators.required,
      ]),
      street: this._fb.control((address && address.street) || "", [
        Validators.required,
      ]),
      suburb: this._fb.control((address && address.suburb) || "", [
        Validators.required,
      ]),
      city: this._fb.control((address && address.city) || "", [
        Validators.required,
      ]),
      country: this._fb.control((address && address.country) || "Zimbabwe", [
        Validators.required,
      ]),
      delete: this._fb.control(false),
    });

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: UserEditAddressDialogData,
    private _dialogRef: MatDialogRef<UserEditAddressesModalComponent>,
    private _fb: FormBuilder
  ) {}

  public ngOnInit(): void {
    if (this.data.data.length === 0) {
      this.addGroup();
    }
    this.fillForm();
  }

  public fillForm(): void {
    this.data.data.forEach((address: Address) =>
      this.mainFormGroup.controls["addresses"].push(this.addressForm(address))
    );
  }

  public addGroup(): void {
    this.mainFormGroup.controls["addresses"].push(this.addressForm());
  }

  public onDelete(index: number): void {
    const addressGroup: FormGroup =
      this.mainFormGroup.controls["addresses"].at(index);
    if (addressGroup.get("id").value) {
      addressGroup.get("delete").setValue(true);
    } else {
      this.mainFormGroup.controls["addresses"].removeAt(index);
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
    this._dialogRef.close(this.mainFormGroup.value.addresses);
  }
}
