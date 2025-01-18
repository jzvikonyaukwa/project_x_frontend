import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { SteelCoilDetailsDTO } from '../../../../shared/models/steelCoilDetailsDTO';
import { MatSelectModule } from '@angular/material/select';
import { ProductForStockOnHandDTO } from '@shared/models/productForStockOnHandDTO';
import { StockOnHandService } from '../../../admin/stock/stock-on-hand/services/stock-on-hand.service';
import { ProductInStock } from '../../../admin/stock/models/productInStock';
import { ProductTypesService } from 'app/modules/admin/product-types/services/product-types.service';
import { ProductType } from 'app/modules/admin/product-types/models/productType';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-add-product-to-stock-on-hand-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './add-product-to-stock-on-hand-modal.component.html',
})
export class AddProductToStockOnHandModalComponent {
  productForm: FormGroup = this.fb.group({
    productName: ['', Validators.required],
    length: ['', Validators.required],
  });

  productTypes$: Observable<ProductType[]> = this.productTypesService.getAllProductTypes();

  constructor(
    public dialogRef: MatDialogRef<AddProductToStockOnHandModalComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public loadedCoil: SteelCoilDetailsDTO,
    private stockOnHandService: StockOnHandService,
    private productTypesService: ProductTypesService,
  ) {}

  public onSubmit(productForm: FormGroup): void {
    const product: ProductForStockOnHandDTO = productForm.value;
    product.steelCoilId = this.loadedCoil.steelCoilId;
    console.log('product: ', product);

    this.stockOnHandService
      .addProductToStockOnHand(product)
      .subscribe((product: ProductInStock) =>
        console.log('product add to stock on hand = ', product),
      );

    this.dialogRef.close(product);
  }

  onDialogClose(): void {
    this.dialogRef.close();
  }
}
