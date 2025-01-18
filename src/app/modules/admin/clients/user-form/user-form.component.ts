import { Component, EventEmitter, Output } from "@angular/core";
import {
  UserForm,
  AddressForm,
  PhoneForm,
  EmailForm,
} from "./user-form.interface";
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { UserDTO } from "app/modules/admin/clients/user-form/models/userDTO";
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatSelectModule } from "@angular/material/select";
import { MatDialogModule } from "@angular/material/dialog";
import { MatInputModule } from "@angular/material/input";

@Component({
  selector: "app-user-form",
  templateUrl: "./user-form.component.html",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDialogModule,
    MatInputModule,
  ],
})
// host: { class: "flex flex-col flex-auto" },
export class UserFormComponent {
  @Output() onSubmitForm: EventEmitter<UserDTO> = new EventEmitter<UserDTO>();

  public form = this._fb.group<UserForm>({
    name: this._fb.control("", [Validators.required]),
    notes: this._fb.control(""),
    addresses: this._fb.array<FormGroup<AddressForm>>([]),
    phones: this._fb.array<FormGroup<PhoneForm>>([]),
    emails: this._fb.array<FormGroup<EmailForm>>([]),
  });

  private addressForm = () =>
    this._fb.group<AddressForm>({
      label: this._fb.control("main", [Validators.required]),
      street: this._fb.control("", [Validators.required]),
      suburb: this._fb.control("", [Validators.required]),
      city: this._fb.control("", [Validators.required]),
      country: this._fb.control("Zimbabwe", [Validators.required]),
    });

  private phoneForm = () =>
    this._fb.group<PhoneForm>({
      label: this._fb.control("main", [Validators.required]),
      phone: this._fb.control("", [Validators.required]),
    });

  private emailForm = () =>
    this._fb.group<EmailForm>({
      label: this._fb.control("main", [Validators.required]),
      email: this._fb.control("", [Validators.required, Validators.email]),
    });

  constructor(private _fb: FormBuilder) {}

  public addAddressGroup() {
    this.form.controls["addresses"].push(this.addressForm());
  }

  public addPhoneGroup() {
    this.form.controls["phones"].push(this.phoneForm());
  }

  public addEmailGroup() {
    this.form.controls["emails"].push(this.emailForm());
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    this.onSubmitForm.emit(this.form.value as UserDTO);
  }
}
