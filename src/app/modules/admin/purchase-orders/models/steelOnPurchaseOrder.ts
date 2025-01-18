export interface SteelOnPurchaseOrder {
  id?: number;
  purchaseOrderId?: number;
  productOnPurchaseOrderId?: number;
  steelSpecificationId?: number;
  finish: string;
  color: string;
  width: number;
  coating: string;
  gauge: number;
  isqGrade: string;
  weightOrdered: number;
  weightDelivered: number;
  productStatus: string;
  purchaseCostPerKg: number;
}
