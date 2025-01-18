import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  NgForm,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SignInOutput } from '@aws-amplify/auth';
import { CognitoService } from '../cognito.service';

@Component({
  selector: 'auth-sign-in',
  templateUrl: './sign-in.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
  standalone: true,
  imports: [
    RouterLink,
    FuseAlertComponent,
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
  ],
})
export class AuthSignInComponent implements OnInit {
  alert: { type: FuseAlertType; message: string } = {
    type: 'success',
    message: '',
  };

  signInForm: UntypedFormGroup;
  showAlert = false;

  @ViewChild('signInNgForm') signInNgForm: NgForm;

  constructor(
    private cognitoService: CognitoService,
    private router: Router,
    private _formBuilder: UntypedFormBuilder,
  ) {}

  ngOnInit(): void {
    this.signInForm = this._formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [''],
    });
  }

  signIn() {
    if (this.signInForm.invalid) {
      return;
    }

    this.signInForm.disable();

    this.showAlert = false;

    console.log('In the sign in component, signIn().');

    this.cognitoService.signIn(this.signInForm.value).subscribe({
      next: (result) => {
        console.log(
          ' In the sign in component, in next: result => . result of sign in has been returned: ',
          result,
        );

        const signInOutput: SignInOutput | null | undefined = result.signInOutput;

        if (
          signInOutput &&
          signInOutput.nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED'
        ) {
          this.router.navigate(['auth/new-password']);
        }

        if (signInOutput && signInOutput.isSignedIn) {
          this.router.navigate(['/dashboard']);
        } else if (result.result) {
          console.log('No password challenge. Result', result);
          this.router.navigate(['/dashboard']);
        } else {
          this.showAlert = true;
          this.alert = {
            message: 'Sign-in failed. Please try again.',
            type: 'error',
          };
        }
      },
      error: (error) => {
        console.log('In the sign in component, signIn() - Caught the error.');

        this.alert.message = error;
        this.alert.type = 'error';
        this.showAlert = true;
        this.signInForm.enable();
      },
      complete: () => {
        console.log('Sign in completed');
      },
    });
  }
}
