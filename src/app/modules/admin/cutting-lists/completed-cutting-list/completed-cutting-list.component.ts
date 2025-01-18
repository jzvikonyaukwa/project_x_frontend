import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs';
import { ProductService } from '../../product/product.service';
import { ProductInformation } from '../models/cuttingListInformationDTO';
import { ManufacturedProduct } from '../models/manufacturedProduct';
import { AgGridModule } from 'ag-grid-angular';
import {
  ColDef,
  GetRowIdFunc,
  GetRowIdParams,
  GridApi,
  GridReadyEvent,
  ISelectCellEditorParams,
  ValueFormatterParams,
} from 'ag-grid-enterprise';
import { COLUMN_DEFINITIONS } from 'app/utilities/ag-grid/column-definitions';
import { AggregatedProduct } from '../../aggregated-products/aggregatedProducts';

@Component({
  selector: 'app-completed-cutting-list',
  standalone: true,
  imports: [CommonModule, AgGridModule],
  templateUrl: './completed-cutting-list.component.html',
  styleUrls: ['./completed-cutting-list.component.scss'],
})
export class CompletedCuttingListComponent implements OnInit {
  cuttingListInformation: ProductInformation;
  @ViewChild('lbCurrentPage') lbCurrentPage;
  @ViewChild('lbTotalPages') lbTotalPages;

  public rowData: AggregatedProduct[];
  public columnDefs: ColDef[];
  public defaultColDef: ColDef = COLUMN_DEFINITIONS;

  public paginationPageSize = '30';
  private gridApi!: GridApi;

  constructor(private route: ActivatedRoute, private cuttingListService: ProductService) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = +params.get('id');
          return this.cuttingListService.getProductInformation(id);
        }),
      )
      .subscribe((data) => {
        this.cuttingListInformation = data;
        console.log('this.cuttingList: ', this.cuttingListInformation);
        this.rowData = this.cuttingListInformation.product.aggregatedProducts;
        this.columnDefs = this.createColDefs();
      });
  }

  createColDefs(): any {
    const colDefs: ColDef[] = [
      { field: 'id', width: 100, headerName: 'ID' },
      { field: 'code', width: 100, headerName: 'CODE' },
      { field: 'frameName', width: 130, headerName: 'FRAME NAME' },
      { field: 'length', width: 120, headerName: 'LENGTH' },
      {
        headerName: 'STATUS',
        field: 'status',
        valueFormatter: this.statusFormatter,
        editable: true,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: () =>
          ({
            values: ['completed', 'scheduled', 'picked'],
          } as ISelectCellEditorParams),
        width: 150,
      },
    ];
    return colDefs;
  }

  statusFormatter(params: ValueFormatterParams) {
    if (params.value !== null) {
      return params.value.toUpperCase();
    }
    return '';
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
    params.api.setGridOption('domLayout', 'autoHeight');
    this.onPaginationChanged();
  }

  onPaginationChanged() {
    if (this.gridApi) {
      this.lbCurrentPage.nativeElement.innerHTML = this.gridApi.paginationGetCurrentPage() + 1;
      this.lbTotalPages.nativeElement.innerHTML = this.gridApi.paginationGetTotalPages();
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
    this.gridApi.paginationSetPageSize(Number(value));
  }

  onFirstDataRendered(params) {
    params.api.sizeColumnsToFit();
  }

  public getRowId: GetRowIdFunc = (params: GetRowIdParams) => {
    return params.data.id;
  };

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

  actionRenderer(params: any): string {
    return `<app-action-renderer [params]="params"></app-action-renderer>`;
  }
}
