import { Injectable } from "@angular/core";
import { CanMatch, Route, Router, UrlSegment, UrlTree } from "@angular/router";
import { Observable, of, switchMap } from "rxjs";
import { AuthService } from "app/core/auth/auth.service";

@Injectable({
  providedIn: "root",
})
export class NoAuthGuard implements CanMatch {
  constructor(private _authService: AuthService, private _router: Router) {}

  canMatch(
    route: Route,
    segments: UrlSegment[]
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    // return this._check();
    return of(true);
  }
  // private _check(): Observable<boolean>
  // {
  //     // Check the authentication status and return an observable of
  //     // "true" or "false" to allow or prevent the access
  //     return this._authService.check().pipe(
  //         switchMap((authenticated) => of(!authenticated))
  //     );
  // }
}
