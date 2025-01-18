import { Component, OnDestroy, OnInit, inject } from "@angular/core";
import { Observable, Subject, Subscription, switchMap, takeUntil, tap } from "rxjs";
import { ActivatedRoute, Params } from "@angular/router";
import { ClientsService } from "../services/clients.service";
import {
  Address,
  Email,
  Phone,
    Name,
  UserDTO,
} from "app/modules/admin/clients/user-form/models/userDTO";
import { ModalService } from "@shared/services/modal.service";
import {
  UserEditAddressesModalComponent,
  UserEditAddressDialogData,
} from "@shared/components/user-edit-adresses-modal/user-edit-addresses-modal.component";
import {
  UserEditPhoneDialogData,
  UserEditPhonesModalComponent,
} from "@shared/components/user-edit-phones-modal/user-edit-phones-modal.component";
import {
  UserEditEmailDialogData,
  UserEditEmailsModalComponent,
} from "@shared/components/user-edit-emails-modal/user-edit-emails-modal.component";
import {
  UserEditNameDialogData,
  UserEditNameModalComponent,
} from "@shared/components/user-edit-name-modal/user-edit-name-modal.component";
import { QuotesService } from "../../quotes/services/quotes.service";
import { Quote } from "../../quotes/models/quote";
import { Contact } from "@shared/types/contact.type";
import { HttpErrorResponse } from "@angular/common/http";
import { AgGridResponse } from "app/utilities/ag-grid/models/ag-grid-response";
import { DeliveryNotesService } from "../../delivery-notes/services/delivery-notes.service";
import { DeliveryNote } from "../../delivery-notes/models/delivery-note";
import { MatSnackBar, MatSnackBarConfig } from "@angular/material/snack-bar";
import { environment } from "@environments/environment";

@Component({
  selector: 'app-client-details',
  templateUrl: './customer.component.html',
})
export class CustomerComponent implements OnInit, OnDestroy {
  errorMessage?: string;
  deliveryNotes: DeliveryNote[] = [];
  quotes: Quote[] = [];
  cuttingList$: Observable<any[]>;

  destroyed$$: Subject<void> = new Subject<void>();

  client: UserDTO;
  clientId: number;

  private readonly _clientsService = inject(ClientsService);
  private readonly _deliveryNotesService = inject(DeliveryNotesService);
  private readonly _quotesService = inject(QuotesService);
  private readonly _snackBar = inject(MatSnackBar);

  private editNameSubscription: Subscription;
  private fetchDeliveryNotesForClientWithIdSubscription: Subscription;
  private fetchQuotesForClientWithIdSubscription: Subscription;
  private getClientSubscription: Subscription;

  constructor(private _route: ActivatedRoute, private _modalService: ModalService) {}

  ngOnInit(): void {
    this._route.params
      .pipe(
        tap((params: Params) => (this.clientId = parseInt(params.id))),
        switchMap((params: Params) => this._clientsService.getClient(params.id)),
        takeUntil(this.destroyed$$),
      )
      .subscribe((client: UserDTO) => {
        this.client = client;
      });

    this.fetchQuotesForClientWithIdSubscription?.unsubscribe();
    this.fetchQuotesForClientWithIdSubscription = this._quotesService
      .fetchQuotesForClientWithId(this.clientId)
      .subscribe({
        next: (response: AgGridResponse<Quote[]>) => {
          this.quotes = response.data;
        },
        error: (error: unknown) => {
          const detailedErrorMessage =
            error instanceof HttpErrorResponse
              ? error.error.message || error.statusText
              : 'Unknown error';
          this._snackBar.open(`Error fetching quotes: ${detailedErrorMessage}`, null, {
            duration: environment.DEFAULT_SNACKBAR_TIMEOUT,
          } as MatSnackBarConfig);
          console.error('Error fetching quotes', error);
        },
      });

    this.fetchDeliveryNotesForClientWithIdSubscription?.unsubscribe();
    this.fetchDeliveryNotesForClientWithIdSubscription = this._deliveryNotesService
      .fetchDeliveryNotesForClientWithId(this.clientId)
      .subscribe({
        next: (response: AgGridResponse<DeliveryNote[]>) => {
          this.deliveryNotes = response.data;
        },
        error: (error: unknown) => {
          const detailedErrorMessage =
            error instanceof HttpErrorResponse
              ? error.error.message || error.statusText
              : 'Unknown error';
          this._snackBar.open(`Error fetching delivery notes: ${detailedErrorMessage}`, null, {
            duration: environment.DEFAULT_SNACKBAR_TIMEOUT,
          } as MatSnackBarConfig);
          console.error('Error fetching delivery notes', error);
        },
      });
  }

