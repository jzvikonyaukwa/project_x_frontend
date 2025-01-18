import { Component, Input, OnInit, OnDestroy } from "@angular/core";
import { ColDef, GridApi, GridReadyEvent } from "ag-grid-enterprise";
import { FormBuilder } from "@angular/forms";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatInputModule } from "@angular/material/input";
import { SharedModule } from "@shared/shared.module";
import { AgGridAngular } from "ag-grid-angular";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { PageHeadingComponent } from "@layout/common/page-heading/page-heading.component";
import { AccessButtonAgGridComponent } from "../../../../utilities/ag-grid/access-button-ag-grid/access-button-ag-grid.component";
import { Router, RouterLink } from "@angular/router";
import { ProjectOverview } from "../../projects/models/projectOverview";
import {CreateCreditNoteDialog} from "./create-credit-note-dialog/create-credit-note-dialog.component";
import {CreditNotesService} from "./services/credit-notes.service";
import {CreditNoteDetailsDto, CreditNotesDto} from "./create-credit-note-dialog/models/credit-notes-dto";
import {IDetailCellRendererParams} from "ag-grid-community";

@Component({
  selector: "app-project-credit-notes",
  templateUrl: "./project-credit-notes.component.html",
  styleUrls: ["./project-credit-notes.component.scss"],
  imports: [
    MatInputModule,
    SharedModule,
    AgGridAngular,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    PageHeadingComponent,
    RouterLink,
  ],
  standalone: true,
})
export class ProjectCreditNotesComponent implements OnInit, OnDestroy {
  @Input() projectOverview: ProjectOverview;

  public pagination = true;
  public gridApi!: GridApi<CreditNotesDto>;
  public paginationPageSize = 10;
  public paginationPageSizeSelector: number[] | boolean = [10, 20, 50];
  public rowData: CreditNotesDto[] = [];
  public columnDefs: ColDef[] = [
    {
      headerName: "Credit Note ID",
      field: "id",
      width: 120,
      sortable: true,
      filter: true,
      cellRenderer: "agGroupCellRenderer",
    },
    {
      headerName: "Date Created",
      field: "dateCreated",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Number of Items returned",
      field: "returnedProducts",
      sortable: true,
      filter: true,
      valueGetter: (params) => {
        console.log("Returned Products:", params.data.returnedProducts);
        if (Array.isArray(params.data.returnedProducts)) {
          return params.data.returnedProducts.reduce((count, product) => count + (product.inventories?.length || 0), 0);
        }
        return 0;
      },
    },
    {
      headerName: "Return Reason",
      field: "returnedProducts.reason",
      sortable: true,
      filter: true,
      valueGetter: (params) => {
        if (Array.isArray(params.data.returnedProducts) && params.data.returnedProducts.length > 0) {
          return params.data.returnedProducts.map(product => product.reason).join(", ");
        }
        return "";
      },
    },
    {
      field: "id",
      headerName: "View Credit Note",
      cellRenderer: AccessButtonAgGridComponent,
      width: 150,
      cellRendererParams: {
        onClick: (creditNoteId: number) =>
            this._router.navigate(["/credit-note", creditNoteId]),
      },
    },
  ];


  public detailCellRendererParams: any = {
    detailGridOptions: {
      columnDefs: [
        {
          field: "inventoryId",
          headerName: "Inventory ID",
        },
        {
          field: "returnedProductDate",
          headerName: "Returned Date",
        },
        {
          field: "returnedProductReason",
          headerName: "Reason",
        },
        {
          field: "productType",
          headerName: "Product Type",
          valueGetter: (params) => {
            return params.data.manufacturedProductId ? "Manufactured Product" : "Consumable";
          },
        },
        {
          field: "productDescription",
          headerName: "Product Description",
          valueGetter: (params) => {
            return params.data.manufacturedProductId ? params.data.manufacturedProductFrameType +" "+ params.data.manufacturedProductFrameName : params.data.frameName;
          },
        },
        {
          field: "quantity",
          headerName: "Quantity",
          valueGetter: (params) => {
            return params.data.manufacturedProductId ? params.data.manufacturedProductLength : params.data.consumableOnQuoteQty;
          },
        },
      ],
      defaultColDef: {
        flex: 1,
      },
    },
    getDetailRowData: (params) => {
      this.creditNoteService.getCreditNoteDetailsById(params.data.id)
          .subscribe({
            next: (data: CreditNoteDetailsDto[]) => {
              console.log(data);
              params.successCallback(data);
            },
            error: (error) => {
              console.error("Error fetching credit note details:", error);
            }
          });
    },
  } as IDetailCellRendererParams<CreditNotesDto, CreditNoteDetailsDto>;


  public defaultColDef: ColDef = {
    resizable: true,
    sortable: true,
    filter: true,
    flex: 1,
    minWidth: 100,
  };



  constructor(
      private  creditNoteService: CreditNotesService,
      private fb: FormBuilder,
      private dialog: MatDialog,
      private _router: Router
  ) {

  }

  ngOnInit() {
    console.log("Project ID:", this.projectOverview.project.id);

    this.loadCreditNotes();

  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
    params.api.setGridOption("domLayout", "autoHeight");
  }

  loadCreditNotes() {
    this.creditNoteService
        .getCreditNotesByProjectId(this.projectOverview.project.id)
        .subscribe((data) => {
          this.rowData = data;
          console.log(this.rowData);
          this.gridApi.setGridOption("rowData", this.rowData);
        });
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(CreateCreditNoteDialog, {
      width: "1200px",
      data: {
        // form: this.deliveryNoteForm,
        project: this.projectOverview.project,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadCreditNotes();
      }
    });
  }

 



  lastRowBorder(params) {
    if (params.node.rowIndex % 2 !== 0) {
      return {
        "background-color": "#EFF7FC",
      };
    } else {
      return {
        "background-color": "#FFFFFF",
      };
    }
  }

  ngOnDestroy() {
   
  }
}
