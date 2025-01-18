import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { CuttingList } from "../../cutting-lists/models/cuttingList";
import {
  BarFormat,
  BarFormatterParams,
  BarSparklineOptions,
  CellEditRequestEvent,
  ColDef,
  GetRowIdFunc,
  GetRowIdParams,
  GridApi,
  GridReadyEvent,
} from 'ag-grid-enterprise';
import { AgGridModule } from 'ag-grid-angular';
import 'ag-grid-enterprise';
import { COLUMN_DEFINITIONS } from 'app/utilities/ag-grid/column-definitions';
import { ProductService } from '../../product/product.service';
import { agGridDateFormatter } from 'app/utilities/ag-grid/agGridDateFormatter';
import { Observable, tap } from 'rxjs';
import { SaleOrder } from '../models/salesOrder';
import { SaleOrdersService } from '../services/sale-orders.service';
import { ProductDTO } from '../../cutting-lists/models/productDTO';

@Component({
  selector: 'app-cutting-lists-summary-table',
  standalone: true,
  imports: [CommonModule, AgGridModule],
  templateUrl: './cutting-lists-summary-table.component.html',
  styleUrls: ['./cutting-lists-summary-table.component.scss'],
})
export class CuttingListsSummaryTableComponent {
  private productService = inject(ProductService);

  gridApi: GridApi<ProductDTO>;
  rowData: ProductDTO[] = [];
  public columnDefs: ColDef[] = [
    { field: 'id', width: 80 },
    {
      field: 'status',
      headerName: 'STATUS',
      width: 130,
      valueFormatter: (params) => this.capitalizeFirstLetter(params.value),
    },
    {
      headerName: 'STOCK RESERVED',
      field: 'reserveStock',
      cellEditor: 'agRichSelectCellEditor',
      width: 150,
      cellEditorParams: {
        cellHeight: 50,
        values: ['True', 'False'],
      },
    },
    {
      field: 'targetDate',
      headerName: 'Target Date',
      valueFormatter: agGridDateFormatter,
      width: 150,
    },
    {
      field: 'priority',
      headerName: 'Priority',
      width: 150,
      valueFormatter: (params) => this.capitalizeFirstLetter(params.value),
    },
    {
      field: 'planName',
      headerName: 'PLAN NAME',
      width: 150,
      valueFormatter: (params) => this.capitalizeFirstLetter(params.value),
    },
    {
      headerName: '$ PER METER',
      width: 150,
      field: 'cuttingListPrice.pricePerMeter',
      valueFormatter: (params) => this.formatCurrency(params.value),
    },
    { headerName: 'COLOR', width: 150, field: 'color.color' },
    { headerName: 'GAUGE', width: 150, field: 'gauge.gauge' },
    {
      headerName: '% COMPLETE',
      field: 'completionPercentage',
      width: 180,
      cellRenderer: 'agSparklineCellRenderer',
      cellRendererParams: {
        sparklineOptions: {
          type: 'bar',
          fill: '#00C838',
          stroke: '#91cc75',
          highlightStyle: {
            fill: '#fac858',
          },
          valueAxisDomain: [0, 4],
          paddingOuter: 0,
          padding: {
            top: 0,
            bottom: 0,
          },
          axis: {
            strokeWidth: 0,
          },
        } as BarSparklineOptions,
      },
    },
    { headerName: 'INVOICE ID', width: 150, field: 'invoiceId' },
  ];

  public saleOrder$: Observable<SaleOrder> = this.salesOrderService.currentSaleOrder$.pipe(
    tap((saleOrder) => {
      console.log('new saleOrder arrived: ', saleOrder);
      this.rowData = this.transformProductList(saleOrder.quote.products);
    }),
  );

  public defaultColDef: ColDef = COLUMN_DEFINITIONS;

  public getRowId: GetRowIdFunc = (params: GetRowIdParams) => params.data.id;

  constructor(private salesOrderService: SaleOrdersService) {}

  // onCellEditRequest(event: CellEditRequestEvent) {
  //   const data: CuttingListDTO = event.data;
  //   const field = event.colDef.field;
  //   const newValue = event.newValue;

  //   const oldItem = this.rowData.find((row) => row.id === data.id);

  //   if (!oldItem || !field) {
  //     return;
  //   }

  //   this.productService
  //     .updateProductReserveStockStatus(data.id, newValue)
  //     .subscribe({
  //       next: (response) => {
  //         const newItem = { ...oldItem };
  //         newItem[field] = newValue;
  //         newItem.status = response.status;

  //         this.rowData = this.rowData.map((oldItem) =>
  //           oldItem.id == newItem.id ? newItem : oldItem
  //         );
  //         this.gridApi.setRowData(this.rowData);
  //       },
  //       error: (err) => {
  //         console.log("err: ", err);
  //       },
  //     });
  // }

  onGridReady(params: GridReadyEvent<any>) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
    params.api.setGridOption('domLayout', 'autoHeight');
  }

  formatter(params: BarFormatterParams): BarFormat {
    const { yValue } = params;
    return {
      fill: yValue <= 20 ? '#4fa2d9' : yValue < 60 ? '#277cb5' : '#195176',
    };
  }

  transformProductList(productDTOList: ProductDTO[]): ProductDTO[] {
    return productDTOList.map((list) => {
      const totalProducts = list.totalLength;
      const completedProducts = list.aggregatedProducts.filter(
        (ap) => ap.status === 'completed',
      ).length;
      const completionPercentage =
        totalProducts > 0 ? (completedProducts / totalProducts) * 100 : 0;

      return {
        ...list,
        completionPercentage: [completionPercentage], // Sparkline expects an array
      };
    });
  }

  capitalizeFirstLetter(value: string): string {
    if (!value) return value;
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  formatCurrency(value: number): string {
    if (value == null) return '';
    return `$${value.toFixed(2)}`;
  }

  formatPercentage(value: any): string {
    const numericValue = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(numericValue)) return '';
    return `${numericValue.toFixed(2)}%`;
  }
}
