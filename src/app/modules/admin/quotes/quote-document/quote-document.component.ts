import { Component, ElementRef, inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Quote } from '../models/quote';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { QuotesService } from '../services/quotes.service';
import { ExportService } from '@shared/services/exportHTML.service';
import { QuoteTotals } from '../models/quoteTotals';
import { QuoteCalculationsService } from '../services/quote-calculations.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PageHeadingComponent } from '@layout/common/page-heading/page-heading.component';
import { ConsumableLineItems } from './consumable-line-items.component';
import { ProductLineItems } from './product-line-items.component';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { environment } from '@environments/environment';
import { QuoteStatus } from '@shared/enums/quote-status';
@Component({
  selector: 'app-quote-document',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    ConsumableLineItems,
    PageHeadingComponent,
    ProductLineItems,
  ],
  templateUrl: './quote-document.component.html',
})
export class QuoteDocumentComponent implements OnInit, OnDestroy {
  @ViewChild('exportable', { static: false }) exportElRef: ElementRef;

  @Input('id') quoteID: number;

  quote: Quote;
  totals: QuoteTotals;

  private ngUnsubscribe = new Subject<void>();

  private readonly _snackBar = inject(MatSnackBar);
  private readonly exportService = inject(ExportService);
  private readonly quoteCalculationsService = inject(QuoteCalculationsService);
  private readonly quotesService = inject(QuotesService);

  private getQuoteSubscription: Subscription;

  ngOnInit(): void {
    this.getQuoteSubscription = this.quotesService.getQuote(this.quoteID).subscribe({
      next: (quote) => {},
      error: (error: unknown) => {
        const detailedErrorMessage =
          error instanceof HttpErrorResponse
            ? error.error.message || error.statusText
            : 'Unknown error';
        this._snackBar.open(`Error fetching quotes: ${detailedErrorMessage}`, null, {
          duration: environment.DEFAULT_SNACKBAR_TIMEOUT,
        } as MatSnackBarConfig);
        console.error('Error fetching quotes', error);
      },
    });

    this.quotesService.currentQuote$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((quote) => {
      this.quote = quote;
      this.totals = this.quoteCalculationsService.calculateQuoteTotals(quote);
    });
  }

  exportAsPdf(): void {
    this.exportService.exportAsPdf(
      this.exportElRef.nativeElement,
      `Quote ${this.quote.id}`,
      this.getLength(),
    );
  }

  getLength(): number {
    let lineLength = 0;

    lineLength += this.quote?.products?.length || 0;
    lineLength += this.quote?.consumablesOnQuote?.length || 0;
    return lineLength;
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();

    this.getQuoteSubscription?.unsubscribe();
  }

  get isAcceptedQuote(): boolean {
    return QuoteStatus.accepted === this.quote?.status;
  }

  get email(): string | null {
    const email = this.quote.project?.client?.emails?.[0]?.email?.trim();
    return email || null;
  }

  get phone(): string | null {
    const phone = this.quote.project?.client?.phones?.[0]?.phone?.trim();
    return phone || null;
  }

  get street(): string | null {
    const street = this.quote.project?.client?.addresses?.[0]?.street?.trim();
    return street ? street : null;
  }

  get suburb(): string | null {
    const suburb = this.quote.project?.client?.addresses?.[0]?.suburb?.trim();
    const city = this.city && this.city !== suburb ? this.city : null;
    return [suburb, city].filter(Boolean).join(', ') || null; // Filter out null/undefined
  }

  get city(): string | null {
    return this.quote.project?.client?.addresses?.[0]?.city?.trim() || null;
  }
}
