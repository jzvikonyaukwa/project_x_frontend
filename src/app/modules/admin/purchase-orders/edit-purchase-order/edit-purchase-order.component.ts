import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioChange, MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { Color } from '@shared/models/color';
import { Finish } from '@shared/models/finish';
import { Gauge } from '@shared/models/gauge';
import { Observable, tap } from 'rxjs';
import { ColorsService } from '@shared/services/colors.service';
import { FinishesService } from '@shared/services/finishes.service';
import { GaugesService } from '@shared/services/gauges.service';
import { SupplierService } from '../../suppliers/services/supplier.service';
import { PurchaseOrderService } from '../services/purchase-order.service';
import { ActivatedRoute, Router } from '@angular/router';
import { WidthService } from '@shared/services/width.service';
import { PurchaseOrder } from '../models/purchaseOrders';
import { formatDate } from '@shared/utils/format-date';
import { PageHeadingComponent } from '@layout/common/page-heading/page-heading.component';
import { FuseCardComponent } from '@fuse/components/card';
import { Supplier } from '../../suppliers/models/supplier';
import { Coatings } from '@shared/enums/coatings';
import { IsqGrades } from '@shared/enums/isq-grades';
import { Width } from '@shared/models/width';
import { Consumable } from '../../consumables/models/consumable';
import { ConsumablesService } from '../../consumables/services/consumables.service';
import { PurchaseOrderPostDTO } from '../models/purchaseOrderPostDTO';

@Component({
  selector: 'app-edit-purchase-order',
  standalone: true,
  imports: [
    CommonModule,
    PageHeadingComponent,
    FuseCardComponent,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatRadioModule,
  ],
  templateUrl: './edit-purchase-order.component.html',
})
export class EditPurchaseOrderComponent implements OnInit {
  public readonly ISQ_GRADES = Object.values(IsqGrades);
  public readonly COATINGS = Object.values(Coatings);

  private purchaseOrder: PurchaseOrder;

  suppliers$: Observable<Supplier[]> = this.supplierService.getAllSuppliers();

  consumables$: Observable<Consumable[]> = this.consumablesService.getAllConsumables();

  colors: Color[];
  colors$: Observable<Color[]> = this.colorsService
    .getAllColors()
    .pipe(tap((colors) => (this.colors = colors)));

  finishes: Finish[];
  finishes$: Observable<Finish[]> = this.finishesService.getAllFinishes().pipe(
    tap((finishes) => {
      this.finishes = finishes;
      console.log('Finishes = ', finishes);
    }),
  );
  width$: Observable<Width[]> = this.widthService.getAllWidths();

  gauages$: Observable<Gauge[]> = this.gaugesService.getAllGauges();

  todaysDate: Date = new Date();

  purchaseOrderForm: FormGroup = this.fb.group({
    purchaseOrderId: [null],
    supplierId: [null, [Validators.required]],
    dateIssued: [this.todaysDate, [Validators.required]],
    expectedDeliveryDate: [this.todaysDate, [Validators.required]],
    comments: [''],
    paid: [false, [Validators.required]],
    productPurchases: this.fb.array([]),
    consumablesOnPurchaseOrder: this.fb.array([]),
  });

  private steelProductForm: () => FormGroup = () =>
    this.fb.group({
      productOnPurchaseOrderId: [null],
      weightOrdered: [null, [Validators.required]],
      purchaseCostPerKg: [null, [Validators.required]],
      finish: [null, [Validators.required]],
      color: [null, [Validators.required]],
      isqGrade: [null, [Validators.required]],
      width: [null, [Validators.required]],
      coating: [null, [Validators.required]],
      gauge: [null, [Validators.required]],
    });

  private consumablesForm: () => FormGroup = () =>
    this.fb.group({
      consumableOnPurchaseOrderId: [null],
      qty: [null, [Validators.required]],
      costPerUnit: [null, [Validators.required]],
      consumable: [null, [Validators.required]],
    });

