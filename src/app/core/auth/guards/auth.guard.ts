import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';
import { Role } from '../models/role';
import { CognitoService } from 'app/modules/auth/cognito.service';
import { UserService } from 'app/core/user/user.service';

export const AuthGuard: CanActivateFn | CanActivateChildFn = (route, state) => {
  const router: Router = inject(Router);
  const userService = inject(UserService);

  return inject(CognitoService)
    .isUserSignedIn()
    .pipe(
      switchMap((isLoggedIn) => {
        if (!isLoggedIn) {
          console.log('In the auth guard, user is not authenticated. Redirecting to sign-in.');
          router.navigate(['auth/sign-in']);
          return of(false);
        }

        return userService.get().pipe(
          switchMap((user) => {
            const requiredRoles = route.data?.roles as Role[] | undefined;
            if (!requiredRoles) {
              return of(true);
            }
            const hasRequiredRole = requiredRoles.some((requiredRole) => user.roles?.includes(requiredRole));
            if (hasRequiredRole) {
              console.log('User is authorized to access the route.');
              return of(true);
            } else {
              console.log('User is not authorized to access the route.');
              router.navigate(['access-denied']);
              return of(false);
            }
          }),
          catchError((userFetchingError) => {
            console.error('Error fetching user:', userFetchingError);
            router.navigate(['auth/sign-in']);
            return of(false);
          }),
        );
      }),
      catchError((authenticationError) => {
        console.error('Error authenticating:', authenticationError);
        router.navigate(['auth/sign-in']);
        return of(false);
      }),
    );
};
