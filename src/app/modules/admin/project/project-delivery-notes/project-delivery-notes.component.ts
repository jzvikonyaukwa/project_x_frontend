import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ColDef, GridApi, GridReadyEvent, ISelectCellEditorParams } from 'ag-grid-enterprise';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CreateDeliveryNoteDialog } from './create-delivery-note-dialog/create-delivery-note-dialog.component';
import { MatInputModule } from '@angular/material/input';
import { SharedModule } from '@shared/shared.module';
import { AgGridAngular } from 'ag-grid-angular';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PageHeadingComponent } from '@layout/common/page-heading/page-heading.component';
import { Router, RouterLink } from '@angular/router';
import { DeliveryNotesService } from 'app/modules/admin/delivery-notes/services/delivery-notes.service';
import { DeliveryNote } from 'app/modules/admin/delivery-notes/models/delivery-note';
import { Subject, takeUntil } from 'rxjs';
import { ProjectOverview } from '../../projects/models/projectOverview';
import { AccessButtonAgGridComponent } from 'app/utilities/ag-grid/access-button-ag-grid/access-button-ag-grid.component';
import { IDetailCellRendererParams } from 'ag-grid-community';
import { InventoryItem } from '../../inventory/models/inventoryItem';
import { EmptyButtonComponent } from '../../../../utilities/ag-grid/empty-button/empty-button.component';
import { EditButtonComponent } from '../../../../utilities/ag-grid/edit-button/edit-button.component';
import { EditDeliveryNoteDialog } from './edit-delivery-note-dialog/edit-delivery-note-dialog.component';

