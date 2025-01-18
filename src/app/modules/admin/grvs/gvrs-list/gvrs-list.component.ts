import { Component, HostListener, inject, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {
  ColDef,
  GridApi,
  GridReadyEvent,
  RowGroupingDisplayType,
  GridOptions,
  IServerSideDatasource,
  IServerSideGetRowsParams,
  CellClassParams,
} from 'ag-grid-enterprise';
import { AccessButtonAgGridComponent } from '../../../../utilities/ag-grid/access-button-ag-grid/access-button-ag-grid.component';
import { GrvService } from '../services/grv.service';
import { GrvSummaryRowData } from '../models/grvSummaryRowData';
import { EditButtonComponent } from 'app/utilities/ag-grid/edit-button/edit-button.component';
import { ModalService } from '@shared/services/modal.service';
import { AddGrvComponent } from '../add-grv/add-grv.component';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PageHeadingComponent } from '@layout/common/page-heading/page-heading.component';
import { AgGridModule } from 'ag-grid-angular';
import { GRVDetailsDTO } from '../models/grvStructuredDetails';
import { GRVPaginatedDetailsDTO } from '../models/GRVPaginatedDetails';
import getRowStyle from 'app/utilities/ag-grid/defaultRowStyle';
import {
  decimalFormatter,
  currencyFormatter,
  dateFromJSToMEDFormatter,
} from 'app/utilities/ag-grid/value-formatters';
import { AgGridRequest } from 'app/utilities/ag-grid/models/ag-grid-request';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '@environments/environment';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarModule } from '@angular/material/snack-bar';
import { DateTime } from 'luxon';
import { AgGridResponse } from 'app/utilities/ag-grid/models/ag-grid-response';
import { GRV_DEFAULT_COL_DEF } from './grv-defaultColDef';

@Component({
  selector: 'app-gvrs-list',
  templateUrl: './gvrs-list.component.html',
  styleUrls: ['./gvrs-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    AgGridModule,
    PageHeadingComponent,
    MatIconModule,
    MatButtonModule,
    RouterModule,
    MatSnackBarModule,
  ],
})
export class GvrsListComponent implements OnDestroy {
  rowCount?: number;
  getRowStyle = getRowStyle;
  public gridOptions: GridOptions = {
    debug: !environment.production,
    animateRows: true,
    copyHeadersToClipboard: true,
    enableRangeSelection: true,
    pagination: true,
    paginationPageSize: 10,
    paginationPageSizeSelector: [10, 20, 50, 100],
    cacheBlockSize: 10, // HERE BE DRAGONS
    rowModelType: 'serverSide',
    getRowStyle,
    overlayNoRowsTemplate: '<span class="no-rows">No GRVs To Show</span>',
    localeText: { noRowsToShow: 'No GRVs To Show' },
    getRowId: (params) => {
      return params.data.grvId;
    },
    suppressHorizontalScroll: true,
    defaultColDef: GRV_DEFAULT_COL_DEF,
  };

  // public columnDefs: ColDef[] =

