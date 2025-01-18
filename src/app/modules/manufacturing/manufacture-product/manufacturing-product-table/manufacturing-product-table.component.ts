import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridModule } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, ValueFormatterParams } from 'ag-grid-enterprise';
import { CUTTING_LIST_DEFAULT_COLS } from 'app/modules/admin/cutting-list/models/cutting-list-default-cols';
import { EmptyButtonComponent } from 'app/utilities/ag-grid/empty-button/empty-button.component';
import { ManufacturedButtonComponent } from 'app/utilities/ag-grid/manufactured-button/manufactured-button.component';
import { ProductDTO } from 'app/modules/admin/cutting-lists/models/productDTO';
import { ProductManufacturedDTO } from '../models/productManufacturedDTO';
import { SteelCoilDetailsDTO } from '@shared/models/steelCoilDetailsDTO';
import { MatButtonModule } from '@angular/material/button';
import { ProductInformation } from 'app/modules/admin/cutting-lists/models/cuttingListInformationDTO';
import { AgGridExcelExportService } from 'app/modules/admin/cutting-list/services/ag-grid-excel-export.service';
import { ProductService } from 'app/modules/admin/product/product.service';
import { StockOnHand } from 'app/modules/admin/stock/stock-on-hand/models/stock-on-hand';

@Component({
  selector: 'app-manufacturing-product-table',
  standalone: true,
  imports: [CommonModule, AgGridModule, MatButtonModule],
  templateUrl: './manufacturing-product-table.component.html',
  styleUrls: ['./manufacturing-product-table.component.scss'],
})
export class ManufacturingProductTableComponent implements OnChanges {
  @Input() productInformation: ProductInformation;
  @Input() loadedCoil: SteelCoilDetailsDTO;
  @Input() dateManufactured: string;

  @Output() fetchProduct = new EventEmitter<string>();

  rowData: ProductDTO[] = [];

  product: ProductDTO;
  public defaultColDef: ColDef = CUTTING_LIST_DEFAULT_COLS;
  public colDefs: ColDef[] = this.setColumnDefs();

  constructor(
    private productService: ProductService,
    private agGridExcelExportService: AgGridExcelExportService,
  ) {}

  private gridApi!: GridApi;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productInformation'] && changes['productInformation'].currentValue) {
      this.product = this.productInformation.product;
      this.updateGrid();
    }
  }

  private updateGrid() {
    this.setColumnDefs();
    this.rowData = [this.product];
    if (this.gridApi) {
      this.gridApi.setGridOption('rowData', this.rowData);
    }
  }

  setColumnDefs(): ColDef[] {
    return [
      { field: 'productType.name', headerName: 'Product Type', width: 100 },
      { field: 'frameName', headerName: 'Frame Name', width: 100 },
      { field: 'frameType', headerName: 'Frame Type', width: 100 },
      { field: 'totalLength', headerName: 'Total Length', width: 100 },
      { field: 'totalQuantity', headerName: 'Total Quantity', width: 100 },
      {
        field: 'status',
        headerName: 'Status',
        width: 100,
        valueFormatter: (params) => this.statusFormatter(params),
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
              this.productManufactured(params.data.id);
            }
          },
        },
        width: 150,
      },
    ];
  }

  statusFormatter(params: ValueFormatterParams) {
    if (params.value != null) {
      return params.value.toUpperCase();
    }
    return '';
  }

  productManufactured(id: number) {
    console.log('productManufactured: ', id);

    if (!id) {
      console.warn('No id provided');
      return;
    }

    if (!this.dateManufactured || !this.loadedCoil) {
      console.warn('No dateManufactured or loadedCoil provided');
      return;
    }

    if (this.loadedCoil.estMtrsRemaining < this.product.totalLength) {
      console.warn('Not enough mtrs remaining on steel coil');
      return;
    }

    const productManufacturedDetails: ProductManufacturedDTO = {
      productId: id,
      dateManufactured: this.dateManufactured,
      coilId: this.loadedCoil.steelCoilId,
    };

    console.log('productManufacturedDetails: ', productManufacturedDetails);

    this.productService.productManufactured(productManufacturedDetails).subscribe({
      next: (res) => {
        console.log('productManufactured: ', res);
        this.subtractMtrsFromCoil(this.product.totalLength);
        this.fetchProduct.emit('Fetch latest product');
      },
      error: (err) => {
        console.error('Error manufacturing product: ', err);
      },
    });
  }

  subtractMtrsFromCoil(mtrsToSubtract: number): void {
    this.loadedCoil.estMtrsRemaining -= mtrsToSubtract;
    this.loadedCoil.estMtrsRemaining = parseFloat(this.loadedCoil.estMtrsRemaining.toFixed(2));
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
    this.gridApi.addEventListener('gridPreDestroy', () => {
      // Perform any cleanup here
      this.gridApi = null;
    });
  }

  onBtExport() {
    if (!this.gridApi) {
      console.warn('No gridApi');
      return;
    }

    const planName = this.product.planName;
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

    this.gridApi.setGridOption('columnDefs', [
      ...this.gridApi.getColumnDefs(),
      {
        field: 'frameName',
        width: 120,
        headerName: 'FRAME NAME',
        hide: true,
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
    ]);

    this.agGridExcelExportService.exportGroupRowData(
      this.gridApi,
      planName,
      clientName,
      color,
      gauge,
      type,
      projectName,
    );
  }
}
