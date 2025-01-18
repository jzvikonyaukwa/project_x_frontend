import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Quote } from '../../models/quote';
import {
  ColDef,
  GetRowIdParams,
  GridApi,
  GridOptions,
  GridReadyEvent,
  ValueFormatterParams,
} from 'ag-grid-enterprise';
import { AgGridModule } from 'ag-grid-angular';
import { ModalService } from '@shared/services/modal.service';
import {
  CustomPriceModalComponent,
  CustomPriceModalData,
} from '../../custom-price-modal/custom-price-modal.component';
import { PriceAndProductTypeDTO } from '../../models/priceAndProductTypeDTO';
import { QuotesService } from '../../services/quotes.service';
import { Subscription } from 'rxjs';
import { DeleteButtonAgGridComponent } from '@shared/components/delete-button-ag-grid/delete-button-ag-grid.component';
import { QuoteCalculationsService } from '../../services/quote-calculations.service';
import { COLUMN_DEFINITIONS } from 'app/utilities/ag-grid/column-definitions';
import { ProductSummaryInfo } from './models/ProductSummaryInfo';
import { EditButtonComponent } from 'app/utilities/ag-grid/edit-button/edit-button.component';
import { AccessButtonAgGridComponent } from 'app/utilities/ag-grid/access-button-ag-grid/access-button-ag-grid.component';
import { EmptyButtonComponent } from 'app/utilities/ag-grid/empty-button/empty-button.component';
import { environment } from '@environments/environment';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarModule } from '@angular/material/snack-bar';
import { CreateProductDTO } from '../add-product/models/createProductDTO';
import { AggregatedProduct } from 'app/modules/admin/aggregated-products/aggregatedProducts';
import { AddProductComponent } from '../add-product/add-product.component';
import { ProductDTO } from 'app/modules/admin/cutting-lists/models/productDTO';
import { ProductService } from 'app/modules/admin/product/product.service';
import getRowStyle from 'app/utilities/ag-grid/defaultRowStyle';
import { UserService } from 'app/core/user/user.service';

