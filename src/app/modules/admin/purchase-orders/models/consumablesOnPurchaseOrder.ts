export interface ConsumablesOnPurchaseOrderDTO {
  purchaseOrderId: number;
  consumableOnPurchaseOrderId: number;
  productName: string;
  qtyOrdered: number;
  costPerUnit: number;
  consumableId: number;
  id?: number;
}
