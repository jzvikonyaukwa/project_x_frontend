import { Component, OnInit, inject } from "@angular/core";

import { ColDef, GridApi, GridReadyEvent, RowClassParams, RowStyle } from "ag-grid-enterprise";
import { Observable, tap } from "rxjs";
import { ClientsService } from "../services/clients.service";
import { ClientsDetailsDTO } from "../models/clientsDetailsDTO";
import { Router } from "@angular/router";
import { ModalService } from "@shared/services/modal.service";
import { AddClientComponent } from "../add-client/add-client.component";
import { getColumnDefs } from "./column-definitions";
import { DEFAULTCOLUMNDEF } from "app/utilities/ag-grid/defaultColumnDef";
import { HttpErrorResponse } from "@angular/common/http";
import { MatSnackBar, MatSnackBarConfig } from "@angular/material/snack-bar";
import { environment } from "@environments/environment";

@Component({
  selector: 'app-clients-table',
  templateUrl: './clients-table.component.html',
  styleUrls: ['./clients-table.component.scss'],


})
export class ClientsTableComponent implements OnInit {
  public pagination = true;
  public gridApi!: GridApi<any>;
  public paginationPageSize = '10';
  public clientsData: ClientsDetailsDTO[] = [];

  public filteredclientsData: ClientsDetailsDTO[] = [];

  public search: string = "";


  public columnDefs: ColDef[] = [];

  rowData$: Observable<ClientsDetailsDTO[]> = this.clientsService.getAllClientsWithDetails();

  public defaultColDef: ColDef = DEFAULTCOLUMNDEF;

  private readonly _snackBar = inject(MatSnackBar);

  constructor(
    private clientsService: ClientsService,
    private router: Router,
    private _modalService: ModalService,
  ) {
    this.columnDefs = getColumnDefs(router);
  }

  ngOnInit(): void {
    this.refreshData();

    this.rowData$.subscribe({
      error: (error: unknown) => {
        this.clientsData = [];
        const detailedErrorMessage =
          error instanceof HttpErrorResponse
            ? error.error.message || error.statusText
            : 'Unknown error';
        this._snackBar.open(`Error fetching clients: ${detailedErrorMessage}`, null, {
          duration: environment.DEFAULT_SNACKBAR_TIMEOUT,
        } as MatSnackBarConfig);
        console.error('Error fetching clients', error);
      },
    });
  }

  refreshData(): void {
    this.rowData$ = this.clientsService.getAllClientsWithDetails().pipe(
        tap((clients) => {
          this.clientsData = clients.sort((a, b) => {
            const nameA = a.clientName?.toLowerCase() || '';
            const nameB = b.clientName?.toLowerCase() || '';
            return nameA.localeCompare(nameB);
          });
          console.log(this.clientsData);

          this.gridApi.setRowData(this.clientsData);
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

  onBtNext() {
    this.gridApi.paginationGoToNextPage();
  }

  onBtPrevious() {
    this.gridApi.paginationGoToPreviousPage();
  }

  setText(selector: string, text: any) {
    (document.querySelector(selector) as any).innerHTML = text;
  }

  lastRowBorder(params: RowClassParams<ClientsDetailsDTO>): RowStyle {
    return {
      'background-color': (params.node.rowIndex % 2 === 0) ? '#fff' : '#f3f7fb',
    };
  }

  public onPageSizeChanged(): void {
    const value = (document.getElementById('page-size') as HTMLInputElement).value;
    this.paginationPageSize = value;
    this.gridApi.paginationSetPageSize(Number(value));
  }

  public addClient() {
    const dialog = this._modalService.open<AddClientComponent>(AddClientComponent, {
      data: {
        dataKey: 'client',
      },
    });

    dialog.afterClosed().subscribe(() => {
      this.refreshData();
    });
  }

  filterClients($event: Event): void {
    const searchQuery = this.search.toLowerCase();

    this.filteredclientsData = this.clientsData.filter((clientData) => {
      const clientName = clientData.clientName?.toLowerCase() || '';
      const clientId = clientData.clientId?.toString() || '';

      const matchesClientName = clientName.includes(searchQuery);
      const matchesClientId = clientId.startsWith(searchQuery);

      return matchesClientName || matchesClientId;
    });

    this.filteredclientsData.sort((a, b) => {
      const nameA = a.clientName?.toLowerCase() || '';
      const nameB = b.clientName?.toLowerCase() || '';
      return nameA.localeCompare(nameB);
    });

    this.gridApi.setRowData(this.filteredclientsData);

  }

}
