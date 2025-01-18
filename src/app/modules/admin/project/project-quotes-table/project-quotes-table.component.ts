import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Quote } from 'app/modules/admin/quotes/models/quote';
import { GridApi, ColDef, GridReadyEvent, IDetailCellRendererParams } from 'ag-grid-community';
import { AccessButtonAgGridComponent } from 'app/utilities/ag-grid/access-button-ag-grid/access-button-ag-grid.component';
import { capitalizeFirstLetter } from 'app/utilities/ag-grid/capitalizeFirstLetterFormatter';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { PageHeadingComponent } from '@layout/common/page-heading/page-heading.component';
import { AgGridModule } from 'ag-grid-angular';
import { ProductDTO } from 'app/modules/admin/cutting-lists/models/productDTO';

@Component({
  selector: 'app-project-quotes-table',
  standalone: true,
  imports: [
    CommonModule,
    AgGridModule,
    PageHeadingComponent,
    MatIconModule,
    MatButtonModule,
    RouterModule,
  ],
  templateUrl: './project-quotes-table.component.html',
  styleUrls: ['./project-quotes-table.component.scss'],
})
export class ProjectQuotesTableComponent {
  @Input() quotes: Quote[];

  public pagination = true;
  public gridApi!: GridApi<Quote>;
  public paginationPageSize = '20';

  public columnDefs: ColDef[] = [
    {
      headerName: 'Quote ID',
      field: 'id',
      width: 120,
      cellRenderer: 'agGroupCellRenderer',
    },
    {
      field: 'dateIssued',
      width: 150,
    },
    {
      headerName: 'Last Modified',
      field: 'dateLastModified',
      width: 150,
    },
    {
      field: 'dateAccepted',
      width: 150,
    },
    {
      field: 'status',
      valueFormatter: (params) => capitalizeFirstLetter(params.value),
      width: 140,
    },
    {
      headerName: 'Product Lists',
      field: 'products',
      width: 120,
      valueGetter: (params) => params.data.products.length,
    },
    { field: 'notes', width: 120 },
    {
      field: 'id',
      headerName: 'View Quote',
      cellRenderer: AccessButtonAgGridComponent,
      width: 150,
      cellRendererParams: {
        onClick: (quoteId: number) => this._router.navigate(['/quotes', quoteId]),
      },
    },
  ];

  public defaultColDef: ColDef = {
    sortable: true,
    filter: false,
  };

  public detailCellRendererParams: any = {
    detailGridOptions: {
      columnDefs: [
        { field: 'id' },
        {
          field: 'status',
          valueFormatter: (params) => capitalizeFirstLetter(params.value),
          cellStyle: (params) => {
            if (params.value === 'completed') {
              return { color: '#38a169' };
            } else {
              return { color: '#dd6b20' };
            }
          },
        },
        { field: 'dateWorkBegan' },
        { field: 'lastWorkedOn' },
        { field: 'dateWorkCompleted' },
        { field: 'planName' },
        {
          field: 'reserveStock',
          cellRenderer: function (params) {
            if (params.value === true) {
              return 'Reserved';
            } else {
              return 'Not Reserved';
            }
          },
        },
        {
          field: 'sellPrice',
          valueFormatter: (params) => {
            const value = params.value || 0;
            return '$' + value.toFixed(2);
          },
        },
      ],
      defaultColDef: {
        flex: 1,
      },
    },
    getDetailRowData: (params) => {
      params.successCallback(params.data.products);
    },
  } as IDetailCellRendererParams<Quote, ProductDTO>;

  constructor(private _router: Router) {}

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
    params.api.setGridOption('domLayout', 'autoHeight');
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
}
