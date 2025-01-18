import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridModule } from 'ag-grid-angular';
import { AggregatedProduct } from 'app/modules/admin/aggregated-products/aggregatedProducts';
import { SteelCoilDetailsDTO } from '@shared/models/steelCoilDetailsDTO';
import {
  ColDef,
  GridApi,
  GridReadyEvent,
  ProcessCellForExportParams,
  ProcessHeaderForExportParams,
  ValueFormatterParams,
} from 'ag-grid-enterprise';
import { CUTTING_LIST_DEFAULT_COLS } from 'app/modules/admin/cutting-list/models/cutting-list-default-cols';
import { EmptyButtonComponent } from 'app/utilities/ag-grid/empty-button/empty-button.component';
import { ManufacturedButtonComponent } from 'app/utilities/ag-grid/manufactured-button/manufactured-button.component';
import { ProductManufacturedDTO } from '../models/productManufacturedDTO';
import { AggregateProductsService } from 'app/modules/admin/aggregated-products/aggregate-products.service';
import { ProductInformation } from 'app/modules/admin/cutting-lists/models/cuttingListInformationDTO';
import { AgGridExcelExportService } from 'app/modules/admin/cutting-list/services/ag-grid-excel-export.service';
import { StockOnHand } from 'app/modules/admin/stock/stock-on-hand/models/stock-on-hand';
import { AggregatedProductWithPickable } from '../models/aggregated-product-with-pickable';
import { ProductPickedDTO } from '../models/product-picked.dto';
import { StockOnHandService } from 'app/modules/admin/stock/stock-on-hand/services/stock-on-hand.service';

@Component({
  selector: 'app-manufacturing-aggregated-products-table',
  standalone: true,
  imports: [CommonModule, AgGridModule],
  templateUrl: './manufacturing-aggregated-products-table.component.html',
  styleUrls: ['./manufacturing-aggregated-products-table.component.scss'],
})
export class ManufacturingAggregatedProductsTableComponent implements OnInit {
  @Input() productInformation: ProductInformation;
  @Input() stockOnHandForProductType: StockOnHand[];
  @Input() loadedCoil: SteelCoilDetailsDTO;
  @Input() dateManufactured: string;

  @Output() fetchProduct = new EventEmitter<string>();

  rowData: AggregatedProductWithPickable[];

  productsInStockOnHand: StockOnHand[] = [];
  remainingStockOnHand: StockOnHand[] = [];

  public defaultColDef: ColDef = CUTTING_LIST_DEFAULT_COLS;
  public colDefs: ColDef[] = this.setColumnDefs();
  private gridApi!: GridApi;

  setColumnDefs(): ColDef[] {
    return [
      { field: 'id', headerName: 'AGGREGATED PRODUCT ID', width: 200 },
      { field: 'stick', headerName: 'Stick', width: 100 },
      { field: 'stickType', headerName: 'Stick Type', width: 100 },
      { field: 'code', headerName: 'Code', width: 100 },
      { field: 'length', headerName: 'Stick Length', width: 100 },
      {
        field: 'status',
        headerName: 'Status',
        width: 100,
        valueFormatter: (params) => this.statusFormatter(params),
      },
      {
        field: 'steelCoilNumber',
        width: 120,
        headerName: 'STEEL COIL NUMBER',
        hide: true,
      },
      {
        field: 'wastage',
        width: 120,
        headerName: 'WASTAGE',
        hide: true,
        headerClass: 'headerWaste',
      },
      {
        headerName: 'PICK',
        field: 'stockOnHandId',
        cellRendererSelector: (params: any) => {
          if (!params || !params.data) {
            return { component: EmptyButtonComponent };
          }
          if (params.data.status === 'completed') {
            return { component: EmptyButtonComponent };
          } else if (params.data.pickable) {
            return { component: ManufacturedButtonComponent };
          } else {
            return { component: EmptyButtonComponent };
          }
        },
        cellRendererParams: {
          clicked: (params: any) => {
            if (params && params.data) {
              this.productPicked(params.data.id, params.data.stockOnHandId);
            }
          },
        },
        width: 140,
      },
      {
        headerName: 'PRODUCED',
        field: 'id',
        cellRendererSelector: (params: any) => {
          if (!params || !params.data) {
            return { component: EmptyButtonComponent };
          }
          if (params.data.pickable || params.data.status === 'completed') {
            return { component: EmptyButtonComponent };
          } else {
            return { component: ManufacturedButtonComponent };
          }
        },
        cellRendererParams: {
          clicked: (params: any) => {
            if (params && params.data) {
              this.aggregatedProductManufactured(params.data.id);
            }
          },
        },
        width: 150,
      },
    ];
  }

  constructor(
    private aggregateProductsService: AggregateProductsService,
    private agGridExcelExportService: AgGridExcelExportService,
    private stockOnHandService: StockOnHandService,
  ) {}

  ngOnInit(): void {
    this.productsInStockOnHand = this.stockOnHandForProductType;
    this.remainingStockOnHand = this.stockOnHandForProductType;
    this.rowData = this.addPickableToData();
    console.log('rowData: ', this.rowData);
  }

  addPickableToData(): AggregatedProductWithPickable[] {
    const aggregatedProductsWithPickable: AggregatedProductWithPickable[] = [];

    this.productInformation.product.aggregatedProducts.forEach((agg_prod) => {
      if (agg_prod.status === 'completed') {
        aggregatedProductsWithPickable.push({ ...agg_prod, pickable: false, stockOnHandId: null });
        return;
      } else {
        const stockOnHandId = this.isProductAvailable(agg_prod.length);
        if (stockOnHandId) {
          aggregatedProductsWithPickable.push({ ...agg_prod, pickable: true, stockOnHandId });
        } else {
          aggregatedProductsWithPickable.push({
            ...agg_prod,
            pickable: false,
            stockOnHandId: null,
          });
        }
      }
    });

    return aggregatedProductsWithPickable;
  }

