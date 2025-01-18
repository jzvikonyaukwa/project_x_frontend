export interface SalesOrderOverview {
  saleOrderId: number;
  // invoiceId: number;
  salesOrderIssued: Date;
  salesOrderStatus: string;
  clientName: string;
  reserveStock: boolean;
  targetDate: Date;
  completedCuttingList: number;
  inProgressCuttingLists: number;
}
