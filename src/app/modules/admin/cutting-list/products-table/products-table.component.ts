import {
  Component,
  effect,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridModule } from 'ag-grid-angular';
import {
  GridApi,
  ColDef,
  ValueFormatterParams,
  GridReadyEvent,
  GetRowIdFunc,
  GetRowIdParams,
  ExcelStyle,
  ExcelExportParams,
} from 'ag-grid-enterprise';
import { CUTTING_LIST_DEFAULT_COLS } from '../models/cutting-list-default-cols';
import { EXCEL_STYLES } from '../models/excelStyles';
import { createProductColDefs } from '../models/individual-grid-column-defs';
import { ProductInformation } from '../../cutting-lists/models/cuttingListInformationDTO';
import { AgGridExcelExportService } from '../services/ag-grid-excel-export.service';
import { GroupedSheetMPs } from '../models/groupedSheetProducts';
import { createGroupedColDefsForSheets } from '../models/grouped-grid-column-defs-sheets';
import { GroupedFramecadMPs } from '../models/groupedFramecadManufacturedProducts';
import { createGroupedColDefsForFramecad } from '../models/grouped-grid-column-defs-framcad';
import { CuttingListUtilsService } from '../services/cutting-list-utils.service';
import { MadeProduct } from '../../stock/models/madeProduct';
import { ManufacturedProductFlatMapped } from '../models/manufactured-products-flatmapped';
import { SteelCoilDetailsDTO } from '@shared/models/steelCoilDetailsDTO';
import { ProductManufacturedDTO } from '../../../manufacturing/manufacture-product/models/productManufacturedDTO';
import { CuttingListStatusService } from '../services/cutting-list-status.service';
import { DisplayAlert } from '../models/displayAlert';
import { FuseAlertType } from '@fuse/components/alert';
import { ManufacturedResponse } from '../models/manufacturedResponse';
import { ManufacturingService } from '../../cutting-lists/services/manufacturing.service';
import { ProductDataService } from '../services/product-data.service';
import { Subscription } from 'rxjs';
import { AlertService } from '../services/alert-cutting-list.service';
import { CuttingListManufacturingService } from '../services/cutting-list-manufacturing.service';
import { ManufacturingValidationService } from '../services/manufacturing-validation.service';
import { ProductDTO } from '../../cutting-lists/models/productDTO';

@Component({
  selector: 'app-products-table',
  standalone: true,
  imports: [CommonModule, AgGridModule],
  templateUrl: './products-table.component.html',
  styleUrls: ['./products-table.component.scss'],
})
export class ProductsTableComponent implements OnInit, OnChanges, OnDestroy {
  @Input() manufacture: boolean;
  @Input() selectedToggle = 'productParts';
  @Input() loadedCoil: SteelCoilDetailsDTO;
  @Input() selectedDate: string;

  @Output() initiateDisplayAlert = new EventEmitter<DisplayAlert>();

  cuttingList: ProductInformation;

  cuttingListId: number;
  public products: ProductDTO;
  public individualRowData: ManufacturedProductFlatMapped[];

  rowData: GroupedFramecadMPs[] | GroupedSheetMPs[] | ManufacturedProductFlatMapped = [];
  remainingStockOnHand: MadeProduct[] = [];

  isProcessing = false;

  public defaultColDef: ColDef = CUTTING_LIST_DEFAULT_COLS;
  public excelStyles: ExcelStyle[] = EXCEL_STYLES;

  public columnDefs: ColDef[];
  private gridApi!: GridApi;

  private currentPage: number = 0;

  public defaultExcelExportParams: ExcelExportParams = {
    allColumns: true,
  };

  private subscription: Subscription = new Subscription();

  constructor(
    private agGridExcelExportService: AgGridExcelExportService,
    private cuttingListUtilsService: CuttingListUtilsService,
    private productDataService: ProductDataService,
    private cuttingListStatusService: CuttingListStatusService,
    private manufacturingService: ManufacturingService,
    private alertService: AlertService,
    private cuttingListManufacturingService: CuttingListManufacturingService,
    private manufacturingValidationService: ManufacturingValidationService,
  ) {
    effect(
      () => {
        const alert = this.alertService.alert$();
        if (alert) {
          this.initiateDisplayAlert.emit(alert);
          this.alertService.clearAlert();
        }
      },
      { allowSignalWrites: true },
    );
  }

  ngOnInit(): void {
    this.subscription.add(
      this.productDataService.product$.subscribe((productInformation) => {
        if (productInformation) {
          this.cuttingList = productInformation;
          this.products = this.cuttingList.product;
          this.cuttingListId = this.cuttingList.product.id;
          this.updateGrid();
        }
      }),
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.selectedToggle && changes.selectedToggle.currentValue) {
      this.updateGrid();
    }

    if (changes.loadedCoil && changes.loadedCoil.currentValue) {
      this.loadedCoil = changes.loadedCoil.currentValue;
    }

    if (changes.selectedDate && changes.selectedDate.currentValue) {
      this.selectedDate = changes.selectedDate.currentValue;
    }
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
    this.gridApi.addEventListener('gridPreDestroy', () => {
      // Perform any cleanup here
      this.gridApi = null;
    });
    this.updateGrid();
  }

