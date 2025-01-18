import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { DeliveryNotesService } from 'app/modules/admin/delivery-notes/services/delivery-notes.service';
import { InventoryItemDTO } from 'app/modules/admin/inventory/models/inventoryItemDTO';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-enterprise';
import { GroupMPs } from './models/groupMPs';
import { Project } from 'app/modules/admin/projects/models/project';
import { InventoryService } from 'app/modules/admin/inventory/services/inventory.service';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { AgGridAngular } from 'ag-grid-angular';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-edit-delivery-note-dialog',
  templateUrl: 'edit-delivery-note-dialog.component.html',
  styleUrls: ['edit-delivery-note-dialog.component.css'],

  imports: [
    FuseAlertComponent,
    AgGridAngular,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    NgIf,
  ],
  standalone: true,
})
export class EditDeliveryNoteDialog implements OnInit {
  showAlert = false;
  alert: { type: FuseAlertType; message: string } = {
    type: 'info',
    message: 'Successfully',
  };

  public deliveryNoteForm: FormGroup = this.fb.group({
    inventories: this.fb.array([]),
  });

  public columnDefs: ColDef[] = [
    { field: 'quoteId' },
    { field: 'cuttingListId' },
    { field: 'frameType' },
    { field: 'frameName' },
    { field: 'totalItems' },
    { headerName: 'Length/Quantity', field: 'totalLengthOrQty' },
    {
      headerName: 'Remove',
      field: 'remove',
      checkboxSelection: true,
      headerCheckboxSelection: true,
    },
  ];

  public inventoryColumnDefs: ColDef[] = [
    { field: 'quoteId' },
    { field: 'cuttingListId' },
    { field: 'frameType' },
    { field: 'frameName' },
    { field: 'totalItems' },
    { headerName: 'Length/Quantity', field: 'totalLengthOrQty' },
    {
      headerName: 'Add',
      field: 'add',
      checkboxSelection: true,
      headerCheckboxSelection: true,
    },
  ];

  public defaultColDef: ColDef = {
    flex: 1,
    minWidth: 100,
  };
  public rowSelection: 'single' | 'multiple' = 'multiple';
  public gridApi!: GridApi<GroupMPs>;
  public inventoryGridApi!: GridApi<GroupMPs>;
  public rowData: GroupMPs[] = [];
  public inventoryRowData: GroupMPs[] = [];
  public pagination = true;

  constructor(
    public dialogRef: MatDialogRef<EditDeliveryNoteDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { project: Project; deliveryNoteId: number },
    private fb: FormBuilder,
    private inventoryService: InventoryService,
    private deliveryNoteService: DeliveryNotesService,
  ) {}

  ngOnInit(): void {
    this.getIDeliveredItems();
    this.getInventoryItems();

    this.deliveryNoteForm.statusChanges.subscribe((status) => {
      console.log('Form status changed:', status);
      this.checkFormControlValidity();
    });
  }

