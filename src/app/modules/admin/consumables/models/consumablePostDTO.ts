import { Consumable } from "./consumable";

export interface ConsumablePostDTO {
  // purchaseOrderId?: number;
  consumableOnPurchaseOrderId: number;
  consumableOnGrvId: number;
  consumableInWarehouseId: number;
  consumable: Consumable;
  qtyOrdered: number;
  landedPrice: number;
}
