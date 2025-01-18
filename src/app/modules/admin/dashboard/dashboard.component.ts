import { CommonModule, DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { UserService } from 'app/core/user/user.service';
import { Observable } from 'rxjs';
import { User } from 'app/core/user/user.types';
import { QuoteSummaryOverviewComponent } from './quotes-summary-overview/quote-summary-overview.component';
import { GrvsSummaryOverviewComponent } from './grvs-summary-overview/grvs-summary-overview.component';
import { SharedModule } from '@shared/shared.module';
import { DateTime } from 'luxon';

@Component({
  selector: 'project',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatTabsModule,
    GrvsSummaryOverviewComponent,
    QuoteSummaryOverviewComponent,
    SharedModule,
  ],
  providers: [DatePipe],

  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  startDate: Date;
  endDate: Date;
  formattedStartDate: string;
  formattedEndDate: string;
  selectedRange: string = 'month';
  today = new Date();
  user$: Observable<User> = this.userService.user$;

  constructor(
    private userService: UserService,
    private datePipe: DatePipe,
  ) {
    this.selectTimeRange(this.selectedRange);
  }

  selectTimeRange(range: string) {
    this.selectedRange = range;
    if (range === 'week') {
      console.log('week');
      const weekStart = DateTime.local().startOf('week').toJSDate();
      const weekEnd = DateTime.local().endOf('week').toJSDate();
      this.startDate = weekStart;
      this.endDate = weekEnd;
    } else if (range === 'month') {
      console.log('month');
      const monthStart = DateTime.local().startOf('month').toJSDate();
      const monthEnd = DateTime.local().endOf('month').toJSDate();
      this.startDate = monthStart;
      this.endDate = monthEnd;
    } else if (range === 'year') {
      console.log('year');
      this.startDate = DateTime.local().startOf('year').toJSDate();
      this.endDate = DateTime.local().endOf('year').toJSDate();
    }
    this.formatDates();
  }

  private formatDates() {
    this.formattedStartDate = this.datePipe.transform(this.startDate, 'yyyy-MM-dd');
    this.formattedEndDate = this.datePipe.transform(this.endDate, 'yyyy-MM-dd');

    console.log(this.formattedStartDate);
    console.log(this.formattedEndDate);
  }
}
