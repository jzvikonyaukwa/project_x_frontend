import {
  Component,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import 'ag-grid-enterprise';
import { MatIconModule } from '@angular/material/icon';
import { AgCharts } from 'ag-charts-angular';
import { QuoteDetailsDTO } from '../../quotes/models/quoteDetailsDTO';
import { QuotesService } from '../../quotes/services/quotes.service';
import {
  QuotesPerDayDTO,
  QuoteStatusCountDTO,
  QuoteSummaryDTO,
  QuoteSummaryItemDTO,
} from './models/quote-summary';
import { RecentQuotesComponent } from './recent-quotes/recent-quotes.component';

import { PieChartComponent } from '../pie-chart/pie-chart.component';
import { PieChartData } from '../pie-chart/models/pieChartData';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-quotes-summary-overview',
  standalone: true,
  imports: [CommonModule, MatIconModule, RecentQuotesComponent, PieChartComponent, AgCharts],
  templateUrl: './quote-summary-overview.component.html',
})
export class QuoteSummaryOverviewComponent implements OnInit, OnDestroy, OnChanges {
  @Input() startDate: string;
  @Input() endDate: string;

  latestQuotes: QuoteDetailsDTO[] = [];
  quoteStatusCountDTO: QuoteStatusCountDTO;

  barChart: string = 'barChartContainer';
  lineChart: string = 'lineChartContainer';
  statusChart: string = 'statusChartContainer';

  quoteSummary: QuoteSummaryDTO;

  quoteCoilsPieChartData: PieChartData[];
  quotesStatusPieChartData: PieChartData[];

  quoteStatusPieChartOptions;

  lineChartOptions;
  barChartOptions;

  private readonly quotesService = inject(QuotesService);

  private getLatestQuotesSubscription: Subscription;
  private getQuotesCountPerDaySubscription: Subscription;
  private getQuoteStatusCountSubscription: Subscription;
  private getQuoteSummarySubscription: Subscription;
  private getQuoteTotalsSubscription: Subscription;

  constructor() {
    this.quoteStatusPieChartOptions = {
      data: [],
      series: [],
    };

    this.lineChartOptions = {
      data: [],
      series: [],
    };

    this.barChartOptions = {
      data: [],
      series: [],
    };
  }

