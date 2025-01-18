import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { UserDTO } from "app/modules/admin/clients/user-form/models/userDTO";
import { take } from "rxjs";
import { SupplierService } from "../services/supplier.service";

@Component({
  selector: "app-add-supplier",
  templateUrl: "./add-supplier.component.html",
})
export class AddSupplierComponent {
  constructor(
    private _supplierService: SupplierService,
    private _router: Router
  ) {}

  public addSupplier(supplierDTO: UserDTO): void {
    this._supplierService
      .addSupplier(supplierDTO)
      .pipe(take(1))
      .subscribe(() => {
        this._router.navigate(["/", "suppliers"]);
      });
  }
}
