import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SteelCoilDetailsDTO } from '@shared/models/steelCoilDetailsDTO';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MachineEvent } from '../../machines/models/machineEvent';
import { MatDialog } from '@angular/material/dialog';
import { ChangeCoilModalComponent } from 'app/modules/manufacturing/machine-board/change-coil-modal/change-coil-modal.component';
import { MachineEventsService } from '../../machines/services/machine-events.service';
import { Observable, Subject, takeUntil, tap } from 'rxjs';
import { SteelCoil } from '@shared/models/steelCoil';
import { Router } from '@angular/router';
import { NoCoilComponent } from '../no-coil/no-coil.component';
import { AddWastageModalComponent } from 'app/modules/manufacturing/machine-board/add-wastage-modal/add-wastage-modal.component';
import { AddProductToStockOnHandModalComponent } from '../add-product-to-stock-on-hand-modal/add-product-to-stock-on-hand-modal.component';
import { ProductInStock } from '../../../admin/stock/models/productInStock';
import { WastageInput } from '../add-wastage-modal/wastageInput';
import { AddWastageDTO } from '@shared/models/addWastageDTO';
import { ProductService } from '../../../admin/product/product.service';
import { WastageService } from 'app/modules/admin/wastage/wastage.service';
import { MachineInformation } from '../../machines/models/machineInformation';
import { ProductSummaryDetailsDTO } from 'app/modules/admin/cutting-lists/models/productSummaryDetailsDTO';
import { MissingMetresInput } from '../add-missing-metre-modal/missing-metresInput';
import { AddMissingMetresModalComponent } from '../add-missing-metre-modal/add-missing-metres-modal.component';
import { AddMissingMetresDTO } from '@shared/models/addMissingMetresDTO';
import { MissingMetresService } from '../../../admin/missing-metres/missing-metres.service';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { AlertService } from '../services/alert-service.service';

@Component({
  selector: 'app-current-coil-loaded',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressBarModule,
    NoCoilComponent,
    FuseAlertComponent,
  ],
  templateUrl: './current-coil-loaded.component.html',
})
export class CurrentCoilLoadedComponent implements OnInit, OnChanges, OnDestroy {
  machineId: number;
  @Input() productCategory: MachineInformation;
  cuttingListInProgress: ProductSummaryDetailsDTO;
  loadedCoil: SteelCoilDetailsDTO;

  width: number;

  showAlert = false;
  alert: { type: FuseAlertType; message: string } = {
    type: 'info',
    message: 'Loaded Machine Event and Steel Coil Successfully',
  };

  machinesLastEvent$: Observable<MachineEvent | null> =
    this.machineEventsService.machinesLatestEvent$.pipe(
      tap((machineEvent) => {
        console.log('In CurrentCoilLoadedComponent and Last event: ', machineEvent);
        if (machineEvent) {
          this.loadedCoil =
            this.machineEventsService.convertSteelCoilToSteelCoilDetailsDTO(machineEvent);
        }
      }),
    );

  private ngUnsubscribe = new Subject<void>();

  constructor(
    private dialog: MatDialog,
    private machineEventsService: MachineEventsService,
    private router: Router,
    private cuttingListService: ProductService,
    private wastageService: WastageService,
    private missingMetresService: MissingMetresService,
    private alertService: AlertService, // Inject AlertService
  ) {}

