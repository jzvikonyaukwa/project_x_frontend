import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ProductStatus } from '@shared/enums/product-status';
import { ProductInformation } from '../cutting-lists/models/cuttingListInformationDTO';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FuseCardComponent } from '@fuse/components/card';
import { ProductService } from '../product/product.service';
import { SteelCoilDetailsDTO } from '@shared/models/steelCoilDetailsDTO';
import { StockOnHandService } from '../stock/stock-on-hand/services/stock-on-hand.service';
import { MadeProduct } from '../stock/models/madeProduct';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CoilNumberInputModalComponent } from '../cutting-lists/coil-number-input-modal/coil-number-input-modal.component';
import { PickedStockPostDTO } from '../stock/models/pickedStockPostDTO';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { MatInputModule } from '@angular/material/input';
import { SharedModule } from '@shared/shared.module';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { formatDate } from '@shared/utils/format-date';
import { ProductsTableComponent } from './products-table/products-table.component';
import { DisplayAlert } from './models/displayAlert';
import { ProductDataService } from './services/product-data.service';
import { Subject, takeUntil } from 'rxjs';
import { AggregatedProduct } from '../aggregated-products/aggregatedProducts';

@Component({
  selector: 'app-cutting-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    FuseCardComponent,
    MatDialogModule,
    MatSlideToggleModule,
    MatButtonToggleModule,
    FuseAlertComponent,
    MatInputModule,
    SharedModule,
    ProductsTableComponent,
  ],
  templateUrl: './cutting-list.component.html',
  providers: [DatePipe],
})
export class CuttingListComponent implements OnInit, OnDestroy {
  @ViewChild('exportable', { static: false }) cuttingListExportEl: ElementRef;
  @Input() productId: number;
  @Input() manufacture: boolean;
  @Input() loadedCoil: SteelCoilDetailsDTO;
  @Input() isFromBoard = false;
  @Output() cuttingListCompleted: EventEmitter<boolean> = new EventEmitter<boolean>(); //IS this used??
  @Output() manufacturedOnChanged: EventEmitter<Date> = new EventEmitter<Date>(); //IS this used??

  productInformation: ProductInformation;

  selectedToggle = 'product';

  public readonly CUTTING_LIST_STATUSES = ProductStatus;

  status: ProductStatus;

  editStatus = false;

  cuttingListIsComplete: boolean = false;

  // Set to null after devving
  selectedDate: string;

  // productsInStockOnHand: MadeProduct[] = [];
  // remainingStockOnHand: MadeProduct[] = [];
  pickable: boolean = false;
  isGrouped: boolean = false;

  showAlert = false;
  alert: { type: FuseAlertType; message: string } = {
    type: 'success',
    message: '',
  };

  isProcessing = false;

  private destroyed = new Subject();

  constructor(
    private cuttingListService: ProductService,
    private cuttingListDataService: ProductDataService,
    private stockOnHandService: StockOnHandService,
    private dialog: MatDialog,
    private datePipe: DatePipe,
  ) {}

  ngOnInit(): void {
    this.cuttingListDataService.fetchCuttingListInformation(this.productId);

    this.cuttingListDataService.product$
      .pipe(takeUntil(this.destroyed))
      .subscribe((productInformation: ProductInformation) => {
        if (productInformation) {
          console.log('product list received from cuttingListDataService: ', productInformation);
          this.productInformation = productInformation;
          this.getProductInStockOnHand();
        }
      });
  }

  // TODO:: needs to be check inventory stock on hand
  getProductInStockOnHand() {
    // this.stockOnHandService
    //   .getStockOnHandForPlanName(this.productInformation.product)
    //   .pipe(takeUntil(this.destroyed))
    //   .subscribe({
    //     next: (data: MadeProduct[]) => {
    //       this.productsInStockOnHand = [...data];
    //       this.remainingStockOnHand = [...data];
    //     },
    //     error: (err) => {
    //       console.error('Error fetching stock on hand: ', err);
    //     },
    //   });
  }

