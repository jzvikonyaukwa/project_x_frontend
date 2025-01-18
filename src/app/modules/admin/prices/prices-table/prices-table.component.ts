import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, tap } from 'rxjs';
import { PricesAndProductDTO } from '../models/pricesAndProductDTO';
import { PricesService } from '../prices.service';
import {
  CellEditRequestEvent,
  ColDef,
  GetRowIdFunc,
  GetRowIdParams,
  GridApi,
  GridReadyEvent,
} from 'ag-grid-community';
import { AgGridModule } from 'ag-grid-angular';
import { SharedModule } from '@shared/shared.module';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { priceColumnDefs } from './prices-table-column-def';

@Component({
  selector: 'app-prices-table',
  standalone: true,
  templateUrl: './prices-table.component.html',
  styleUrls: ['./prices-table.component.scss'],
  imports: [CommonModule, AgGridModule, SharedModule, MatIconModule, MatButtonModule],
})
export class PricesTableComponent {
  public paginationPageSize = '10';
  public pagination = true;
  public gridApi!: GridApi<PricesAndProductDTO>;
  public columnDefs: ColDef[] = priceColumnDefs;

  public defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    unSortIcon: true,
    headerClass: 'ag-grid-header',
  };

  prices$: Observable<PricesAndProductDTO[]> = this.pricesService
    .getAllPricesAndTheirProducts()
    .pipe(
      tap((prices) => {
        this.prices = prices;
      }),
    );

  prices: PricesAndProductDTO[] = [];

  public getRowId: GetRowIdFunc = (params: GetRowIdParams) => params.data.priceId;

  constructor(private pricesService: PricesService) {}

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
    params.api.setGridOption('domLayout', 'autoHeight');
  }

  onPaginationChanged() {
    console.log('onPaginationPageLoaded');
    // Workaround for bug in events order
    if (this.gridApi!) {
      this.setText('#lbCurrentPage', this.gridApi.paginationGetCurrentPage() + 1);
      this.setText('#lbTotalPages', this.gridApi.paginationGetTotalPages());
    }
  }

  onBtNext() {
    this.gridApi.paginationGoToNextPage();
  }

  onBtPrevious() {
    this.gridApi.paginationGoToPreviousPage();
  }

  public onPageSizeChanged(): void {
    const value = (document.getElementById('page-size') as HTMLInputElement).value;
    this.paginationPageSize = value;
    // this.gridApi.paginationSetPageSize(Number(value));
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

  onCellEditRequest(event: CellEditRequestEvent) {
    const oldData = event.data;
    const field = event.colDef.field;
    const newValue = event.newValue;
    const newData = { ...oldData };
    newData[field!] = event.newValue;
    console.log('onCellEditRequest, updating ' + field + ' to ' + newValue);

    this.pricesService.updatePrice(newData).subscribe((res) => {
      const tx = {
        update: [res],
      };

      this.gridApi.applyTransaction(tx);
    });
  }
}
