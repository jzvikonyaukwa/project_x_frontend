import { Component, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatTabsModule } from "@angular/material/tabs";
import { ProductCoilsComponent } from "../product-coils/product-coils.component";
import { ConsignmentStockComponent } from "../consignment-stock/consignment-stock.component";
import { ConsumablesInWarehouseTableComponent } from "../../consumables/consumables-in-warehouse-table/consumables-in-warehouse-table.component";
import { MatIconModule } from "@angular/material/icon";
import { AddConsumableModalComponent } from "../../consumables/add-consumable-modal/add-consumable-modal.component";
import { StockOnHandComponent } from "../stock-on-hand/stock-on-hand.component";
import { MatFormFieldModule } from "@angular/material/form-field";
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { ConsumableDetailsTableComponent } from "../../consumables/consumable-details-table/consumable-details-table.component";
import { InventoryComponent } from "../../inventory/inventory.component";
import { StockListTableComponent } from "../stock-list-table/stock-list-table.component";

interface Tab {
  name: string;
  label: string;
}

@Component({
  selector: "app-stock-overview",
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    ProductCoilsComponent,
    ConsignmentStockComponent,
    ConsumablesInWarehouseTableComponent,
    AddConsumableModalComponent,
    StockOnHandComponent,
    ConsumableDetailsTableComponent,
    InventoryComponent,
    StockListTableComponent,
  ],
  templateUrl: "./stock-overview.component.html",
  styleUrls: ["./stock-overview.component.scss"],
})
export class StockOverviewComponent implements OnDestroy {
  machines: Tab[] = [
    {
      name: "sheet",
      label: "Roof Sheets",
    },
    {
      name: "purlin",
      label: "Purlins",
    },
    {
      name: "batten",
      label: "Battens",
    },
    {
      name: "framecad",
      label: "FRAMECAD",
    },
  ];

  formGroup = new FormGroup({
    search: new FormControl(""),
  });

  constructor() {}

  ngOnDestroy(): void {
    this.formGroup.get("search").reset("");
  }
}
