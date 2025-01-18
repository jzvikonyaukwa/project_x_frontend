import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { InvoicesService } from '../services/invoices.service';
import { Invoice } from '../models/invoice';
import { ExportService } from '@shared/services/exportHTML.service';
import { Client } from '@bugsnag/js';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { QuoteTotals } from '../../quotes/models/quoteTotals';
import { ProductDTO } from '../../cutting-lists/models/productDTO';

@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './invoice.component.html',
})
export class InvoiceComponent implements OnInit, OnDestroy {
  @ViewChild('exportable', { static: false }) invoiceExportEl: ElementRef;
  private destroyer$: Subject<boolean> = new Subject<boolean>();

  public invoice: Invoice;

  public client$: Observable<Client>;

  public totals: QuoteTotals;

  private readonly invoicesService = inject(InvoicesService);
  private readonly exportService = inject(ExportService);

  constructor(private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.params
      .pipe(
        takeUntil(this.destroyer$),
        switchMap((params: { id: number }) => {
          console.log('switchMap: ', params.id);
          return this.invoicesService.getInvoice(params.id);
        }),
      )
      .subscribe((invoiceData: Invoice) => {
        console.log('invoiceData: ', invoiceData);
        this.invoice = invoiceData;
        this.calculateInvoiceTotals(invoiceData);

        this.client$ = this.invoicesService.getClientForInvoice(invoiceData.id);
      });
  }

  calculateInvoiceTotals(invoice: Invoice): void {
    if (!invoice) {
      console.log('No quote');
      return;
    }
    this.totals = this.invoicesService.calculateInvoiceTotals(invoice);
  }

  calculatePricePerMtrsWithMarkUp(productDTO: ProductDTO) {
    return Number((productDTO.sellPrice).toFixed(2));
  }

  calculateCuttingListTotalPrice(productDTO: ProductDTO) {
    return Number(
      (
        productDTO.sellPrice *
        productDTO.totalLength
      ).toFixed(2),
    );
  }


  exportAsPdf() {
    this.exportService.exportAsPdf(
      this.invoiceExportEl.nativeElement,
      'Invoice ' + this.invoice.id,
    );
  }

  ngOnDestroy(): void {
    this.destroyer$.next(true);
    this.destroyer$.complete();
  }
}
