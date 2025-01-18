import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators, FormArray, AbstractControl } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { HttpClientModule } from '@angular/common/http';
import { InventoryService } from '../../../inventory/services/inventory.service';
import { Project } from '../../../projects/models/project';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { DeliveryNotesService } from '../../../delivery-notes/services/delivery-notes.service';
import { InventoryItemDTO } from '../../../inventory/models/inventoryItemDTO';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-enterprise';
import { AgGridModule } from 'ag-grid-angular';
import { GroupMPs } from './models/groupMPs';
import { CreditNotesDto } from './models/credit-notes-dto';
import { CreditNotesService } from '../services/credit-notes.service';

@Component({
  selector: 'app-create-credit-note-dialog',
  templateUrl: 'create-credit-note-dialog.component.html',
  imports: [
    SharedModule,
    MatInputModule,
    MatDatepickerModule,
    MatDialogModule,
    MatButtonModule,
    MatSelectModule,
    HttpClientModule,
    FuseAlertComponent,
    AgGridModule,
  ],
  standalone: true,
})
export class CreateCreditNoteDialog implements OnInit {
  inventoryItems: InventoryItemDTO[] = [];
  displayedColumns: string[] = [
    'inventoryId',
    'dateIn',
    'dateOut',
    'clientName',
    'projectName',
    'length',
    'select',
  ];

  showAlert = false;
  alert: { type: FuseAlertType; message: string } = {
    type: 'info',
    message: 'Successfully',
  };

  public creditNoteForm: FormGroup;

  public columnDefs: ColDef[] = [
    {
      field: 'quoteId',
      headerCheckboxSelection: true,
      checkboxSelection: true,
    },
    { field: 'cuttingListId' },
    { field: 'frameType' },
    { field: 'frameName' },
    { field: 'totalItems' },
    { headerName: 'Length/Quantity', field: 'totalLengthOrQty' },
  ];

  public defaultColDef: ColDef = {
    flex: 1,
    minWidth: 100,
  };
  public rowSelection: 'single' | 'multiple' = 'multiple';
  public gridApi!: GridApi<GroupMPs>;
  public rowData: GroupMPs[];
  public paginationPageSize = 10;
  public paginationPageSizeSelector: number[] | boolean = [10, 20, 50];
  public pagination = true;

  constructor(
    public dialogRef: MatDialogRef<CreateCreditNoteDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { project: Project },
    private fb: FormBuilder,
    private inventoryService: InventoryService,
    private deliveryNoteService: DeliveryNotesService,
    private creditNoteService: CreditNotesService,
  ) {
    this.creditNoteForm = this.fb.group({
      dateCreated: ['', Validators.required],
      returnedProducts: this.fb.array([
        this.fb.group({
          reason: ['', Validators.required],
          returnedDate: ['', Validators.required],
          inventories: this.fb.array([], Validators.required),
        }),
      ]),
    });
  }

  get returnedProducts(): FormArray {
    return this.creditNoteForm.get('returnedProducts') as FormArray;
  }

  get inventories(): FormArray {
    return this.returnedProducts.at(0).get('inventories') as FormArray;
  }

  ngOnInit(): void {
    this.getInventoryItems();

    this.creditNoteForm.statusChanges.subscribe((status) => {
      console.log('Form status changed:', status);
      this.checkFormControlValidity();
    });
  }

