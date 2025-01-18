import {
  AfterViewInit,
  Component,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridModule } from 'ag-grid-angular';
import 'ag-grid-enterprise';
import { MatIconModule } from '@angular/material/icon';
import { GrvService } from '../../grvs/services/grv.service';
import { RecentGrvsComponent } from './recent-grvs/recent-grvs.component';
import { PieChartComponent } from '../pie-chart/pie-chart.component';
import { PieChartData } from '../pie-chart/models/pieChartData';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarModule } from '@angular/material/snack-bar';
import { GrvTotal } from '../../grvs/models/grv';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '@environments/environment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-grvs-summary-overview',
  standalone: true,
  imports: [
    CommonModule,
    AgGridModule,
    MatIconModule,
    MatSnackBarModule,
    RecentGrvsComponent,
    PieChartComponent,
  ],
  templateUrl: './grvs-summary-overview.component.html',
  styleUrls: ['./grvs-summary-overview.component.scss'],
})
export class GrvsSummaryOverviewComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  grvsSteelCoilSummaryChart: string = 'grvsSteelCoilSummaryChart';
  barChart: string = 'grvsBarChartContainer';

  // Date Ranges
  @Input() startDate: string;
  @Input() endDate: string;

  latestGrvs: any[] = [];

  grvsPieChartData: PieChartData[] = [];

  private getCSteelCoilSummaryDetailsSubscription: Subscription;
  private getLatestGrvsSubscription: Subscription;

  private readonly _snackBar = inject(MatSnackBar);
  private readonly grvsService = inject(GrvService);

  constructor() {}

  ngOnInit() {}

  ngOnDestroy(): void {
    this.getLatestGrvsSubscription?.unsubscribe();
    this.getCSteelCoilSummaryDetailsSubscription?.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.startDate || changes.endDate) {
      this.fetchSteelCoilSummaryDetails();
      this.fetchLatestGrvs();
    }
  }

  ngAfterViewInit(): void {
    this.fetchSteelCoilSummaryDetails();
    this.fetchLatestGrvs();
  }

  fetchLatestGrvs() {
    this.getLatestGrvsSubscription?.unsubscribe();
    this.getLatestGrvsSubscription = this.grvsService.getLatestGrvs().subscribe({
      next: (data: GrvTotal[]) => {
        this.latestGrvs = data;
      },
      error: (error: unknown) => {
        const detailedErrorMessage =
          error instanceof HttpErrorResponse
            ? error.error.message || error.statusText
            : 'Unknown error';
        this._snackBar.open(`Error fetching chart data: ${detailedErrorMessage}`, null, {
          duration: environment.DEFAULT_SNACKBAR_TIMEOUT,
        } as MatSnackBarConfig);
        console.error('Error fetching chart data', error);
      },
    });
  }

  fetchSteelCoilSummaryDetails(startDate?: string, endDate?: string) {
    startDate = this.startDate;
    endDate = this.endDate;

    this.getCSteelCoilSummaryDetailsSubscription?.unsubscribe();
    this.getCSteelCoilSummaryDetailsSubscription = this.grvsService
      .getCSteelCoilSummaryDetails(startDate, endDate)
      .subscribe({
        next: (data: PieChartData[]) => {
          if (data) {
            this.grvsPieChartData = data;
          }
        },
        error: (error: unknown) => {
          this.grvsPieChartData = [];
          const detailedErrorMessage =
            error instanceof HttpErrorResponse
              ? error.error.message || error.statusText
              : 'Unknown error';
          this._snackBar.open(`Error fetching chart data: ${detailedErrorMessage}`, null, {
            duration: environment.DEFAULT_SNACKBAR_TIMEOUT,
          } as MatSnackBarConfig);
          console.error('Error fetching chart data', error);
        },
      });
  }
}
