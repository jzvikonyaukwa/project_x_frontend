import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { GrvService } from '../services/grv.service';
import { ExportService } from '@shared/services/exportHTML.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PageHeadingComponent } from '@layout/common/page-heading/page-heading.component';
import { TotalValues } from '../../invoices/models/invoice';
import { GRVDetailsDTO } from '../models/grvStructuredDetails';
import { SteelCoilPostDTO } from '@shared/models/steelCoilPostDTO';
import { ConsumablePostDTO } from '../../consumables/models/consumablePostDTO';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  standalone: true,
  imports: [CommonModule, PageHeadingComponent, MatIconModule, MatButtonModule],
})
export class DetailsComponent implements OnInit, OnDestroy {
  @ViewChild('grvInfo', { static: false }) grvInfo: ElementRef;

  private destroyer$: Subject<boolean> = new Subject<boolean>();
  public allSteelCoilsTotal = 0;
  public allConsumablesTotal = 0;
  public totals: TotalValues = {
    subTotal: 0,
    taxedPrice: 0,
    totalPrice: 0,
  };

  public grvDetails: GRVDetailsDTO;

  constructor(
    private activatedRoute: ActivatedRoute,
    private grvService: GrvService,
    private exportService: ExportService,
  ) {}

  ngOnInit(): void {
    this.activatedRoute.params
      .pipe(
        takeUntil(this.destroyer$),
        switchMap((params: { id: number }) => {
          return this.grvService.getGrvDetails(params.id);
        }),
      )
      .subscribe({
        next: (grv) => {
        this.grvDetails = grv;
        this.calculateTotals();
      },
    });
  }

  public calculateSteelCoilTotal(steelCoil: SteelCoilPostDTO): string {
    return (steelCoil.landedCostPerMtr * steelCoil.estimatedMetersRemaining).toFixed(2);
  }

  public calculateConsumableTotal(consumable: ConsumablePostDTO): string {
    return (consumable.qtyOrdered * consumable.landedPrice).toFixed(2);
  }

  public calculateTotals(): void {
    var steelCoilsTotal = 0;
    var consumablesTotal = 0;
    if (this.grvDetails) {
      if (this.grvDetails.steelCoils) {
        steelCoilsTotal = this.grvDetails.steelCoils.reduce(
          (a, b) => b.landedCostPerMtr * b.estimatedMetersRemaining + a,
          0,
        );
      }
      if (this.grvDetails.consumablesOnGrv) {
        consumablesTotal = this.grvDetails.consumablesOnGrv.reduce(
          (a, b) => b.qtyOrdered * b.landedPrice + a,
          0,
        );
      }
    }
    this.totals.subTotal = steelCoilsTotal + consumablesTotal;
    this.totals.taxedPrice = (this.totals.subTotal * 15) / 100;
    this.totals.totalPrice = this.totals.subTotal + this.totals.taxedPrice;
  }

  public downloadAsPDF(targetHTML: HTMLDivElement, gviId: number): void {
    this.exportService.exportAsPdf(this.grvInfo.nativeElement, `GRV ${gviId}`);
  }

  ngOnDestroy(): void {
    this.destroyer$.next(true);
    this.destroyer$.complete();
  }
}