  isProductAvailable(length: number): number {
    let result = 0;

    console.log('length: ', length);
    if (this.remainingStockOnHand) {
      for (let i = 0; i < this.remainingStockOnHand.length; i++) {
        const product: StockOnHand = this.remainingStockOnHand[i];
        console.log('product: ', product);
        if (product.aggregatedProduct.length === length) {
          console.log('MATCH FOUND');
          result = product.id;
          this.remainingStockOnHand.splice(i, 1);
          break;
        }
      }
    }

    return result;
  }

  statusFormatter(params: ValueFormatterParams) {
    if (params.value != null) {
      return params.value.toUpperCase();
    }
    return '';
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
    this.gridApi.addEventListener('gridPreDestroy', () => {
      // Perform any cleanup here
      this.gridApi = null;
    });
  }

  productPicked(aggrProdId: number, stockOnHandId: number): void {
    const productPickedDTO: ProductPickedDTO = {
      productId: this.productInformation.product.id,
      aggrProdId,
      stockOnHandId,
    };

    console.log('productPickedDTO: ', productPickedDTO);

    this.stockOnHandService.productPicked(productPickedDTO).subscribe({
      next: (res) => {
        console.log('productPicked: ', res);

        // remove the aggregated product from the rowData
        this.rowData = this.rowData.filter((product) => product.id !== aggrProdId);
        // add the new aggregated product to the rowData
        this.rowData.push({ ...res, pickable: false, stockOnHandId: null });

        if (this.checkIfAllAggregatedProductsManufactured()) {
          this.fetchProduct.emit('all');
        }
      },
      error: (err) => {
        console.error('Error picking product: ', err);
      },
    });
  }

  aggregatedProductManufactured(id: number) {
    console.log('aggregatedProductManufactured: ', id);

    if (!id) {
      console.warn('No id provided');
      return;
    }

    if (!this.dateManufactured || !this.loadedCoil) {
      console.warn('No dateManufactured or loadedCoil provided');
      return;
    }

    const aggregatedProduct = this.rowData.find((product) => product.id === id);

    if (this.loadedCoil.estMtrsRemaining < aggregatedProduct.length) {
      console.warn('Not enough mtrs remaining on steel coil');
      return;
    }

    const productManufacturedDetails: ProductManufacturedDTO = {
      productId: id,
      dateManufactured: this.dateManufactured,
      coilId: this.loadedCoil.steelCoilId,
    };

    console.log('productManufacturedDetails: ', productManufacturedDetails);

    this.aggregateProductsService.productManufactured(productManufacturedDetails).subscribe({
      next: (res: AggregatedProduct) => {
        console.log('productManufactured: ', res);
        this.subtractMtrsFromCoil(aggregatedProduct.length);
        const updatedRowData = this.rowData.map((row) => {
          if (row.id === id) {
            return { ...row, aggProdStatus: 'completed' }; // Update the status
          }
          return row;
        });

        this.rowData = updatedRowData;

        // this.gridApi.setGridOption('rowData', this.rowData);

        if (this.checkIfAllAggregatedProductsManufactured()) {
          this.fetchProduct.emit('all');
        }
      },
      error: (err) => {
        console.error('Error manufacturing product: ', err);
      },
    });
  }

  checkIfAllAggregatedProductsManufactured(): boolean {
    return this.rowData.every((product) => product.status === 'completed');
  }

  subtractMtrsFromCoil(mtrsToSubtract: number): void {
    this.loadedCoil.estMtrsRemaining -= mtrsToSubtract;
    this.loadedCoil.estMtrsRemaining = parseFloat(this.loadedCoil.estMtrsRemaining.toFixed(2));
  }

  onBtExport() {
    if (!this.gridApi) {
      console.warn('No gridApi');
      return;
    }

    const planName = this.productInformation.product.planName;
    const clientName = this.productInformation.clientName;
    const color: string = this.productInformation.product.color.color;
    const gauge: number = this.productInformation.product.gauge.gauge;
    const projectName: string = this.productInformation.projectName;
    let type: string = null;

    if (this.productInformation.product.planName === 'Sheets') {
      type =
        this.productInformation.product.profile +
        ' ' +
        this.productInformation.product.color.finish.name;
    }

    const processCellCallback = (params: ProcessCellForExportParams) => {
      if (params.column.getColDef().headerName === 'PICK') {
        return params.value === 'pickable' ? 'Yes' : 'No';
      } else if (params.column.getColDef().headerName === 'MANUFACTURED') {
        return '';
      } else {
        return params.value;
      }
    };

    const processHeaderCallback = (params: ProcessHeaderForExportParams) => {
      if (
        params.column.getColDef().headerName === 'MANUFACTURED' ||
        params.column.getColDef().field === 'frameNameOrig'
      ) {
        return '';
      }
      return params.column.getColDef().headerName;
    };

    this.gridApi.exportDataAsExcel({
      columnKeys: [
        'id',
        'stick',
        'stickType',
        'code',
        'length',
        'status',
        'steelCoilNumber',
        'wastage',
      ],
      processHeaderCallback: processHeaderCallback,
      processCellCallback: processCellCallback,
      appendContent: this.agGridExcelExportService.getAppendedRows(),
      prependContent: this.agGridExcelExportService.getPreAppendedRows(
        clientName,
        planName,
        color,
        gauge,
        type,
        projectName,
      ),
      fileName: planName + '_export.xlsx',
    });
  }
}
