import { Component, DestroyRef, Input, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { PageHeadingComponent } from "@layout/common/page-heading/page-heading.component";
import { AgGridModule } from "ag-grid-angular";
import { ColDef, GridApi, GridReadyEvent } from "ag-grid-enterprise";
import { InventoryItem } from "./models/inventoryItem";
import { COLUMN_DEFINITIONS } from "app/utilities/ag-grid/column-definitions";
import { InventoryService } from "./services/inventory.service";
import { FormControl, FormsModule } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormattedInventoryItem } from "./models/formattedInventoryItem";

@Component({
  selector: "app-inventory",
  standalone: true,
  imports: [
    CommonModule,
    AgGridModule,
    PageHeadingComponent,
    MatIconModule,
    MatButtonModule,
    FormsModule,
  ],
  templateUrl: "./inventory.component.html",
  styleUrls: ["./inventory.component.scss"],
})
export class InventoryComponent implements OnInit {
  @Input("searchValue") searchValue: FormControl<string>;
  public pagination = true;
  public paginationPageSize = "20";
  public paginationPageSizeSelector = [10, 20, 50, 100];
  public gridApi!: GridApi<InventoryItem>;

  public rowData: FormattedInventoryItem[] = [];

  public defaultColDef: ColDef = COLUMN_DEFINITIONS;

  public columnDefs: ColDef[] = [
    { headerName: "ID", field: "inventoryId", width: 130 },
    { headerName: "DATE IN", field: "dateIn", width: 150 },
    {
      headerName: "Type",
      field: "type",
      width: 150,
    },
    {
      headerName: "Name",
      field: "name",
    },
    {
      headerName: "Length/Quantity",
      field: "lengthOrQty",
      valueFormatter: (params) => {
        if (params.data.type === "Consumable") {
          return params.value;
        } else {
          return params.value + "m";
        }
      },
      width: 150,
    },
  ];

  constructor(
    private inventoryService: InventoryService,
    private destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    this.inventoryService
      .getAllInventoryItemsInStock()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((inventoryItems: InventoryItem[]) => {
        this.rowData = this.formatInventoryItems(inventoryItems);
      });

    this.searchValue?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value: string) => {
        if (this.gridApi && !this.gridApi?.isDestroyed()) {
          this.gridApi.setGridOption("quickFilterText", value);
        }
      });
  }

  formatInventoryItems(
    inventoryItems: InventoryItem[]
  ): FormattedInventoryItem[] {
    const formattedInventoryItems: FormattedInventoryItem[] = [];

    inventoryItems.forEach((inventoryItem) => {
      if (inventoryItem.consumable) {
        const existingConsumable = formattedInventoryItems.find(
          (item) => item.name === inventoryItem.consumable.consumable.name
        );

        if (existingConsumable) {
          existingConsumable.lengthOrQty++;
        } else {
          formattedInventoryItems.push({
            inventoryId: inventoryItem.id,
            dateIn: this.formatDate(inventoryItem.dateIn),
            type: "Consumable",
            name: inventoryItem.consumable.consumable.name,
            lengthOrQty: 1,
          });
        }
      } else {
        const frameType = inventoryItem.product.frameType;
        const frameName = inventoryItem.product.frameName;

        const name = frameType + " (" + frameName + ")";
        const existingGroup = formattedInventoryItems.find(
          (item) => item.name === name
        );

        if (existingGroup) {
          //tods: check this
          existingGroup.lengthOrQty += inventoryItem.product.totalLength;
        } else {
          formattedInventoryItems.push({
            inventoryId: inventoryItem.id,
            dateIn: this.formatDate(inventoryItem.dateIn),
            type: "Manufactured Product",
            name:
              inventoryItem.product.frameType +
              " (" +
              inventoryItem.product.frameName +
              ")",
            lengthOrQty: 1,
          });
        }
      }
    });

    return formattedInventoryItems;
  }

  formatDate(date: Date): string {
    const newDate = new Date(date);
    const day = ("0" + newDate.getDate()).slice(-2);
    const month = ("0" + (newDate.getMonth() + 1)).slice(-2);
    const year = newDate.getFullYear();
    return `${day}-${month}-${year}`;
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
    this.gridApi.setGridOption("domLayout", "autoHeight");
  }

  exportToExcel() {
    this.gridApi.exportDataAsExcel();
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
}
