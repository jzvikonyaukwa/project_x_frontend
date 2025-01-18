import { Component, DestroyRef, inject, Input, OnInit, Optional } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GrvService } from '../../services/grv.service';
import { Observable, finalize, forkJoin, take } from 'rxjs';
import { Router } from '@angular/router';
import { IsqGrades } from '@shared/enums/isq-grades';
import { Coatings } from '@shared/enums/coatings';
import { SupplierService } from '../../../suppliers/services/supplier.service';
import { MatRadioChange, MatRadioModule } from '@angular/material/radio';
import { formatDate } from '@shared/utils/format-date';
import { SupplierDto } from '../../../suppliers/models/supplierDto';
import { ColorsService } from '../../../../../shared/services/colors.service';
import { FinishesService } from '../../../../../shared/services/finishes.service';
import { Color } from '@shared/models/color';
import { Finish } from '@shared/models/finish';
import { GaugesService } from '@shared/services/gauges.service';
import { Gauge } from '@shared/models/gauge';
import { PurchaseOrderService } from '../../../purchase-orders/services/purchase-order.service';
import { ColDef, GridApi, GridReadyEvent, RowNode } from 'ag-grid-enterprise';
import { GRVSTEELCOLUMNDEFS as GRV_STEEL_COLUMN_DEFS } from './models/grv-steel-column-defs';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { Warehouse } from 'app/modules/admin/warehouses/warehouse';
import { WarehouseService } from 'app/modules/admin/warehouses/warehouse.service';
import { AgGridModule } from 'ag-grid-angular';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { SteelOnPurchaseOrder } from 'app/modules/admin/purchase-orders/models/steelOnPurchaseOrder';
import { ConsumablesOnPurchaseOrderDTO } from 'app/modules/admin/purchase-orders/models/consumablesOnPurchaseOrder';
import { GRVS_CONSUMABLE_COLUMNDEFS } from './models/grv-consumables-column-defs';
import { Consumable } from 'app/modules/admin/consumables/models/consumable';
import { ConsumablesService } from 'app/modules/admin/consumables/services/consumables.service';
import { Width } from '@shared/models/width';
import { WidthService } from '@shared/services/width.service';
import { GRVDetails } from '../../models/GRVDetails';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { AddGrvComponent } from '../add-grv.component';
import { GRVDetailsDTO } from '../../models/grvStructuredDetails';
import { GrvSummaryRowData } from '../../models/grvSummaryRowData';
import { Consignor } from 'app/modules/admin/consignors/models/consignor';
import { ConsignorsService } from 'app/modules/admin/consignors/services/consignors.service';
import { PurchaseOrder } from 'app/modules/admin/purchase-orders/models/purchaseOrders';
import { ProductPurchase } from 'app/modules/admin/purchase-orders/models/product-purchase';
import { SUPPLIESPURCHASEORDERSCOLUMNDEFS } from './models/grv-purchase-orders-column-defs';
import { DateTime } from 'luxon';
import { NgSelectModule } from '@ng-select/ng-select';
import getRowStyle from 'app/utilities/ag-grid/defaultRowStyle';

@Component({
  selector: 'app-grv-form',
  templateUrl: './grv-form.component.html',
  styleUrls: ['./grv-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    AgGridModule,
    MatRadioModule,
    FuseAlertComponent,
    MatDialogModule,
    NgSelectModule,
  ],
})
export class GrvFormComponent implements OnInit {
  @Input('editGrv') editGrv: GrvSummaryRowData | any;
  public readonly ISQ_GRADES = Object.values(IsqGrades);
  public readonly COATINGS = Object.values(Coatings);
  todaysDate: Date = new Date();

  getRowStyle = getRowStyle;
  readonly currentTime: Date = DateTime.now().startOf('day').toJSDate();

  showAlert = false;
  alert: { type: FuseAlertType; message: string } = {
    type: 'success',
    message: '',
  };

  suppliers$: Observable<SupplierDto[]> = this._supplierService.getAllSuppliers();
  warehouses$: Observable<Warehouse[]> = this.warehouseService.getAllWarehouses();
  consignors: Consignor[];

