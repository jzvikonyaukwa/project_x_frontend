import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PurchaseOrder } from "app/modules/admin/purchase-orders/models/purchaseOrders";
import { GRVDetailsDTO } from "../../grvs/models/grvStructuredDetails";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { ProductPurchase } from "app/modules/admin/purchase-orders/models/product-purchase";
import { ProductsOnPurchaseOrderService } from "app/modules/admin/purchase-orders/services/products-on-purchase-order.service";
import { PurchaseOrderService } from "app/modules/admin/purchase-orders/services/purchase-order.service";
import { Cons, Subject, switchMap, takeUntil } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { ConsumablesOnPurchaseOrder } from "app/modules/admin/purchase-orders/models/consumablesOnPurcahseOrder";
import { ConsumableOnPurchaseOrderService } from "app/modules/admin/purchase-orders/services/consumable-on-purchase-order.service";

@Component({
  selector: "app-grv-po-comparison",
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatMenuModule],
  templateUrl: "./purchase-order-with-grv-info.component.html",
})
export class PurchaseOrderWithGrvInfoComponent implements OnInit, OnDestroy {
  @Input() purchaseOrder: PurchaseOrder;
  grvs: GRVDetailsDTO[] = [];
  productStatuses = ["pending", "cancelled", "completed"];
  tableData: TableData[] = [];
  grvService: any;
  grvDetails: any;

