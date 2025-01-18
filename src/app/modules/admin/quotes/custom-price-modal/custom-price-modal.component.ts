import { Component,  Inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Color } from '@shared/models/color';
import { Gauge } from '@shared/models/gauge';
import { ProductType } from '../../product-types/models/productType';
import { ProductPrice } from '../../cutting-lists/models/productPrice';

@Component({
  selector: 'app-custom-price-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatInputModule,
    MatDialogModule,
    MatButtonModule,
  ],
  templateUrl: './custom-price-modal.component.html',
  styleUrls: ['./custom-price-modal.component.scss'],
})
export class CustomPriceModalComponent implements OnInit, OnDestroy {
  public customerPriceForm: FormGroup = this.fb.group({
    price: [null, [Validators.required, Validators.min(0)]],
  });



  constructor(
    private dialogRef: MatDialogRef<CustomPriceModalComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { planName: string,  gauge: Gauge; color: Color, productType:ProductType,price :number  },
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.customerPriceForm.patchValue({
      price: this.data.price,
    });
  }

  onSubmit() {
    const customPriceModalData: CustomPriceModalData = {
      productType: this.data.productType,
      color: this.data.color,
      gauge: this.data.gauge,
      price: this.customerPriceForm.get('price').value,
      dateSet: new Date(),
    };

    console.log(customPriceModalData);
    this.dialogRef.close(customPriceModalData);
  }

  public closeDialog(): void {}

  ngOnDestroy(): void {

  }
}

export interface CustomPriceModalData {
  productType: ProductType;
  dateSet: Date;
  gauge: Gauge;
  price: number;
  color: Color;
}