  public columnDefs: ColDef[] = [
    {
      headerName: 'ID',
      field: 'grvId',
      cellRenderer: 'agGroupCellRenderer',
      width: 100,
      maxWidth: 100,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponentParams: {
        suppressFloatingFilterButton: true,
      },
      filterParams: {
        filterOptions: ['startsWith'],
        debounceMs: 500,
        maxNumConditions: 1,
      },
    },
    {
      headerName: 'Received',
      field: 'dateReceived',
      cellClass: 'text-right',
      width: 130,
      maxWidth: 130,
      valueFormatter: dateFromJSToMEDFormatter,
      filter: 'agDateColumnFilter',
      floatingFilter: true,
      filterParams: {
        filterOptions: ['before', 'after', 'inRange', 'equals'],
        defaultOption: 'equals',
        maxValidDate: DateTime.local().endOf('day').toJSDate(),
        debounceMs: 500,
        maxNumConditions: 1,
        comparator: this.agGridDateComparator,
      },
    },
    {
      headerName: 'Warehouse',
      field: 'warehouse',
      valueFormatter: (params) => this.capitalizeCellRenderer(params.value),
      width: 120,
      maxWidth: 150,
    },
    {
      headerName: 'Supplier',
      field: 'supplierName',
      tooltipField: 'supplierName',
      width: 180,
      maxWidth: 400,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponentParams: {
        suppressFloatingFilterButton: true,
      },
      filterParams: {
        filterOptions: ['contains'],
        debounceMs: 500,
        // suppressAndOrCondition: true,
        maxNumConditions: 1,
      },
    },
    {
      headerName: 'Comments',
      field: 'grvComments',
      tooltipField: 'grvComments',
      width: 180,
      maxWidth: 400,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponentParams: {
        suppressFloatingFilterButton: true,
      },
      filterParams: {
        filterOptions: ['contains'],
        debounceMs: 500,
        // suppressAndOrCondition: true,
        maxNumConditions: 1,
      },
      enableRowGroup: false,
    },
    {
      headerName: 'PO ID',
      field: 'purchaseOrderId',
      width: 100,
      maxWidth: 100,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponentParams: {
        suppressFloatingFilterButton: true,
      },
      filterParams: {
        filterOptions: ['startsWith'],
        debounceMs: 500,
        maxNumConditions: 1,
      },
    },
    {
      headerName: 'Supplier GRV Code',
      field: 'supplierGrvCode',
      tooltipField: 'supplierGrvCode',
      cellClass: 'text-right',
      width: 180,
      maxWidth: 200,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponentParams: {
        suppressFloatingFilterButton: true,
      },
      filterParams: {
        filterOptions: ['contains'],
        debounceMs: 500,
        maxNumConditions: 1,
      },
      enableRowGroup: false,
    },
    {
      field: 'grvId',
      headerName: 'View/Edit',
      width: 90,
      maxWidth: 120,
      editable: false,
      cellRenderer: EditButtonComponent,
      cellRendererParams: {
        onClick: this.accessGrv.bind(this),
        params: {
          field: 'grvId',
        },
      },
    },
    {
      headerName: 'Details',
      field: 'grvId',
      width: 90,
      maxWidth: 120,
      cellRenderer: AccessButtonAgGridComponent,
      cellRendererParams: {
        onClick: (id: number) => {
          this._router.navigate(['/grv', id]);
        },
      },
    },
  ];

  rowGroupPanelShow: 'always' | 'onlyWhenGrouping' | 'never' = 'always';
  groupDisplayType: RowGroupingDisplayType = 'groupRows';
  autoGroupColumnDef: ColDef = {
    minWidth: 200,
  };

  public detailCellRendererParams = {
    detailGridOptions: {
      overlayNoRowsTemplate: '<span class="no-rows">No Products To Show</span>',
      localeText: { noRowsToShow: 'No Products To Show' },
      getRowStyle,
      columnDefs: [
        {
          headerName: 'PO ID',
          field: 'purchaseOrderId',
          width: 100,
        },
        {
          headerName: 'Product Type',
          field: 'productType',
          flex: 1,
          valueFormatter: (params) => {
            if (!params.value || params.value === null) {
              return;
            }
            return params.value.charAt(0).toUpperCase() + params.value.slice(1);
          },
        },

        {
          headerName: 'Product Description',
          field: 'name',
          tooltipField: 'name',
          flex: 1,
          filter: 'agTextColumnFilter',
          floatingFilterComponentParams: {
            suppressFloatingFilterButton: true,
          },
          filterParams: {
            filterOptions: ['contains'],
            debounceMs: 500,
            maxNumConditions: 1,
          },
        },
        {
          headerName: 'Landed Unit Cost ($)',
          field: 'landedCostPerMtr',
          cellClass: 'text-right',
          cellClassRules: {
            'text-red-500': (params: CellClassParams) => params.value < 0,
          },
          flex: 1,
          valueFormatter: currencyFormatter,
        },
        {
          headerName: 'Landed Cost Per KG ($)',
          field: 'landedCostPerKg',
          cellClass: 'text-right',
          cellClassRules: {
            'text-red-500': (params: CellClassParams) => params.value < 0,
          },
          flex: 1,
          valueFormatter: currencyFormatter,
        },
        {
          headerName: 'Quantity',
          field: 'qty',
          cellClass: 'text-right',
          cellClassRules: {
            'text-red-500': (params: CellClassParams) => params.value < 0,
          },
          flex: 1,
          valueFormatter: decimalFormatter,
        },
        {
          headerName: 'Subtotal',
          field: 'total',
          cellClass: 'text-right',
          cellClassRules: {
            'text-red-500': (params: CellClassParams) => params.value < 0,
          },
          flex: 1,
          valueFormatter: currencyFormatter,
        },
      ],
    },
    getDetailRowData: (params) => {
      params.successCallback(params.data?.productInfo || []);
    },
  };

  private gridApi: GridApi<GrvSummaryRowData>;

  private readonly _grvService = inject(GrvService);
  private readonly modalService = inject(ModalService);
  private readonly _snackBar = inject(MatSnackBar);

  private getAllQuotesSubscription: Subscription;

  constructor(private _router: Router) {}

  ngOnDestroy(): void {
    this.getAllQuotesSubscription?.unsubscribe();
  }

