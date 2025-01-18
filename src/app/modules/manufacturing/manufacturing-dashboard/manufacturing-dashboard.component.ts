import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { UserService } from 'app/core/user/user.service';
import { MatIconModule } from '@angular/material/icon';
import { MachineOverviewComponent } from './machine-overview/machine-overview.component';
import { MatButtonModule } from '@angular/material/button';
import { MACHINE_INFORMATION } from '../machines/models/machinesInformations';
import { MachineInformation } from '../machines/models/machineInformation';
import { ManufacturingSummaryOverviewComponent } from './manufacturing-summary-overview/manufacturing-summary-overview.component';
import {
  MachineEventsService,
  MachineTotalMetersCut,
} from '../machines/services/machine-events.service';
import { MatInputModule } from '@angular/material/input';
import { SharedModule } from '@shared/shared.module';
import { DateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-manufacturing-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MachineOverviewComponent,
    MatIconModule,
    MatButtonModule,
    ManufacturingSummaryOverviewComponent,
    MatInputModule,
    SharedModule,
  ],

  providers: [DatePipe],

  templateUrl: './manufacturing-dashboard.component.html',
  styleUrls: ['./manufacturing-dashboard.component.scss'],
})
export class ManufacturingDashboardComponent implements OnInit, OnChanges {
  startDate: Date;
  endDate: Date;
  formattedStartDate: string;
  formattedEndDate: string;
  selectedRange: string = 'month';
  today = new Date();
  machinesInformationData: MachineTotalMetersCut[] = [];

  machinesInformation: MachineInformation[] = MACHINE_INFORMATION;

  constructor(private machineService: MachineEventsService, private datePipe: DatePipe) {}

  ngOnInit(): void {
    this.getTotalMetersCut();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.startDate || changes.endDate) {
      this.getTotalMetersCut();
    }
  }

  onDateChange() {
    this.formatDates();
    this.getTotalMetersCut();
  }
  getTotalMetersCut() {
    const formattedStartDateTime = this.datePipe.transform(this.startDate, "yyyy-MM-dd'T'HH:mm:ss");
    const formattedEndDateTime = this.datePipe.transform(this.endDate, "yyyy-MM-dd'T'23:59:59");

    this.machineService
      .getTotalMetersCut(formattedStartDateTime, formattedEndDateTime)
      .subscribe((data) => {
        this.machinesInformationData = data;
      });
  }

  selectTimeRange(range: string) {
    this.selectedRange = range;
    const today = new Date();
    if (range === 'week') {
      const lastWeekStart = new Date(today.setDate(today.getDate() - today.getDay() - 7));
      const lastWeekEnd = new Date(lastWeekStart);
      lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
      this.startDate = lastWeekStart;
      this.endDate = lastWeekEnd;
    } else if (range === 'month') {
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastMonthStart = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
      const lastMonthEnd = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);
      this.startDate = lastMonthStart;
      this.endDate = lastMonthEnd;
    } else if (range === 'year') {
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      this.startDate = startOfYear;
      this.endDate = new Date(today.getFullYear(), 11, 31);
    }
    this.formatDates();
    this.getTotalMetersCut();
  }

  private getStartOfWeek(date: Date): Date {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    return startOfWeek;
  }

  private formatDates() {
    this.formattedStartDate = this.datePipe.transform(this.startDate, 'yyyy-MM-dd');
    this.formattedEndDate = this.datePipe.transform(this.endDate, 'yyyy-MM-dd');
  }
}