@Component({
  selector: 'app-products-on-quote-summary',
  standalone: true,
  imports: [CommonModule, AgGridModule, MatSnackBarModule],
  templateUrl: './products-on-quote-summary.component.html',
  styleUrls: ['./products-on-quote-summary.component.scss'],
})
export class ProductsOnQuoteSummaryComponent implements OnInit, OnDestroy {
  quote: Quote;
  getRowStyle = getRowStyle;
  private gridApi: GridApi;
  public rowData: ProductSummaryInfo[];
  public createProductSummaryDTOS: CreateProductDTO[];
  public defaultColDef: ColDef = COLUMN_DEFINITIONS;
  public columnDefs: ColDef[] = [
    { headerName: 'ID', field: 'cuttingListId', width: 50, maxWidth: 90 },
    {
      headerName: 'Status',
      tooltipField: 'status',
      field: 'status',
      width: 90,
      maxWidth: 200,
      valueGetter: (params) => {
        if (params.data.status && typeof params.data.status === 'string') {
          return params.data.status.charAt(0).toUpperCase() + params.data.status.slice(1);
        }
        return null;
      },
    },
    {
      field: 'planName',
      tooltipField: 'planName',
      width: 130,
      maxWidth: 200,
      valueGetter: (params) => {
        if (params.data.planName && typeof params.data.planName === 'string') {
          return params.data.planName.charAt(0).toUpperCase() + params.data.planName.slice(1);
        }
        return null;
      },
    },
    {
      headerName: 'Total Length',
      field: 'totalLength',
      width: 120,
      maxWidth: 200,
      cellClass: 'text-right',
      valueFormatter: (params: ValueFormatterParams<ProductSummaryInfo>) => {
        if (!params.value) return '';
        const formattedValue = new Intl.NumberFormat('en-US', {
          style: 'decimal',
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }) //
          .format(params.value);
        return `${formattedValue}m`;
      },
    },
    { field: 'color', tooltipField: 'color', width: 130, maxWidth: 200 },
    {
      field: 'gauge',
      width: 90,
      maxWidth: 120,
      cellClass: 'text-right',
      valueFormatter: (params: ValueFormatterParams<ProductSummaryInfo>) => {
        if (!params.value) return '';
        const formattedValue = new Intl.NumberFormat('en-US', {
          style: 'decimal',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }) //
          .format(params.value);
        return `${formattedValue}`;
      },
    },
    {
      field: 'width',
      width: 90,
      maxWidth: 120,
      cellClass: 'text-right',
      valueFormatter: (params) => {
        if (!params.value) return '';
        const formattedValue = new Intl.NumberFormat('en-US', {
          style: 'decimal',
        }) //
          .format(params.value);
        return `${formattedValue} mm`;
      },
    },
    {
      headerName: 'Cost per Meter',
      field: 'costPerMtr',
      width: 160,
      maxWidth: 180,
      cellClassRules: {
        'text-right': (params) => params.value != null,
        'text-center': (params) => !params.value,
      },
      valueFormatter: (params: ValueFormatterParams<ProductSummaryInfo>) => {
        if (!params.value && !this.checkIfProductsAreManufactured(params.data.cuttingListId)) {
          return 'NO STOCK';
        }
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(params.value);
      },
      cellStyle: (params) => {
        if (!params.value) {
          return { color: 'red', fontWeight: 'bold' };
        }
        return null; // No styling if value exists
      },
    },
    {
      headerName: 'Sell Price per Meter',
      field: 'sellPrice',
      width: 160,
      maxWidth: 180,
      cellClassRules: {
        'text-right': (params) => params.value != null,
        'text-center': (params) => !params.value,
      },
      valueFormatter: (params: ValueFormatterParams<ProductSummaryInfo>) => {
        if (!params.value && !this.checkIfProductsAreManufactured(params.data.cuttingListId)) {
          return 'NO STOCK';
        }
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(params.value);
      },
      cellStyle: (params) => {
        if (!params.value) {
          return { color: 'red', fontWeight: 'bold' };
        }
        return null;
      },
    },
    // {
    //   headerName: 'Subtotal',
    //   // headerName: 'Material Cost',
    //   // headerName: 'Cost for Total Length',
    //   field: 'totalCost',
    //   width: 100,
    //   maxWidth: 200,
    //   cellClass: (params) => (params?.value < 0 ? ['text-right', 'text-red-500'] : 'text-right'),
    //   valueFormatter: (params: ValueFormatterParams<ProductSummaryInfo>) => {
    //     if (!params.value) return '';
    //     return new Intl.NumberFormat('en-US', {
    //       style: 'currency',
    //       currency: 'USD',
    //     }).format(params.value);
    //   },
    // },
    // {
    //   headerName: 'Markup ($)',
    //   field: 'totalCost',
    //   width: 100,
    //   maxWidth: 200,
    //   cellClass: (params) => (params?.value < 0 ? ['text-right', 'text-red-500'] : 'text-right'),
    //   valueGetter: (params) => {
    //     if (params.data.totalCost) {
    //       return params.data.totalCost * (this.quote.quotePrice.markUp - 1);
    //     }
    //     return null;
    //   },
    //   valueFormatter: (params: ValueFormatterParams<ProductSummaryInfo>) => {
    //     if (!params.value) return '';
    //     return new Intl.NumberFormat('en-US', {
    //       style: 'currency',
    //       currency: 'USD',
    //     }).format(params.value);
    //   },
    // },
    {
      headerName: 'Subtotal',
      // headerName: 'Final Price',
      field: 'totalCost',
      width: 100,
      maxWidth: 200,
      cellClass: (params) => (params?.value < 0 ? ['text-right', 'text-red-500'] : 'text-right'),
      valueGetter: (params) => {
        if (params.data.totalLength && params.data.sellPrice) {
          return params.data.totalLength * params.data.sellPrice ;
        }
        return 0;
      },
      valueFormatter: (params: ValueFormatterParams<ProductSummaryInfo>) => {
        if (!params.value) return '';
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(params.value);
      },
    },
    {
      field: 'cuttingListId',
      width: 80,
      headerName: 'Edit Cost',
      maxWidth: 150,
      editable: false,
      cellRendererSelector: (params) => {
        // console.log('Edit Cost: ', params.data);
        const item = params.data;
        if (
          this.userCanOverideProductPrice ||
          !this.checkIfProductsAreManufactured(item.cuttingListId) ||
          !this.checkIfPriceBasedStock(item.cuttingListId) ||
          !item.costPerMtr ||
          !(item.totalCost !== 0)
        ) {
          return {
            component: EditButtonComponent,
          };
        }

        return {
          component: EmptyButtonComponent,
        };
      },
      cellRendererParams: {
        onClick: (cuttingListId: number) => this.launchPriceModal(cuttingListId),
      },
    },
    {
      field: 'cuttingListId',
      headerName: 'View/Edit',
      width: 80,
      maxWidth: 150,
      editable: false,
      cellRendererSelector: (params) => {
        if (this.checkIfCanDeleteOrEdit(params.data.cuttingListId)) {
          return {
            component: EmptyButtonComponent,
          };
        }
        return { component: AccessButtonAgGridComponent };
      },
      cellRendererParams: {
        onClick: (cuttingListId: number) => {
          this.accessProduct(cuttingListId);
        },
      },
    },
    {
      field: 'cuttingListId',
      headerName: 'Delete',
      width: 80,
      maxWidth: 150,
      editable: false,
      cellRendererSelector: (params) => {
        if (this.checkIfCanDeleteOrEdit(params.data.cuttingListId)) {
          return {
            component: EmptyButtonComponent,
          };
        }
        return { component: DeleteButtonAgGridComponent };
      },
      cellRendererParams: {
        onClick: (cuttingListId: string) => this.delete(+cuttingListId),
      },
    },
  ];

