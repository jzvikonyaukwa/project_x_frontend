import { Component, Inject, inject, OnDestroy, OnInit } from "@angular/core";
import { ClientsService } from "../services/clients.service";
import { UserDTO } from "app/modules/admin/clients/user-form/models/userDTO";
import { Subscription, take } from "rxjs";
import { Router } from "@angular/router";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { CommonModule } from "@angular/common";
import { UserFormComponent } from "../user-form/user-form.component";
import { SupplierService } from "../../suppliers/services/supplier.service";
import { HttpErrorResponse } from "@angular/common/http";
import { environment } from "@environments/environment";
import { MatSnackBar, MatSnackBarConfig, MatSnackBarModule } from "@angular/material/snack-bar";

@Component({
  selector: 'app-add-client',
  templateUrl: './add-client.component.html',
  standalone: true,
  imports: [CommonModule, MatSnackBarModule, UserFormComponent],
})
export class AddClientComponent implements OnInit, OnDestroy {
  serverErrorMessage: string | null = null;

  private readonly _clientService = inject(ClientsService);
  private readonly _router = inject(Router);
  private readonly _snackBar = inject(MatSnackBar);
  private readonly supplierService = inject(SupplierService);

  private addClientSubscription: Subscription;
  private addSupplierSubscription: Subscription;

  constructor(
    private _dialogRef: MatDialogRef<AddClientComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { dataKey: string },
  ) {}

  ngOnInit(): void {
    console.log('AddClientComponent initialized with data:', this.data);
  }

  ngOnDestroy(): void {
    this.addClientSubscription?.unsubscribe();
    this.addSupplierSubscription?.unsubscribe();
  }

  public submit(userDTO: UserDTO): void {
    if (this.data.dataKey === 'client') {
      console.log('Following client route');
      this.addClient(userDTO);
    } else {
      console.log('Following supplier route');
      this.addSupplier(userDTO);
    }
  }

  public addClient(userDTO: UserDTO): void {
    console.log('In addClient and clientDTO', userDTO);
    this.serverErrorMessage = null;
    this.addClientSubscription?.unsubscribe();
    this.addClientSubscription = this._clientService
      .addClient(userDTO)
      .pipe(take(1))
      .subscribe({
        next: (client) => {
          console.log('just added client', client);
          this._dialogRef.close();
        },
        error: (error: unknown) => {
          const detailedErrorMessage =
            error instanceof HttpErrorResponse
              ? error.error.message || error.statusText
              : 'Unknown error';
          this._snackBar.open(`Error adding client: ${detailedErrorMessage}`, null, {
            duration: environment.DEFAULT_SNACKBAR_TIMEOUT,
          } as MatSnackBarConfig);
          this.serverErrorMessage = detailedErrorMessage;
          console.error('Error adding client', error);
        },
      });
  }

  public addSupplier(userDTO: UserDTO): void {
    console.log('In addSupplier and clientDTO', userDTO);
    this.serverErrorMessage = null;
    this.addSupplierSubscription?.unsubscribe();
    this.addSupplierSubscription = this.supplierService.addSupplier(userDTO).subscribe({
      next: (supplier) => {
        console.log('just added supplier', supplier);
        this._router.navigate(['/', 'suppliers']);
        this._dialogRef.close();
      },
      error: (error: unknown) => {
        const detailedErrorMessage =
          error instanceof HttpErrorResponse
            ? error.error.message || error.statusText
            : 'Unknown error';
        this._snackBar.open(`Error adding supplier: ${detailedErrorMessage}`, null, {
          duration: environment.DEFAULT_SNACKBAR_TIMEOUT,
        } as MatSnackBarConfig);
        this.serverErrorMessage = detailedErrorMessage;
        console.error('Error adding supplier', error);
      },
    });
  }
}
