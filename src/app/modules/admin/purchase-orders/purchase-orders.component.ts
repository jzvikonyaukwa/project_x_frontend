import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColDef, IDetailCellRendererParams, GridReadyEvent } from 'ag-grid-enterprise';
import { PurchaseOrder } from './models/purchaseOrders';
import { PurchaseOrderService } from './services/purchase-order.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AgGridModule } from 'ag-grid-angular';
import { PageHeadingComponent } from '@layout/common/page-heading/page-heading.component';
import { Router, RouterModule } from '@angular/router';
import { StockOnOrderTableComponent } from './stock-on-order-table/stock-on-order-table.component';
import { GridOptions, IServerSideDatasource, IServerSideGetRowsParams } from 'ag-grid-enterprise';
import { map, Observable, tap } from 'rxjs';
import { StatusPanelDef } from 'ag-grid-community';
import { createColumnDefs } from './purchase-order-table-defs/purchase-orders-table-colum-defs';
import { DEFAULT_COL_DEFS } from './purchase-order-table-defs/purchase-order-defult-col-def';

@Component({
  selector: 'app-purchase-orders',
  standalone: true,
  imports: [
    CommonModule,
    PageHeadingComponent,
    MatIconModule,
    MatButtonModule,
    AgGridModule,
    RouterModule,
    StockOnOrderTableComponent,
  ],
  templateUrl: './purchase-orders.component.html',
  styleUrls: ['./purchase-orders.component.scss'],
})
export class PurchaseOrdersComponent implements OnInit {
  rowData: PurchaseOrderTableData[];
  public orders$: Observable<{ purchaseOrders: PurchaseOrder[]; totalElements: number }>;

  gridApi: any;

  public gridOptions: GridOptions = {
    pagination: true,
    paginationPageSize: 10,
    paginationPageSizeSelector: [10, 20, 30, 50, 100],
    getRowId: (params) => params.data.id,
  };

  public defaultColDef: ColDef = DEFAULT_COL_DEFS;

  public rowSelection: 'single' | 'multiple' = 'multiple';
  public statusBar: {
    statusPanels: StatusPanelDef[];
  } = {
    statusPanels: [
      { statusPanel: 'agSelectedRowCountComponent' },
      { statusPanel: 'agAggregationComponent' },
    ],
  };

  public columnDefs: ColDef[] = createColumnDefs(this.router, this.deletePurchaseOrder.bind(this));