  private updateGrid() {
    if (this.gridApi) {
      console.log('Grid API is ready');
      this.setColumnDefs();
      this.clearRowData();
      this.updateRowData();
      this.redrawAndResizeGrid();
      this.goToCurrentPage();
    } else {
      console.log('Grid API not ready');
      this.setColumnDefsForIndividual();
      this.setIndividualRowData();
    }
  }

  private setIndividualRowData() {
    if (!this.products) {
      console.log('No manufactured products');
      return;
    }
    this.individualRowData = this.cuttingListUtilsService.addPickableToData(
      this.products,
      this.remainingStockOnHand,
    );
  }

  private setColumnDefs() {
    const colDefs =
      this.selectedToggle !== 'product'
        ? createProductColDefs(
            this.manufacture,
            this.statusFormatter.bind(this),
            this.productPicked.bind(this),
            this.aggregateProductManufactured.bind(this),
          )
        : this.getGroupedColumnDefs();

    this.gridApi.setGridOption('columnDefs', colDefs);
  }

  private getGroupedColumnDefs(): ColDef[] {
    if (this.cuttingList.product.planName === 'Sheets') {
      return createGroupedColDefsForSheets(
        this.manufacture,
        this.statusFormatter.bind(this),
        this.productPicked.bind(this),
        this.manufactureGroupSheetsProducts.bind(this),
      );
    } else {
      return createGroupedColDefsForFramecad(
        this.manufacture,
        this.statusFormatter.bind(this),
        this.productPicked.bind(this),
        this.manufactureProduct.bind(this),
      );
    }
  }

  private redrawAndResizeGrid() {
    console.log('Redrawing and resizing grid');
    this.gridApi.redrawRows();
    this.gridApi.sizeColumnsToFit();
  }

  private goToCurrentPage() {
    if (this.currentPage !== undefined) {
      this.gridApi.paginationGoToPage(this.currentPage);
    }
  }

  private clearRowData() {
    this.gridApi.setGridOption('rowData', []);
  }

  private updateRowData() {
    console.log('Updating Row Data');
    const rowData =
      this.selectedToggle === 'productParts'
        ? this.getIndividualRowData()
        : this.getGroupedData();
    this.gridApi.setGridOption('rowData', rowData);
  }

  private getIndividualRowData() {
    return this.cuttingListUtilsService.addPickableToData(this.products, this.remainingStockOnHand);
  }

  private getGroupedData(): GroupedFramecadMPs[] | GroupedSheetMPs[] {
    if (this.cuttingList.product.planName === 'Sheets') {
      return this.groupRoofSheetsProducts(this.products);
    } else {
      return this.groupFramecadDesignedProducts(this.products);
    }
  }

  groupRoofSheetsProducts(products: ProductDTO): GroupedSheetMPs[] {
    return this.cuttingListUtilsService.groupRoofSheetProducts(products, this.remainingStockOnHand);
  }

  groupFramecadDesignedProducts(products: ProductDTO): GroupedFramecadMPs[] {
    return this.cuttingListUtilsService.groupFramecadDesignedProducts(
      products,
      this.remainingStockOnHand,
    );
  }

  statusFormatter(params: ValueFormatterParams) {
    if (params.value != null) {
      return params.value.toUpperCase();
    }
    return '';
  }

  onPaginationChanged(): void {
    if (!this.gridApi) return;
    this.currentPage = this.gridApi.paginationGetCurrentPage();
  }

  public getRowId: GetRowIdFunc = (params: GetRowIdParams) => {
    return params.data.id;
  };

  private setColumnDefsForIndividual() {
    this.columnDefs = createProductColDefs(
      this.manufacture,
      this.statusFormatter.bind(this),
      this.productPicked.bind(this),
      this.aggregateProductManufactured.bind(this),
    );
  }

  productPicked(manufacturedProductId: number): void {
    console.log('Product Picked', manufacturedProductId);
  }

  aggregateProductManufactured(productId: number): void {
    const product = this.individualRowData.find((p) => p.id === productId);

    const checksSuccessful = this.manufacturingValidationService.validateAggregManuProdAllChecks(
      this.loadedCoil,
      this.selectedDate,
      product,
      this.loadedCoil.estMtrsRemaining,
    );

    if (!checksSuccessful || this.isProcessing) return;

    this.isProcessing = true;

    this.cuttingListManufacturingService
      .aggregateProductManufactured(productId, this.loadedCoil, this.selectedDate)
      .subscribe({
        next: (result) => {
          if (result !== null) {
            this.subtractMtrsFromCoil(result);
          }
        },
        complete: () => {
          this.isProcessing = false;
        },
      });
  }

