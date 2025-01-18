export interface ProductDelivered {
  purchaseOrderId: number;
  productOnPurchaseOrderId?: number;
  consumableOnPurchaseOrderId?: number;
  weightDelivered: number;
  grvId: number;
}