@Component({
  selector: 'app-project-delivery-notes',
  templateUrl: './project-delivery-notes.component.html',
  styleUrls: ['./project-delivery-notes.component.scss'],
  imports: [
    MatInputModule,
    SharedModule,
    AgGridAngular,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    PageHeadingComponent,
    RouterLink,
  ],
  standalone: true,
})
export class ProjectDeliveryNotesComponent implements OnInit, OnDestroy {
  isEditableDeliveryNote: boolean;
  @Input() projectOverview: ProjectOverview;
  statuses = ['DELIVERED', 'PENDING_DELIVERY', 'DELIVERY_FAILED'];
  public pagination = true;
  public gridApi!: GridApi<DeliveryNote>;
  public paginationPageSize = 10;
  public paginationPageSizeSelector: number[] | boolean = [10, 20, 50];
  public rowData: DeliveryNote[] = [];
  public columnDefs: ColDef[] = [
    {
      headerName: 'Delivery Note ID',
      field: 'id',
      width: 120,
      sortable: true,
      filter: true,
      cellRenderer: 'agGroupCellRenderer',
    },
    {
      headerName: 'Date Created',
      field: 'dateCreated',
      sortable: true,
      filter: true,
    },
    {
      headerName: 'Date Delivered',
      field: 'dateDelivered',
      sortable: true,
      filter: true,
    },
    {
      headerName: 'Delivery Address',
      field: 'deliveryAddress',
      sortable: true,
      filter: true,
    },
    {
      headerName: 'Number of Items',
      field: 'inventories',
      sortable: true,
      filter: true,
      valueGetter: (params) => {
        const inventories = params.data.inventories;
        if (Array.isArray(inventories)) {
          return inventories.reduce((sum, inventory) => {
            let quantity = 0;
            if (inventory.product) {
              quantity += inventory.product.totalQuantity || 0;
            }
            if (inventory.consumable) {
              quantity += inventory.consumable.qty || 0;
            }
            return sum + quantity;
          }, 0);
        }
        return 0;
      }
    },
    {
      headerName: 'Status',
      field: 'status',
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: this.statuses,
      } as ISelectCellEditorParams,
    },
    {
      field: 'id',
      width: 90,
      headerName: 'Edit Delivery Note',
      cellRendererSelector: (params) => {
        return {
          component: this.isEditableDeliveryNote ? EditButtonComponent : EmptyButtonComponent,
        };
      },
      cellRendererParams: {
        onClick: (deliveryNoteId: number) => this.openEditDialog(deliveryNoteId),
      },
    },
    {
      field: 'id',
      headerName: 'View Delivery Note',
      cellRenderer: AccessButtonAgGridComponent,
      width: 150,
      cellRendererParams: {
        onClick: (deliveryNoteId: number) =>
          this._router.navigate(['/delivery-note', deliveryNoteId], {
            state: { projectOverview: this.projectOverview },
          }),
      },
    },
  ];

  public defaultColDef: ColDef = {
    resizable: true,
    sortable: true,
    filter: true,
    flex: 1,
    minWidth: 100,
  };

  public detailCellRendererParams: any = {
    detailGridOptions: {
      columnDefs: [
        {
          field: 'id',
          headerName: ' Inventory ID',
          valueGetter: (params) => {
            return params.data.id;
          },
        },
        {
          field: 'dateIn',
        },
        { field: 'dateOut' },
        {
          field: 'data',
          headerName: 'Product Type',
          valueGetter: (params) => {
            if (params.data.product) {
              return params.data.product.productType.name;
            } else if (params.data.consumable) {
              return 'Consumable';
            } else {
              return 'Unknown';
            }
          },
        },
        {
          field: 'data',
          headerName: 'Product Description',
          valueGetter: (params) => {
            if (params.data.product) {
              let description = '';
              if (params.data.product.productType) {
                description += params.data.product.productType.name + ' ';
              }
              if (params.data.product.frameName) {
                description += params.data.product.frameName;
              }
              return description;
            } else if (params.data.consumable) {
              return params.data.consumable.consumable.name;
            } else {
              return '';
            }
          },
        },
        {
          field: 'quantity',
          headerName: 'Quantity',
          valueGetter: (params) => {
            if (params.data.product) {
              // TODO: check this
              return params.data.product.totalQuantity;
            } else if (params.data.consumable) {
              return params.data.consumable.qty;
            } else {
              return 0;
            }
          },
        },
      ],
      defaultColDef: {
        flex: 1,
      },
    },
    getDetailRowData: (params) => {
      params.successCallback(params.data.inventories);
    },
  } as IDetailCellRendererParams<DeliveryNote, InventoryItem>;

  private ngUnsubscribe = new Subject<void>();

  constructor(
    private deliveryNotesService: DeliveryNotesService,
    private dialog: MatDialog,
    private _router: Router,
  ) {}

  ngOnInit() {
    this.loadDeliveryNotes();
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
    params.api.setGridOption('domLayout', 'autoHeight');
  }

  loadDeliveryNotes() {
    this.deliveryNotesService
      .getDeliveryNotesByProjectId(this.projectOverview.project.id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((data: DeliveryNote[]) => {
        console.log('DATA ===>', data);
        this.rowData = data;
        this.gridApi.setGridOption('rowData', this.rowData);
        this.checkIfDeliveryNotesAreEditable();
      });
  }

  onCellValueChanged(event) {
    if (event.colDef.field === 'status') {
      const newStatus = event.newValue;
      const id = event.data.id;

      console.log('Status changed to', newStatus);
      this.updateDeliveryNoteStatus(id, newStatus);
    }
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(CreateDeliveryNoteDialog, {
      width: '1200px',
      data: {
        project: this.projectOverview.project,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadDeliveryNotes();
      }
    });
  }

  openEditDialog(deliveryNoteId: number) {
    const dialogRef = this.dialog.open(EditDeliveryNoteDialog, {
      width: '1200px',
      data: {
        project: this.projectOverview.project,
        deliveryNoteId: deliveryNoteId,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadDeliveryNotes();
      }
    });
  }

  checkIfDeliveryNotesAreEditable() {
    this.rowData.forEach((deliveryNote) => {
      this.deliveryNotesService.isEditableDeliveryNote(deliveryNote.id).subscribe((isEditable) => {
        this.isEditableDeliveryNote = isEditable;
        this.gridApi.refreshCells({ force: true });
      });
    });
  }
  updateDeliveryNoteStatus(id: number, status: string): void {
    this.deliveryNotesService.updateDeliveryNoteStatus(id, status).subscribe({
      next: () => {
        console.log('Status updated successfully');
        this.loadDeliveryNotes();
      },
      error: (error) => {
        console.error('Error updating status', error);
      },
    });
  }

  lastRowBorder(params) {
    if (params.node.rowIndex % 2 !== 0) {
      return {
        'background-color': '#EFF7FC',
      };
    } else {
      return {
        'background-color': '#FFFFFF',
      };
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
