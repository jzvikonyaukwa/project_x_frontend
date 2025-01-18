import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeadingComponent } from '@layout/common/page-heading/page-heading.component';
import { Subject, switchMap, takeUntil, throwError } from 'rxjs';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FuseCardComponent } from '@fuse/components/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RejectionReasonService } from '@shared/services/rejection-reason.service';
import { RejectionReason } from '@shared/models/rejectionReason';
import { AgGridModule } from 'ag-grid-angular';
import { FuseAlertComponent } from '@fuse/components/alert';
import { QuotePriceCategoryCardComponent } from '../../quotes/quote-price-category-card/quote-price-category-card.component';
import { CreateCodeService } from '../../quotes/services/create-code.service';
import { DeliveryNotesService } from '../services/delivery-notes.service';
import { Client } from '@bugsnag/js';
import { DeliveryNote } from '../models/delivery-note';
import { DeliveryNoteDocumentComponent } from '../delivery-note-document/delivery-note-document.component';
import { ProjectDeliveryNotesComponent } from '../../project/project-delivery-notes/project-delivery-notes.component';
import { ProjectInformation } from '../models/projectInformation';
import { ProductsOnQuoteSummaryComponent } from '../../quotes/quote/products-on-quote-summary/products-on-quote-summary.component';
import { ConsumablesOnQuoteTableComponent } from '../../quotes/quote/consumables-on-quote/consumables-on-quote-table/consumables-on-quote-table.component';

@Component({
  selector: 'app-quote',
  standalone: true,
  imports: [
    CommonModule,
    PageHeadingComponent,
    FuseCardComponent,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSortModule,
    MatProgressBarModule,
    RouterModule,
    ProductsOnQuoteSummaryComponent,
    AgGridModule,
    QuotePriceCategoryCardComponent,
    FuseAlertComponent,
    ConsumablesOnQuoteTableComponent,
    ProjectDeliveryNotesComponent,
    DeliveryNoteDocumentComponent,
  ],
  templateUrl: './delivery-note.component.html',
})
export class DeliveryNoteComponent implements OnInit, OnDestroy {
  deliveryNoteStatus = ['DELIVERED', 'PENDING_DELIVERY', 'DELIVERY_FAILED'];
  deliveryNote: DeliveryNote;
  rejectedSeaons: RejectionReason[];
  client: Client;
  projectOverview: ProjectInformation;

  private ngUnsubscribe = new Subject<void>();

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public rejectionReasonsService: RejectionReasonService,
    public createCodeService: CreateCodeService,
    private deliveryNoteService: DeliveryNotesService,
  ) {}

  ngOnInit(): void {
    this.getDeliveryNote();
    this.getClientInfo();
    this.getProjectInfo();
  }

  getClientInfo() {
    this.activatedRoute.paramMap
      .pipe(
        switchMap((params) => {
          const idParam = params.get('id');
          const id = Number(idParam);
          if (!isNaN(id)) {
            return this.deliveryNoteService.getClientInfoByDeliveryNoteId(id);
          } else {
            console.log('Invalid Delivery Note ID');
            return throwError(() => new Error('Invalid Delivery Note ID'));
          }
        }),
        takeUntil(this.ngUnsubscribe),
      )
      .subscribe({
        next: (client) => {
          console.log('client: ', client);
          this.client = client;
          console.log(this.client);
        },
        error: (err) => {
          console.log('Error occurred in the ngOnInit.', err);
        },
      });
  }

  getDeliveryNote() {
    this.activatedRoute.params
      .pipe(
        takeUntil(this.ngUnsubscribe),
        switchMap((params: { id: number }) => {
          return this.deliveryNoteService.getDeliveryNoteById(params.id);
        }),
      )
      .subscribe((deliveryNote) => {
        this.deliveryNote = deliveryNote;
      });
  }

  getProjectInfo() {
    this.activatedRoute.paramMap
      .pipe(
        switchMap((params) => {
          const idParam = params.get('id');
          const id = Number(idParam);
          if (!isNaN(id)) {
            return this.deliveryNoteService.getProjectInfoByDeliveryNoteId(id);
          } else {
            return throwError(() => new Error('Invalid Delivery Note ID'));
          }
        }),
        takeUntil(this.ngUnsubscribe),
      )
      .subscribe({
        next: (projectOverview) => {
          this.projectOverview = projectOverview;
        },
        error: (err) => {
          return throwError(() => new Error('Invalid Project Overview'));
        },
      });
  }

  updateDeliveryNoteStatus(newStatus: string) {
    this.deliveryNoteService.updateDeliveryNoteStatus(this.deliveryNote.id, newStatus).subscribe({
      next: (updatedDeliveryNote) => {
        console.log('Delivery Note status updated:', updatedDeliveryNote);
        // this.deliveryNote = updatedDeliveryNote;
      },
      error: (err) => {},
    });
  }

  getAllQoteRejectedReasons(): void {
    this.rejectionReasonsService.getAllReasons().subscribe((reasons) => {
      this.rejectedSeaons = reasons;
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
