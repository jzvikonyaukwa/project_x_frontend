import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { GridReadyEvent } from 'ag-grid-community';
import { Observable, tap } from 'rxjs';
import { ConsumablesOnPurchaseOrder } from '../models/consumablesOnPurcahseOrder';
import { ProductPurchase } from '../models/product-purchase';
import { PurchaseOrder } from '../models/purchaseOrders';
import { PurchaseOrderService } from '../services/purchase-order.service';
import { MatIconModule } from '@angular/material/icon';
import { PageHeadingComponent } from '@layout/common/page-heading/page-heading.component';
import { MatButtonModule } from '@angular/material/button';
import { ExportService } from '@shared/services/exportHTML.service';
import { TotalValues } from '../../invoices/models/invoice';

@Component({
  selector: 'app-purchase-orders-export-document',
  templateUrl: './purchase-orders-export-document.component.html',
  styleUrls: ['./purchase-orders-export-document.component.scss'],
  standalone: true,
  imports: [CommonModule, PageHeadingComponent, MatIconModule, MatButtonModule, RouterModule],
})
export class PurchaseOrdersExportDocumentComponent implements OnInit {
  @ViewChild('exportable', { static: false })
  pruchaseOrdersExportEl: ElementRef;
  purchaseOrder: PurchaseOrder;
  purchaseOrderId: number;
  totals: TotalValues = {
    subTotal: 0,
    taxedPrice: 0,
    totalPrice: 0,
  };

  gridApi: GridReadyEvent<PurchaseOrder>;

  constructor(
    private purchaseOrderService: PurchaseOrderService,
    private exportService: ExportService,
    private activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.getPurchaseOrderId();
    this.getPurchaseOrder().subscribe({
      next: () => this.calculateTotalPrices(),
    });
  }

  getPurchaseOrderId(): void {
    this.activatedRoute.params.subscribe({
      next: (params) => {
        this.purchaseOrderId = params.id;
      },
    });
  }

  getPurchaseOrder(): Observable<PurchaseOrder> {
    return this.purchaseOrderService.getPurchaseOrderById(this.purchaseOrderId).pipe(
      tap((data) => {
        console.log('Purchase order = ', data);
        this.purchaseOrder = data;
      }),
    );
  }

  calculateTotalPrices(): void {
    this.purchaseOrder.productPurchases.forEach((product: ProductPurchase) => {
      this.totals.subTotal += product.purchaseCostPerKg * product.weightOrdered;
    });
    this.purchaseOrder.consumablesOnPurchaseOrders.forEach(
      (consumable: ConsumablesOnPurchaseOrder) => {
        this.totals.subTotal += consumable.costPerUnit * consumable.qty;
      },
    );
    this.totals.taxedPrice = this.totals.subTotal * 0.15;
    this.totals.totalPrice = this.totals.subTotal + this.totals.taxedPrice;
  }

  calculatePricePerMtrs(productPurchase: ProductPurchase): number {
    if (productPurchase.purchaseCostPerKg) {
      return Number(productPurchase.purchaseCostPerKg.toFixed(2));
    }
    return -1;
  }

  calculateCuttingListTotalPrice(productPurchase: ProductPurchase): number {
    return Number((productPurchase.purchaseCostPerKg * productPurchase.weightOrdered).toFixed(2));
  }

  calculateConsumableUnitPrice(consumable: ConsumablesOnPurchaseOrder): number {
    return Number(consumable.costPerUnit.toFixed(2));
  }

  calculateConsumableTotalPrice(consumable: ConsumablesOnPurchaseOrder): number {
    return Number((consumable.costPerUnit * consumable.qty).toFixed(2));
  }

  exportAsPdf() {
    const docName = `Purchase Order ${this.purchaseOrder.id}`;
    this.exportService.exportAsPdf(this.pruchaseOrdersExportEl.nativeElement, docName);
  }
}
