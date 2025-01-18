import { Component, NgZone, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeadingComponent } from '@layout/common/page-heading/page-heading.component';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { SaleOrdersService } from './services/sale-orders.service';
import { SalesOrderOverview } from './models/salesOrderOverview';
import { SaleOrderSummaryComponent } from './sale-order-summary/sale-order-summary.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { ConsumablesOnQuoteTableComponent } from '../quotes/quote/consumables-on-quote/consumables-on-quote-table/consumables-on-quote-table.component';

interface IStatusType {
  name: string;
  value: string;
}

@Component({
  selector: 'app-sale-orders',
  standalone: true,
  imports: [
    CommonModule,
    PageHeadingComponent,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatSnackBarModule,
    SaleOrderSummaryComponent,
    ConsumablesOnQuoteTableComponent,
  ],
  templateUrl: './sale-orders.component.html',
  styleUrls: ['./sale-orders.component.scss'],
})
export class SaleOrdersComponent implements OnInit {
  private readonly saleOrdersService = inject(SaleOrdersService);
  private readonly _snackBar = inject(MatSnackBar);
  private readonly ngZone = inject(NgZone);

  public saleOrderOverview: SalesOrderOverview[] = [];

  public search: string = '';
  public selectedStatus: string = 'all';
  public filteredSaleOrders: SalesOrderOverview[] = [];

  public statuses: IStatusType[] = [
    {
      name: 'All',
      value: 'all',
    },
    {
      name: 'Open',
      value: 'open',
    },
    {
      name: 'Completed',
      value: 'completed',
    },
  ];

  ngOnInit(): void {
    this.saleOrdersService.getAllSaleOrderSummaries().subscribe({
      next: (saleOrderSummaries: SalesOrderOverview[]) => {
        this.saleOrderOverview = this.filteredSaleOrders = saleOrderSummaries;
        // console.log(this.saleOrderOverview);
      },
      error: (err) => {
        if (err instanceof HttpErrorResponse) {
          this._snackBar.open(`Error getting sale orders: ${err.error.message || err.statusText}`);
        } else {
          this._snackBar.open('Error getting sale orders');
        }
        console.error('Error getting sale orders', err);
      },
    });
  }

  filterSaleOrders($event: Event): void {
    // this.ngZone.runOutsideAngular(() => {

    const searchQuery = this.search.toLowerCase();
    const hasAllStatusSelected = this.selectedStatus === 'all';

    this.filteredSaleOrders = this.saleOrderOverview.filter((saleOrder) => {
      const clientNameLowercase = saleOrder.clientName.toLowerCase();
      const saleOrderIdString = saleOrder.saleOrderId.toString();

      const matchesClientName = clientNameLowercase.includes(searchQuery);
      const matchesSaleOrderId = saleOrderIdString.startsWith(this.search);
      const matchesSaleOrderStatus =
        hasAllStatusSelected || saleOrder.salesOrderStatus === this.selectedStatus;

      return (matchesClientName || matchesSaleOrderId) && matchesSaleOrderStatus;
    });
    // console.log("Filtered Orders:", this.filteredOrders);
    // });
  }

  salesOrderOverviewTrackBy = (index: number, object: SalesOrderOverview): number => {
    return object.saleOrderId;
  };

  statusTrackBy = (index: number, object: IStatusType): string => {
    return object.value;
  };
}
