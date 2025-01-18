import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { SteelCoilDetailsDTO } from '@shared/models/steelCoilDetailsDTO';
import { MatIconModule } from '@angular/material/icon';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { ProductDataService } from 'app/modules/admin/cutting-list/services/product-data.service';
import { ProductInformation } from 'app/modules/admin/cutting-lists/models/cuttingListInformationDTO';
import { Subject, takeUntil } from 'rxjs';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { ManufacturingProductTableComponent } from './manufacturing-product-table/manufacturing-product-table.component';
import { ProductDTO } from 'app/modules/admin/cutting-lists/models/productDTO';
import { ManufacturingAggregatedProductsTableComponent } from './manufacturing-aggregated-products-table/manufacturing-aggregated-products-table.component';
import { StockOnHandService } from 'app/modules/admin/stock/stock-on-hand/services/stock-on-hand.service';
import { StockOnHand } from 'app/modules/admin/stock/stock-on-hand/models/stock-on-hand';

@Component({
  selector: 'app-manufacture-product',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    ProductDetailsComponent,
    MatButtonToggleModule,
    MatDialogModule,
    FuseAlertComponent,
    MatDatepickerModule,
    MatInputModule,
    ManufacturingProductTableComponent,
    ManufacturingAggregatedProductsTableComponent,
  ],
  providers: [DatePipe],
  templateUrl: './manufacture-product.component.html',
  styleUrls: ['./manufacture-product.component.scss'],
})
export class ManufactureProductComponent implements OnInit {
  productId: number;
  manufacture: boolean;
  loadedCoil: SteelCoilDetailsDTO;

  productInformation: ProductInformation;
  manufactureProductDetails: Partial<ProductDTO>;

  stockOnHandForProductType: StockOnHand[];

  selectedToggle = 'product';
  selectedDate: string;

  showAlert = false;
  alert: { type: FuseAlertType; message: string } = {
    type: 'success',
    message: '',
  };
  private destroyed = new Subject();

  title = 'ManufactureProduct';

  constructor(
    public dialogRef: MatDialogRef<ManufactureProductComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      product: number;
      manufacture: boolean;
      loadedCoil: SteelCoilDetailsDTO;
    },
    private productDataService: ProductDataService,
    private datePipe: DatePipe,
    private stockOnHandService: StockOnHandService,
  ) {
    this.productId = data.product;
    this.manufacture = data.manufacture;
    this.loadedCoil = data.loadedCoil;
    console.log('loadedCoil: ', this.loadedCoil);
  }

  ngOnInit(): void {
    this.productDataService.fetchCuttingListInformation(this.productId);

    this.productDataService.product$
      .pipe(takeUntil(this.destroyed))
      .subscribe((productInformation: ProductInformation) => {
        if (productInformation) {
          console.log('product list received from cuttingListDataService: ', productInformation);
          this.productInformation = productInformation;
          this.getStockOnHandForProductType();
        }
      });
  }

  getStockOnHandForProductType(): void {
    const productType = this.productInformation.product.productType.name;
    const color = this.productInformation.product.color.color;
    const gauge = this.productInformation.product.gauge.gauge;

    this.stockOnHandService
      .getStockOnHandForProductType(productType, color, gauge)
      .subscribe((stockOnHand: StockOnHand[]) => {
        this.stockOnHandForProductType = stockOnHand;
        console.log('stockOnHand: ', stockOnHand);
      });
  }

  onToggleChange(event: MatButtonToggleChange): void {
    const selectedValue = event.value;

    if (selectedValue === 'productParts') {
      this.title = 'Manufacture Product Parts';
    } else {
      this.title = 'Manufacture Product';
    }

    this.selectedToggle = selectedValue;
    // this.getProductInStockOnHand();
  }

  onDateChange(event: MatDatepickerInputEvent<Date>): void {
    this.selectedDate = this.datePipe.transform(event.value, 'yyyy-MM-ddTHH:mm:ss');

    //  formatDate(this.selectedDate);
    this.selectedDate = new Date(this.selectedDate).toISOString();
  }

  fetchProduct(event: string): void {
    console.log('fetchProduct: ', event);
    this.productDataService.fetchCuttingListInformation(this.productId);
  }

  onDialogClose() {
    this.dialogRef.close(true);
  }
}
