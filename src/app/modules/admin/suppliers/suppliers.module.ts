import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SuppliersComponent } from "./suppliers.component";
import { RouterModule } from "@angular/router";
import { suppliersRoutes } from "./suppliers.routing";
import { SuppliersListComponent } from "./suppliers-list/suppliers-list.component";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { AgGridModule } from "ag-grid-angular";
import { AddSupplierComponent } from "./add-supplier/add-supplier.component";
import { DetailsComponent } from "./details/details.component";
import { SuppliersProductsComponent } from "./suppliers-products/suppliers-products.component";
import { SuppliersGrvsComponent } from "./suppliers-grvs/suppliers-grvs.component";
// import { ModuleRegistry } from "ag-grid-community";
// import { SetFilterModule } from "ag-grid-enterprise";
import { FuseCardComponent } from "@fuse/components/card";
import { UserFormComponent } from "../clients/user-form/user-form.component";
import { PageHeadingComponent } from "@layout/common/page-heading/page-heading.component";

// ModuleRegistry.registerModules([SetFilterModule]);

@NgModule({
  declarations: [
    SuppliersComponent,
    SuppliersListComponent,
    AddSupplierComponent,
    DetailsComponent,
    SuppliersProductsComponent,
    SuppliersGrvsComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(suppliersRoutes),
    MatIconModule,
    MatButtonModule,
    AgGridModule,
    FuseCardComponent,
    UserFormComponent,
    PageHeadingComponent,
  ],
})
export class SuppliersModule {}
