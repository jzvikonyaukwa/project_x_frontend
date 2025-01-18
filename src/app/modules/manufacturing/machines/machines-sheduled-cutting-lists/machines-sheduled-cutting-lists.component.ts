import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ProductService } from '../../../admin/product/product.service';
import { Subject, takeUntil } from 'rxjs';
import { ProductInformation } from '../../../admin/cutting-lists/models/cuttingListInformationDTO';
import { ProductDTO } from '../../../admin/cutting-lists/models/productDTO';
import { Router } from '@angular/router';
import { SearchCuttingListsInfo } from '../models/searchCuttingListsInfo';

@Component({
  selector: 'app-machines-sheduled-cutting-lists',
  templateUrl: './machines-sheduled-cutting-lists.component.html',
})
export class MachinesSheduledCuttingListsComponent implements OnInit, OnDestroy {
  // @Input() machineId: number;
  @Input() searchCriteria: SearchCuttingListsInfo;

  hideDraftQuotes = true;

  cuttingListData: ProductInformation[];

  private ngUnsubscribe = new Subject<void>();

  constructor(private cuttingListService: ProductService, private router: Router) {}

  ngOnInit(): void {
    console.log('searchCriteria = ', this.searchCriteria);
    // this.getScheduledCuttingListsForMachine();
  }

  getScheduledCuttingListsForMachine(): void {
    this.cuttingListData = null;
    // this.cuttingListService
    //   .getCuttingListsScheduledForMachine(this.machineId)
    //   .pipe(takeUntil(this.ngUnsubscribe))
    //   .subscribe((data) => {
    //     console.log("cuttingListData = ", data);
    //     this.cuttingListData = data;
    //   });
  }

  changeCuttingListStatusChange(productId: number): void {
    this.cuttingListService
      .changeProductStatus(productId, 'in-progress')
      .subscribe((productId: ProductDTO) => {
        console.log('cutting list returned = ', productId);
        this.router.navigate(['machines/1'], {
          queryParamsHandling: 'preserve',
        });
      });
  }

  toggleCompleted(event: any) {
    console.log('event = ', event);

    if (event.checked) {
      this.cuttingListData = this.cuttingListData.filter(
        (cuttingList) => cuttingList.quoteStatus != 'draft',
      );
    } else {
      this.getScheduledCuttingListsForMachine();
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
