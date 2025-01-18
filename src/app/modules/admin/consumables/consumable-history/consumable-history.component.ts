import { Component, inject, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ColDef,
  GridApi,
  GridOptions,
  GridReadyEvent,
  RowClassParams,
  RowStyle,
  ValueFormatterParams,
} from 'ag-grid-enterprise';
import { AgGridModule } from 'ag-grid-angular';
import { Subscription } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { ConsumablesInWarehouseService } from '../services/consumables-in-warehouse.service';
import { InventoryBalance } from '../models/inventory-balance';
import { DateTime } from 'luxon';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { PageHeadingComponent } from '@layout/common/page-heading/page-heading.component';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarModule } from '@angular/material/snack-bar';
import { Consumable } from '../models/consumable';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-consumable-history',
  standalone: true,
  imports: [
    CommonModule,
    AgGridModule,
    MatIconModule,
    FormsModule,
    // MatFormFieldModule,
    // MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    ReactiveFormsModule,
    PageHeadingComponent,
  ],
  templateUrl: './consumable-history.component.html',
  styleUrls: ['./consumable-history.component.scss'],
})
export class ConsumableHistoryComponent implements OnDestroy {
  @Input() warehouseID: number;
  @Input() consumableID: number;

  consumable?: Consumable;

  startDate: Date = DateTime.now()
    .minus({ months: 3 })
    .startOf('month')
    .toSQLDate() as unknown as Date;

  public gridApi!: GridApi<InventoryBalance>;
  public rowData: InventoryBalance[] = [];
  public gridOptions: GridOptions = {
    paginationAutoPageSize: true,
    pagination: false,
    animateRows: true,
    overlayNoRowsTemplate: '<span class="no-rows">Consumable has no history</span>',
    localeText: { noRowsToShow: 'Consumable has no history' },
  };

