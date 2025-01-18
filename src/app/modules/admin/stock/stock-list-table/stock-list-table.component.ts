import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridModule } from 'ag-grid-angular';
import {
  ChartToolPanelsDef,
  ColDef,
  FirstDataRenderedEvent,
  GridReadyEvent,
  RowClassParams,
  RowStyle,
} from 'ag-grid-enterprise';
import 'ag-grid-enterprise';
import { stockTableColumnDefs } from './models/stockTableColumnDefs';
import { Router } from '@angular/router';
import { SteelCoilsInStock } from '../../../../shared/models/steelCoilsInStock';
import { COLUMN_DEFINITIONS } from 'app/utilities/ag-grid/column-definitions';
import { StocksService } from '../../../../shared/services/stocks.service';
import { Subscription } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { currencyFormatter } from 'app/utilities/ag-grid/currencyFormatter';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarModule } from '@angular/material/snack-bar';
import { BigNumber } from 'bignumber.js';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-stock-list-table',
  standalone: true,
  imports: [CommonModule, AgGridModule, MatIconModule, MatSnackBarModule],
  templateUrl: './stock-list-table.component.html',
  styleUrls: ['./stock-list-table.component.scss'],
})
export class StockListTableComponent implements OnInit, OnDestroy {
  public pagination = true;
  public paginationPageSize = '10';
  paginationPageSizeSelector = [10, 20, 50, 100];
  rowData: SteelCoilsInStock[] = [];
  chart: string;

  public columnDefs: ColDef[] = stockTableColumnDefs((id: string) => {
    this._router.navigate(['/stocks/', id]);
  });

  public defaultColDef: ColDef = COLUMN_DEFINITIONS;

  public chartToolPanelsDef: ChartToolPanelsDef = {
    panels: [],
  };

  public groupDisplayType = 'groupRows';
  public gridApi;

  private readonly _snackBar = inject(MatSnackBar);
  private readonly stockService = inject(StocksService);

  // EVENT HANDLERS
  getAllStockSubscription: Subscription;

  constructor(private _router: Router) {
    BigNumber.set({
      // DECIMAL_PLACES: this.DECIMAL_PLACES,
      ROUNDING_MODE: 4, // 4 is round half up
    });
  }

  ngOnInit(): void {
    this.getAllStockSubscription = this.stockService.getAllStock().subscribe({
      next: (response: SteelCoilsInStock[]) => {
        // filter owned stock
        const ownedStock = response.filter((item) => 'owned' === item.warehouse);
        // filter out any coils with 0 meters remaining
        const coilsWithMetersRemaining = ownedStock.filter((coil) => coil.estMtrsRemaining > 0);
        // sum up the estimated meters remaining for each unique color, width, and gauge
        this.rowData = this.sumEstMtrsRemaining(coilsWithMetersRemaining);

        this.createPinnedRow(this.rowData);
      },
      error: (errorResponse) => {
        const detailedErrorMessage =
          errorResponse instanceof HttpErrorResponse
            ? errorResponse.error.message || errorResponse.statusText
            : 'Unknown error';
        this._snackBar.open(`Error fetching all stock: ${detailedErrorMessage}`, null, {
          duration: environment.DEFAULT_SNACKBAR_TIMEOUT,
        } as MatSnackBarConfig);
        console.error('Error fetching all stock', errorResponse);
      },
    });
  }

  ngOnDestroy(): void {
    this.getAllStockSubscription?.unsubscribe();
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
    this.gridApi.setGridOption('domLayout', 'autoHeight');

    this.createPinnedRow(this.rowData);
  }

  createPinnedRow(rowData: SteelCoilsInStock[]): void {
    const totalSteelCoilsValue: number = +this.calculateTotalCost(rowData).toFixed(2);
    const pinnedTotalValueRow = [
      {
        color: 'TOTAL VALUE',
        totalCost: currencyFormatter(totalSteelCoilsValue),
      },
    ];

    this.gridApi.setGridOption('pinnedBottomRowData', pinnedTotalValueRow);
  }

