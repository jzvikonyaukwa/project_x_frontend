import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Stats } from './models/stats';

@Component({
  selector: 'app-stats-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-component.component.html',
})
export class StatsComponentComponent {
  @Input() totalCost: Stats;
  @Input() totalSellingPrice: Stats;
  @Input() percentageProfit: Stats;
}
