import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import {
  signIn,
  signUp,
  signOut,
  resetPassword,
  confirmResetPassword,
  confirmSignUp,
  SignInOutput,
  confirmSignIn,
  ConfirmSignUpOutput,
  ConfirmSignInOutput,
  fetchAuthSession,
  AuthSession,
} from '@aws-amplify/auth';
import { Amplify } from '@aws-amplify/core';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { SignInResult } from './models/sign-in-result';

@Injectable({ providedIn: 'root' })
export class CognitoService {
  private user: Observable<User> | undefined;

  private readonly userService = inject(UserService);
  constructor(private router: Router) {
    this.user = this.userService.get();

    // Amplify.configure({
    //   Auth: {
    //     Cognito: {
    //       userPoolId: 'eu-west-1_DGaLBAgeF',
    //       userPoolClientId: '5p6pi28upatt6n8fsev5v65ln1',
    //     },
    //   },
    // });
  }

  isUserSignedIn(): Observable<boolean> {
    return new Observable<boolean>((observer) => {
      fetchAuthSession()
        .then((data: AuthSession) => {
          const isSignedIn =
            data.tokens &&
            data.tokens.accessToken &&
            data.tokens.idToken &&
            data.tokens.accessToken.payload &&
            data.tokens.idToken.payload;

          this.setUser();
          observer.next(!!isSignedIn);
          observer.complete();
        })
        .catch(() => {
          observer.next(false);
          observer.complete();
        });
    });
  }

  setUser(): void {
    this.getAuthSession()
      .then((authSession: AuthSession) => {
        if (authSession?.tokens?.idToken?.payload) {
          const user: User = {
            name: authSession.tokens.idToken.payload['name'] as string,
            email: authSession.tokens.idToken.payload['email'] as string,
            cognitoGroups: authSession.tokens.idToken.payload['cognito:groups'] as string[],
            tokenExpiration: authSession.tokens.idToken.payload['exp'] as number,
            roles: [],
            // jwkToken: authSession.tokens.accessToken,
          };
          this.userService.update(user);
        }
      })
      .catch((error) => {
        console.error('Error fetching auth session: ', error);
      });
  }

  getAuthSession(): Promise<AuthSession> {
    return fetchAuthSession();
  }

  signIn(credentials: { email: string; password: string }): Observable<SignInResult> {
    const result: SignInResult = new SignInResult();

    return new Observable((observer) => {
      signIn({
        username: credentials.email,
        password: credentials.password,
        options: {
          userAttributes: {
            phone_number: '+15555555555',
            email: credentials.email,
          },
        },
      })
        .then((signInOutput: SignInOutput) => {
          result.signInOutput = signInOutput;
          this.setUser();
          observer.next(result);
          observer.complete();
        })
        .catch((error) => {
          if (error.message && error.message.includes('UserAlreadyAuthenticatedException')) {
            localStorage.clear();
            this.signOut();
          }
          // Handle other errors
          result.result = false;
          result.error = error;
          observer.error(error);
        });
    });
  }

  signUp(credentials: { email: string; password: string; name: string }): Observable<any> {
    return new Observable((observer) => {
      signUp({
        username: credentials.email,
        password: credentials.password,
        options: {
          userAttributes: {
            email: credentials.email,
            name: credentials.name,
          },
        },
      })
        .then((response) => {
          observer.next(response);
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  confirmNewPassword(password: string): Observable<ConfirmSignInOutput> {
    return new Observable((observer) => {
      confirmSignIn({
        challengeResponse: password,
      })
        .then((response) => {
          observer.next(response);
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  confirmSignUp(credentials: { email: string; code: string }): Observable<ConfirmSignUpOutput> {
    return new Observable((observer) => {
      confirmSignUp({
        username: credentials.email,
        confirmationCode: credentials.code,
      })
        .then((response) => {
          observer.next(response);
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  redirectAfterSignIn() {
    console.log('user = ', this.user);
    this.router.navigate(['/dashboard']);
  }

  getCodeForgotPassword(email: string): any {
    console.log('Back in the auth.service()', email);
  }

  submitNewPassword(credentials: { newPassword: any }): Observable<SignInResult> {
    const result = new SignInResult();
    return new Observable((observer) => {
      confirmResetPassword(credentials.newPassword)
        .then((data) => {
          console.log(data);
          result.result = true;
          observer.next(result);
          observer.complete();
        })
        .catch((error) => {
          console.log('In the submitNewPassword. err =  ' + error);
          observer.error(error);
        });
    });
  }

  public forgotPassword(credentials: { email: string }) {
    console.log('In the forgotPassword() method of the CognitoService', credentials.email);
    return new Observable((observer) => {
      resetPassword({
        username: credentials.email,
      })
        .then((response) => {
          observer.next(response);
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  public forgotPasswordSubmit(user: any) {
    console.log('In the forgotPasswordSubmit() method of the CognitoService', user);
  }

  resetPassword(credentials: { email: string }): Observable<any> {
    return new Observable((observer) => {
      resetPassword({
        username: credentials.email,
      })
        .then((response) => {
          const { nextStep } = response;
          if (nextStep.resetPasswordStep === 'CONFIRM_RESET_PASSWORD_WITH_CODE') {
            observer.next(nextStep.codeDeliveryDetails); // Send the code delivery details
          } else if (nextStep.resetPasswordStep === 'DONE') {
            observer.next('Password reset completed.');
          }
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  // Step 2: Confirm Reset with Code and New Password
  confirmResetPassword(credentials: {
    email: string;
    code: string;
    newPassword: string;
  }): Observable<any> {
    return new Observable((observer) => {
      confirmResetPassword({
        username: credentials.email,
        confirmationCode: credentials.code,
        newPassword: credentials.newPassword,
      })
        .then(() => {
          observer.next('Password reset successful.');
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  public async signOut(): Promise<void> {
    try {
      await signOut()
        .then(() => {
          this.setUser();
        })
        .catch((error) => {
          console.log('Error during sign out: ', error);
        });
    } catch (error) {
      console.log('Error during sign out: ', error);
    }
  }
}
