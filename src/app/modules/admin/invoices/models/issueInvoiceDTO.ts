export interface IssueInvoiceDTO {
  dateInvoiced: Date;
  saleOrderId: number;
  itemsToBeInvoiced: ItemsToBeInvoiced[];
}

export interface ItemsToBeInvoiced {
  id: number;
  type: string;
}
