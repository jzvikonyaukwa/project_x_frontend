export interface InvoiceChoices {
  id: number;
  type: string;
  service: string;
  qty: number;
  description: string;
  isInvoiced?: boolean;
}