  constructor(
    private fb: FormBuilder,
    private supplierService: SupplierService,
    private colorsService: ColorsService,
    private finishesService: FinishesService,
    private gaugesService: GaugesService,
    private purchaseOrderService: PurchaseOrderService,
    private widthService: WidthService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private consumablesService: ConsumablesService,
  ) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((params) => {
      const purchaseOrderId = params.get('id');
      if (purchaseOrderId) {
        console.log('Purchase order id = ', purchaseOrderId);
        this.getPurchaseOrderById(purchaseOrderId);
      }
    });
  }

  getPurchaseOrderById(purchaseOrderId: string) {
    this.purchaseOrderService
      .getPurchaseOrderById(+purchaseOrderId)
      .subscribe((purchaseOrder: PurchaseOrder) => {
        console.log('Purchase order = ', purchaseOrder);
        this.purchaseOrder = purchaseOrder;
        this.populateForm(purchaseOrder);
      });
  }

  populateForm(purchaseOrder: PurchaseOrder) {
    this.purchaseOrderForm.patchValue({
      purchaseOrderId: purchaseOrder.id,
      supplierId: purchaseOrder.supplier.id,
      dateIssued: purchaseOrder.dateIssued,
      expectedDeliveryDate: purchaseOrder.expectedDeliveryDate,
      comments: purchaseOrder.notes,
      paid: purchaseOrder.paid,
    });

    purchaseOrder.productPurchases.forEach((product) => {
      (this.purchaseOrderForm.get('productPurchases') as FormArray).push(
        this.fb.group({
          purchaseOrderId: [product.id],
          weightOrdered: [product.weightOrdered, [Validators.required]],
          purchaseCostPerKg: [product.purchaseCostPerKg, [Validators.required]],
          finish: [product.steelSpecification.color.finish.id, [Validators.required]],
          color: [product.steelSpecification.color, [Validators.required]],
          isqGrade: [product.steelSpecification.isqgrade, [Validators.required]],
          width: [product.steelSpecification.width, [Validators.required]],
          coating: [product.steelSpecification.coating, [Validators.required]],
          gauge: [product.steelSpecification.gauge, [Validators.required]],
        }),
      );
    });

    purchaseOrder.consumablesOnPurchaseOrders.forEach((consumablesOnPurcahseOrder) => {
      (this.purchaseOrderForm.get('consumablesOnPurchaseOrder') as FormArray).push(
        this.fb.group({
          consumableOnPurchaseOrderId: [consumablesOnPurcahseOrder.id],
          qty: [consumablesOnPurcahseOrder.qty, [Validators.required]],
          costPerUnit: [consumablesOnPurcahseOrder.costPerUnit, [Validators.required]],
          consumable: [consumablesOnPurcahseOrder.consumable, [Validators.required]],
        }),
      );
    });
  }

  onGalvanizeChange(formGroup: FormGroup, radioChange: MatRadioChange) {
    if (radioChange.value.name === 'galvanize') {
      const galvanized: Color = this.findColor('Galvanize');
      formGroup.get('color').setValue(galvanized);
    }
    formGroup.get('color').updateValueAndValidity();
  }

  findColor(targetColor: string): Color {
    return this.colors.find((color) => color.color === targetColor);
  }

  public get productPurchases(): FormArray<FormGroup> {
    return this.purchaseOrderForm.get('productPurchases') as FormArray;
  }

  public addProductOnOrder(): void {
    (this.purchaseOrderForm.get('productPurchases') as FormArray).push(this.steelProductForm());
  }

  public onDelete(index: number): void {
    (this.purchaseOrderForm.get('productPurchases') as FormArray).removeAt(index);
  }

  public get consumablesOnPurchaseOrder(): FormArray<FormGroup> {
    return this.purchaseOrderForm.get('consumablesOnPurchaseOrder') as FormArray;
  }

  public addConsumableOrder(): void {
    (this.purchaseOrderForm.get('consumablesOnPurchaseOrder') as FormArray).push(
      this.consumablesForm(),
    );
  }

  public onDeleteConsumable(index: number): void {
    (this.purchaseOrderForm.get('consumablesOnPurchaseOrder') as FormArray).removeAt(index);
  }

  onSubmit(): void {
    if (this.purchaseOrderForm.invalid) {
      console.log('Form is invalid. Returning from onSubmit method.');
      return;
    }

    const formValue: PurchaseOrderPostDTO = {
      ...this.purchaseOrderForm.value,
      dateIssued: formatDate(this.purchaseOrderForm.value.dateIssued),
      expectedDeliveryDate: formatDate(this.purchaseOrderForm.value.expectedDeliveryDate),
    };
    formValue.status = this.purchaseOrder.status;

    console.log('Form value = ', formValue);

    this.purchaseOrderService.saveEditPurchaseOrder(formValue).subscribe({
      next: (data) => {
        console.log('Response = ', data);
        this.purchaseOrderForm.reset();
        this.router.navigate(['/', 'purchase-orders']);
      },
      error: (err) => {
        console.log('Error = ', err);
      },
    });
  }

  cancel(): void {
    this.purchaseOrderForm.reset();
    this.router.navigate(['/', 'purchase-orders']);
  }

  compareFn(c1: any, c2: any): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }
}
