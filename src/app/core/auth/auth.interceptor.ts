import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { catchError, from, Observable, switchMap, throwError } from 'rxjs';
import { fetchAuthSession, AuthSession } from 'aws-amplify/auth';

export const authInterceptor = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  return from(fetchAuthSession()).pipe(
    switchMap((authSession: AuthSession) => {
      // Check if tokens exists and has idToken
      if (!authSession?.tokens?.idToken) {
        // You have a few options here:

        // Option 1: Proceed without token
        return next(req);

        // Option 2: Throw error
        // throw new Error('No auth token available');

        // Option 3: Redirect to login
        // window.location.href = '/login';
        // return EMPTY;
      }

      return next(
        req.clone({
          setHeaders: {
            Authorization: `Bearer ${authSession.tokens.idToken}`,
          },
        }),
      );
    }),
    // Add error handling
    catchError((error) => {
      console.error('Auth interceptor error:', error);
      // Handle error appropriately
      return throwError(() => error);
    }),
  );
};
