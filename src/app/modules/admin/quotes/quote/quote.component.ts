import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeadingComponent } from '@layout/common/page-heading/page-heading.component';
import { QuotesService } from '../services/quotes.service';
import { Quote } from '../models/quote';
import { finalize, Subject, Subscription, takeUntil, tap } from 'rxjs';
import { RouterModule } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ModalService } from '@shared/services/modal.service';
import { ProductService } from '../../product/product.service';
import { ProductDTO } from '../../cutting-lists/models/productDTO';
import { PasteClProductsTableComponent } from '../paste-cl-products-table/paste-cl-products-table.component';
import { QuoteStatus } from '@shared/enums/quote-status';
import { RejectedPopUpComponent } from '../rejected-pop-up/rejected-pop-up.component';
import { RejectionReasonService } from '@shared/services/rejection-reason.service';
import { RejectionReason } from '@shared/models/rejectionReason';
import { MatDialogConfig } from '@angular/material/dialog';
import { AgGridModule } from 'ag-grid-angular';
import { ProductInputtedRows } from '../models/cuttingListRow';
import { QuotePriceCategoryCardComponent } from '../quote-price-category-card/quote-price-category-card.component';
import { QuotePrice } from '@shared/models/quotePrice';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { CreateCodeService } from '../services/create-code.service';
import { QuoteCalculationsService } from '../services/quote-calculations.service';
import { ColorsService } from '@shared/services/colors.service';
import { GaugesService } from '@shared/services/gauges.service';
import { Color } from '@shared/models/color';
import { Gauge } from '@shared/models/gauge';
import { WidthService } from '@shared/services/width.service';
import { Width } from '@shared/models/width';
import { ConvertInputtedRowsToCuttingListService } from '../services/convert-inputted-rows-to-cutting-list.service';
import { QuoteTotals } from '../models/quoteTotals';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarModule } from '@angular/material/snack-bar';
import { QuotePricesService } from '@shared/services/quote-prices.service';
import { AddProductComponent } from './add-product/add-product.component';
import { ProductType } from '../../product-types/models/productType';
import { CreateProductDTO } from './add-product/models/createProductDTO';
import { ProductsOnQuoteSummaryComponent } from './products-on-quote-summary/products-on-quote-summary.component';
import { QuoteStatusComponent } from './quote-status/quote-status.component';
import { DateTime } from 'luxon';
import { environment } from '@environments/environment';
import { QuoteClientComponent } from './quote-client/quote-client.component';
import { QuoteTotalsComponent } from './quote-totals/quote-totals.component';
import { ConsumablesOnQuoteComponent } from './consumables-on-quote/consumables-on-quote.component';

@Component({
  selector: 'app-quote',
  standalone: true,
  imports: [
    CommonModule,
    PageHeadingComponent,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSnackBarModule,
    MatSortModule,
    MatProgressBarModule,
    RouterModule,
    ProductsOnQuoteSummaryComponent,
    AgGridModule,
    QuotePriceCategoryCardComponent,
    FuseAlertComponent,

    QuoteStatusComponent,
    QuoteTotalsComponent,
    QuoteClientComponent,
    ConsumablesOnQuoteComponent,
  ],
  templateUrl: './quote.component.html',
  styles: [
    `
      .border-dashed-red {
        border: 1px;
        border-style: dashed;
        border-color: red;
      }
    `,
  ],
})
export class QuoteComponent implements OnInit, OnDestroy {
  @Input('id') quoteID: number;
  isBusy: boolean = false;
  quote: Quote;
  rejectedReasons: RejectionReason[];
  totalValues: QuoteTotals = {
    externalCost: 0,
    markUpCharged: 0,
    totalExcVat: 0,
    totalIncVat: 0,
    totalRawMaterialCost: 0,
  } as QuoteTotals;

  showAlert = false;

  alert: { type: FuseAlertType; message: string } = {
    type: 'success',
    message: '',
  };

  productTypes: ProductType[];
  colors: Color[];
  gauges: Gauge[];
  widths: Width[];

  private ngUnsubscribe = new Subject<void>();

  private readonly _modalService = inject(ModalService);
  private readonly _snackBar = inject(MatSnackBar);
  private readonly colorService = inject(ColorsService);
  private readonly createCodeService = inject(CreateCodeService);
  private readonly gaugesService = inject(GaugesService);
  private readonly productService = inject(ProductService);
  private readonly quoteCalculationsService = inject(QuoteCalculationsService);
  private readonly quotePriceService = inject(QuotePricesService);
  private readonly quotesService = inject(QuotesService);
  private readonly rejectionReasonsService = inject(RejectionReasonService);
  private readonly widthService = inject(WidthService);

