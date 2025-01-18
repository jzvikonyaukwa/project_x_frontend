import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { MachineService } from '../machines/services/machine.service';
import { Observable, Subject, takeUntil, tap } from 'rxjs';
import { Machine } from '../machines/models/machine';
import { MachineEvent } from '../machines/models/machineEvent';
import { MachineEventsService } from '../machines/services/machine-events.service';
import { ProductService } from '../../admin/product/product.service';
import { SteelSpecification } from '../../../shared/models/steelSpecification';
import { ProductSummaryDetailsDTO } from 'app/modules/admin/cutting-lists/models/productSummaryDetailsDTO';

@Component({
  selector: 'app-machine',
  templateUrl: './machine.component.html',
  styleUrls: ['./machine.component.scss'],
})
export class MachineComponent implements OnInit, OnDestroy {
  machineId: number | undefined;
  machine$: Observable<Machine> | undefined;
  machinesLastEvent$: Observable<MachineEvent>;
  currentCuttingList$: Observable<ProductSummaryDetailsDTO>;

  cuttingListInProgress: ProductSummaryDetailsDTO | undefined;
  coilSpecification: SteelSpecification | undefined;
  private ngUnsubscribe = new Subject<void>();
  constructor(
    private route: ActivatedRoute,
    private machineService: MachineService,
    private machineEventsService: MachineEventsService,
    private cuttingListServce: ProductService,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.machineId = parseInt(params['id']);

      if (isNaN(this.machineId)) {
        console.log('URL did not contain a number. machineId was not added to URL');
      } else {
        this.machine$ = this.machineService.getMachine(this.machineId);

        this.machinesLastEvent$ = this.machineEventsService
          .getMachinesLastEvent(this.machineId)
          .pipe(
            takeUntil(this.ngUnsubscribe),
            tap((eventDetails) => {
              console.log('Machines Event: ', eventDetails);
              this.coilSpecification = eventDetails.steelCoil.steelSpecification;
            }),
          );

        this.currentCuttingList$ = this.cuttingListServce
          .getProductInProgressForMachine(this.machineId)
          .pipe(
            takeUntil(this.ngUnsubscribe),
            tap((data) => {
              console.log('cuttingListInProgress', data);
              this.cuttingListInProgress = data;
            }),
          );
      }
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
