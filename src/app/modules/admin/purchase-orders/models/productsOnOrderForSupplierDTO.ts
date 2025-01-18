// Might not be used any more
export interface ProductsOnOrderForSupplierDTO {
  purchaseOrderId: number;
  productOnPurchaseOrderId: number;
  finish: string;
  color: string;
  steelSpecificationId: number;
  width: number;
  coating: string;
  gauge: number;
  isqGrade: string;
  weightOrdered: number;
  weightDelivered: number;
  productStatus: string;
  purchaseCostPerKg: number;

  // Consumables
  productName: string;
  consumableOnPurchaseOrderId: number;
  qtyOrdered: number;
  costPerUnit: number;
  consumableId: number;
}
