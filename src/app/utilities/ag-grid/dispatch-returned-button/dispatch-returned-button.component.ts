import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ICellRendererParams } from "ag-grid-community";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: "app-dispatch-returned-button",
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: "./dispatch-returned-button.component.html",
  styleUrls: ["./dispatch-returned-button.component.scss"],
})
export class DispatchReturnedButtonComponent {
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