  grv: GRVDetailsDTO;
  widths: Width[];
  colors: Color[];
  finishes: Finish[];
  gauges: Gauge[];
  suppliers = [];
  purchaseOrdersForSupplier: PurchaseOrder[];
  purchaseOrderSelected: PurchaseOrder;
  warehouses = [];
  grvs: GRVDetails[] = [];
  consumableOptions: Consumable[];
  consumableProducts: ConsumablesOnPurchaseOrderDTO[];
  steelProducts: SteelOnPurchaseOrder[];
  selectedNodesSteel: RowNode[] = [];
  selectedNodesConsumable: RowNode[] = [];

  savedGRV: GRVDetailsDTO;

  public GRV_STEEL_COLUMN_DEFS: ColDef[] = GRV_STEEL_COLUMN_DEFS;
  public GRV_CONSUMABLES_COLUMN_DEFS: ColDef[] = GRVS_CONSUMABLE_COLUMNDEFS;
  public SUPPLIERS_PO_COL_DEF: ColDef[] = SUPPLIESPURCHASEORDERSCOLUMNDEFS;

  public DEFAULT_COL_DEF: ColDef = {
    filter: true,
    resizable: true,
    headerClass: 'ag-grid-header',
    wrapHeaderText: true,
  };

  grvSubmittedSuccessfully = false;

  public rowSelection: 'single' | 'multiple' = 'multiple';
  private steelGridApi: GridApi;
  private consumableGridApi: GridApi;

  grvForm: FormGroup = this._fb.group({
    dateReceived: [this.todaysDate, [Validators.required]],
    comments: [''],
    supplierGrvCode: [''],
    paid: [false],
    supplierId: [null, [Validators.required]],
    warehouse: [null, [Validators.required]],
    steelCoils: this._fb.array([]),
    consumablesOnGrv: this._fb.array([]),
  });

  private _baseProductForm: () => FormGroup = () =>
    this._fb.group({
      productOnPurchaseOrderId: [null],
      isqGrade: [null, [Validators.required]],
      coilNumber: ['', [Validators.required]],
      cardNumber: ['', [Validators.required]],
      width: [null, [Validators.required]],
      coating: [null, [Validators.required]],
      gauge: [null, [Validators.required]],
      finish: ['Chromadek', []],
      color: [null, [Validators.required]],
      weightInKgsOnArrival: [null, [Validators.required, Validators.min(0)]],
      landedCostPerKg: [null, [Validators.required, Validators.min(0)]],
      id: [null],
      consignor: [null],
    });

  private _baseCosumableForm: () => FormGroup = () =>
    this._fb.group({
      consumable: ['', [Validators.required]],
      qtyOrdered: [null, [Validators.required, Validators.min(0)]],
      landedPrice: [null, [Validators.required, Validators.min(0)]],
      id: [null],
    });

  private readonly _grvService = inject(GrvService);
  private readonly _router = inject(Router);
  private readonly colorsService = inject(ColorsService);
  private readonly finishesService = inject(FinishesService);
  private readonly gaugesService = inject(GaugesService);
  private readonly purchaseOrderService = inject(PurchaseOrderService);
  private readonly consumableService = inject(ConsumablesService);
  private readonly widthService = inject(WidthService);
  private readonly consignorService = inject(ConsignorsService);

  constructor(
    private _fb: FormBuilder,
    private _supplierService: SupplierService,
    private warehouseService: WarehouseService,
    @Optional() private dialogRef: MatDialogRef<AddGrvComponent>,
    private destroyRef: DestroyRef,
  ) {}

