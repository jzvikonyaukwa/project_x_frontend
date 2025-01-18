import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ColDef,
  GetRowIdParams,
  GridApi,
  GridOptions,
  GridReadyEvent,
  ITooltipParams,
} from 'ag-grid-enterprise';
import { AgGridModule } from 'ag-grid-angular';
import { DeleteButtonAgGridComponent } from '@shared/components/delete-button-ag-grid/delete-button-ag-grid.component';
import { COLUMN_DEFINITIONS } from 'app/utilities/ag-grid/column-definitions';
import { EmptyButtonComponent } from 'app/utilities/ag-grid/empty-button/empty-button.component';
import getRowStyle from 'app/utilities/ag-grid/defaultRowStyle';
import BigNumber from 'bignumber.js';
import { currencyFormatter, decimalFormatter } from 'app/utilities/ag-grid/value-formatters';
import { ConsumableOnQuote } from 'app/modules/admin/consumables/models/consumableOnQuote';
import { Quote } from '../../../models/quote';

@Component({
  selector: 'app-consumables-on-quote-table',
  standalone: true,
  imports: [CommonModule, AgGridModule],
  templateUrl: './consumables-on-quote-table.component.html',
  styleUrls: ['./consumables-on-quote-table.component.scss'],
})
export class ConsumablesOnQuoteTableComponent implements OnInit, OnChanges, OnDestroy {
  @Input() quote: Quote | null = null;
  @Output() readonly onLineItemDeleted: EventEmitter<number> = new EventEmitter<number>();

  rowData: ConsumableOnQuote[] = [];
  getRowStyle = getRowStyle;

  private gridApi: GridApi;
  public columnDefs: ColDef[];
  public defaultColDef: ColDef = { ...COLUMN_DEFINITIONS, width: 100, filter: false };

  private isGridReady = false;

  public gridOptions: GridOptions = {
    copyHeadersToClipboard: true,
    enableRangeSelection: true,
    animateRows: true,
    overlayNoRowsTemplate: '<span class="no-rows">No Consumables To Show</span>',
    localeText: { noRowsToShow: 'No Consumables To Show' },
    getRowId: (params: GetRowIdParams<ConsumableOnQuote>) => {
      return params.data ? `${params.data.id}` : '';
    },
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.quote?.currentValue) {
      console.log('In ConsumablesOnQuoteTableComponent and quote = ', changes.quote.currentValue);
      this.quote = changes.quote.currentValue;
      this.rowData = this.quote.consumablesOnQuote;

      if (this.isGridReady) {
        this.gridApi.updateGridOptions({ rowData: this.rowData });
      }
    }
  }

  ngOnInit(): void {
    this.createColumnDefs();
  }

  createColumnDefs() {
    this.columnDefs = [
      {
        headerName: 'Product Description',
        field: 'consumable.name',
        width: 180,
        maxWidth: 800,
        tooltipField: 'consumable.name',
        filter: true,
        tooltipValueGetter: (p: ITooltipParams<ConsumableOnQuote>) => p.data.consumable?.name || '', // Handle null case
      },
      {
        headerName: 'UOM',
        field: 'consumable.uom',
        cellClass: 'text-center',
        width: 90,
        maxWidth: 120,
        sortable: false,
        valueGetter: (params) => {
          if (params.data?.consumable?.uom && typeof params.data?.consumable?.uom === 'string') {
            return (
              params.data.consumable.uom.charAt(0).toUpperCase() +
              params.data.consumable.uom.slice(1)
            );
          }
          return null;
        },
      },
      {
        headerName: 'Qty',
        field: 'qty',
        cellClass: 'text-right',
        maxWidth: 120,
        valueFormatter: decimalFormatter,
      },
      {
        headerName: 'Cost ($)',
        field: 'costPrice',
        cellClass: 'text-right',
        maxWidth: 200,
        valueFormatter: currencyFormatter,
      },
      {
        headerName: 'Sell Price',
        field: 'sellPrice',
        cellClass: 'text-right',
        maxWidth: 200,
        valueFormatter: currencyFormatter,
      },
      {
        headerName: '',
        field: '',
        cellClass: (params: any) => {
          const costPrice = params.data?.costPrice || 0;
          const sellPrice = params.data?.sellPrice || 0;
          return sellPrice <= costPrice ? ['text-right', 'text-red-500'] : 'text-right';
        },
        maxWidth: 120,
        valueFormatter: (params) => {
          if (!params.data.sellPrice || !params.data.costPrice || !params.data.qty) return '';
          const percent = BigNumber(params.data.sellPrice)
            .dividedBy(params.data.costPrice)
            .minus(1)
            .multipliedBy(100)
            .decimalPlaces(2)
            .toNumber();
          return new Intl.NumberFormat('en-US', {
            style: 'percent',
            maximumFractionDigits: 2,
          }).format(percent / 100);
        },
      },
      {
        headerName: 'Markup ($)',
        field: 'sellPrice',
        cellClass: 'text-right',
        maxWidth: 200,
        valueGetter: (params) => {
          return params.data.qty * (params.data.sellPrice - params.data.costPrice);
        },
        valueFormatter: currencyFormatter,
      },
      {
        headerName: 'Subtotal',
        cellClass: 'text-right',
        valueGetter: (value) => {
          return value.data.qty * (value.data.sellPrice || 0);
        },
        valueFormatter: (params) => {
          if (!params.data.qty) return '';
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
          }).format(params.value);
        },
        maxWidth: 200,
      },
      {
        headerName: 'INVOICE',
        field: 'invoiceId',
        cellClass: 'text-right',
        maxWidth: 150,
        filter: true,
      },
      {
        field: 'id',
        headerName: 'DELETE',
        maxWidth: 150,
        sortable: false,
        cellRendererSelector: (params) => {
          // Check both conditions: if inSalesOrder is false and invoiceId is null
          return {
            component:
              params.data.invoiceId === null ? DeleteButtonAgGridComponent : EmptyButtonComponent,
          };
        },
        cellRendererParams: {
          onClick: (id: string) => this.delete(Number(id)),
        },
      },
    ];
  }

  onGridReady(params: GridReadyEvent<any>) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
    params.api.setGridOption('domLayout', 'autoHeight');
    this.isGridReady = true;
  }

  delete(consumableOnQuoteID: number): void {
    this.onLineItemDeleted.emit(consumableOnQuoteID);
  }

  ngOnDestroy(): void {}

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
}
