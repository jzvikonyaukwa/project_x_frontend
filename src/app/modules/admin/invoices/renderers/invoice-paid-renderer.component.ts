// Author: T4professor

import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { ICellRenderer } from "ag-grid-community";

@Component({
  selector: "app-invoice-paid-renderer",
  standalone: true,
  imports: [MatFormFieldModule, MatSelectModule, CommonModule],
  template: `
    <mat-select (valueChange)="onPaidChange($event)" [(value)]='selected'>
        <mat-option *ngFor="let option of options" [value]="option">
            {{option}}
        </mat-option>
    </mat-select>
  `
})
export class InvoicePaidComponent implements ICellRenderer {
  params;
  options: string[] = ['Yes', 'No'];
  selected: string = 'No'

  agInit(params): void {
    this.params = params;
    params.data.paid ? this.selected = 'Yes' : this.selected = 'No';
  }

  refresh(params?: any): boolean {
    return true;
  }

  onPaidChange(event) {
    if (this.params.onClick instanceof Function) {
      const params = {
        paid: event,
        id: this.params.data.id
      };
      this.params.onClick(params);
    }
  }
}
