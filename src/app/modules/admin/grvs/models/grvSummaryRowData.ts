export interface GrvSummaryRowData {
  grvId: number;
  dateReceived: Date;
  warehouse: string;
  supplierName: string;
  grvComments: string;
  supplierGrvCode: string;
  purchaseOrderId: number;
  productInfo: ProductInfo[];
}

export interface ProductInfo {
  purchaseOrderId: number;
  productType: string;
  landedCostPerMtr: number;
  landedCostPerKg: number;
  name: string;
  qty: number;
  total: number;
}
