import { Component, DestroyRef, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { AgGridModule } from "ag-grid-angular";
import { FormControl } from "@angular/forms";
import { GridApi, ColDef, GridReadyEvent } from "ag-grid-community";
import { capitalizeFirstLetter } from "app/utilities/ag-grid/capitalizeFirstLetterFormatter";
import { ConsumableDetailsDTO } from "../models/consumableDetailsDTO";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ConsumablesService } from "../services/consumables.service";
import { ModalService } from "@shared/services/modal.service";
import { AddConsumableModalComponent } from "../add-consumable-modal/add-consumable-modal.component";
import { Consumable } from "../models/consumable";
import { EditButtonComponent } from "app/utilities/ag-grid/edit-button/edit-button.component";
import { AddCategoryComponent } from "../../consumable-categories/add-category/add-category.component";
import { SideBarDef } from "ag-grid-enterprise";

@Component({
  selector: "app-consumable-details-table",
  standalone: true,
  imports: [CommonModule, AgGridModule, MatIconModule],
  templateUrl: "./consumable-details-table.component.html",
  styleUrls: ["./consumable-details-table.component.scss"],
})
export class ConsumableDetailsTableComponent {
  @Input("searchValue") searchValue: FormControl<string>;
  @Input() warehouseId: number;

  private gridApi: GridApi;
  rowData: Consumable[];
  paginationActive: boolean = true;
  paginationPageSize: number = 20;
  paginationPageSizeSelector = [10, 20, 50, 100];
  public columnDefs: ColDef[] = [
    { headerName: "SERIAL NUMBER", field: "serialNumber", width: 120 },
    {
      headerName: "NAME",
      field: "name",
      width: 320,
      filter: "agMultiColumnFilter",
      suppressFloatingFilterButton: true,
    },
    {
      headerName: "UOM",
      field: "uom",
      width: 110,
      valueFormatter: (params) => capitalizeFirstLetter(params.value),
    },
    {
      headerName: "CATEGORY",
      valueFormatter: (params) => capitalizeFirstLetter(params.value),
      field: "category.name",
      width: 150,
      filter: "agMultiColumnFilter",
      suppressFloatingFilterButton: true,
    },
    {
      headerName: "SOURCE",
      valueFormatter: (params) => capitalizeFirstLetter(params.value),
      field: "sourceCountry.country",
      width: 110,
    },
    {
      headerName: "ALERT OWNED",
      valueFormatter: (params) => capitalizeFirstLetter(params.value),
      field: "minQtyAlertOwned",
      width: 130,
    },
    {
      headerName: "ALERT CONSIGNMENT",
      valueFormatter: (params) => capitalizeFirstLetter(params.value),
      field: "minQtyAlertConsignment",
      width: 130,
    },
    {
      headerName: "EDIT",
      field: "id",
      cellRenderer: EditButtonComponent,
      cellRendererParams: {
        onClick: (id: number) => {
          this.onUpdateConsumable(id);
        },
      },
      width: 110,
      filter: false,
      floatingFilter: false,
    },
  ];

  public sideBar: SideBarDef | string | string[] | boolean | null = {
    toolPanels: ["filters"],
  };

  public defaultColDef: ColDef = {
    headerClass: "ag-grid-header",
    wrapHeaderText: true,
    filter: true,
    floatingFilter: true,
  };

  constructor(
    private consumableService: ConsumablesService,
    private destroyRef: DestroyRef,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.getConsumablesDetails();
  }

  getConsumablesDetails(): void {
    this.consumableService
      .getAllConsumableDetails()
      .subscribe((consumables: Consumable[]) => {
        this.rowData = consumables.sort((a, b) => {
          if (a.name < b.name) return -1;
          if (a.name > b.name) return 1;
          return 0;
        });

        this.rowData.forEach((consumable) => {
          const asciiValues = consumable.name
            .split("")
            .map((char) => char.charCodeAt(0));
          console.log("Consumable: ", consumable.name, asciiValues);
        });
      });

    this.searchValue.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value: string) => {
        if (this.gridApi) {
          this.gridApi.setGridOption("quickFilterText", value);
        }
      });
  }

  onAddConsumale(): void {
    const addConsumableModal = this.modalService.open(
      AddConsumableModalComponent
    );

    addConsumableModal.afterClosed().subscribe((consumable: Consumable) => {
      if (!consumable) return;
      console.log("To be added consumable: ", consumable);
      this.consumableService.addConsumable(consumable).subscribe((res) => {
        this.getConsumablesDetails();
      });
    });
  }

  onUpdateConsumable(id: number): void {
    const updateConsumable: Consumable = this.rowData.find(
      (consumable) => consumable.id === id
    );

    let updateConsumableModal = this.modalService.open(
      AddConsumableModalComponent,
      {
        data: updateConsumable,
      }
    );

    updateConsumableModal
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((consumable: Consumable) => {
        if (!consumable) return;
        this.consumableService.updateConsumable(consumable).subscribe((res) => {
          console.log("updatedRes: ", res);
          this.getConsumablesDetails();
        });
      });
  }

  onAddCategory(): void {
    this.modalService
      .open(AddCategoryComponent)
      .afterClosed()
      .subscribe(() => console.log("Category added"));
  }

  onGridReady(params: GridReadyEvent<any>) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
    params.api.setGridOption("domLayout", "autoHeight");
  }

  getTotalCost(consumable: ConsumableDetailsDTO): string {
    switch (consumable.uom) {
      case "each":
        return (consumable.qty * consumable.avgLandedPrice).toFixed(2);
    }
  }

  onBtNext() {
    this.gridApi.paginationGoToNextPage();
  }

  onBtPrevious() {
    this.gridApi.paginationGoToPreviousPage();
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

  ngOnDestroy(): void {
    this.searchValue.reset("");
  }
}
