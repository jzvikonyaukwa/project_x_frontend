import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ICellRendererParams } from "ag-grid-community";
import { ManufacturedProduct } from "../../../modules/admin/cutting-lists/models/manufacturedProduct";

@Component({
  selector: "app-empty-button",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./empty-button.component.html",
})
export class EmptyButtonComponent {
  public params: any;
  public cellValue: string;

  isSliderChecked = false;

  // agInit(params: ICellRendererParams<any, any, any>): void {
  //   this.params = params;
  //   if (params.data && params.data.status != null) {
  //     this.isSliderChecked = params.data.status !== "scheduled";
  //   }
  // }
  agInit(params: ICellRendererParams<any, any, any>): void {
    this.params = params;
    // Check if params and params.data are defined
    if (params && params.data) {
      this.isSliderChecked = params.data.status !== "scheduled";
    }
  }

  refresh(): boolean {
    return false;
  }
}
