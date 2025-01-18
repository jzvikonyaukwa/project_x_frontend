import { Component, DestroyRef, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ConsignorsService } from "./services/consignors.service";
import { Observable } from "rxjs";
import { Consignor } from "./models/consignor";
import { DEFAULTCOLUMNDEF } from "app/utilities/ag-grid/defaultColumnDef";
import { ColDef, GridApi, GridReadyEvent } from "ag-grid-enterprise";
import { AgGridModule } from "ag-grid-angular";
import { MatButtonModule } from "@angular/material/button";
import { PageHeadingComponent } from "@layout/common/page-heading/page-heading.component";
import { MatIconModule } from "@angular/material/icon";
import { AccessButtonAgGridComponent } from "app/utilities/ag-grid/access-button-ag-grid/access-button-ag-grid.component";
import { Router } from "@angular/router";
import { ModalService } from "@shared/services/modal.service";
import { AddConsignorComponent } from "./add-consignor/add-consignor.component";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  selector: "app-consignors",
  standalone: true,
  imports: [
    CommonModule,
    AgGridModule,
    MatButtonModule,
    PageHeadingComponent,
    MatIconModule,
  ],
  templateUrl: "./consignors.component.html",
  styleUrls: ["./consignors.component.scss"],
})
export class ConsignorsComponent {
  private consignorsService = inject(ConsignorsService);
  private router = inject(Router);

  rowData$: Observable<Consignor[]> = this.consignorsService.getAllConsignors();
  public pagination = true;
  public gridApi!: GridApi<Consignor>;
  public paginationPageSize = "10";
  public defaultColDef: ColDef = DEFAULTCOLUMNDEF;
  public columnDefs: ColDef[] = [
    {
      headerName: "ID",
      field: "id",
    },
    {
      headerName: "Name",
      field: "name",
    },
    {
      headerName: "View",
      field: "id",
      cellRenderer: AccessButtonAgGridComponent,
      cellRendererParams: {
        onClick: (id: number) => {
          this.router.navigate(["/consignors", id]);
        },
      },
    },
  ];

  constructor(
    private _modalService: ModalService,
    private _destroyRef: DestroyRef
  ) {}

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
    params.api.setGridOption("domLayout", "autoHeight");
    this.onPaginationChanged();
  }

  onPaginationChanged() {
    if (this.gridApi!) {
      this.setText(
        "#lbCurrentPage",
        this.gridApi.paginationGetCurrentPage() + 1
      );
      this.setText("#lbTotalPages", this.gridApi.paginationGetTotalPages());
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

  public onPageSizeChanged(): void {
    const value = (document.getElementById("page-size") as HTMLInputElement)
      .value;
    this.paginationPageSize = value;
    this.gridApi.paginationSetPageSize(Number(value));
  }

  public addConsignor(): void {
    const addConsignorModal = this._modalService.open(AddConsignorComponent);
    addConsignorModal
      .afterClosed()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((consigmentData: string) => {
        if (consigmentData) {
          const newConsignor = { name: consigmentData };
          this.consignorsService.createConsignor(newConsignor).subscribe({
            next: (res: Consignor) => {
              this.gridApi.applyTransaction({ add: [res] });
            },
            error: (err) => {
              throw new Error(err);
            },
          });
        }
      });
  }
}