  calculateTotalCost(steelCoils: SteelCoilsInStock[]): number {
    return steelCoils.reduce((runningTotalCost: number, coil: SteelCoilsInStock) => {
      const totalCoilCost = BigNumber(coil.estMtrsRemaining).times(
        BigNumber(coil.landedCostPerMtr),
      );
      return +BigNumber(runningTotalCost).plus(totalCoilCost).toFixed(6) as unknown as number;
    }, 0);
  }

  sumEstMtrsRemaining(steelCoilsInStock: SteelCoilsInStock[]): SteelCoilsInStock[] {
    // group filtered data by color, width, and gauge
    // place in array to calc avg cost per m
    const groupedCoils: { [key: string]: SteelCoilsInStock[] } = {};
    for (const coil of steelCoilsInStock) {
      const normalizedColor = coil.color.replace(/\s/g, '_').toLowerCase();
      const normalizedGauge = `${coil.gauge}`.replace(/\./g, '');
      const coilGroupingKey = `${normalizedColor}${coil.width}${normalizedGauge}`;

      if (!groupedCoils[coilGroupingKey]) {
        groupedCoils[coilGroupingKey] = [];
      }
      groupedCoils[coilGroupingKey] = [...groupedCoils[coilGroupingKey], coil];
    }

    // Calculate estimated meters remaining and average cost per meter for each group
    const aggregatedCoils: SteelCoilsInStock[] = Object.entries(groupedCoils).map(
      ([key, currentCoilGroup]) => {
        const estimatedMetersRemaining = currentCoilGroup.reduce((acc, curr) => {
          return BigNumber(acc)
            .plus(BigNumber(curr.estMtrsRemaining))
            .toFixed(6) as unknown as number;
        }, 0);

        const totalCoilCost = currentCoilGroup.reduce((acc, curr) => {
          return BigNumber(acc)
            .plus(BigNumber(curr.estMtrsRemaining).times(BigNumber(curr.landedCostPerMtr)))
            .toFixed(6) as unknown as number;
        }, 0);

        const averageCostPerMeter = BigNumber(totalCoilCost)
          .div(BigNumber(estimatedMetersRemaining))
          .toFixed(6) as unknown as number;
        return {
          ...currentCoilGroup[0],
          estMtrsRemaining: +estimatedMetersRemaining,
          landedCostPerMtr: +averageCostPerMeter,
        };
      },
    );

    // Sort by color asc, width asc, gauge asc
    aggregatedCoils.sort(
      (a, b) => a.color.localeCompare(b.color) || a.width - b.width || a.gauge - b.gauge,
    );
    return aggregatedCoils;
  }

  onFirstDataRendered(params: FirstDataRenderedEvent) {
    params.api.createCrossFilterChart({
      chartType: 'column',
      cellRange: {
        columns: ['estMtrsRemaining'],
      },
      chartThemeOverrides: {
        common: {
          legend: {
            enabled: false,
          },
          title: {
            enabled: true,
            text: 'Product Type Quantities',
          },
          tooltip: {
            enabled: true,
          },
          axes: {
            category: {
              label: {
                enabled: true,
                rotation: 0,
                formatter: (value) => {
                  return (
                    this.rowData[value.value - 1].color +
                    '\n' +
                    this.rowData[value.value - 1].gauge +
                    '\n' +
                    this.rowData[value.value - 1].width
                  );
                },
              },
            },
          },
        },
      },
      chartContainer: document.getElementById(this.chart),
    });
  }

  exportToExcel() {
    this.gridApi.exportDataAsExcel();
  }

  getRowStyle(params: RowClassParams): RowStyle {
    return {
      'background-color': params.node.rowIndex % 2 === 0 ? '#fff' : '#f3f7fb',
    };
  }
}
