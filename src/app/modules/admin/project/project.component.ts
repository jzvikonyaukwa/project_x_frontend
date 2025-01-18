import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeadingComponent } from '@layout/common/page-heading/page-heading.component';
import { ActivatedRoute } from '@angular/router';
import { Subject, switchMap, takeUntil, throwError } from 'rxjs';
import { ProjectQuotesTableComponent } from './project-quotes-table/project-quotes-table.component';
import { ProductStatus } from '@shared/enums/product-status';
import { ProjectDeliveryNotesComponent } from './project-delivery-notes/project-delivery-notes.component';
import { ProjectOverview } from '../projects/models/projectOverview';
import { ProjectService } from '../projects/services/project.service';
import { Quote } from '../quotes/models/quote';
import { ProjectCreditNotesComponent } from './project-credit-notes/project-credit-notes.component';
import { InventoryComponent } from './project-inventory/inventory.component';

@Component({
  selector: 'app-project',
  standalone: true,
  imports: [
    CommonModule,
    PageHeadingComponent,
    ProjectQuotesTableComponent,
    ProjectDeliveryNotesComponent,
    ProjectCreditNotesComponent,
    InventoryComponent,
  ],
  templateUrl: './project.component.html',
})
export class ProjectComponent implements OnInit, OnDestroy {
  projectOverview: ProjectOverview;
  completedQuotes: number = 0;
  totalQuotes: number = 0;

  completedCuttingLists: number = 0;
  totalCuttingLists: number = 0;

  outSourcedProductsCompleted: number = 0;
  totalOutSourcedProducts: number = 0;

  private ngUnsubscribe = new Subject<void>();

  constructor(private route: ActivatedRoute, private projectService: ProjectService) {}

  ngOnInit() {
    this.handleRouteParams();
  }

  handleRouteParams(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const idParam = params.get('id');
          const id = Number(idParam);
          if (!isNaN(id)) {
            return this.projectService.getProjectOverview(id);
          } else {
            console.log('Invalid quote ID');
            return throwError(() => new Error('Invalid quote ID'));
          }
        }),
        takeUntil(this.ngUnsubscribe),
      )
      .subscribe({
        next: (projectOverview: ProjectOverview) => {
          console.log('projectOverview: ', projectOverview);
          this.projectOverview = projectOverview;
          this.getQuoteCompletionStatus(projectOverview.quotes);
          this.getCuttingListCompletionStatus(projectOverview.quotes);
        },
        error: (err) => {
          console.log('Error occurred in the ngOnInit.', err);
        },
      });
  }

  getQuoteCompletionStatus(quotes: Quote[]) {
    quotes.forEach((quote) => {
      let quoteCompleted = true;
      quote.products.forEach((cl) => {
        if (cl.status != ProductStatus.COMPLETED) {
          quoteCompleted = false;
        }
      });
      if (quoteCompleted) {
        this.completedQuotes++;
      }
    });

    this.totalQuotes = quotes.length;
  }

  getCuttingListCompletionStatus(quotes: Quote[]) {
    quotes.forEach((quote) => {
      quote.products.forEach((p) => {
        if (p.status == ProductStatus.COMPLETED) {
          this.completedCuttingLists++;
        }
      });
    });

    this.totalCuttingLists = quotes.reduce((acc, quote) => acc + quote.products.length, 0);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
