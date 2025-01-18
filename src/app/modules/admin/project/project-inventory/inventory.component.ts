import { Component, DestroyRef, Input, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { PageHeadingComponent } from "@layout/common/page-heading/page-heading.component";
import { AgGridModule } from "ag-grid-angular";
import { ColDef, GridApi, GridReadyEvent } from "ag-grid-enterprise";

import { COLUMN_DEFINITIONS } from "app/utilities/ag-grid/column-definitions";

import { FormControl, FormsModule } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

import { ProjectOverview } from "../../projects/models/projectOverview";
import { InventoryItem } from "../../inventory/models/inventoryItem";
import { FormattedInventoryItem } from "../../inventory/models/formattedInventoryItem";
import { InventoryService } from "../../inventory/services/inventory.service";

@Component({
  selector: "app-project-inventory",
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
  @Input() projectOverview!: ProjectOverview;

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
        . getInventoryStockForProject(this.projectOverview.project.id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((inventoryItems: InventoryItem[]) => {
          console.log("Inventory Items: ", inventoryItems);
          this.rowData = this.formatInventoryItems(inventoryItems);
          console.log("Formatted Inventory Items: ", this.rowData);
        });

    this.searchValue?.valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((value: string) => {
          if (this.gridApi && !this.gridApi?.isDestroyed()) {
            this.gridApi.setQuickFilter(value);
          }
        });
  }

  formatInventoryItems(inventoryItems: InventoryItem[]): FormattedInventoryItem[] {
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
      } else if (inventoryItem.product) {
        const frameType = inventoryItem.product.frameType;
        const frameName = inventoryItem.product.frameName;
        const name = `${frameType} (${frameName})`;

        const existingGroup = formattedInventoryItems.find(
            (item) => item.name === name
        );

        if (existingGroup) {
          existingGroup.lengthOrQty += inventoryItem.product.totalLength;
        } else {
          formattedInventoryItems.push({
            inventoryId: inventoryItem.id,
            dateIn: this.formatDate(inventoryItem.dateIn),
            type: "Manufactured Product",
            name: name,
            //TODO: check this
            lengthOrQty: inventoryItem.product.totalLength,
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
    this.gridApi.setDomLayout("autoHeight");
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