  gridOptions: GridOptions<ProductSummaryInfo> = {
    debug: !environment.production,
    animateRows: true,
    copyHeadersToClipboard: true,
    enableRangeSelection: true,
    overlayNoRowsTemplate: '<span class="no-rows">No Products To Show</span>',
    localeText: { noRowsToShow: 'No Products To Show' },
    getRowId: (params: GetRowIdParams<ProductSummaryInfo>) => {
      return params.data ? `${params.data.cuttingListId}` : '';
    },
  } as GridOptions<ProductSummaryInfo>;

  private readonly _snackBar = inject(MatSnackBar);
  private readonly modalService = inject(ModalService);
  private readonly productService = inject(ProductService);
  private readonly quoteCalculationsService = inject(QuoteCalculationsService);
  private readonly quoteService = inject(QuotesService);
  private readonly userService = inject(UserService);

  private changeQuoteStatusSubscription: Subscription;
  private currentQuoteSubscription: Subscription;
  private deleteACuttingListSubscription: Subscription;
  private getQuoteSubscription: Subscription;
  private updateCuttingListPriceSubscription: Subscription;
  private updateCuttingListSubscription: Subscription;
  private userSubscription: Subscription;

  constructor() {}

  ngOnInit(): void {
    this.currentQuoteSubscription = this.quoteService.currentQuote$.subscribe((quote) => {
      console.log('In CuttingListsSummaryComponent and quote = ', quote);
      this.quote = quote;
      if (quote) {
        this.rowData = this.createTableRows(quote);
        this.createProductSummaryDTOS = this.createProductSummary(quote);
        if (this.gridApi) {
          this.gridApi.updateGridOptions({ rowData: this.rowData });
        }
      }
    });
  }

  checkIfCanDeleteOrEdit(productId: number): boolean {
    return this.checkIfProductsAreManufactured(productId);
  }

  checkIfProductsAreManufactured(productDTOId: number): boolean {
    const productDTO: ProductDTO = this.quote.products.find(
      (productDTO) => productDTO.id === productDTOId,
    );

    let result = false;

    productDTO.aggregatedProducts.forEach((mp) => {
      if (mp.status === 'completed') {
        result = true;
      }
    });

    return result;
  }

  checkIfPriceBasedStock(productId: number): boolean {
    const product: ProductDTO = this.quote.products.find(
      (cuttingList) => cuttingList.id === productId,
    );

    if (!product) {
      console.error('No product found');
      return false;
    }

    if (!product.productPrice) {
      console.log('Product does not have a price');
      return false;
    }

    return product.productPrice?.pricingBasedStock;
    // return false;
  }