  manufactureGroupSheetsProducts(groupedData: GroupedSheetMPs): void {
    console.log('manufactureGroupSheetsProducts', groupedData);

    if (this.isProcessing) return;
    this.isProcessing = true;

    const lengthOfASheet: number = groupedData.length;

    console.log('lengthOfASheet', lengthOfASheet);

    const productsToManufacture = this.manufacturingService.getProductsToManufactureFromLength(
      lengthOfASheet,
      this.products,
    );

    console.log('productsToManufacture', productsToManufacture);

    if (productsToManufacture.length === 0) {
      this.notifyParentToDisplayAlert(
        'warning',
        'Error occurred, I am unable to find products to manufacture.',
      );
      this.isProcessing = false;
      return;
    }

    const totalMtrsNeeded: number = this.manufacturingService.getTotalMtrsNeeded(this.products);

    console.log('totalMtrsNeeded', totalMtrsNeeded);
    const checksSuccessful = this.manufacturingValidationService.validateGroupedProductsAllChecks(
      this.loadedCoil,
      this.selectedDate,
      totalMtrsNeeded,
    );

    if (!checksSuccessful) return;

    const groupedProductsToManufacturedDTO: ProductManufacturedDTO[] =
      this.manufacturingService.getGroupProductsDTO(
        this.products,
        this.loadedCoil.steelCoilId,
        this.selectedDate,
      );

    console.log('groupedProductsToManufacturedDTO', groupedProductsToManufacturedDTO);

    this.cuttingListManufacturingService
      .manufactureGroupProductsSheets(groupedProductsToManufacturedDTO)
      .subscribe({
        next: (response: ManufacturedResponse) => {
          this.notifyParentToDisplayAlert(
            'success',
            response.message +
              '. ' +
              response.numberOfProductsProcessed +
              ' products manufactured' +
              ' in ' +
              (response.processingTimeMillis / 1000).toFixed(2) +
              ' milliseconds',
          );

          console.log('Successfully manufactured group of products: ', response);

          this.cuttingListStatusService.handleGroupedSheetsManufacturedSuccess(
            groupedProductsToManufacturedDTO,
          );

          this.subtractMtrsFromCoil(totalMtrsNeeded);
        },
        error: (err) => {
          console.error('Error manufacturing group of products: ', err);
          this.notifyParentToDisplayAlert('warning', err.error.message);
        },
        complete: () => {
          this.isProcessing = false;
        },
      });
  }

  manufactureProduct(groupData: GroupedFramecadMPs): void {
    const totalMtrsNeeded: number = groupData.lengthRemaining;

    const checksSuccessful = this.manufacturingValidationService.validateGroupedProductsAllChecks(
      this.loadedCoil,
      this.selectedDate,
      totalMtrsNeeded,
    );

    if (!checksSuccessful || this.isProcessing) return;

    const dto: ProductManufacturedDTO = {
      productId: groupData.id,
      coilId: this.loadedCoil.steelCoilId,
      dateManufactured: this.selectedDate,
    };

    this.isProcessing = true;

    this.cuttingListManufacturingService.persistManufacturedProduct(dto).subscribe({
      next: (result) => {
        if (result !== null) {
          this.subtractMtrsFromCoil(result);

          // this.cuttingList.cuttingList.manufacturedProducts.forEach((mp) => {
          //   if (mp.id === groupData.mp.id) {
          //     mp.aggregatedManufacturedProducts.forEach((amp) => {
          //       amp.status = 'completed';
          //     });
          //     mp.status = 'completed';
          //   }
          // });

          this.cuttingListStatusService.updateManufacturedProductInCuttingList(groupData.mp.id);

          this.updateGrid();
        }
      },
      complete: () => {
        this.isProcessing = false;
      },
    });
  }

  subtractMtrsFromCoil(mtrsToSubtract: number): void {
    this.loadedCoil.estMtrsRemaining -= mtrsToSubtract;
    this.loadedCoil.estMtrsRemaining = parseFloat(this.loadedCoil.estMtrsRemaining.toFixed(2));
  }

  notifyParentToDisplayAlert(type: string, message: string) {
    console.log('notifyParentToDisplayAlert - Display Alert: ', type, message);
    const displayAlert: DisplayAlert = {
      type: type as FuseAlertType,
      message: message,
    };
    this.initiateDisplayAlert.emit(displayAlert);
  }

  lastRowBorder(params) {
    if (params.node.rowIndex % 2 !== 0) {
      return {
        'background-color': '#EFF7FC',
      };
    } else {
      return {
        'background-color': '#FFFFFF',
      };
    }
  }

  onBtExport() {
    const planName = this.cuttingList.product.planName;
    const clientName = this.cuttingList.clientName;
    const color: string = this.cuttingList.product.color.color;
    const gauge: number = this.cuttingList.product.gauge.gauge;
    const projectName: string = this.cuttingList.projectName;
    let type: string = null;

    if (this.cuttingList.product.planName === 'Sheets') {
      type = this.cuttingList.product.profile + ' ' + this.cuttingList.product.color.finish.name;
    }

    this.gridApi.setGridOption('columnDefs', [
      ...this.gridApi.getColumnDefs(),
      {
        field: 'frameNameOrig',
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

    if (this.selectedToggle === 'Manufactured Parts') {
      this.agGridExcelExportService.exportIndividulaGroupedRowData(
        this.gridApi,
        planName,
        clientName,
        color,
        gauge,
        type,
        projectName,
      );
    } else {
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

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
