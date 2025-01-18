import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ICellRendererAngularComp } from "ag-grid-angular";
import { ICellRendererParams } from "ag-grid-community";

@Component({
  selector: "app-delete-button-ag-grid",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./delete-button-ag-grid.component.html",
  styleUrls: ["./delete-button-ag-grid.component.scss"],
})
export class DeleteButtonAgGridComponent implements ICellRendererAngularComp {
  private params: any;

  agInit(params: ICellRendererParams): void {
    this.params = params;
  }

  refresh(params: ICellRendererParams<any, any>): boolean {
    return false;
  }

  onClick() {
    this.params.onClick(this.params.value);
  }
}
