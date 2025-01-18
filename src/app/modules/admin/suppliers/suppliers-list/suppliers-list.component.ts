import { Component, OnInit } from '@angular/core';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { Observable, tap } from 'rxjs';
import { SupplierService } from '../services/supplier.service';
import { SupplierDto, SupplierWithDetailsDTO } from '../models/supplierDto';
import { AccessButtonAgGridComponent } from '../../../../utilities/ag-grid/access-button-ag-grid/access-button-ag-grid.component';
import { Router } from '@angular/router';
import { ModalService } from '@shared/services/modal.service';
import { AddClientComponent } from '../../clients/add-client/add-client.component';
@Component({
  selector: 'app-suppliers-list',
  templateUrl: './suppliers-list.component.html',
  styleUrls: ['./suppliers-list.component.scss'],
})
export class SuppliersListComponent implements OnInit {
  public pagination = true;
  public paginationPageSize = '10';
  public suppliersData: SupplierWithDetailsDTO[] = [];
  public gridApi!: GridApi<any>;
  public tooltipShowDelay = 300;
  public columnDefs: ColDef[] = [
    {
      field: 'supplierId',
      headerTooltip: 'Supplier Id',
      headerName: 'Id',
      width: 100,
    },
    {
      field: 'supplierName',
      headerTooltip: 'Supplier Name',
      headerName: 'NAME',
      width: 180,
      minWidth: 300,
    },
    {
      field: 'supplierPhone',
      headerTooltip: 'Supplier Phone',
      headerName: 'PHONE',
      width: 130,
    },
    {
      field: 'supplierEmail',
      headerTooltip: 'Supplier Email',
      headerName: 'EMAIL',
      width: 180,
    },
    {
      field: 'supplierStreet',
      headerTooltip: 'Supplier Street',
      headerName: 'STREET',
      width: 180,
    },
    {
      field: 'supplierSuburb',
      headerTooltip: 'Supplier Suburb',
      headerName: 'SUBURB',
      width: 180,
    },
    {
      field: 'supplierCity',
      headerTooltip: 'Supplier City',
      headerName: 'CITY',
      width: 150,
    },
    {
      field: 'supplierCountry',
      headerTooltip: 'Supplier Country',
      headerName: 'COUNTRY',
      width: 150,
    },
    {
      field: 'supplierId',
      headerName: 'VIEW',
      headerTooltip: 'Details',
      filter: false,
      cellRenderer: AccessButtonAgGridComponent,
      cellRendererParams: {
        onClick: (supplierId: number) => {
          this._router.navigate(['/suppliers', supplierId]);
        },
      },
      width: 140,
    },
  ];

  rowData$: Observable<SupplierWithDetailsDTO[]> =
    this._supplierService.getAllSuppliersWithDetails();

  public defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    unSortIcon: true,
    headerClass: 'ag-grid-header',
  };

  object: any = {};

  constructor(
    private _supplierService: SupplierService,
    private _router: Router,
    private _modalService: ModalService,
  ) {}

  ngOnInit(): void {
    this.refreshData();
  }

  refreshData(): void {
    this.rowData$ = this._supplierService.getAllSuppliersWithDetails().pipe(
      tap((suppliers: SupplierWithDetailsDTO[]) => {
        this.suppliersData = suppliers;
        console.log(suppliers);
      }),
    );
  }

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

  public addSupplier() {
    const dialog = this._modalService.open<AddClientComponent>(AddClientComponent, {
      data: {
        dataKey: 'supplier',
      },
    });

    dialog.afterClosed().subscribe(() => {
      this.refreshData();
    });
  }
}
