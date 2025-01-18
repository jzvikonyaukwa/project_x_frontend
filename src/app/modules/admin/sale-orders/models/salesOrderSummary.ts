export interface SaleOrderSummary {
  saleOrderId: number;
  status: string;
  doReserveStock: boolean;
  salesOrderCreated: Date;
  targetDate: Date;
  dateInvoiced: Date;
  paid: boolean;
  invoiceId: number;
  dateIssued: Date;
  dateLastModified: Date;
  clientName: string;
  cuttingListStatus: string;
  priority: string;
  planName: string;
  cuttingListSummary: CuttingListSummary[];
}

export interface CuttingListSummary {
  cuttingListId: number;
  status: string;
}
