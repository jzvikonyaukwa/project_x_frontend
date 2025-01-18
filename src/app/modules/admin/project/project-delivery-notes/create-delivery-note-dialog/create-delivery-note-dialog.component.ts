import { Component, Inject, OnInit } from '@angular/core';

import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { HttpClientModule } from '@angular/common/http';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { DeliveryNotesService } from 'app/modules/admin/delivery-notes/services/delivery-notes.service';
import { InventoryItemDTO } from 'app/modules/admin/inventory/models/inventoryItemDTO';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-enterprise';
import { AgGridModule } from 'ag-grid-angular';
import { GroupMPs } from './models/groupMPs';
import { DeliverNoteDTO } from 'app/modules/admin/delivery-notes/models/delivery-notes-dto';
import { InventoryItem } from 'app/modules/admin/inventory/models/inventoryItem';
import { InventoryService } from 'app/modules/admin/inventory/services/inventory.service';
import { Project } from 'app/modules/admin/projects/models/project';

@Component({
  selector: 'app-create-delivery-note-dialog',
  templateUrl: 'create-delivery-note-dialog.component.html',
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
export class CreateDeliveryNoteDialog implements OnInit {
  inventoryItems: InventoryItem[] = [];
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

  public deliveryNoteForm: FormGroup = this.fb.group({
    dateCreated: ['', Validators.required],
    dateDelivered: ['', Validators.required],
    deliveryAddress: ['', Validators.required],
    inventories: this.fb.array([]),
  });

  public columnDefs: ColDef[] = [
    {
      field: 'quoteId',
      headerCheckboxSelection: true,
      checkboxSelection: true,
    },
    { headerName: 'Product', field: 'product' },
    { field: 'frameName' },
    { field: 'totalItems' },
    { headerName: 'Length/Quantity', field: 'totalLengthOrQty' },
    {
      headerName: 'Quantity to Deliver',
      field: 'quantityToDeliver',
      editable: (params) => this.isEditAble(params.data),
      cellEditor: 'agTextCellEditor',
      valueSetter: (params) => {
        const newValue = Number(params.newValue);
        if (!isNaN(newValue) && newValue >= 0) {
          params.data.quantityToDeliver = newValue;
          return true;
        } else {
          return false;
        }
      },
    },
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
    public dialogRef: MatDialogRef<CreateDeliveryNoteDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { project: Project },
    private fb: FormBuilder,
    private inventoryService: InventoryService,
    private deliveryNoteService: DeliveryNotesService,
  ) {}

  ngOnInit(): void {
    this.getInventoryItemsInStock();
    this.deliveryNoteForm.statusChanges.subscribe((status) => {
      console.log('Form status changed:', status);
      this.checkFormControlValidity();
    });
  }

  isEditAble(data: any): boolean {
    console.log('In isEditAble - data: ', data);
    return data.frameName === 'Consumable';
  }

  onGridReady(params: GridReadyEvent<GroupMPs>) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
    params.api.setGridOption('domLayout', 'autoHeight');
  }

  onSelectionChanged() {
    const selectedRows = this.gridApi.getSelectedRows();
    console.log('Selected rows:', selectedRows);
  }

  getInventoryItemsInStock(): void {
    this.inventoryService
      .getProjectInventoryInStock(this.data.project.id)
      .subscribe((items: InventoryItemDTO[]) => {
        this.rowData = this.groupMPs(items);
      });
  }

  groupMPs(items: InventoryItemDTO[]): GroupMPs[] {
    const groupedMPs: GroupMPs[] = [];

    items.forEach((item) => {
      if (item.itemType === 'Consumable') {
        const existingGroup = groupedMPs.find((group) => group.product === item.consumableName);
        let totalItems;
        if (existingGroup) {
          totalItems = item.numberOfConsumables;
          existingGroup.totalItems += 1;
          existingGroup.groupedInventoryItemDTO.push(item);
        } else {
          groupedMPs.push({
            quoteId: item.quoteId,
            product: item.consumableName,
            frameName: 'Consumable',
            totalItems: totalItems == undefined ? item.numberOfConsumables : totalItems,
            totalLengthOrQty: 0,
            groupedInventoryItemDTO: [{ ...item, quantityToDeliver: item.numberOfConsumables }],
          });
        }
      } else {
        groupedMPs.push({
          quoteId: item.quoteId,
          product: item.productName,
          frameName: item.frameName,
          totalItems: item.numberOfAggregatedProducts,
          totalLengthOrQty: item.totalProductLength,
          quantityToDeliver: item.totalProductLength,
          groupedInventoryItemDTO: [item],
        });
      }
    });

    groupedMPs.forEach((group) => {
      group.totalLengthOrQty = parseFloat(group?.totalLengthOrQty?.toFixed(2));
    });

    return groupedMPs;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.deliveryNoteForm.valid) {
      const formValue = this.deliveryNoteForm.value;

      const deliveryNote: DeliverNoteDTO = {
        dateCreated: formValue.dateCreated,
        dateDelivered: formValue.dateDelivered,
        deliveryAddress: formValue.deliveryAddress,
        projectId: this.data.project.id,
        consumablesIdsQuantities: [],
        manufacturedProductsID: [],
      };

      console.log(deliveryNote);

      // Ensure all nodes have the `quantityToDeliver` field set to either the user-specified value or the default total items
      this.gridApi.forEachNode((node) => {
        node.data.quantityToDeliver = node.data.quantityToDeliver ?? node.data.totalItems;
      });

      // Collect the selected rows and their quantities
      this.gridApi.getSelectedRows().forEach((itemSelected) => {
        itemSelected.groupedInventoryItemDTO.forEach((inventoryItem) => {
          if (inventoryItem.itemType === 'Consumable') {
            const quantity =
              inventoryItem.quantityToDeliver !== undefined
                ? inventoryItem.quantityToDeliver
                : inventoryItem.totalItems;
            deliveryNote.consumablesIdsQuantities.push({ [inventoryItem.inventoryId]: quantity });
          } else {
            deliveryNote.manufacturedProductsID.push(inventoryItem.inventoryId);
          }
        });
      });

      if (
        deliveryNote.consumablesIdsQuantities.length === 0 &&
        deliveryNote.manufacturedProductsID.length === 0
      ) {
        this.showAlert = true;
        this.alert = {
          type: 'error',
          message: 'Please select at least one item to be delivered',
        };
        return;
      }

      console.log('Form is valid:', deliveryNote);

      this.deliveryNoteService.createDeliveryNote(deliveryNote).subscribe({
        next: () => {
          console.log('Delivery note created successfully');
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.showAlert = true;
          this.alert = {
            type: 'error',
            message: 'Failed to create delivery note',
          };
        },
      });
    } else {
      this.checkFormControlValidity();
    }
  }

  private checkFormControlValidity(): void {
    for (const control in this.deliveryNoteForm.controls) {
      if (this.deliveryNoteForm.controls.hasOwnProperty(control)) {
        const formControl = this.deliveryNoteForm.get(control);
        if (formControl && formControl.invalid) {
          console.log(`${control} is invalid:`, formControl.errors);
        }
      }
    }
  }
}
