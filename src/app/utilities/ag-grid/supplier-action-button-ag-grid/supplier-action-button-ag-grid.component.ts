import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
    selector: 'app-supplier-action-button',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule],
    templateUrl: './supplier-action-button-ag-grid.component.html',
    styleUrls: ['./supplier-action-button-ag-grid.component.scss'],
})
export class SupplierActionButtonAgGridComponent implements ICellRendererAngularComp {
    private params: any;

    constructor(private router: Router) {}

    agInit(params: ICellRendererParams): void {
        this.params = params;
    }

    refresh(params: ICellRendererParams<any, any>): boolean {
        return false;
    }

    onClick(event: any) {
        this.router.navigate(['/suppliers/', this.params.value]);
    }
}