  ngOnInit() {
    this.fetchLatestQuotes();
    this.fetchQuotesCountPerDay();
    this.fetchQuoteTotals();
    this.fetchStatusCountData();
    this.fetchSummaryData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.startDate || changes.endDate) {
      this.fetchQuotesCountPerDay();
      this.fetchQuoteTotals();
      this.fetchStatusCountData();
      this.fetchSummaryData();
    }
  }

  ngOnDestroy(): void {
    this.getLatestQuotesSubscription?.unsubscribe();
    this.getQuotesCountPerDaySubscription?.unsubscribe();
    this.getQuoteStatusCountSubscription?.unsubscribe();
    this.getQuoteSummarySubscription?.unsubscribe();
    this.getQuoteTotalsSubscription?.unsubscribe();
  }

  fetchSummaryData() {
    const startDate = this.startDate;
    const endDate = this.endDate;

    this.getQuoteSummarySubscription = this.quotesService
      .getQuoteSummary(startDate, endDate)
      .subscribe((response: QuoteSummaryDTO) => {
        this.quoteSummary = response;
        this.quoteCoilsPieChartData = this.transformData(response.items);
      });
  }

  transformData(items: QuoteSummaryItemDTO[]): PieChartData[] {
    const steelCoilsMap = new Map<string, number>();

    items.forEach((item) => {
      const name = this.mapPlanName(item.planName);
      if (['Roof Sheets', 'Framecad', 'Purlin and Batten'].includes(name)) {
        if (steelCoilsMap.has(name)) {
          steelCoilsMap.set(name, steelCoilsMap.get(name) + item.count);
        } else {
          steelCoilsMap.set(name, item.count);
        }
      }
    });

    const steelCoils: PieChartData[] = [];
    steelCoilsMap.forEach((value, key) => {
      steelCoils.push({
        name: key,
        value,
      });
    });

    return steelCoils;
  }

  mapPlanName(planName: string): string {
    switch (planName.toUpperCase()) {
      case 'SHEETS':
        return 'Roof Sheets';
      case 'BRACES':
      case 'FLOOR JOISTS':
      case 'ROOF PANELS':
      case 'TRUSSES':
      case 'WALL FRAMES':
        return 'FRAMECAD';
      case 'PURLINS':
      case 'BATTENS':
        return 'Purlin and Batten';
      default:
        return planName;
    }
  }

  fetchStatusCountData() {
    const startDate = this.startDate;
    const endDate = this.endDate;

    this.getQuoteStatusCountSubscription?.unsubscribe();
    this.getQuoteStatusCountSubscription = this.quotesService
      .getQuoteStatusCount(startDate, endDate)
      .subscribe((response: QuoteStatusCountDTO) => {
        this.quoteStatusCountDTO = response;
        this.createStatusPieChart(this.quoteStatusCountDTO);
      });
  }

  fetchQuotesCountPerDay() {
    const startDate = this.startDate;
    const endDate = this.endDate;

    this.getQuotesCountPerDaySubscription?.unsubscribe();
    this.getQuotesCountPerDaySubscription = this.quotesService
      .getQuotesCountPerDay(startDate, endDate)
      .subscribe((response: QuotesPerDayDTO[]) => {
        this.createBarChart(response);
      });
  }

  fetchLatestQuotes() {
    this.getLatestQuotesSubscription?.unsubscribe();
    this.getLatestQuotesSubscription = this.quotesService
      .getLatestQuotes()
      .subscribe((response: QuoteDetailsDTO[]) => {
        this.latestQuotes = response;
      });
  }

  fetchQuoteTotals() {
    const startDate = this.startDate;
    const endDate = this.endDate;

    this.getQuoteTotalsSubscription?.unsubscribe();
    this.getQuoteTotalsSubscription = this.quotesService
      .getQuoteTotals(startDate, endDate)
      .subscribe((response: any) => {
        this.createLineChart(response);
      });
  }

  createBarChart(chartData: QuotesPerDayDTO[]) {
    const totalQuotesCount = chartData.reduce((total, item) => {
      return (
        total +
        item.statusCounts.draft +
        item.statusCounts.pending_approval +
        item.statusCounts.accepted +
        item.statusCounts.rejected
      );
    }, 0);

    this.barChartOptions = {
      title: {
        text: 'Number of Quotes',
      },
      subtitle: {
        text: totalQuotesCount != 0 ? `Total Quotes (${totalQuotesCount})` : '',
      },
      data: chartData,
      series: [
        {
          type: 'bar',
          xKey: 'date',
          yKey: 'statusCounts.pending_approval',
          yName: 'Pending Approval',
          stacked: true,
          interpolation: { type: 'smooth' },
        },
        {
          type: 'bar',
          xKey: 'date',
          yKey: 'statusCounts.rejected',
          yName: 'Rejected',
          stacked: true,
          interpolation: { type: 'smooth' },
        },
        {
          type: 'bar',
          xKey: 'date',
          yKey: 'statusCounts.accepted',
          yName: 'Accepted',
          stacked: true,
          interpolation: { type: 'smooth' },
        },

        {
          type: 'bar',
          xKey: 'date',
          yKey: 'statusCounts.draft',
          yName: 'Draft',
          stacked: true,
          interpolation: { type: 'smooth' },
        },
      ],
    };
  }

  createStatusPieChart(data: QuoteStatusCountDTO): void {
    console.log('createStatusPieChart', data);
    if (
      !data ||
      // when there is no data return
      (!data.draftCount && !data.pendingApprovalCount && !data.acceptedCount && !data.rejectedCount)
    ) {
      return;
    }

    this.quotesStatusPieChartData = [
      {
        name: 'Pending Approval',
        value: data.pendingApprovalCount,
      },
      { name: 'Rejected', value: data.rejectedCount },
      { name: 'Accepted', value: data.acceptedCount },
      { name: 'Draft', value: data.draftCount },
    ];
  }

  createLineChart(
    data: Array<{
      date: string;
      statusTotalValues: any;
      statusCounts: any;
    }>,
  ) {
    const container = document.getElementById(this.lineChart);
    if (container) {
      container.innerHTML = ''; // Clear the existing chart
    }

    const chartData = data;

    this.lineChartOptions = {
      title: {
        text: 'Daily Quote Totals',
      },
      data: chartData,
      series: [
        {
          type: 'line',
          xKey: 'date',
          yKey: 'statusTotalValues.pending_approval',
          title: 'Pending Approval',
          interpolation: { type: 'smooth' },
          // label:{
          //   formatter: function(params) {
          //     console.log('params', params);
          //     return 'woot';
          //   }
          // }
          // tooltip:{
          //   enabled: true,
          //   renderer: function(params) {
          //     // console.log('params', params);
          //     return `<div>${params.datum.date} ${params.datum.statusTotalValues?.pending_approval?.toLocaleString("en-US", {
          //       style: "currency",
          //       currency: "USD",
          //     })}</div>`;
          //   }
          // }
        // } as AgLineSeriesOptions,
        },
        {
          type: 'line',
          xKey: 'date',
          yKey: 'statusTotalValues.rejected',
          title: 'Rejected',
          interpolation: { type: 'smooth' },
        },
        {
          type: 'line',
          xKey: 'date',
          yKey: 'statusTotalValues.accepted',
          title: 'Accepted',
          interpolation: { type: 'smooth' },
        },
        {
          type: 'line',
          xKey: 'date',
          yKey: 'statusTotalValues.draft',
          title: 'Draft',
          interpolation: { type: 'smooth' },
        },
      ],
    };
  }
}
