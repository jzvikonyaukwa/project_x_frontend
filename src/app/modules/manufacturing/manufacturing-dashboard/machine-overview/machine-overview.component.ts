import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MachinesTransactionsChartComponent } from '../machines-transactions-chart/machines-transactions-chart.component';
import { MachineInformation } from '../../machines/models/machineInformation';
import { AlternativeProductListTableComponent } from '../../machine-board/alternative-product-list-table/alternative-product-list-table.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { ProductSummaryDetailsDTO } from 'app/modules/admin/cutting-lists/models/productSummaryDetailsDTO';
import { ProductService } from 'app/modules/admin/product/product.service';

@Component({
  selector: 'app-machine-overview',
  standalone: true,
  imports: [
    CommonModule,
    MachinesTransactionsChartComponent,
    AlternativeProductListTableComponent,
    MatButtonToggleModule,
  ],
  templateUrl: './machine-overview.component.html',
  styleUrls: ['./machine-overview.component.scss'],
})
export class MachineOverviewComponent implements OnInit {
  @Input() machineInfo: MachineInformation;
  cuttingLists: ProductSummaryDetailsDTO[];
  constructor(private cuttingListService: ProductService) {}

  ngOnInit(): void {
    this.getCuttingLists();
  }

  getCuttingLists() {
    this.cuttingListService
      .getProductScheduledForProduct(this.machineInfo.width)
      .subscribe((data: ProductSummaryDetailsDTO[]) => {
        console.log('Cutting lists for machine ', this.machineInfo.machineId, ' : ', data);
        this.cuttingLists = data;
      });
  }
}
