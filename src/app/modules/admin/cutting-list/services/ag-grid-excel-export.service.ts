import { Injectable } from '@angular/core';
import {
  ExcelRow,
  GridApi,
  ProcessCellForExportParams,
  ProcessHeaderForExportParams,
} from 'ag-grid-enterprise';

@Injectable({
  providedIn: 'root',
})
export class AgGridExcelExportService {
  public exportIndividulaGroupedRowData(
    gridApi: GridApi,
    planName: string,
    clientName: string,
    color: string,
    gauge: number,
    type: string,
    projectName: string,
  ) {
    const processCellCallback = (params: ProcessCellForExportParams) => {
      if (params.column.getColDef().headerName === 'PICK') {
        return params.value === 'pickable' ? 'Yes' : 'No';
      } else if (params.column.getColDef().headerName === 'MANUFACTURED') {
        return '';
      } else {
        return params.value;
      }
    };

    const processHeaderCallback = (params: ProcessHeaderForExportParams) => {
      if (
        params.column.getColDef().headerName === 'MANUFACTURED' ||
        params.column.getColDef().field === 'frameNameOrig'
      ) {
        return '';
      }
      return params.column.getColDef().headerName;
    };

    gridApi.exportDataAsExcel({
      allColumns: true,
      processHeaderCallback: processHeaderCallback,
      processCellCallback: processCellCallback,
      appendContent: this.getAppendedRows(),
      prependContent: this.getPreAppendedRows(
        clientName,
        planName,
        color,
        gauge,
        type,
        projectName,
      ),
      fileName: planName + '_export.xlsx',
    });
  }

  public exportGroupRowData(
    gridApi: GridApi,
    planName: string,
    clientName: string,
    color: string,
    gauge: number,
    type: string,
    projectName: string,
  ) {
    const processCellCallback = (params: ProcessCellForExportParams) => {
      if (params.column.getColDef().field === 'frameName') {
        return planName;
      } else if (params.column.getColDef().field === 'totalLength') {
        return params.value;
      } else if (params.column.getColDef().field === 'qty') {
        return params.value;
      }
      return null;
    };

    const processHeaderCallback = (params: ProcessHeaderForExportParams) => {
      switch (params.column.getColDef().field) {
        case 'frameName':
          return 'Plan Name';
        case 'frameNameOrig':
          return 'FRAME NAME';
        case 'totalLength':
          return 'TOTAL Length';
        case 'qty':
          return 'QTY';
        case 'steelCoilNumber':
          return 'STEEL COIL NUMBER';
        case 'wastage':
          return 'WASTAGE';
        default:
          return null;
      }
    };

    const columnKeys = [
      'frameName',
      'frameNameOrig',
      'qty',
      'totalLength',
      'steelCoilNumber',
      'wastage',
    ];

    gridApi.exportDataAsExcel({
      processCellCallback: processCellCallback,
      processHeaderCallback: processHeaderCallback,
      prependContent: this.getPreAppendedRows(
        clientName,
        planName,
        color,
        gauge,
        type,
        projectName,
      ),
      appendContent: this.getAppendedRows(),
      columnKeys: columnKeys,
      fileName: planName + '_export.xlsx',
    });
  }

  public getPreAppendedRows(
    clientName: string,
    planName: string,
    color: string,
    gauge: number,
    type: string,
    projectName: string,
  ): ExcelRow[] {
    const title = planName + ' Cutting List';
    const projectNameInfo = 'Project Name: ' + projectName;
    const todaysDate = new Date().toLocaleDateString();
    const colorInfo = 'Color: ' + color;
    const gaugeInfo = 'Gauge: ' + gauge;
    let typeInfo: string = '';

    if (type) typeInfo = 'Type: ' + type;
    else type = '';
    return [
      {
        cells: [
          {
            data: { value: clientName, type: 'String' },
            styleId: 'preAppendedheaderCell',
          },
          {},
          {
            data: { value: todaysDate, type: 'String' },
            styleId: 'preAppendedheaderCell',
          },
        ],
      },
      {
        cells: [
          {
            data: { value: title, type: 'String' },
            styleId: 'preAppendedheaderCell',
          },
        ],
      },
      {
        cells: [
          {
            data: { value: projectNameInfo, type: 'String' },
            styleId: 'preAppendedheaderCell',
          },
        ],
      },

      { cells: [] },
      {
        cells: [
          {
            data: { value: colorInfo, type: 'String' },
            styleId: 'semiHeader',
          },
        ],
      },
      {
        cells: [
          {
            data: { value: gaugeInfo, type: 'String' },
            styleId: 'semiHeader',
          },
        ],
      },
      {
        cells: [
          {
            data: { value: typeInfo, type: 'String' },
            styleId: 'semiHeader',
          },
        ],
      },
      { cells: [] },
      { cells: [] },
    ];
  }

  public getAppendedRows(): ExcelRow[] {
    return [
      { cells: [] },
      { cells: [] },
      {
        cells: [
          {
            data: { value: 'Date Started', type: 'String' },
            styleId: 'coverText',
          },
        ],
      },
      {
        cells: [
          {
            data: { value: 'Date Completed', type: 'String' },
            styleId: 'coverText',
          },
        ],
      },
      {
        cells: [
          {
            data: { value: 'Machine Supervisor', type: 'String' },
            styleId: 'coverText',
          },
        ],
      },
    ];
  }
}