  onGridReady(params: GridReadyEvent<GroupMPs>) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
    params.api.setGridOption('domLayout', 'autoHeight');
  }

  onSelectionChanged() {
    const selectedRows = this.gridApi.getSelectedRows();
    this.updateInventoriesFormArray(selectedRows);
    console.log('Selected rows:', selectedRows);
  }

  updateInventoriesFormArray(selectedRows: GroupMPs[]): void {
    const inventoriesArray = this.inventories;
    inventoriesArray.clear();

    selectedRows.forEach((row) => {
      row.groupedInventoryItemDTO.forEach((item) => {
        inventoriesArray.push(
          this.fb.group({
            id: [item.inventoryId],
          }),
        );
      });
    });

    console.log('Updated inventories array:', inventoriesArray.value);
  }

  getInventoryItems(): void {
    this.inventoryService
      .getCreditNoteProjectInventory(this.data.project.id)
      .subscribe((items: InventoryItemDTO[]) => {
        console.log('Fetched items:', items);
        this.rowData = this.groupMPs(items);
        console.log('Product MPs:', this.rowData);
      });
  }

  groupMPs(items: InventoryItemDTO[]): GroupMPs[] {
    const groupedMPs: GroupMPs[] = [];

    items.forEach((item) => {
      if (item.itemType === 'Consumable') {
        groupedMPs.push({
          quoteId: item.quoteId,
          cuttingListId: null,
          frameType: 'Consumable',
          frameName: 'Consumable',
          totalItems: 1,
          totalLengthOrQty: item.numberOfConsumables,
          groupedInventoryItemDTO: [item],
        });
      } else {
        const frameType = item.frameType;
        const frameName = item.frameName;

        // const existingGroup = groupedMPs.find(
        //   (group) =>
        //     group.quoteId === item.quoteId &&
        //     group.cuttingListId === item.cuttingListId &&
        //     group.frameType === frameType &&
        //     group.frameName === frameName,
        // );
        // if (existingGroup) {
        //   existingGroup.totalItems += 1;
        //   existingGroup.totalLengthOrQty += item.length;
        //   existingGroup.groupedInventoryItemDTO.push(item);
        // } else {
        //   groupedMPs.push({
        //     quoteId: item.quoteId,
        //     cuttingListId: item.cuttingListId,
        //     frameType,
        //     frameName,
        //     totalItems: 1,
        //     totalLengthOrQty: item.length,
        //     groupedInventoryItemDTO: [item],
        //   });
        // }
      }
    });

    groupedMPs.forEach((group) => {
      group.totalLengthOrQty = parseFloat(group.totalLengthOrQty.toFixed(2));
    });

    groupedMPs.sort((a, b) => a.cuttingListId - b.cuttingListId);

    return groupedMPs;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.creditNoteForm.valid) {
      const formValue = this.creditNoteForm.value;

      const creditNote: CreditNotesDto = {
        // consumablesOnQuoteID: [],
        // manufacturedProductsID: [],
        dateCreated: formValue.dateCreated,
        deliveryNoteId: 0, // Set appropriately
        quoteId: 0, // Set appropriately
        projectId: this.data.project.id,
        returnedProducts: formValue.returnedProducts.map((rp: any) => ({
          reason: rp.reason,
          returnedDate: rp.returnedDate,
          inventories: rp.inventories.map((inv: any) => ({ id: inv.id })),
        })),
      };

      console.log(creditNote);

      this.gridApi.getSelectedRows().forEach((itemSelected) => {
        itemSelected.groupedInventoryItemDTO.forEach((inventoryItem) => {
          const returnedProduct = creditNote.returnedProducts.find(
            (rp) => rp.reason === formValue.returnedProducts[0].reason,
          );
          // if (returnedProduct) {
          //   returnedProduct.inventories.push(inventoryItem.inventoryId);
          // }
        });
      });

      if (creditNote.returnedProducts[0].inventories.length === 0) {
        this.showAlert = true;
        this.alert = {
          type: 'error',
          message: 'Please select at least one item to be delivered',
        };
        return;
      }

      console.log('Form is valid:', creditNote);

      this.creditNoteService.createCreditNote(creditNote).subscribe({
        next: () => {
          console.log('Credit note created successfully');
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error creating credit note:', error);
          this.showAlert = true;
          this.alert = {
            type: 'error',
            message: 'Failed to create credit note',
          };
        },
      });
    } else {
      console.warn('Form is invalid');
      console.log('Form status:', this.creditNoteForm.status);
      console.log('Form errors:', this.creditNoteForm.errors);
      console.log('Form values:', this.creditNoteForm.value);
      this.checkFormControlValidity();
    }
  }

  private checkFormControlValidity(): void {
    for (const control in this.creditNoteForm.controls) {
      if (this.creditNoteForm.controls.hasOwnProperty(control)) {
        const formControl = this.creditNoteForm.get(control);
        if (formControl && formControl.invalid) {
          console.log(`${control} is invalid:`, formControl.errors);
        }
      }
    }

    this.returnedProducts.controls.forEach((group: AbstractControl, index: number) => {
      const groupFormGroup = group as FormGroup;
      for (const control in groupFormGroup.controls) {
        if (groupFormGroup.controls.hasOwnProperty(control)) {
          const formControl = groupFormGroup.get(control);
          if (formControl && formControl.invalid) {
            console.log(`returnedProducts[${index}].${control} is invalid:`, formControl.errors);
          }
        }
      }
    });
  }
}
