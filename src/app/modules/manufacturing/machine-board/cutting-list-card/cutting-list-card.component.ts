import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductInformation } from '../../../admin/cutting-lists/models/cuttingListInformationDTO';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ProductService } from '../../../admin/product/product.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ActivatedRoute, Params } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CuttingListDetailsModalComponent } from 'app/modules/admin/cutting-lists/cutting-list-details-modal/cutting-list-details-modal.component';
import { ProductSummaryDetailsDTO } from 'app/modules/admin/cutting-lists/models/productSummaryDetailsDTO';
import { ProductDTO } from 'app/modules/admin/cutting-lists/models/productDTO';

@Component({
  selector: 'app-cutting-list-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatMenuModule, MatProgressBarModule],
  templateUrl: './cutting-list-card.component.html',
})
export class CuttingListCardComponent implements OnInit {
  @Input() cuttingList: ProductSummaryDetailsDTO;
  @Input() canWorkOn: boolean;
  @Input() coilId: number;

  @Output() priorityChanged: EventEmitter<ProductDTO> = new EventEmitter<ProductDTO>();

  @Output()
  cuttingListMovedToInProgress: EventEmitter<ProductSummaryDetailsDTO> =
    new EventEmitter<ProductSummaryDetailsDTO>();

  cutsMade: number;
  totalMeters: string;
  requiredMeters: string;
  percentageComplete: number;
  priorityMenuOptions = ['Low', 'Medium', 'High'];
  machineId: number;

  constructor(
    private cuttingListService: ProductService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      if (params['machineId']) {
        this.machineId = parseInt(params['machineId']);
      }
    });
  }

  calculateCutsMade(cuttingList: ProductInformation) {
    let cutsMade = 0;
    cuttingList.product.aggregatedProducts.forEach((product) => {
      if (product.status === 'completed') {
        cutsMade++;
      }
    });
    return cutsMade;
  }

  calculateMeters(cuttingList: ProductInformation) {
    const totalMeters = cuttingList.product.aggregatedProducts.reduce((a, b) => {
      return a + b.length;
    }, 0);
    return totalMeters.toFixed(2);
  }

  calculateMetersRequired(cuttingList: ProductInformation) {
    const requiredMeters = cuttingList.product.aggregatedProducts.reduce((a, b) => {
      if (b.status === 'completed') {
        return a + b.length;
      }
    }, 0);
    return requiredMeters?.toFixed(2) ?? '0';
  }

  get completionPercentage(): number {
    const totalLength = this.cuttingList.completedLength + this.cuttingList.scheduledLength;
    // Check if completedLength is not null
    if (this.cuttingList.completedLength == null) {
      // console.warn('Completed length is null, returning 0% progress.');
      return 0;
    }
    // console.log('Total meters: ', totalLength);
    const percentage = (this.cuttingList.completedLength / totalLength) * 100;
    // console.log('Percentage: ', percentage);
    this.percentageComplete = parseFloat(percentage.toFixed(2));
    // console.log('Percentage complete: ', this.percentageComplete);
    return this.percentageComplete;
  }

  onPriorityChange(cuttingList: ProductDTO, priority: string): void {
    if (cuttingList.priority.toLowerCase() === priority.toLowerCase()) return;

    console.log('Priority has changed menu selected.');

    // this.cuttingListService
    //   .changingCuttingListPriority(cuttingList.id, priority.toLowerCase())
    //   .subscribe((updatedCuttingList) => {
    //     this.cuttingList.priority = updatedCuttingList.priority;
    //     console.log("Priority changed on the backend");
    //     this.priorityChanged.emit(this.cuttingList);
    //   });
  }

  onSetToInProgress(): void {
    this.cuttingListService
      .changeProductStatus(this.cuttingList.productId, 'in-progress')
      .subscribe((updateCuttingList) => {
        console.log(
          'Status changed to in-progress on the backend: updateCuttingList = ',
          updateCuttingList,
        );

        this.cuttingList.productStatus = updateCuttingList.status;
        this.cuttingListMovedToInProgress.emit(this.cuttingList);
      });
  }

  viewCuttingList() {
    console.log('View cutting list. ID: ', this.cuttingList.productId);

    const dialogRef = this.dialog.open(CuttingListDetailsModalComponent, {
      data: {
        product: this.cuttingList.productId,
        manufacture: false,
      },
      width: '80vw',
      maxHeight: '80vh',
    });

    dialogRef.afterClosed().subscribe((res) => {
      console.log('The dialog was closed');
    });
  }
}
