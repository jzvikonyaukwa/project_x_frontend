import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductInformation } from 'app/modules/admin/cutting-lists/models/cuttingListInformationDTO';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SteelCoilDetailsDTO } from '@shared/models/steelCoilDetailsDTO';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './product-details.component.html',
})
export class ProductDetailsComponent {
  @Input() productInformation: ProductInformation;
  @Input() loadedCoil: SteelCoilDetailsDTO;

  onBtExport() {
    console.log('export');
  }

  getStatusClass(): string {
    const baseClasses = 'text-lg font-medium';
    const status = this.productInformation.product.status;

    switch (status) {
      case 'completed':
        return `${baseClasses} text-green-500`;
      case 'in-progress':
        return `${baseClasses} text-orange-500`;
      case 'scheduled':
        return `${baseClasses} text-gray-500`;
      default:
        return `${baseClasses} text-axe-dark-blue`;
    }
  }

  getMtrsRemainingClass(): string {
    if (this.loadedCoil.estMtrsRemaining <= 10) {
      return 'text-red-500';
    }
    return 'text-axe-dark-blue';
  }
}
