import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, NavigationEnd, Router } from "@angular/router";
import { BehaviorSubject, filter } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class BreadCrumbsService {
  private breadcrumbs$ = new BehaviorSubject<
    Array<{ label: string; url: string }>
  >([]);

  constructor(private router: Router) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        const root = this.router.routerState.snapshot.root;
        const breadcrumbs: Array<{ label: string; url: string }> = [];
        this.addRouteRecursive(root, "", breadcrumbs);
        this.breadcrumbs$.next(breadcrumbs);
      });
  }

  private addRouteRecursive(
    route: ActivatedRouteSnapshot,
    parentUrl: string,
    breadcrumbs: Array<{ label: string; url: string }>
  ) {
    if (route) {
      // Collect non-empty path segments.
      const pathSegments = route.url
        .map((segment) => segment.path)
        .filter((path) => path);

      // Construct the route URL by intelligently joining segments with slashes.
      const routeUrl = [parentUrl, ...pathSegments]
        .filter((part) => part)
        .join("/");

      if (route.data["breadcrumb"]) {
        // Ensure the URL is properly prefixed with a leading slash if it's not empty and does not already start with one.
        const formattedUrl = routeUrl.startsWith("/")
          ? routeUrl
          : `/${routeUrl}`;
        breadcrumbs.push({
          label: route.data["breadcrumb"],
          url: formattedUrl,
        });
      }

      if (route.firstChild) {
        this.addRouteRecursive(route.firstChild, routeUrl, breadcrumbs);
      }
    }
  }

  getBreadcrumbs() {
    return this.breadcrumbs$.asObservable();
  }
}
