import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CuttingListComponent } from 'app/modules/admin/cutting-list/cutting-list.component';
import { SteelCoilDetailsDTO } from '@shared/models/steelCoilDetailsDTO';

@Component({
  selector: 'app-cutting-list-details-modal',
  templateUrl: './cutting-list-details-modal.component.html',
  standalone: true,
  imports: [CommonModule, MatIconModule, CuttingListComponent],
})
export class CuttingListDetailsModalComponent {
  productId: number;
  manufacture: boolean;
  loadedCoil: SteelCoilDetailsDTO;

  constructor(
    public dialogRef: MatDialogRef<CuttingListDetailsModalComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      product: number;
      manufacture: boolean;
      loadedCoil: SteelCoilDetailsDTO;
    },
  ) {
    this.productId = data.product;
    this.manufacture = data.manufacture;
    this.loadedCoil = data.loadedCoil;
  }

  cuttingListCompleted(result: boolean): void {
    if (result) {
      this.dialogRef.close(true);
    }
  }

  onDialogClose() {
    this.dialogRef.close(true);
  }
}
