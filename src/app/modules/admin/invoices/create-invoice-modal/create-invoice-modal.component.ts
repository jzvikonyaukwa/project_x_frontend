import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SaleOrder } from '../../sale-orders/models/salesOrder';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-enterprise';
import { COLUMN_DEFINITIONS } from 'app/utilities/ag-grid/column-definitions';
import { AgGridModule } from 'ag-grid-angular';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { capitalizeFirstLetter } from 'app/utilities/ag-grid/capitalizeFirstLetterFormatter';
import { IssueInvoiceDTO } from '../models/issueInvoiceDTO';
import { InvoicesService } from '../services/invoices.service';
import { Invoice } from '../models/invoice';
import { ConsumablesService } from '../../consumables/services/consumables.service';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { InvoiceChoices } from '../models/invoiceChoices';
import { ConsumableStockLevelToBeChecked } from '../../consumables/models/consumableStockLevelToBeChecked';

@Component({
  selector: 'app-create-invoice-modal',
  standalone: true,
  imports: [CommonModule, AgGridModule, MatIconModule, MatButtonModule, FuseAlertComponent],
  templateUrl: './create-invoice-modal.component.html',
  styleUrls: ['./create-invoice-modal.component.scss'],
})
export class CreateInvoiceModalComponent implements OnInit {
  gridApi: GridApi<InvoiceChoices>;

  public columnDefs: ColDef[] = [
    {
      headerName: 'ID',
      field: 'id',
      width: 80,
      headerCheckboxSelection: true,
      checkboxSelection: true,
    },
    {
      headerName: 'TYPE',
      field: 'type',
      width: 120,
      valueFormatter: (params) => capitalizeFirstLetter(params.value),
    },
    {
      headerName: 'SERVICE',
      field: 'service',
      width: 180,
      valueFormatter: (params) => capitalizeFirstLetter(params.value),
    },
    {
      headerName: 'QTY',
      field: 'qty',
      width: 130,
    },
    {
      headerName: 'description',
      field: 'description',
      width: 180,
      valueFormatter: (params) => capitalizeFirstLetter(params.value),
    },
    {
      headerName: 'INVOICED',
      field: 'isInvoiced',
      width: 180,
      cellRenderer: function (params) {
        return params.value ? 'Yes' : 'No';
      },
    },
  ];

  rowData: InvoiceChoices[];
  public rowSelection: 'single' | 'multiple' = 'multiple';
  public defaultColDef: ColDef = COLUMN_DEFINITIONS;

  showAlert = false;
  alert: { type: FuseAlertType; message: string } = {
    type: 'success',
    message: '',
  };

  constructor(
    private _dialogRef: MatDialogRef<CreateInvoiceModalComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { saleOrder: SaleOrder },
    public invoiceService: InvoicesService,
    private consumablesService: ConsumablesService,
  ) {}

  ngOnInit(): void {
    console.log('sale order: ', this.data.saleOrder);
    this.createRowDataFromSaleOrder(this.data.saleOrder);
  }

  onGridReady(params: GridReadyEvent<any>) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
    params.api.setGridOption('domLayout', 'autoHeight');
  }

  createRowDataFromSaleOrder(saleOrder: SaleOrder) {
    this.rowData = [];

    saleOrder.quote.products.forEach((cl) => {
      if (cl.canInvoice && cl.invoiceId == null) {
        const invoiceChoice: InvoiceChoices = {
          id: cl.id,
          type: 'Cutting List',
          service: cl.planName,
          qty: 1,
          description: '',
        };

        if (cl.invoiceId != null) {
          invoiceChoice.isInvoiced = true;
        } else {
          invoiceChoice.isInvoiced = false;
        }

        this.rowData.push(invoiceChoice);
      }
    });

    saleOrder.quote.consumablesOnQuote.forEach((c) => {
      if (c.invoiceId != null) {
        return;
      }
      const invoiceChoice: InvoiceChoices = {
        id: c.id,
        type: 'Consumable',
        service: c.consumable.name,
        qty: c.qty,
        description: c.consumable.name,
      };
      if (c.invoiceId != null) {
        invoiceChoice.isInvoiced = true;
      } else {
        invoiceChoice.isInvoiced = false;
      }

      this.rowData.push(invoiceChoice);
    });
  }

  issueInvoice() {
    const selectedRows = this.gridApi.getSelectedRows();
    console.log('Selected Rows:', selectedRows);
    this.checkStockLevels(selectedRows);
  }

  checkStockLevels(selectedRows: InvoiceChoices[]) {
    const consumablesToCheck: ConsumableStockLevelToBeChecked[] = [];

    selectedRows.forEach((row) => {
      if (row.type === 'Consumable') {
        consumablesToCheck.push({
          consumableOnQuoteId: row.id,
          stockAvailable: false,
        });
      }
    });

    if (consumablesToCheck.length === 0) {
      // If no consumables need checking, proceed to invoice
      this.issueInvoiceForSelectedRows(selectedRows);
      return;
    }

    this.consumablesService.checkConsumableStockLevelIsEnough(consumablesToCheck).subscribe({
      next: (consumablesChecked: ConsumableStockLevelToBeChecked[]) => {
        console.log('Consumables checked: ', consumablesChecked);

        let idsWithoutStock = '';
        let noStock = false;

        consumablesChecked.forEach((consumableOnQuote) => {
          if (!consumableOnQuote.stockAvailable) {
            idsWithoutStock += consumableOnQuote.consumableOnQuoteId + ', ';
            noStock = true;
          }
        });

        // Trim the trailing comma and space for a cleaner message
        idsWithoutStock = idsWithoutStock.replace(/, $/, '');

        let msg =
          'There is not enough stock available for the selected consumables with IDs ' +
          idsWithoutStock;

        if (noStock) {
          this.showAlert = true;
          this.alert = {
            type: 'error',
            message: msg,
          };
          return;
        } else {
          this.issueInvoiceForSelectedRows(selectedRows);
        }
      },
      error: (err) => {
        console.error('Error checking consumable stock levels: ', err);
        this.showAlert = true;
        this.alert = {
          type: 'warning',
          message: 'Error checking consumable stock levels. Error: ' + err,
        };
      },
    });
  }

  issueInvoiceForSelectedRows(selectedRows: InvoiceChoices[]) {
    const issueInvoiceDTO: IssueInvoiceDTO = {
      dateInvoiced: new Date(),
      saleOrderId: this.data.saleOrder.id,
      itemsToBeInvoiced: selectedRows.map((row) => ({
        id: row.id,
        type: row.type,
      })),
    };

    console.log('issueInvoiceDTO: ', issueInvoiceDTO);

    this.invoiceService.issueInvoice(issueInvoiceDTO).subscribe({
      next: (response: Invoice) => {
        console.log('Invoice issued successfully: ', response);
        this._dialogRef.close(); // Assuming this is to close a modal or dialog
      },
      error: (err) => {
        console.error('Error issuing invoice: ', err);
        // Handle error, possibly show a message to the user
      },
    });
  }
}
