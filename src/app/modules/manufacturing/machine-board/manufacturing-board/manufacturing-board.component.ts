import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { SteelCoilDetailsDTO } from '../../../../shared/models/steelCoilDetailsDTO';
import { MachineEventsService } from '../../machines/services/machine-events.service';
import { MachineEvent } from '../../machines/models/machineEvent';
import { Observable, Subject, takeUntil, tap } from 'rxjs';
import { ProductService } from '../../../admin/product/product.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '@shared/pipes/filter.pipe';
import { CuttingListCardComponent } from '../cutting-list-card/cutting-list-card.component';
import { CoilCardComponent } from '../coil-card/coil-card.component';
import { MatMenuModule } from '@angular/material/menu';
import { NoCoilComponent } from '../no-coil/no-coil.component';
import { AlternativeProductListTableComponent } from '../alternative-product-list-table/alternative-product-list-table.component';
import { CurrentCoilLoadedComponent } from '../current-coil-loaded/current-coil-loaded.component';
import { CuttingListInProgressComponent } from '../cutting-list-in-progress/cutting-list-in-progress.component';
import { MachineInformation } from '../../machines/models/machineInformation';
import { ProductSummaryDetailsDTO } from 'app/modules/admin/cutting-lists/models/productSummaryDetailsDTO';

@Component({
  selector: 'app-manufacturing-board',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    MatMenuModule,
    MatIconModule,
    FilterPipe,
    CuttingListCardComponent,
    CoilCardComponent,
    NoCoilComponent,
    AlternativeProductListTableComponent,
    CurrentCoilLoadedComponent,
    CuttingListInProgressComponent,
  ],
  templateUrl: './manufacturing-board.component.html',
  styleUrls: ['./manufacturing-board.component.scss'],
})
export class ManufacturingBoardComponent implements OnChanges, OnDestroy {
  @Input() productCategory: MachineInformation | undefined;
  machineId: number;
  loadedCoil: SteelCoilDetailsDTO;
  cuttingListInProgress: ProductSummaryDetailsDTO;
  matchingCuttingLists: ProductSummaryDetailsDTO[] = [];
  remainingCuttingLists: ProductSummaryDetailsDTO[] = [];
  machineLastEvent: MachineEvent;

  coilsInStock: SteelCoilDetailsDTO[] = [];

  percentageComplete: number;
  clientSearchText = '';
  cutsMade: number;
  priorityMenuOptions = ['Low', 'Medium', 'High'];

  viewMore: boolean = false;
  private ngUnsubscribe = new Subject<void>();

  machinesLastEvent$: Observable<MachineEvent | null> =
    this.machineEventsService.machinesLatestEvent$.pipe(
      takeUntil(this.ngUnsubscribe),
      tap((machineEvent) => {
        if (machineEvent !== null && machineEvent !== undefined) {
          console.log('In if statement');
          this.loadedCoil =
            this.machineEventsService.convertSteelCoilToSteelCoilDetailsDTO(machineEvent);
          this.findMatchingCuttingListsAndRemoveFromCuttingLists();
        }
      }),
    );

  constructor(
    private machineEventsService: MachineEventsService,
    private cuttingListService: ProductService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.productCategory) {
      this.productCategory = changes.productCategory.currentValue;
      this.machineId = this.productCategory.machineId;
      this.fetchInitialData();
    }
  }

  private fetchInitialData(): void {
    if (!this.machineId) return;

    this.machineEventsService
      .getMachinesLastEvent(this.machineId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((machineEvent) => {
        this.handleInitialData(machineEvent);
      });
  }

  private handleInitialData(machineEvent: MachineEvent): void {
    this.machineLastEvent = machineEvent;

    this.loadedCoil = this.machineEventsService.convertSteelCoilToSteelCoilDetailsDTO(machineEvent);
    this.findMatchingCuttingListsAndRemoveFromCuttingLists();
  }

  findMatchingCuttingListsAndRemoveFromCuttingLists() {
    let width: number;

    if (this.productCategory.categoryId === 1) {
      width = 925;
    } else if (this.productCategory.categoryId === 2) {
      width = 150;
    } else if (this.productCategory.categoryId === 3) {
      width = 103;
    } else {
      width = 182;
    }

    console.log('Width: ', width);

    this.cuttingListService
      .getProductScheduledForProduct(width)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (cuttingLists: ProductSummaryDetailsDTO[]) => {
          console.log('Cutting lists: ', cuttingLists);

          if (!this.loadedCoil) {
            this.remainingCuttingLists = cuttingLists;
            return;
          }

          const color = this.loadedCoil.color;
          const gauge = this.loadedCoil.gauge;
          const width = this.loadedCoil.width;

          console.log('Color: ', color, 'Gauge: ', gauge, 'Width: ', width);
          this.matchingCuttingLists = [];
          this.remainingCuttingLists = [];

          for (let i = cuttingLists.length - 1; i >= 0; i--) {
            const cuttingList = cuttingLists[i];

            if (
              cuttingList.color === color &&
              cuttingList.gauge === gauge &&
              cuttingList.width === width
            ) {
              this.matchingCuttingLists.push(cuttingList);
              cuttingLists.splice(i, 1);
            } else {
              this.remainingCuttingLists.push(cuttingList);
            }
          }

          console.log('Matching cutting lists: ', this.matchingCuttingLists);
        },
        error: (err) => {
          console.log('Error occurred while trying to get all cutting lists for a mahcine: ', err);
        },
      });
  }

  cuttingListMovedToInProgress(): void {
    this.cuttingListService
      .getProductInProgressForMachine(this.productCategory.width)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((cuttingListInProgress) => {
        this.cuttingListInProgress = cuttingListInProgress;
        this.findMatchingCuttingListsAndRemoveFromCuttingLists();
      });
  }

  cuttingListClosed(result: boolean): void {
    console.log('In the cuttingListClosed method');
    this.machineEventsService
      .getMachinesLastEvent(this.machineId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((machineEvent) => {
        console.log('In the cuttingListClosed method and machineEvent: ', machineEvent);
      });
  }

  reorderManufacturingCuttingList(): void {
    console.log('Reordering reorderManufacturingCuttingList');
    this.matchingCuttingLists.sort((a, b) => {
      const priorityValues = {
        high: 3,
        medium: 2,
        low: 1,
      };
      const priorityA = priorityValues[a.priority || ''] || 0;
      const priorityB = priorityValues[b.priority || ''] || 0;
      return priorityB - priorityA;
    });
  }

  cuttingListChanged(result: boolean): void {
    if (result) {
      this.findMatchingCuttingListsAndRemoveFromCuttingLists();
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
