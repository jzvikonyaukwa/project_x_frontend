import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { StocksOnOrderDTO } from '../../../../shared/models/stocksOnOrderDTO';
import {
  ColDef,
  ChartToolPanelsDef,
  GridReadyEvent,
  FirstDataRenderedEvent,
  ValueFormatterParams,
} from 'ag-grid-enterprise';
import { CommonModule } from '@angular/common';
import { AgGridModule } from 'ag-grid-angular';
import { gridColumnDef } from '../../../../utilities/ag-grid/gridColumnDef';
import { statusBar } from '../../../../shared/models/statusBar';
import { weightFormatter } from 'app/utilities/ag-grid/weightFormatter';
import { PurchaseOrder } from '../models/purchaseOrders';

@Component({
  selector: 'app-stock-on-order-table',
  templateUrl: './stock-on-order-table.component.html',
  styleUrls: ['./stock-on-order-table.component.scss'],
  standalone: true,
  imports: [CommonModule, AgGridModule],
})
export class StockOnOrderTableComponent implements OnChanges {
  @Input() purchaseOrders: PurchaseOrder[];
  rowData: StocksOnOrderDTO[];

  public columnDefs: ColDef[] = [
    { field: 'supplierName', width: 240 },
    { field: 'color', width: 140 },
    { field: 'gauge', width: 140 },
    { field: 'width', width: 140 },
    { field: 'isqGrade', width: 140 },
    { field: 'coating', width: 140 },
    {
      field: 'weightOrdered',
      width: 140,
      valueFormatter: weightFormatter,
    },
    {
      field: 'expectedDeliveryDate',
      width: 200,
    },
    {
      field: 'expectedDeliveryDate',
      width: 200,
    },
  ];

  public chartThemes: string[] = ['ag-vivid'];

  public defaultColDef: ColDef = gridColumnDef;

  public rowSelection: 'single' | 'multiple' = 'multiple';

  public statusBar = statusBar;

  public chartToolPanelsDef: ChartToolPanelsDef = {
    panels: [],
  };

  public groupDisplayType = 'groupRows';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.purchaseOrders) {
      this.purchaseOrders = changes.purchaseOrders.currentValue;

      // filter out completed purchase orders
      const completedPurchaseOrders = this.purchaseOrders.filter((po) => po.status != 'completed');

      const data = this.mapPurchaseOrdersToStocksOnOrderDTO(completedPurchaseOrders);

      this.rowData = data.filter((row) => row.grvId === null);
    }
  }

  mapPurchaseOrdersToStocksOnOrderDTO(purchaseOrders: any[]): StocksOnOrderDTO[] {
    return purchaseOrders.flatMap((purchaseOrder) =>
      purchaseOrder.productPurchases.map((product) => ({
        purchaseOrderStatus: purchaseOrder.status,
        steelSpecificationId: product.steelSpecification.id,
        supplierId: purchaseOrder.supplier.id,
        supplierName: purchaseOrder.supplier.name,
        productStatus: '',
        isqGrade: product.steelSpecification.isqgrade,
        dateOrdered: purchaseOrder.dateIssued,
        expectedDeliveryDate: purchaseOrder.expectedDeliveryDate,
        weightOrdered: product.weightOrdered,
        purchaseOrderId: purchaseOrder.id,
        finish: product.steelSpecification.color.finish.name,
        color: product.steelSpecification.color.color,
        gauge: product.steelSpecification.gauge.gauge,
        width: product.steelSpecification.width.width,
        coating: product.steelSpecification.coating,
        productOnPurchaseOrderId: product.id,
        grvId: product.grv?.id ? product.grv.id : null,
      })),
    );
  }

  onGridReady(params: GridReadyEvent) {
    params.api.sizeColumnsToFit();
    params.api.setGridOption('domLayout', 'autoHeight');
    // params.api.setGridOption("enableCharts", true);
  }

  onFirstDataRendered(params: FirstDataRenderedEvent) {
    // params.api.createCrossFilterChart({
    //   chartType: 'column',
    //   cellRange: {
    //     columns: ['color', 'weightOrdered'],
    //   },
    //   aggFunc: 'sum',
    //   chartThemeOverrides: {
    //     common: {
    //       title: {
    //         enabled: true,
    //         text: 'Product Weight',
    //       },
    //     },
    //   },
    //   chartContainer: document.querySelector('#myChart'),
    // });
  }

  numberFormatter(params: ValueFormatterParams) {
    return params.value.toFixed(3);
  }
}
