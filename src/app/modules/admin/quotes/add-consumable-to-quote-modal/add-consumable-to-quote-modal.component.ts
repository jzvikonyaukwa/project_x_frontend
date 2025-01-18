import { Component, inject, Inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Quote } from '../models/quote';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { debounceTime, distinctUntilChanged, map, merge, share, Subscription } from 'rxjs';
import { Consumable } from '../../consumables/models/consumable';
import { ConsumableOnQuote } from '../../consumables/models/consumableOnQuote';
import { ConsumablesInWarehouseService } from '../../consumables/services/consumables-in-warehouse.service';
import { ConsumableInWarehouse } from '../../consumables/models/consumableInWarehouse';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { NgSelectModule } from '@ng-select/ng-select';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { BigNumber } from 'bignumber.js';
import isEqual from 'lodash-es/isEqual';
import { environment } from '@environments/environment';
@Component({
  selector: 'app-add-consumable-to-quote-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDialogModule,
    MatInputModule,
    ScrollingModule,
    NgSelectModule,
    MatSnackBarModule,
    MatTooltipModule,
  ],
  templateUrl: './add-consumable-to-quote-modal.component.html',
})
export class AddConsumableToQuoteModalComponent implements OnInit, OnDestroy {
  consumablesInWarehouse: Consumable[] = [];
  availableConsumables: Array<{ id: number; label: string; costPrice: number }> = [];
  selectedValue?: Consumable;
  public consumablesForm: FormGroup = this.fb.group({
    objectID: [null],
    invoiceId: [null],
    consumableId: [null, [Validators.required]],
    consumableDesc: [null],
    qty: ['', [Validators.required, Validators.min(0)]],
    unitPrice: ['', [Validators.required, Validators.min(0)]],
    sellPrice: ['', [Validators.required, Validators.min(0)]],
    hasCustomMarkup: [false, [Validators.required]],
  });

  consumablesFormGroup: FormGroup = this.fb.group({
    consumablesFormArray: this.fb.array([], Validators.required),
  });

  originalQuote: Quote;

  private readonly _snackBar = inject(MatSnackBar);
  private readonly consumablesInWarehouseService = inject(ConsumablesInWarehouseService);

