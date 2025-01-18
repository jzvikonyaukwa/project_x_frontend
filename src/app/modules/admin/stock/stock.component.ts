import { Component, DestroyRef, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { PageHeadingComponent } from "@layout/common/page-heading/page-heading.component";
import {
  NavigationEnd,
  Router,
  RouterModule,
  RouterOutlet,
} from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { BreadCrumbsService } from "app/utilities/services/bread-crumbs.service";

@Component({
  selector: "app-stock-overview",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    MatIconModule,
    PageHeadingComponent,
  ],
  templateUrl: "./stock.component.html",
})
export class StockComponent {
  private _router = inject(Router);
  private _destroyRef = inject(DestroyRef);
  private breadcrumbService = inject(BreadCrumbsService);

  public title: string;

  breadcrumbs: Array<{ label: string; url: string }> = [];

  ngOnInit(): void {
    this.title =
      this._router.url === "/stocks"
        ? "Stocks Overview"
        : "Steel Coils History ";

    this._router.events
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.title =
            event.url === "/stocks"
              ? "Stocks Overview"
              : "Steel Coils History ";
        }
      });

    this.breadcrumbService.getBreadcrumbs().subscribe((breadcrumbs) => {
      this.breadcrumbs = breadcrumbs;
    });
  }
}