  ngOnInit(): void {
    this.alertService.alert$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((alert) => {
      if (this.showAlert) {
        this.showAlert = true;
        this.alert = alert;
        setTimeout(() => {
          this.showAlert = false;
        }, 5000); // Hide alert after 5 seconds
      }
    });

    this.machineId = this.productCategory.machineId;
    this.getMachinesLastEvent();

    if (this.productCategory.categoryId === 1) {
      this.width = 925;
    } else if (this.productCategory.categoryId === 2) {
      this.width = 150;
    } else if (this.productCategory.categoryId === 3) {
      this.width = 103;
    } else {
      this.width = 182;
    }

    this.cuttingListService.productInProgress$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((cuttingList) => {
        if (!cuttingList) return;
        this.cuttingListInProgress = cuttingList;
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.productCategory) {
      this.productCategory = changes.productCategory.currentValue;
      this.machineId = this.productCategory.machineId;

      if (this.productCategory.categoryId === 1) {
        this.width = 925;
      } else if (this.productCategory.categoryId === 2) {
        this.width = 150;
      } else if (this.productCategory.categoryId === 3) {
        this.width = 103;
      } else {
        this.width = 182;
      }
    }
  }

  getMachinesLastEvent(): void {
    if (!this.machineId) return;
    this.machineEventsService
      .getMachinesLastEvent(this.machineId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (machineEvent) => {
          console.log('Last event: ', machineEvent);
        },
        error: (err) => {
          console.log(err);
          this.alertService.setAlert({
            type: 'warning',
            message: 'Failed to load machine event. Error: ' + err.message,
          });
        },
      });
  }

  onChangeCoil(): void {
    console.log('onChangeCoil. width: ', this.width);

    const dialogRef = this.dialog.open(ChangeCoilModalComponent, {
      data: {
        coilCurrentlyLoad: this.loadedCoil,
        machineId: this.machineId,
        width: this.width,
      },
      maxWidth: '96vw',
      width: '75vw',
      maxHeight: '95vh',
    });

    dialogRef.afterClosed().subscribe((res) => {
      console.log('The dialog was closed. Result: ', res);
      if (res) {
        this.getMachinesLastEvent();
      }
    });
  }

  onViewCoil(coil: SteelCoil): void {
    console.log('onViewClick. coil: ', coil);
    this.router.navigate(['stocks', coil.id]);
  }

  onAddProductToStock() {
    console.log('onAddProductToStock');

    const dialogRef = this.dialog.open(AddProductToStockOnHandModalComponent, {
      data: this.loadedCoil,
    });

    dialogRef.afterClosed().subscribe((product: ProductInStock) => {
      console.log('onAddProductToStock. res: ', product);
      if (product) {
        this.setAlert({
          type: 'success',
          message: 'Product added to stock on hand successfully',
        });
        this.getMachinesLastEvent();
      }
    });
  }

  onAddWastage() {
    console.log('onAddWastage');

    const dialogRef = this.dialog.open(AddWastageModalComponent, {
      data: this.loadedCoil,
    });

    dialogRef.afterClosed().subscribe((wastage: WastageInput) => {
      if (!wastage) {
        return;
      }
      let cuttingListId: number = null;

      if (this.cuttingListInProgress && this.cuttingListInProgress.productId) {
        cuttingListId = this.cuttingListInProgress.productId;
      }
      const addWastage: AddWastageDTO = {
        steelCoilId: this.loadedCoil.steelCoilId,
        productId: cuttingListId,
        wastageInMeters: wastage.wastage,
        date: new Date(wastage.date),
      };

      this.wastageService.addWastage(addWastage).subscribe((res) => {
        console.log('onAddWastage. res: ', res);
        this.getMachinesLastEvent();
      });
    });
  }

  setAlert(alert: { type: FuseAlertType; message: string }) {
    this.alert = alert;
    this.showAlert = true;
    this.removeAlertAfter8Seconds();
  }

  removeAlertAfter8Seconds() {
    setTimeout(() => {
      this.showAlert = false;
    }, 5000);
  }

  onAddMissingMetres() {
    console.log('onAddMissingMetres');

    const dialogRef = this.dialog.open(AddMissingMetresModalComponent, {
      data: this.loadedCoil,
    });

    dialogRef.afterClosed().subscribe((missingMetres: MissingMetresInput) => {
      if (!missingMetres) {
        return;
      }

      const addMissingMetres: AddMissingMetresDTO = {
        steelCoilId: this.loadedCoil.steelCoilId,
        missingMeters: missingMetres.missingMetres,
        reason: missingMetres.reason,
        loggedAt: new Date(missingMetres.date),
      };

      this.missingMetresService.logMissingMetres(addMissingMetres).subscribe((res) => {
        console.log('onAddMissingMetres. res: ', res);
        this.getMachinesLastEvent();
      });
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