  private readonly convertInputtedRowsToCuttingListService = inject(
    ConvertInputtedRowsToCuttingListService,
  );

  ngOnInit(): void {
    this.getAllColors();
    this.getAllGauges();
    this.getWidths();
    this.getAllQuoteRejectedReasons();
    this.getQuote(this.quoteID);
    this.handleQuoteSubscription();
  }

  handleQuoteSubscription(): void {
    this.quotesService.currentQuote$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((quote) => {
      this.quote = quote;
      this.totalValues = this.quoteCalculationsService.calculateQuoteTotals(quote);
    });
  }

  getQuote(quoteId: number): void {
    this.isBusy = true;
    this.quotesService
      .getQuote(quoteId)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        finalize(() => (this.isBusy = false)),
      )
      .subscribe({
        next: (quote) => {
          console.log('quote: ', quote);
        },
        error: (errorResponse) => {
          this.handleError('fetching quote', errorResponse);
        },
      });
  }

  getWidths(): void {
    this.widthService
      .getAllWidths()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (widths) => {
          this.widths = widths;
        },
        error: (errorResponse) => {
          this.handleError('fetching widths', errorResponse);
        },
      });
  }

  getAllColors(): void {
    this.colorService
      .getAllColors()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (colors) => {
          this.colors = colors;
        },
        error: (errorResponse) => {
          this.handleError('fetching colors', errorResponse);
        },
      });
  }

  getAllGauges(): void {
    this.gaugesService
      .getAllGauges()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (gauges) => {
          this.gauges = gauges;
        },
        error: (errorResponse) => {
          this.handleError('fetching gauges', errorResponse);
        },
      });
  }

  onQuoteUpdate() {
    this.updateTheQuote();
  }

  updateTheQuote(): void {
    if (this.quote) {
      this.quotesService
        .updateQuoteSections(this.quote)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: () => {
            console.log('Quote updated, from the updateTheQuote()');
          },
          error: (errorResponse) => {
            this.handleError('updating quote sections', errorResponse);
          },
        });
    }
  }

  menuItemClicked(newStatus: string) {
    this.showAlert = false;

    if (newStatus === 'accepted' && !this.productPriceCheck()) {
      this.showAlertMessage(
        'warning',
        'There is a cutting list on this quote without a price attached.',
      );
      return;
    }

    if (
      newStatus === 'accepted' &&
      this.quote.products.length === 0 &&
      this.quote.consumablesOnQuote.length === 0
    ) {
      this.showAlertMessage('warning', 'No products on the quote.');
      return;
    }

    if (newStatus != 'rejected') {
      this.quotesService
        .changeQuoteStatus(this.quote.id, newStatus)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: () => {
            console.log('Quote status changed to accepted');
          },
          error: (err) => {
            console.log('Error in the updateTheQuote: ', err);
          },
        });
    } else {
      this.quoteRejected();
    }
  }

  productPriceCheck(): boolean {
    for (const productDTO of this.quote.products) {
      if (productDTO.sellPrice == 0) {
        console.log('Product has no sell price');
        return false;
      }
    }
    return true;
  }

  getAllQuoteRejectedReasons(): void {
    this.rejectionReasonsService.getAllReasons().subscribe((reasons) => {
      this.rejectedReasons = reasons;
    });
  }

  quoteRejected(): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.data = this.rejectedReasons;
    console.log('quote rejected');
    const dialog = this._modalService.open<RejectedPopUpComponent>(
      RejectedPopUpComponent,
      dialogConfig,
    );

    dialog.afterClosed().subscribe((data) => {
      if (data) {
        this.quotesService
          .changeQuoteStatus(this.quote.id, QuoteStatus.rejected)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe({
            next: (quote) => {
              console.log('Quote status changed to:' + quote.status);
              this.quote.rejectedReason = data.reason;
              this.quote.dateRejected = data.date;
              this.updateTheQuote();
            },
            error: (err) => {
              console.log('Error in the updateTheQuote: ', err);
            },
          });
      }
    });
  }

  addProduct() {
    console.log('addProduct');

    const dialog = this._modalService.open<AddProductComponent>(AddProductComponent, {
      data: {
        edit: false,
      },
    });

    dialog
      .afterClosed()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((createProductDTO: CreateProductDTO) => {
        if (createProductDTO) {
          this.productService.createProductV2(createProductDTO, this.quote.id).subscribe({
            next: (product) => {
              console.log(product);
              this.getQuote(this.quote.id);
            },
            error: (err) => {
              console.log(err);
            },
          });
        }
      });
  }

  pasteFramecad() {
    const dialogRef = this._modalService.open<PasteClProductsTableComponent>(
      PasteClProductsTableComponent,
    );

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((inputtedRows: ProductInputtedRows[]) => {
        if (!inputtedRows || inputtedRows.length === 0) {
          console.log('No inputted rows. Nothing to process.');
          return;
        }

        // Group the inputtedRows by planName
        const groupedByPlanName = this.groupByPlanName(inputtedRows);

        // Create CuttingListDTOs for each group
        const productToBeSaved: ProductDTO[] = Object.keys(groupedByPlanName).map((planName) =>
          this.populateProduct(groupedByPlanName[planName]),
        );

        this.productService.createPastedProduct(productToBeSaved[0], this.quote.id).subscribe({
          next: () => {
            this.getQuote(this.quote.id);
          },
          error: (err) => {
            console.error(err);
          },
        });
      });
  }

  // Helper method to group inputtedRows by planName for separate cutting lists
  private groupByPlanName(inputtedRows: ProductInputtedRows[]): {
    [planName: string]: ProductInputtedRows[];
  } {
    return inputtedRows.reduce((groups, product) => {
      const { planName } = product;
      if (!groups[planName]) {
        groups[planName] = [];
      }
      groups[planName].push(product);
      return groups;
    }, {} as { [planName: string]: ProductInputtedRows[] });
  }

  populateProduct(rows: ProductInputtedRows[]): ProductDTO {
    const gauge = this.getGauge(rows[0].planName);
    const color = this.getGalvanizedColor();
    const width = this.getWidthFromPlanName(rows[0].planName);
    const codeName = this.createCodeService.getCodeFromClientsName(this.quote.project.client.name);

    return this.convertInputtedRowsToCuttingListService.convertToProduct(
      rows,
      gauge,
      color,
      width,
      codeName,
    );
  }

  getWidthFromPlanName(planName: string): Width {
    if (planName.toLowerCase() === 'purlins') {
      return this.widthService.getWidthForPurlin(this.widths);
    } else if (planName.toLowerCase() === 'battens') {
      return this.widthService.getWidthForBatten(this.widths);
    } else {
      return this.widthService.getWidthForFraemcad(this.widths);
    }
  }

  getGalvanizedColor(): Color {
    return this.colors.find((color) => color.color === 'Galvanize');
  }

  getGauge(planName: string): Gauge {
    let gaugeToFind: number = 0;

    if (planName.toLowerCase() === 'purlins') gaugeToFind = 0.55;
    else if (planName.toLowerCase() === 'battens') gaugeToFind = 0.55;
    else gaugeToFind = 0.8;

    return this.gauges.find((gauge) => gauge.gauge === gaugeToFind);
  }

  updateQuotePriceCategory(priceQuote: QuotePrice) {
    this.quote.quotePrice = priceQuote;
    this.updateTheQuote();
  }

  saveNewMarkUp = (quotePrice?: QuotePrice): void => {
    if (!quotePrice || quotePrice.priceType != 'custom') {
      return;
    }
    console.log('Quote Price: ', quotePrice);

    if (!quotePrice.markUp || quotePrice.markUp < 0) {
      this._snackBar.open('Markup cannot be less than 0', null, {
        duration: environment.DEFAULT_SNACKBAR_TIMEOUT,
      } as MatSnackBarConfig);
      return;
    }

    this.quotePriceService
      .updateQuotePrice(quotePrice)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        tap((qp) => (this.quote.quotePrice = qp)),
        finalize(() => this.updateTheQuote()),
      )
      .subscribe({
        next: () => {
          console.log('Quote Price Updated');
        },
        error: (errorResponse) => {
          this.handleError('updating quote price', errorResponse);
        },
      });
  };

  onQuotePriceChanged = ($event: QuotePrice): void => {
    if ($event.priceType === 'custom') {
      $event.id = undefined;
      this.saveNewMarkUp($event);
    } else {
      this.updateQuotePriceCategory($event);
    }
  };

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onRejectQuote($event: Event): void {
    this.isBusy = true;

    const dialogConfig = new MatDialogConfig();

    dialogConfig.data = this.rejectedReasons;
    const dialog = this._modalService.open<RejectedPopUpComponent>(
      RejectedPopUpComponent,
      dialogConfig,
    );

    dialog
      .afterClosed()
      .pipe(
        takeUntil(this.ngUnsubscribe),
        finalize(() => (this.isBusy = false)),
      )
      .subscribe((rejectionDetails: { date: DateTime; reason: { id: number; reason: string } }) => {
        if (rejectionDetails) {
          const formattedDate =
            typeof rejectionDetails.date.toISODate === 'function'
              ? rejectionDetails.date.toISODate()
              : DateTime.fromJSDate(rejectionDetails.date as unknown as Date).toISODate();
          console.log('formattedDate', formattedDate);

          this.quotesService
            .rejectQuote(this.quote.id, {
              date: formattedDate,
              rejectionReason: rejectionDetails.reason,
            })
            // .pipe(finalize(() => (this.isBusy = false)))
            .subscribe({
              next: (quote) => {
                if (quote) {
                  // update current quote with the new status using spread operator
                  this.quote = { ...this.quote, ...quote };
                }
              },
              error: (errorResponse) => {
                this.handleError('rejecting quote', errorResponse);
              },
            });
        }
      });
  }

  get hasProducts(): boolean {
    return !!this.quote?.products?.length;
  }

  get hasConsumables(): boolean {
    return !!this.quote?.consumablesOnQuote?.length;
  }

  get hasLineItems(): boolean {
    return this.hasProducts || this.hasConsumables;
  }

  get canExportQuote(): boolean {
    return (
      this.quote?.status === QuoteStatus.accepted || this.quote?.status === QuoteStatus.approved
    );
  }

  onRequestQuoteApproval($event: Event): void {
    console.log('onRequestQuoteApproval', $event);
    this.isBusy = true;

    if (!this.productPriceCheck()) {
      this.showAlert = true;
      this.alert = {
        type: 'warning',
        message: 'There is a cutting list on this quote without a price attached.',
      };
      return;
    }

    if (!this.hasLineItems) {
      this.showAlertMessage('warning', 'No products on the quote.');
      return;
    }

    this.quotesService
      .requestQuoteApproval(this.quote.id)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        finalize(() => (this.isBusy = false)),
      )
      .subscribe({
        next: (quote) => {
          if (quote) {
            // update current quote with the new status using spread operator
            this.quote = { ...this.quote, ...quote };
          }
        },
        error: (errorResponse) => {
          this.handleError('submitting quote for approval', errorResponse);
        },
      });
  }

  onApproveQuote($event: Event): void {
    console.log('onApproveQuote', $event);
    this.isBusy = true;

    this.quotesService
      .approveQuote(this.quote.id)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        finalize(() => (this.isBusy = false)),
      )
      .subscribe({
        next: (quote) => {
          if (quote) {
            // update current quote with the new status using spread operator
            this.quote = { ...this.quote, ...quote };
          }
        },
        error: (errorResponse) => {
          this.handleError('approving quote', errorResponse);
        },
      });
  }

  onAcceptQuote($event: Event): void {
    console.log('onAcceptQuote', $event);
    this.isBusy = true;

    this.quotesService
      .acceptQuote(this.quote.id)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        finalize(() => (this.isBusy = false)),
      )
      .subscribe({
        next: (quote) => {
          if (quote) {
            // update current quote with the new status using spread operator
            this.quote = { ...this.quote, ...quote };
          }
        },
        error: (errorResponse) => {
          this.handleError('accepting quote', errorResponse);
        },
      });
  }

  handleError(fromWhere: string, errorResponse) {
    const detailedErrorMessage =
      errorResponse instanceof HttpErrorResponse
        ? errorResponse.error.message || errorResponse.statusText
        : 'Unknown error';

    this._snackBar.open(`Error ${fromWhere}: ${detailedErrorMessage}`, null, {
      duration: environment.DEFAULT_SNACKBAR_TIMEOUT,
    } as MatSnackBarConfig);

    console.error('Error updating Quote price', errorResponse);
  }

  showAlertMessage(type: 'success' | 'warning' | 'error' | 'info', message: string): void {
    this.showAlert = true;
    this.alert = { type, message };
  }
}
