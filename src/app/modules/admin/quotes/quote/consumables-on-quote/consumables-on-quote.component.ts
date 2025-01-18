import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsComponentComponent } from '../stats-component/stats-component.component';
import { Stats } from '../stats-component/models/stats';
import { ConsumableOnQuote } from 'app/modules/admin/consumables/models/consumableOnQuote';
import { AddConsumableToQuoteModalComponent } from '../../add-consumable-to-quote-modal/add-consumable-to-quote-modal.component';
import { Quote } from '../../models/quote';
import { ModalService } from '@shared/services/modal.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { environment } from '@environments/environment';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { ConsumablesOnQuoteService } from 'app/modules/admin/consumables/services/consumables-on-quote.service';
import { QuotesService } from '../../services/quotes.service';
import { ConsumablesOnQuoteTableComponent } from './consumables-on-quote-table/consumables-on-quote-table.component';

@Component({
  selector: 'app-consumables-on-quote',
  standalone: true,
  imports: [
    CommonModule,
    StatsComponentComponent,
    ConsumablesOnQuoteTableComponent,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './consumables-on-quote.component.html',
})
export class ConsumablesOnQuoteComponent implements OnInit, OnChanges, OnDestroy {
  @Input() quote: Quote;
  @Output() quoteUpdate = new EventEmitter<void>();

  private readonly consumablesOnQuoteService = inject(ConsumablesOnQuoteService);
  private readonly _snackBar = inject(MatSnackBar);
  private readonly quotesService = inject(QuotesService);

  consumablesOnQuote: ConsumableOnQuote[];
  consumableCostStats: Stats = {
    title: 'Total Cost',
    value: 0,
    subValue: 'from 27 Consumables',
  };

  consumableSellingPriceStats: Stats = {
    title: 'Total Selling Price',
    value: 0,
    subValue: '',
  };

  consumableProfitStats: Stats = {
    title: 'Total Profit',
    value: 0,
    subValue: '',
  };

  private readonly _modalService = inject(ModalService);

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.consumablesOnQuote = this.quote.consumablesOnQuote;
    this.calculateStats();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['quote']) {
      this.consumablesOnQuote = this.quote.consumablesOnQuote;
      this.calculateStats();
    }
  }

  calculateStats() {
    this.handleConsumableCosting();
    this.handleConsumableSellingPrice();
    this.handleConsumableProfit();
  }

  handleConsumableCosting() {
    this.calculateConsumablesCostings();
    this.setCostingsValue();
  }

  handleConsumableSellingPrice() {
    this.calculateConsumablesSellingPrice();
    this.setSellingPriceValue();
  }

  handleConsumableProfit() {
    this.calculateConsumablesProfit();
    this.setProfitValue();
  }

  calculateConsumablesCostings() {
    this.consumableCostStats.value = this.consumablesOnQuote.reduce(
      (acc, curr) => acc + curr.costPrice,
      0,
    );

    this.consumableCostStats.value = parseFloat(this.consumableCostStats.value.toFixed(2));
  }

  setCostingsValue() {
    this.consumableCostStats.subValue = `from ${this.consumablesOnQuote.length} Consumables`;
  }

  calculateConsumablesSellingPrice() {
    this.consumableSellingPriceStats.value = this.consumablesOnQuote.reduce(
      (acc, curr) => acc + curr.sellPrice,
      0,
    );

    this.consumableSellingPriceStats.value = parseFloat(
      this.consumableSellingPriceStats.value.toFixed(2),
    );
  }

  setSellingPriceValue() {
    this.consumableProfitStats.subValue = `from ${this.consumablesOnQuote.length} Consumables`;
  }

  calculateConsumablesProfit() {
    this.consumableProfitStats.value = this.consumablesOnQuote.reduce(
      (acc, curr) => acc + curr.sellPrice - curr.costPrice,
      0,
    );
    this.consumableProfitStats.value = parseFloat(this.consumableProfitStats.value.toFixed(2));
  }

  setProfitValue() {
    const percentProfit = (this.consumableProfitStats.value / this.consumableCostStats.value) * 100;
    this.consumableProfitStats.subValue = `profit ${percentProfit.toFixed(2)}%`;
  }

  onAddConsumable() {
    const dialog = this._modalService.open<AddConsumableToQuoteModalComponent>(
      AddConsumableToQuoteModalComponent,
      { data: { quote: this.quote } },
    );

    dialog.afterClosed().subscribe((quote: Quote) => {
      if (!quote) return;
      this.updateTheQuote();
      console.log('quote: ', quote);
    });
  }

  updateTheQuote(): void {
    console.log('updateTheQuote');
    this.quoteUpdate.emit();
  }

  onConsumableDeleted = (consumableOnQuoteID: number): void => {
    console.log('Consumable deleted: ', consumableOnQuoteID);

    this.consumablesOnQuoteService
      .deleteConsumableOnQuote(consumableOnQuoteID)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.getUpdatedQuote();
        },
        error: (errorResponse) => {
          const detailedErrorMessage =
            errorResponse instanceof HttpErrorResponse
              ? errorResponse.error.message || errorResponse.statusText
              : 'Unknown error';
          this._snackBar.open(`Error deleting consumable: ${detailedErrorMessage}`, null, {
            duration: environment.DEFAULT_SNACKBAR_TIMEOUT,
          } as MatSnackBarConfig);
          console.error('Error deleting consumable', errorResponse);
        },
      });
  };

  getUpdatedQuote(): void {
    this.quotesService.getQuote(this.quote.id).subscribe((quote) => {
      this.quote = quote;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
