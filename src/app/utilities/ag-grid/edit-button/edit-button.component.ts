import {Component, EventEmitter, Input, Output} from "@angular/core";
import { CommonModule } from "@angular/common";
import { ICellRendererParams } from "ag-grid-community";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { ICellRendererAngularComp } from "ag-grid-angular";

@Component({
  selector: "app-edit-button",
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: "./edit-button.component.html",
  styleUrls: ["./edit-button.component.scss"],
})
export class EditButtonComponent implements ICellRendererAngularComp{
  // private params: any;
  @Input() params: any;
  @Output() editClick: EventEmitter<any> = new EventEmitter();

  agInit(params: ICellRendererParams): void {
    this.params = params;
  }

  refresh(params: ICellRendererParams<any, any>): boolean {
    return false;
  }

  // changed from this.params.onClick(this.params.value) to this.onClick(this.params)
  onClick() {
    this.params.onClick(this.params.value);
  }
}
