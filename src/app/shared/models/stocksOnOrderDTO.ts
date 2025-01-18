export interface StocksOnOrderDTO {
  purchaseOrderStatus: number;
  steelSpecificationId: number;
  supplierId: number;
  supplierName: string;
  productStatus: string;
  isqGrade: number;
  dateOrdered: number;
  expectedDeliveryDate: number;
  weightOrdered: number;
  purchaseOrderId: number;
  finish: string;
  color: string;
  gauge: number;
  width: number;
  coating: string;
  productOnPurchaseOrderId: number;
  grvId: number;
}
