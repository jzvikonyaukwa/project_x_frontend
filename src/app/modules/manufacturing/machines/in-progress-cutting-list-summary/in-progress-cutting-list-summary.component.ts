import { Component, Input } from '@angular/core';
import { ProductService } from '../../../admin/product/product.service';
import { ActivatedRoute } from '@angular/router';
import { ProductInformation } from '../../../admin/cutting-lists/models/cuttingListInformationDTO';

@Component({
  selector: 'app-in-progress-cutting-list-summary',
  templateUrl: './in-progress-cutting-list-summary.component.html',
})
export class InProgressCuttingListSummaryComponent {
  @Input() currentCuttingList: ProductInformation;

  date: Date = new Date();
  sheetRowData: ProductInformation[];
  machineId: number;

  percentageComplete: number;

  constructor(private route: ActivatedRoute, private cuttingListServce: ProductService) {}

  calculateProgress(): number {
    const completedProducts = this.currentCuttingList.product.aggregatedProducts.filter(
      (ag) => ag.status === 'completed',
    );
    const totalProducts = this.currentCuttingList.product.aggregatedProducts.length;

    this.percentageComplete = (completedProducts.length / totalProducts) * 100;
    console.log('(completedProducts.length / totalProducts) * 100 = ', this.percentageComplete);
    return (completedProducts.length / totalProducts) * 100;
  }
}
