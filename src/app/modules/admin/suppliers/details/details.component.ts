import { Component, OnDestroy, OnInit } from "@angular/core";
import { SupplierDto } from "../models/supplierDto";
import { ActivatedRoute, Params } from "@angular/router";
import { SupplierService } from "../services/supplier.service";
import { Observable, Subject, switchMap, takeUntil, tap } from "rxjs";
import { SteelSpecification } from "../../../../shared/models/steelSpecification";
import { SteelSpecificationsService } from "../../../../shared/services/steel-specifications.service";
import { GrvService } from "../../grvs/services/grv.service";
import {
  Address,
  Email,
  Phone,
} from "app/modules/admin/clients/user-form/models/userDTO";
import { ModalService } from "@shared/services/modal.service";
import {
  UserEditAddressDialogData,
  UserEditAddressesModalComponent,
} from "@shared/components/user-edit-adresses-modal/user-edit-addresses-modal.component";
import { Contact } from "@shared/types/contact.type";
import {
  UserEditPhoneDialogData,
  UserEditPhonesModalComponent,
} from "@shared/components/user-edit-phones-modal/user-edit-phones-modal.component";
import {
  UserEditEmailDialogData,
  UserEditEmailsModalComponent,
} from "@shared/components/user-edit-emails-modal/user-edit-emails-modal.component";
import { GRVDetailsDTO } from "../../grvs/models/grvStructuredDetails";

@Component({
  selector: "app-details",
  templateUrl: "./details.component.html",
  styleUrls: ["./details.component.scss"],
})
export class DetailsComponent implements OnInit, OnDestroy {
  products$: Observable<SteelSpecification[]>;
  grvs$: Observable<GRVDetailsDTO[]>;

  destroyed$$: Subject<void> = new Subject<void>();

  supplier: SupplierDto;
  supplierId: number;

  constructor(
    private _route: ActivatedRoute,
    private _supplierService: SupplierService,
    private _productSpecifications: SteelSpecificationsService,
    private _grvService: GrvService,
    private _modalService: ModalService
  ) {}

  ngOnInit(): void {
    this._route.params
      .pipe(
        tap((params: Params) => (this.supplierId = parseInt(params.id))),
        switchMap((params: Params) =>
          this._supplierService.getSupplier(params.id)
        ),
        takeUntil(this.destroyed$$)
      )
      .subscribe((supplier: SupplierDto) => {
        this.supplier = supplier;
      });
    // this.products$ = this._route.params.pipe(
    //   switchMap((params: Params) =>
    //     this._productSpecifications.getProductsBySupplier(params.id)
    //   )
    // );
    // this.grvs$ = this._route.params.pipe(
    //   switchMap((params: Params) =>
    //     this._grvService.getGrvsBySupplier(params.id)
    //   )
    // );
  }

  getSupplier(): void {
    this._supplierService
      .getSupplier(this.supplierId)
      .subscribe((supplier: SupplierDto) => {
        this.supplier = supplier;
      });
  }

  editAddresses(data: Address[]) {
    const dialog = this._modalService.open<
      UserEditAddressesModalComponent,
      UserEditAddressDialogData
    >(UserEditAddressesModalComponent, {
      data: { data },
    });

    dialog
      .afterClosed()
      .subscribe(this._handleAfterClosed<Address>("addresses"));
  }

  editPhones(data: Phone[]) {
    const dialog = this._modalService.open<
      UserEditPhonesModalComponent,
      UserEditPhoneDialogData
    >(UserEditPhonesModalComponent, {
      data: { data },
    });

    dialog.afterClosed().subscribe(this._handleAfterClosed<Phone>("phones"));
  }

  editEmails(data: Email[]) {
    const dialog = this._modalService.open<
      UserEditEmailsModalComponent,
      UserEditEmailDialogData
    >(UserEditEmailsModalComponent, {
      data: { data },
    });

    dialog.afterClosed().subscribe(this._handleAfterClosed<Email>("emails"));
  }

  deleteEmail(email: Email) {
    console.log("email: ", email.id);
    this._supplierService
      .deleteEmail(email.id)
      .pipe(takeUntil(this.destroyed$$))
      .subscribe(() => {
        this.getSupplier();
      });
  }

  deletePhone(phone: Phone) {
    console.log("phone: ", phone.id);
    this._supplierService
      .deletePhone(phone.id)
      .pipe(takeUntil(this.destroyed$$))
      .subscribe(() => {
        this.getSupplier();
      });
  }

  deleteAddress(address: Address) {
    console.log("address: ", address.id);
    this._supplierService
      .deleteAdrress(address.id)
      .pipe(takeUntil(this.destroyed$$))
      .subscribe(() => {
        console.log("address deleted");
        this.getSupplier();
      });
  }

  // T can be one of contact types: Address | Phone | Email
  private _handleAfterClosed<T>(type: Contact): (result: T[] | null) => void {
    return (result: T[] | null) => {
      if (result) {
        this._supplierService
          .editContacts(
            result.map((item: T) => ({
              ...item,
              supplierId: this.supplierId,
            })),
            type
          )
          .pipe(takeUntil(this.destroyed$$))
          .subscribe((items: T[]) => {
            this.supplier = {
              ...this.supplier,
              [type]: items,
            };
          });
      }
    };
  }

  ngOnDestroy(): void {
    this.destroyed$$.next();
    this.destroyed$$.complete();
  }
}
