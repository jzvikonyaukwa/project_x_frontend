import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ConsumableCategory } from "../../consumables/models/consumableCategory";
import {
  CellEditRequestEvent,
  ColDef,
  GetRowIdFunc,
  GetRowIdParams,
  GridReadyEvent,
} from "ag-grid-community";
import { AgGridAngular } from "ag-grid-angular";
import { ConsumableCategoriesService } from "../../consumables/services/consumable-categories.service";

@Component({
  selector: "app-categories-table",
  standalone: true,
  imports: [CommonModule, AgGridAngular],
  templateUrl: "./categories-table.component.html",
  styleUrls: ["./categories-table.component.scss"],
})
export class CategoriesTableComponent {
  @Input() categories: ConsumableCategory[] = [];
  @Output() editCategory = new EventEmitter<ConsumableCategory>();
  @Output() deleteCategory = new EventEmitter<ConsumableCategory>();

  pagination = true;
  paginationPageSize = 10;
  paginationPageSizeSelector = [10, 15, 20];

  public defaultColDef: ColDef = {
    flex: 1,
    editable: true,
  };

  public columnDefs: ColDef[] = [
    { field: "id", maxWidth: 100 },
    {
      field: "name",
      width: 200,
      cellRenderer: (params) => {
        return `<div class="flex items-center"><img src="assets/icons/edit-pen-icon.svg" 
        class="w-4 h-4 mr-8 text-axe-blue" alt="icon" />${params.value.toUpperCase()}</div>`;
      },
    },
  ];

  constructor(
    private consumableCategoriesService: ConsumableCategoriesService
  ) {}

  public getRowId: GetRowIdFunc = (params: GetRowIdParams) => params.data.id;

  onGridReady(params: GridReadyEvent<any>) {
    params.api.sizeColumnsToFit();
  }

  onCellEditRequest(event: CellEditRequestEvent) {
    const oldData = event.data;
    const field = event.colDef.field;
    const newValue = event.newValue;
    const newData = { ...oldData };
    newData[field!] = event.newValue;
    console.log("onCellEditRequest, updating " + field + " to " + newValue);

    const tx = {
      update: [newData],
    };

    this.consumableCategoriesService
      .updateConsumableCategory(newData)
      .subscribe((res) => {
        console.log("Updated category: ", res);
        event.api.applyTransaction(tx);
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
}