  launchPriceModal(productDTOId: number) {
    const productDTO: ProductDTO = this.quote.products.find((p) => p.id === productDTOId);

    const planName = productDTO.planName;

    const dialog = this.modalService.open<CustomPriceModalComponent>(CustomPriceModalComponent, {
      data: { planName: planName,gauge: productDTO.gauge,price:productDTO.sellPrice, color: productDTO.color,productType:productDTO.productType },
    });

    dialog.afterClosed().subscribe((customPriceModalData) => {
      this.updateCuttingWithNewDetails(customPriceModalData, productDTOId);
    });
  }

  updateCuttingWithNewDetails(customPriceModalData: CustomPriceModalData, productDTOId: number) {
    if (!customPriceModalData) {
      return;
    }

    const productDTO: ProductDTO = this.quote.products.find(
      (productDTO) => productDTO.id === productDTOId,
    );

    const priceAndProductTypeDTO: PriceAndProductTypeDTO = {
      cuttingListId: productDTOId,
      productTypeId: null,
      pricePerMeter: customPriceModalData.price,
      datePriceSet: customPriceModalData.dateSet,
      datePriceUpdated: customPriceModalData.dateSet,
      gauge: customPriceModalData.gauge,
    };

    this.updateCuttingListPriceSubscription = this.productService
      .updateProductPrice(priceAndProductTypeDTO)
      .subscribe({
        next: () => {
          this.getQuote(this.quote.id);
        },
        error: (errorResponse) => {
          const detailedErrorMessage =
            errorResponse instanceof HttpErrorResponse
              ? errorResponse.error.message || errorResponse.statusText
              : 'Unknown error';
          this._snackBar.open(`Error updating Product: ${detailedErrorMessage}`, null, {
            duration: environment.DEFAULT_SNACKBAR_TIMEOUT,
          } as MatSnackBarConfig);
          console.error('Error updating Product', errorResponse);
        },
      });
  }

  getQuote(id: number): void {
    this.getQuoteSubscription = this.quoteService.getQuote(id).subscribe({
      next: (quote) => {
        console.log('New quote from getQuote in the cuttingListSummary: ', quote);
      },
      error: (errorResponse) => {
        const detailedErrorMessage =
          errorResponse instanceof HttpErrorResponse
            ? errorResponse.error.message || errorResponse.statusText
            : 'Unknown error';
        this._snackBar.open(`Error getting Quote price: ${detailedErrorMessage}`, null, {
          duration: environment.DEFAULT_SNACKBAR_TIMEOUT,
        } as MatSnackBarConfig);
        console.error('Error getting Quote price', errorResponse);
      },
    });
  }