  ngOnInit(): void {
    this.listForSupplierChange();

    forkJoin([
      this.colorsService.getAllColors(),
      this.finishesService.getAllFinishes(),
      this.gaugesService.getAllGauges(),
      this.consumableService.getAllConsumables(),
      this.widthService.getAllWidths(),
      this.consignorService.getAllConsignors(),
      this.warehouses$,
      this.suppliers$,
    ])
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          if (this.editGrv) {
            this.fillEditForm();
          }
        }),
      )
      .subscribe(
        ([colors, finishes, gauges, consumables, widths, consignors, warehouses, suppliers]) => {
          this.colors = colors;
          this.finishes = finishes;
          this.gauges = gauges;
          this.consumableOptions = consumables;
          this.widths = widths;
          this.warehouses = warehouses;
          this.suppliers = this.orderSuppliersAlphabetically(suppliers);
          this.consignors = consignors;
        },
      );
  }

  private orderSuppliersAlphabetically(suppliers: SupplierDto[]): SupplierDto[] {
    return suppliers.sort((a, b) => a.name.localeCompare(b.name));
  }

  fillEditForm(): void {
    const productsArray = this.grvForm.get('steelCoils') as FormArray;
    this._grvService.getGrvDetails(this.editGrv.grvId).subscribe((grvReceived: GRVDetailsDTO) => {
      if (grvReceived == null) {
        return;
      }

      this.grv = grvReceived;

      // console.log('grvReceived', grvReceived);
      for (const product of grvReceived.steelCoils) {
        // console.log('product', product);
        const color = this.colors.find((c) => c.id === product.color.id);
        const width = this.widths.find((w) => w.id === product.width.id);
        const gauge = this.gauges.find((g) => g.id === product.gauge.id);
        productsArray.push(
          this._fb.group({
            isqGrade: product.isqGrade,
            coilNumber: product.coilNumber,
            cardNumber: product.cardNumber,
            width: width,
            coating: product.coating,
            gauge: gauge,
            finish: product.color.finish.id,
            color: color,
            steelCoilId: product.steelCoilId,
            weightInKgsOnArrival: product.weightInKgsOnArrival,
            estimatedMeterRunOnArrival: product.estimatedMeterRunOnArrival,
            estimatedMetersRemaining: product.estimatedMetersRemaining,
            purchaseCostPerKg: product.purchaseCostPerKg,
            landedCostPerKg: product.landedCostPerMtr,
            status: product.status,
          }),
        );
      }

      for (const consumable of grvReceived.consumablesOnGrv) {
        const consumableObj = this.findConsumable(consumable.consumable.id);
        (this.grvForm.get('consumablesOnGrv') as FormArray).push(
          this._fb.group({
            consumableOnGrvId: consumable.consumableOnGrvId,
            consumableInWarehouseId: consumable.consumableInWarehouseId,
            consumableOnPurchaseOrderId: consumable.consumableOnPurchaseOrderId,
            consumable: consumableObj,
            qtyOrdered: consumable.qtyOrdered,
            landedPrice: consumable.landedPrice,
            id: consumable.consumable.id,
          }),
        );
      }

      const warehouse = this.warehouses.find((w) => w.id === grvReceived.warehouse?.id);

      // console.log('warehouse', warehouse);
      this.grvForm.patchValue({
        dateReceived: grvReceived.dateReceived,
        supplierId: this.suppliers.find((s) => s.id === grvReceived.supplierId)?.id,
        warehouse: warehouse,
        comments: grvReceived.comments,
        supplierGrvCode: grvReceived.supplierGrvCode,
      });
    });
  }

  listForSupplierChange() {
    this.grvForm.get('supplierId').valueChanges.subscribe((supplierId) => {
      if (supplierId) {
        this.resetArrays();
        this.consumableProducts = [];
        this.steelProducts = [];
        this.getPurchaseOrdersForSupplier(supplierId);
      }
    });
  }

  getPurchaseOrdersForSupplier(supplierId: number) {
    this.purchaseOrderService
      .getPurchaseOrdersForSupplier(supplierId)
      .subscribe((purchaseOrders: PurchaseOrder[]) => {
        // console.log('purchaseOrders', purchaseOrders);
        this.purchaseOrdersForSupplier = purchaseOrders;
      });
  }

  splitProductsOnOrderForSupplier(purchaseOrder: PurchaseOrder): void {
    const consumablesHolder: ConsumablesOnPurchaseOrderDTO[] = [];
    const steelProductsHolder: SteelOnPurchaseOrder[] = [];

    purchaseOrder.productPurchases.forEach((product: ProductPurchase) => {
      steelProductsHolder.push({
        purchaseOrderId: purchaseOrder.id,
        productOnPurchaseOrderId: product.id,
        finish: product.steelSpecification.color.finish.name,
        color: product.steelSpecification.color.color,
        steelSpecificationId: product.steelSpecification.id,
        width: product.steelSpecification.width.width,
        coating: product.steelSpecification.coating,
        gauge: product.steelSpecification.gauge.gauge,
        isqGrade: product.steelSpecification.isqgrade,
        weightOrdered: product.weightOrdered,
        weightDelivered: null,
        productStatus: product.status,
        purchaseCostPerKg: product.purchaseCostPerKg,
      });
    });

    purchaseOrder.consumablesOnPurchaseOrders.forEach((consumable) => {
      consumablesHolder.push({
        purchaseOrderId: purchaseOrder.id,
        consumableOnPurchaseOrderId: consumable.id,
        productName: consumable.consumable.name,
        qtyOrdered: consumable.qty,
        costPerUnit: consumable.costPerUnit,
        consumableId: consumable.consumable.id,
      });
    });

    if (consumablesHolder.length > 0) {
      this.consumableProducts = consumablesHolder;
      this.consumableProducts.map((item) => (item.id = Math.random()));
    }
    if (steelProductsHolder.length > 0) {
      this.steelProducts = steelProductsHolder;
      this.steelProducts.map((item) => (item.id = Math.random()));
    }
  }

  onGalvanizeChange(formGroup: FormGroup, radioChange: MatRadioChange) {
    if (radioChange.value.name === 'galvanize') {
      formGroup.get('color').removeValidators(Validators.required);
      const color = this.colors.find((c) => c.color === 'Galvanize');
      formGroup.get('color').setValue(color);
    } else {
      formGroup.get('color').reset();
      formGroup.get('color').setValidators(Validators.required);
    }
    formGroup.get('color').updateValueAndValidity();
  }

  consumablesOnGridReady(params: GridReadyEvent) {
    this.consumableGridApi = params.api;
    this.consumableGridApi.sizeColumnsToFit();
    params.api.setGridOption('domLayout', 'autoHeight');
  }

  steelOnGridReady(params: GridReadyEvent) {
    this.steelGridApi = params.api;
    this.steelGridApi.sizeColumnsToFit();
    params.api.setGridOption('domLayout', 'autoHeight');
  }

  get steelCoils(): FormArray<FormGroup> {
    return this.grvForm.get('steelCoils') as FormArray;
  }

  addSteelCoil(index: number): void {
    if (this.steelCoils.length > 0) {
      const lastCoil = this.steelCoils.at(index).value;

      const newCoil = this._fb.group({
        isqGrade: [lastCoil.isqGrade, [Validators.required]],
        coilNumber: [lastCoil.coilNumber, [Validators.required]],
        cardNumber: [lastCoil.cardNumber, [Validators.required]],
        width: [lastCoil.width, [Validators.required]],
        coating: [lastCoil.coating, [Validators.required]],
        gauge: [lastCoil.gauge, [Validators.required]],
        finish: [lastCoil.finish, []],
        color: [lastCoil.color, [Validators.required]],
        weightInKgsOnArrival: [lastCoil.weightInKgsOnArrival, [Validators.required]],
        landedCostPerMtr: [lastCoil.landedCostPerMtr, [Validators.required]],
        id: [null],
        consignor: [lastCoil.consignor],
      });

      (this.grvForm.get('steelCoils') as FormArray).push(newCoil);
    } else {
      (this.grvForm.get('steelCoils') as FormArray).push(this._baseProductForm());
    }
  }

  get consumablesOnGrv(): FormArray<FormGroup> {
    return this.grvForm.get('consumablesOnGrv') as FormArray;
  }

  addConsumable(): void {
    (this.grvForm.get('consumablesOnGrv') as FormArray).push(this._baseCosumableForm());
  }

  onSelectionChangedForConsumables(event) {
    if (event.node.selected) {
      this.selectedNodesConsumable.push(event.node);
    } else {
      this.selectedNodesConsumable = this.selectedNodesConsumable.filter((item) => {
        return item.data.id != event.node.data.id;
      });
    }

    (this.grvForm.get('consumablesOnGrv') as FormArray).clear();

    this.selectedNodesConsumable.forEach((node) => {
      // console.log('node.data', node.data);

      const consumableFormSelected: ConsumablesOnPurchaseOrderDTO = node.data;

      // console.log('consumableFormSelected', consumableFormSelected);
      const row = this._baseCosumableForm();

      const consumableObj = this.findConsumable(consumableFormSelected.consumableId);
      // console.log('consumableObj', consumableObj);

      row.patchValue({
        consumable: consumableObj,
        qtyOrdered: consumableFormSelected.qtyOrdered,
        costPerUnit: consumableFormSelected.costPerUnit,
        id: consumableFormSelected.id,
      });

      (this.grvForm.get('consumablesOnGrv') as FormArray).push(row);
    });
  }

  onSelectionChangedForSteel(event) {
    if (event.node.selected) {
      this.selectedNodesSteel.push(event.node);
    } else {
      this.selectedNodesSteel = this.selectedNodesSteel.filter((item) => {
        return item.data.id !== event.node.data.id;
      });
    }

    (this.grvForm.get('steelCoils') as FormArray).clear();

    this.selectedNodesSteel.forEach((node) => {
      const dto: SteelOnPurchaseOrder = node.data;
      const row = this._baseProductForm();

      row.patchValue(dto);
      const matchingColor = this.colors.find((color) => color.color === dto.color);

      const matchingFinish = this.finishes.find((finish) => finish.name === dto.finish);
      const matchingGauge = this.gauges.find((gauge) => gauge.gauge === dto.gauge);

      const width = this.widths.find((width) => width.width === dto.width);

      row.patchValue({
        color: matchingColor,
        finish: matchingFinish.id,
        gauge: matchingGauge,
        width: width,
        weightInKgsOnArrival: dto.weightOrdered,
        costPerKg: dto.purchaseCostPerKg,
        id: dto.id,
      });

      (this.grvForm.get('steelCoils') as FormArray).push(row);
    });
  }

  onSubmit(): void {
    if (this.grvForm.invalid) {
      console.log('Form is invalid');
      return;
    }

    const formValue: GRVDetailsDTO = {
      ...this.grvForm.value,
      dateReceived: formatDate(this.grvForm.value.dateReceived),
      purchaseOrderId: this.purchaseOrderSelected?.id,
    };

    if (this.editGrv) {
      this.grv = {
        ...this.grv,
        ...this.grvForm.value,
        dateReceived: formatDate(this.grvForm.value.dateReceived),
      };

      this.dialogRef.close(this.grv);
      return;
    }

    // console.log('Grv formvalue: ', formValue);
    this.grvSubmittedSuccessfully = true;

    console.log('formValue: ', formValue);

    this.savedGRV = formValue;
    this._grvService
      .createGrv(formValue)
      .pipe(take(1))
      .subscribe({
        next: () => {
          // this.grvSubmittedSuccessfully = true;
          // route to grvs
          this._router.navigate(['/', 'grv']);
        },
        error: (err) => {
          console.log('Adding GVR failed. Error: ', err.error);
          this.showAlert = true;
          this.alert = {
            type: 'warning',
            message: 'Adding GVR failed. Error: ' + err.error,
          };
          this.grvSubmittedSuccessfully = false;
          console.log(err);
        },
      });
  }

  removeSteelCoil(index: number): void {
    (this.grvForm.get('steelCoils') as FormArray).removeAt(index);
  }

  cancel(): void {
    if (this.editGrv) {
      this.dialogRef.close();
      return;
    }
    this.resetArrays();
    this.grvForm.reset();
    this._router.navigate(['/', 'grv']);
  }

  resetArrays() {
    this.selectedNodesSteel = [];
    this.selectedNodesConsumable = [];
    // Get references to the FormArrays
    const steelCoilsArray = this.grvForm.get('steelCoils') as FormArray;
    const consumablesOnGrvArray = this.grvForm.get('consumablesOnGrv') as FormArray;

    // Remove all items from the arrays
    while (steelCoilsArray.length !== 0) {
      steelCoilsArray.removeAt(0);
    }

    while (consumablesOnGrvArray.length !== 0) {
      consumablesOnGrvArray.removeAt(0);
    }

    // Force the form to update
    this.grvForm.updateValueAndValidity();
  }

  compareFn(c1: Color, c2: Color): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  findFinish(finish: string): Finish {
    return this.finishes.find((f) => f.name === finish);
  }

  findColor(color: string): Color {
    return this.colors.find((c) => c.color === color);
  }

  findWidth(width: number): Width {
    return this.widths.find((w) => w.width === width);
  }

  findConsumable(consumableId: number): Consumable {
    return this.consumableOptions.find((c) => c.id === consumableId);
  }

  suppliersPurchaseOrdersOnGridReady(params: GridReadyEvent) {
    params.api.sizeColumnsToFit();
    params.api.setGridOption('domLayout', 'autoHeight');
  }

  onSelectionChangedForPurchaseOrder(event) {
    const selectedRow = event.api.getSelectedRows()[0];
    if (selectedRow) {
      this.resetArrays();
      this.purchaseOrderSelected = selectedRow;
      this.splitProductsOnOrderForSupplier(this.purchaseOrderSelected);
    }
  }
}
