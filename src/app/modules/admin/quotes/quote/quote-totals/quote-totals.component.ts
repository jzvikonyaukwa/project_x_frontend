import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { QuoteTotals } from '../../models/quoteTotals';

@Component({
  selector: 'app-quote-totals',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule],
  templateUrl: './quote-totals.component.html',
  styles: [
    `
      .border-dashed-red {
        border: 1px;
        border-style: dashed;
        border-color: red;
      }
      .total-line {
        @apply flex justify-between items-center border-b border-blue-200 pb-0;
        @apply sm:pb-1;
        @apply md:pb-2;
      }
      .total-header {
        @apply text-sm;
        @apply sm:text-base sm:font-semibold;
        @apply md:text-lg;
      }
      .total-text {
        @apply text-base font-medium;
        @apply sm:font-semibold;
        @apply md:text-lg md:font-bold;
      }
    `,
  ],
})
export class QuoteTotalsComponent implements OnInit, OnDestroy {
  private _selected: QuoteTotals;

  @Input()
  set totalValues(value: QuoteTotals) {
    this._selected = value;
  }

  get totalValues(): QuoteTotals {
    return this._selected;
  }

  constructor() {}

  ngOnInit(): void {}

  ngOnDestroy(): void {}

  get isDiscountOffered(): boolean {
    return this.totalValues?.markUpCharged < 0;
  }

  get isMarkupCharged(): boolean {
    return this.totalValues?.markUpCharged >= 0;
  }
}
