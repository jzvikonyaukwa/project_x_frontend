import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ICellRendererAngularComp } from "ag-grid-angular";
import { ICellRendererParams } from "ag-grid-community";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: "app-access-button-ag-grid",
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: "./access-button-ag-grid.component.html",
  styleUrls: ["./access-button-ag-grid.component.scss"],
})
export class AccessButtonAgGridComponent implements ICellRendererAngularComp {
  public params: any;
  public isShown: boolean;

  agInit(params: ICellRendererParams): void {
    this.params = params;
    this.isShown = params.colDef.cellRendererParams?.isConsignment;
  }

  refresh(params: ICellRendererParams<any, any>): boolean {
    return false;
  }

  onClick() {
    this.params.onClick(this.params.value);
  }
}
