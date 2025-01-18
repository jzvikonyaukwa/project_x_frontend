import { Component, Inject, OnInit } from "@angular/core";
import { Email } from "app/modules/admin/clients/user-form/models/userDTO";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { EmailEditForm } from "app/modules/admin/clients/user-form/user-form.interface";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

export interface UserEditEmailDialogData {
  data: Email[];
}

interface MainGroup {
  emails?: FormArray<FormGroup<EmailEditForm>>;
}

@Component({
  selector: "app-user-edit-emails-modal",
  templateUrl: "./user-edit-emails-modal.component.html",
})
export class UserEditEmailsModalComponent implements OnInit {
  public mainFormGroup = this._fb.group<MainGroup>({
    emails: this._fb.array<FormGroup<EmailEditForm>>([]),
  });

  private emailForm = (email?: Email): FormGroup<EmailEditForm> =>
    this._fb.group<EmailEditForm>({
      id: this._fb.control((email && email.id) || null, []),
      label: this._fb.control((email && email.label) || "main", [
        Validators.required,
      ]),
      email: this._fb.control((email && email.email) || "", [
        Validators.required,
        Validators.email,
      ]),
      delete: this._fb.control(false),
    });

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: UserEditEmailDialogData,
    private _dialogRef: MatDialogRef<UserEditEmailsModalComponent>,
    private _fb: FormBuilder
  ) {}

  public ngOnInit(): void {
    if (this.data.data.length === 0) {
      this.addGroup();
    }
    this.fillForm();
  }

  public fillForm(): void {
    this.data.data.forEach((email: Email) =>
      this.mainFormGroup.controls["emails"].push(this.emailForm(email))
    );
  }

  public addGroup(): void {
    this.mainFormGroup.controls["emails"].push(this.emailForm());
  }

  public onDelete(index: number): void {
    const emailGroup: FormGroup =
      this.mainFormGroup.controls["emails"].at(index);
    if (emailGroup.get("id").value) {
      emailGroup.get("delete").setValue(true);
    } else {
      this.mainFormGroup.controls["emails"].removeAt(index);
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
    this._dialogRef.close(this.mainFormGroup.value.emails);
  }
}
