import { Route } from '@angular/router';
import { AuthSignInComponent } from './sign-in/sign-in.component';
import { ConfirmSignInNewPasswordComponent } from './confirm-sign-in-new-password/confirm-sign-in-new-password.component';
import { AuthSignOutComponent } from './sign-out/sign-out.component';
import { AuthForgotPasswordComponent } from './forgot-password/forgot-password.component';

export const authRoutes: Route[] = [
  { path: '', redirectTo: 'sign-in', pathMatch: 'full' },
  {
    path: 'sign-in',
    component: AuthSignInComponent,
  },
  {
    path: 'sign-out',
    component: AuthSignOutComponent,
  },
  {
    path: 'new-password',
    component: ConfirmSignInNewPasswordComponent,
  },
  {
    path: 'forgot-password',
    component: AuthForgotPasswordComponent,
  },
];