  public detailCellRendererParams = {
    detailGridOptions: {
      columnDefs: [
        {
          headerName: 'Product Type',
          field: 'productType',
          flex: 1,
          minWidth: 100,
          width: 120,
        },

        {
          headerName: 'Name',
          field: 'name',
          flex: 1,
          minWidth: 200,
          width: 200,
        },
        {
          headerName: 'UOM',
          field: 'uom',
          minWidth: 100,
          width: 120,
          valueFormatter: (params) => {
            return params.value.toUpperCase();
          },
        },
        {
          headerName: 'Unit Price',
          field: 'unitPrice',
          flex: 1,
          minWidth: 100,
          width: 120,
          valueFormatter: (params) => {
            if (params.value === null) {
              return;
            }
            return params.value.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
            });
          },
        },
        {
          headerName: 'QTY',
          field: 'qty',
          flex: 1,
          minWidth: 100,
          width: 120,
          valueFormatter: (params) => {
            if (params.data.uom === 'kgs') {
              return params.value + ' ' + params.data.uom.toUpperCase();
            } else {
              return params.value;
            }
          },
        },
        {
          headerName: 'Total',
          field: 'total',
          flex: 1,
          minWidth: 120,
          width: 120,
          valueFormatter: (params) => {
            return params.value.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
            });
          },
        },
        {
          field: 'status',
          minWidth: 100,
          width: 140,
          valueFormatter: (params) => {
            if (!params.value || params.value === null) {
              return;
            }
            return params.value.charAt(0).toUpperCase() + params.value.slice(1);
          },
        },
      ],
    },

    getDetailRowData: (params) => {
      params.successCallback(params.data.productInfo);
    },
  } as IDetailCellRendererParams<any>;

  constructor(private purchaseOrderService: PurchaseOrderService, private router: Router) {}

  ngOnInit(): void {
    this.getTotalElements().subscribe((totalElements) => {
      this.orders$ = this.getPurchaseOrders(0, totalElements);
    });
  }

  getTotalElements(): Observable<number> {
    return this.purchaseOrderService
      .getAllOrders(0, 1)
      .pipe(map((response) => response.totalElements));
  }

  getPurchaseOrders(
    page: number = 0,
    size: number = 10,
  ): Observable<{ purchaseOrders: PurchaseOrder[]; totalElements: number }> {
    return this.purchaseOrderService.getAllOrders(page, size).pipe(
      tap((response) => {
        console.log('purchase order data: ', response);
        this.orderByIssueDateAndId(response);
        this.rowData = this.transformData(response.purchaseOrders);
      }),
    );
  }

  orderByIssueDateAndId(response: { purchaseOrders: PurchaseOrder[] }) {
    response.purchaseOrders.sort((a, b) => {
      // First compare by dateIssued
      const dateComparison = new Date(b.dateIssued).getTime() - new Date(a.dateIssued).getTime();

      // If dates are equal, compare by ID
      if (dateComparison === 0) {
        return b.id - a.id;
      }

      return dateComparison;
    });
  }

  transformData(rawData: PurchaseOrder[]): PurchaseOrderTableData[] {
    const purchaseOrderDataFormatted: PurchaseOrderTableData[] = [];

    rawData.forEach((purchaseOrder) => {
      const productInfo: ProductInfo[] = [];

      purchaseOrder.productPurchases.forEach((product) => {
        productInfo.push({
          productType: 'Steel Coil',
          unitPrice: product.purchaseCostPerKg,
          name: `${product.steelSpecification.width.width} x ${product.steelSpecification.gauge.gauge} x ${product.steelSpecification.coating} x ${product.steelSpecification.isqgrade}`,
          qty: product.weightOrdered,
          status: product.status,
          uom: 'kgs',
          total: product.weightOrdered * product.purchaseCostPerKg,
        });
      });

      purchaseOrder.consumablesOnPurchaseOrders.forEach((consumable) => {
        productInfo.push({
          productType: 'Consumable',
          unitPrice: consumable.costPerUnit,
          name: consumable.consumable.name,
          uom: consumable.consumable.uom,
          status: consumable.status,
          qty: consumable.qty,
          total: consumable.qty * consumable.costPerUnit,
        });
      });

      purchaseOrderDataFormatted.push({
        id: purchaseOrder.id,
        hasGrv: purchaseOrder.grvs.length > 0,
        expectedDeliveryDate: purchaseOrder.expectedDeliveryDate,
        dateIssued: purchaseOrder.dateIssued,
        paid: purchaseOrder.paid,
        notes: purchaseOrder.notes,
        status: purchaseOrder.status,
        supplierName: purchaseOrder?.supplier?.name,
        productInfo,
      });
    });

    const findPO169 = purchaseOrderDataFormatted.find((po) => po.id === 169);
    console.log('findPO169', findPO169);
    return purchaseOrderDataFormatted;
  }

  onGridReady(params: GridReadyEvent<PurchaseOrder>) {
    this.gridApi = params.api;
    params.api.setGridOption('domLayout', 'autoHeight');
    params.api.sizeColumnsToFit();
    this.applyDefaultFilter();
  }

  applyDefaultFilter() {
    this.gridApi.getColumnFilterInstance('status', (filterInstance) => {
      filterInstance.setModel({ values: ['Pending'] });
      this.gridApi.onFilterChanged();
    });
  }

  cancel(id: number) {
    this.purchaseOrderService.cancelOrder(id).subscribe((data) => {
      console.log('data', data);
      const currentPage = this.gridApi.api.paginationGetCurrentPage();
      const pageSize = this.gridApi.api.paginationGetPageSize();
      this.getPurchaseOrders(currentPage, pageSize).subscribe((response) => {
        this.rowData = this.transformData(response.purchaseOrders);
        this.gridApi.api.setRowData(this.rowData);
      });
    });
  }

  dataSource: IServerSideDatasource = {
    getRows: (params: IServerSideGetRowsParams) => {
      const request = params.request;
      const filters = request.filterModel;

      const filterParams = Object.keys(filters)
        .map((key) => {
          const filter = filters[key];
          if (filter.filterType === 'set') {
            const values = filter.values.join(',');
            return `${key}:set:contains:${values}`;
          } else if (filter.filterType === 'date') {
            const dateFilter = new Date(filter.dateFrom);
            const formattedDate =
              `${dateFilter.getFullYear()}` +
              '-' +
              `${(dateFilter.getMonth() + 1).toString().padStart(2, '0')}` +
              '-' +
              `${dateFilter.getDate().toString().padStart(2, '0')}`;
            return `${key}:date:${filter.type}:${formattedDate}`;
          }
          return `${key}:${filter.filterType}:${filter.type}:${filter.filter}`;
        })
        .join(',');

      console.log('Requested startRow:', params.request.startRow, 'endRow:', params.request.endRow);
      const startRow = params.request.startRow;
      const endRow = params.request.endRow;
      const pageSize = endRow - startRow;

      console.log('Filter Params:', filterParams);

      this.purchaseOrderService
        .getAllOrders(startRow / pageSize, pageSize, filterParams)
        .subscribe({
          next: (response) => {
            console.log('Data fetched:', response);
            if (!response || !Array.isArray(response.purchaseOrders)) {
              console.error("Expected 'purchaseOrders' as an array, got:", response.purchaseOrders);
              params.fail();
              return;
            }
            const transformedData = this.transformData(response.purchaseOrders);
            console.log('Transformed Data Length:', transformedData.length);

            params.success({
              rowData: transformedData,
              rowCount: response.totalElements,
            });
          },
          error: (error) => {
            console.error('Error in data source: ', error);
            params.fail();
          },
        });
    },
  };

  deletePurchaseOrder(id: number) {
    console.log('deletePurchaseOrder', id);
    this.purchaseOrderService.deleteOrder(id).subscribe((data) => {
      this.getPurchaseOrders(0, 10).subscribe((response) => {
        this.rowData = this.transformData(response.purchaseOrders);
      });
    });
  }
}

interface PurchaseOrderTableData {
  id: number;
  expectedDeliveryDate: Date;
  dateIssued: Date;
  paid: boolean;
  notes?: string | null;
  status: string;
  supplierName: string;
  hasGrv: boolean;
  productInfo: ProductInfo[];
}

interface ProductInfo {
  productType: string;
  unitPrice: number;
  name: string;
  status: string;
  uom: string;
  qty: number;
  total: number;
}
