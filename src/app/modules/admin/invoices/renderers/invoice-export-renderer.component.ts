// Author: T4professor

import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatSelectModule } from "@angular/material/select";
import { ICellRenderer } from "ag-grid-community";

@Component({
  selector: "app-invoice-export-renderer",
  standalone: true,
  imports: [MatFormFieldModule, MatMenuModule, CommonModule, MatIconModule],
  template: `
<button mat-icon-button [matMenuTriggerFor]="menu" class='h-full flex items-center justify-center'>
  <mat-icon>photo_filter</mat-icon>
</button>
<mat-menu #menu="matMenu">
  <button (click)="onExport()" mat-menu-item>
    <span>PDF</span>
  </button>
  <!-- <button mat-menu-item disabled>
    <mat-icon>voicemail</mat-icon>
    <span>Check voice mail</span>
  </button>
  <button mat-menu-item>
    <mat-icon>notifications_off</mat-icon>
    <span>Disable alerts</span>
  </button> -->
</mat-menu>
  `
})
export class InvoiceExportRendererComponent implements ICellRenderer {
  params;
  options: string[] = ['PDF', 'PNG'];

  agInit(params): void {
    this.params = params;
  }

  refresh(params?: any): boolean {
    return true;
  }

  onExport() {
    if (this.params.onClick instanceof Function) {
      const params = {
        id: this.params.data.id
      };
      this.params.onClick(params);
    }
  }
}
