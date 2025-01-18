import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SaleOrdersService } from '../services/sale-orders.service';
import { PageHeadingComponent } from '@layout/common/page-heading/page-heading.component';
import { MatIconModule } from '@angular/material/icon';
import { Observable, Subject, takeUntil, tap } from 'rxjs';
import { SaleOrder } from '../models/salesOrder';
import { ActivatedRoute, Params, RouterModule } from '@angular/router';
import { FuseCardComponent } from '@fuse/components/card';
import { MatButtonModule } from '@angular/material/button';
import { CuttingListsSummaryTableComponent } from '../cutting-lists-summary-table/cutting-lists-summary-table.component';
import { MatMenuModule } from '@angular/material/menu';
import { InvoiceComponent } from '../../invoices/invoice/invoice.component';
import { TotalValues } from '../../invoices/models/invoice';
import { CreateInvoiceModalComponent } from '../../invoices/create-invoice-modal/create-invoice-modal.component';
import { ModalService } from '@shared/services/modal.service';
import { InvoicesOnSaleOrderTableComponent } from '../invoices-on-sale-order-table/invoices-on-sale-order-table.component';
import { ItemsInInventoryComponent } from './items-in-inventory/items-in-inventory.component';
import { ConsumablesOnQuoteTableComponent } from '../../quotes/quote/consumables-on-quote/consumables-on-quote-table/consumables-on-quote-table.component';

@Component({
  selector: 'app-sale-order',
  standalone: true,
  imports: [
    CommonModule,
    PageHeadingComponent,
    InvoicesOnSaleOrderTableComponent,
    MatIconModule,
    FuseCardComponent,
    MatButtonModule,
    MatMenuModule,
    ConsumablesOnQuoteTableComponent,
    CuttingListsSummaryTableComponent,
    InvoiceComponent,
    RouterModule,
    ItemsInInventoryComponent,
  ],
  templateUrl: './sale-order.component.html',
})
export class SaleOrderComponent implements OnInit, OnDestroy {
  private saleOrderId: number;
  private saleOrder: SaleOrder;
  public exportEmitter: EventEmitter<void> = new EventEmitter();

  public totals: TotalValues = {
    subTotal: 0,
    taxedPrice: 0,
    totalPrice: 0,
  };

  private ngUnsubscribe = new Subject<void>();

  public saleOrder$: Observable<SaleOrder> = this.salesOrderService.currentSaleOrder$.pipe(
    takeUntil(this.ngUnsubscribe),
    tap((saleOrder) => {
      this.saleOrder = saleOrder;
    }),
  );

  constructor(
    private route: ActivatedRoute,
    private salesOrderService: SaleOrdersService,
    private modalService: ModalService,
  ) {}

  ngOnInit(): void {
    this.handleRouteParams();
  }

  onBtExport(): void {
    this.exportEmitter.emit();
  }

  handleRouteParams(): void {
    this.route.params.subscribe((params: Params) => {
      this.saleOrderId = parseInt(params['id']);
      this.salesOrderService
        .getSaleOrderById(this.saleOrderId)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(() => {});
    });
  }

  createInvocie() {
    console.log('create invoice');

    const dialog = this.modalService.open<CreateInvoiceModalComponent>(
      CreateInvoiceModalComponent,
      { data: { saleOrder: this.saleOrder } },
    );

    dialog.afterClosed().subscribe(() => {
      console.log('Successfully created invoices. ');
      this.salesOrderService
        .getSaleOrderById(this.saleOrderId)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(() => {
          console.log('Successfully updated sale order. ');
        });
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
