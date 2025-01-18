import { CommonModule } from '@angular/common';
import { Component, DestroyRef, Input, OnDestroy, OnInit } from '@angular/core';
import { StockOnHandService } from './services/stock-on-hand.service';
import { AgGridModule } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-enterprise';
import { MatIconModule } from '@angular/material/icon';
import { MadeProduct } from '../models/madeProduct';
import { FormControl } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { COLUMN_DEFINITIONS } from 'app/utilities/ag-grid/column-definitions';

@Component({
  selector: 'app-stock-on-hand',
  templateUrl: './stock-on-hand.component.html',
  standalone: true,
  imports: [CommonModule, AgGridModule, MatIconModule],
  styleUrls: ['./stock-on-hand.component.scss'],
})
export class StockOnHandComponent implements OnInit, OnDestroy {
  @Input('searchValue') searchValue: FormControl<string>;
  stockOnHand: MadeProduct[] = [];
  public pagination = true;
  public paginationPageSize = '10';
  public totalReceived: number = 0;
  public totalRemaining: number = 0;
  public gridApi!: GridApi<any>;
  public rowData: MadeProduct[];
  public columnDefs: ColDef[] = [
    {
      headerName: 'STOCK ON HAND ID',
      field: 'id',
    },
    {
      headerName: 'Product Type',
      field: 'productName',
      valueFormatter: (params) => {
        if (params.value) {
          return params.value.charAt(0).toUpperCase() + params.value.slice(1);
        }
        return params.value;
      },
    },
    {
      headerName: 'STICK TYPE',
      field: 'stickType',
      valueFormatter: (params) => {
        if (params.value) {
          return params.value.charAt(0).toUpperCase() + params.value.slice(1);
        }
        return params.value;
      },
    },
    {
      headerName: 'STEEL COIL ID FROM',
      field: 'steelCoilId',
    },
    {
      headerName: 'STEEL COIL NUMBER',
      field: 'steelCoilNumber',
    },
    {
      headerName: 'GAUGE',
      field: 'gauge',
    },
    {
      headerName: 'COLOR',
      field: 'color',
    },
    {
      headerName: 'LENGTH',
      field: 'length',
    },
    {
      headerName: 'MANUFACTURED DATE',
      field: 'manufacturedDate',
      valueFormatter: (params) => {
        if (params.value) {
          const dateParts = params.value.split('T')[0].split('-');
          return `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
        }
      },
    },
    {
      headerName: 'PICKED DATE',
      field: 'datePicked',
      valueFormatter: (params) => {
        if (params.value) {
          const dateParts = params.value.split('T')[0].split('-');
          return `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
        }
      },
    },
    {
      headerName: 'STATUS',
      field: 'status',
      valueFormatter: (params) => {
        // capitalizeFirstLetter
        if (params.value) {
          return params.value.charAt(0).toUpperCase() + params.value.slice(1);
        }
        return params.value;
      },
    },
  ];

  public defaultColDef: ColDef = COLUMN_DEFINITIONS;

  constructor(private stockOnHandService: StockOnHandService, private destroyRef: DestroyRef) {}

  ngOnInit() {
    this.stockOnHandService
      .getAllStockOnHand()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((stockOnHand: MadeProduct[]) => {
        this.rowData = stockOnHand;
        console.log('stockOnHand: ', stockOnHand);
      });

    this.searchValue?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value: string) => {
        if (this.gridApi && !this.gridApi.isDestroyed()) {
          this.gridApi.setGridOption('quickFilterText', value);
        }
      });
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
    params.api.setGridOption('domLayout', 'autoHeight');
  }

  exportToExcel() {
    this.gridApi.exportDataAsExcel();
  }

  onPaginationChanged() {
    console.log('onPaginationPageLoaded');

    if (this.rowData!) {
      // Workaround for bug in events order
      if (this.gridApi!) {
        console.log('IN');
        this.setText('#lbCurrentPage', this.gridApi.paginationGetCurrentPage() + 1);
        this.setText('#lbTotalPages', this.gridApi.paginationGetTotalPages());
      }
    }
  }

  onPageSizeChanged(): void {
    const value = (document.getElementById('page-size') as HTMLInputElement).value;
    this.paginationPageSize = value;
    this.gridApi.paginationSetPageSize(Number(value));
  }

  onBtNext() {
    this.gridApi.paginationGoToNextPage();
  }

  onBtPrevious() {
    this.gridApi.paginationGoToPreviousPage();
  }

  setText(selector: string, text: any) {
    (document.querySelector(selector) as any).innerHTML = text;
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

  ngOnDestroy(): void {
    this.searchValue?.reset('');
  }
}
