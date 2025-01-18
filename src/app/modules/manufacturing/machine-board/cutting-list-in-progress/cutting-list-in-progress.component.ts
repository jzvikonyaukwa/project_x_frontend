import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { SteelCoilDetailsDTO } from '../../../../shared/models/steelCoilDetailsDTO';
import { Observable, Subject, takeUntil, tap } from 'rxjs';
import { ProductService } from '../../../admin/product/product.service';
import { MachineEvent } from '../../machines/models/machineEvent';
import { MachineEventsService } from '../../machines/services/machine-events.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MachineInformation } from '../../machines/models/machineInformation';
import { ProductSummaryDetailsDTO } from 'app/modules/admin/cutting-lists/models/productSummaryDetailsDTO';
import { ManufactureProductComponent } from '../../manufacture-product/manufacture-product.component';

@Component({
  selector: 'app-cutting-list-in-progress',
  standalone: true,
  imports: [CommonModule, MatMenuModule, MatIconModule, MatButtonModule, MatProgressBarModule],
  templateUrl: './cutting-list-in-progress.component.html',
})
export class CuttingListInProgressComponent implements OnInit, OnDestroy {
  @Input() productCategory: MachineInformation | undefined;
  @Output() cuttingListClosed = new EventEmitter<boolean>();
  @Output() cuttingListChanged = new EventEmitter<boolean>();

  matchingLoadedCoil: boolean;
  productInProgress: ProductSummaryDetailsDTO;
  loadedCoil: SteelCoilDetailsDTO;

  cuttingListIsComplete: boolean = false;
  private ngUnsubscribe = new Subject<void>();

  cuttingListInProgress$: Observable<ProductSummaryDetailsDTO> =
    this.productService.productInProgress$.pipe(
      takeUntil(this.ngUnsubscribe),
      tap((cuttingList: ProductSummaryDetailsDTO) => {
        if (!cuttingList) return;
        this.productInProgress = cuttingList;
        this.matchingLoadedCoil = this.checkingLoadedCoilMatches();

        setTimeout(() => {
          if (!this.matchingLoadedCoil) {
            this.moveCuttingListInProgressToPending();
          }
        }, 3000);
      }),
    );

  machinesLastEvent$: Observable<MachineEvent | null> =
    this.machineEventsService.machinesLatestEvent$.pipe(
      takeUntil(this.ngUnsubscribe),
      tap((machineEvent) => {
        if (machineEvent) {
          this.loadedCoil =
            this.machineEventsService.convertSteelCoilToSteelCoilDetailsDTO(machineEvent);
          this.matchingLoadedCoil = this.checkingLoadedCoilMatches();

          setTimeout(() => {
            if (!this.matchingLoadedCoil) {
              console.log('Loaded coil does not match cutting list');
              this.moveCuttingListInProgressToPending();
            }
          }, 3000);
        }
      }),
    );

  constructor(
    private dialog: MatDialog,
    private productService: ProductService,
    private machineEventsService: MachineEventsService,
  ) {}

  ngOnInit(): void {
    this.getLastInProgressCuttingList();
    this.machinesLastEvent$.subscribe();
  }

  getLastInProgressCuttingList() {
    this.productService
      .getProductInProgressForMachine(this.productCategory.width)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((cuttingListInProgress: ProductSummaryDetailsDTO) => {
        this.productInProgress = cuttingListInProgress;
      });
  }

  onCuttingListClick(product) {
    const dialogRef = this.dialog.open(ManufactureProductComponent, {
      data: {
        product: product.productId,
        manufacture: true,
        loadedCoil: this.loadedCoil,
      },
      width: '80vw',
      maxHeight: '80vh',
    });

    dialogRef.afterClosed().subscribe((res) => {
      console.log('Dialog closed: ', res);
      this.getLastInProgressCuttingList();
      //   this.getLastInPorgressCuttingList();
      //   if (!this.productCategory.machineId) {
      //     console.log('No machine id');
      //     return;
      //   }
      //   this.machineEventsService
      //     .getMachinesLastEvent(this.productCategory.machineId)
      //     .pipe(takeUntil(this.ngUnsubscribe))
      //     .subscribe(() => console.log('New machine event'));
    });
  }

  moveCuttingListInProgressToPending() {
    if (!this.productInProgress) {
      console.log('No cutting list in progress');
      return;
    }

    this.productService
      .changeProductStatus(this.productInProgress.productId, 'scheduled')
      .subscribe(() => {
        console.log('Product list moved to pending');

        this.productService
          .getProductInProgressForMachine(this.productCategory.machineId)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(() => {
            console.log('Cutting list status changed to scheduled.');
            this.cuttingListChanged.emit(true);
          });
      });
  }

  checkingLoadedCoilMatches(): boolean {
    if (!this.loadedCoil || !this.productInProgress) {
      console.log('No loaded coil or cutting list in progress');
      return false;
    }

    return (
      this.loadedCoil.color === this.productInProgress.color &&
      this.loadedCoil.gauge === this.productInProgress.gauge
    );
  }

  calculateProgress(): number {
    const totalMeters =
      this.productInProgress.completedLength + this.productInProgress.scheduledLength;
    const percentage = (this.productInProgress.completedLength / totalMeters) * 100;

    return parseFloat(percentage.toFixed(2));
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