  onGridReady(params: GridReadyEvent<GroupMPs>) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
    params.api.setGridOption('domLayout', 'autoHeight');
  }

  onInventoryGridReady(params: GridReadyEvent<GroupMPs>) {
    this.inventoryGridApi = params.api;
    params.api.sizeColumnsToFit();
    params.api.setGridOption('domLayout', 'autoHeight');
  }

  onSelectionChanged() {
    const selectedRows = this.gridApi.getSelectedRows();
    console.log('Selected rows:', selectedRows);
  }

  onInventorySelectionChanged() {
    const selectedRows = this.inventoryGridApi.getSelectedRows();
    console.log('Selected rows for adding:', selectedRows);
  }

  getInventoryItems(): void {
    this.inventoryService
      .getProjectInventoryInStock(this.data.project.id)
      .subscribe((items: InventoryItemDTO[]) => {
        console.log('Fetched items:', items);
        items.forEach((item) => {
          if (!item.inventoryId) {
            console.error('Fetched item missing inventoryId:', item);
          }
        });
        this.inventoryRowData = this.groupMPs(items);
        console.log('Grouped MPs:', this.inventoryRowData);
      });
  }

  getIDeliveredItems(): void {
    this.deliveryNoteService
      .getDeliveryNoteItemsForUpdate(this.data.deliveryNoteId)
      .subscribe((items: any) => {
        console.log('Fetched items Deliver For Update:', items);
        this.rowData = this.groupMPs(items);
        console.log('Grouped MPs:', this.rowData);
      });
  }

  groupMPs(items: InventoryItemDTO[]): GroupMPs[] {
    const groupedMPs: GroupMPs[] = [];

    items.forEach((item) => {
      if (item.itemType === 'Consumable') {
        const existingGroup = groupedMPs.find((group) => group.frameName === item.consumableName);
        if (existingGroup) {
          existingGroup.totalItems += 1;
          existingGroup.groupedInventoryItemDTO.push(item);
        } else {
          groupedMPs.push({
            quoteId: item.quoteId,
            cuttingListId: null,
            frameType: 'Consumable',
            frameName: item.consumableName,
            totalItems: 1,
            totalLengthOrQty: 0,
            groupedInventoryItemDTO: [item],
          });
        }
      } else {
        // const frameType = item.frameType;
        // const frameName = item.frameName;
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
    const addItemsDTO = {
      deliveryNoteId: this.data.deliveryNoteId,
      addConsumablesOnQuoteID: [],
      addManufacturedProductsID: [],
    };

    const removeItemsDTO = {
      deliveryNoteId: this.data.deliveryNoteId,
      removeConsumablesOnQuoteID: [],
      removeManufacturedProductsID: [],
    };

    // Get selected rows for removal
    const selectedRemoveRows = this.gridApi.getSelectedRows();
    console.log('Selected rows for removal in onSubmit:', selectedRemoveRows);

    selectedRemoveRows.forEach((itemSelected) => {
      console.log('Processing itemSelected for removal:', itemSelected);
      itemSelected.groupedInventoryItemDTO.forEach((inventoryItem) => {
        console.log('Processing inventoryItem for removal:', inventoryItem);
        if (inventoryItem.inventoryId) {
          if (inventoryItem.itemType === 'Consumable') {
            removeItemsDTO.removeConsumablesOnQuoteID.push(inventoryItem.inventoryId);
          } else {
            removeItemsDTO.removeManufacturedProductsID.push(inventoryItem.inventoryId);
          }
        } else {
          console.warn('Inventory item missing id for removal:', inventoryItem);
        }
      });
    });

    // Get selected rows for adding
    const selectedAddRows = this.inventoryGridApi.getSelectedRows();
    console.log('Selected rows for adding in onSubmit:', selectedAddRows);

    selectedAddRows.forEach((itemSelected) => {
      console.log('Processing inventoryItem for adding:', itemSelected);
      itemSelected.groupedInventoryItemDTO.forEach((inventoryItem) => {
        if (inventoryItem.inventoryId) {
          if (inventoryItem.itemType === 'Consumable') {
            addItemsDTO.addConsumablesOnQuoteID.push(inventoryItem.inventoryId);
          } else {
            addItemsDTO.addManufacturedProductsID.push(inventoryItem.inventoryId);
          }
        } else {
          console.warn('Inventory item missing id for adding:', inventoryItem);
        }
      });
    });

    console.log('Add items DTO:', addItemsDTO);
    console.log('Remove items DTO:', removeItemsDTO);

    // Handle adding items
    if (
      addItemsDTO.addConsumablesOnQuoteID.length > 0 ||
      addItemsDTO.addManufacturedProductsID.length > 0
    ) {
      this.deliveryNoteService.addItemsToDeliveryNote(addItemsDTO).subscribe({
        next: () => {
          console.log('Items added successfully');
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error adding items:', error);
          this.showAlert = true;
          this.alert = {
            type: 'error',
            message: 'Failed to add items to delivery note',
          };
        },
      });
    }

    // Handle removing items
    if (
      removeItemsDTO.removeConsumablesOnQuoteID.length > 0 ||
      removeItemsDTO.removeManufacturedProductsID.length > 0
    ) {
      this.deliveryNoteService.removeItemsFromDeliveryNote(removeItemsDTO).subscribe({
        next: () => {
          console.log('Items removed successfully');
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error removing items:', error);
          this.showAlert = true;
          this.alert = {
            type: 'error',
            message: 'Failed to remove items from delivery note',
          };
        },
      });
    } else {
      console.warn('No items selected for removal');
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
