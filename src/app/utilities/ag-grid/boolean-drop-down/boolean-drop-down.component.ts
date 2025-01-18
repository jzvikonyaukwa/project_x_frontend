import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AgRendererComponent } from "ag-grid-angular";
import { ICellRendererParams } from "ag-grid-community";
import { MatButtonModule } from "@angular/material/button";
import { MatSelect, MatSelectModule } from "@angular/material/select";

@Component({
  selector: "app-boolean-drop-down",
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatSelectModule],
  templateUrl: "./boolean-drop-down.component.html",
  styleUrls: ["./boolean-drop-down.component.scss"],
})
export class BooleanDropDownComponent implements AgRendererComponent {
  params: ICellRendererParams;

  agInit(params: ICellRendererParams): void {
    this.params = params;
  }

  onChange(event): void {
    this.params.setValue(event.target.value === "true");
  }

  // Implement the refresh method
  refresh(params: ICellRendererParams): boolean {
    // Return false to indicate no refresh is needed
    return false;
  }
}
