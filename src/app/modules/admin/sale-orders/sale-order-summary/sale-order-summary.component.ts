import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { DomSanitizer } from "@angular/platform-browser";
import { MatIconModule, MatIconRegistry } from "@angular/material/icon";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { Router } from "@angular/router";
import { SalesOrderOverview } from "../models/salesOrderOverview";

@Component({
  selector: "app-sale-order-summary",
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressBarModule],
  templateUrl: "./sale-order-summary.component.html",
  styleUrls: ["./sale-order-summary.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaleOrderSummaryComponent {
  @Input("saleOrder") saleOrder: SalesOrderOverview;

  private readonly router = inject(Router);

  constructor(
    private domSanitizer: DomSanitizer,
    private matIconRegistry: MatIconRegistry
  ) {
    this.matIconRegistry.addSvgIcon(
      "details-icon",
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        "assets/icons/ag-grid-details-icon.svg"
      )
    );
  }

  get cuttingListCount(): number {
    // Early return if saleOrder is not present
    if (!this.saleOrder) { return 0; }

    return (this.saleOrder.completedCuttingList + this.saleOrder.inProgressCuttingLists);
  }

  get cuttingListCompletedPercentage(): number {
    // Early return if saleOrder is not present
    if (!this.saleOrder) { return 0; }

    // Early return if there are no total cutting lists
    const totalCuttingLists = this.cuttingListCount;
    if (totalCuttingLists <= 0) { return 0; }

    // Calculate and return the completed percentage
    return Number(((this.saleOrder.completedCuttingList / totalCuttingLists) * 100).toFixed(2));
  }

  get cuttingListProgress(): number {
    // Early return if saleOrder is not present
    if (!this.saleOrder) { return 0; }

    if (this.cuttingListCount > 0) {
      return (this.saleOrder.completedCuttingList / this.cuttingListCount) * 100;
    }

    return 0; // Explicitly return 0 when totalCuttingListCount is 0 
  }

  get stockReservationStatus(): string {
    return this.saleOrder.reserveStock ? "Stock Reserved" : "Not Reserved";
  }

  navigateToOrder = (id: number): void => {
    this.router.navigate([`/sale-orders/${id}`]);
  }
}
