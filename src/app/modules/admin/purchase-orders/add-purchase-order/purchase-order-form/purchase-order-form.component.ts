import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Finish } from '@shared/models/finish';
import { Gauge } from '@shared/models/gauge';
import { finalize, Observable, Subject, take, takeUntil } from 'rxjs';
import { SupplierWithDetailsDTO } from '../../../suppliers/models/supplierDto';
import { ColorsService } from '@shared/services/colors.service';
import { FinishesService } from '@shared/services/finishes.service';
import { GaugesService } from '@shared/services/gauges.service';
import { Color } from '@shared/models/color';
import { SupplierService } from '../../../suppliers/services/supplier.service';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PurchaseOrderPostDTO } from '../../models/purchaseOrderPostDTO';
import { formatDate } from '@shared/utils/format-date';
import { MatRadioChange, MatRadioModule } from '@angular/material/radio';
import { IsqGrades } from '@shared/enums/isq-grades';
import { Coatings } from '@shared/enums/coatings';
import { PurchaseOrderService } from '../../services/purchase-order.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { WidthService } from '@shared/services/width.service';
import { Width } from '@shared/models/width';
import { MatDialogModule } from '@angular/material/dialog';
import { ConsumablesService } from 'app/modules/admin/consumables/services/consumables.service';
import { Consumable } from 'app/modules/admin/consumables/models/consumable';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-purchase-order-form',
  templateUrl: './purchase-order-form.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatRadioModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
})
export class PurchaseOrderFormComponent implements OnInit, OnDestroy {
  isBusy = false;
  public readonly ISQ_GRADES = Object.values(IsqGrades);
  public readonly COATINGS = Object.values(Coatings);

  readonly currentTime: Date = DateTime.now().startOf('day').toJSDate();

  suppliers$: Observable<SupplierWithDetailsDTO[]> =
    this.supplierService.getAllSuppliersWithDetails();

  colors: Color[];
  finishes: Finish[];
  gauges: Gauge[];
  widths: Width[];
  consumables: Consumable[];

  purchaseOrderForm: FormGroup = this.fb.group({
    supplierId: [null, [Validators.required]],
    dateIssued: [this.currentTime, [Validators.required]],
    expectedDeliveryDate: [this.currentTime, [Validators.required]],
    comments: [''],
    paid: [false, [Validators.required]],
    productPurchases: this.fb.array([]),
    consumablesOnPurchaseOrder: this.fb.array([]),
  });

  private _baseProductForm: () => FormGroup = () =>
    this.fb.group({
      finish: ['Chromadek', [Validators.required]],
      color: [null, [Validators.required]],
      width: [null, [Validators.required]],
      gauge: [null, [Validators.required]],
      isqGrade: [null, [Validators.required]],
      coating: [null, [Validators.required]],
      purchaseCostPerKg: [null, [Validators.required, Validators.min(0)]],
      weightOrdered: [null, [Validators.required, Validators.min(0)]],
    });

  private consumablesForm: () => FormGroup = () =>
    this.fb.group({
      consumableId: [null, [Validators.required]],
      qty: [null, [Validators.required, Validators.min(0)]],
      costPerUnit: [null, [Validators.required, Validators.min(0)]],
    });

  private ngUnsubscribe = new Subject<void>();

  private readonly _snackBar = inject(MatSnackBar);
  private readonly colorsService = inject(ColorsService);
  private readonly consumablesService = inject(ConsumablesService);
  private readonly finishesService = inject(FinishesService);
  private readonly gaugesService = inject(GaugesService);
  private readonly purchaseOrderService = inject(PurchaseOrderService);
  private readonly router = inject(Router);
  private readonly widthService = inject(WidthService);

  constructor(private fb: FormBuilder, private supplierService: SupplierService) {}

  ngOnInit(): void {
    this.getAllData();
  }

  getAllData(): void {
    this.getColors();
    this.getGauges();
    this.getWidths();
    this.getConsumables();
  }

  getFinishes(): void {
    this.finishesService
      .getAllFinishes()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((finishes) => {
        this.finishes = finishes;
      });
  }

  getColors(): void {
    this.colorsService
      .getAllColors()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((colors) => {
        this.colors = colors;
      });
  }

  getGauges(): void {
    this.gaugesService
      .getAllGauges()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((gauges) => {
        this.gauges = gauges;
      });
  }

  getWidths(): void {
    this.widthService
      .getAllWidths()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((widths) => {
        this.widths = widths;
      });
  }
  getConsumables(): void {
    this.consumablesService.getAllConsumables().subscribe((consumables: Consumable[]) => {
      this.consumables = consumables;
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

  get productPurchases(): FormArray<FormGroup> {
    return this.purchaseOrderForm.get('productPurchases') as FormArray;
  }

  public addSteelCoilToOrder(): void {
    (this.purchaseOrderForm.get('productPurchases') as FormArray).push(this._baseProductForm());
  }

  public onDeleteSteelCoil(index: number): void {
    (this.purchaseOrderForm.get('productPurchases') as FormArray).removeAt(index);
  }

  get consumablesOnPurchaseOrder(): FormArray<FormGroup> {
    return this.purchaseOrderForm.get('consumablesOnPurchaseOrder') as FormArray;
  }

  public addConsumableToOrder(): void {
    (this.purchaseOrderForm.get('consumablesOnPurchaseOrder') as FormArray).push(
      this.consumablesForm(),
    );
  }

  public onDelete(index: number): void {
    (this.purchaseOrderForm.get('consumablesOnPurchaseOrder') as FormArray).removeAt(index);
  }

  onSubmit(): void {
    if (this.purchaseOrderForm.invalid) {
      console.log('Form is invalid. Returning from onSubmit method.');
      return;
    }
    this.isBusy = true;

    const formValue: PurchaseOrderPostDTO = {
      ...this.purchaseOrderForm.value,
      dateIssued: formatDate(this.purchaseOrderForm.value.dateIssued),
      expectedDeliveryDate: formatDate(this.purchaseOrderForm.value.expectedDeliveryDate),
    };
    console.log('dateIssued = ', formValue.dateIssued);

    formValue.status = 'pending';

    console.log('Purchase order = ', formValue);

    this.purchaseOrderService
      .addPurchaseOrder(formValue)
      .pipe(
        take(1),
        finalize(() => (this.isBusy = false)),
      )
      .subscribe({
        next: () => this.router.navigate(['/', 'purchase-orders']),
        error: (err) => {
          if (err instanceof HttpErrorResponse) {
            this._snackBar.open(
              `Error adding Purchase order: ${err.error.message || err.statusText}`,
            );
          } else {
            this._snackBar.open('Error adding Purchase order');
          }
          console.error('Error adding Purchase order', err);
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

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