  onGridReady(params: GridReadyEvent<ProductSummaryInfo>) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
    params.api.setGridOption('domLayout', 'autoHeight');
  }

  createTableRows(quote: Quote): ProductSummaryInfo[] {
    this.rowData = [];

    const cuttingListsSummaryInfo: ProductSummaryInfo[] = [];

    quote.products.forEach((productDTO) => {
      const planType = productDTO.planName;
      const gauge = this.getGauge(productDTO);
      const totalLength = this.getProductTotalLength(productDTO);
      const costPerMtr = productDTO.costPrice;
      const totalCost = this.quoteCalculationsService.totalCostOfProduct(productDTO);

      const productSummaryInfoItem: ProductSummaryInfo = {
        cuttingListId: productDTO.id,
        planName: planType,
        status: productDTO.status,
        gauge,
        color: productDTO.color.color || '',
        totalLength,
        costPerMtr,
        totalCost,
        width: productDTO.width.width,
        targetDate: productDTO.targetDate,
        sellPrice: productDTO.sellPrice,
      };

      cuttingListsSummaryInfo.push(productSummaryInfoItem);
    });

    return cuttingListsSummaryInfo;
  }

  createProductSummary(quote: Quote): CreateProductDTO[] {
    const createProductSummary: CreateProductDTO[] = [];

    quote.products.forEach((productDTO) => {
      const createProductSummaryDTO: CreateProductDTO = {
        id: productDTO.id,
        targetDate: productDTO.targetDate,
        gauge: productDTO.gauge,
        color: productDTO.color || null,
        width: productDTO.width || null,
        profile: productDTO.profile,
        code: '',
        productType: productDTO.productType,
        frameType: productDTO.frameType,
        frameName: productDTO.frameName,
        totalLength: productDTO.totalLength,
        totalQuantity: productDTO.totalQuantity,
        aggregatedProducts: productDTO.aggregatedProducts.map((product: AggregatedProduct) => ({
          quantity: 1,
          length: product.length,
        })),
      };

      createProductSummary.push(createProductSummaryDTO);
    });

    return createProductSummary;
  }

  getGauge = (productDTO: ProductDTO): number => productDTO?.gauge?.gauge || 0;

  getCostPerMtr = (productDTO: ProductDTO): number => productDTO?.productPrice?.pricePerMeter || 0;

  getProductTotalLength(productDTO: ProductDTO): number {
    let totalLength = 0;
    productDTO.aggregatedProducts.forEach((aggregatedProduct) => {
      // TODO: check this
      totalLength += aggregatedProduct.length;
    });

    return Number(totalLength.toFixed(2));
  }

  accessProduct(productId: number): void {
    const rowSummary: CreateProductDTO = this.createProductSummaryDTOS.find((row) => {
      return row.id === productId;
    });

    // console.log(rowSummary);

    const row: ProductSummaryInfo = this.rowData.find((row) => {
      return row.cuttingListId === productId;
    });

    let dialog;

    dialog = this.modalService.open<AddProductComponent>(AddProductComponent, {
      data: { rowData: rowSummary, edit: true, type: row.planName },
    });

    dialog.afterClosed().subscribe((product: CreateProductDTO) => {
      if (!product) return;

      this.updateCuttingListSubscription = this.productService
        .updateProductV2(this.quote.id, product)
        .subscribe(() => {
          this.getQuote(this.quote.id);
        });
    });
  }

  delete(cuttingListId: number): void {
    this.deleteACuttingListSubscription = this.productService
      .deleteAProduct(cuttingListId)
      .subscribe({
        next: () => {
          console.log('Product deleted');
          if (this.quote.status === 'accepted') {
            this.changeQuoteStatusSubscription = this.quoteService
              .changeQuoteStatus(this.quote.id, 'draft')
              .subscribe({
                next: () => {
                  console.log('Quote status changed to draft');
                },
                error: (errorResponse) => {
                  const detailedErrorMessage =
                    errorResponse instanceof HttpErrorResponse
                      ? errorResponse.error.message || errorResponse.statusText
                      : 'Unknown error';
                  this._snackBar.open(
                    `Error changing Quote status to draft: ${detailedErrorMessage}`,
                    null,
                    {
                      duration: environment.DEFAULT_SNACKBAR_TIMEOUT,
                    } as MatSnackBarConfig,
                  );
                  console.error('Error changing Quote status to draft', errorResponse);
                },
              });
          }
          this.getQuote(this.quote.id);
        },
        error: (errorResponse) => {
          const detailedErrorMessage =
            errorResponse instanceof HttpErrorResponse
              ? errorResponse.error.message || errorResponse.statusText
              : 'Unknown error';
          this._snackBar.open(`Error deleting Product: ${detailedErrorMessage}`, null, {
            duration: environment.DEFAULT_SNACKBAR_TIMEOUT,
          } as MatSnackBarConfig);
          console.error('Error deleting Product', errorResponse);
        },
      });
  }

  ngOnDestroy(): void {
    this.currentQuoteSubscription?.unsubscribe();
    this.changeQuoteStatusSubscription?.unsubscribe();
    this.deleteACuttingListSubscription?.unsubscribe();
    this.getQuoteSubscription?.unsubscribe();
    this.updateCuttingListPriceSubscription?.unsubscribe();
    this.updateCuttingListSubscription?.unsubscribe();
    this.userSubscription?.unsubscribe();
  }

  get userCanOverideProductPrice(): boolean {
    return this.userService?.isSuperUser || false;
  }
}