  onToggleChange(event: MatButtonToggleChange): void {
    const selectedValue = event.value;
    console.log('selectedValue: ', selectedValue);
    this.selectedToggle = selectedValue;
    this.getProductInStockOnHand();
  }

  changeToCompleted() {
    this.cuttingListService
      .changeProductStatus(this.productInformation.product.id, ProductStatus.COMPLETED)
      .pipe(takeUntil(this.destroyed))
      .subscribe(() => {
        this.productInformation.product.status = ProductStatus.COMPLETED;
        this.cuttingListCompleted.emit(true);
      });
  }

  checkSteelCoilLengthIsEnough(totalMtrsNeeded: number): boolean {
    if (totalMtrsNeeded > this.loadedCoil.estMtrsRemaining) {
      this.displayAlert('warning', 'Not enough meters on coil to manufacture.');

      console.log('ERROR: Not enough meters on coil to manufacture group of products');
      return false;
    } else {
      console.log('Enough meters on coil to manufacture group of products');
      return true;
    }
  }

  productPicked(manufacturedProductId: number): void {
    const aggregatedProduct: AggregatedProduct =
      this.productInformation.product.aggregatedProducts.find(
        (product) => product.id === manufacturedProductId,
      );

    if (!aggregatedProduct) return;

    const dialogRef = this.dialog.open(CoilNumberInputModalComponent, {
      width: '30vw',
    });

    dialogRef.afterClosed().subscribe((coilNumber) => {
      if (!coilNumber) {
        aggregatedProduct.status = 'scheduled';

        const updatedProduct: AggregatedProduct = { ...aggregatedProduct };
        updatedProduct.status = 'scheduled';
        // updatedProduct.manufacturedOn = this.selectedDate;
        const tx = {
          update: [updatedProduct],
        };

        // TODO: FIX THIS
        // this.gridApi.applyTransaction(tx);
        // this.gridApi.redrawRows();
        this.reloadGrid();
        return;
      }

      const pickedPorduct: PickedStockPostDTO = {
        coilNumber: coilNumber,
        aggregateProduct: aggregatedProduct,
      };

      // this.cuttingListIsComplete = this.utlisService.checkIfCuttingListIsCompleted(
      //   this.manufacturedProducts,
      // );

      // this.stockOnHandService.productPicked(pickedPorduct).subscribe((data: PickedStockPostDTO) => {
      //   const updatedProduct: AggregatedProduct = { ...aggregatedProduct };
      //   updatedProduct.status = 'picked';
      //   const tx = {
      //     update: [updatedProduct],
      //   };
      //   // TODO: FIX THIS
      //   // this.gridApi.applyTransaction(tx);
      //   // this.gridApi.redrawRows();
      //   // this.getCuttingList();
      // });
    });
  }

  getStatusClass(): string {
    const baseClasses = 'text-lg font-medium';
    const status = this.productInformation.product.status;

    switch (status) {
      case 'completed':
        return `${baseClasses} text-green-500`;
      case 'in-progress':
        return `${baseClasses} text-orange-500`;
      case 'scheduled':
        return `${baseClasses} text-gray-500`;
      default:
        return `${baseClasses} text-axe-dark-blue`;
    }
  }

  getMtrsRemainingClass(): string {
    if (this.loadedCoil.estMtrsRemaining <= 10) {
      return 'text-red-500';
    }
    return 'text-axe-dark-blue';
  }

  displayAlert(type: FuseAlertType, message: string): void {
    this.showAlert = true;
    this.alert = {
      type: type,
      message: message,
    };
  }

  reloadGrid(): void {
    this.getProductInStockOnHand();
  }

  initiateDisplayAlert(alert: DisplayAlert) {
    console.log('Parent received alert: ', alert);
    this.displayAlert(alert.type, alert.message);
  }

  onDateChange(event: MatDatepickerInputEvent<Date>): void {
    this.selectedDate = this.datePipe.transform(event.value, 'yyyy-MM-ddTHH:mm:ss');
    this.selectedDate = formatDate(this.selectedDate);
  }

  ngOnDestroy(): void {
    this.destroyed.next(true);
    this.destroyed.complete();
  }
}
