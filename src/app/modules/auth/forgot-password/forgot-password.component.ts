import { NgIf } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import {
  FormsModule,
  NgForm,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';

@Component({
  selector: 'auth-forgot-password',
  templateUrl: './forgot-password.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
  standalone: true,
  imports: [
    NgIf,
    FuseAlertComponent,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    RouterLink,
  ],
})
export class AuthForgotPasswordComponent implements OnInit {
  @ViewChild('forgotPasswordNgForm') forgotPasswordNgForm: NgForm;

  showAlert: boolean = false;
  alert: { type: FuseAlertType; message: string } = {
    type: 'success',
    message: '',
  };

  forgotPasswordForm: UntypedFormGroup;

  isFirstStep = true;

  constructor(private _formBuilder: UntypedFormBuilder) {}

  ngOnInit(): void {
    // Create the form
    this.forgotPasswordForm = this._formBuilder.nonNullable.group({
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      code: [''],
    });
  }

  sendResetLink(): void {
    // Return if the form is invalid
    if (this.forgotPasswordForm.invalid) return;

    // Disable the form
    this.forgotPasswordForm.disable();

    // Hide the alert
    this.showAlert = false;

    // Forgot password
    // this._authService
    //   .forgotPassword(this.forgotPasswordForm.get('email').value)
    //   .pipe(
    //     finalize(() => {
    //       // Re-enable the form
    //       this.forgotPasswordForm.enable();

    //       // Reset the form
    //       this.forgotPasswordNgForm.resetForm();

    //       // Show the alert
    //       this.showAlert = false;
    //     }),
    //   )
    //   .subscribe(
    //     (response) => {
    //       // Set the alert
    //       this.alert = {
    //         type: 'success',
    //         message:
    //           "Password reset sent! You'll receive an email if you are registered on our system.",
    //       };

    //       this.isFirstStep = false;
    //       this.forgotPasswordForm.controls['password'].addValidators(Validators.required);
    //       this.forgotPasswordForm.controls['code'].addValidators(Validators.required);
    //     },
    //     (response) => {
    //       // Set the alert
    //       this.alert = {
    //         type: 'error',
    //         message: response.message,
    //       };
    //       this.showAlert = true;
    //     },
    //   );
  }
  sendResetPass() {
    if (this.forgotPasswordForm.invalid) return;
    this.forgotPasswordForm.disable();
    this.showAlert = false;
    // this._authService
    //   .forgotPasswordSubmit(this.forgotPasswordForm?.value)
    //   .pipe(
    //     finalize(() => {
    //       // Re-enable the form
    //       this.forgotPasswordForm.enable();

    //       // Reset the form
    //       this.forgotPasswordNgForm.resetForm();

    //       // Show the alert
    //       this.showAlert = true;
    //     })
    //   )
    //   .subscribe(
    //     (response) => {
    //       // Set the alert
    //       this.alert = {
    //         type: "success",
    //         message: "You reset your password. You have new password now!",
    //       };
    //     },
    //     (response) => {
    //       this.alert = {
    //         type: "error",
    //         message: response.message,
    //       };
    //     }
    //   );
  }
}
