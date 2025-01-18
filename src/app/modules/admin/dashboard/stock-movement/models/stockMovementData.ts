export interface StockMovementData {
  coilNumber: string;
  cardNumber: string;
  meters: number | string; // If precision is critical, use string
  weight: number | string; // If precision is critical, use string
  landedCost: number | string; // If precision is critical, use string
  supplier: string;
  consignmentTransferDate: string | Date;
  grvDate: string | Date;
  grvId: number;
  interBranchTransferId: number;
  warehouse: string;
  cardNumberFrom: string;
  coilNumberTo: string;
}
