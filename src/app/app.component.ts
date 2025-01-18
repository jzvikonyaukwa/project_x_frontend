import { Component, ErrorHandler, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import awsconfig from '../aws-exports';
import { Amplify } from 'aws-amplify';
import 'ag-grid-enterprise';
import { LicenseManager, time } from 'ag-grid-enterprise';
import Bugsnag from '@bugsnag/js';
import BugsnagPerformance from '@bugsnag/browser-performance';
import { BugsnagErrorHandler } from '@bugsnag/plugin-angular';
import { interval, Subscription, timeout } from 'rxjs';
import { NotificationsService } from '@layout/common/notifications/notifications.service';
import { environment } from '@environments/environment';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarModule } from '@angular/material/snack-bar';

LicenseManager.setLicenseKey(
  "Using_this_{AG_Charts_and_AG_Grid}_Enterprise_key_{AG-056224}_in_excess_of_the_licence_granted_is_not_permitted___Please_report_misuse_to_legal@ag-grid.com___For_help_with_changing_this_key_please_contact_info@ag-grid.com___{Blue_Dhow}_is_granted_a_{Multiple_Applications}_Developer_License_for_{1}_Front-End_JavaScript_developer___All_Front-End_JavaScript_developers_need_to_be_licensed_in_addition_to_the_ones_working_with_{AG_Charts_and_AG_Grid}_Enterprise___This_key_has_been_granted_a_Deployment_License_Add-on_for_{3}_Production_Environments___This_key_works_with_{AG_Charts_and_AG_Grid}_Enterprise_versions_released_before_{8_April_2025}____[v3]_[0102]_MTc0NDA2NjgwMDAwMA==f8205456a6cc8eef07c25b5289eab6e1"
);

Amplify.configure(awsconfig);

Bugsnag.start({ apiKey: "791681b6a1e1275594eb837b090f9b0b" });
BugsnagPerformance.start({ apiKey: "791681b6a1e1275594eb837b090f9b0b" });

export function errorHandlerFactory() {
  return new BugsnagErrorHandler();
}

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  standalone: true,
  imports: [RouterOutlet, MatSnackBarModule],
  providers: [{ provide: ErrorHandler, useFactory: errorHandlerFactory }],
})
export class AppComponent {
  title = "AXE STOCK MANAGEMENT";

  private readonly _snackBar = inject(MatSnackBar);
  private readonly notificationsService = inject(NotificationsService);
  
  // EVENT HANDLERS
  private getAllSubscription!: Subscription;

  ngOnInit(): void {
    // check for notifications every 60 seconds (configured)
    const timer$ = interval(environment.notificationsPollingInterval);

    // Subscribe to the observable
    this.getAllSubscription = timer$.subscribe(() => {
      this.notificationsService.getAll()
      .pipe(
        timeout(environment.DEFAULT_HTTP_TIMEOUT)
      )
      .subscribe({
        error: (error: unknown) => {
          const detailedErrorMessage =
            error instanceof HttpErrorResponse
              ? error.error.message || error.statusText
              : 'Unknown error';
              this._snackBar.open(`Error fetching notifications: ${detailedErrorMessage}`, null, { duration: environment.DEFAULT_SNACKBAR_TIMEOUT } as MatSnackBarConfig);
          console.error('Error fetching notifications', error);
        },
      });
    });
  }

  ngOnDestroy(): void {
    this.getAllSubscription?.unsubscribe();
  }
}