  getClient(): void {
    this.getClientSubscription?.unsubscribe();
    this.getClientSubscription = this._clientsService
      .getClient(this.clientId)
      .subscribe((client: UserDTO) => {
        this.client = client;
      });

    this.fetchQuotesForClientWithIdSubscription?.unsubscribe();
    this.fetchQuotesForClientWithIdSubscription = this._quotesService
      .fetchQuotesForClientWithId(this.clientId)
      .subscribe({
        next: (response: AgGridResponse<Quote[]>) => {
          this.quotes = response.data;
        },
        error: (error: unknown) => {
          const detailedErrorMessage =
            error instanceof HttpErrorResponse
              ? error.error.message || error.statusText
              : 'Unknown error';
          this._snackBar.open(`Error fetching quotes: ${detailedErrorMessage}`, null, {
            duration: environment.DEFAULT_SNACKBAR_TIMEOUT,
          } as MatSnackBarConfig);
          console.error('Error fetching quotes', error);
        },
      });

    this.fetchDeliveryNotesForClientWithIdSubscription?.unsubscribe();
    this.fetchDeliveryNotesForClientWithIdSubscription = this._deliveryNotesService
      .fetchDeliveryNotesForClientWithId(this.clientId)
      .subscribe({
        next: (response: AgGridResponse<DeliveryNote[]>) => {
          this.deliveryNotes = response.data;
        },
        error: (error: unknown) => {
          const detailedErrorMessage =
            error instanceof HttpErrorResponse
              ? error.error.message || error.statusText
              : 'Unknown error';
          this._snackBar.open(`Error fetching delivery notes: ${detailedErrorMessage}`, null, {
            duration: environment.DEFAULT_SNACKBAR_TIMEOUT,
          } as MatSnackBarConfig);
          console.error('Error fetching delivery notes', error);
        },
      });
  }

  editAddresses(data: Address[]) {
    const dialog = this._modalService.open<
      UserEditAddressesModalComponent,
      UserEditAddressDialogData
    >(UserEditAddressesModalComponent, {
      data: { data },
    });

    dialog.afterClosed().subscribe(this._handleAfterClosed<Address>('addresses'));
  }

  editPhones(data: Phone[]) {
    const dialog = this._modalService.open<UserEditPhonesModalComponent, UserEditPhoneDialogData>(
      UserEditPhonesModalComponent,
      {
        data: { data },
      },
    );

    dialog.afterClosed().subscribe(this._handleAfterClosed<Phone>('phones'));
  }

  editEmails(data: Email[]) {
    const dialog = this._modalService.open<UserEditEmailsModalComponent, UserEditEmailDialogData>(
      UserEditEmailsModalComponent,
      {
        data: { data },
      },
    );

    dialog.afterClosed().subscribe(this._handleAfterClosed<Email>('emails'));
  }

  // Edit Customer Name
  editCustomerName(data: Name | Name[]) {
    const namesArray = Array.isArray(data) ? data : [data];

    const dialog = this._modalService.open<UserEditNameModalComponent, UserEditNameDialogData>(
      UserEditNameModalComponent,
      {
        data: { data: namesArray },
      },
    );

    dialog.afterClosed().subscribe(this.hanldeCustomerName<Name>());
  }

  // following the same pattern as the other methods
  private hanldeCustomerName<T extends { id?: number; name?: string }>(): (
    result: T[] | null,
  ) => void {
    return (result: T[] | null) => {
      if (result && result.length > 0) {
        // Taking the first item from the result and modifying its id
        const contact = {
          ...result[0],
          label: undefined, // Removing the 'label' property
          id: this.clientId, // Set 'id' to 'this.clientId'
        };

        // Sending the object instead of the array
       this.editNameSubscription = this._clientsService.editName(contact).subscribe({
          next: (updatedContact: T) => {
            // Update the client's contact information
            this.client = {
              ...this.client,
              name: updatedContact.name,
            };
          },
          error: (error: unknown) => {
            const detailedErrorMessage =
              error instanceof HttpErrorResponse
                ? error.error.message || error.statusText
                : 'Unknown error';
            this.errorMessage = `Error saving client: ${detailedErrorMessage}`;
            this._snackBar.open(`Error saving client: ${detailedErrorMessage}`, null, {
              duration: environment.DEFAULT_SNACKBAR_TIMEOUT,
            } as MatSnackBarConfig);
            console.error('Error saving client', error);
          },
        });
      }
    };
  }

  // T can be one of contact types: Address | Phone | Email
  private _handleAfterClosed<T>(type: Contact): (result: T[] | null) => void {
    return (result: T[] | null) => {
      if (result) {
        this._clientsService
          .editContacts(
            result.map((item: T) => ({
              ...item,
              clientId: this.clientId,
            })),
            type,
          )
          .pipe(takeUntil(this.destroyed$$))
          .subscribe((items: T[]) => {
            this.client = {
              ...this.client,
              [type]: items,
            };
          });
      }
    };
  }

  deleteEmail(email: Email) {
    console.log('email: ', email.id);
    this._clientsService
      .deleteEmail(email.id)
      .pipe(takeUntil(this.destroyed$$))
      .subscribe(() => {
        this.getClient();
      });
  }

  deletePhone(phone: Phone) {
    console.log('phone: ', phone.id);
    this._clientsService
      .deletePhone(phone.id)
      .pipe(takeUntil(this.destroyed$$))
      .subscribe(() => {
        this.getClient();
      });
  }

  deleteAddress(address: Address) {
    console.log('address: ', address.id);
    this._clientsService
      .deleteAdrress(address.id)
      .pipe(takeUntil(this.destroyed$$))
      .subscribe(() => {
        console.log('address deleted');
        this.getClient();
      });
  }

  ngOnDestroy(): void {
    this.destroyed$$.next();
    this.destroyed$$.complete();

    this.editNameSubscription?.unsubscribe();
    this.fetchDeliveryNotesForClientWithIdSubscription?.unsubscribe();
    this.fetchQuotesForClientWithIdSubscription?.unsubscribe();
    this.getClientSubscription?.unsubscribe();
  }
}