  transformData(rawData: GRVPaginatedDetailsDTO[]): GrvSummaryRowData[] {
    return rawData.map(
      (row): GrvSummaryRowData => ({
        grvId: row.grvId,
        dateReceived: DateTime.fromSQL(row.dateReceived).toJSDate() || null,
        warehouse:
          row.details[0]?.steelCoilWarehouse || row.details[0]?.consumableWarehouse || 'N/A',
        supplierName: row.supplierName,
        grvComments: row.grvComments,
        supplierGrvCode: row.supplierGrvCode,
        purchaseOrderId: row.purchaseOrderId,
        productInfo: row.details
          .map((detail) => ({
            purchaseOrderId: row.details[0]?.purchaseOrderId || null,
            productType: detail?.consumableName ? 'consumable' : 'steel',
            landedCostPerMtr: detail?.avgLandedPrice || detail?.landedCostPerMtr || 0,
            landedCostPerKg: detail?.landedCostPerKg || 0,
            name:
              detail.consumableName ||
              (detail.color
                ? `${detail.width}mm ${detail.color} ${detail?.gauge || ''} - ${
                    detail?.coating || ''
                  }`
                : 'Unknown Product'),
            qty: detail?.qtyOrdered || detail?.estimatedMeterRunOnArrival || 0,
            total:
              (detail?.avgLandedPrice || detail?.landedCostPerMtr || 0) *
              (detail?.qtyOrdered || detail?.estimatedMeterRunOnArrival || 0),
          }))
          .filter((detail) => detail?.qty !== 0),
      }),
    );
  }

  onGridReady(params: GridReadyEvent<GrvSummaryRowData>) {
    this.gridApi = params.api;
    params.api.setGridOption('domLayout', 'autoHeight');
    this.gridApi.sizeColumnsToFit();
    params.api.setGridOption('serverSideDatasource', this.dataSource);
  }

  accessGrv(grvId: number): void {
    // Find the row data using the grvId
    const rowData = this.gridApi.getRowNode(grvId.toString())?.data;
    if (!rowData) {
      console.error('Row data not found for GRV ID:', grvId);
      return;
    }

    const dialog = this.modalService.open(AddGrvComponent, {
      data: { rowData, edit: true },
      width: '100%',
    });

    dialog.afterClosed().subscribe((grv: GRVDetailsDTO) => {
      if (!grv) return;
      this._grvService.updateGrv(grv).subscribe(() => {
        this.gridApi.refreshServerSide({ purge: true });
      });
    });
  }

  capitalizeCellRenderer(name: string) {
    if (name === null) return null;
    return name?.toUpperCase();
  }

  dataSource: IServerSideDatasource = {
    getRows: (params: IServerSideGetRowsParams) => {
      const gridRequest = params.request as AgGridRequest;
      // console.log('Server-side request:', gridRequest);

      this.getAllQuotesSubscription = this._grvService.getGrvsWithDetails(gridRequest).subscribe({
        next: (response: AgGridResponse<GRVPaginatedDetailsDTO[]>) => {
          console.log('response: ', response);
          const rowData = this.transformData(response.data);
          this.rowCount = response.lastRow;

          params.success({
            rowData,
            rowCount: response.lastRow,
          });
        },
        error: (error: unknown) => {
          this.rowCount = undefined;
          params.fail();

          const detailedErrorMessage =
            error instanceof HttpErrorResponse
              ? error.error.message || error.statusText
              : 'Unknown error';
          this._snackBar.open(`Error fetching grvs: ${detailedErrorMessage}`, null, {
            duration: environment.DEFAULT_SNACKBAR_TIMEOUT,
          } as MatSnackBarConfig);
          console.error('Error fetching grvs', error);
        },
      });
    },
  };

  @HostListener('document:keyup.escape', ['$event']) // Escape key
  onKeydownHandler($event: KeyboardEvent) {
    setTimeout(() => {
      // clear filters
      this.gridApi.setFilterModel(null);
      // clear sort order
      this.gridApi.applyColumnState({
        state: null,
        defaultState: { sort: null },
      });
      this.gridApi.autoSizeAllColumns();
    }, 0);
  }

  agGridDateComparator(filterDate: Date, cellDateString?: string): -1 | 0 | 1 {
    if (!cellDateString) {
      return 0;
    }

    const cellDateTime: DateTime = DateTime.fromSQL(cellDateString).startOf('day');
    const filterDateTime: DateTime = DateTime.fromJSDate(filterDate).startOf('day');

    if (cellDateTime < filterDateTime) {
      return -1;
    }

    if (cellDateTime > filterDateTime) {
      return 1;
    }

    return 0;
  }
}