  private destroyer$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private activatedRoute: ActivatedRoute,
    private purchaseOrderService: PurchaseOrderService,
    private productsOnPurchaseOrderService: ProductsOnPurchaseOrderService,
    private consumablesOnPurchaseOrderService: ConsumableOnPurchaseOrderService
  ) {}
  ngOnInit(): void {
    if (!this.purchaseOrder) {
      this.getParams();
    } else {
      console.log("purchaseOrder: ", this.purchaseOrder);
      this.getAllGRVForPO();
    }
  }

  getParams() {
    this.activatedRoute.params
      .pipe(
        takeUntil(this.destroyer$),
        switchMap((params: { id: number }) => {
          console.log("switchMap: ", params.id);
          return this.purchaseOrderService.getPurchaseOrderById(params.id);
        })
      )
      .subscribe((po: PurchaseOrder) => {
        console.log("purchaseOrder: ", po);
        this.purchaseOrder = po;
        this.getAllGRVForPO();
      });
  }

  getAllGRVForPO() {
    this.purchaseOrderService
      .getAllGRVForPO(this.purchaseOrder.id)
      .subscribe((res: GRVDetailsDTO[]) => {
        console.log("res: ", res);
        this.grvs = res;

        if (!this.purchaseOrder) return;

        this.tableData = this.transformDataToTableData();
      });
  }

  transformDataToTableData(): TableData[] {
    const tableData: TableData[] = [];

    this.purchaseOrder.productPurchases.forEach(
      (productOnPurchaseOrder: ProductPurchase) => {
        console.log("productOnPurchaseOrder: ", productOnPurchaseOrder);
        const type: string = `Color: ${productOnPurchaseOrder.steelSpecification.color.color} 
          - Gauge: ${productOnPurchaseOrder.steelSpecification.gauge.gauge} 
          - Width: ${productOnPurchaseOrder.steelSpecification.width.width}`;

        let qtyReceived =
          this.findQtyDeliveredForCoil(productOnPurchaseOrder) | 0;

        const item: TableData = {
          type,
          productOnPurchaseOrderId: productOnPurchaseOrder.id,
          uom: "KGS",
          qtyOrdered: productOnPurchaseOrder.weightOrdered,
          qtyReceived,
          status: productOnPurchaseOrder.status,
        };
        tableData.push(item);
      }
    );

    this.purchaseOrder.consumablesOnPurchaseOrders.forEach(
      (consumablesOnPurchaseOrders: ConsumablesOnPurchaseOrder) => {
        const type: string = `${consumablesOnPurchaseOrders.consumable.name}`;

        let qtyReceived =
          this.findQtyDeliveredForConsumable(consumablesOnPurchaseOrders) | 0;

        const item: TableData = {
          type,
          productOnPurchaseOrderId: consumablesOnPurchaseOrders.id,
          uom: consumablesOnPurchaseOrders.consumable.uom,
          qtyOrdered: consumablesOnPurchaseOrders.qty,
          qtyReceived,
          status: consumablesOnPurchaseOrders.status,
        };
        tableData.push(item);
      }
    );

    return tableData;
  }

  findQtyDeliveredForCoil(productOnPurchaseOrder) {
    let qtyReceived = 0;
    this.grvs.forEach((grv) => {
      let grvTotal = grv.steelCoils.reduce((acc, coil) => {
        if (
          coil.color.color ===
            productOnPurchaseOrder.steelSpecification.color.color &&
          coil.gauge.gauge ===
            productOnPurchaseOrder.steelSpecification.gauge.gauge &&
          coil.width.width ===
            productOnPurchaseOrder.steelSpecification.width.width
        ) {
          return acc + Number(coil.weightInKgsOnArrival);
        }
        return acc;
      }, 0);
      qtyReceived += grvTotal;
    });
    return qtyReceived;
  }

  findQtyDeliveredForConsumable(consumablesOnPurchaseOrders): number {
    let qtyReceived = 0;
    this.grvs.forEach((grv) => {
      let grvTotal = grv.consumablesOnGrv.reduce((acc, consumable) => {
        if (
          consumable.consumable.id === consumablesOnPurchaseOrders.consumable.id
        ) {
          return acc + Number(consumable.qtyOrdered);
        }
        return acc;
      }, 0);
      qtyReceived += grvTotal;
    });

    return qtyReceived;
  }

  menuItemClicked(newStatus: string, productOnPurchaseOrderId: number) {
    const productInTable = this.tableData.find(
      (item) => item.productOnPurchaseOrderId === productOnPurchaseOrderId
    );

    if (!productInTable) return;

    if (productInTable.type.includes("Color")) {
      this.changeCoilsStatus(newStatus, productOnPurchaseOrderId);
    } else {
      this.changeConsumablesStatus(newStatus, productOnPurchaseOrderId);
    }
  }

  changeCoilsStatus(newStatus: string, productOnPurchaseOrderId: number) {
    const productOnPurchaseOrder = this.purchaseOrder.productPurchases.find(
      (product) => product.id === productOnPurchaseOrderId
    );

    if (productOnPurchaseOrder.status === newStatus) return;
    else {
      this.productsOnPurchaseOrderService
        .changeProductStatus(newStatus, productOnPurchaseOrderId)
        .subscribe((res) => {
          console.log("res: ", res);
          productOnPurchaseOrder.status = newStatus;
        });

      const oldTableData = this.tableData;
      this.tableData = [];

      oldTableData.forEach((item) => {
        if (item.productOnPurchaseOrderId === productOnPurchaseOrderId) {
          item.status = newStatus;
        }
        this.tableData.push(item);
      });

      if (newStatus === "pending") {
        this.changePurchaseOrderStatus("pending");
      }
    }
  }

  changeConsumablesStatus(newStatus: string, productOnPurchaseOrderId: number) {
    const consumableOnPurchaseOrder =
      this.purchaseOrder.consumablesOnPurchaseOrders.find(
        (consumable) => consumable.id === productOnPurchaseOrderId
      );

    if (consumableOnPurchaseOrder.status === newStatus) return;
    else {
      this.consumablesOnPurchaseOrderService
        .changeConsumableOnPurchaseOrderStatus(
          newStatus,
          productOnPurchaseOrderId
        )
        .subscribe((res) => {
          console.log("res: ", res);
          consumableOnPurchaseOrder.status = newStatus;
        });

      const oldTableData = this.tableData;
      this.tableData = [];

      oldTableData.forEach((item) => {
        if (item.productOnPurchaseOrderId === productOnPurchaseOrderId) {
          item.status = newStatus;
        }
        this.tableData.push(item);
      });
      if (newStatus === "pending") {
        this.changePurchaseOrderStatus("pending");
      }
    }
  }

  checkProductsOnPurchaseOrdersStatus(): boolean {
    if (this.purchaseOrder.status === "completed") {
      return false;
    }

    let productsCheck = this.purchaseOrder.productPurchases.every(
      (product) => product.status.toLowerCase() !== "pending"
    );

    let consumablesCheck = this.purchaseOrder.consumablesOnPurchaseOrders.every(
      (consumable) => consumable.status.toLowerCase() !== "pending"
    );

    let result = productsCheck && consumablesCheck;

    return result;
  }

  changePurchaseOrderStatus(status: string) {
    this.purchaseOrderService
      .changePurchaseOrderStatus(this.purchaseOrder.id, status)
      .subscribe((po: PurchaseOrder) => {
        this.purchaseOrder = po;
      });
  }

  getButtonClass(status: string): string {
    switch (status.toLowerCase()) {
      case "pending":
        return "border-red-500 bg-red-500/[10%] text-red-500";
      case "completed":
        return "border-green-500 bg-green-500/[10%] text-green-500";
      // Add more cases as needed
      default:
        return "border-[#00C838] bg-[#00C838]/[10%] text-[#00C838]"; // Default style
    }
  }

  ngOnDestroy(): void {
    this.destroyer$.next(true);
    this.destroyer$.complete();
  }
}

interface TableData {
  type: string;
  productOnPurchaseOrderId: number;
  uom: string;
  qtyOrdered: number;
  qtyReceived: number;
  status: string;
}
