export interface StocksDTO {
  productTypeId: number;
  color: string;
  width: number;
  coating: string;
  gauge: number;
  isqGrade: string;
  steelCoilId: number;
  coilNumber: string;
  cardNumber: string;
  meterRemaining: number;
  estMtrsOnArrival: number;
  weightOnArrival: string;
  costPerKg: number;
  status: string;
  warehouse: string;
  supplier: string;
  dateReceived: Date;
  purchaseOrderIssued: Date;
  consignor: string;
  // estMtrsRemaining:number;
}
