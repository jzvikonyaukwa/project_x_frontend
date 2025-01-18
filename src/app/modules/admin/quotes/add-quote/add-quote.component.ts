import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FuseCardComponent } from '@fuse/components/card';
import { PageHeadingComponent } from '@layout/common/page-heading/page-heading.component';
import { CreateSheetsCuttingListComponent } from '../create-sheets-cutting-list/create-sheets-cutting-list.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { UserDTO } from '../../clients/user-form/models/userDTO';
import { Observable, Subject, map, takeUntil, tap } from 'rxjs';
import { ClientsService } from '../../clients/services/clients.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { QuoteStatus } from '@shared/enums/quote-status';
import { QuotesService } from '../services/quotes.service';
import { QuotePostDTO } from '../models/quotePostDTO';
import { Router } from '@angular/router';
import { MatRadioModule } from '@angular/material/radio';
import { QuotePricesService } from '@shared/services/quote-prices.service';
import { QuotePrice } from '@shared/models/quotePrice';
import { ModalService } from '@shared/services/modal.service';
import { AddClientComponent } from '../../clients/add-client/add-client.component';
import { ProjectService } from '../../projects/services/project.service';
import { ProjectDetails } from '../../projects/models/projectDetails';
import { AddProjectComponent } from '../../projects/add-project/add-project.component';
import { Project } from '../../projects/models/project';
import { LuxonDateModule } from '@angular/material-luxon-adapter';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-add-quote',
  templateUrl: './add-quote.component.html',
  standalone: true,
  imports: [
    CommonModule,
    PageHeadingComponent,
    FuseCardComponent,
    CreateSheetsCuttingListComponent,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatDatepickerModule,
    LuxonDateModule,
    MatSelectModule,
    MatIconModule,
    MatInputModule,
    MatDialogModule,
    MatButtonModule,
    MatRadioModule,
  ],
})
export class AddQuoteComponent implements OnInit, OnDestroy {
  todaysDate: Date = new Date();
  currentTime: DateTime = DateTime.now().endOf('day');
  public clients$: Observable<UserDTO[]>;
  private clients: UserDTO[];
  priceCategoryOptions: string[] = ['std', 'trademen'];

  public quotePrices: QuotePrice[];
  public clientsProjects: ProjectDetails[];

  public quoteForm: FormGroup = this.fb.group({
    clientId: [null, [Validators.required]],
    projectId: [null, [Validators.required]],
    quotePrice: [null, [Validators.required]],
    dateIssued: [this.currentTime, [Validators.required]],
  });

  private ngUnsubscribe = new Subject<void>();
  constructor(
    private fb: FormBuilder,
    private clientsService: ClientsService,
    private quoteService: QuotesService,
    private router: Router,
    private quotePriceService: QuotePricesService,
    private _modalService: ModalService,
    private projectService: ProjectService,
  ) {}

  ngOnInit(): void {
    this.clients$ = this.clientsService.getAllClients().pipe(
      takeUntil(this.ngUnsubscribe),
      map((clients) => clients.sort((a, b) => a.name.localeCompare(b.name))),
      tap((clients) => {
        this.clients = clients;
      }),
    );

    this.quotePriceService
      .getAllQuotePrices()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((quotePrices) => {
        this.quotePrices = quotePrices;
      });

    this.quoteForm
      .get('clientId')
      .valueChanges.pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((value) => {
        this.getClientsProjects(value);
      });
  }

  getClientsProjects(clientId: number): void {
    this.projectService
      .getClientsProjects(clientId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((projects) => {
        console.log(projects);
        this.clientsProjects = projects;
      });
  }

  public onSubmit(): void {
    const priceCategorySelected = this.quoteForm.get('quotePrice').value;
    const quotePrice = this.getQuotePriceCategory(priceCategorySelected);

    const quote: QuotePostDTO = {
      ...this.quoteForm.value,
      dateIssued: this.quoteForm.get('dateIssued').value.toISODate(),
      quotePrice: quotePrice,
      status: QuoteStatus.draft,
      notes: '',
    };

    this.quoteService
      .createQuote(quote)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((quote) => {
        this.router.navigate(['/quotes/', quote.id]);
      });
  }

  getQuotePriceCategory(priceCategoryType: string): QuotePrice {
    if (!priceCategoryType) {
      priceCategoryType = 'std';
    }
    return this.quotePrices.find((qp) => qp.priceType === priceCategoryType);
  }

  cancel() {
    console.log('cancel');
    this.quoteForm.reset();
    this.router.navigate(['/quotes/']);
  }

  public addClient() {
    const dialog = this._modalService.open<AddClientComponent>(AddClientComponent, {
      data: {
        dataKey: 'client',
      },
    });

    dialog.afterClosed().subscribe(() => {
      console.log('New client successfully added.');
      this.clients$ = this.clientsService
        .getAllClients()
        .pipe(takeUntil(this.ngUnsubscribe))
        .pipe(map((clients) => clients.sort((a, b) => a.name.localeCompare(b.name))));
    });
  }

  public addProject() {
    const clientId = this.quoteForm.get('clientId').value;
    let client;

    if (clientId) {
      client = this.clients.find((c) => c.id === clientId);
    }

    const dialog = this._modalService.open<AddProjectComponent>(AddProjectComponent, {
      data: {
        clients: this.clients,
        clientSelected: client,
      },
    });

    dialog.afterClosed().subscribe((project: Project) => {
      if (project) {
        this.quoteForm.get('projectId').patchValue(project.id);
      }
      const clientId = this.quoteForm.get('clientId').value;
      this.getClientsProjects(clientId);
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
