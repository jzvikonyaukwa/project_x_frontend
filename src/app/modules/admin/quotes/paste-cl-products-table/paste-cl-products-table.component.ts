import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColDef, GridApi, GridReadyEvent, ProcessDataFromClipboardParams } from 'ag-grid-community';
import { MatDialogRef } from '@angular/material/dialog';
import { AgGridModule } from 'ag-grid-angular';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ProductInputtedRows } from '../models/cuttingListRow';
import { MatMenuModule } from '@angular/material/menu';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { PLANNAMES } from '@shared/models/planNames';
import { CuttingListPastedData } from './models/cuttingListPastedData';

@Component({
  selector: 'app-paste-framecad-table',
  standalone: true,
  imports: [
    CommonModule,
    AgGridModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    FuseAlertComponent,
  ],
  templateUrl: './paste-cl-products-table.component.html',
  styleUrls: ['./paste-cl-products-table.component.scss'],
})
export class PasteClProductsTableComponent {
  planNames: string[] = PLANNAMES;
  showAlert = false;

  alert: { type: FuseAlertType; message: string } = {
    type: 'warning',
    message: '',
  };

  invalidData: boolean = true;
  numberOfLines: number = 0;

  public columnDefs: ColDef[] = [
    { field: 'plan', width: 100 },
    { field: 'frameName', width: 100 },
    { field: 'frameType', width: 120 },
    { field: 'stick', width: 120 },
    { field: 'stickType', width: 120 },
    { field: 'length', width: 120 },
  ];

  public defaultColDef: ColDef = {
    editable: true,
    wrapHeaderText: true,
  };

  public rowData: CuttingListPastedData[];

  public rowSelection: 'single' | 'multiple' = 'multiple';

  public cuttingListData: ProductInputtedRows[] = [];

  private gridApi: GridApi;

  constructor(
    private _dialogRef: MatDialogRef<PasteClProductsTableComponent>,
    private cdr: ChangeDetectorRef,
  ) {}

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridApi.setGridOption('rowData', [{}]);

    params.api!.sizeColumnsToFit();
  }

  processDataFromClipboard = (params: ProcessDataFromClipboardParams): string[][] | null => {
    const data = params.data; // Avoid unnecessary shallow copy

    console.log('************');
    // Remove empty last row, if present
    if (data.length > 0 && data[data.length - 1].every((cellValue) => cellValue === '')) {
      data.pop();
    }

    const focusedCell = params.api!.getFocusedCell();

    console.log('focusedCell done');
    if (focusedCell) {
      const numRowsToAdd = data.length;
      const rowsToAdd: any[] = [];

      // Cache the visible columns to avoid expensive lookup
      // api.getAllDisplayedColumns()
      const allDisplayedColumns = this.gridApi.getAllDisplayedColumns();
      const startColumnIndex = allDisplayedColumns.indexOf(focusedCell.column);

      console.log('startColumnIndex done');
      for (let i = 0; i < numRowsToAdd; i++) {
        const row = data[i];
        const rowObject: any = {};

        // Directly iterate through cached columns starting from focused column
        for (
          let colIndex = startColumnIndex, j = 0;
          j < row.length && colIndex < allDisplayedColumns.length;
          j++, colIndex++
        ) {
          const currentColumn = allDisplayedColumns[colIndex];
          const colDef = currentColumn.getColDef(); // Use getColDef() to access colDef
          rowObject[colDef.field] = row[j];
        }

        rowsToAdd.push(rowObject);
      }
      console.log('Finished for loop');

      if (rowsToAdd.length > 0) {
        console.log('Pending empty row on');
        const lastIndex = params.api!.getModel().getRowCount() - 1;
        const newRowIndex = focusedCell.rowIndex + 1;
        const insertIndex = newRowIndex > lastIndex ? lastIndex : newRowIndex;
        // Apply transaction only once
        params.api!.applyTransaction({ add: rowsToAdd, addIndex: insertIndex });
      }
      console.log('Done');
    }

    this.formatData(data);
    console.log('formatData done');
    this.numberOfLines = data.length;
    this.cdr.detectChanges();
    // Avoid adding empty row unless required
    return data;
  };

  formatData(data: any[]): void {
    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      this.invalidData = this.checkRowsData(row);
      this.cdr.detectChanges();
      if (this.invalidData) {
        return;
      }

      const rowObject: ProductInputtedRows = {} as ProductInputtedRows;
      rowObject.planName = row[0];
      rowObject.frameName = row[1];
      rowObject.frameType = row[2];
      rowObject.stick = row[3];
      rowObject.stickType = row[4];
      rowObject.length = row[5];

      this.cuttingListData.push(rowObject);
    }
  }

  checkRowsData(row: any): boolean {
    if (row.length != 6) {
      console.log('This row is wrong: ', row);
      this.showAlert = true;
      this.alert.message = 'Invalid number of columns. Please check the data and try again.';
      return true;
    }
    const planName: string = row[0];

    // Trim whitespace and check case-insensitively
    if (PLANNAMES.map((name) => name.toLowerCase()).indexOf(planName.trim().toLowerCase()) === -1) {
      console.log('This planName is wrong: ', planName.trim());
      this.showAlert = true;
      this.alert.message = 'Invalid Plan Name. Please check the data and try again.';
      return true;
    }

    const length: number = Number(row[5]);

    if (isNaN(length)) {
      console.log('This length is wrong: ', length);
      this.showAlert = true;
      this.alert.message =
        'Last column for length has a value I cant work with. Please check the data and try again.';
      return true;
    }

    if (!this.hasAtLeastFiveDecimalPlaces(length)) {
      this.showAlert = true;
      this.alert.message =
        'Last column for length has the wrong decimal places. Please check and make sure the data has 5 decimal places.';
      return true;
    }
  }

  hasAtLeastFiveDecimalPlaces(num) {
    // Check if num is a number and format it to preserve trailing zeros up to 5 places
    const formattedNum = typeof num === 'number' ? num.toFixed(5) : num.toString();

    // Split the string at the decimal point to separate the integer and decimal parts.
    const parts = formattedNum.split('.');

    // Check if the decimal part exists and has at least five digits.
    return parts.length > 1 && parts[1].length >= 5;
  }

  onSubmit(): void {
    if (this.invalidData) {
      // Prevent submission if the data is invalid
      this.showAlert = true;
      this.alert.message = 'Cannot submit invalid data. Please check your input.';
      return;
    }

    // Close the dialog and pass the valid data
    this._dialogRef.close(this.cuttingListData);
  }

  cancel() {
    console.log('cancel');
    this.cuttingListData = [];
    this._dialogRef.close();
  }

  reset() {
    const emptyRow: CuttingListPastedData = {
      planName: '',
      frameName: '',
      frameType: '',
      stick: '',
      stickType: '',
      length: null,
    };
    this.invalidData = true;
    this.numberOfLines = 0;
    this.showAlert = false;
    this.rowData = [emptyRow];
    this.gridApi.setGridOption('rowData', this.rowData);
    this.cdr.detectChanges();
    // this.gridApi.setRowData(this.rowData);
  }
}
