import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Quote } from '../models/quote';
import { FuseCardComponent } from '@fuse/components/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { QuotePricesService } from '@shared/services/quote-prices.service';
import { QuotePrice } from '@shared/models/quotePrice';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatRadioModule } from '@angular/material/radio';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-quote-price-category-card',
  standalone: true,
  imports: [
    CommonModule,
    FuseCardComponent,
    MatButtonModule,
    FormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatRadioModule,
    MatSnackBarModule,
    ReactiveFormsModule,
  ],
  templateUrl: './quote-price-category-card.component.html',
  styles: [
    `
      ::ng-deep .mdc-form-field .mdc-label {
        @apply text-sm;
        @apply sm:text-base;
      }
    `,
  ],
})
export class QuotePriceCategoryCardComponent implements OnInit, OnDestroy {
  private _selected: Quote;

  @Input()
  set quote(value: Quote) {
    // console.log('Setting quote: ', value);
    const roundedPercentage = this.roundToDecimalPlaces((value.quotePrice.markUp - 1) * 100, 6);
    // console.log('Rounded Percentage: ', roundedPercentage);
    this.fg.patchValue(
      { ...value.quotePrice, markupPercentage: +roundedPercentage.toFixed(2) },
      { emitEvent: false },
    );
    this._selected = value;
  }

  get quote(): Quote {
    return this._selected;
  }

  @Output() readonly onQuotePriceChanged: EventEmitter<QuotePrice> = new EventEmitter<QuotePrice>();

  public quotePrices: QuotePrice[];
  private readonly priceCategories: string[] = ['std', 'trademen', 'custom'];

  fg: FormGroup = this.fb.group({
    priceType: [null, Validators.required],
    markup: [null, Validators.required],
    markupPercentage: [null, Validators.required],
  });

  private readonly _snackBar = inject(MatSnackBar);
  private readonly quotePriceService = inject(QuotePricesService);

  // EVENT HANDLERS
  private getAllQuotePricesSubscription: Subscription;
  private quotePriceChangeSubscription: Subscription;

  constructor(private readonly fb: FormBuilder) {}

  ngOnInit(): void {
    this.getAllQuotePricesSubscription = this.quotePriceService.getAllQuotePrices().subscribe({
      next: (response: QuotePrice[]) => {
        this.quotePrices = response;
      },
      error: (errorResponse) => {
        const detailedErrorMessage =
          errorResponse instanceof HttpErrorResponse
            ? errorResponse.error.message || errorResponse.statusText
            : 'Unknown error';
        this._snackBar.open(`Error fetching quote price list: ${detailedErrorMessage}`, null, {
          duration: environment.DEFAULT_SNACKBAR_TIMEOUT,
        } as MatSnackBarConfig);
        console.error('Error fetching quote price list', errorResponse);
      },
    });

    this.quotePriceChangeSubscription = this.fg.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((formValue: { priceType: string; markup: number; markupPercentage?: number }) => {
        // console.log('formValue: ', formValue);
        if (formValue.priceType === 'custom') {
          let quotePrice = this.quote.quotePrice;

          if (!quotePrice) {
            console.log('No quote price');
            return;
          }

          quotePrice.id = undefined;
          quotePrice.priceType = 'custom';

          const dateEdited = new Date();
          if (!formValue.markupPercentage) {
            // missing markup percentage
            console.warn('No markup percentage');
            this.fg.patchValue(
              {
                markup: 1,
                // , markupPercentage:0
              },
              { emitEvent: false },
            );
            return;
          } else if (formValue.markupPercentage < 0) {
            // this is a discount
            const roundedDiscount = this.roundToDecimalPlaces(
              1 + formValue.markupPercentage / 100,
              6,
            );
            // console.log('Custom discount: ', roundedDiscount);
            const correctedDiscount = Math.max(0, roundedDiscount);
            // console.log('Corrected discount: ', correctedDiscount);
            this.fg.patchValue({ markup: correctedDiscount }, { emitEvent: false });
            if (this.quote.quotePrice.markUp !== correctedDiscount) {
              quotePrice = { ...quotePrice, markUp: correctedDiscount, dateEdited };
              this.onQuotePriceChanged.emit(quotePrice);
            }
          } else {
            // regular markup
            let roundedMarkup = this.roundToDecimalPlaces(1 + formValue.markupPercentage / 100, 6);
            // console.log('Custom markup: ', roundedMarkup);
            let correctedMarkup = Math.max(1, roundedMarkup);
            // console.log('Corrected markup: ', correctedMarkup);
            this.fg.patchValue({ markup: correctedMarkup }, { emitEvent: false });
            if (this.quote.quotePrice.markUp != correctedMarkup) {
              quotePrice = { ...quotePrice, markUp: correctedMarkup, dateEdited };
              this.onQuotePriceChanged.emit(quotePrice);
            }
          }
          // console.log('Quote Price: ', quotePrice);
          return;
        }
        const quotePrice = this.quotePriceForType(formValue.priceType);
        // console.log('Quote Price: ', quotePrice);
        const roundedPercentage = this.roundToDecimalPlaces((quotePrice.markUp - 1) * 100);
        this.fg.patchValue(
          { markup: quotePrice.markUp, markupPercentage: roundedPercentage },
          { emitEvent: false },
        );
        if (this.quote.quotePrice.priceType != formValue.priceType) {
          this.quote.quotePrice = { ...quotePrice };
          this.onQuotePriceChanged.emit(quotePrice);
        }
      });
  }

  ngOnDestroy(): void {
    this.quotePriceChangeSubscription?.unsubscribe();
    this.getAllQuotePricesSubscription?.unsubscribe();
  }

  // ngOnChanges(changes: SimpleChanges) {
  //   console.log('Changes: ', changes);
  // }

  /**
   * Fetches the QuotePrice associated with the specified price type.
   *
   * @param requestedPriceType - The price type to search for within the available quote prices.
   * @returns The QuotePrice object if found; otherwise, returns null.
   */
  quotePriceForType = (requestedPriceType: string): QuotePrice | null => {
    if (this.quotePrices && requestedPriceType) {
      return this.quotePrices.find(
        (quotePrice) => quotePrice.priceType.toLowerCase() === requestedPriceType,
      );
    }
    return null;
  };

  get priceCategory(): string {
    return this.fg.get('priceType')?.value || '';
  }

  get priceCategoryMarkup(): number {
    return this.fg.get('markup')?.value || 0;
  }

  get priceCategoryPercentage(): number {
    return this.fg.get('markupPercentage')?.value || 0;
  }

  // /**
  //  * Rounds a given number to a specified number of decimal places.
  //  *
  //  * @param value - The number to be rounded.
  //  * @param decimalPlaces - The number of decimal places to round to (default is 2).
  //  * @returns The rounded number.
  //  */
  // roundToDecimalPlaces0(value: number, decimalPlaces: number = 2): number {
  //   const factor = Math.pow(10, decimalPlaces);
  //   return Math.round(value * factor) / factor;
  // }

  /**
   * Rounds a given number to a specified number of decimal places.
   *
   * @param value - The number to be rounded.
   * @param decimalPlaces - The number of decimal places to round to (default is 2).
   * @returns The rounded number.
   */
  roundToDecimalPlaces(value: number, decimalPlaces: number = 2): number {
    return +`${value}`.substring(0, `${value}`.indexOf('.') + (1 + decimalPlaces));
  }
}
