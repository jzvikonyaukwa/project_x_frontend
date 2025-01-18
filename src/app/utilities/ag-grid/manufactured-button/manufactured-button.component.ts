import { Component } from '@angular/core';
import { AgGridModule, ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { ManufacturedProduct } from '../../../modules/admin/cutting-lists/models/manufacturedProduct';
import { CommonModule } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-manufactured-button',
  standalone: true,
  imports: [CommonModule, MatSlideToggleModule, FormsModule, AgGridModule],
  templateUrl: './manufactured-button.component.html',
})
export class ManufacturedButtonComponent implements ICellRendererAngularComp {
  public params: any;
  public cellValue: string;

  isSliderChecked = false;

  agInit(params: ICellRendererParams<any, any, any>): void {
    this.params = params;

    if (params && params.data) {
      this.isSliderChecked =
        params.data.productStatus == 'completed' && params.data.aggProdStatus == 'completed';
    }
  }

  refresh(): boolean {
    return false;
  }

  onSliderChange(event): void {
    const rowIndex = this.params.node.rowIndex;
    const rowNode = this.params.api.getDisplayedRowAtIndex(rowIndex);

    if (rowNode && rowNode.data) {
      const product: ManufacturedProduct = rowNode.data;

      if (event.checked) {
        product.status = 'manufactured';
      } else {
        product.status = 'scheduled';
        console.log('Not Checked rowNode, ', product);
      }

      // Pass the entire row data instead of just params.value
      this.params.clicked({ data: product });
      this.params.api.refreshCells({ rowNodes: [rowNode] });
    }
  }

  getValueToDisplay(params: ICellRendererParams): string {
    return params.valueFormatted ? params.valueFormatted : params.value;
  }
}
