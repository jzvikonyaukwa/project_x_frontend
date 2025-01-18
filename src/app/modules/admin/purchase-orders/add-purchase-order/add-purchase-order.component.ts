import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FuseCardComponent } from "@fuse/components/card";
import { PageHeadingComponent } from "@layout/common/page-heading/page-heading.component";
import { PurchaseOrderFormComponent } from "./purchase-order-form/purchase-order-form.component";

@Component({
  selector: "app-add-purchase-order",
  templateUrl: "./add-purchase-order.component.html",
  standalone: true,
  imports: [
    CommonModule,
    PageHeadingComponent,
    FuseCardComponent,
    PurchaseOrderFormComponent,
  ],
})
export class AddPurchaseOrderComponent {}