  public columnDefs: ColDef[] = [
    {
      field: 'transactionDate',
      cellClass: 'text-right',
      pinned: 'left',
      width: 200,
      maxWidth: 200,
      valueFormatter: this.agGridDateValueFormatter,
    } as ColDef,
    {
      field: 'transactionType',
      headerName: 'Type',
      // cellClass: "text-center",
      valueFormatter: (params) => {
        return params.value
          ? params.data.referenceID
            ? `${params.value} - ${params.data.referenceID}`
            : params.value
          : '';
      },
      pinned: 'left',
      width: 200,
      maxWidth: 200,
    } as ColDef,
    {
      field: 'unitCost',
      headerName: 'Unit Cost ($)',
      cellClass: (params) => {
        if (params.value && params.value < 0) {
          return ['text-right', 'text-red-500'];
        } else {
          return 'text-right';
        }
      },
      valueFormatter: (params) => {
        if (!params.value) return '';
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(params.value);
      },
      width: 150,
    } as ColDef,
    {
      field: 'transactionQuantity',
      headerName: 'Quantity',
      cellClass: 'text-right',
      valueFormatter: (params) => {
        if (!params.value) return '';
        return new Intl.NumberFormat('en-US', {
          style: 'decimal',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(params.value);
      },
      width: 150,
      maxWidth: 150,
      sortable: false,
    } as ColDef,
    {
      field: 'transactionValue',
      headerName: 'Value ($)',
      cellClass: (params) => {
        // if (params.data.transactionQuantity === null) {
        //   return ['text-right', 'underline'];
        // } else
        if (params.data.transactionType === 'GRV') {
          return ['text-right', 'text-green-700'];
        } else if (params.value && params.value < 0) {
          return ['text-right', 'text-red-500'];
        } else {
          return 'text-right';
        }
      },
      valueFormatter: (params) => {
        if (!params.value) return '';
        const formattedValue = new Intl.NumberFormat('en-US', {
          style: 'decimal',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }) //
          .format(Math.abs(params.value));
        return params.value < 0 ? `($${formattedValue})` : `$${formattedValue}  `;
      },
      width: 150,
    } as ColDef,
    {
      field: 'stockBalance',
      cellClass: 'text-right',
      headerName: 'Running Total',
      valueFormatter: (params) => {
        if (params.value === null || params.value === undefined) return '';
        return new Intl.NumberFormat('en-US', {
          style: 'decimal',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(params.value);
      },
    } as ColDef,
  ];

  private readonly _snackBar = inject(MatSnackBar);
  private readonly consumableInWarehouseService = inject(ConsumablesInWarehouseService);

  public defaultColDef: ColDef = {
    wrapHeaderText: true,
    minWidth: 100,
    maxWidth: 250,
    filter: false,
    resizable: true,
    sortable: false,
  } as ColDef;

  private getConsumableHistorySubscription: Subscription;
  private fetchConsumableDetailsSubscription: Subscription;

  // can only select date within the last calender year
  readonly minDate: Date = DateTime.now().minus({ years: 1 }).startOf('day').toJSDate();
  readonly maxDate: Date = DateTime.now().startOf('day').toJSDate();

  fg: FormGroup = this.fb.group({
    startDate: [],
  });

  constructor(private readonly fb: FormBuilder) { }

  ngOnInit(): void {
    this.fetchConsumableDetailsSubscription = this.consumableInWarehouseService
      .fetchConsumableDetails(this.consumableID)
      .subscribe({
        next: (response: Consumable) => {
          this.consumable = response;
        },
        error: (errorResponse) => {
          const detailedErrorMessage =
            errorResponse instanceof HttpErrorResponse
              ? errorResponse.error.message || errorResponse.statusText
              : 'Unknown error';
          this._snackBar.open(`Error updating Quote price: ${detailedErrorMessage}`, null, {
            duration: environment.DEFAULT_SNACKBAR_TIMEOUT,
          } as MatSnackBarConfig);
          console.error('Error updating Quote price', errorResponse);
        },
      });

    this.fg.valueChanges.subscribe((formValue) => {
      // console.log(formValue);
      this.startDate = formValue.startDate;
      this.getConsumableHistorySubscription?.unsubscribe();
      this.getConsumableHistorySubscription = this.consumableInWarehouseService
        .fetchConsumableHistory(this.warehouseID, this.consumableID, this.startDate)
        .subscribe({
          next: (response: InventoryBalance[]) => {
            // take last element of array
            const lastElement = response[response.length - 1];
            // remove last element
            // data[data.length - 1] = [];
            this.rowData = this.processData(response);
            this.createPinnedRow(lastElement);
          },
          error: (errorResponse) => {
            const detailedErrorMessage =
              errorResponse instanceof HttpErrorResponse
                ? errorResponse.error.message || errorResponse.statusText
                : 'Unknown error';
            this._snackBar.open(`Error fetching consumable history: ${detailedErrorMessage}`);
            console.error('Error fetching consumable history', errorResponse);
          },
        });
    });

    this.fg
      .get('startDate')
      .setValue(DateTime.now().minus({ months: 3 }).startOf('month').toJSDate());
  }

  processData(data: InventoryBalance[]): InventoryBalance[] {
    if (data && data.length > 1) {
      // SETUP BALANCE B/F
      // inject row at beginning of array copying the first element
      data.unshift({ ...data[0] });
      // set transcation type to BALANCE B/F
      data[0].transactionType = 'BALANCE B/F';
      data[0].unitCost = undefined;
      data[0].transactionQuantity = undefined;
      data[0].transactionValue = undefined;
      data[0].referenceID = undefined;
    }

    // set transactionQuantity to null if transactionType is BALANCE
    data.forEach((item) => {
      if (item.transactionType === 'BALANCE') {
        item.transactionQuantity = null;
      } else if (item.transactionType === 'GRV') {
        item.transactionQuantity = item.transactionQuantity * -1;
        item.transactionValue = item.transactionValue * -1;
        item.stockBalance = item.stockBalance + item.transactionQuantity;
      } else if (item.transactionType === 'INVOICE') {
        item.transactionValue = item.transactionValue * -1;
        item.stockBalance = item.stockBalance - item.transactionQuantity;
      }
    });
    return data;
  }

  ngOnDestroy(): void {
    this.fetchConsumableDetailsSubscription?.unsubscribe();
    this.getConsumableHistorySubscription?.unsubscribe();
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
    // params.api.setGridOption('domLayout', 'autoHeight');
    // this.createPinnedRow(this.rowData);
  }

  exportToExcel() {
    this.gridApi.exportDataAsExcel();
  }

  createPinnedRow(row: InventoryBalance): void {
    // console.log(row);
    const pinnedRowData = [
      {
        transactionType: 'BALANCE',
        transactionValue: row.transactionValue,
        stockBalance: row.stockBalance,
        unitCost: row.unitCost,
      },
    ];

    // this.gridApi.setGridOption('pinnedTopRowData', pinnedRowData);
    this.gridApi.setGridOption('pinnedBottomRowData', pinnedRowData);
  }

  getRowStyle(params: RowClassParams): RowStyle {
    return {
      'background-color': params.node.rowIndex % 2 !== 0 ? '#EFF7FC' : '#FFFFFF',
    };
  }

  agGridDateValueFormatter(params: ValueFormatterParams<InventoryBalance>): string {
    return params.value ? DateTime.fromSQL(params.value).toLocaleString(DateTime.DATE_MED) : '';
  }
}