  private getAllConsumablesInWarehouseSubscription: Subscription;
  private valueChangesSubscription: Subscription;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddConsumableToQuoteModalComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { quote: Quote },
  ) {
    BigNumber.DEBUG = true;

    const consumablesFormArray = this.consumablesFormGroup.get('consumablesFormArray') as FormArray;

    this.data.quote.consumablesOnQuote?.forEach((consumableOnQuote) => {
      consumablesFormArray.push(this.createConsumableFormGroup(consumableOnQuote));
    });
  }

  ngOnInit(): void {
    this.originalQuote = this.data.quote;

    this.getAllConsumablesInWarehouseSubscription = this.consumablesInWarehouseService
      .getAllConsumablesInWarehouse(1)
      .subscribe({
        next: (v: ConsumableInWarehouse[]) => {
          let newConsumablesInWarehouse = [];
          for (let index = 0; index < v.length; index++) {
            const element = v[index];
            this.availableConsumables = [
              ...this.availableConsumables,
              {
                id: element.consumable.id,
                label: element.consumable.name,
                costPrice: element.avgLandedPrice,
              },
            ];
            newConsumablesInWarehouse = [...newConsumablesInWarehouse, element.consumable];
          }
          this.consumablesInWarehouse = newConsumablesInWarehouse;
        },
        error: (errorResponse) => {
          const detailedErrorMessage =
            errorResponse instanceof HttpErrorResponse
              ? errorResponse.error.message || errorResponse.statusText
              : 'Unknown error';
          this._snackBar.open(`Error fetching consumables list: ${detailedErrorMessage}`, null, {
            duration: environment.DEFAULT_SNACKBAR_TIMEOUT,
          } as MatSnackBarConfig);
          console.error('Error fetching consumables list', errorResponse);
        },
      });

    this.valueChangesSubscription = this.consumablesForm.valueChanges
      .pipe(share(), debounceTime(140), distinctUntilChanged())
      .subscribe({
        next: (formValue: {
          objectID: number | null;
          invoiceId: number | null;
          consumableId: number;
          consumableDesc: string;
          qty: number;
          unitPrice: number;
          sellPrice: number;
          hasCustomMarkup: boolean;
        }) => {
          console.log('formValue: ', formValue);

          const defaultMarkup = BigNumber(this.data.quote?.quotePrice?.markUp)
            .decimalPlaces(4)
            .toNumber();

          if (formValue.consumableId) {
            const currentConsumable = this.selectedValue;
            this.selectedValue = this.fetchConsumableWithId(formValue.consumableId);
            console.log('selectedValue: ', this.selectedValue);
            if (currentConsumable != this.selectedValue) {
              const costPrice = this.fetchConsumableCostPriceWithId(formValue.consumableId);
              const sellPrice = costPrice
                ? BigNumber(costPrice).times(defaultMarkup).decimalPlaces(2).toNumber()
                : 0;
              this.consumablesForm.get('unitPrice').setValue(costPrice, { emitEvent: false });
              this.consumablesForm.get('sellPrice').setValue(sellPrice, { emitEvent: false });
              this.consumablesForm.get('hasCustomMarkup').setValue(false, { emitEvent: false });
            }
          } else {
            this.selectedValue = null;
            this.consumablesForm.get('qty').setValue(1, { emitEvent: false });
            this.consumablesForm.get('unitPrice').setValue('', { emitEvent: false });
            this.consumablesForm.get('sellPrice').setValue('', { emitEvent: false });
            this.consumablesForm.get('hasCustomMarkup').setValue(false, { emitEvent: false });
          }
        },
      });

    // detect changes in the form array
    merge(
      ...(this.consumablesFormGroup.get('consumablesFormArray') as FormArray).controls.map(
        (control: AbstractControl, index: number) =>
          control.valueChanges.pipe(
            debounceTime(140),
            distinctUntilChanged(),
            map((value) => ({ rowIndex: index, control: control, data: value })),
          ),
      ),
    ).subscribe((changes: { rowIndex: number; control: FormGroup; data: any }) => {
      console.log(changes);
      if (changes.control.valid) {
        const defaultSellPrice = BigNumber(changes.data.unitPrice)
          .times(this.data.quote.quotePrice.markUp)
          .decimalPlaces(2);
        console.log('defaultSellPrice', defaultSellPrice.toString());

        if (BigNumber(changes.data.sellPrice).comparedTo(defaultSellPrice) !== 0) {
          console.log('hasCustomMarkup: ', true);
          changes.control.get('hasCustomMarkup').setValue(true, { emitEvent: false });
          changes.data.hasCustomMarkup = true;
        } else {
          console.log('hasCustomMarkup: ', false);
          changes.control.get('hasCustomMarkup').setValue(false, { emitEvent: false });
          changes.data.hasCustomMarkup = false;
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.getAllConsumablesInWarehouseSubscription?.unsubscribe();
    this.valueChangesSubscription?.unsubscribe();
  }

  get myConsumablesFormArray(): FormArray<FormGroup> {
    const formGroup = this.consumablesFormGroup;
    if (!formGroup) {
      console.error('formGroup is null');
      return;
    }
    const formArray = formGroup.get('consumablesFormArray') as FormArray;
    if (!formArray) {
      console.error('formGroup-formArray is null');
      return;
    }
    return formArray;
  }

  get consumablesOnQuoteCount(): number {
    const formArray = this.myConsumablesFormArray;
    if (!formArray) {
      return 0;
    }
    return formArray.controls.length;
  }

  get hasConsumables(): boolean {
    return this.consumablesOnQuoteCount > 0;
  }

  get hasManyConsumables(): boolean {
    return this.consumablesOnQuoteCount > 5;
  }

  get totalValue(): number {
    const formArray = this.myConsumablesFormArray;
    if (!formArray) {
      return 0;
    }

    return formArray.controls
      .reduce((total: BigNumber, control) => {
        const quantity = BigNumber(Math.abs(+control.value.qty));
        const sellPrice = BigNumber(+control.value.sellPrice);
        return total.plus(quantity.times(sellPrice));
      }, BigNumber(0))
      .decimalPlaces(2)
      .toNumber();
  }

  get totalMarkupAmount(): number {
    const formArray = this.myConsumablesFormArray;
    if (!formArray) {
      return 0;
    }

    return formArray.controls
      .reduce((total: BigNumber, control) => {
        const quantity = BigNumber(Math.abs(+control.value.qty));
        const costPrice = BigNumber(+control.value.unitPrice);
        const sellPrice = BigNumber(+control.value.sellPrice);
        return total.plus(quantity.times(sellPrice.minus(costPrice)));
      }, BigNumber(0))
      .decimalPlaces(2)
      .toNumber();
  }

  get subtotalAmount(): number {
    return this.totalValue - this.totalMarkupAmount;
  }

  get defaultMarkup(): number {
    return this.data.quote.quotePrice.markUp;
  }

  createConsumableFormGroup = (lineItem: ConsumableOnQuote): FormGroup => {
    // console.log('createConsumableFormGroup:', lineItem);
    return this.fb.group({
      objectID: [lineItem.id],
      invoiceId: [lineItem.invoiceId],
      consumableId: [lineItem.consumable.id, Validators.required],
      consumableDesc: [lineItem.consumable.name],
      qty: [lineItem.qty, [Validators.required, Validators.min(0)]],
      unitPrice: [lineItem.costPrice, [Validators.required, Validators.min(0)]],
      sellPrice: [lineItem.sellPrice, [Validators.required, Validators.min(0)]],
      hasCustomMarkup: [lineItem.hasCustomMarkup, [Validators.required]],
    });
  };

  addConsumableToQuote = ($event: Event): void => {
    // console.log('addConsumableToQuote');
    if (this.consumablesForm.invalid) {
      console.error('consumablesForm.invalid');
      return;
    }

    if (!this.selectedValue) {
      console.error('selectedValue is null');
      return;
    }

    const { consumableId, qty, unitPrice, sellPrice } = this.consumablesForm.getRawValue();
    if (qty < 0) {
      console.error('qty < 0');
      return;
    }

    this.consumablesForm.reset();
    const defaultMarkup = BigNumber(this.data.quote.quotePrice.markUp).decimalPlaces(4).toNumber();
    console.log('defaultMarkup: ', defaultMarkup);

    // will use negative number to indicate that the consumable is not yet saved

    // check how many items have negative objectID
    const newItemCount = this.myConsumablesFormArray.controls.filter(
      (control) => control.value.objectID === null || control.value.objectID < 0,
    ).length;
    const objectID = -(1 + newItemCount);

    const defaultSellPrice = BigNumber(unitPrice).times(defaultMarkup).decimalPlaces(2).toNumber();
    const consumableForm: FormGroup = this.fb.group({
      objectID: [objectID],
      invoiceId: [null],
      consumableId: [consumableId, [Validators.required]],
      consumableDesc: this.selectedValue.name,
      qty: [Math.abs(+qty), [Validators.required, Validators.min(0)]],
      unitPrice: [+unitPrice, [Validators.required, Validators.min(0)]],
      sellPrice: [+defaultSellPrice, [Validators.required, Validators.min(0)]],
      hasCustomMarkup: [false, [Validators.required]],
    });
    const consumablesFormArray = this.consumablesFormGroup.get('consumablesFormArray') as FormArray;
    consumablesFormArray.push(consumableForm);
  };

  fetchConsumableWithId = (consumableId: number): Consumable | null => {
    if (!this.consumablesInWarehouse || !consumableId) {
      return null;
    }
    return this.consumablesInWarehouse.find(($) => $.id === consumableId);
  };

  fetchConsumableCostPriceWithId = (consumableId: number): number | null => {
    if (!this.availableConsumables || !consumableId) {
      return null;
    }
    const foundItem = this.availableConsumables.find(($) => $.id === consumableId);
    if (foundItem) {
      return foundItem.costPrice;
    }
    return null;
  };

  onSubmit = ($event: Event): void => {
    const formGroup = this.consumablesFormGroup;
    const formArray = formGroup.get('consumablesFormArray') as FormArray;
    const formValue = formArray.getRawValue();

    // create  a map of consumablesOnQuote
    const currentLineItems = this.data.quote.consumablesOnQuote.map((lineItem) => {
      // console.log('adding consumable.id: ', lineItem.consumable.id, ' - ', lineItem.id);
      return lineItem.id;
    });

    let modifiedLineItems = formValue
      .map((consumableOnForm: any) => consumableOnForm.objectID)
      .filter((objectID: number) => objectID > 0);

    // removed items
    const differences = currentLineItems.filter(
      (a) => !modifiedLineItems.some((b) => isEqual(a, b)),
    );
    // console.log('remove objectID: ', differences);

    // Remove consumables that are not in the form
    differences.forEach((objectID: number) => {
      // console.log('removing objectID: ', objectID);
      this.data.quote.consumablesOnQuote = this.data.quote.consumablesOnQuote.filter(
        ($) => $.id !== objectID,
      );
    });

    let updatedQuoteItems: ConsumableOnQuote[] = [];
    // Update or add consumables based on the form
    formValue.forEach((consumableOnForm: any, index: number) => {
      const currentConsumable: Consumable = this.fetchConsumableWithId(
        consumableOnForm.consumableId,
      );
      // get item
      const lineItem: ConsumableOnQuote = this.data.quote.consumablesOnQuote.filter((o) => {
        return o.id === consumableOnForm.objectID;
      })[0];

      // console.log('lineItem: ', lineItem);
      const updatedCostPrice = BigNumber(+consumableOnForm.unitPrice).decimalPlaces(2).toNumber();
      console.log('updatedCostPrice: ', updatedCostPrice);

      const updatedSellPrice = BigNumber(+consumableOnForm.sellPrice).decimalPlaces(2).toNumber();
      console.log('updatedSellPrice: ', updatedSellPrice);

      const defaultSellPrice = BigNumber(updatedCostPrice)
        .times(this.data.quote.quotePrice.markUp)
        .decimalPlaces(2)
        .toNumber();
      console.log('defaultSellPrice: ', defaultSellPrice);

      const hasCustomMarkup = defaultSellPrice !== updatedSellPrice;
      console.log('hasCustomMarkup: ', hasCustomMarkup);

      if (lineItem) {
        // existing items
        // Update the existing consumableOnQuote
        // console.log('consumable is on quote:', consumableOnQuote.consumable.id);

        lineItem.qty = Math.abs(+consumableOnForm.qty);
        lineItem.costPrice = updatedCostPrice;
        lineItem.sellPrice = updatedSellPrice;
        lineItem.hasCustomMarkup = hasCustomMarkup;

        console.log('lineItem: ', lineItem);

        // lineItem.quotePrice = null;
        updatedQuoteItems = [...updatedQuoteItems, lineItem];
      } else {
        // Add a new consumableOnQuote
        // console.log('consumable is NOT on quote:', index);

        const newQty = +consumableOnForm.qty;
        // console.log('newQty: ', newQty);

        const newItem: ConsumableOnQuote = {
          id: null,
          invoiceId: null,
          consumable: currentConsumable,
          qty: newQty,
          costPrice: updatedCostPrice,
          sellPrice: updatedSellPrice,
          hasCustomMarkup: hasCustomMarkup,
        };

        console.log('newItem: ', newItem);

        updatedQuoteItems = [...updatedQuoteItems, newItem];
      }
    });
    console.log('updatedQuoteItems: ', updatedQuoteItems);

    // currentLineItems.forEach((coq) => this.removeConsumableOnQuote(coq.id));
    this.data.quote.consumablesOnQuote = [...updatedQuoteItems];
    // console.log('consumablesOnQuote: ', this.data.quote.consumablesOnQuote);
    this.dialogRef.close(this.data.quote);
  };

  removeConsumableOnQuote = (consumableId: number): void => {
    // console.log('removeConsumableOnQuote: ', consumableId);
    const filtered = this.data.quote.consumablesOnQuote.filter(
      ($) => $.consumable.id !== consumableId,
    );
    // console.log('filtered: ', filtered);
    this.data.quote.consumablesOnQuote = filtered;
  };

  removeConsumableFromQuote = (index: number): void => {
    const consumables = this.consumablesFormGroup.get('consumablesFormArray') as FormArray;
    consumables.removeAt(index);
  };

  onCancel = ($event: Event): void => {
    this.consumablesForm.reset();
    this.dialogRef.close();
  };

  compareConsumables(option1: ConsumableInWarehouse, option2: ConsumableInWarehouse): boolean {
    return option1 && option2 && option1.id === option2.id;
  }

  compareWithConsumable = (
    currentItem: { id: number; label: string },
    otherItem: { id: number; label: string },
  ): boolean => {
    return currentItem && otherItem && currentItem.id === otherItem.id;
  };

  trackByConsumableId = (consumable: { id: number; label: string }): number => {
    return consumable.id;
  };
}
